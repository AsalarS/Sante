import { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { ChatBubbleAvatar } from "./ui/chat/chat-bubble";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/api";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from "./ui/dialog";

function MessageInbox({ conversations, onSelectConversation }) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [inboxSearch, setInboxSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/users/`);
            if (response.status === 200 && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredMessages = conversations.filter(conversation =>
        conversation.name.toLowerCase().includes(inboxSearch.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.last_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Render a single user item
    const renderUser = ({ index, style }) => {
        const user = filteredUsers[index];
        return (
            <li
                key={user.id}
                style={style} // For react-window
                className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border"
                onClick={() => {
                    onSelectConversation(user.id);
                    setIsDialogOpen(false); // Close the dialog
                }}
            >
                <ChatBubbleAvatar
                    src={user.avatar || ""}
                    className="w-12 h-12 mr-3 text-foreground bg-muted"
                    fallback={user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
                />
                <div>
                    <div className="font-semibold text-lg text-foreground line-clamp-1 break-all">
                        {user.first_name + " " + user.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1 break-all">
                        {user.email}
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="w-1/4 h-full border-r bg-background shadow-md flex flex-col border-border sticky top-0">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="relative flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 w-full mr-4">
                    <Input
                        type="text"
                        placeholder="Search Inbox"
                        className="flex-grow rounded-lg appearance-none pl-8 text-xs"
                        value={inboxSearch}
                        onChange={(e) => setInboxSearch(e.target.value)}
                    />
                    <SearchIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-600" />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center">
                            <Edit size={16} className="text-foreground" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border text-foreground">
                        <DialogHeader>
                            <DialogTitle>Start a conversation</DialogTitle>
                            <DialogDescription>Choose a person to start a conversation with.</DialogDescription>
                        </DialogHeader>

                        <Input
                            type="text"
                            placeholder="Search users"
                            className="mb-2"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                        {loading ? (
                            <Loader2 className="animate-spin mx-auto my-4" />
                        ) : (
                            <List
                                height={300} // Height of the visible area
                                itemCount={filteredUsers.length} // Total number of users
                                itemSize={80} // Height of each user item
                                width="100%" // Width of the list
                                className="[&::-webkit-scrollbar]:w-2
                                [&::-webkit-scrollbar-track]:rounded-full
                                [&::-webkit-scrollbar-track]:bg-gray-100
                                [&::-webkit-scrollbar-thumb]:rounded-full
                                [&::-webkit-scrollbar-thumb]:bg-gray-300
                                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                            >
                                {renderUser}
                            </List>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* List Section */}
            <ul className="flex-1 overflow-y-auto overflow-x-hidden">
                {filteredMessages.map((conversation) => (
                    <li
                        key={conversation.id}
                        className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border"
                        onClick={() => onSelectConversation(conversation.id)}
                    >
                        <ChatBubbleAvatar
                            src={conversation.avatar}
                            className="w-12 h-12 mr-3 text-foreground bg-muted"
                            fallback={conversation.name.charAt(0).toUpperCase()}
                        />
                        <div>
                            <div className="font-semibold text-lg text-foreground line-clamp-1 break-all">{conversation.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1 break-all">{conversation.role}</div>
                            <div className="text-sm text-gray-500 truncate line-clamp-1 break-all">{conversation.lastMessage}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MessageInbox;
