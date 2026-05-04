import express, { Router } from "express";
import { signup, login, refreshToken, logout } from "../controllers";
import { validate } from "../middlewares";
import { CreateUserSchema, LoginSchema } from "@repo/common";
import passport from "passport";
import { handleProviderCallback } from "../controllers/provider.controller";
import env from "../env";

const authRouter: Router = express.Router();

authRouter.post("/signup", validate(CreateUserSchema), signup);
authRouter.post("/login", validate(LoginSchema), login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: env.FRONTEND_URL,
  }),
  handleProviderCallback,
);
authRouter.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user", "user:email"],
    session: false,
  }),
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: env.FRONTEND_URL,
  }),
  handleProviderCallback,
);
export default authRouter;
