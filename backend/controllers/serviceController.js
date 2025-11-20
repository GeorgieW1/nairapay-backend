import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import ApiKey from "../models/ApiKey.js";
import Integration from "../models/Integration.js";
import fetch from "node-fetch";

/**
 * Buy Airtime
 */
export const buyAirtime = async (req, res) => {
  try {
    const { phone, network, amount } = req.body;

    // Validation
    if (!phone || !network || !amount) {
      return res.status(400).json({
        success: false,
        error: "Phone, network, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Validate phone number format (Nigerian: 11 digits, starts with 0)
    const phoneStr = String(phone).replace(/\D/g, ''); // Remove non-digits
    if (phoneStr.length !== 11 || !phoneStr.startsWith('0')) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number. Must be 11 digits starting with 0 (e.g., 08111111111)",
      });
    }

    // Get user and check balance
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

    // Get VTpass integration (prioritize live mode for production)
    let integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "airtime",
      mode: "live",
    });

    // Fallback to sandbox if live not found (for testing)
    if (!integration) {
      integration = await Integration.findOne({
        providerName: { $regex: /vtpass/i },
        category: "airtime",
        mode: "sandbox",
      });
    }

    if (!integration) {
      return res.status(503).json({
        success: false,
        error: "Airtime service not configured",
      });
    }

    // Create pending transaction
    const balanceBefore = user.walletBalance;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "airtime",
      amount,
      status: "pending",
      description: `Airtime purchase - ${network} ${phone}`,
      balanceBefore,
      metadata: {
        phone,
        network,
        provider: integration.providerName,
      },
    });

    try {
      // Map network to VTpass service ID
      const serviceIDMap = {
        "MTN": "mtn",
        "Airtel": "airtel",
        "Glo": "glo",
        "9mobile": "9mobile"
      };
      
      const serviceID = serviceIDMap[network] || network.toLowerCase();
      const requestId = `${user._id}_${Date.now()}`;

      // Call VTpass API
      const vtpassPayload = {
        request_id: requestId,
        serviceID: serviceID,
        amount: amount.toString(),
        phone: phone
      };

      // Get credentials for POST request
      // VTPass POST requests use: api-key (static) + secret-key (SK_)
      const staticKeyCred = integration.credentials.find(c => 
        c.label && c.label.toLowerCase().includes("static"));
      const secretKeyCred = integration.credentials.find(c => 
        c.label && c.label.toLowerCase().includes("secret"));
      
      const staticKey = staticKeyCred?.value;
      const secretKey = secretKeyCred?.value;

      // Debug: Log available credential labels (without values)
      const availableLabels = integration.credentials.map(c => c.label).filter(Boolean);
      if (!staticKey || !secretKey) {
        transaction.status = "failed";
        transaction.metadata.error = "VTpass credentials missing";
        transaction.metadata.debug = {
          availableLabels,
          foundStaticKey: !!staticKey,
          foundSecretKey: !!secretKey,
          integrationMode: integration.mode
        };
        await transaction.save();
        
        return res.status(503).json({
          success: false,
          error: "VTpass credentials not configured properly",
          details: "Missing Static Key or Secret Key. VTPass requires: Static Key, Public Key (PK_), Secret Key (SK_)",
          debug: {
            availableLabels,
            mode: integration.mode
          }
        });
      }

      const vtpassResponse = await fetch(`${integration.baseUrl}/pay`, {
        method: "POST",
        headers: {
          "api-key": staticKey,
          "secret-key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vtpassPayload),
      });

      const vtpassData = await vtpassResponse.json();

      // Log VTpass response for debugging (without sensitive data)
      if (req.log) {
        req.log.info({
          vtpassCode: vtpassData.code,
          vtpassStatus: vtpassData.status,
          vtpassDescription: vtpassData.response_description,
          requestId: vtpassPayload.request_id,
          network: network,
          amount: amount
        }, "VTpass airtime API response received");
      }

      // Check for VTpass errors
      if (vtpassData.response_description && vtpassData.response_description.includes("INVALID CREDENTIALS")) {
        transaction.status = "failed";
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.error = "VTpass credentials are invalid";
        transaction.metadata.debug = {
          integrationMode: integration.mode,
          baseUrl: integration.baseUrl,
          availableLabels: integration.credentials.map(c => c.label).filter(Boolean),
        };
        await transaction.save();

        return res.status(400).json({
          success: false,
          error: "Failed to process airtime purchase",
          vtpassError: "INVALID CREDENTIALS",
          message: "VTpass credentials are invalid. Please verify your API Key and Secret Key are correct and match your VTpass account mode (live/sandbox).",
          debug: {
            mode: integration.mode,
            suggestion: integration.mode === "sandbox" 
              ? "Ensure you're using sandbox credentials. Switch to live mode with live credentials for production."
              : "Ensure you're using live/production credentials from your VTpass dashboard."
          }
        });
      }

      // Check if VTpass purchase was successful
      // VTpass success indicators: code === "000" or response_description contains "successful"
      const isSuccess = vtpassData.code === "000" || 
                       vtpassData.code === 0 ||
                       (vtpassData.response_description && 
                        vtpassData.response_description.toLowerCase().includes("successful")) ||
                       (vtpassData.content && vtpassData.content.transactions) ||
                       vtpassData.status === "delivered";

      if (isSuccess) {
        // If successful, deduct from wallet
        user.walletBalance = balanceBefore - amount;
        await user.save();

        // Update transaction
        transaction.status = "completed";
        transaction.balanceAfter = user.walletBalance;
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.vtpassTransactionId = vtpassData.requestId || vtpassData.transactionId;
        await transaction.save();

        res.json({
          success: true,
          message: "Airtime purchased successfully",
          transaction: {
            _id: transaction._id,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            phone,
            network,
          },
          newBalance: user.walletBalance,
        });
      } else {
        // VTpass purchase failed
        transaction.status = "failed";
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.error = vtpassData.response_description || vtpassData.message || "VTpass purchase failed";
        await transaction.save();

        res.status(400).json({
          success: false,
          error: "Failed to process airtime purchase",
          vtpassError: vtpassData.response_description || vtpassData.message || "Unknown VTpass error",
          debug: {
            vtpassCode: vtpassData.code,
            vtpassStatus: vtpassData.status,
            vtpassDescription: vtpassData.response_description
          }
        });
      }
    } catch (serviceError) {
      // If service call fails, mark transaction as failed
      transaction.status = "failed";
      transaction.metadata.error = serviceError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        error: "Failed to process airtime purchase",
        details: serviceError.message,
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Buy airtime error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get Data Plans (Variations) from VTPass
 */
export const getDataPlans = async (req, res) => {
  try {
    let { network } = req.query;
    
    if (!network) {
      return res.status(400).json({
        success: false,
        error: "Network is required (mtn, airtel, glo, 9mobile)"
      });
    }

    // Normalize network name to title case (accept both "mtn" and "MTN")
    network = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
    
    // Get VTpass integration (prioritize live mode for production)
    let integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "data",
      mode: "live"
    });

    // Fallback to sandbox if live not found (for testing)
    if (!integration) {
      integration = await Integration.findOne({
        providerName: { $regex: /vtpass/i },
        category: "data",
        mode: "sandbox"
      });
    }

    if (!integration) {
      return res.status(503).json({
        success: false,
        error: "Data service not configured"
      });
    }

    // Map network to VTpass service ID
    const serviceIDMap = {
      "Mtn": "mtn-data",
      "Airtel": "airtel-data",
      "Glo": "glo-data",
      "9mobile": "etisalat-data"
    };
    
    const serviceID = serviceIDMap[network];
    if (!serviceID) {
      return res.status(400).json({
        success: false,
        error: "Invalid network. Use: mtn, airtel, glo, or 9mobile"
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
        error: "VTpass credentials not configured"
      });
    }

    // Fetch variations from VTPass
    const response = await fetch(
      `${integration.baseUrl}/service-variations?serviceID=${serviceID}`,
      {
        method: "GET",
        headers: {
          "api-key": staticKey,
          "public-key": publicKey
        }
      }
    );

    const data = await response.json();

    if (data.response_description === "000" || data.content?.varations) {
      res.json({
        success: true,
        network,
        plans: data.content.varations || []
      });
    } else {
      res.status(400).json({
        success: false,
        error: data.response_description || "Failed to fetch data plans"
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Buy Data
 */
export const buyData = async (req, res) => {
  try {
    const { phone, network, dataPlan, amount, variation_code, variationCode } = req.body;
    
    // Accept both variation_code (snake_case) and variationCode (camelCase) from frontend
    const variationCodeValue = variation_code || variationCode;

    if (!phone || !network || !amount || !variationCodeValue) {
      return res.status(400).json({
        success: false,
        error: "Phone, network, amount, and variationCode are required. Call /api/data/plans?network=mtn first to get variation codes.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Validate phone number format (Nigerian: 11 digits, starts with 0)
    const phoneStr = String(phone).replace(/\D/g, ''); // Remove non-digits
    if (phoneStr.length !== 11 || !phoneStr.startsWith('0')) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number. Must be 11 digits starting with 0 (e.g., 08111111111)",
      });
    }

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

    // Get VTpass integration for data (prioritize live mode for production)
    let integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "data",
      mode: "live",
    });

    // Fallback to sandbox if live not found (for testing)
    if (!integration) {
      integration = await Integration.findOne({
        providerName: { $regex: /vtpass/i },
        category: "data",
        mode: "sandbox",
      });
    }

    if (!integration) {
      return res.status(503).json({
        success: false,
        error: "Data service not configured",
      });
    }

    const balanceBefore = user.walletBalance;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "data",
      amount,
      status: "pending",
      description: `Data purchase - ${network} ${dataPlan} for ${phone}`,
      balanceBefore,
      metadata: {
        phone,
        network,
        dataPlan,
      },
    });

    try {
      // Normalize network name to title case (accept both "airtel" and "AIRTEL")
      const normalizedNetwork = network.charAt(0).toUpperCase() + network.slice(1).toLowerCase();
      
      // Call VTpass API for data
      const serviceIDMap = {
        "Mtn": "mtn-data",
        "Airtel": "airtel-data",
        "Glo": "glo-data",
        "9mobile": "9mobile-data"
      };
      
      const serviceID = serviceIDMap[normalizedNetwork] || `${network.toLowerCase()}-data`;
      const requestId = `${user._id}_${Date.now()}`;

      const vtpassPayload = {
        request_id: requestId,
        serviceID: serviceID,
        billersCode: phone,
        variation_code: variationCodeValue, // Use exact code from VTPass API
        amount: amount.toString(),
        phone: phone
      };

      // Get credentials for POST request
      // VTPass POST requests use: api-key (static) + secret-key (SK_)
      const staticKeyCred = integration.credentials.find(c => 
        c.label && c.label.toLowerCase().includes("static"));
      const secretKeyCred = integration.credentials.find(c => 
        c.label && c.label.toLowerCase().includes("secret"));
      
      const staticKey = staticKeyCred?.value;
      const secretKey = secretKeyCred?.value;

      // Debug: Log available credential labels (without values)
      const availableLabels = integration.credentials.map(c => c.label).filter(Boolean);
      if (!staticKey || !secretKey) {
        transaction.status = "failed";
        transaction.metadata.error = "VTpass credentials missing";
        transaction.metadata.debug = {
          availableLabels,
          foundStaticKey: !!staticKey,
          foundSecretKey: !!secretKey,
          integrationMode: integration.mode
        };
        await transaction.save();
        
        return res.status(503).json({
          success: false,
          error: "VTpass credentials not configured properly",
          details: "Missing Static Key or Secret Key. VTPass requires: Static Key, Public Key (PK_), Secret Key (SK_)",
          debug: {
            availableLabels,
            mode: integration.mode
          }
        });
      }

      const vtpassResponse = await fetch(`${integration.baseUrl}/pay`, {
        method: "POST",
        headers: {
          "api-key": staticKey,
          "secret-key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vtpassPayload),
      });

      const vtpassData = await vtpassResponse.json();

      // Check for VTpass errors
      if (vtpassData.response_description && vtpassData.response_description.includes("INVALID CREDENTIALS")) {
        transaction.status = "failed";
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.error = "VTpass credentials are invalid";
        transaction.metadata.debug = {
          integrationMode: integration.mode,
          baseUrl: integration.baseUrl,
          availableLabels: integration.credentials.map(c => c.label).filter(Boolean),
        };
        await transaction.save();

        return res.status(400).json({
          success: false,
          error: "Failed to process data purchase",
          vtpassError: "INVALID CREDENTIALS",
          message: "VTpass credentials are invalid. Please verify your API Key and Secret Key are correct and match your VTpass account mode (live/sandbox).",
          debug: {
            mode: integration.mode,
            suggestion: integration.mode === "sandbox" 
              ? "Ensure you're using sandbox credentials. Switch to live mode with live credentials for production."
              : "Ensure you're using live/production credentials from your VTpass dashboard."
          }
        });
      }

      // Check if VTpass purchase was successful
      // VTpass success indicators: code === "000" or response_description contains "successful"
      const isSuccess = vtpassData.code === "000" || 
                       vtpassData.code === 0 ||
                       (vtpassData.response_description && 
                        vtpassData.response_description.toLowerCase().includes("successful")) ||
                       (vtpassData.content && vtpassData.content.transactions) ||
                       vtpassData.status === "delivered";

      // Log VTpass response for debugging
      if (req.log) req.log.info({ vtpassCode: vtpassData.code, vtpassStatus: vtpassData.status, vtpassDescription: vtpassData.response_description }, "VTpass data API response received");

      if (isSuccess) {
        user.walletBalance = balanceBefore - amount;
        await user.save();

        transaction.status = "completed";
        transaction.balanceAfter = user.walletBalance;
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.vtpassTransactionId = vtpassData.requestId || vtpassData.transactionId;
        await transaction.save();

      res.json({
        success: true,
        message: "Data purchased successfully",
        transaction: {
          _id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          phone,
          network,
          dataPlan,
        },
        newBalance: user.walletBalance,
      });
      } else {
        // VTpass purchase failed
        transaction.status = "failed";
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.error = vtpassData.response_description || "VTpass purchase failed";
        await transaction.save();

        res.status(400).json({
          success: false,
          error: "Failed to process data purchase",
          vtpassError: vtpassData.response_description || vtpassData.message,
        });
      }
    } catch (serviceError) {
      transaction.status = "failed";
      transaction.metadata.error = serviceError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        error: "Failed to process data purchase",
        details: serviceError.message,
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Buy data error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Pay Electricity
 */
export const payElectricity = async (req, res) => {
  try {
    const { meterNumber, meterType, provider, amount } = req.body;

    if (!meterNumber || !meterType || !provider || !amount) {
      return res.status(400).json({
        success: false,
        error: "Meter number, meter type, provider, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

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

    // Get VTpass integration for electricity (prioritize live mode for production)
    let integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "electricity",
      mode: "live",
    });

    // Fallback to sandbox if live not found (for testing)
    if (!integration) {
      integration = await Integration.findOne({
        providerName: { $regex: /vtpass/i },
        category: "electricity",
        mode: "sandbox",
      });
    }

    if (!integration) {
      return res.status(503).json({
        success: false,
        error: "Electricity service not configured",
      });
    }

    const balanceBefore = user.walletBalance;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "electricity",
      amount,
      status: "pending",
      description: `Electricity bill payment - ${provider} ${meterNumber}`,
      balanceBefore,
      metadata: {
        meterNumber,
        meterType,
        provider,
      },
    });

    try {
      // Call VTpass API for electricity
      const serviceIDMap = {
        "IKEDC": "ikeja-electric",
        "EKEDC": "eko-electric",
        "EEDC": "enugu-electric",
        "KEDCO": "kano-electric",
        "AEDC": "abuja-electric",
        "PHED": "portharcourt-electric",
        "IBEDC": "ibadan-electric"
      };
      
      const serviceID = serviceIDMap[provider] || `${provider.toLowerCase().replace(/\s/g, '-')}-electric`;
      const requestId = `${user._id}_${Date.now()}`;
      const variationCode = meterType.toLowerCase();

      const vtpassPayload = {
        request_id: requestId,
        serviceID: serviceID,
        billersCode: meterNumber,
        variation_code: variationCode,
        amount: amount.toString(),
        phone: user.phone || "08111111111" // VTpass requires phone
      };

      // Get credentials for POST request
      // VTPass POST requests use: api-key (static) + secret-key (SK_)
      const staticKeyCred = integration.credentials.find(c => 
        c.label && c.label.toLowerCase().includes("static"));
      const secretKeyCred = integration.credentials.find(c => 
        c.label && c.label.toLowerCase().includes("secret"));
      
      const staticKey = staticKeyCred?.value;
      const secretKey = secretKeyCred?.value;

      // Debug: Log available credential labels (without values)
      const availableLabels = integration.credentials.map(c => c.label).filter(Boolean);
      if (!staticKey || !secretKey) {
        transaction.status = "failed";
        transaction.metadata.error = "VTpass credentials missing";
        transaction.metadata.debug = {
          availableLabels,
          foundStaticKey: !!staticKey,
          foundSecretKey: !!secretKey,
          integrationMode: integration.mode
        };
        await transaction.save();
        
        return res.status(503).json({
          success: false,
          error: "VTpass credentials not configured properly",
          details: "Missing Static Key or Secret Key. VTPass requires: Static Key, Public Key (PK_), Secret Key (SK_)",
          debug: {
            availableLabels,
            mode: integration.mode
          }
        });
      }

      const vtpassResponse = await fetch(`${integration.baseUrl}/pay`, {
        method: "POST",
        headers: {
          "api-key": staticKey,
          "secret-key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vtpassPayload),
      });

      const vtpassData = await vtpassResponse.json();

      // Check for VTpass errors
      if (vtpassData.response_description && vtpassData.response_description.includes("INVALID CREDENTIALS")) {
        transaction.status = "failed";
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.error = "VTpass credentials are invalid";
        transaction.metadata.debug = {
          integrationMode: integration.mode,
          baseUrl: integration.baseUrl,
          availableLabels: integration.credentials.map(c => c.label).filter(Boolean),
        };
        await transaction.save();

        return res.status(400).json({
          success: false,
          error: "Failed to process electricity payment",
          vtpassError: "INVALID CREDENTIALS",
          message: "VTpass credentials are invalid. Please verify your API Key and Secret Key are correct and match your VTpass account mode (live/sandbox).",
          debug: {
            mode: integration.mode,
            suggestion: integration.mode === "sandbox" 
              ? "Ensure you're using sandbox credentials. Switch to live mode with live credentials for production."
              : "Ensure you're using live/production credentials from your VTpass dashboard."
          }
        });
      }

      // Check if VTpass purchase was successful
      // VTpass success indicators: code === "000" or response_description contains "successful"
      const isSuccess = vtpassData.code === "000" || 
                       vtpassData.code === 0 ||
                       (vtpassData.response_description && 
                        vtpassData.response_description.toLowerCase().includes("successful")) ||
                       (vtpassData.content && vtpassData.content.transactions) ||
                       vtpassData.status === "delivered";

      // Log VTpass response for debugging
      if (req.log) req.log.info({ vtpassCode: vtpassData.code, vtpassStatus: vtpassData.status, vtpassDescription: vtpassData.response_description }, "VTpass electricity API response received");

      if (isSuccess) {
        user.walletBalance = balanceBefore - amount;
        await user.save();

        transaction.status = "completed";
        transaction.balanceAfter = user.walletBalance;
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.vtpassTransactionId = vtpassData.requestId || vtpassData.transactionId;
        await transaction.save();

      res.json({
        success: true,
        message: "Electricity bill paid successfully",
        transaction: {
          _id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          meterNumber,
          provider,
        },
        newBalance: user.walletBalance,
      });
      } else {
        // VTpass purchase failed
        transaction.status = "failed";
        transaction.metadata.vtpassResponse = vtpassData;
        transaction.metadata.error = vtpassData.response_description || "VTpass purchase failed";
        await transaction.save();

        res.status(400).json({
          success: false,
          error: "Failed to process electricity payment",
          vtpassError: vtpassData.response_description || vtpassData.message,
        });
      }
    } catch (serviceError) {
      transaction.status = "failed";
      transaction.metadata.error = serviceError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        error: "Failed to process electricity payment",
        transaction: {
          _id: transaction._id,
          status: "failed",
        },
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Pay electricity error");
    res.status(500).json({ success: false, error: err.message });
  }
};

