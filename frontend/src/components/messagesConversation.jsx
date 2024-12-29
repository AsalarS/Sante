import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"; // To access chatID in the URL
import api from "@/api";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from "./ui/chat/chat-bubble";
import MessageLoading from "./ui/chat/message-loading";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { ACCESS_TOKEN } from "@/constants";

export default function MessagesConversation({ chatID, sender }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isForbidden, setIsForbidden] = useState(false);
    const senderId = sender?.id
    const ws = useRef(null);
    const bottomRef = useRef(null);
    const token = localStorage.getItem(ACCESS_TOKEN);


    // Fetch the message history based on chatID
    useEffect(() => {
        if (!chatID || !senderId) return;

        const fetchMessageHistory = async () => {
            try {
                const response = await api.get(`/api/chats/${chatID}/messages/`);
                if (response.status === 200) {

                    setMessages(response.data.messages || []);
                } else if (response.status === 403) {
                    setIsForbidden(true); // Show forbidden if the user isn't part of the chat
                } else {
                    console.error("Failed to fetch messages.");
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        if (chatID && senderId) {
            fetchMessageHistory();
        }
    }, [chatID, senderId]);

    // WebSocket connection logic
    useEffect(() => {
        if (!chatID || !senderId) return;

        ws.current = new WebSocket(`ws://localhost:8001/ws/chat/${chatID}/?token=${token}`);

        ws.current.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("data", data);

            if (data.message) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        // id: Date.now(),
                        // message: data.message,
                        // sender_id: data.sender_id,
                        // timestamp: new Date().toISOString(),
                        id: data?.id,
                        sender: {
                            id: data?.sender?.id,
                            email: data?.sender?.email,
                            first_name: data?.sender?.first_name,
                            last_name: data?.sender?.last_name,
                            profile_image: data?.sender?.profile_image,
                            role: data?.sender?.role,
                        },
                        timestamp: data?.timestamp,
                        message_text: data?.message_text,
                        is_read: data?.is_read,

                    },
                ]);
            }
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.current.onclose = (event) => {
            console.log("WebSocket connection closed:", event.code, event.reason);
        };

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [chatID, senderId]);

    const handleSendMessage = () => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }

        if (inputValue.trim()) {
            const newMessage = {
                id: Date.now(),
                sender: {
                    id: sender.id,
                    email: sender?.email,
                    first_name: sender?.first_name,
                    last_name: sender?.last_name,
                    profile_image: sender?.profile_image,
                    role: sender?.role,
                },
                message: inputValue,
                timestamp: new Date().toISOString(),
                is_read: false,
            };

            ws.current.send(JSON.stringify(newMessage));

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(),
                    sender: {
                        id: sender.id,
                        email: sender?.email,
                        first_name: sender?.first_name,
                        last_name: sender?.last_name,
                        profile_image: sender?.profile_image,
                        role: sender?.role,
                    },
                    message: inputValue,
                    timestamp: new Date().toISOString(),
                    is_read: false,

                },
            ]);

            setInputValue("");
        }
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isForbidden) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>You do not have permission to view this conversation.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat Messages Section */}
            <div className="flex flex-col flex-grow overflow-y-auto p-4">
                {false ? (
                    <MessageLoading />
                ) : (
                    <ChatMessageList>
                        {Array.isArray(messages) && messages.length > 0 ? (messages.map((msg) => (
                            <ChatBubble key={msg?.id} variant={msg?.sender?.id === senderId ? 'sent' : 'received'}>
                                <ChatBubbleAvatar className="text-foreground bg-muted" src={msg?.sender?.avatar} fallback={msg.sender ? msg?.sender?.first_name?.charAt(0).toUpperCase() + msg?.sender?.last_name?.charAt(0).toUpperCase() : ""} />
                                <ChatBubbleMessage variant={msg?.sender?.id === senderId ? 'sent' : 'received'} className="text-white">
                                    {msg?.message_text || msg?.message}
                                    <ChatBubbleTimestamp timestamp={new Date(msg.timestamp).toLocaleString()} />
                                </ChatBubbleMessage>
                            </ChatBubble>
                        ))) : null}
                        {/* Empty div to act as the bottom reference point */}
                        <div ref={bottomRef} />
                    </ChatMessageList>
                )}
            </div>

            {/* Message Input Section */}
            <div className="p-4 border-t sticky bottom-0 bg-background flex items-center space-x-2 border-border">
                <ChatInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow rounded-md text-foreground"
                />
                <Button onClick={handleSendMessage}>
                    <Send size={24} className="text-white" />
                </Button>
            </div>
        </div>
    );
}
