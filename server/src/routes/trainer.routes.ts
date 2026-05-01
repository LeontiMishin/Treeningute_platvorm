import { Router } from "express";
import {
  createTrainer,
  deleteTrainer,
  getTrainerById,
  listTrainers,
  updateTrainer,
} from "../controllers/trainer.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  idParamSchema,
  trainerCreateSchema,
  trainerUpdateSchema,
} from "../utils/schemas";
import { UserRole } from "../utils/user-role";

const router = Router();

router.use(authenticate);

router.get("/", listTrainers);
router.get("/:id", validate(idParamSchema, "params"), getTrainerById);
router.post("/", authorize(UserRole.ADMIN), validate(trainerCreateSchema), createTrainer);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(idParamSchema, "params"),
  validate(trainerUpdateSchema),
  updateTrainer,
);
router.delete("/:id", authorize(UserRole.ADMIN), validate(idParamSchema, "params"), deleteTrainer);

export default router;
