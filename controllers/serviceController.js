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

    // Get VTpass integration
    const integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "airtime",
    });

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

      // Get credentials
      const apiKey = integration.credentials.find(c => 
        c.label.toLowerCase().includes("api"))?.value;
      const publicKey = integration.credentials.find(c => 
        c.label.toLowerCase().includes("public"))?.value;

      const vtpassResponse = await fetch(`${integration.baseUrl}/pay`, {
        method: "POST",
        headers: {
          "api-key": apiKey || "",
          "public-key": publicKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vtpassPayload),
      });

      const vtpassData = await vtpassResponse.json();

      // Check if VTpass purchase was successful
      if (vtpassData.content && vtpassData.content.transactions) {
        // If successful, deduct from wallet
        user.walletBalance = balanceBefore - amount;
        await user.save();

        // Update transaction
        transaction.status = "completed";
        transaction.balanceAfter = user.walletBalance;
        transaction.metadata.vtpassResponse = vtpassData;
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
        transaction.metadata.error = vtpassData.response_description || "VTpass purchase failed";
        await transaction.save();

        res.status(400).json({
          success: false,
          error: "Failed to process airtime purchase",
          vtpassError: vtpassData.response_description || vtpassData.message,
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
 * Buy Data
 */
export const buyData = async (req, res) => {
  try {
    const { phone, network, dataPlan, amount } = req.body;

    if (!phone || !network || !dataPlan || !amount) {
      return res.status(400).json({
        success: false,
        error: "Phone, network, dataPlan, and amount are required",
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

    // Get VTpass integration for data
    const integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "data",
    });

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
      // Call VTpass API for data
      const serviceIDMap = {
        "MTN": "mtn-data",
        "Airtel": "airtel-data",
        "Glo": "glo-data",
        "9mobile": "9mobile-data"
      };
      
      const serviceID = serviceIDMap[network] || `${network.toLowerCase()}-data`;
      const requestId = `${user._id}_${Date.now()}`;
      const variationCode = `${network.toLowerCase()}-${dataPlan.toLowerCase().replace(/\s/g, '')}`;

      const vtpassPayload = {
        request_id: requestId,
        serviceID: serviceID,
        billersCode: phone,
        variation_code: variationCode,
        amount: amount.toString(),
        phone: phone
      };

      const apiKey = integration.credentials.find(c => 
        c.label.toLowerCase().includes("api"))?.value;
      const publicKey = integration.credentials.find(c => 
        c.label.toLowerCase().includes("public"))?.value;

      const vtpassResponse = await fetch(`${integration.baseUrl}/pay`, {
        method: "POST",
        headers: {
          "api-key": apiKey || "",
          "public-key": publicKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vtpassPayload),
      });

      const vtpassData = await vtpassResponse.json();

      if (vtpassData.content && vtpassData.content.transactions) {
        user.walletBalance = balanceBefore - amount;
        await user.save();

        transaction.status = "completed";
        transaction.balanceAfter = user.walletBalance;
        transaction.metadata.vtpassResponse = vtpassData;
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

    // Get VTpass integration for electricity
    const integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "electricity",
    });

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
        "KEDCO": "kano-electric",
        "AEDC": "abuja-electric"
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

      const apiKey = integration.credentials.find(c => 
        c.label.toLowerCase().includes("api"))?.value;
      const publicKey = integration.credentials.find(c => 
        c.label.toLowerCase().includes("public"))?.value;

      const vtpassResponse = await fetch(`${integration.baseUrl}/pay`, {
        method: "POST",
        headers: {
          "api-key": apiKey || "",
          "public-key": publicKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vtpassPayload),
      });

      const vtpassData = await vtpassResponse.json();

      if (vtpassData.content && vtpassData.content.transactions) {
        user.walletBalance = balanceBefore - amount;
        await user.save();

        transaction.status = "completed";
        transaction.balanceAfter = user.walletBalance;
        transaction.metadata.vtpassResponse = vtpassData;
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

