import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setError, setPending, setUser } from "./toolkit/UserSlicer";
import { lazy, Suspense, useEffect, useMemo } from "react";
import { Fetch } from "./middlewares/Fetch";
import Layout from "./components/layouts/main-layout";
import Loading from "./pages/loading";
import Login from "./pages/login";
import { Error } from "./pages/error";
import type { RootState } from "./store/RootStore";
import type { ErrorTypes } from "./types/RootTypes";
import { setAdmins, setAdminsError, setAdminsLoading } from "./toolkit/adminsSlicer";
import { setBlog, setBlogLoading, setBlogError } from "./toolkit/blogSlicer";
import { setProduct, setProductError, setProductLoading } from "./toolkit/productSlicer";
import { setContact, setContactError, setContactLoading } from "./toolkit/contactsSlicer";

const Admins = lazy(() => import("./pages/admins").then((module) => ({ default: module.Admins })));
const Blog = lazy(() => import("./pages/blog").then((module) => ({ default: module.Blog })));
const Product = lazy(() => import("./pages/product").then((module) => ({ default: module.Product })));
const Contacts = lazy(() => import("./pages/contact").then((module) => ({ default: module.Contacts })));
const Orders = lazy(() => import("./pages/orders").then((module) => ({ default: module.Orders })));
const Dashboard = lazy(() => import("./pages/dashboard"));

function App() {
  const dispatch = useDispatch();
  const { isAuth, isPending, data: currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    async function getMyData() {
      if (!localStorage.getItem("token")) return;

      try {
        dispatch(setPending());
        const response = (await Fetch.get(`admin/get/me`)).data;

        if (response) {
          dispatch(setUser(response));
        } else {
          dispatch(setError("Foydalanuvchi ma'lumotlari topilmadi"));
        }
      } catch (error) {
        const err = error as ErrorTypes;
        dispatch(setError(err.response?.data?.message || "Unknown error"));
      }
    }
    getMyData();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuth) return;

    async function getAdmins() {
      if (currentUser.role !== "superadmin") return;

      try {
        dispatch(setAdminsLoading())
        const response = (await Fetch.get("admin")).data
        dispatch(setAdmins(response))
      } catch (error) {
        const err = error as ErrorTypes;
        dispatch(setAdminsError(err.response?.data?.message || "Unknown error"));
      }
    }
    async function getBlogs() {
      try {
        dispatch(setBlogLoading())
        const response = (await Fetch.get("blog")).data
        dispatch(setBlog(response))
      } catch (error) {
        const err = error as ErrorTypes
        dispatch(setBlogError(err.response?.data?.message || "Error in get all blogs"))
      }
    }

    async function getProduct() {
      try {
        dispatch(setProductLoading())
        const response = (await Fetch.get("product?page=1&limit=200")).data
        dispatch(setProduct(response))
      } catch (error) {
        const err = error as ErrorTypes
        dispatch(setProductError(err.response?.data?.message || "Error in get all products"))
      }
    }
    async function getContacts() {
      try {
        dispatch(setContactLoading())
        const response = (await Fetch.get("contact")).data
        dispatch(setContact(response))
      } catch (error) {
        const err = error as ErrorTypes
        dispatch(setContactError(err.response?.data?.message || "Error in get all stories"))
      }
    }
    getAdmins();
    getBlogs()
    getProduct()
    getContacts()
  }, [dispatch, isAuth, currentUser.role]);

  const router = useMemo(() => {
    if (isPending) {
      return createBrowserRouter([
        {
          path: "*",
          element: <Loading />,
        },
      ]);
    }
    if (isAuth) {
      return createBrowserRouter([
        {
          path: "/",
          element: <Layout />,
          children: [
            {
              index: true,
              path: "/",
              element: <Dashboard />,
            },
            {
              path: "contacts",
              element: <Contacts />,
            },
            {
              path: "blogs",
              element: <Blog />,
            },
            {
              path: "products",
              element: <Product />,
            },
            {
              path: "orders",
              element: <Orders />,
            },
            {
              path: "admins",
              element: <Admins />,
            },
            {
              path: "*",
              element: <Error />,
            },
          ],
        },
      ]);
    } else {
      return createBrowserRouter([
        {
          path: "/",
          element: <Login />,
        },
        {
          path: "*",
          element: <Error />,
        },
      ]);
    }
  }, [isAuth, isPending]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
