import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useUserStore } from "./store/useUserStore";
import { Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Loading from "./components/Loading";
import { useThemeStore } from "./store/useThemeStore";

const Login = lazy(() => import("./auth/Login"));
const Signup = lazy(() => import("./auth/Signup"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./auth/VerifyEmail"));
const HereSection = lazy(() => import("./components/HereSection"));
const MainLayout = lazy(() => import("./layout/MainLayout"));
const Profile = lazy(() => import("./components/Profile"));
const SearchPage = lazy(() => import("./components/SearchPage"));
const RestaurantDetail = lazy(() => import("./components/RestaurantDetail"));
const Cart = lazy(() => import("./components/Cart"));
const Restaurant = lazy(() => import("./admin/Restaurant"));
const AddMenu = lazy(() => import("./admin/AddMenu"));
const Orders = lazy(() => import("./admin/Orders"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Success = lazy(() => import("./components/Success"));

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingAuth, user } = useUserStore();
  if (isCheckingAuth) return <Loading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingAuth, user } = useUserStore();
  if (isCheckingAuth) return <Loading />;
  if(isAuthenticated && user?.isVerified){
    return <Navigate to="/" replace/>
  }
  return children;
};

const AdminRoute = ({children}:{children:React.ReactNode}) => {
  const {user, isAuthenticated, isCheckingAuth} = useUserStore();
  if (isCheckingAuth) return <Loading />;
  if(!isAuthenticated){
    return <Navigate to="/login" replace/>
  }
  if(!user?.isVerified){
    return <Navigate to="/verify-email" replace/>
  }
  if(!user?.admin){
    return <Navigate to="/" replace/>
  }

  return children;
}

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HereSection />,
      },
      {
        path: "/profile",
        element: <ProtectedRoutes><Profile /></ProtectedRoutes>,
      },
      {
        path: "/search/:text",
        element: <SearchPage />,
      },
      {
        path: "/restaurant/:id",
        element: <RestaurantDetail />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order/status",
        element: <ProtectedRoutes><Success /></ProtectedRoutes>,
      },
      // admin services start from here
      {
        path: "/admin",
        element: <AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>,
      },
      {
        path: "/admin/restaurant",
        element:<AdminRoute><AdminLayout><Restaurant /></AdminLayout></AdminRoute>,
      },
      {
        path: "/admin/menu",
        element:<AdminRoute><AdminLayout><AddMenu /></AdminLayout></AdminRoute>,
      },
      {
        path: "/admin/orders",
        element:<AdminRoute><AdminLayout><Orders /></AdminLayout></AdminRoute>,
      },
    ],
  },
  {
    path: "/login",
    element:<AuthenticatedUser><Login /></AuthenticatedUser>,
  },
  {
    path: "/signup",
    element:<AuthenticatedUser><Signup /></AuthenticatedUser> ,
  },
  {
    path: "/forgot-password",
    element: <AuthenticatedUser><ForgotPassword /></AuthenticatedUser>,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
]);

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const checkAuthentication = useUserStore((state) => state.checkAuthentication);
  // checking auth every time when page is loaded
  useEffect(()=>{
    checkAuthentication();
    initializeTheme();
  }, [checkAuthentication, initializeTheme])

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={appRouter} />
    </Suspense>
  );
}

export default App;
