import type {  ServiceTypes } from "@/types/RootTypes";
import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface ServiceState {
  data: ServiceTypes[] | [];
  loading: boolean;
  error: string;
  isAuth: boolean;
}

const initialState: ServiceState = {
  data: [],
  loading: false,
  error: "",
  isAuth: false,
};

const ServiceSlacer = createSlice({
  name: "Service",
  initialState,
  reducers: {
    setService(state, { payload }: PayloadAction<ServiceTypes[]>) {
      state.data = payload;
      state.loading = false;
      state.isAuth = true;
      state.error = "";
    },
    setServiceLoading(state) {
      state.loading = true;
    },
    setServiceError(state, { payload }: PayloadAction<string>) {
      state.error = payload;
      state.loading = false;
      state.isAuth = false;
    },
  },
});

export const { setService,setServiceLoading, setServiceError } = ServiceSlacer.actions;
export default ServiceSlacer.reducer;
