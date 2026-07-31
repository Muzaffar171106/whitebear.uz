import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";

interface CategoryName {
    en: string;
    uz: string;
    ru: string;
    ch: string;
}

interface CategoryItem {
    _id: string;
    slug: string;
    name: CategoryName;
}

const emptyName = (): CategoryName => ({
    en: "",
    uz: "",
    ru: "",
    ch: "",
});

const emptyForm = () => ({
    name: emptyName(),
    slug: "",
});

export function CategoryManager() {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [show, setShow] = useState(false);
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await Fetch.get("/category");
            setCategories(response.data?.categories || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (lang: keyof CategoryName, value: string) => {
        setFormData((prev) => ({
            ...prev,
            name: {
                ...prev.name,
                [lang]: value,
            },
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setSubmitting(true);

            const payload = {
                name: formData.name,
                slug: formData.slug.trim(),
            };

            if (editingId) {
                await Fetch.put(`/category/${editingId}`, payload);
                toast.success("Category updated");
            } else {
                await Fetch.post("/category", payload);
                toast.success("Category created");
            }

            setFormData(emptyForm());
            setEditingId(null);
            await fetchCategories();
        } catch (err) {
            console.error(err);
            toast.error("Unable to save category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category: CategoryItem) => {
        setShow(true);
        setEditingId(category._id);
        setFormData({
            name: category.name,
            slug: category.slug,
        });
    };

    const handleDelete = async (categoryId: string) => {
        try {
            await Fetch.delete(`/category/${categoryId}`);
            toast.success("Category deleted");
            await fetchCategories();
        } catch (err) {
            console.error(err);
            toast.error("Unable to delete category");
        }
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                    <p className="text-sm text-gray-500">Create, edit, and remove category items in four languages.</p>
                </div>

                <Button
                    type="button"
                    className="bg-[#163555] text-white hover:bg-[#163555]/80"
                    onClick={() => {
                        setShow((prev) => !prev)
                    }}
                >
                    Toggler Form
                </Button>
            </div>

            {show && (
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        {(["en", "uz", "ru", "ch"] as Array<keyof CategoryName>).map((lang) => (
                            <div key={lang}>
                                <Label className="mb-1 block capitalize">{lang} name</Label>
                                <Input
                                    value={formData.name[lang]}
                                    onChange={(event) => handleChange(lang, event.target.value)}
                                    placeholder={`Category name (${lang})`}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label className="mb-1 block">Slug</Label>
                        <Input
                            value={formData.slug}
                            onChange={(event) =>
                                setFormData((prev) => ({ ...prev, slug: event.target.value }))
                            }
                            placeholder="category-slug"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={submitting} className="bg-[#163555] text-white hover:bg-[#163555]/80">
                            {submitting ? "Saving..." : editingId ? "Update category" : "Create category"}
                        </Button>

                        {editingId ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData(emptyForm());
                                }}
                            >
                                Cancel
                            </Button>
                        ) : null}
                    </div>
                </form>
            )}

            {error ? (
                <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mt-4 space-y-2">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading categories...</p>
                ) : categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories yet.</p>
                ) : (
                    categories.map((category) => (
                        <div key={category._id} className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">{category.name.en || category.name.uz || category.name.ru || category.name.ch}</p>
                                <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => handleEdit(category)}>
                                    Edit
                                </Button>
                                <Button type="button" variant="outline" onClick={() => handleDelete(category._id)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
