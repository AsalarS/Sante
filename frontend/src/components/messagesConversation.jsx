import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from '@/components/ui/chat/chat-bubble';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import MessageLoading from '@/components/ui/chat/message-loading';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function MessagesConversation({ selectedConversation }) {
    const [messages, setMessages] = useState([]); // Holds all chat messages
    const [inputValue, setInputValue] = useState(''); // Holds the current input message
    const [ws, setWs] = useState(null); // WebSocket connection state
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const bottomRef = useRef(null); // Reference to the bottom of the chat for auto-scroll

    const userId = localStorage.getItem('user_id'); // Get the current user's ID

    const getFormattedTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Establish WebSocket connection when the selected conversation changes
    useEffect(() => {
        if (!selectedConversation) return;

        console.log(`Connecting WebSocket for user ${userId} with conversation ${selectedConversation}`);

        const newWs = new WebSocket(
            `ws://localhost:8001/ws/chat/${userId}/${selectedConversation}/`
        );
        setWs(newWs);

        newWs.onopen = () => {
            console.log('WebSocket connection established');
        };

        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            if (data.type === 'typing') {
                setIsTyping(data.isTyping);
                return;
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: prevMessages.length + 1,
                    sender: data.sender,
                    content: data.message,
                    timestamp: getFormattedTime(Date.now()), // Format the time
                },
            ]);
        };

        newWs.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        newWs.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
        };

        return () => {
            if (newWs && newWs.readyState === WebSocket.OPEN) {
                newWs.close();
            }
        };
    }, [selectedConversation, userId]);

    // Handle sending a message
    const handleSendMessage = () => {
        if (inputValue.trim() && ws) {
            const newMessage = {
                type: 'message', // Ensure the type is specified
                message: inputValue,
                sender: userId,
            };

            ws.send(JSON.stringify(newMessage));

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: prevMessages.length + 1,
                    sender: userId,
                    content: inputValue,
                    timestamp: getFormattedTime(Date.now()),
                },
            ]);

            setInputValue('');
            sendTyping(false);
        }
    };

    // Handle "Enter" key to send the message
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent adding a newline
            handleSendMessage();
        } else {
            sendTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(false);
            }, 1000);
        }
    };

    const sendTyping = (typing) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'typing', isTyping: typing, sender: userId }));
        }
    };
    

    // Auto-scroll to the bottom of the chat whenever messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    return (
        <div className="flex flex-col h-full">
            {/* Chat Messages Section */}
            <div className="flex flex-col flex-grow overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <MessageLoading /> // Show a loading or placeholder when there are no messages
                ) : (
                    <ChatMessageList>
                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                variant={msg.sender === userId ? 'sent' : 'received'}
                            >
                                <ChatBubbleAvatar
                                    className="text-foreground bg-muted"
                                    fallback={msg.sender.charAt(0).toUpperCase()}
                                />
                                <ChatBubbleMessage
                                    variant={msg.sender === userId ? 'sent' : 'received'}
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
                )}
            </div>

            {/* Message Input Section */}
            <div className="p-4 border-t border-border sticky bottom-0 bg-background flex items-center space-x-2">
                <ChatInput
                    onChange={(e) => setInputValue(e.target.value)}
                    value={inputValue}
                    placeholder="Type a message..."
                    onKeyDown={handleKeyDown} // Listen for "Enter" key
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
        </div>
    );
}
