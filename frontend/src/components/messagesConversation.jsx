import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from "./ui/chat/chat-bubble";
import MessageLoading from "./ui/chat/message-loading";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { formatTimestamp } from "@/utility/generalUtility";

export default function MessagesConversation({ chatID, sender, messages: initialMessages, ws }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [inputValue, setInputValue] = useState("");
    const [isForbidden, setIsForbidden] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const senderId = sender?.id;
    const bottomRef = useRef(null);

    // Update messages when initialMessages changes
    useEffect(() => {
        if (Array.isArray(initialMessages)) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    // WebSocket connection handling
    useEffect(() => {
        if (!ws) return;

        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.message_text || data.message) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            id: data.id,
                            sender: data.sender,
                            message_text: data.message_text || data.message,
                            timestamp: data.timestamp,
                            is_read: data.is_read
                        },
                    ]);
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.addEventListener('message', handleWebSocketMessage);
        ws.addEventListener('error', (error) => console.error("WebSocket error:", error));
        ws.addEventListener('close', () => console.log("WebSocket connection closed"));

        return () => {
            ws.removeEventListener('message', handleWebSocketMessage);
        };
    }, [ws]);

    // Handle sending messages
    const handleSendMessage = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }

        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage) return;

        const newMessage = {
            id: crypto.randomUUID(), // More reliable than Date.now()
            sender: {
                id: sender?.id,
                email: sender?.email,
                first_name: sender?.first_name,
                last_name: sender?.last_name,
                profile_image: sender?.profile_image,
                role: sender?.role,
            },
            message: trimmedMessage,
            timestamp: new Date().toISOString(),
            is_read: false,
        };

        try {
            ws.send(JSON.stringify(newMessage));

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    ...newMessage,
                    message_text: trimmedMessage, // Ensure consistency with received message format
                }
            ]);

            setInputValue("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Scroll to bottom when messages update
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
            <div className="flex flex-col flex-grow overflow-y-auto p-4">
                {isLoading ? (
                    <MessageLoading />
                ) : (
                    <ChatMessageList>
                        {messages?.map((msg) => (
                            <ChatBubble
                                key={msg?.id}
                                variant={msg?.sender?.id === senderId ? 'sent' : 'received'}
                            >
                                <ChatBubbleAvatar
                                    className="text-foreground bg-muted"
                                    src={msg?.sender?.profile_image || msg?.sender?.avatar}
                                    fallback={
                                        msg?.sender?.first_name && msg?.sender?.last_name
                                            ? `${msg.sender.first_name.charAt(0)}${msg.sender.last_name.charAt(0)}`
                                            : "?"
                                    }
                                />
                                <ChatBubbleMessage
                                    variant={msg?.sender?.id === senderId ? 'sent' : 'received'}
                                    className="text-white"
                                >
                                    {msg?.message_text || msg?.message}
                                    <ChatBubbleTimestamp
                                        className="text-white/80"
                                        timestamp={formatTimestamp(msg.timestamp)}
                                    />
                                </ChatBubbleMessage>
                            </ChatBubble>
                        ))}
                        <div ref={bottomRef} />
                    </ChatMessageList>
                )}
            </div>

            <div className="p-4 border-t sticky bottom-0 bg-background flex items-center space-x-2 border-border">
                <ChatInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-grow rounded-full text-foreground "
                />
                <Button
                    className="rounded-2xl"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                >
                    <Send size={24} className="text-white" />
                </Button>
            </div>
        </div>
    );
}