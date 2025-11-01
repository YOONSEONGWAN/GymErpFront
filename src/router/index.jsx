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

// (선택) 404 페이지가 있다면 임포트해서 사용하세요.
// import NotFound from "../pages/NotFound.jsx";

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
      // 인덱스는 emp로 이동 (원하면 Home으로 바꿔도 됨)
      { index: true, element: <Navigate to="emp" replace /> },

      // 대시보드/홈 (선택적으로 사용)
      { path: "home", element: <Home /> },
      { path: "jongbok", element: <JONGBOKHome /> },

      // 직원
      { path: "emp", element: <EmpList /> },
      { path: "emp/:empNum", element: <EmpDetail /> },
      { path: "emp/edit/:empNum", element: <EmpEdit /> },

      // 근태/휴가 (URL은 소문자-슬래시 규칙로 통일)
      { path: "attendance", element: <EmpAttendanceList /> },      // 전체 근태 목록
      { path: "attendance/my", element: <EmpAttendanceMy /> },     // 내 근태
      { path: "attendance/view", element: <EmpAttendanceView /> }, // 근태 상세/뷰

      // 휴가
      { path: "vacations", element: <EmpVacationList /> },

      // 스케줄
      { path: "schedule", element: <SchedulePage /> },

      // 404 (선택)
      // { path: "*", element: <NotFound /> },
      { path: "*", element: <Navigate to="emp" replace /> },
    ],
  },
]);

export default router;
