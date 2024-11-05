import { ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function ProfilePage() {
    return (
        <>
            <div className="flex gap-8 flex-col ml-24">
                {/* Profile Image */}
                <div className="flex items-center mt-6">
                <Label className="w-36 text-lg font-medium mr-64">Profile Photo</Label>
                    <ChatBubbleAvatar
                        src={null}
                        className="w-24 h-24 mr-3"
                        fallback={'DO'}
                    />
                    <Label className="cursor-pointer text-blue-500 ml-6">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={() => { }} //TODO: Add functionality
                        />
                        Change Profile Image 
                    </Label>
                    <Label className="cursor-pointer text-blue-500 ml-6">
    
                        Clear Image
                    </Label>
                </div>
            </div>
            <div className="w-full">
                <Separator className="my-6 w-11/12 mx-auto" />
            </div>
            <div className="flex gap-8 flex-col ml-24">

                {/* Email and Password */}
                <div className="flex items-center">
                    <Label className="w-36 text-lg font-medium mr-64">Email</Label>
                    <Input className="w-64" placeholder="Enter your email" />
                </div>
                <div className="flex items-center">
                    <Label className="w-36 text-lg font-medium mr-64">Password</Label>
                    <Input className="w-64" placeholder="Enter your password" />
                </div>
            </div>
            <div className="w-full">
                <Separator className="my-4 mt-12 w-11/12 mx-auto" />
            </div>
        </>
    );
}

export default ProfilePage