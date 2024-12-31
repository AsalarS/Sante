import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from "./ui/chat/chat-bubble";
import MessageLoading from "./ui/chat/message-loading";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { formatTimestamp } from "@/utility/generalUtility";

export default function MessagesConversation({ chatID, sender, messages: initialMessages, ws, selectedUser }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isForbidden, setIsForbidden] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const bottomRef = useRef(null);

    useEffect(() => {
        if (Array.isArray(initialMessages)) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    const getMessageSender = (msg) => {
        if (msg.sender_id === sender?.id) {
            return {
                ...sender,
                initials: sender.first_name && sender.last_name ? 
                    `${sender.first_name.charAt(0)}${sender.last_name.charAt(0)}` : '?'
            };
        }
        return {
            ...selectedUser,
            initials: selectedUser?.first_name && selectedUser?.last_name ? 
                `${selectedUser.first_name.charAt(0)}${selectedUser.last_name.charAt(0)}` : '?'
        };
    };

    // WebSocket connection handling
    useEffect(() => {
        if (!ws) return;

        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'typing_status') {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        if (data.is_typing) {
                            newSet.add(data.user_id);
                        } else {
                            newSet.delete(data.user_id);
                        }
                        return newSet;
                    });
                    return;
                }

                if (data.message_text) {
                    const newMessage = {
                        id: data.id,
                        sender_id: data.sender_id,
                        message_text: data.message_text,
                        timestamp: data.timestamp,
                        is_read: data.is_read
                    };

                    setMessages(prev => [...prev, newMessage]);
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.addEventListener('message', handleWebSocketMessage);
        return () => ws.removeEventListener('message', handleWebSocketMessage);
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
            id: crypto.randomUUID(),
            sender_id: sender?.id,
            message_text: trimmedMessage,
            timestamp: new Date().toISOString(),
            is_read: false
        };

        try {
            ws.send(JSON.stringify({
                sender_id: sender?.id,
                message: trimmedMessage
            }));

            setMessages(prevMessages => [...prevMessages, newMessage]);
            setInputValue("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
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
            <div className="flex flex-col flex-grow overflow-y-auto p-4">
                {isLoading ? (
                    <MessageLoading />
                ) : (
                    <ChatMessageList>
                        {messages.map((msg) => {
                            const messageSender = getMessageSender(msg);
                            const isSentByCurrentUser = msg.sender_id === sender?.id;
                            
                            return (
                                <ChatBubble
                                    key={msg?.id}
                                    variant={isSentByCurrentUser ? 'sent' : 'received'}
                                >
                                    <ChatBubbleAvatar
                                        className="text-foreground bg-muted"
                                        src={messageSender?.profile_image || messageSender?.avatar}
                                        fallback={messageSender?.initials || '?'}
                                    />
                                    <ChatBubbleMessage
                                        variant={isSentByCurrentUser ? 'sent' : 'received'}
                                        className="text-white"
                                    >
                                        {msg?.message_text}
                                        <ChatBubbleTimestamp
                                            className="text-white/80"
                                            timestamp={formatTimestamp(msg.timestamp)}
                                        />
                                    </ChatBubbleMessage>
                                </ChatBubble>
                            );
                        })}
                        {typingUsers.size > 0 && (
                            <ChatBubbleMessage isLoading variant="received" className="w-fit"/>
                        )}
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
                    className="flex-grow rounded-full text-foreground"
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