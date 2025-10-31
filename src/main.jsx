import React from "react";
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom"; 
import router from "./router/index.jsx"; // 라우팅 설정 

import 'bootstrap/dist/css/bootstrap.min.css';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
