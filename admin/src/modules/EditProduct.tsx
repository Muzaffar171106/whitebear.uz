import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Fetch } from "@/middlewares/Fetch";
import { toast } from "sonner";
import type {
  ProductTypes,
  ErrorTypes,
} from "@/types/RootTypes";

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

interface EditProductProps {
  product: ProductTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages = ["en", "uz", "ru", "ch"] as const;

type Lang = (typeof languages)[number];

export function EditProduct({
  product,
  open,
  onOpenChange,
}: EditProductProps) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [images, setImages] =
    useState<FileList | null>(null);

  const [step, setStep] = useState(0);

  const currentLang = languages[step];

  const [formData, setFormData] = useState<{
    title: Record<Lang, string>;
    number: string;
    sizes: Array<{
      size: string;
      stock: boolean;
      package: string;
      price: {
        rub: string;
        uzs: string;
        usd: string;
        yuan: string;
      };
    }>;
    category: string;
    stock: string;
  }>({
    title: product.title,
    number: String(product.number),
    sizes: product.sizes || [],
    category: product.category || "",
    stock: product.stock === false ? "out" : "in",
  });

  useEffect(() => {
    if (!open) return;

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

    loadCategories();

    setFormData({
      title: product.title,
      number: String(product.number),
      sizes:
        product.sizes?.map((item) => ({
          ...item,
          price: {
            rub: item.price?.rub?.toString() || "",
            uzs: item.price?.uzs?.toString() || "",
            usd: item.price?.usd?.toString() || "",
            yuan: item.price?.yuan?.toString() || "",
          },
        })) || [],
      category: product.category || "",
      stock: product.stock === false ? "out" : "in",
    });

    setImages(null);
    setStep(0);
  }, [open, product]);
  const GetProducts = async () => {
    try {
      dispatch(setProductLoading());

      const response = (await Fetch.get("product?page=1&limit=200")).data;

      dispatch(setProduct(response));
    } catch (error) {
      const err = error as ErrorTypes;

      dispatch(
        setProductError(
          err.response?.data?.message ||
          "Error getting products"
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

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const body = new FormData();

      body.append(
        "title",
        JSON.stringify(formData.title)
      );

      body.append("number", formData.number);
      body.append("category", formData.category);
      body.append("stock", formData.stock);


      if (formData.sizes && formData.sizes.length > 0) {
        body.append(
          "sizes",
          JSON.stringify(formData.sizes)
        );
      }
      if (images) {
        Array.from(images).forEach(img =>
          body.append("images", img)
        );
      }

      await Fetch.put(
        `/product/${product._id}`,
        body,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        "Product updated successfully"
      );

      GetProducts();

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      const err = error as {
        response?: {
          data?: { message?: string };
        };
      };

      toast.error(
        err.response?.data?.message ||
        "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-screen z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-lg dark:border-slate-700 dark:bg-[#101f2e] dark:text-white">        <Button
        variant="ghost"
        onClick={() => onOpenChange(false)}
        className="absolute top-3 right-3"
      >
        ✕
      </Button>

        <h2 className="text-2xl mb-1">
          Edit Product
        </h2>


        {step < languages.length && (
          <>
            <p className="text-sm text-gray-400 mb-2">
              Language: <b className="uppercase">{currentLang}</b>
            </p>

            <div>
              <Label>
                Title ({currentLang})
              </Label>

              <Input
                value={formData.title[currentLang]}
                onChange={handleLangChange}
                className="bg-white text-black"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-4">


          {step === 0 && (
            <>
              <div>
                <Label>Number</Label>

                <Input
                  type="number"
                  value={formData.number}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      number: e.target.value,
                    })
                  }
                  className="bg-white text-black"
                />
              </div>


              <div>
                <Label>Category</Label>

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
                    Select category
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
                <Label>
                  Image (optional)
                </Label>

                <Input
                  type="file"
                  multiple
                  className="file:cursor-pointer file:px-2 file:rounded file:border-0 file:bg-white file:text-black"
                  onChange={handleImageChange}
                />
              </div>
            </>
          )}

          {
            step === 4 && (
              <div>
                <Label>Sizes</Label>

                <div className="space-y-3 mt-2">
                  {formData.sizes.map((sizeItem, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-600 rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Size"
                          value={sizeItem.size}
                          onChange={(e) => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].size = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          className="bg-white text-black"
                        />

                        <Input
                          placeholder="Package"
                          value={sizeItem.package}
                          onChange={(e) => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].package = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          className="bg-white text-black"
                        />

                        <select
                          value={sizeItem.stock ? "true" : "false"}
                          onChange={(e) => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].stock =
                              e.target.value === "true";

                            setFormData({
                              ...formData,
                              sizes: newSizes,
                            });
                          }}
                          className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-black"
                        >
                          <option value="true">
                            Stock
                          </option>

                          <option value="false">
                            No Stock
                          </option>
                        </select>
                      </div>

                      <div>
                        <p className="text-sm mb-2">
                          Prices
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="RUB"
                            value={sizeItem.price?.rub ?? ""}
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];

                              newSizes[idx] = {
                                ...newSizes[idx],
                                price: {
                                  ...newSizes[idx].price,
                                  rub: e.target.value,
                                },
                              };

                              setFormData({
                                ...formData,
                                sizes: newSizes,
                              });
                            }}
                            className="bg-white text-black"
                          />

                          <Input
                            type="number"
                            placeholder="UZS"
                            value={
                              sizeItem.price?.uzs || ""
                            }
                            onChange={(e) => {
                              const newSizes = [
                                ...formData.sizes,
                              ];

                              newSizes[idx].price = {
                                ...newSizes[idx].price,
                                uzs: e.target.value,
                              };

                              setFormData({
                                ...formData,
                                sizes: newSizes,
                              });
                            }}
                            className="bg-white text-black"
                          />

                          <Input
                            type="number"
                            placeholder="USD"
                            value={
                              sizeItem.price?.usd || ""
                            }
                            onChange={(e) => {
                              const newSizes = [
                                ...formData.sizes,
                              ];

                              newSizes[idx].price = {
                                ...newSizes[idx].price,
                                usd: e.target.value,
                              };

                              setFormData({
                                ...formData,
                                sizes: newSizes,
                              });
                            }}
                            className="bg-white text-black"
                          />

                          <Input
                            type="number"
                            placeholder="YUAN"
                            value={
                              sizeItem.price?.yuan || ""
                            }
                            onChange={(e) => {
                              const newSizes = [
                                ...formData.sizes,
                              ];

                              newSizes[idx].price = {
                                ...newSizes[idx].price,
                                yuan: e.target.value,
                              };

                              setFormData({
                                ...formData,
                                sizes: newSizes,
                              });
                            }}
                            className="bg-white text-black"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            sizes: formData.sizes.filter(
                              (_, i) => i !== idx
                            ),
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
                  className="mt-3 w-full"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      sizes: [
                        ...formData.sizes,
                        {
                          size: "",
                          package: "",
                          stock: true,
                          price: {
                            rub: "",
                            uzs: "",
                            usd: "",
                            yuan: "",
                          },
                        },
                      ],
                    });
                  }}
                >
                  Add Size
                </Button>
              </div>
            )
          }
        </div>

        <div className="flex justify-between gap-2 mt-6">
          <Button
            variant="secondary"
            disabled={step === 0}
            onClick={() =>
              setStep(step - 1)
            }
          >
            Prev
          </Button>

          {step < 4 ? (
            <Button
              onClick={() =>
                setStep(step + 1)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save"}
            </Button>
          )}
        </div>
      </div>
    </div >
  );
}
