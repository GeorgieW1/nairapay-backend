import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Integration from "../models/Integration.js";
import fetch from "node-fetch";
import { sendTransactionNotification } from "../services/pushNotificationService.js";

/**
 * Verify Smartcard Number
 */
export const verifySmartcard = async (req, res) => {
    try {
        const { smartcardNumber, provider } = req.body;

        // Validation
        if (!smartcardNumber || !provider) {
            return res.status(400).json({
                success: false,
                error: "Smartcard number and provider are required",
            });
        }

        // Validate smartcard format (10-11 digits)
        const cleanSmartcard = String(smartcardNumber).replace(/\D/g, '');
        if (cleanSmartcard.length < 10 || cleanSmartcard.length > 11) {
            return res.status(400).json({
                success: false,
                error: "Smartcard number must be 10-11 digits",
            });
        }

        // Get VTpass integration
        const integration = await Integration.findOne({
            providerName: { $regex: /vtpass/i },
            category: "tv",
            mode: "live",
        });

        if (!integration) {
            return res.status(503).json({
                success: false,
                error: "TV service not configured",
            });
        }

        // Map provider to VTpass serviceID
        const serviceIDMap = {
            "DSTV": "dstv",
            "GOTV": "gotv",
            "STARTIMES": "startimes"
        };

        const serviceID = serviceIDMap[provider.toUpperCase()];
        if (!serviceID) {
            return res.status(400).json({
                success: false,
                error: "Invalid TV provider. Supported: DSTV, GOTV, STARTIMES",
            });
        }

        // Call VTpass merchant-verify endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${integration.baseUrl}/merchant-verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': integration.apiKey,
                'secret-key': integration.secretKey
            },
            body: JSON.stringify({
                billersCode: cleanSmartcard,
                serviceID: serviceID
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.code === '000' || data.content) {
            return res.json({
                success: true,
                data: {
                    customerName: data.content?.Customer_Name || "Unknown",
                    currentBouquet: data.content?.Current_Bouquet || "N/A",
                    dueDate: data.content?.Due_Date || null,
                    status: data.content?.Status || "Active"
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                error: data.response_description || "Invalid smartcard number",
            });
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: "Verification timeout. Please try again.",
            });
        }

        if (req.log) req.log.error({ err: error }, "Verify smartcard error");
        return res.status(500).json({
            success: false,
            error: "Failed to verify smartcard",
        });
    }
};

/**
 * Get TV Plans/Bouquets
 */
export const getTVPlans = async (req, res) => {
    try {
        const { provider } = req.params;

        if (!provider) {
            return res.status(400).json({
                success: false,
                error: "Provider is required",
            });
        }

        // Get VTpass integration
        const integration = await Integration.findOne({
            providerName: { $regex: /vtpass/i },
            category: "tv",
            mode: "live",
        });

        if (!integration) {
            return res.status(503).json({
                success: false,
                error: "TV service not configured",
            });
        }

        // Map provider to VTpass serviceID
        const serviceIDMap = {
            "DSTV": "dstv",
            "GOTV": "gotv",
            "STARTIMES": "startimes"
        };

        const serviceID = serviceIDMap[provider.toUpperCase()];
        if (!serviceID) {
            return res.status(400).json({
                success: false,
                error: "Invalid TV provider. Supported: DSTV, GOTV, STARTIMES",
            });
        }

        // Call VTpass service-variations endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${integration.baseUrl}/service-variations?serviceID=${serviceID}`, {
            method: 'GET',
            headers: {
                'api-key': integration.apiKey,
                'public-key': integration.publicKey
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
                provider: provider.toUpperCase(),
                plans
            });
        } else {
            return res.status(400).json({
                success: false,
                error: "Failed to fetch TV plans",
            });
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: "Request timeout. Please try again.",
            });
        }

        if (req.log) req.log.error({ err: error }, "Get TV plans error");
        return res.status(500).json({
            success: false,
            error: "Failed to fetch TV plans",
        });
    }
};

/**
 * Subscribe to TV Service
 */
