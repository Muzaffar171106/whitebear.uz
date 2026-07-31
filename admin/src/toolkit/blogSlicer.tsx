import type {  BlogTypes } from "@/types/RootTypes";
import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface BlogState {
  data: BlogTypes[] | [];
  loading: boolean;
  error: string;
  isAuth: boolean;
}

const initialState: BlogState = {
  data: [],
  loading: false,
  error: "",
  isAuth: false,
};

const BlogSlacer = createSlice({
  name: "Blog",
  initialState,
  reducers: {
    setBlog(state, { payload }: PayloadAction<BlogTypes[]>) {
      state.data = payload;
      state.loading = false;
      state.isAuth = true;
      state.error = "";
    },
    setBlogLoading(state) {
      state.loading = true;
    },
    setBlogError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.loading = false;
      state.isAuth = false;
    },
  },
});

export const { setBlog,setBlogLoading, setBlogError } = BlogSlacer.actions;
export default BlogSlacer.reducer;
