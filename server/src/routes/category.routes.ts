import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  idParamSchema,
} from "../utils/schemas";
import { UserRole } from "../utils/user-role";

const router = Router();

router.use(authenticate);

router.get("/", listCategories);
router.get("/:id", validate(idParamSchema, "params"), getCategoryById);
router.post("/", authorize(UserRole.ADMIN), validate(categoryCreateSchema), createCategory);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(idParamSchema, "params"),
  validate(categoryUpdateSchema),
  updateCategory,
);
router.delete("/:id", authorize(UserRole.ADMIN), validate(idParamSchema, "params"), deleteCategory);

export default router;
