import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        order_id: { type: String, required: true, unique: true, index: true },
        products: [
            {
                product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                size: { type: String, required: true },
                package: { type: String, default: "" },
                number: { type: String, required: true }
            },
        ],
        total_price: { type: Number, required: true },
        customer: {
            name: { type: String, required: true },
            email: { type: String, default: "" },
            phone: { type: String, required: true },
            address: { type: String, default: "" },
        },
        status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
        payment: { type: String, enum: ["cash", "card"], default: "cash" },
        payment_status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
        driver: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
