// src/api/axiosConfig.js

import axios from "axios";

axios.defaults.baseURL = "/api"; // 스프링 주손
axios.defaults.withCredentials = true; // 모든 요청에 쿠키 포함

// 요청 인터셉터
axios.interceptors.request.use(
    config => {
        // 요청 전 처리
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 세션 만료 처리
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      const hash = window.location.hash || "#/";
      const isAtLogin = hash === "#/login" || hash.startsWith("#/login");

      if (!isAtLogin) {
        // 사용자가 보던 위치 기억(옵션): HashRouter라 hash를 저장
        sessionStorage.setItem("from", hash.slice(1) || "/");
        sessionStorage.removeItem("user");

        // ✅ HashRouter로 이동 (서버 경로 X)
        window.location.replace("/#/login");
      }
    }

    return Promise.reject(error);
  }
);

export default axios;