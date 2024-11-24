import api from "@/api";
import MessageInbox from "@/components/messageInbox";
import MessagesConversation from "@/components/messagesConversation";
import { useEffect, useState } from "react";

function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(null); // Currently selected conversation ID
    const [userId, setUserId] = useState(null); // Logged-in user's ID
    const [loading, setLoading] = useState(false); // Loading state for fetching conversations

    useEffect(() => {
        // Fetch logged-in user's ID
        const fetchUserId = async () => {
            try {
                const response = await api.get("/api/user-info/");
                if (response.status === 200) {
                    setUserId(response.data.id);
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
                    onSelectConversation={(conversationId) => setSelectedConversation(conversationId)} // Callback for selecting a conversation
                    userId={userId} // Pass the logged-in user's ID
                    loading={loading} // Loading state
                />
            ) : (
                <p>Loading user information...</p>
            )}

            {/* Conversation Section */}
            <div className="flex-grow">
                {selectedConversation ? (
                    <MessagesConversation
                        selectedConversation={selectedConversation}
                        senderId={userId}
                        receiverId={null} // Will be determined within MessagesConversation
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
