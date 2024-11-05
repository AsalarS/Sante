import MessageInbox from "@/components/messageInbox";
import MessagesConversation from "@/components/messagesConversation";
import { useState } from "react";

function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const conversations = [
        { id: 1, name: 'Dr. Smith', role: 'Doctor', lastMessage: 'Hello! How can I assist you?', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
        { id: 2, name: 'Pharmacy', role: 'Support', lastMessage: 'Your prescription is ready.', avatar: '/path/to/pharmacy-avatar.png' },
    ];

    return (
        <div className="flex">
            <MessageInbox 
                conversations={conversations} 
                onSelectConversation={(id) => setSelectedConversation(id)} 
            />
            <div className="flex-grow">
                <MessagesConversation selectedConversation={selectedConversation} />
            </div>
        </div>
    );
}

export default MessagesPage;

//TODO: Fix issues with the whole page scrolling