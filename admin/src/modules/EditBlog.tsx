import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Fetch } from "@/middlewares/Fetch";
import { toast } from "sonner";
import type { BlogTypes, ErrorTypes } from "@/types/RootTypes";
import { useDispatch } from "react-redux";
import { setBlog, setBlogError, setBlogLoading } from "@/toolkit/blogSlicer";

const languages = ["en", "uz", "ru", "ch"] as const;
type Lang = (typeof languages)[number];

interface EditBlogProps {
  blog: BlogTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBlog({ blog, open, onOpenChange }: EditBlogProps) {
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);
  const currentLang = languages[step];

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);

  const [formData, setFormData] = useState<{
    title: Record<Lang, string>;
    text: Record<Lang, string>;
  }>({
    title: blog.title,
    text: blog.text,
  });


  useEffect(() => {
    setFormData({
      title: blog.title,
      text: blog.text,
    });
    setImages(null);
    setStep(0);
  }, [blog]);


  const GetBlogs = async () => {
    try {
      dispatch(setBlogLoading());
      const response = (await Fetch.get("blog")).data;
      dispatch(setBlog(response));
    } catch (error) {
      const err = error as ErrorTypes;
      dispatch(
        setBlogError(err.response?.data?.message || "Error getting blogs")
      );
    }
  };


  const handleLangChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: {
        ...prev[name as "title" | "text"],
        [currentLang]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };


  const handleUpdate = async () => {
    try {
      setLoading(true);

      const body = new FormData();
      body.append("title", JSON.stringify(formData.title));
      body.append("text", JSON.stringify(formData.text));

      if (images) {
        Array.from(images).forEach(img => body.append("images", img));
      }

      await Fetch.put(`blog/${blog._id}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Blog updated successfully");
      GetBlogs();
      onOpenChange(false);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(err.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-lg dark:border-slate-700 dark:bg-[#101f2e] dark:text-white">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3"
        >
          ✕
        </Button>

        <h2 className="text-2xl mb-1">Edit Blog</h2>
        <p className="text-sm text-gray-400 mb-4">
          Language: <b className="uppercase">{currentLang}</b>
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Title ({currentLang})</Label>
            <Input
              name="title"
              value={formData.title[currentLang]}
              onChange={handleLangChange}
              className="bg-white text-black"
            />
          </div>

          <div>
            <Label>Text ({currentLang})</Label>
            <Textarea
              name="text"
              rows={4}
              value={formData.text[currentLang]}
              onChange={handleLangChange}
              className="bg-white text-black"
            />
          </div>

          {step === 0 && (
            <div>
              <Label>Change Image (optional)</Label>
              <Input
                type="file"
                multiple
                onChange={handleImageChange}
                className="file:cursor-pointer file:px-2 file:rounded file:border-0 file:bg-white file:text-black"
              />
            </div>
          )}
        </div>
        <div className="flex justify-between gap-2 mt-6">
          <Button
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Prev
          </Button>

          {step < languages.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
