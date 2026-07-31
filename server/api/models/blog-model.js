import mongoose from "mongoose";

const LangSchema = new mongoose.Schema(
    {
        en: { type: String, required: true },
        uz: { type: String, required: true },
        ru: { type: String, required: true },
        ch: { type: String, required: true },
    },
    { _id: false }
);

const BlogSchema = new mongoose.Schema(
    {
        image: { type: String },
        title: { type: LangSchema, required: true },
        text: { type: LangSchema, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
