import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      enum: ["airtime", "data", "electricity", "tv", "betting"], // extend later
    },
    provider: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ApiKey", apiKeySchema);
