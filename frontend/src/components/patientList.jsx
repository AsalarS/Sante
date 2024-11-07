import { Filter, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ChatBubbleAvatar } from "./ui/chat/chat-bubble";
import { Input } from "./ui/input";

function PatientList({ conversations, onSelectConversation }) {
    return (
        <>
            <div className="w-1/4 h-screen border-r bg-background overflow-y-auto shadow-md border-border">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="relative flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 w-full mr-4">
                        <Input type="text" placeholder="Search Patiemts" className="flex-grow rounded-lg appearance-none pl-8 text-xs" />
                        <SearchIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-600" />
                    </div>
                    <Button variant="ghost" className="flex items-center">
                        <Filter size={16} className="text-foreground"/>
                    </Button>
                </div>
                <ul>
                    {conversations.map((conversation) => (
                        <li
                            key={conversation.id}
                            className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border"
                            onClick={() => onSelectConversation(conversation.id)}
                        >
                            <ChatBubbleAvatar src={conversation.avatar} className="w-12 h-12 mr-3 text-foreground" fallback={conversation.name.charAt(0).toUpperCase()} />
                            <div>
                                <div className="font-semibold text-lg text-foreground">{conversation.name}</div>
                                <div className="text-sm text-muted-foreground">{conversation.current}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default PatientList;