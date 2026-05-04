import { UserType } from "@repo/common";
import env from "../env";
import { Response, Request } from "express";
import { acTokenExpiry, authConfig, rfTokenExpiry } from "../config";
import { accessJwtService, refreshJwtService } from "../utils/jwtInstance";

const sendAuth201Res = (res: Response, user: UserType) => {
  res.redirect(`${env.FRONTEND_URL}/canvas`);
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
};

export const handleProviderCallback = async (req: Request, res: Response) => {
  if (!req.user) return;
  sendAuth201Res(res, { userId: req.user.userId!, name: req.user.name! });
};
