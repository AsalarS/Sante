import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api";
import MessageInbox from "@/components/messageInbox";
import MessagesConversation from "@/components/messagesConversation";
import { ACCESS_TOKEN } from "@/constants";
import { toast } from "sonner";

function MessagesPage() {
    const { chatID } = useParams(); // Get chatID from the URL
    const navigate = useNavigate();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const wsRef = useRef(null); // WebSocket reference
    const token = localStorage.getItem(ACCESS_TOKEN);

    const handleSelectConversation = async (chatId) => {
        // Close the existing WebSocket connection if any
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Fetch initial messages from the database
        try {
            const response = await api.get(`/api/chats/${chatId}/messages/`);
            if (response.status === 200) {
                setMessages(response.data.messages || []);
            } else {
                console.error("Failed to fetch messages.");
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast.error("Chat does not exist.");
                navigate(`/${localStorage.getItem('role')}/messages/`);
                  
            } else {
                console.error("Error fetching messages:", error);
            }
            return;
        }

        // Establish a new WebSocket connection for the selected chat
        const ws = new WebSocket(`ws://localhost:8001/ws/chat/${chatId}/?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established for chat:", chatId);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket message:", data);
            if (data.message_text) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: data.id,
                        sender: data.sender,
                        message_text: data.message_text,
                        timestamp: data.timestamp,
                        is_read: data.is_read
                    },
                ]);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        setSelectedConversation(chatId);
        navigate(`/${localStorage.getItem('role')}/messages/${chatId}`);
    };

    // Fetch the logged-in user's info
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await api.get("/api/user-info/");
                if (response.status === 200) {
                    setUserId(response.data.id);
                    setUser(response.data)
                } else {
                    console.error("Failed to fetch current user.");
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchUserId();
    }, []);

    // Automatically select conversation if chatID is present in the URL
    useEffect(() => {
        if (chatID) {
            handleSelectConversation(chatID);
        }
    }, [chatID]);

    return (
        <div className="flex h-screen">
            {/* Inbox Section */}
            {userId ? (
                <MessageInbox
                    onSelectConversation={handleSelectConversation}
                    userId={userId}
                    loading={loading}
                />
            ) : (
                <p>Loading user information...</p>
            )}

            {/* Conversation Section */}
            <div className="flex-grow">
                {chatID ? (
                    <MessagesConversation chatID={chatID} sender={user} messages={messages} ws={wsRef.current} />
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
