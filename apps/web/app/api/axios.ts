import axios from "axios";
import { env } from "@/config";
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AppError } from "./error";

export const axiosInstance = axios.create({
  baseURL: env.HTTP_BACKEND_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
export const refreshInstance = axios.create({
  baseURL: env.HTTP_BACKEND_URL,
  timeout: 8000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];
const subscribersCallback = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    console.log("00");
    return res;
  },
  async (error: AxiosError) => {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!error.response) {
      throw new AppError(
        "Network error.Please check internet connection.",
        "NETWORK_ERROR",
      );
    }

    console.log("1");
    const { status } = error.response;
    if (status === 401 && originalReq && !originalReq._retry) {
      if (originalReq.url?.includes("auth/refresh-token")) {
        return Promise.reject(
          new AppError("Session expired", "UNAUTHORIZED", 401),
        );
      }
      originalReq._retry = true;

      if (isRefreshing) {
        console.log("2");

        return new Promise((resolve, reject) => {
          refreshSubscribers.push(() => {
            resolve(axiosInstance(originalReq));
          });
        });
      }

      isRefreshing = true;
      try {
        console.log("Refreshing");
        //clg
        const res = await refreshInstance.post("api/auth/refresh-token");
        subscribersCallback();
        return axiosInstance(originalReq);
      } catch (err) {
        refreshSubscribers = [];
        //log the user out here
        return Promise.reject(
          new AppError(
            "Session expired. Please login again.",
            "UNAUTHORIZED",
            401,
          ),
        );
      } finally {
        isRefreshing = false;
      }
    }
    switch (status) {
      case 400:
        return Promise.reject(
          new AppError("Invalid request", "VALIDATION_ERROR", 400),
        );

      case 403:
        return Promise.reject(
          new AppError(
            "You do not have permission to perform this action.",
            "UNAUTHORIZED",
            403,
          ),
        );

      case 500:
        return Promise.reject(
          new AppError(
            "Server error. Please try again later.",
            "SERVER_ERROR",
            500,
          ),
        );

      default:
        return Promise.reject(
          new AppError("Unexpected error occurred.", "UNKNOWN_ERROR", status),
        );
    }
  },
);
