import React, { useState } from 'react';
import MessageInbox from '@/components/messageInbox';
import MessagesConversation from '@/components/messagesConversation';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="flex h-screen">
      <MessageInbox onSelectConversation={(id) => setSelectedConversation(id)} />
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
