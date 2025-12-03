import api from "@/lib/axios";

export const userService = {
    getMe: () => api.get("/users/me"),
    updateProfile: (body: any) => api.put("/users/me", body),
};
