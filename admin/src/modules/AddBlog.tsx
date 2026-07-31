import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";
import { useDispatch } from "react-redux";
import { setBlog, setBlogError, setBlogLoading } from "@/toolkit/blogSlicer";
import type { ErrorTypes } from "@/types/RootTypes";

const languages = ["en", "uz", "ru", "ch"] as const;
type Lang = (typeof languages)[number];

export function AddBlog() {
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);
  const currentLang = languages[step];

  const [images, setImages] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    title: Record<Lang, string>;
    text: Record<Lang, string>;
  }>({
    title: { en: "", uz: "", ru: "", ch: "" },
    text: { en: "", uz: "", ru: "", ch: "" },
  });

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


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    languages.forEach(lang => {
      if (!formData.title[lang])
        newErrors.title = "All titles are required";
      if (!formData.text[lang])
        newErrors.text = "All texts are required";
    });

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
      body.append("text", JSON.stringify(formData.text));

      if (images) {
        Array.from(images).forEach(img => body.append("images", img));
      }

      await Fetch.post("/blog", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Blog added successfully!");
      GetBlogs();
      setIsSheetOpen(false);

      // reset
      setFormData({
        title: { en: "", uz: "", ru: "", ch: "" },
        text: { en: "", uz: "", ru: "", ch: "" },
      });
      setImages(null);
      setStep(0);
    } catch {
      toast.error("Error adding blog");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#163555] text-white hover:bg-[#163555]/80">
          Add Blog
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full w-full border-l border-slate-200 bg-white text-slate-950 dark:border-slate-700 dark:bg-[#101f2e] dark:text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl text-slate-950 dark:text-white">New Blog</SheetTitle>
          <SheetDescription>
            Language step:{" "}
            <b className="uppercase text-slate-950 dark:text-white">{currentLang}</b>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 mt-4">
          <div className="space-y-1">
            <Label>Title ({currentLang}) *</Label>
            <Input
              name="title"
              value={formData.title[currentLang]}
              onChange={handleLangChange}
              className={errors.title ? "border-red-500" : ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Text ({currentLang}) *</Label>
            <Textarea
              name="text"
              rows={4}
              value={formData.text[currentLang]}
              onChange={handleLangChange}
              className={errors.text ? "border-red-500" : ""}
            />
          </div>

          {step === 0 && (
            <div className="space-y-1">
              <Label>Choose Image *</Label>
              <Input
                type="file"
                multiple
                onChange={handleImageChange}
                className="file:cursor-pointer file:px-2 file:rounded file:border-0 file:bg-white file:text-black"
              />
              {errors.media && (
                <span className="text-red-500 text-sm">{errors.media}</span>
              )}

              {images && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {Array.from(images).map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      className="w-20 h-20 rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between gap-2 mt-4">
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
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#143b63] text-white hover:bg-[#0f2f4f]"
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
