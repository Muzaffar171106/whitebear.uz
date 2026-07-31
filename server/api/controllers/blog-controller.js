import Blog from '../models/blog-model.js';
import fs from "fs/promises";
import path from "path";

const IMAGES_DIR = path.resolve("uploads/images");

function getFileNameFromUrl(url) {
    return url.split("/").pop();
}

export const getAllBlog = async (_, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Problem getting blogs" });
    }
};

export const createBlog = async (req, res) => {
    try {
        const title = JSON.parse(req.body.title);
        const text = JSON.parse(req.body.text);

        const blog = new Blog({
            image: req.uploadedImages?.[0] || "",
            title: {
                en: title.en,
                uz: title.uz,
                ru: title.ru,
                ch: title.ch,
            },
            text: {
                en: text.en,
                uz: text.uz,
                ru: text.ru,
                ch: text.ch,
            },
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Problem creating blog" });
    }
};



export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        const updatedData = {};

        if (req.body.title) {
            updatedData.title =
                typeof req.body.title === "string" ? JSON.parse(req.body.title) : req.body.title;
        }

        if (req.body.text) {
            updatedData.text =
                typeof req.body.text === "string" ? JSON.parse(req.body.text) : req.body.text;
        }

        if (req.uploadedImages?.length) {
            if (blog.image) {
                const fileName = blog.image.split("/").pop();
                const oldImagePath = path.join(IMAGES_DIR, fileName);
                try { await fs.unlink(oldImagePath); } catch { }
            }
            updatedData.image = req.uploadedImages[0];
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: updatedData },
            { new: true }
        );

        res.status(200).json(updatedBlog);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Problem updating blog" });
    }
};


export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.image) {
            const fileName = getFileNameFromUrl(blog.image);
            const imagePath = path.join(IMAGES_DIR, fileName);

            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.error("Error deleting image file:", err.message);
            }
        }

        res.status(200).json({ message: "Blog deleted" });
    } catch (error) {
        res.status(400).json({ message: "Problem deleting blog" });
    }
};