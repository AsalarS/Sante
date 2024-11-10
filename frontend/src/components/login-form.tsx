import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface LoginFormProps {
  route: string;
  method: "login" | "register";
}

export function LoginForm({ route, method }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // State to hold the selected role
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare request payload based on the method
      const payload = method === "register"
        ? { email, password, role }
        : { email, password };

      const res = await api.post(route, payload);

      if (method === "login") {
        const accessToken = res.data.access;
        const refreshToken = res.data.refresh;

        // Decode the JWT to get the user's ID (sub) and other info
        const decodedPayload = jwtDecode<JwtPayload>(accessToken);

        // You can store the decoded payload directly if needed
        const userId = decodedPayload.sub; // Standard JWT claim
        if (userId) {
          localStorage.setItem("user_id", userId);  // Save the user ID in localStorage
        }

        // Set the access and refresh tokens in localStorage
        localStorage.setItem(ACCESS_TOKEN, accessToken);
        localStorage.setItem(REFRESH_TOKEN, refreshToken);

        // Fetch additional user info (like role) from the backend using the access token
        const userInfoResponse = await api.get("/api/user-info/");

        // Save the user info to localStorage (including the role, email, etc.)
        localStorage.setItem("user_info", JSON.stringify(userInfoResponse.data));

        // Extract the role from the user info
        const role = userInfoResponse.data.role;

        // Redirect to the dashboard based on the user's role
        navigate(`/${role}`);
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="mx-auto max-w-sm w-96">
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>
          Enter your details below to {method === "login" ? "login" : "register"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role selection dropdown (only for registration) */}
          {method === "register" && (
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="p-2 border rounded-md"
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : name}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to={method === "login" ? "/register/" : "/login/"} className="underline">
            {method === "login" ? "Sign up" : "Login"}
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          Go {" "}
          <Link to="/" className="underline">
            Home
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

//TODO: Add UI error messages for user
//TODO: Redirect to dashboard if user registered or logged in