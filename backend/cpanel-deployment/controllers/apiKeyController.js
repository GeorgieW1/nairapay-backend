import ApiKey from "../models/ApiKey.js";

// Get all API keys
export const getAllKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find();
    const masked = keys.map((k) => ({
      _id: k._id,
      service: k.service,
      provider: k.provider,
      createdBy: k.createdBy,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      keyMasked: typeof k.key === "string" && k.key.length > 8
        ? `${k.key.slice(0, 4)}****${k.key.slice(-4)}`
        : "****",
    }));
    res.json({ success: true, keys: masked });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Failed to fetch API keys");
    res.status(500).json({ message: "Failed to fetch API keys" });
  }
};

// Create new API key
export const createKey = async (req, res) => {
  try {
    const { service, provider, key } = req.body;
    if (!service || !provider || !key)
      return res.status(400).json({ message: "All fields are required" });

    const newKey = new ApiKey({ service, provider, key });
    await newKey.save();

    const keyMasked = key.length > 8 ? `${key.slice(0, 4)}****${key.slice(-4)}` : "****";
    res.status(201).json({ message: "API Key added successfully", keyMasked });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Failed to create API key");
    res.status(500).json({ message: "Failed to create API key" });
  }
};

// Update an API key
export const updateKey = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ApiKey.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Key not found" });
    const keyMasked = updated?.key && updated.key.length > 8
      ? `${updated.key.slice(0, 4)}****${updated.key.slice(-4)}`
      : "****";
    res.json({ message: "API Key updated successfully", keyMasked });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Failed to update API key");
    res.status(500).json({ message: "Failed to update API key" });
  }
};

// Delete an API key
export const deleteKey = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ApiKey.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Key not found" });
    res.json({ message: "API Key deleted successfully" });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Failed to delete API key");
    res.status(500).json({ message: "Failed to delete API key" });
  }
};
