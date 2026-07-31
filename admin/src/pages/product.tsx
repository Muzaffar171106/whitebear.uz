import { EllipsisVertical, Loader2, Pen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import type {
  ProductTypes,
  ErrorTypes,
} from "@/types/RootTypes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "@/store/RootStore";

import {
  setProduct,
  setProductError,
  setProductLoading,
} from "@/toolkit/productSlicer";

import { EditProduct } from "@/modules/EditProduct";
import { CategoryManager } from "@/modules/CategoryManager";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels: Record<string, string> = {
  pprSeries: "PPR SERIES",
  brassValveSeries: "BRASS VALVE SERIES",
  heatingSystem: "HEATING SYSTEM",
  "pp-r": "PP-R",
};

interface responseData {
  products: ProductTypes[];
}

export const Product = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.product
  );

  const products = Array.isArray(data)
    ? data
    : (data as responseData)?.products ?? [];
  const [editMenuOpen, setEditMenuOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] =
    useState<ProductTypes | null>(null);

  const [selectedLang, setSelectedLang] =
    useState<keyof ProductTypes["title"]>("en");

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] =
    useState<"all" | "in" | "out">("all");

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

  const handleDelete = async (id: string) => {
    try {
      await Fetch.delete(`/product/${id}`);

      toast.success("Product deleted successfully!");

      GetProducts();
    } catch {
      toast.error("Error deleting product.");
    }
  };

  const handleEditMenu = (product: ProductTypes) => {
    setSelectedMenu(product);
    setEditMenuOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      product.title[selectedLang]
        .toLowerCase()
        .includes(searchValue) ||
      product.category
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in" && product.stock !== false) ||
      (stockFilter === "out" && product.stock === false);

    return matchesSearch && matchesStock;
  });

  if (error)
    return (
      <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
        <h1 className="text-center text-destructive">
          Error loading product data
        </h1>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
        <div className="flex items-center justify-center h-[calc(100vh-150px)]">
          <Loader2
            className="animate-spin text-cyan-600"
            size={30}
          />
        </div>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_auto_auto] items-center">
        <div className="space-y-1">
          <span className="font-semibold block">
            Search products:
          </span>
          <Input
            placeholder="Search by title or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white text-black"
          />
        </div>

        <div className="space-y-1">
          <span className="font-semibold block">
            Stock filter:
          </span>
          <Select
            value={stockFilter}
            onValueChange={(value) =>
              setStockFilter(value as "all" | "in" | "out")
            }
          >
            <SelectTrigger className="min-w-[160px]">
              <SelectValue placeholder="All stock" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="out">Out Of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end mt-6">
          <Button
            onClick={() => {
              setSearchTerm("");
              setStockFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold">
          Select Language:
        </span>

        <Select
          value={selectedLang}
          onValueChange={(value) =>
            setSelectedLang(
              value as keyof ProductTypes["title"]
            )
          }
        >
          <SelectTrigger className="max-w-52">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="uz">Uzbek</SelectItem>
            <SelectItem value="ru">Russian</SelectItem>
            <SelectItem value="ch">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CategoryManager />

      {/* PRODUCT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map(
          ({
            _id,
            image,
            title,
            category,
            number,
            sizes,
            stock,
            createdAt,
          }) => (
            <div
              key={_id}
              className="bg-gray-50 border border-gray-200 rounded-lg shadow p-4 flex flex-col relative"
            >
              {image && (
                <img
                  src={image}
                  alt={title[selectedLang]}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-40 object-contain rounded-md mt-6"
                />
              )}

              <h2 className="font-semibold text-lg mt-3">
                {title[selectedLang] || "No title"}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <p className="font-bold text-lg">
                  {number}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {category && (
                  <p className="text-sm text-gray-500">
                    Category: {categoryLabels[category] || category}
                  </p>
                )}
                {typeof stock !== "undefined" && (
                  <p className={`text-sm font-semibold ${stock ? "text-emerald-600" : "text-red-500"}`}>
                    {stock ? "In Stock" : "Out of Stock"}
                  </p>
                )}
                {createdAt && (
                  <p className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisVertical
                      size={24}
                      className="text-black cursor-pointer"
                    />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="border-none">
                    <DropdownMenuItem>
                      <Button
                        className="w-full bg-[#143b63] text-white hover:bg-[#0f2f4f]"
                        onClick={() =>
                          handleEditMenu({
                            _id,
                            image,
                            title,
                            category,
                            number,
                            sizes,
                            stock,
                          } as ProductTypes)
                        }
                      >
                        <Pen className="text-white" />
                      </Button>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() =>
                          handleDelete(_id!)
                        }
                      >
                        <Trash2 className="text-white" />
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        )}
      </div>

      {editMenuOpen && selectedMenu && (
        <EditProduct
          product={selectedMenu}
          open={editMenuOpen}
          onOpenChange={setEditMenuOpen}
        />
      )}
    </div>
  );
};
