import Razorpay from "razorpay";

let instance ;

const getRazorpayInstance = () => {
  if (!instance) {
    const key_id = process.env.RAZORPAY_API_KEY;
    const key_secret = process.env.RAZORPAY_API_SECRET;

    if (!key_id || !key_secret) {
      throw new Error(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables"
      );
    }

    instance = new Razorpay({ key_id, key_secret });
  }

  return instance;
};

export default getRazorpayInstance;