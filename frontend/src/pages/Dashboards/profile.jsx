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
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 text-center" viewBox="0 0 100 101" fill="#6c89fe" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span class="sr-only">Loading...</span>
            </div>
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
