import type {  AdminTypes } from "@/types/RootTypes";
import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface AdminsState {
  data: AdminTypes[] | [];
  loading: boolean;
  error: string;
}

const initialState: AdminsState = {
  data: [],
  loading: false,
  error: "",
};

const AdminsSlacer = createSlice({
  name: "Admins",
  initialState,
  reducers: {
    setAdmins(state, { payload }: PayloadAction<AdminTypes[]>) {
      state.data = payload;
      state.loading = false;
      state.error = "";
    },
    setAdminsLoading(state) {
      state.loading = true;
    },
    setAdminsError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.loading = false;
    },
  },
});

export const { setAdmins,setAdminsLoading, setAdminsError } = AdminsSlacer.actions;
export default AdminsSlacer.reducer;