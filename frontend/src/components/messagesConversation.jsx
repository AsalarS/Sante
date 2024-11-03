import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from '@/components/ui/chat/chat-bubble';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import MessageLoading from '@/components/ui/chat/message-loading';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import React, { useState } from 'react';

export default function MessagesConversation() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'doctor', content: 'Hello! How can I assist you today?', timestamp: '10:00 AM', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'doctor', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'doctor', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'doctor', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'doctor', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
        { id: 2, sender: 'patient', content: 'I have some questions about my prescription.', timestamp: '10:01 AM', avatar: '/path/to/patient-avatar.png' },
    ]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim() !== '') {
            const newMessage = {
                id: messages.length + 1,
                sender: 'doctor',
                content: inputValue,
                timestamp: new Date().toLocaleTimeString(),
                avatar: '/path/to/patient-avatar.png',
            };
            setMessages([...messages, newMessage]);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-col flex-grow overflow-y-auto p-4">
                {loading ? (
                    <MessageLoading />
                ) : (
                    <ChatMessageList>
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} variant={msg.sender === 'doctor' ? 'sent' : 'received'}>
                                <ChatBubbleAvatar src={msg.avatar} fallback={msg.sender.charAt(0).toUpperCase() + msg.sender.charAt(1).toUpperCase()} />
                                <ChatBubbleMessage variant={msg.sender === 'doctor' ? 'sent' : 'received'}>
                                    {msg.content}
                                </ChatBubbleMessage>
                                <ChatBubbleTimestamp timestamp={msg.timestamp} />
                            </ChatBubble>
                        ))}

                        <ChatBubble variant='received'>
                            <ChatBubbleAvatar fallback='DO' />
                            <ChatBubbleMessage isLoading />
                        </ChatBubble>
                    </ChatMessageList>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white flex items-center space-x-2">
                <ChatInput 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="Type a message..." 
                    className="flex-grow border p-2 rounded-md"
                />
                <Button onClick={handleSendMessage} className="flex items-center">
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
};

