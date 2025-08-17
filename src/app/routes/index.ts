import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { UserRoutes } from "../modules/User/user.route";
import { CategoryRoutes } from "../modules/Category/category.route";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },


];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
