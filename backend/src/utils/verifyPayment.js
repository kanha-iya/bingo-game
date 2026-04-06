import crypto from "crypto";

/**
 * Verifies Razorpay payment signature
 * @param orderId - Razorpay order_id
 * @param paymentId - Razorpay payment_id from frontend
 * @param signature - Razorpay signature from frontend
 * @returns boolean
 */
export const verifyPaymentSignature = (
  orderId,
  paymentId,
  signature
)=> {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};