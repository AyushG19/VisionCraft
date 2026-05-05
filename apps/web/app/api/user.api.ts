import { UserType } from "@repo/common";
import { axiosInstance } from "./axios";

export async function fetchUserInfoApi(userId: string): Promise<UserType> {
  const res = await axiosInstance.post("/api/user/get-user", { userId });
  return res.data;
}

export async function fetchProfileApi(): Promise<UserType> {
  const res = await axiosInstance.get("/api/user/profile");
  return res.data;
}
