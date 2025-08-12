import { BACKEND_API_URL } from "@/flavours/apiConfig";
import axios from "axios";

export const login = async (username: string, password: string) => {
    const response = await axios.post(`${BACKEND_API_URL}/api/auth/login`, {
        username,
        password,
    });
    return response.data.access_token;
}

export const getProfile = async (token: string) => {
    const response = await axios.get(`${BACKEND_API_URL}/api/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}