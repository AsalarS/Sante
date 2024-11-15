import { DarkModeContext } from "@/components/darkMode";
import { Button } from "@/components/ui/button";
import { ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useContext, useEffect, useState } from "react";
import api from "@/api";
import PhoneInput from '@/components/ui/phoneInput';
import { DatePicker } from "@/components/ui/datePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

function ProfilePage() {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [address, setAddress] = useState("");
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [gender, setGender] = useState("Other");
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/api/user-info/');
                if (response.status === 200) {
                    const userInfoObject = response.data;

                    setUserInfo(userInfoObject);
                    setEmail(userInfoObject.email || '');
                    setFirst_name(userInfoObject.first_name || '');
                    setLast_name(userInfoObject.last_name || '');
                    setAddress(userInfoObject.address || '')
                    setDob(userInfoObject.date_of_birth || '')
                    setPhone(userInfoObject.phone_number || '')
                    setGender(userInfoObject.gender || '')
                } else {
                    console.error('Failed to fetch user info:', response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/api/user-info/', {
                email: email,
                first_name: first_name,
                last_name: last_name,
                address: address,
                phone_number: phone,
                date_of_birth: dob,
                gender: gender,

            });
            if (response.status === 200) {
                const updatedUserInfo = response.data;
                setUserInfo(updatedUserInfo);
            } else {
                console.error('Failed to update user info:', response.statusText);
            }
        } catch (error) {
            if (error.response) {
                console.error('Backend Error:', error.response.data); // Logs backend response
            } else {
                console.error('Request Failed:', error.message);
            }
        }
    };


    if (loading) {
        return (
            <Loader2  className="animate-spin" />
        );
    }

    return (
        <div className="bg-background">
            <div className="flex gap-8 flex-col ml-24">
                {/* Profile Image */}
                <div className="flex items-center mt-6">
                    <Label className="w-36 text-lg font-medium mr-64 text-foreground">Profile Photo</Label>
                    <ChatBubbleAvatar
                        src={null}
                        className="w-24 h-24 mr-3 text-foreground text-3xl bg-muted"
                        fallback={'DO'}
                    />
                    <Label className="cursor-pointer text-blue-500 ml-6">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={() => { }} // TODO: Add functionality
                        />
                        Change Profile Image
                    </Label>
                    <Label className="cursor-pointer text-blue-500 ml-6">
                        Clear Image
                    </Label>
                </div>
            </div>
            <div className="w-full">
                <Separator className="my-12 w-11/12 mx-auto" />
            </div>
            <div className="flex gap-8 flex-col ml-24">
                <Form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Email</Label>
                        <Input
                            className="w-64"
                            placeholder="Enter your email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {/* First Name */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">First Name</Label>
                        <Input
                            className="w-64"
                            placeholder="Enter your first name"
                            value={first_name}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    {/* Last Name */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Last Name</Label>
                        <Input
                            className="w-64"
                            placeholder="Enter your last name"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    {/* BIRTHDAY */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Date of Birth</Label>
                        <DatePicker
                            id="dob"
                            onDateChange={(date) => setDob(format(new Date(date), "yyyy-MM-dd"))}
                            className="w-64"
                            initialValue={new Date(dob)}
                        />
                    </div>
                    {/* ADDRESS */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Address</Label>
                        <Input
                            className="w-64"
                            id="address"
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    {/* PHONE */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Phone Number</Label>
                        <PhoneInput
                            value={phone}
                            className="w-64"
                            onChange={setPhone}
                        />
                    </div>
                    {/* GENDER */}
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Gender</Label>
                        <RadioGroup
                            value={gender}
                            onValueChange={setGender}
                            className="flex text-foreground">
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
                    <Button type="submit" className="mt-4 !mr-64 w-40" onClick={handleSubmit}>Update Information</Button>
                </Form>
            </div>
            <div className="w-full">
                <Separator className="my-12 mt-12 w-11/12 mx-auto" />
            </div>
            <div className="flex gap-8 flex-col ml-24">
                {/* DarkMode */}
                <div className="flex items-center">
                    <Label className="w-36 text-lg font-medium mr-64 text-foreground">Dark Mode</Label>
                    <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
            </div>
            <div className="w-full">
                <Separator className="my-4 mt-12 w-11/12 mx-auto" />
            </div>
        </div>
    );
}

export default ProfilePage;
