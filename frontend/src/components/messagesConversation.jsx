import api from "@/api";
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

export default function MessagesConversation({ selectedConversation }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const ws = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);

    const senderId = localStorage.getItem('user_id');
    const receiverId = selectedConversation;

    const getFormattedTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        if (!selectedConversation || !senderId || !receiverId) {
            return;
        }

        const fetchMessageHistory = async () => {
            try {
                const response = await api.get(`/api/chats/${receiverId}/history/`);
                if (response.status === 200) {
                    setMessages(response.data);
                } else {
                    console.error("Failed to fetch messages.");
                }
            } catch (error) {
                if(error.status === 404){
                    console.log("No previous chats");
                } else {
                    console.error("Error fetching messages:", error);
                }
            }
        };

        fetchMessageHistory();

        // Establish WebSocket connection
        ws.current = new WebSocket(
            `ws://localhost:8001/ws/chat/${senderId}/${receiverId}/`
        );

        ws.current.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received message:", data);

            if (data.type === "message") {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        content: data.message,
                        sender_id: data.sender_id,
                        timestamp: new Date().toISOString(),
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
    }, [selectedConversation, senderId, receiverId]);

    const handleSendMessage = () => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            console.log("WebSocket readyState:", ws.current?.readyState);
            return;
        }

        if (inputValue.trim()) {
            const newMessage = {
                type: "message",
                message: inputValue,
                sender_id: senderId,
            };

            console.log("Sending message payload:", JSON.stringify(newMessage));

            ws.current.send(JSON.stringify(newMessage));

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(),
                    sender_id: senderId,
                    content: inputValue,
                    timestamp: getFormattedTime(Date.now()),
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

    return (
        <div className="flex flex-col h-full">
            {/* Chat Messages Section */}
            {selectedConversation ? (
                <div className="flex flex-col flex-grow overflow-y-auto p-4">
                    <ChatMessageList>
                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                variant={msg.sender_id === senderId ? "sent" : "received"}
                            >
                                <ChatBubbleAvatar
                                    className="text-foreground bg-muted"
                                    fallback={msg.sender_id.toString()[0].toUpperCase()}
                                />
                                <ChatBubbleMessage
                                    variant={msg.sender_id === senderId ? "sent" : "received"}
                                >
                                    {msg.content}
                                    <ChatBubbleTimestamp timestamp={msg.timestamp} />
                                </ChatBubbleMessage>
                            </ChatBubble>
                        ))}
                        {isTyping && (
                            <ChatBubble variant="received">
                                <ChatBubbleAvatar
                                    className="text-foreground bg-muted"
                                    fallback="?"
                                />
                                <ChatBubbleMessage isLoading />
                            </ChatBubble>
                        )}
                        <div ref={bottomRef} /> {/* Dummy div for auto-scroll */}
                    </ChatMessageList>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a conversation to view messages.
                </div>
            )}

            {/* Message Input Section */}
            {selectedConversation && (
                <div className="p-4 border-t border-border sticky bottom-0 bg-background flex items-center space-x-2">
                    <ChatInput
                        onChange={(e) => setInputValue(e.target.value)}
                        value={inputValue}
                        placeholder="Type a message..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        className="flex-grow border p-2 rounded-md text-foreground
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                    />
                    <Button onClick={handleSendMessage} className="flex items-center h-full">
                        <Send size={24} className="text-white" />
                    </Button>
                </div>
            )}
        </div>
    );
}
