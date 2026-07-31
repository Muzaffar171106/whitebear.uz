import { EllipsisVertical, Loader2, Pen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";
import { useState } from "react";
import { EditBlog } from "@/modules/EditBlog";
import { useDispatch, useSelector } from "react-redux";
import { setBlog, setBlogError, setBlogLoading } from "@/toolkit/blogSlicer";
import type { BlogTypes, ErrorTypes } from "@/types/RootTypes";
import type { RootState } from "@/store/RootStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Blog = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: RootState) => state.blog);

  const [editMenuOpen, setEditMenuOpen] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<BlogTypes | null>(null);

  const [language, setLanguage] = useState<keyof BlogTypes["title"]>("en");

  const GetBlogs = async () => {
    try {
      dispatch(setBlogLoading());
      const response = (await Fetch.get("blog")).data;
      dispatch(setBlog(response));
    } catch (err) {
      const e = err as ErrorTypes;
      dispatch(setBlogError(e.response?.data?.message || "Error in get all blogs"));
      console.log(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await Fetch.delete(`/blog/${id}`);
      toast.success("Blog deleted successfully!");
      GetBlogs();
    } catch (err) {
      toast.error("Error deleting blog.");
      console.error(err);
    }
  };

  const handleEditMenu = (blog: BlogTypes) => {
    setSelectedMenu(blog);
    setEditMenuOpen(true);
  };

  if (error)
    return (
      <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
        <h1 className="text-center text-destructive">Error loading blog data</h1>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
        <div className="flex items-center justify-center h-[calc(100vh-150px)]">
          <Loader2 className="animate-spin text-cyan-600" size={30} />
        </div>
      </div>
    );

  const blogs = (data as BlogTypes[]) || [];

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <label className="mr-2 font-semibold">Select Language:</label>
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as keyof BlogTypes["title"])}
        >
          <SelectTrigger className="max-w-50">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="uz">Uzbek</SelectItem>
            <SelectItem value="ru">Russian</SelectItem>
            <SelectItem value="ch">Korean</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {blogs.map(({ _id, image, title, text }) => (
          <div
            key={_id}
            className="bg-gray-50 border border-gray-200 rounded-lg shadow p-4 flex flex-col relative"
          >
            {image && (
              <img
                src={image}
                alt={title[language]}
                loading="lazy"
                decoding="async"
                className="w-full h-64 object-cover object-center rounded-md mt-6"
              />
            )}

            <h2 className="font-semibold text-lg mt-3">{title[language]}</h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{text[language]}</p>

            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical size={24} className="text-black cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-none">
                  <DropdownMenuItem className="flex items-center gap-2 text-blue-600 cursor-pointer">
                    <Button
                      className="w-full bg-[#143b63] text-white hover:bg-[#0f2f4f]"
                      onClick={() =>
                        handleEditMenu({ _id, image, title, text } as BlogTypes)
                      }
                    >
                      <Pen className="text-white" />
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer">
                    <Button
                      onClick={() => handleDelete(_id || "")}
                      variant={"destructive"}
                      className="w-full"
                    >
                      <Trash2 className="text-white" />
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {editMenuOpen && selectedMenu && (
        <EditBlog
          blog={selectedMenu!}
          open={editMenuOpen}
          onOpenChange={setEditMenuOpen}
        />
      )}
    </div>
  );
};
