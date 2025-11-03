import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function DropdownMenu({ icon, title, children}) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <li className="nav-item">
            <button className="nav-link text-white fs-6 w-100 text-start border-0" onClick={() => setIsOpen(!isOpen)} style={{background: 'transparent'}}>
                <i className={`bi bi-${icon}`}></i>
                <span className="ms-2">{title}</span>
                <i className={`bi bi-chevron-${isOpen ? 'down' : 'right'} float-end`}></i>
            </button>

            <div className={`collapse ${isOpen ? 'show' : ''}`}>
                <ul className="nav flex-column ms-3">
                    {children}
                </ul>
            </div>
        </li>
    );
}

// 서브 메뉴 아이템
function SubMenuItem({ to, icon, text}) {
  return (
    <li className="nav-item">
      <NavLink to={to} className={({isActive}) => `nav-link text-white fs-6 py-2 ${isActive ? 'active' : ''}`}>
        <i className={`bi bi-${icon}`}></i>
        <span className="ms-2">{text}</span>
      </NavLink>
    </li>
  )
}

function BsSideBar() {
  return (
    <div className="bg-dark min-vh-100" style={{width: "250px"}}>
      <div className="p-3">
        <NavLink to="/" className="text-decoration-none text-white d-flex align-items-center mb-4">
          <span className="fs-4 fw-bold">Gym</span>
        </NavLink>

        <ul className="nav nav-pills flex-column gap-2">
          {/* 일반 메뉴 */}
          <li className="nav-item">
            <NavLink to="/" end className={({isActive}) => 
                `nav-link text-white fs-6 ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-speedometer2"></i>
              <span className="ms-2">Dashboard</span>
            </NavLink>
          </li>

          {/* 드롭다운 메뉴 */}
          <DropdownMenu icon="people" title="직원관리">
            <SubMenuItem to="/emp" icon="table" text="직원목록"/>
          </DropdownMenu>
          <DropdownMenu icon="people-fill" title="회원관리">
            <SubMenuItem to="/member" icon="table" text="회원목록" />
          </DropdownMenu>

           {/* 게시판 */}
          <DropdownMenu icon="card-text" title="게시판" basePath="/post">
            <SubMenuItem to="/post" icon="list-ul" text="게시글 목록" />
          </DropdownMenu>

        </ul>
      </div>
    </div>
  );
}



export default BsSideBar;