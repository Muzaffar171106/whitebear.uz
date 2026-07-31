import { useSelector, useDispatch } from "react-redux";
import { Fetch } from "@/middlewares/Fetch";
import { toast } from "sonner";
import { useState } from "react";

import {
  setAdmins,
  setAdminsError,
  setAdminsLoading,
} from "@/toolkit/adminsSlicer";

import type { RootState } from "@/store/RootStore";

import { Loader2, MoreVertical, Trash2 } from "lucide-react";
import type { AdminTypes } from "@/types/RootTypes";

export const Admins = () => {
  const dispatch = useDispatch();
  const UserData = useSelector((state: RootState) => state.user)
  const { data: admins, loading, error } = useSelector(
    (state: RootState) => state.admins
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const refreshAdmins = async () => {
    try {
      dispatch(setAdminsLoading());
      const response = (await Fetch.get("admin")).data;
      dispatch(setAdmins(response));
    } catch (err) {
      dispatch(setAdminsError("Adminlarni yuklashda xatolik"));
      console.error(err);
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      await Fetch.delete(`admin/${id}`);
      toast.success("Admin o‘chirildi");
      refreshAdmins();
    } catch (err) {
      toast.error("O‘chirishda xatolik");
      console.log(err);
    }
  };

  if (error || UserData.error)
    return (
      <div className="p-6 text-center  text-destructive bg-white rounded-md shadow-lg min-h-[calc(100vh-70px)]">
        Adminlarni olishda xatolik yuz berdi
      </div>
    );

  if (loading || UserData.isPending)
    return (
      <div className="flex items-center bg-white justify-center  rounded-md shadow-lg h-[calc(100vh-70px)]">
        <Loader2 className="animate-spin text-cyan-600" size={30} />
      </div>
    );
  const user = UserData.data as AdminTypes
  return (
    <div className="p-4 bg-white rounded-md shadow-lg min-h-[calc(100vh-70px)]">
      {admins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin: AdminTypes) => (
            <div key={admin._id} className="p-4 border rounded-md relative hover:shadow transition">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{admin.firstName}</h3>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                  <p className="text-xs text-gray-400">{admin.role?.toUpperCase()}</p>
                </div>

                {user.role === "superadmin" && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === admin._id ? null : admin._id)}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === admin._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md p-2 border z-20">
                        <button
                          onClick={() => deleteAdmin(admin._id)}
                          className="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-2 py-1 rounded-md"
                        >
                          <Trash2 size={16} /> O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      ) : (
        <div className="text-center text-slate-600 py-8">
          Hozircha adminlar mavjud emas
        </div>
      )}
    </div>
  );
};

