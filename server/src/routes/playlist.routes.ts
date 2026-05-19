import { Router } from "express";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  listPlaylists,
  updatePlaylist,
} from "../controllers/playlist.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  idParamSchema,
  playlistCreateSchema,
  playlistUpdateSchema,
} from "../utils/schemas";

const router = Router();

router.use(authenticate);

router.get("/", listPlaylists);
router.get("/:id", validate(idParamSchema, "params"), getPlaylistById);
router.post("/", validate(playlistCreateSchema), createPlaylist);
router.patch("/:id", validate(idParamSchema, "params"), validate(playlistUpdateSchema), updatePlaylist);
router.delete("/:id", validate(idParamSchema, "params"), deletePlaylist);

export default router;

