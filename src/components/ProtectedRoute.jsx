// src/components/ProtectedRoute.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({children}) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(()=>{
        const checkSession = async ()=>{
            try {
                const response = await axios.get("/v1/emp/list", {
                    withCredentials: true
                });
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.log("Session check failed: ", err.response?.status);
                setIsAuthenticated(false);
            } finally{
                setLoading(false);
            }
        };

        checkSession();
    }, [location.pathname]); // 경로 변경 시마다 체크

    if (loading) {

        return (
            <div className="vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );

    }

    if(!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}} />;
    }

    return children;
}

export default ProtectedRoute;