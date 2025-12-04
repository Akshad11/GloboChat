import { useAuth as useCtxAuth } from "../context/AuthContext";

export function useAuth() {
    return useCtxAuth();
}
