// src/App.jsx
import { Outlet } from "react-router-dom";

function App() {


  return (
    <div>
      {/* 공통 Header */}
      <header className="p-3 bg-dark text-white">
        <div className="container d-flex justify-content-between">
          <h2>🏢 직원관리</h2>
        </div>
      </header>

      {/* 페이지별 내용 */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
