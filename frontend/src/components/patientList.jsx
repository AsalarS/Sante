import React, { useEffect, useState } from 'react';
import api from '@/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, Filter } from 'lucide-react';
import { ChatBubbleAvatar } from '@/components/ui/chat/chat-bubble';

function PatientList({ onSelectConversation }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/api/users/');
                if (response.status === 200) {
                    const users = response.data;
                    const patients = users.filter(user => user.role === 'patient');
                    setPatients(patients);
                } else {
                    console.error('Failed to fetch users:', response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (loading) {
        return (
            <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 text-center" viewBox="0 0 100 101" fill="#6c89fe" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span class="sr-only">Loading...</span>
            </div>
        );
    }

    return (
        <>
            <div className="w-1/4 h-screen border-r bg-background overflow-y-auto shadow-md border-border">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="relative flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 w-full mr-4">
                        <Input type="text" placeholder="Search Patients" className="flex-grow rounded-lg appearance-none pl-8 text-xs" />
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
                            className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border"
                            onClick={() => onSelectConversation(patient.id)}
                        >
                            <ChatBubbleAvatar src={patient.profile_image} className="w-12 h-12 mr-3 text-foreground bg-muted text-lg font-semibold" fallback={patient.first_name.charAt(0).toUpperCase() + patient.last_name.charAt(0).toUpperCase()} />
                            <div>
                                <div className="font-semibold text-lg text-foreground line-clamp-1 break-all">{patient.first_name} {patient.last_name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1 break-all">{patient.email}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default PatientList;