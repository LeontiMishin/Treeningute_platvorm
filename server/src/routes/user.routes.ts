import { Router } from "express";
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { idParamSchema, userUpdateSchema } from "../utils/schemas";
import { UserRole } from "../utils/user-role";

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/", listUsers);
router.get("/:id", validate(idParamSchema, "params"), getUserById);
router.patch("/:id", validate(idParamSchema, "params"), validate(userUpdateSchema), updateUser);
router.delete("/:id", validate(idParamSchema, "params"), deleteUser);

export default router;
