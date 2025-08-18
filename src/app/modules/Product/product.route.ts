import express from "express";

import RoleValidation from "../../middlewares/RoleValidation";
import { UserRole } from "@prisma/client";
import { ProductController } from "./product.controller";
const router = express.Router();

router.post(
  "/add-product",
  RoleValidation(UserRole.shop_owner),
  ProductController.AddProduct
);

export const ProductRoutes = router;
