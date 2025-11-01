// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App.jsx";
import EmpList from "../pages/EmpList.jsx";
import EmpDetail from "../pages/EmpDetail.jsx";
import EmpEdit from "../pages/EmpEdit.jsx";
import EmpAttendanceMy from "../pages/EmpAttendance/myAttendance.jsx";
import EmpAttendanceView from "../pages/EmpAttendance/viewAttendance.jsx";
import EmpAttendanceList from "../pages/EmpAttendance/list.jsx";
import EmpVacationList from "../pages/EmpVacation/list.jsx";
import JONGBOKHome from "../pages/JONGBOKHome.jsx";
import SchedulePage from "../pages/SchedulePage.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // 공통 레이아웃
    children: [
      { index: true, element: <Navigate to="emp" replace /> },
      { path: "emp", element: <EmpList /> },
      { path: "emp/:empNum", element: <EmpDetail /> },
      { path: "emp/edit/:empNum", element: <EmpEdit /> },
      { path: "/EmpvacationList", element: <EmpVacationList /> },
      { path: "/EmpattendanceList", element: <EmpAttendanceList /> },
      { path: "/EmpAttendanceMy", element: <EmpAttendanceMy /> },
      { path: "/EmpAttendanceView", element: <EmpAttendanceView /> },
      { path: "/JONGBOKHome", element: <JONGBOKHome /> },
      { path: "schedule", element: <SchedulePage /> },
    ],
  },
]);

export default router;
