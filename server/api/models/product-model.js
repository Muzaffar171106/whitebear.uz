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

const ProductSchema = new mongoose.Schema(
    {
        image: { type: String },
        title: { type: LangSchema, required: true },
        category: { type: String, required: true },
        number: { type: Number, default: 1000 },
        sizes: [{
            size: { type: String, required: true },
            stock: { type: Boolean, default: true },
            package: { type: String, required: true },
            price: {
                rub: { type: Number, required: true },
                uzs: { type: Number, required: true },
                usd: { type: Number, required: true },
                yuan: { type: Number, required: true },
            }
        }],
        stock: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
