import express, { Router } from "express";
import { fetchMermaidSyntax } from "../controllers";
import { checkAuth, validate } from "../middlewares";
const aiRouter: Router = express.Router();

aiRouter.post("/query", checkAuth, fetchMermaidSyntax);

export default aiRouter;
