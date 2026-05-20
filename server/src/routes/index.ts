import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import packageRoutes from "./package.routes";
import playlistRoutes from "./playlist.routes";
import reportRoutes from "./report.routes";
import subscriptionRoutes from "./subscription.routes";
import trainerRoutes from "./trainer.routes";
import userRoutes from "./user.routes";
import videoRoutes from "./video.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/trainers", trainerRoutes);
router.use("/videos", videoRoutes);
router.use("/packages", packageRoutes);
router.use("/playlists", playlistRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/reports", reportRoutes);

export default router;
