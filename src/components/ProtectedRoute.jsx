// src/components/ProtectedRoute.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({children}) {
    const user = useSelector((state)=> state.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(()=>{
        const restoreSession = ()=>{
            const savedUser = sessionStorage.getItem("user");
            // Redux에 user가 없으면 sessionStorage에서 복원
            if (savedUser && !user) {
                dispatch({
                    type: "USER_INFO",
                    payload: JSON.parse(savedUser),
                });
            }
            // 2️⃣ 복원 시도 후 로딩 종료
            setLoading(false);
        };

        restoreSession();

    }, [dispatch]);

    if (loading) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if(!user) {
        return <Navigate to="/login" replace state={{from: location}} />;
    }

    return children;
}

export default ProtectedRoute;