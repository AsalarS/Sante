import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from '@/components/ui/chat/chat-bubble';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import MessageLoading from '@/components/ui/chat/message-loading';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export default function MessagesConversation({ selectedConversation, currentUserId, recipientUserId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef(null); 
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (selectedConversation) {
      const socket = new WebSocket(`ws://localhost:8000/ws/chat/${selectedConversation}/`);
      setWs(socket);

      socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, messageData]);
      };

      return () => socket.close(); 
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (inputValue.trim() !== '' && ws) {
      const newMessage = {
        sender: currentUserId,
        receiver: recipientUserId,
        text: inputValue,
        timestamp: new Date().toLocaleTimeString()
      };

      ws.send(JSON.stringify(newMessage));
      setMessages([...messages, newMessage]); 
      setInputValue('');
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <ChatBubbleAvatar src={selectedConversation.avatar} className="w-10 h-10 mr-3 text-foreground" />
        <div>
          <div className="font-semibold text-lg text-foreground">{selectedConversation.name}</div>
          <div className="text-sm text-muted-foreground">{selectedConversation.role}</div>
        </div>
      </div>
      <div className="flex flex-col flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <MessageLoading />
        ) : (
          <ChatMessageList>
            {messages.map((msg, index) => (
              <ChatBubble key={index} variant={msg.sender === currentUserId ? 'sent' : 'received'}>
                <ChatBubbleAvatar className="text-foreground" src={msg.avatar} fallback={msg.sender.charAt(0).toUpperCase()} />
                <ChatBubbleMessage variant={msg.sender === currentUserId ? 'sent' : 'received'}>
                  {msg.text}
                </ChatBubbleMessage>
                <ChatBubbleTimestamp className="text-foreground" timestamp={msg.timestamp} />
              </ChatBubble>
            ))}
            <div ref={bottomRef} />
          </ChatMessageList>
        )}
      </div>
      <div className="p-4 border-t border-border sticky bottom-0 bg-background flex items-center space-x-2">
        <ChatInput
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          placeholder="Type a message..."
          className="flex-grow border p-2 rounded-md"
        />
        <Button onClick={handleSendMessage} className="flex items-center">
          <Send size={24} className='text-foreground'/>
        </Button>
      </div>
    </div>
  );
};
