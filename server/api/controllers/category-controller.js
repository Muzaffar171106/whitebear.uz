import Category from "../models/category-model.js";

const LANGS = ["en", "uz", "ru", "ch"];

const normalizeLangObject = (value) => {
    const base = {
        en: "",
        uz: "",
        ru: "",
        ch: "",
    };

    if (!value || typeof value !== "object") {
        return base;
    }

    return LANGS.reduce((acc, lang) => {
        acc[lang] = value[lang] || "";
        return acc;
    }, { ...base });
};

const createSlug = (value) => {
    const base = String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return base || "category";
};

export const getAllCategories = async (_req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });

        res.status(200).json({ categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Problem getting categories" });
    }
};

export const createCategory = async (req, res) => {
    try {
        const rawName = typeof req.body.name === "string" ? JSON.parse(req.body.name) : req.body.name;
        const name = normalizeLangObject(rawName);
        const slug = String(req.body.slug || "").trim() || createSlug(name.en || name.uz || name.ru || name.ch);

        const existingCategory = await Category.findOne({ slug });

        if (existingCategory) {
            return res.status(409).json({ message: "Category already exists" });
        }

        const category = await Category.create({
            name,
            slug,
        });

        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Problem creating category" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const rawName = typeof req.body.name === "string" ? JSON.parse(req.body.name) : req.body.name;
        const name = normalizeLangObject(rawName);
        const slug = String(req.body.slug || "").trim() || createSlug(name.en || name.uz || name.ru || name.ch);

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: { name, slug } },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Problem updating category" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Problem deleting category" });
    }
};
