import type {  CommentTypes } from "@/types/RootTypes";
import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface CommentState {
  data: CommentTypes[] | [];
  loading: boolean;
  error: string;
  isAuth: boolean;
}

const initialState: CommentState = {
  data: [],
  loading: false,
  error: "",
  isAuth: false,
};

const CommentSlacer = createSlice({
  name: "Comment",
  initialState,
  reducers: {
    setComment(state, { payload }: PayloadAction<CommentTypes[]>) {
      state.data = payload;
      state.loading = false;
      state.isAuth = true;
      state.error = "";
    },
    setCommentLoading(state) {
      state.loading = true;
    },
    setCommentError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.loading = false;
      state.isAuth = false;
    },
  },
});

export const { setComment,setCommentLoading, setCommentError } = CommentSlacer.actions;
export default CommentSlacer.reducer;
