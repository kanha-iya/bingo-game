import api from "./api"; // your axios instance

interface OrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  modal?: { ondismiss: () => void };
}

// Extend Window to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

/**
 * Step 1: Create a Razorpay order on the backend
 */
const createOrder = async (): Promise<OrderResponse> => {
  const { data } = await api.post<OrderResponse>("/subscription/create-order");
  return data;
};

/**
 * Step 2: Verify payment signature on the backend
 */
const verifyPayment = async (payload: VerifyPaymentPayload): Promise<void> => {
  const { data } = await api.post("/subscription/verify-payment", payload);
  if (!data.success) throw new Error(data.message || "Verification failed");
};

/**
 * Loads the Razorpay checkout script dynamically (only once)
 */
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Main exported function — orchestrates the full Razorpay payment flow:
 * 1. Load Razorpay script
 * 2. Create backend order
 * 3. Open Razorpay checkout popup
 * 4. Verify payment on backend
 */
export const createSubscription = async (prefill?: {
  name?: string;
  email?: string;
  contact?: string;
}): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    throw new Error("Failed to load Razorpay. Check your internet connection.");
  }

  const order = await createOrder();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Bingo Pro",
      description: "Pro Plan — ₹99/month",
      order_id: order.orderId,
      prefill: prefill ?? {},
      theme: { color: "#000000" },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user")),
      },
      handler: async (response: RazorpayResponse) => {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      },
    });

    rzp.on("payment.failed", (response: { error: { description: string } }) => {
      reject(new Error(response.error.description || "Payment failed"));
    });

    rzp.open();
  });
};