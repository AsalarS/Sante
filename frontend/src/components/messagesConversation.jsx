import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from "./ui/chat/chat-bubble";
import MessageLoading from "./ui/chat/message-loading";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { formatTimestamp } from "@/utility/generalUtility";

export default function MessagesConversation({ chatID, sender, messages: initialMessages, ws, selectedUser }) {
    // Constants
    const TYPING_TIMEOUT = 2000;

    // State
    const [inputValue, setInputValue] = useState("");
    const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
    const [isForbidden, setIsForbidden] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());

    // Refs
    const lastTypingStatus = useRef(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Derived state
    const isOtherUserTyping = selectedUser && typingUsers.has(selectedUser.user_id?.toString());

    // Helper functions
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

    const sendTypingStatus = useCallback((isTyping) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: 'typing_status',
            is_typing: isTyping
        }));
    }, [ws]);

    // Event handlers
    const handleInputChange = (e) => {
        setInputValue(e.target.value);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (e.target.value.trim() && !lastTypingStatus.current) {
            lastTypingStatus.current = true;
            sendTypingStatus(true);
            setIsCurrentlyTyping(true);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (lastTypingStatus.current) {
                lastTypingStatus.current = false;
                sendTypingStatus(false);
                setIsCurrentlyTyping(false);
            }
        }, TYPING_TIMEOUT);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }

        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage) return;

        if (lastTypingStatus.current) {
            lastTypingStatus.current = false;
            sendTypingStatus(false);
            setIsCurrentlyTyping(false);
        }

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const newMessage = {
            id: tempId,
            sender_id: sender?.id,
            message_text: trimmedMessage,
            timestamp: new Date().toISOString(),
            is_read: false
        };

        try {
            ws.send(JSON.stringify({
                type: 'message',
                sender_id: sender?.id,
                recipient_id: selectedUser?.id,
                message: trimmedMessage
            }));

            sendTypingStatus(false);
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setInputValue("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Effects
    useEffect(() => {
        if (Array.isArray(initialMessages)) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        if (messagesEndRef.current || isOtherUserTyping) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOtherUserTyping]);

    useEffect(() => {
        if (!ws) return;

        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'typing_status') {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        const senderId = data.sender_id;

                        if (senderId && senderId !== sender?.user_id?.toString()) {
                            if (data.is_typing) {
                                newSet.add(senderId);
                            } else {
                                newSet.delete(senderId);
                            }
                        }
                        return newSet;
                    });
                    return;
                }

                if (data.message_text) {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.sender_id);
                        return newSet;
                    });

                    const newMessage = {
                        id: data.id || `temp-${Date.now()}-${Math.random()}`,
                        sender_id: data.sender_id,
                        message_text: data.message_text,
                        timestamp: data.timestamp || new Date().toISOString(),
                        is_read: data.is_read || false
                    };

                    setMessages(prev => [...prev, newMessage]);
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.addEventListener('message', handleWebSocketMessage);
        return () => ws.removeEventListener('message', handleWebSocketMessage);
    }, [ws, sender?.id]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            sendTypingStatus(false);
        };
    }, [sendTypingStatus]);

    if (isForbidden) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>You do not have permission to view this conversation.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {selectedUser && (
                <div className="flex items-center p-4 border-b border-border bg-background w-full">
                    <ChatBubbleAvatar className="text-foreground bg-muted" fallback={selectedUser.first_name.charAt(0) + selectedUser.last_name.charAt(0)} />
                    <div className='ml-4'>
                        <div className="font-semibold text-lg text-foreground leading-5">{selectedUser.first_name} {selectedUser.last_name}</div>
                        <div className="text-sm text-muted-foreground animate-appear">
                            {isOtherUserTyping ? <span className="animate-pulse">Typing...</span> : selectedUser.role}
                        </div>
                    </div>
                </div>
            )}
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
                                    key={msg.id}
                                    variant={isSentByCurrentUser ? 'sent' : 'received'}
                                >
                                    <ChatBubbleAvatar
                                        className="text-foreground bg-muted"
                                        src={messageSender?.profile_image || messageSender?.avatar}
                                        fallback={messageSender?.initials || '?'}
                                    />
                                    <ChatBubbleMessage
                                        variant={isSentByCurrentUser ? 'sent' : 'received'}
                                        className="text-white animate-appear"
                                    >
                                        {msg.message_text}
                                        <ChatBubbleTimestamp
                                            className="text-white/80"
                                            timestamp={formatTimestamp(msg.timestamp)}
                                        />
                                    </ChatBubbleMessage>
                                </ChatBubble>
                            );
                        })}
                        {isOtherUserTyping && (
                            <ChatBubble
                                key="typing-indicator"
                                variant="received"
                            >
                                <ChatBubbleAvatar
                                    className="text-foreground bg-muted"
                                    src={selectedUser?.profile_image || selectedUser?.avatar}
                                    fallback={`${selectedUser?.first_name.charAt(0)}${selectedUser?.last_name.charAt(0)}` || '?'}
                                />
                                <ChatBubbleMessage
                                    variant="received"
                                    isLoading
                                    className="w-fit animate-appear"
                                />
                            </ChatBubble>
                        )}
                        <div ref={messagesEndRef} />
                    </ChatMessageList>
                )}
            </div>

            <div className="p-4 border-t sticky bottom-0 bg-background flex items-center space-x-2 border-border">
                <ChatInput
                    value={inputValue}
                    onChange={handleInputChange}
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