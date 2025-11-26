import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Integration from "../models/Integration.js";
import fetch from "node-fetch";
import crypto from "crypto";

// Simple encryption for storing PINs
const ENCRYPTION_KEY = process.env.EPIN_ENCRYPTION_KEY || "nairapay-epin-secret-key-change-in-production";
const ALGORITHM = 'aes-256-cbc';

function encryptPin(pin) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(pin, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptPin(encryptedPin) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const parts = encryptedPin.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Get E-pin Plans
 */
export const getEpinPlans = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({
                success: false,
                error: "Category is required",
            });
        }

        // Get VTpass integration for e-pins
        let integration = await Integration.findOne({
            providerName: { $regex: /vtpass/i },
            category: "epin",
            mode: "live",
        });

        // Fallback to any VTpass integration if epin not found
        if (!integration) {
            integration = await Integration.findOne({
                providerName: { $regex: /vtpass/i },
                mode: "live",
            });
        }

        if (!integration) {
            return res.status(503).json({
                success: false,
                error: "E-pin service not configured",
            });
        }

        // Map category to VTpass serviceID
        const serviceIDMap = {
            "WAEC": "waec-registration",
            "JAMB": "jamb",
            "NECO": "neco"
        };

        const serviceID = serviceIDMap[category.toUpperCase()];
        if (!serviceID) {
            return res.status(400).json({
                success: false,
                error: "Invalid E-pin category. Supported: WAEC, JAMB, NECO",
            });
        }

        // Get credentials
        const staticKeyCred = integration.credentials.find(c =>
            c.label && c.label.toLowerCase().includes("static"));
        const publicKeyCred = integration.credentials.find(c =>
            c.label && c.label.toLowerCase().includes("public"));

        const staticKey = staticKeyCred?.value;
        const publicKey = publicKeyCred?.value;

        if (!staticKey || !publicKey) {
            return res.status(503).json({
                success: false,
                error: "VTpass credentials not configured properly"
            });
        }

        // Call VTpass service-variations endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${integration.baseUrl}/service-variations?serviceID=${serviceID}`, {
            method: 'GET',
            headers: {
                'api-key': staticKey,
                'public-key': publicKey
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.content && data.content.varations) {
            const plans = data.content.varations.map(plan => ({
                code: plan.variation_code,
                name: plan.name,
                amount: parseFloat(plan.variation_amount),
                fixedPrice: plan.fixedPrice === "Yes"
            }));

            return res.json({
                success: true,
                category: category.toUpperCase(),
                plans
            });
        } else {
            return res.status(400).json({
                success: false,
                error: "Failed to fetch E-pin plans",
            });
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: "Request timeout. Please try again.",
            });
        }

        if (req.log) req.log.error({ err: error }, "Get E-pin plans error");
        return res.status(500).json({
            success: false,
            error: "Failed to fetch E-pin plans",
        });
    }
};

/**
 * Purchase E-pin
 */
