// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App.jsx";
import EmpList from "../pages/EmpList.jsx";
import EmpDetail from "../pages/EmpDetail.jsx";
import EmpEdit from "../pages/EmpEdit.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // 공통 레이아웃
    children: [
      { index: true, element: <Navigate to="emp" replace /> },
      { path: "emp", element: <EmpList /> }, 
      { path: "emp/:empNum", element:<EmpDetail />},
      { path: "emp/edit/:empNum", element:<EmpEdit/>},
    ],
  },
]);

export default router;
