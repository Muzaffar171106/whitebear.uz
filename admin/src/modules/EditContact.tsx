import { type ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fetch } from "@/middlewares/Fetch";
import { toast } from "sonner";
import type { ContactTypes, ErrorTypes } from "@/types/RootTypes";

interface EditContactProps {
    contact: ContactTypes;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}

export function EditContact({ contact, open, onOpenChange, onSaved }: EditContactProps) {
    const [formData, setFormData] = useState<ContactTypes>({
        _id: contact._id,
        name: contact.name,
        website: contact.website,
        email: contact.email,
        message: contact.message,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(contact);
    }, [contact]);

    if (!open) return null;

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData._id) return;

        setLoading(true);
        try {
            await Fetch.put(`/contact/${formData._id}`, {
                name: formData.name,
                email: formData.email,
                website: formData.website,
                message: formData.message,
            });
            toast.success("Contact updated successfully");
            onOpenChange(false);
            onSaved();
        } catch (error) {
            console.error(error);
            const err = error as ErrorTypes;
            toast.error(err?.response?.data?.message || "Error occurred while updating contact");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Edit Contact</h2>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                        Close
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Name</label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-2 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <Input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-2 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Website</label>
                        <Input
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="mt-2 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Message</label>
                        <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            className="mt-2 bg-white text-slate-900"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
