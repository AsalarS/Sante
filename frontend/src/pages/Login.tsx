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
import { Loader2, User, Stethoscope, UserCog, ClipboardList, HeartPulse } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/ui/password-input';

interface DemoUserCardProps {
    title: string;
    email: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
}

function DemoUserCard({ title, email, icon, onClick }: DemoUserCardProps) {
    const Icon = icon;
    return (
        <div 
            onClick={onClick}
            className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
        >
            <Icon className="h-8 w-8 mb-2" />
            <h3 className="font-medium text-sm">{title}</h3>
        </div>
    );
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    interface DemoUser {
        title: string;
        email: string;
        password: string;
        icon: React.ComponentType<{ className?: string }>;
    }
    
    const demoUsers: DemoUser[] = [
        { title: "Admin", email: "admin1@gmail.com", password: "admin1@gmail.com", icon: UserCog },
        { title: "Doctor", email: "doctor1@gmail.com", password: "doctor1@gmail.com", icon: Stethoscope },
        { title: "Patient", email: "patient1@gmail.com", password: "patient1@gmail.com", icon: User },
        { title: "Receptionist", email: "receptionist1@gmail.com", password: "receptionist1@gmail.com", icon: ClipboardList },
        { title: "Nurse", email: "nurse1@gmail.com", password: "nurse1@gmail.com", icon: HeartPulse },
    ];

    const selectDemoUser = (demoUser: DemoUser) => {
        setEmail(demoUser.email);
        setPassword(demoUser.password);
    };

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

            const decodedPayload = jwtDecode(accessToken);
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
                    <div className="max-w-xl w-full px-4">
                        <Card className="bg-background border-foreground/50 mb-4">
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
                        
                        <Card className="bg-background border-foreground/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Demo Users</CardTitle>
                                <CardDescription>Click to autofill credentials</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {demoUsers.map((user) => (
                                        <DemoUserCard
                                            key={user.email}
                                            title={user.title}
                                            email={user.email}
                                            icon={user.icon}
                                            onClick={() => selectDemoUser(user)}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;