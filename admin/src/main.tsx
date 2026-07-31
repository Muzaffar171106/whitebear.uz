import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/RootStore.tsx";
import { Toaster } from "sonner";
import { initializeTheme } from "./lib/theme.ts";

initializeTheme();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Toaster position="top-center" duration={1500} richColors />
      <App />
  </Provider>
);
