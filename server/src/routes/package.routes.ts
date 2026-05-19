import { Router } from "express";
import {
  createPackage,
  deletePackage,
  getPackageById,
  listPackages,
  updatePackage,
} from "../controllers/package.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  idParamSchema,
  subscriptionPackageCreateSchema,
  subscriptionPackageUpdateSchema,
} from "../utils/schemas";
import { UserRole } from "../utils/user-role";

const router = Router();

router.use(authenticate);

router.get("/", listPackages);
router.get("/:id", validate(idParamSchema, "params"), getPackageById);
router.post("/", authorize(UserRole.ADMIN), validate(subscriptionPackageCreateSchema), createPackage);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(idParamSchema, "params"),
  validate(subscriptionPackageUpdateSchema),
  updatePackage,
);
router.delete("/:id", authorize(UserRole.ADMIN), validate(idParamSchema, "params"), deletePackage);

export default router;
