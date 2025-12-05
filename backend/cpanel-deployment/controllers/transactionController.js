import Transaction from "../models/Transaction.js";

/**
 * Get all transactions for current user
 */
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Get transactions error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get single transaction
 */
export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    }).select("-__v");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Get transaction error");
    res.status(500).json({ success: false, error: err.message });
  }
};











