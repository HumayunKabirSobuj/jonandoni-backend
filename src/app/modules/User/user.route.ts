import express from "express";

import RoleValidation from "../../middlewares/RoleValidation";
import { UserDataController } from "./user.controller";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get(
  "/all-users",
  // RoleValidation(USER_ROLE.admin),
  UserDataController.getAllUsers
);
router.get(
  "/my-profile-info",
  RoleValidation(UserRole.admin, UserRole.customer, UserRole.shop_owner),
  UserDataController.myProfileInfo
);
router.patch(
  "/change-role/:id",
  // RoleValidation(USER_ROLE.admin),
  UserDataController.changeRole
);

router.patch(
  "/change-status/:id",
  // RoleValidation(USER_ROLE.admin),
  UserDataController.changeUserStatus
);
router.patch(
  "/update-profile",
  RoleValidation(UserRole.admin, UserRole.customer, UserRole.shop_owner),
  UserDataController.updateProfile
);

router.patch(
  "/change-password",
  // RoleValidation(USER_ROLE.admin, USER_ROLE.marchant),
  UserDataController.changePassword
);
router.delete(
  "/delete-user/:id",
  // RoleValidation(USER_ROLE.admin),
  UserDataController.deleteUser
);

export const UserRoutes = router;
