import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL + "/api",
    headers: { "Content-Type": "application/json" }
});

// simple in-memory access token
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
    accessToken = token;
}

// request interceptor add Authorization
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// response interceptor to handle 401 and try refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalConfig = err.config;
        if (err.response?.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            if (isRefreshing) {
                // queue requests
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalConfig.headers.Authorization = "Bearer " + token;
                        return axios(originalConfig);
                    })
                    .catch((err2) => Promise.reject(err2));
            }

            isRefreshing = true;
            const refreshToken = getCookie("refreshToken") as string | undefined;
            if (!refreshToken) {
                isRefreshing = false;
                processQueue(new Error("No refresh token"));
                return Promise.reject(err);
            }

            try {
                const resp = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
                const newAccess = resp.data.accessToken;
                const newRefresh = resp.data.refreshToken;
                if (newAccess) {
                    setAccessToken(newAccess);
                }
                if (newRefresh) {
                    setCookie("refreshToken", newRefresh, { path: "/" });
                }
                processQueue(null, newAccess);
                originalConfig.headers.Authorization = "Bearer " + newAccess;
                return axios(originalConfig);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                deleteCookie("refreshToken");
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    }
);

export default api;