export const subscribeTVService = async (req, res) => {
    try {
        const { smartcardNumber, provider, bouquetCode, amount, phone } = req.body;

        // 1. Input validation
        if (!smartcardNumber || !provider || !bouquetCode || !amount) {
            return res.status(400).json({
                success: false,
                error: "Smartcard number, provider, bouquet code, and amount are required",
            });
        }

        // 2. Amount validation
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: "Amount must be greater than 0",
            });
        }

        // 3. Smartcard validation (10-11 digits)
        const cleanSmartcard = String(smartcardNumber).replace(/\D/g, '');
        if (cleanSmartcard.length < 10 || cleanSmartcard.length > 11) {
            return res.status(400).json({
                success: false,
                error: "Smartcard number must be 10-11 digits",
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
        const integration = await Integration.findOne({
            providerName: { $regex: /vtpass/i },
            category: "tv",
            mode: "live",
        });

        if (!integration) {
            return res.status(503).json({
                success: false,
                error: "TV service not configured",
            });
        }

        // 6. Map provider to VTpass serviceID
        const serviceIDMap = {
            "DSTV": "dstv",
            "GOTV": "gotv",
            "STARTIMES": "startimes"
        };

        const serviceID = serviceIDMap[provider.toUpperCase()];
        if (!serviceID) {
            return res.status(400).json({
                success: false,
                error: "Invalid TV provider. Supported: DSTV, GOTV, STARTIMES",
            });
        }

        // 7. Create transaction record
        const balanceBefore = user.walletBalance;
        const transaction = await Transaction.create({
            userId: user._id,
            type: "tv",
            amount,
            status: "pending",
            description: `${provider.toUpperCase()} subscription - ${cleanSmartcard}`,
            balanceBefore,
            smartcardNumber: cleanSmartcard,
            tvProvider: provider.toUpperCase(),
            bouquet: bouquetCode,
            metadata: {
                phone: phone || user.phone || ""
            },
        });

        try {
            // 8. Prepare VTpass payload
            const requestId = `${user._id}_${Date.now()}`;
            const vtpassPayload = {
                request_id: requestId,
                serviceID: serviceID,
                billersCode: cleanSmartcard,
                variation_code: bouquetCode,
                amount: amount.toString(),
                phone: phone || user.phone || ""
            };

            // 9. Make API call to VTpass with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(`${integration.baseUrl}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': integration.apiKey,
                    'secret-key': integration.secretKey
                },
                body: JSON.stringify(vtpassPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            // 10. Handle VTpass response
            if (data.code === '000' || data.code === '021') {
                // Success
                user.walletBalance -= amount;
                await user.save();

                await Transaction.findByIdAndUpdate(transaction._id, {
                    status: "completed",
                    balanceAfter: user.walletBalance,
                    reference: data.transactionId || requestId,
                    metadata: {
                        ...transaction.metadata,
                        vtpassResponse: data
                    }
                });

                // Send push notification (async)
                sendTransactionNotification(user._id, 'tv', amount, 'completed')
                    .catch(err => console.error('Failed to send push notification:', err));

                return res.status(200).json({
                    success: true,
                    message: "TV subscription successful",
                    transaction: {
                        id: transaction._id,
                        amount,
                        smartcardNumber: cleanSmartcard,
                        provider: provider.toUpperCase(),
                        bouquet: bouquetCode,
                        date: new Date()
                    },
                    newBalance: user.walletBalance
                });
            } else {
                // VTpass returned an error
                await Transaction.findByIdAndUpdate(transaction._id, {
                    status: "failed",
                    error: data.response_description || "Subscription failed"
                });

                return res.status(400).json({
                    success: false,
                    error: data.response_description || "Failed to process TV subscription",
                    code: data.code
                });
            }
        } catch (error) {
            console.error('VTpass API Error:', error);

        await Transaction.findByIdAndUpdate(transaction._id, {
            status: "failed",
            error: error.message || "Failed to process subscription with VTpass"
        });

        // Handle timeout specifically
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: "Subscription service timeout. The TV provider is taking too long to respond. Please try again later."
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to process subscription. Please try again later."
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
