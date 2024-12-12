import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, Filter } from 'lucide-react';
import { ChatBubbleAvatar } from '@/components/ui/chat/chat-bubble';

function PatientList({  
  patients, 
  selectedPatientId,
  handlePatientSelect
}) 
{
    
  return (
    <div className="w-1/4 h-screen border-r bg-background overflow-y-auto shadow-md border-border sticky top-0">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="relative flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 w-full mr-4">
          <Input 
            type="text" 
            placeholder="Search Patients" 
            className="flex-grow rounded-lg appearance-none pl-8 text-xs" 
          />
          <SearchIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-600" />
        </div>
        <Button variant="ghost" className="flex items-center">
          <Filter size={16} className="text-foreground" />
        </Button>
      </div>
      <ul>
        {patients.map((patient) => (
          <li
            key={patient.id}
            className={`flex items-center p-4 border-b cursor-pointer border-border 
              ${selectedPatientId === patient.id 
                ? 'bg-background-hover/70 hover:bg-background-hover' 
                : 'hover:bg-background-hover'}`}
            onClick={() => handlePatientSelect(patient.id)}
          >
            <ChatBubbleAvatar 
              src={patient.profile_image} 
              className="w-12 h-12 mr-3 text-foreground bg-muted text-lg font-semibold" 
              fallback={`${patient.first_name.charAt(0).toUpperCase()}${patient.last_name.charAt(0).toUpperCase()}`} 
            />
            <div>
              <div className="font-semibold text-lg text-foreground leading-8 line-clamp-1 break-all">
                {patient.first_name} {patient.last_name}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-1 break-all ">
                {patient.email}
              </div>
              <div className="text-sm text-foreground/50 line-clamp-1 break-all">
                {patient.CPR_number}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PatientList;