import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Navbar } from "../components/landingPage/Navbar";
import api from "../api";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PhoneInput from '@/components/ui/phoneInput';
import { DatePicker } from '@/components/ui/datePicker';
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isEmail } from "@/utility/validators";

// TODO: change this so that only a patien can register before submission
const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [address, setAddress] = useState("");
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [gender, setGender] = useState("Other");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleEmailChange = (value: string) => {
        setEmail(value);
        const error = isEmail(value);
        setEmailError(error);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check email validation before submitting
        if (emailError) {
            toast.error("Invalid Email.");
            return;
        }

        setLoading(true);
        const trimmedPayload = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            address: address.trim(),
            password,
            date_of_birth: dob,
            phone_number: phone,
            role,
            gender,
        };

        try {
            await api.post("/api/user/register/", trimmedPayload);
            navigate("/login");
        } catch (error) {
            console.error("Error response:", (error as any).response);
            if (error instanceof Error && (error as any).response) {
                toast.error("Error " + (error as any).response.status + ": " + (error as any).response.data.error);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex flex-grow justify-center items-center bg-background">
                    <Card className="mx-auto max-w-lg bg-background border-foreground/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">Register</CardTitle>
                            <CardDescription>Enter your details below to register.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                {/* EMAIL */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* PASSWORD */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {/* First Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        placeholder="First Name"
                                        value={first_name}
                                        onChange={(e) => setFirst_name(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Last Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        placeholder="Last Name"
                                        value={last_name}
                                        onChange={(e) => setLast_name(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* BIRTHDAY */}
                                <div className="grid gap-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <DatePicker
                                        id="dob"
                                        onDateChange={(date) => setDob(date)}
                                    />
                                </div>
                                {/* ADDRESS */}
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        placeholder="Address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* PHONE */}
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <PhoneInput
                                        value={phone}
                                        onChange={setPhone}
                                    />
                                </div>
                                {/* GENDER */}
                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <RadioGroup
                                        value={gender}
                                        onValueChange={setGender}
                                        className="flex mt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Male" id="male" />
                                            <Label htmlFor="male">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Female" id="female" />
                                            <Label htmlFor="female">Female</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Other" id="other" />
                                            <Label htmlFor="other">Other</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {/* ROLE DDL */}
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                        className="p-2 border rounded-md bg-background w-full"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="patient">Patient</option>
                                        <option value="admin">Admin</option>
                                        <option value="nurse">Nurse</option>
                                        <option value="receptionist">Receptionist</option>
                                    </select>
                                </div>
                                {/* SUBMIT BUTTON */}
                                <Button type="submit" className="w-full col-span-1 md:col-span-2 text-white" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin m-auto text-primary" /> : "Register"}
                                </Button>
                            </form>

                            <div className="mt-4 text-center text-sm">
                                Already have an account?{" "}
                                <Link to="/login/" className="underline">Login</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Register;
