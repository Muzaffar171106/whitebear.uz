import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Fetch } from "@/middlewares/Fetch";
import { toast } from "sonner";
import type { CommentTypes, ErrorTypes } from "@/types/RootTypes";
import { useDispatch } from "react-redux";
import { setComment, setCommentError, setCommentLoading } from "@/toolkit/commentSlicer";

interface EditCommentProps {
  comment: CommentTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages = ["en", "uz", "ru", "ch"] as const;

export function EditComment({ comment, open, onOpenChange }: EditCommentProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const currentLang = languages[step];
  const [images, setImages] = useState<FileList | null>(null);

  const [formData, setFormData] = useState<CommentTypes>({
    _id: comment._id,
    name: comment.name,
    job: comment.job,
    text: comment.text,
    image: comment.image,
  });

  useEffect(() => {
    setFormData(comment);
    setImages(null);
    setStep(0);
  }, [comment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: {
        ...prev[name as "name" | "job" | "text"],
        [currentLang]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

  const GetComments = async () => {
    try {
      dispatch(setCommentLoading());
      const response = (await Fetch.get("comment")).data;
      dispatch(setComment(response));
    } catch (error) {
      const err = error as ErrorTypes;
      dispatch(setCommentError(err.response?.data?.message || "Error fetching comments"));
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const body = new FormData();
      body.append("name", JSON.stringify(formData.name));
      body.append("job", JSON.stringify(formData.job));
      body.append("text", JSON.stringify(formData.text));

      if (images) {
        Array.from(images).forEach(img => body.append("images", img));
      }

      await Fetch.put(`/comment/${formData._id}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Comment updated successfully ✅");
      onOpenChange(false);
      GetComments();
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update comment ❌");
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

        <h2 className="text-2xl mb-2">Edit Comment</h2>
        <p className="text-sm text-gray-400 mb-4">
          Language: <b className="uppercase">{currentLang}</b>
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Name ({currentLang})</Label>
            <Input
              name="name"
              value={formData.name[currentLang]}
              onChange={handleChange}
              className="bg-white text-black"
            />
          </div>
          <div>
            <Label>Job ({currentLang})</Label>
            <Input
              name="job"
              value={formData.job[currentLang]}
              onChange={handleChange}
              className="bg-white text-black"
            />
          </div>
          <div>
            <Label>Text ({currentLang})</Label>
            <Textarea
              name="text"
              value={formData.text[currentLang]}
              onChange={handleChange}
              className="bg-white text-black"
              rows={4}
            />
          </div>
          {step === 0 && (
            <div>
              <Label>Image (optional)</Label>
              <Input
                type="file"
                className="file:cursor-pointer file:px-2 file:rounded file:border-0 file:bg-white file:text-black"
                onChange={handleImageChange}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 mt-6">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
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
