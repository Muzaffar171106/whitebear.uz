import type { ProductTypes } from "@/types/RootTypes";
import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface ProductState {
  data: ProductTypes[] | [];
  loading: boolean;
  error: string;
  isAuth: boolean;
}

const initialState: ProductState = {
  data: [],
  loading: false,
  error: "",
  isAuth: false,
};

const ProductSlacer = createSlice({
  name: "Product",
  initialState,
  reducers: {
    setProduct(state, { payload }: PayloadAction<ProductTypes[]>) {
      state.data = payload;
      state.loading = false;
      state.isAuth = true;
      state.error = "";
    },
    setProductLoading(state) {
      state.loading = true;
    },
    setProductError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.loading = false;
      state.isAuth = false;
    },
  },
});

export const { setProduct, setProductLoading, setProductError } = ProductSlacer.actions;
export default ProductSlacer.reducer;
