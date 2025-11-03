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



import ProdcutList from "../pages/Product/ProductList.jsx";


const router = createBrowserRouter([
  // 1) 로그인 (비보호)
  {
    path: "/login",
    element: (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <Login />
      </div>
    ),
  },

  // 2) 메인 앱 (보호)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
      { path: "schedule/:empNum", element: <SchedulePage /> },
      { path: "productList", element: <ProdcutList /> },
      

    ],
  },
]);

export default router;
