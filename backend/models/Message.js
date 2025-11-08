import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ["interview_invite", "offer_uploaded", "offer_verified", "general"],
    default: "general"
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
