import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";
import type { ErrorTypes } from "@/types/RootTypes";

interface CategoryOption {
  _id: string;
  slug: string;
  name: {
    en: string;
    uz: string;
    ru: string;
    ch: string;
  };
}

import { useDispatch } from "react-redux";
import {
  setProduct,
  setProductError,
  setProductLoading,
} from "@/toolkit/productSlicer";

const languages = ["en", "uz", "ru", "ch"] as const;
type Lang = (typeof languages)[number];

export function AddProduct() {
  const [images, setImages] = useState<FileList | null>(null);
  const [step, setStep] = useState(0);

  const currentLang = languages[step];

  const [formData, setFormData] = useState<{
    title: Record<Lang, string>;
    number: string;
    sizes: Array<{
      size: string;
      stock: boolean;
      package: string;
      price: { rub: string; uzs: string; usd: string; yuan: string };
    }>;
    category: string;
    stock: string;
  }>({
    title: { en: "", uz: "", ru: "", ch: "" },
    number: "1000",
    sizes: [],
    category: "",
    stock: "in",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await Fetch.get("/category");
        setCategories(response.data?.categories || []);
      } catch (error) {
        console.error(error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isSheetOpen) {
      loadCategories();
    }
  }, [isSheetOpen]);

  const GetProducts = async () => {
    try {
      dispatch(setProductLoading());

      const response = (await Fetch.get("product?page=1&limit=200")).data;

      dispatch(setProduct(response));
    } catch (error) {
      const err = error as ErrorTypes;

      dispatch(
        setProductError(
          err.response?.data?.message || "Error getting products"
        )
      );
    }
  };

  const handleLangChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;

    setFormData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [currentLang]: value,
      },
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImages(e.target.files);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title[currentLang]) {
      newErrors.title = "Title is required.";
    }

    if (!formData.category) {
      newErrors.category = "Category is required.";
    }

    if (!images || images.length === 0) {
      newErrors.media = "You must select an image.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const body = new FormData();

      body.append("title", JSON.stringify(formData.title));
      body.append("number", formData.number);
      body.append("category", formData.category);
      body.append("stock", formData.stock);


      if (formData.sizes && formData.sizes.length > 0) {
        body.append("sizes", JSON.stringify(formData.sizes));
      }

      if (images) {
        Array.from(images).forEach(img =>
          body.append("images", img)
        );
      }

      await Fetch.post("/product", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      GetProducts();

      toast.success("Product added successfully!");

      setIsSheetOpen(false);

      setFormData({
        title: { en: "", uz: "", ru: "", ch: "" },
        number: "1000",
        sizes: [],
        category: "",
        stock: "in",
      });

      setImages(null);
      setStep(0);
    } catch (error) {
      toast.error("Error adding product.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#163555] text-white hover:bg-[#163555]/80">
          Add Product
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full w-full overflow-auto border-l border-slate-200 bg-white text-slate-950 dark:border-slate-700 dark:bg-[#101f2e] dark:text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl text-slate-950 dark:text-white">
            New Product
          </SheetTitle>

          <SheetDescription>
            Fill product info and choose image
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <p className="text-sm text-gray-400">
            Language:{" "}
            <b className="uppercase">{currentLang}</b>
          </p>

          <div>
            <Label>Title ({currentLang}) *</Label>

            <Input
              value={formData.title[currentLang]}
              onChange={handleLangChange}
              className={
                errors.title ? "border-red-500" : ""
              }
            />

            {errors.title && (
              <span className="text-red-500 text-sm">
                {errors.title}
              </span>
            )}
          </div>

          {step === 0 && (
            <>
              <div>
                <Label>Number *</Label>

                <Input
                  type="number"
                  value={formData.number}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      number: e.target.value,
                    })
                  }
                  className={
                    errors.number ? "border-red-500" : ""
                  }
                />

                {errors.price && (
                  <span className="text-red-500 text-sm">
                    {errors.price}
                  </span>
                )}
              </div>

              <div>
                <Label>Category *</Label>

                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
                >
                  <option value="" disabled>
                    Choose category
                  </option>
                  {categoriesLoading ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  ) : (
                    categories.map((category) => (
                      <option
                        key={category._id}
                        value={category.slug}
                      >
                        {category.name.en || category.name.uz || category.name.ru || category.name.ch}
                      </option>
                    ))
                  )}
                </select>

                {errors.category && (
                  <span className="text-red-500 text-sm">
                    {errors.category}
                  </span>
                )}
              </div>

              <div>
                <Label>Stock</Label>

                <select
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
                >
                  <option value="in">In Stock</option>
                  <option value="out">Out Of Stock</option>
                </select>
              </div>



              <div>
                <Label>Image *</Label>

                <Input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                />

                {errors.media && (
                  <span className="text-red-500 text-sm">
                    {errors.media}
                  </span>
                )}
              </div>
            </>
          )}

          {
            step === 1 && (
              <div>
                <Label>Sizes</Label>
                <div className="space-y-2">
                  {formData.sizes.map((sizeItem, idx) => (
                    <div key={idx} className="border border-gray-300 rounded p-3 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Size"
                          value={sizeItem.size}
                          onChange={e => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].size = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                        />
                        <Input
                          placeholder="Package"
                          value={sizeItem.package}
                          onChange={e => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].package = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                        />
                      </div>
                      <select
                        value={sizeItem.stock ? "true" : "false"}
                        onChange={e => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx].stock = e.target.value === "true";
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-black"
                      >
                        <option value="true">Stock</option>
                        <option value="false">No Stock</option>
                      </select>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Prices</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">RUB</label>
                            <Input
                              type="number"
                              placeholder="Price in RUB"
                              value={sizeItem.price?.rub || ""}
                              onChange={e => {
                                const newSizes = [...formData.sizes];
                                newSizes[idx].price = {
                                  ...(newSizes[idx].price || { rub: "", uzs: "", usd: "", yuan: "" }),
                                  rub: e.target.value,
                                };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs">UZS</label>
                            <Input
                              type="number"
                              placeholder="Price in UZS"
                              value={sizeItem.price?.uzs || ""}
                              onChange={e => {
                                const newSizes = [...formData.sizes];
                                newSizes[idx].price = {
                                  ...(newSizes[idx].price || { rub: "", uzs: "", usd: "", yuan: "" }),
                                  uzs: e.target.value,
                                };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs">USD</label>
                            <Input
                              type="number"
                              placeholder="Price in USD"
                              value={sizeItem.price?.usd || ""}
                              onChange={e => {
                                const newSizes = [...formData.sizes];
                                newSizes[idx].price = {
                                  ...(newSizes[idx].price || { rub: "", uzs: "", usd: "", yuan: "" }),
                                  usd: e.target.value,
                                };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs">YUAN</label>
                            <Input
                              type="number"
                              placeholder="Price in YUAN"
                              value={sizeItem.price?.yuan || ""}
                              onChange={e => {
                                const newSizes = [...formData.sizes];
                                newSizes[idx].price = {
                                  ...(newSizes[idx].price || { rub: "", uzs: "", usd: "", yuan: "" }),
                                  yuan: e.target.value,
                                };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            sizes: formData.sizes.filter((_, i) => i !== idx),
                          });
                        }}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      sizes: [...formData.sizes, {
                        size: "",
                        stock: true,
                        package: "",
                        price: { rub: "", uzs: "", usd: "", yuan: "" }
                      }],
                    });
                  }}
                  className="mt-2 w-full"
                >
                  Add Size
                </Button>
              </div>
            )
          }
          <div className="flex justify-between mt-6">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Prev
            </Button>

            {step < languages.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
