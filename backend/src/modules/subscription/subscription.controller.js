import getRazorpayInstance from "../../utils/rozarpay.js";
import { verifyPaymentSignature } from "../../utils/verifyPayment.js";
import userModel from "../user/user.model.js";


const SUBSCRIPTION_AMOUNT = 9900; // ₹99 in paise
const CURRENCY = "INR";

/**
 * POST /api/subscription/create-order
 * Creates a Razorpay order for the subscription
 */
export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: SUBSCRIPTION_AMOUNT,
      currency: CURRENCY,
      receipt: `receipt_${(req ).user._id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        plan: "pro_monthly",
      },
    };

    const order = await getRazorpayInstance().orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_API_KEY,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

/**
 * POST /api/subscription/verify-payment
 * Verifies Razorpay payment signature and activates subscription
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
      return;
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: "Payment verification failed — invalid signature",
      });
      return;
    }

    // Activate subscription on the user
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);

    await userModel.findByIdAndUpdate((req ).user._id, {
      isSubscribed: true,
      subscriptionExpiry,
      lastPaymentId: razorpay_payment_id,
      lastOrderId: razorpay_order_id,
    });

    res.status(200).json({
      success: true,
      message: "Subscription activated successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Razorpay verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};