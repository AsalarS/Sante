import { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { ChatBubbleAvatar } from "./ui/chat/chat-bubble";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from "./ui/dialog";
import { useParams } from "react-router-dom";
import api from "@/api";

function MessageInbox({ onSelectConversation, userId }) {
    const { chatID } = useParams(); // Get chatID from the URL
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [inboxSearch, setInboxSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null);

    // Fetch existing chats for the inbox
    const fetchChats = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/chats/");
            if (response.status === 200) {
                setChats(response.data.chats || []);;

            } else {
                console.error("Failed to fetch chats.");
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error("404: No Chats Available");
            } else {
                console.error("Error fetching chats:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch users for the dialog
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/users/");
            if (response.status === 200) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
        fetchUsers();
    }, []);

    // Function to create a chat and set the selected conversation
    const createAndSelectConversation = async (user2Id) => {
        try {
            // Create a new chat
            const response = await api.post('/api/chats/', { user2_id: user2Id });
            const chatId = response.data.id;

            // Set the selected conversation to the new chat ID
            onSelectConversation(chatId);

            // Optionally, fetch the updated list of chats
            fetchChats();
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const filteredChats = Array.isArray(chats)
        ? chats.filter((chat) =>
            `${chat.user2.first_name} ${chat.user2.last_name}`.toLowerCase().includes(inboxSearch.toLowerCase()) ||
            `${chat.user1.first_name} ${chat.user1.last_name}`.toLowerCase().includes(inboxSearch.toLowerCase())
        )
        : [];

    const filteredUsers = users?.filter((user) =>
        user.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.last_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const renderUser = ({ index, style }) => {
        const user = filteredUsers[index];
        return (
            <li
                key={user.id}
                style={style}
                className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border"
                onClick={() => {
                    createAndSelectConversation(user.id); // Trigger WebSocket on user select
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
                                height={300}
                                itemCount={filteredUsers.length}
                                itemSize={80}
                                width="100%"
                                className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                            >
                                {renderUser}
                            </List>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* List Section */}
            <ul className="flex-1 overflow-y-auto overflow-x-hidden">
                {loading ? (
                    <p className="text-center p-4 text-foreground">Loading chats...</p>
                ) : (
                    filteredChats.map((chat) => {
                        const otherUser = chat.user1.id === userId ? chat.user2 : chat.user1;
                        const isSelected = chat.id === chatID;
                        return (
                            <li
                                key={chat.id}
                                className={`flex items-center p-4 border-b cursor-pointer border-border bg-background hover:bg-btn-hover/50 ${isSelected && 'bg-background-hover/50'}`}
                                onClick={() => onSelectConversation(chat.id)}
                            >
                                <ChatBubbleAvatar
                                    src={otherUser.avatar}
                                    className="w-12 h-12 mr-3 text-foreground bg-muted text-lg font-semibold"
                                    fallback={`${otherUser.first_name.charAt(0).toUpperCase()}${otherUser.last_name.charAt(0).toUpperCase()}`}
                                />
                                <div>
                                    <div className="font-semibold text-lg text-foreground">{otherUser.first_name} {otherUser.last_name}</div>
                                    <div className="text-sm text-muted-foreground">{chat.lastMessage}</div>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
}

export default MessageInbox;