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

interface LoginFormProps {
  route: string;
  method: "login" | "register";
}

export function LoginForm({ route, method }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              {/* <Link to="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link> */}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
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
