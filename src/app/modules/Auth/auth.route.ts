


import express from "express";
import { UserController } from "./auth.controller";

const router = express.Router();

router.post("/create-user", UserController.createUser);
router.post("/login", UserController.loginUser);
router.post("/refresh-token", UserController.refreshToken); // ✅ এটা নতুন
router.post("/verify-otp", UserController.verifyLogin); // ✅ এটা নতুন

export const AuthRoutes = router;
