import { Request, Response } from "express";
import { createUser, findUserByEmail } from "@repo/db";
import bcrypt from "bcrypt";
import { acTokenExpiry, authConfig, rfTokenExpiry } from "../config/index";
import { AppError } from "../error";
import { accessJwtService, refreshJwtService } from "../utils/jwtInstance";
import { JwtPayloadType } from "@repo/common";

export const signup = async (req: Request, res: Response) => {
  try {
    console.log("hasing");
    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const data = {
      email: req.body.email,
      name: req.body.name,
      password: hashedPass,
      confirmPassword: hashedPass,
    };
    const user = await createUser(data);
    if (!user) throw new AppError(409, "[warn] User Already exists!");

    console.log("user generated");
    res
      .status(201)
      .cookie(
        "refreshToken",
        refreshJwtService.sign({ userId: user.userId }, rfTokenExpiry),
        authConfig.refreshCookies,
      )
      .cookie(
        "accessToken",
        accessJwtService.sign({ userId: user.userId }, acTokenExpiry),
        authConfig.accessCookies,
      )
      .json(user);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    //@ts-ignore
    throw new AppError(500, error.message ? error.message : "Controller error");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await findUserByEmail(req.body.email);

    console.log("in login");

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new AppError(401, "password did not match / User not registered");
    }
    res
      .status(201)
      .cookie(
        "refreshToken",
        refreshJwtService.sign({ userId: user.userId }, rfTokenExpiry),
        authConfig.refreshCookies,
      )
      .cookie(
        "accessToken",
        accessJwtService.sign({ userId: user.userId }, acTokenExpiry),
        authConfig.accessCookies,
      )
      .json({
        userId: user.userId,
        name: user.name,
      });
  } catch (error) {
    console.log(error);
    throw new AppError(500, "Some internal error while loggin in!");
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    console.log("now");
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new AppError(401, "No Refresh token found!");
    }
    console.log("here");
    const jwtRes = accessJwtService.verify<JwtPayloadType>(refreshToken);
    res
      .status(201)
      .cookie(
        "refreshToken",
        refreshJwtService.sign({ userId: jwtRes.userId! }, rfTokenExpiry),
        authConfig.refreshCookies,
      )
      .cookie(
        "accessToken",
        accessJwtService.sign({ userId: jwtRes.userId! }, acTokenExpiry),
        authConfig.accessCookies,
      )
      .json({
        message: "Token refresh Sucessful",
      });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "Internal server error");
  }
};

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json("Logout sucessful");
}
