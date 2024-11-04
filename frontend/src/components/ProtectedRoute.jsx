import { Navigate } from "react-router-dom";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });

            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded); //debug
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            
            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthorized(true);
            }

            setUserRole(decoded.role);
        } catch (error) {
            console.log("Invalid token", error);
            setIsAuthorized(false);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    if (isAuthorized && allowedRoles.includes(userRole)) {
        return children;
    } else {
        console.log("Youre Unauthorized")
        return <Navigate to="/login" />; //TODO: Add unathorized page here
    }
}

export default ProtectedRoute;

//TODO: Add an unathorized page