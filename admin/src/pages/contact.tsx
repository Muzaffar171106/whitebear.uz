import { useSelector, useDispatch } from "react-redux";
import { Fetch } from "@/middlewares/Fetch";
import { toast } from "sonner";
import { useState } from "react";


import type { RootState } from "@/store/RootStore";

import { Loader2, MoreVertical, Trash2, Pen } from "lucide-react";
import type { ContactTypes } from "@/types/RootTypes";
import { setContact, setContactError, setContactLoading } from "@/toolkit/contactsSlicer";
import { EditContact } from "@/modules/EditContact";

export const Contacts = () => {
  const dispatch = useDispatch();

  const { data: contacts, loading, error } = useSelector(
    (state: RootState) => state.contact
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<ContactTypes | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshContacts = async () => {
    try {
      dispatch(setContactLoading());
      const response = (await Fetch.get("/contact")).data;
      dispatch(setContact(response));
    } catch (err) {
      dispatch(setContactError("Kontaktlarni yuklashda xatolik"));
      console.error(err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      setDeletingId(id);
      await Fetch.delete(`/contact/${id}`);
      toast.success("Contact deleted successfully");
      refreshContacts();
    } catch (err) {
      toast.error("Error occurred while deleting contact");
      console.log(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditContact = (contact: ContactTypes) => {
    setEditingContact(contact);
    setOpenMenuId(null);
  };

  if (error)
    return (
      <div className="p-6 text-center  text-destructive bg-white rounded-md shadow-lg min-h-[calc(100vh-70px)]">
        Kontaktlarni olishda xatolik yuz berdi
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center bg-white justify-center  rounded-md shadow-lg h-[calc(100vh-70px)]">
        <Loader2 className="animate-spin text-cyan-600" size={30} />
      </div>
    );

  return (
    <>
      <EditContact
        contact={
          editingContact ?? {
            _id: "",
            name: "",
            website: "",
            email: "",
            message: "",
          }
        }
        open={Boolean(editingContact)}
        onOpenChange={(open) => {
          if (!open) setEditingContact(null);
        }}
        onSaved={refreshContacts}
      />

      <div className="p-4 bg-white rounded-md shadow-lg min-h-[calc(100vh-70px)]">
        {contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(({ email, name, website, message, _id }: ContactTypes) => (
              <div
                key={_id}
                className="p-4 border rounded-md relative hover:shadow transition"
              >
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">{name}</h3>

                  <div className="relative">
                    <button
                      className="p-1 rounded hover:bg-gray-200"
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === _id ? null : (_id ?? null)
                        )
                      }
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === _id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md p-2 border z-20">
                        <button
                          onClick={() => handleEditContact({ _id, name, website, email, message })}
                          className="mb-1 flex items-center gap-2 text-slate-700 hover:bg-slate-100 w-full px-2 py-1 rounded-md"
                        >
                          <Pen size={16} /> Edit
                        </button>
                        <button
                          onClick={() => deleteContact(_id)}
                          disabled={deletingId === _id}
                          className="flex items-center gap-2 text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:hover:bg-transparent w-full px-2 py-1 rounded-md"
                        >
                          <Trash2 size={16} />
                          {deletingId === _id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-2">
                  Email: {email}
                </p>
                <p className="text-sm text-slate-600">
                  Website: {website}
                </p>
                <p className="text-sm text-slate-600">
                  Message: {message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-600 py-8">
            There are no contacts yet.
          </div>
        )}
      </div>
    </>
  )
}
