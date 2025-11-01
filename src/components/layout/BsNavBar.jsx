import axios from 'axios';
import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';

function BsNavBar() {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user") || "null");

    const handleLogout = async()=>{
        try {
            await axios.post("/v1/emp/logout");
            console.log("로그아웃 완료");
        } catch(err) {
            console.warn("logout failed: " + err);
        } finally {
            sessionStorage.removeItem("user");
            navigate("/login", {replace: true})
        }
    };

    return (
        <Navbar fixed="top" bg="secondary" variant="dark" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand as={NavLink} to="/">GYM</Navbar.Brand>
                    {user && (
                        <div className="ms-auto d-flex align-items-center gap-3 text-white">
                            <span className="fw-semibold">
                                <i className="bi bi-person-circle me-2"/>
                                {user.empName} ({user.role})
                            </span>
                            <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
                                <i className="bi bi-box-arrow-right me-1"/>
                                로그아웃
                            </button>
                        </div>
                    )}
            </Container>
        </Navbar>
    );
}

export default BsNavBar;