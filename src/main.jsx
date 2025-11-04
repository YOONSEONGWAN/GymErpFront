// src/main.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
// SPA 를 구현하기 위한 RouterProvider 를 import
import { RouterProvider } from "react-router-dom"; 
import router from "./router"; // 라우팅 설정 
import './api/axiosConfig' // axios 설정 import
import { createStore } from "redux";
import { Provider } from "react-redux";

// redux store 관련된 로직 store.js 로 묶을까 고민중

// redux store 에서 관리될 state 의 초기값
const initState = { 
  user: null, logoutTimer: null 
};

// reducer 함수에서 사용할 handler object
const handlers = {
  USER_INFO: (state, action) => ({
    ...state,
    user: action.payload // 로그인 / 사용자 정보 저장
  }),

  USER_LOGOUT: (state)=>({
    ...state,
    user: null,
    logoutTimer: null
  }),

  LOGOUT_TIMER: (state, action) => ({
    ...state,
    logoutTimer: action.payload
  })
};

// handler object 를 사용하는 새로운 reducer 함수
const reducer = (state=initState, action) => {
  // 전달된 action 을 수행할 handler 함수를 얻어낸다
  const handler = handlers[action.type];
  // handler 함수가 존재한다면 handler 함수가 리턴하는 state 를 리턴하고 아니면
  // 원래 state 를 리턴한다.
  return handler ? handler(state, action) : state;
}


// 세션 → Redux 초기 하이드레이션(1회)
function loadUserFromSession() {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && u.empNum ? u : null;
  } catch { return null; }
}

const preloadedState = { ...initState, user: loadUserFromSession() };

const store = createStore(reducer, preloadedState);

// Redux → 세션 미러링
store.subscribe(() => {
  const { user } = store.getState();
  if (user) sessionStorage.setItem("user", JSON.stringify(user));
  else sessionStorage.removeItem("user");
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);