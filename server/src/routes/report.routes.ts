import { Router } from "express";
import {
  getAdminContentQuality,
  getAdminRevenueSummary,
  getMemberAccessOverview,
  getMemberProgressSnapshot,
  getTrainerProgramOverview,
  getTrainerVideoCatalog,
  markWorkoutCompleted,
} from "../controllers/report.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { workoutCompletionCreateSchema } from "../utils/schemas";
import { UserRole } from "../utils/user-role";

const router = Router();

router.use(authenticate);

router.get("/member/access", getMemberAccessOverview);
router.get("/member/progress", getMemberProgressSnapshot);
router.post("/member/completions", validate(workoutCompletionCreateSchema), markWorkoutCompleted);
router.get("/trainer/programs", getTrainerProgramOverview);
router.get("/trainer/videos", getTrainerVideoCatalog);
router.get("/admin/revenue", authorize(UserRole.ADMIN), getAdminRevenueSummary);
router.get("/admin/content-quality", authorize(UserRole.ADMIN), getAdminContentQuality);

export default router;
