import express from "express";
import { categoryController } from "./category.controller";
import RoleValidation from "../../middlewares/RoleValidation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", categoryController.getAllCategory);

router.post(
  "/create-category",
  RoleValidation(UserRole.admin),
  categoryController.addCategory
);

export const CategoryRoutes = router;
