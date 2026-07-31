import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    website: { type: String, default: "" },
    email: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });


export default mongoose.model("Contact", ContactSchema);
