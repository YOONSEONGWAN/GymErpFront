// src/App.jsx

import 'bootstrap/dist/css/bootstrap.css'
import "bootstrap-icons/font/bootstrap-icons.css";

import './App.css'

import { useOutlet } from 'react-router-dom';
import BsNavBar from './components/layout/BsNavBar';
import BsSideBar from './components/layout/BsSideBar';

function App() {

  const currentOutlet = useOutlet();

  return (
    <>
      {/* 상단 네비바 */}
      <BsNavBar />
      {/* 네비바 높이만큼 전체 아래로 밀기 */}
      <div className="container-fluid" style={{paddingTop: "56px"}}>
        <div className="row">
          {/* 사이드바 */}
          <div className="col-auto p-0">
            <BsSideBar />
          </div>
          {/* 메인 컨텐츠 */}
          <div className="col">
            <div className="container" style={{marginTop:"20px"}}>
              {currentOutlet}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
