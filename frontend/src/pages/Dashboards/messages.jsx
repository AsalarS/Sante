import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // To access chatID in the URL
import api from "@/api";
import MessageInbox from "@/components/messageInbox";
import MessagesConversation from "@/components/messagesConversation";
import { ACCESS_TOKEN } from "@/constants";

function MessagesPage() {
    const { chatID } = useParams(); // Get chatID from the URL
    const navigate = useNavigate();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const wsRef = useRef(null); // WebSocket reference
    const token = localStorage.getItem(ACCESS_TOKEN);


    const handleSelectConversation = (chatId) => {
        // Close the existing WebSocket connection if any
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Establish a new WebSocket connection for the selected chat
        const ws = new WebSocket(`ws://localhost:8001/ws/chat/${chatId}/?token=${token}`);
        //const ws = new WebSocket(`ws://localhost:8001/ws/chat/${userId}/${chatId}/`);

        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established for chat:", chatId);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket message:", data);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };
        
        setSelectedConversation(chatId);
        navigate(`chat/${chatId}`);
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
                    <MessagesConversation chatID={chatID} sender={user} />
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
