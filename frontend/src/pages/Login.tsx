import { Navbar } from '../components/landingPage/Navbar';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Loader2 } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { email, password };
            const res = await api.post("/api/token/", payload);

            const accessToken = res.data.access;
            const refreshToken = res.data.refresh;

            const decodedPayload = jwtDecode < JwtPayload > (accessToken);
            const userId = decodedPayload.sub;
            if (userId) {
                localStorage.setItem("user_id", userId);
            }

            localStorage.setItem(ACCESS_TOKEN, accessToken);
            localStorage.setItem(REFRESH_TOKEN, refreshToken);

            const userInfoResponse = await api.get("/api/user-info/");
            localStorage.setItem("user_info", JSON.stringify(userInfoResponse.data));
            const role = userInfoResponse.data.role;
            navigate(`/${role}`);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex flex-grow justify-center items-center bg-background">
                    <Card className="mx-auto max-w-sm w-96 bg-background">
                        <CardHeader>
                            <CardTitle className="text-2xl">Login</CardTitle>
                            <CardDescription>Enter your details below to login.</CardDescription>
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
                                <Button type="submit" className="w-full text-white" disabled={loading}>
                                    {loading ? <Loader2  className="animate-spin" /> : "Login"}
                                </Button>
                            </form>

                            <div className="mt-4 text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link to="/register/" className="underline">Sign up</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default Login;
