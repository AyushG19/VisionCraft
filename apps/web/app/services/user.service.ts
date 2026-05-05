import { AppError } from "@/api/error";
import { fetchUserInfoApi, fetchProfileApi } from "@/api/user.api";
import { User, UserType } from "@repo/common";

export async function getUserInfo(userId: string) {
  return await fetchUserInfoApi(userId);
}

export const getProfile = async (): Promise<UserType> => {
  const data = await fetchProfileApi();
  const parsedData = User.safeParse(data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new AppError("Invalid Response from server", "SERVER_ERROR");
  }
  return parsedData.data;
};
