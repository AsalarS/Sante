import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from '@/components/ui/chat/chat-bubble';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import MessageLoading from '@/components/ui/chat/message-loading';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export default function MessagesConversation() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'doctor', content: 'Hello! How can I assist you today?', timestamp: '10:00 AM', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },

    ]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const bottomRef = useRef(null); // Ref to track the bottom of the chat

    const handleSendMessage = () => {
        if (inputValue.trim() !== '') {
            const newMessage = {
                id: messages.length + 1,
                sender: 'doctor',
                content: inputValue,
                timestamp: new Date().toLocaleTimeString(),
                avatar: '/path/to/doctor-avatar.png',
            };
            setMessages([...messages, newMessage]);
            setInputValue('');
        }
    };

    // Scroll to the bottom of the chat whenever messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-border bg-background w-full"> {/* Top Section */}
            <ChatBubbleAvatar className="text-foreground bg-muted" fallback='PA' />
                <div className='ml-4'>
                    <div className="font-semibold text-lg text-foreground leading-5">John Doe</div>
                    <div className="text-sm text-muted-foreground">Patient</div>
                </div>
            </div>
            <div className="flex flex-col flex-grow overflow-y-auto p-4">
                {loading ? (
                    <MessageLoading />
                ) : (
                    <ChatMessageList>
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} variant={msg.sender === 'doctor' ? 'sent' : 'received'}>
                                <ChatBubbleAvatar className="text-foreground bg-muted" src={msg.avatar} fallback={msg.sender.charAt(0).toUpperCase() + msg.sender.charAt(1).toUpperCase()} />
                                <ChatBubbleMessage variant={msg.sender === 'doctor' ? 'sent' : 'received'}>
                                    {msg.content}
                                    <ChatBubbleTimestamp timestamp={msg.timestamp} />
                                </ChatBubbleMessage>

                            </ChatBubble>
                        ))}
                        {/* Empty div to act as the bottom reference point */}
                        <div ref={bottomRef} />
                    </ChatMessageList>
                )}
            </div>
            <div className="p-4 border-t border-border sticky bottom-0 bg-background flex items-center space-x-2">
                <ChatInput
                    onChange={(e) => setInputValue(e.target.value)}
                    value={inputValue}
                    placeholder="Type a message..."
                    className="flex-grow border p-2 rounded-md text-foreground"
                />
                <Button onClick={handleSendMessage} className="flex items-center h-full">
                    <Send size={32} className='text-white w-32 h-32'/>
                </Button>
            </div>
        </div>
    );
};

