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
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";
import type { ErrorTypes } from "@/types/RootTypes";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch } from "react-redux";
import {
  setComment,
  setCommentError,
  setCommentLoading,
} from "@/toolkit/commentSlicer";

const languages = ["en", "uz", "ru", "ch"] as const;
type Lang = (typeof languages)[number];

export function AddComment() {
  const [images, setImages] = useState<FileList | null>(null);
  const [step, setStep] = useState(0);
  const currentLang = languages[step];

  const [formData, setFormData] = useState<{
    name: Record<Lang, string>;
    text: Record<Lang, string>;
    job: Record<Lang, string>;
  }>({
    name: { en: "", uz: "", ru: "", ch: "" },
    text: { en: "", uz: "", ru: "", ch: "" },
    job: { en: "", uz: "", ru: "", ch: "" },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const dispatch = useDispatch();

  const GetComments = async () => {
    try {
      dispatch(setCommentLoading());
      const response = (await Fetch.get("comment")).data;
      dispatch(setComment(response));
    } catch (error) {
      const err = error as ErrorTypes;
      dispatch(
        setCommentError(err.response?.data?.message || "Error getting comments")
      );
    }
  };

  const handleLangChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: { ...prev[name as "name" | "text" | "job"], [currentLang]: value },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name[currentLang]) newErrors.name = "Name is required.";
    if (!formData.job[currentLang]) newErrors.job = "Job is required.";
    if (!formData.text[currentLang]) newErrors.text = "Text is required.";
    if (!images || images.length === 0) newErrors.image = "Image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const body = new FormData();
      body.append("name", JSON.stringify(formData.name));
      body.append("job", JSON.stringify(formData.job));
      body.append("text", JSON.stringify(formData.text));

      if (images) {
        Array.from(images).forEach(img => body.append("images", img));
      }

      await Fetch.post("/comment", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      GetComments();
      toast.success("Comment added successfully!");
      setIsSheetOpen(false);
      setFormData({
        name: { en: "", uz: "", ru: "", ch: "" },
        text: { en: "", uz: "", ru: "", ch: "" },
        job: { en: "", uz: "", ru: "", ch: "" },
      });
      setImages(null);
      setStep(0);
    } catch (error) {
      toast.error("Error adding comment.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#163555] text-white hover:bg-[#163555]/80">
          Add Comment
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full w-full border-l border-slate-200 bg-white text-slate-950 dark:border-slate-700 dark:bg-[#101f2e] dark:text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl text-slate-950 dark:text-white">
            New Comment
          </SheetTitle>
          <SheetDescription>
            Fill comment info and choose <b>image</b>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <p className="text-sm text-gray-400">
            Language: <b className="uppercase">{currentLang}</b>
          </p>

          <div>
            <Label>Name ({currentLang}) *</Label>
            <Input
              name="name"
              value={formData.name[currentLang]}
              onChange={handleLangChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
          </div>

          <div>
            <Label>Job ({currentLang}) *</Label>
            <Input
              name="job"
              value={formData.job[currentLang]}
              onChange={handleLangChange}
              className={errors.job ? "border-red-500" : ""}
            />
            {errors.job && <span className="text-red-500 text-sm">{errors.job}</span>}
          </div>

          <div>
            <Label>Text ({currentLang}) *</Label>
            <Textarea
              name="text"
              value={formData.text[currentLang]}
              onChange={handleLangChange}
              rows={4}
              className={errors.text ? "border-red-500" : ""}
            />
            {errors.text && <span className="text-red-500 text-sm">{errors.text}</span>}
          </div>

          {step === 0 && (
            <div>
              <Label>Image</Label>
              <Input type="file" multiple onChange={handleImageChange} />
              {errors.image && (
                <span className="text-red-500 text-sm">{errors.image}</span>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
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
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
