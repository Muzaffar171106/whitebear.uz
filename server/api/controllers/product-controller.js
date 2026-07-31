import Product from "../models/product-model.js";
import fs from "fs/promises";
import path from "path";

const IMAGES_DIR = path.resolve("uploads/images");

function getFileNameFromUrl(url) {
    return url.split("/").pop();
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const getAllProduct = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
        );
        let category = req.query.category;
        const stock = req.query.stock;
        const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const skip = (page - 1) * limit;

        const query = {};

        if (category === "all") {
            category = "";
        }

        if (category) {
            query.category = category;
        }

        if (search) {
            const expression = new RegExp(escapeRegExp(search), "i");
            query.$or = [
                { "title.en": expression },
                { "title.uz": expression },
                { "title.ru": expression },
                { "title.ch": expression },
                { category: expression },
            ];

            const productNumber = Number(search);
            if (Number.isFinite(productNumber)) {
                query.$or.push({ number: productNumber });
            }
        }

        if (stock === "true") {
            query.stock = true;
        } else if (stock === "false") {
            query.stock = false;
        } else if (stock === "in") {
            query.stock = true;
        } else if (stock === "out") {
            query.stock = false;
        }

        const [products, totalProducts] = await Promise.all([
            Product.find(query).skip(skip).limit(limit).lean(),
            Product.countDocuments(query),
        ]);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            category: category || "all",
            products,
        });

    } catch (error) {
        res.status(500).json({ message: "Problem getting products" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const title =
            typeof req.body.title === "string"
                ? JSON.parse(req.body.title)
                : req.body.title;

        const product = new Product({
            image: req.uploadedImages?.[0] || "",
            title: {
                en: title.en,
                uz: title.uz,
                ru: title.ru,
                ch: title.ch,
            },
            category: req.body.category || "",
            number: req.body.number,
            sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
            stock:
                req.body.stock !== undefined
                    ? req.body.stock === "in" || req.body.stock === true
                    : true,
        });

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Problem creating product" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updatedData = {};

        if (req.body.title) {
            updatedData.title =
                typeof req.body.title === "string"
                    ? JSON.parse(req.body.title)
                    : req.body.title;
        }

        if ("category" in req.body) {
            updatedData.category = req.body.category;
        }

        if ("number" in req.body) {
            updatedData.number = req.body.number;
        }

        if ("sizes" in req.body) {
            updatedData.sizes = typeof req.body.sizes === "string" ? JSON.parse(req.body.sizes) : req.body.sizes;
        }

        if (req.body.stock !== undefined) {
            updatedData.stock =
                req.body.stock === "in" || req.body.stock === true;
        }

        if (req.uploadedImages?.length) {
            if (product.image) {
                const fileName = getFileNameFromUrl(product.image);
                const oldImagePath = path.join(IMAGES_DIR, fileName);

                try {
                    await fs.unlink(oldImagePath);
                } catch { }
            }

            updatedData.image = req.uploadedImages[0];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updatedData },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Problem updating product" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image) {
            const fileName = getFileNameFromUrl(product.image);
            const imagePath = path.join(IMAGES_DIR, fileName);

            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.error("Error deleting image file:", err.message);
            }
        }

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(400).json({ message: "Problem deleting product" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: "Problem getting product" });
    }
}
