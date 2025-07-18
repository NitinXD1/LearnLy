import { axiosInstance } from "./axios.js";

export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
}

export const getAuthUser = async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
}
