import { Router } from "express";
import { createOrder, verifyPayment } from "./subscription.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = Router();

// POST /api/subscription/create-order
router.post("/create-order", verifyToken, createOrder);

// POST /api/subscription/verify-payment
router.post("/verify-payment", verifyToken, verifyPayment);

export default router;