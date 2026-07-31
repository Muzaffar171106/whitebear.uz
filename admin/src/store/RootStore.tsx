import { configureStore } from "@reduxjs/toolkit";
import UserSlicer from "../toolkit/UserSlicer";
import BlogSlicer from "../toolkit/blogSlicer";
import ServiceSlicer from "../toolkit/serviceSlicer";
import CommentSlicer from "../toolkit/commentSlicer";
import ContactSlicer from "../toolkit/contactsSlicer";
import AdminsSlacer from "../toolkit/adminsSlicer";
import ProductSlicer from "../toolkit/productSlicer";

export const store = configureStore({
  reducer: {
    user: UserSlicer,
    blog: BlogSlicer,
    service: ServiceSlicer,
    comment: CommentSlicer,
    contact: ContactSlicer,
    product: ProductSlicer,
    admins: AdminsSlacer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
