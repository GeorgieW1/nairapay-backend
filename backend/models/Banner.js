import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    actionUrl: { type: String }, // Optional link to open when clicked
    isActive: { type: Boolean, default: true },
    title: { type: String }, // Optional title for admin reference
    createdBy: { type: String }
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);
