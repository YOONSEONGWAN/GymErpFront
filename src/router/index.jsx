// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "../App.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";
import EmpList from "../pages/EmpList.jsx";
import EmpDetail from "../pages/EmpDetail.jsx";
import EmpEdit from "../pages/EmpEdit.jsx";

import EmpAttendanceMy from "../pages/EmpAttendance/myAttendance.jsx";
import EmpAttendanceView from "../pages/EmpAttendance/viewAttendance.jsx";
import EmpAttendanceList from "../pages/EmpAttendance/list.jsx";
import EmpVacationList from "../pages/EmpVacation/list.jsx";
import JONGBOKHome from "../pages/JONGBOKHome.jsx";
import SchedulePage from "../pages/SchedulePage.jsx";
import ProductList from "../pages/Product/ProductList.jsx";
import MemberList from "../pages/MemberList.jsx";
import MemberDetail from "../pages/MemberDetail.jsx";
import MemberEdit from "../pages/MemberEdit.jsx";
import PostList from "../pages/PostList.jsx";
import PostView from "../pages/PostView.jsx";
import PostEdit from "../pages/PostEdit.jsx";
import PostAdd from "../pages/PostAdd.jsx";
import SalesItemList from "../pages/Sales/SalesItemList.jsx";
import SalesItemCreate from "../pages/Sales/SalesItemCreate.jsx";
import StockInbound from "../pages/Product/StockInbound.jsx";
import ProductCreate from "../pages/Product/ProductCreate.jsx";
import ProductUpdate from "../pages/Product/ProductUpdate.jsx"
import StockList from "../pages/Product/StockList.jsx";


const router = createBrowserRouter([
  // 1) 루트 경로 - /home으로 리다이렉트
  {
    path: "/",
    element: <Navigate to="/home" replace />
  },

  // 2) 로그인 (비보호)
  {
    path: "/login",
    element: (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <Login />
      </div>
    ),
    errorElement: <div>로그인 페이지 에러</div>
  },

  // 3) 메인 앱 (보호)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <div>Route 에러</div>,
    children: [
      { path: "home", element: <Home /> },
      { path: "jongbok", element: <JONGBOKHome /> },
      { path: "emp", element: <EmpList /> },
      { path: "emp/:empNum", element: <EmpDetail /> },
      { path: "emp/edit/:empNum", element: <EmpEdit /> },
      { path: "attendance", element: <EmpAttendanceList /> },
      { path: "attendance/my", element: <EmpAttendanceMy /> },
      { path: "attendance/view", element: <EmpAttendanceView /> },
      { path: "vacations", element: <EmpVacationList /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "product", element: <ProductList /> },
      { path: "productList", element: <ProductList /> },
      { path: "product/create", element: <ProductCreate /> },
      { path: "product/edit/:productId", element: <ProductUpdate /> },
      { path: "service/edit/:serviceId", element: <ProductUpdate /> },
      { path: "stock/inbound", element: <StockInbound /> },
      { path: "member", element: <MemberList /> },
      { path: "member/:memNum", element: <MemberDetail /> },
      { path: "member/edit/:memNum", element: <MemberEdit /> },
      { path: "post", element: <PostList /> },
      { path: "post/:postId", element: <PostView /> },
      { path: "post/new", element: <PostAdd /> },
      { path: "post/edit/:postId", element: <PostEdit /> },
      { path: "sales/salesitemlist", element: <SalesItemList /> },
      { path: "sales/salesitemcreate", element: <SalesItemCreate /> },
      { path: "stock", element: <StockList/> },
    ],
  },
]);

export default router;
