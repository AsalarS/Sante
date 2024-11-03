import React from 'react';
import { ChatBubbleAvatar } from './ui/chat/chat-bubble';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

function MessageInbox({ conversations, onSelectConversation }) {
    return (
        <div className="w-1/4 h-screen border-r bg-white overflow-y-auto shadow-md">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Inbox</h2>
                <Button variant="outline" className="flex items-center">
                    <Edit size={16}/>
                </Button>
            </div>
            <ul>
                {conversations.map((conversation) => (
                    <li 
                        key={conversation.id}
                        className="flex items-center p-4 border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => onSelectConversation(conversation.id)}
                    >
                        <ChatBubbleAvatar src={conversation.avatar} className="w-12 h-12 mr-3" fallback={conversation.name.charAt(0).toUpperCase()} />
                        <div>
                            <div className="font-semibold text-lg">{conversation.name}</div>
                            <div className="text-sm text-gray-600">{conversation.role}</div>
                            <div className="text-sm text-gray-500 truncate">{conversation.lastMessage}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MessageInbox;