export const purchaseEpin = async (req, res) => {
    try {
        const { category, quantity, amount, phone } = req.body;

        // 1. Input validation
        if (!category || !quantity || !amount) {
            return res.status(400).json({
                success: false,
                error: "Category, quantity, and amount are required",
            });
        }

        // 2. Quantity validation (1-10)
        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({
                success: false,
                error: "Quantity must be between 1 and 10",
            });
        }

        // 3. Amount validation
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: "Amount must be greater than 0",
            });
        }

        // 4. Get user and check balance
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (user.walletBalance < amount) {
            return res.status(400).json({
                success: false,
                error: "Insufficient wallet balance",
            });
        }

        // 5. Get VTpass integration
        let integration = await Integration.findOne({
            providerName: { $regex: /vtpass/i },
            category: "epin",
            mode: "live",
        });

        // Fallback to any VTpass integration
        if (!integration) {
            integration = await Integration.findOne({
                providerName: { $regex: /vtpass/i },
                mode: "live",
            });
        }

        if (!integration) {
            return res.status(503).json({
                success: false,
                error: "E-pin service not configured",
            });
        }

        // 6. Map category to VTpass serviceID
        const serviceIDMap = {
            "WAEC": "waec-registration",
            "JAMB": "jamb",
            "NECO": "neco"
        };

        const serviceID = serviceIDMap[category.toUpperCase()];
        if (!serviceID) {
            return res.status(400).json({
                success: false,
                error: "Invalid E-pin category. Supported: WAEC, JAMB, NECO",
            });
        }

        // 7. Create transaction record
        const balanceBefore = user.walletBalance;
        const transaction = await Transaction.create({
            userId: user._id,
            type: "epin",
            amount,
            status: "pending",
            description: `${category.toUpperCase()} E-pin purchase (${quantity} pin${quantity > 1 ? 's' : ''})`,
            balanceBefore,
            epinCategory: category.toUpperCase(),
            metadata: {
                quantity,
                phone: phone || user.phone || ""
            },
        });

        try {
            // 8. Get credentials
            const staticKeyCred = integration.credentials.find(c =>
                c.label && c.label.toLowerCase().includes("static"));
            const secretKeyCred = integration.credentials.find(c =>
                c.label && c.label.toLowerCase().includes("secret"));

            const staticKey = staticKeyCred?.value;
            const secretKey = secretKeyCred?.value;

            if (!staticKey || !secretKey) {
                transaction.status = "failed";
                transaction.metadata.error = "VTpass credentials missing";
                await transaction.save();

                return res.status(503).json({
                    success: false,
                    error: "VTpass credentials not configured properly"
                });
            }

            // 9. Prepare VTpass payload
            const requestId = `${user._id}_${Date.now()}`;
            const vtpassPayload = {
                request_id: requestId,
                serviceID: serviceID,
                quantity: quantity.toString(),
                amount: amount.toString(),
                phone: phone || user.phone || ""
            };

            // 10. Make API call to VTpass with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(`${integration.baseUrl}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': staticKey,
                    'secret-key': secretKey
                },
                body: JSON.stringify(vtpassPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            // 11. Handle VTpass response - check for success
            const isSuccess = data.code === "000" ||
                data.code === 0 ||
                (data.response_description &&
                    data.response_description.toLowerCase().includes("successful")) ||
                (data.content && data.content.transactions) ||
                data.status === "delivered";

            if (isSuccess) {
                // Success - extract and encrypt PINs
                let pins = [];

                // VTpass returns PINs in different formats depending on the service
                if (data.purchased_code) {
                    // Single PIN
                    pins.push(encryptPin(data.purchased_code));
                } else if (data.content && data.content.transactions) {
                    // Multiple PINs
                    const transactions = data.content.transactions;
                    if (Array.isArray(transactions)) {
                        pins = transactions.map(t => encryptPin(t.token || t.pin || t.code));
                    }
                } else if (data.cards && Array.isArray(data.cards)) {
                    // Some services return cards array
                    pins = data.cards.map(card => encryptPin(card.SerialNumber || card.Pin));
                }

                // Deduct wallet
                user.walletBalance -= amount;
                await user.save();

                // Update transaction
                await Transaction.findByIdAndUpdate(transaction._id, {
                    status: "completed",
                    balanceAfter: user.walletBalance,
                    reference: data.transactionId || requestId,
                    pins: pins,
                    metadata: {
                        ...transaction.metadata,
                        vtpassResponse: {
                            code: data.code,
                            transactionId: data.transactionId,
                            message: data.response_description
                        },
                        vtpassTransactionId: data.requestId || data.transactionId
                    }
                });

                // Decrypt PINs for response (don't store decrypted)
                const decryptedPins = pins.map(pin => decryptPin(pin));

                return res.status(200).json({
                    success: true,
                    message: "E-pin purchase successful",
                    transaction: {
                        id: transaction._id,
                        amount,
                        category: category.toUpperCase(),
                        quantity,
                        pins: decryptedPins,
                        date: new Date()
                    },
                    newBalance: user.walletBalance
                });
            } else {
                // VTpass returned an error
                await Transaction.findByIdAndUpdate(transaction._id, {
                    status: "failed",
                    error: data.response_description || "E-pin purchase failed"
                });

                return res.status(400).json({
                    success: false,
                    error: data.response_description || "Failed to purchase E-pin",
                    code: data.code
                });
            }
        } catch (error) {
            console.error('VTpass API Error:', error);

            await Transaction.findByIdAndUpdate(transaction._id, {
                status: "failed",
                error: error.message || "Failed to process E-pin purchase with VTpass"
            });

            // Handle timeout specifically
            if (error.name === 'AbortError') {
                return res.status(504).json({
                    success: false,
                    error: "E-pin service timeout. The service is taking too long to respond. Please try again later."
                });
            }

            return res.status(500).json({
                success: false,
                error: "Failed to process E-pin purchase. Please try again later."
            });
        }
    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({
            success: false,
            error: "An error occurred while processing your request"
        });
    }
};
