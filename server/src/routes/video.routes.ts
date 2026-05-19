import { Router } from "express";
import {
  createVideo,
  deleteVideo,
  getVideoById,
  listVideos,
  updateVideo,
} from "../controllers/video.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  idParamSchema,
  videoCreateSchema,
  videoQuerySchema,
  videoUpdateSchema,
} from "../utils/schemas";
import { UserRole } from "../utils/user-role";

const router = Router();

router.use(authenticate);

router.get("/", validate(videoQuerySchema, "query"), listVideos);
router.get("/:id", validate(idParamSchema, "params"), getVideoById);
router.post("/", authorize(UserRole.ADMIN), validate(videoCreateSchema), createVideo);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(idParamSchema, "params"),
  validate(videoUpdateSchema),
  updateVideo,
);
router.delete("/:id", authorize(UserRole.ADMIN), validate(idParamSchema, "params"), deleteVideo);

export default router;
