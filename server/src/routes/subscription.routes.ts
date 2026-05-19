import { Router } from "express";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  listSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  idParamSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} from "../utils/schemas";

const router = Router();

router.use(authenticate);

router.get("/", listSubscriptions);
router.get("/:id", validate(idParamSchema, "params"), getSubscriptionById);
router.post("/", validate(subscriptionCreateSchema), createSubscription);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(subscriptionUpdateSchema),
  updateSubscription,
);
router.delete("/:id", validate(idParamSchema, "params"), deleteSubscription);

export default router;

