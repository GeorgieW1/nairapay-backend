import Paystack from "paystack";

// Initialize Paystack with secret key from environment
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

/**
 * Initialize a Paystack payment
 * @param {Object} paymentData - Payment data
 * @param {Number} paymentData.amount - Amount in kobo (Naira * 100)
 * @param {String} paymentData.email - Customer email
 * @param {String} paymentData.reference - Unique transaction reference
 * @param {String} paymentData.metadata - Additional metadata
 * @returns {Promise<Object>} Paystack response
 */
export const initializePayment = async ({ amount, email, reference, metadata = {} }) => {
  try {
    const response = await paystack.transaction.initialize({
      amount: amount * 100, // Convert Naira to kobo
      email,
      reference,
      metadata,
      callback_url: process.env.PAYSTACK_CALLBACK_URL || `${process.env.BASE_URL || "http://localhost:5000"}/api/wallet/paystack/callback`,
    });

    return {
      success: true,
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      reference: response.data.reference,
    };
  } catch (error) {
    console.error("Paystack initialization error:", error);
    throw new Error(error.message || "Failed to initialize payment");
  }
};

/**
 * Verify a Paystack payment
 * @param {String} reference - Transaction reference
 * @returns {Promise<Object>} Payment verification response
 */
export const verifyPayment = async (reference) => {
  try {
    const response = await paystack.transaction.verify(reference);

    if (response.status && response.data.status === "success") {
      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount / 100, // Convert kobo to Naira
        currency: response.data.currency,
        reference: response.data.reference,
        customer: response.data.customer,
        metadata: response.data.metadata,
        paidAt: response.data.paid_at,
      };
    }

    return {
      success: false,
      status: response.data.status,
      message: response.data.gateway_response || "Payment not successful",
    };
  } catch (error) {
    console.error("Paystack verification error:", error);
    throw new Error(error.message || "Failed to verify payment");
  }
};

/**
 * Verify webhook signature
 * @param {String} signature - Paystack signature from header
 * @param {Object|String|Buffer} body - Request body (object, string, or Buffer)
 * @returns {Boolean} - True if signature is valid
 */
export const verifyWebhookSignature = (signature, body) => {
  const crypto = require("crypto");
  let bodyString;
  
  if (Buffer.isBuffer(body)) {
    bodyString = body.toString();
  } else if (typeof body === "string") {
    bodyString = body;
  } else {
    bodyString = JSON.stringify(body);
  }
  
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(bodyString)
    .digest("hex");

  return hash === signature;
};

