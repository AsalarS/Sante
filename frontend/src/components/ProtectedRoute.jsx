import { Navigate } from "react-router-dom";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import ErrorPage from "@/pages/errorPage";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function ProtectedRoute({ children, allowedRoles }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Refresh error:", error);
            return false;
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const userInfo = localStorage.getItem('user_info');

        if (!token || !userInfo) {
            console.log("No token or user info found");
            setIsAuthorized(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            // If token will expire in the next 2 minutes or has expired, refresh it
            if (tokenExpiration - now < 120) {
                const refreshSuccess = await refreshToken();
                if (!refreshSuccess) {
                    setIsAuthorized(false);
                    return;
                }
            }

            // Parse user info and set authorization
            const userInfoObject = JSON.parse(userInfo);
            setUserRole(userInfoObject.role);
            setIsAuthorized(true);
        } catch (error) {
            console.error("Authentication error:", error);
            setIsAuthorized(false);
        }
    };

    useEffect(() => {
        // Initial authentication check
        auth();

        // Set up periodic authentication check every minute
        const authInterval = setInterval(auth, 300000);

        return () => clearInterval(authInterval);
    }, []);

    if (isAuthorized === null) {
        return <Loader2 className="animate-spin h-8 w-8 m-auto text-primary" />;
    }

    if (!isAuthorized) {
        return <Navigate to="/login" replace />;
    }
    
    if ((allowedRoles && allowedRoles.includes(userRole)) || userRole === "admin") {
        return children;
    } else {
        toast.error("User unauthorized, redirecting to error page");
        return <ErrorPage error={401} />;
    }
}

export default ProtectedRoute;