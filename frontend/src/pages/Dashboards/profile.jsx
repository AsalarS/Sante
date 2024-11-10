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

function ProfilePage() {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
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
                    setFirstName(userInfoObject.first_name || '');
                    setLastName(userInfoObject.last_name || '');
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
                first_name: firstName,
                last_name: lastName
            });
            if (response.status === 200) {
                const updatedUserInfo = response.data;
                setUserInfo(updatedUserInfo);
                console.log('Updated Information:', updatedUserInfo);
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
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-background">
            <div className="flex gap-8 flex-col ml-24">
                {/* Profile Image */}
                <div className="flex items-center mt-6">
                    <Label className="w-36 text-lg font-medium mr-64 text-foreground">Profile Photo</Label>
                    <ChatBubbleAvatar
                        src={null}
                        className="w-24 h-24 mr-3 text-foreground text-3xl"
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
                    {/* Personal Information */}
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
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">First Name</Label>
                        <Input
                            className="w-64"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center">
                        <Label className="w-36 text-lg font-medium mr-64 text-foreground">Last Name</Label>
                        <Input
                            className="w-64"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
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
