import type { ContactTypes } from "@/types/RootTypes";
import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface ContactState {
  data: ContactTypes[] | [];
  loading: boolean;
  error: string;
  isAuth: boolean;
}

const initialState: ContactState = {
  data: [],
  loading: false,
  error: "",
  isAuth: false,
};

const ContactSlacer = createSlice({
  name: "Contact",
  initialState,
  reducers: {
    setContact(state, { payload }: PayloadAction<ContactTypes[]>) {
      state.data = payload;
      state.loading = false;
      state.isAuth = true;
      state.error = "";
    },
    setContactLoading(state) {
      state.loading = true;
    },
    setContactError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.loading = false;
      state.isAuth = false;
    },
  },
});

export const { setContact, setContactLoading, setContactError } = ContactSlacer.actions;
export default ContactSlacer.reducer;
