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

const CategorySchema = new mongoose.Schema(
    {
        name: { type: LangSchema, required: true },
        slug: { type: String, required: true, unique: true, trim: true },
    },
    { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
