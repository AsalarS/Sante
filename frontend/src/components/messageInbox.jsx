import React, { useState } from 'react';
import { ChatBubbleAvatar } from './ui/chat/chat-bubble';
import { Button } from '@/components/ui/button';
import { Edit, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import api from '../api'; // Assuming you have an api utility for making requests
import { ACCESS_TOKEN } from '../constants';

function MessageInbox({ conversations, onSelectConversation }) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const handleUserList = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            const res = await api.get('/api/list-users/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = res.data;
            setUsers(data);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-1/4 h-full border-r bg-background shadow-md flex flex-col border-border">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="relative flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 w-full mr-4">
                    <Input type="text" placeholder="Search Inbox" className="flex-grow rounded-lg appearance-none pl-8 text-xs" />
                    <SearchIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-600" />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center" onClick={handleUserList}>
                            <Edit size={16} className='text-foreground' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {users.map(user => (
                                    <li key={user.id}>
                                        {user.username} ({user.email})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
            
            {/* List Section */}
            <ul className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                    <li
                        key={conversation.id}
                        className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border"
                        onClick={() => onSelectConversation(conversation.id)}
                    >
                        <ChatBubbleAvatar src={conversation.avatar} className="w-12 h-12 mr-3 text-foreground" fallback={conversation.name.charAt(0).toUpperCase()} />
                        <div>
                            <div className="font-semibold text-lg text-foreground">{conversation.name}</div>
                            <div className="text-sm text-muted-foreground">{conversation.role}</div>
                            <div className="text-sm text-gray-500 truncate">{conversation.lastMessage}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MessageInbox;
