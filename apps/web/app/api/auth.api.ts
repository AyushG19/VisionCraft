import { LoginFormType, SignupFormType, UserType } from "@repo/common";
import { axiosInstance } from "./axios";

//no try cathc here

export async function loginApi(loginData: LoginFormType): Promise<UserType> {
  const res = await axiosInstance.post("/api/auth/login", loginData);
  return res.data;
}

export async function signupApi(signupData: SignupFormType): Promise<UserType> {
  const res = await axiosInstance.post("/api/auth/signup", signupData);
  return res.data;
}

export async function logoutApi(): Promise<void> {
  const res = await axiosInstance.post("/api/auth/logout");
}
