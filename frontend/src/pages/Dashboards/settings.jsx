import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@/components/ui/switch";
import { ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";

function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const role = localStorage.getItem('role') || '';
    const fallbackInitials = role.slice(0, 2).toUpperCase();

    return (
        <>
            <Tabs defaultValue="Profile" className="w-[400px] p-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Profile">Profile</TabsTrigger>
                    <TabsTrigger value="Theme">Theme</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="Profile" className="w-full">
                    <div className="flex gap-8 flex-col">
                        {/* Profile Image */}
                        <div className="flex items-center mt-6">
                            <ChatBubbleAvatar
                                src={null}
                                className="w-24 h-24 mr-3"
                                fallback={fallbackInitials}
                            />
                            <label className="cursor-pointer text-blue-500">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={() => { }} //TODO: Add
                                />
                                Change Profile Image
                            </label>
                        </div>

                        <div className="w-full">
                            <Separator className="my-6 w-1/2 mx-auto" />
                        </div>

                        {/* Email and Password */}
                        <div className="flex items-center">
                            <Label className="w-24 text-lg font-medium">Email</Label>
                            <Input className="w-46" placeholder="Enter your email" />
                        </div>
                        <div className="flex items-center">
                            <Label className="w-24 text-lg font-medium">Password</Label>
                            <Input className="w-46" placeholder="Enter your password" />
                        </div>
                    </div>
                    <div className="w-full">
                        <Separator className="my-4 mt-12 w-1/2 mx-auto" />
                    </div>
                </TabsContent>

                {/* Theme Tab */}
                <TabsContent value="Theme">

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center gap-4">
                        <Label className="text-lg font-medium">Dark Mode</Label>
                        <Switch checked={isDarkMode} onCheckedChange={() => setIsDarkMode(!isDarkMode)} />
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}

export default SettingsPage;
