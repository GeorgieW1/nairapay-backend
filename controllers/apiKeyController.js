import ApiKey from "../models/ApiKey.js";

// Get all API keys
export const getAllKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find();
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch API keys", error });
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

    res.status(201).json({ message: "API Key added successfully", newKey });
  } catch (error) {
    res.status(500).json({ message: "Failed to create API key", error });
  }
};

// Update an API key
export const updateKey = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ApiKey.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Key not found" });
    res.json({ message: "API Key updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update API key", error });
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
    res.status(500).json({ message: "Failed to delete API key", error });
  }
};
