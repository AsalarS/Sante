import MessageInbox from '@/components/messageInbox';
import MessagesConversation from '@/components/messagesConversation';
import React, { useState } from 'react';


export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(null);

    return (
        <div className="flex h-screen">
            {/* Sidebar with Conversations List */}
            <MessageInbox 
                onSelectConversation={(id) => setSelectedConversation(id)} 
            />

            {/* Main Chat Area for Selected Conversation */}
            <div className="flex-grow">
                {selectedConversation ? (
                    <MessagesConversation selectedConversation={selectedConversation} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
