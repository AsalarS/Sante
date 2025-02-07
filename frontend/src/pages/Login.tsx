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
import { toast } from 'sonner';
import { PasswordInput } from '@/components/ui/password-input';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const payload = { email, password };
            const res = await api.post("/api/token/", payload);

            const accessToken = res.data.access;
            const refreshToken = res.data.refresh;

            const decodedPayload = jwtDecode<JwtPayload>(accessToken);
            const userId = decodedPayload.sub;

            localStorage.setItem(ACCESS_TOKEN, accessToken);
            localStorage.setItem(REFRESH_TOKEN, refreshToken);

            const userInfoResponse = await api.get("/api/user-info/");
            localStorage.setItem("user_info", JSON.stringify(userInfoResponse.data));
            if (userId) {
                localStorage.setItem("user_id", userId);
            } else {
                localStorage.setItem("user_id", userInfoResponse.data.id);
            }
            const role = userInfoResponse.data.role;
            localStorage.setItem("role", role);
            navigate(`/${role}`);
        } catch (error: any) {
            setLoading(false);
            if (error.response && error.response.status === 401) {
                toast.error("Invalid email or password");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex grow justify-center items-center bg-background">
                    <Card className="mx-auto max-w-sm w-96 bg-background border-foreground/50">
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
                                    <PasswordInput
                                        id="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* <div className="text-center text-sm">
                                    <Link to="/register/" className="underline">Forgot password?</Link>
                                </div> */}
                                <Button type="submit" className="w-full text-white" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin m-auto text-primary" /> : "Login"}
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
