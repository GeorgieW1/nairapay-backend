import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  label: String, // e.g., "Public Key", "Secret Key"
  value: String, // actual value
);

export default mongoose.model("Integration", integrationSchema);
