import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  label: String, // e.g., "Public Key", "Secret Key"
  value: String, // actual value
});

const integrationSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true }, // e.g., "VTpass"
    category: {
      type: String,
      enum: ["airtime", "data", "electricity", "tv", "epin", "betting", "others"],
      required: true,
    },
    baseUrl: { type: String, required: true },
    mode: { type: String, enum: ["live", "sandbox"], default: "live" },
    credentials: [fieldSchema], // store dynamic key/value fields
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Integration", integrationSchema);
