import { LoginData, RegisterData } from "@/types/auth.types";
import api from "./api";

export const loginUser = async (data: LoginData) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: RegisterData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};