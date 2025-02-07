import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api";
import MessageInbox from "@/components/messageInbox";
import MessagesConversation from "@/components/messagesConversation";
import { ACCESS_TOKEN } from "@/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function MessagesPage() {
    const { chatID } = useParams();
    const navigate = useNavigate();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const wsRef = useRef(null);
    const token = localStorage.getItem(ACCESS_TOKEN);

    // Fetch user info on mount
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await api.get("/api/user-info/");
                if (response.status === 200) {
                    setUserId(response.data.id);
                    setUser(response.data);
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchUserId();
    }, []);

    const handleSelectConversation = async (chatId, selectedUserId) => {
        if (!chatId || !selectedUserId) {
            return;
        }
        setLoading(true);

        try {
            // Close existing WebSocket
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            // Fetch messages
            const messagesResponse = await api.get(`/api/chats/${chatId}/messages/`);
            if (messagesResponse.status === 200) {
                setMessages(messagesResponse.data.messages || []);
            }

            // Fetch selected user info if we have their ID
            if (selectedUserId) {
                const userResponse = await api.get(`/api/users/${selectedUserId}/basic`);
                if (userResponse.status === 200) {
                    setSelectedUser(userResponse.data);
                }
            }

            // Initialize WebSocket
            const ws = new WebSocket(`ws://localhost:8001/ws/chat/${chatId}/?token=${token}`);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message_text) {
                    setMessages(prevMessages => [
                        ...prevMessages,
                        {
                            id: data.id,
                            sender_id: data.sender_id,
                            message_text: data.message_text,
                            timestamp: data.timestamp,
                            is_read: data.is_read
                        }
                    ]);
                }
            };

            setSelectedConversation(chatId);
            navigate(`/${localStorage.getItem('role')}/messages/${chatId}`);
        } catch (error) {
            console.error("Error in conversation selection:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-select conversation from URL
    useEffect(() => {
        const autoSelectConversation = async () => {
            if (chatID && userId) {
                try {
                    // First fetch the messages to verify the chat exists
                    const messagesResponse = await api.get(`/api/chats/${chatID}/messages/`);
                    if (messagesResponse.status === 200) {
                        const chatData = messagesResponse.data;
                        // Find a message not sent by the current user to get the other user's ID
                        const messageFromOtherUser = chatData.messages.find(msg => msg.sender_id !== userId);
                        if (messageFromOtherUser) {
                            const otherUserId = messageFromOtherUser.sender_id;
                            handleSelectConversation(chatID, otherUserId);
                        }
                    }
                } catch (error) {
                    toast.error("Error selecting conversation");
                    navigate(`/${localStorage.getItem('role')}/messages`);

                }
            }
        };

        autoSelectConversation();
    }, [chatID, userId]);

    return (
        <div className="flex h-screen">
            {userId ? (
                <MessageInbox
                    onSelectConversation={handleSelectConversation}
                    userId={userId}
                    loading={loading}
                />
            ) : (
                <Loader2 className="animate-spin w-12 h-12 text-primary m-auto" />
            )}

            <div className="grow">
                {user && chatID ? (
                    <MessagesConversation
                        chatID={chatID}
                        sender={user}
                        messages={messages}
                        ws={wsRef.current}
                        selectedUser={selectedUser}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPage;