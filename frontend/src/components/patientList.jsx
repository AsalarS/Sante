import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, UserPlus2 } from 'lucide-react';
import { ChatBubbleAvatar } from '@/components/ui/chat/chat-bubble';
import AddUserDialog from './Dialogs/add-user-dialog';
import api from '@/api';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

function PatientList({
  patients,
  selectedPatientId,
  handlePatientSelect,
  fetchPatients,
}) {
  const useRole = localStorage.getItem('role');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchString = searchTerm.toLowerCase();
      return (
        patient.first_name.toLowerCase().includes(searchString) ||
        patient.last_name.toLowerCase().includes(searchString) ||
        patient.email.toLowerCase().includes(searchString) ||
        patient.CPR_number.toLowerCase().includes(searchString)
      );
    });
  }, [patients, searchTerm]);

  const handleRegisterUser = async (registerData) => {
    try {
      const response = await api.post(`api/user/register/admin`, registerData);

      if (response.status === 200 || response.status === 201) {
        setOpen(false);
        toast.success("User added successfully!");
        fetchPatients();
      } else {
        toast.error("Failed to add user: " + response.statusText);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Missing or incorrect input: " + error.message);
        console.error(error.response);
      } else {
        toast.error("Failed to add user: " + error);
      }
    }
  };

  return (
    <>
      <div className="w-1/4 h-screen border-r bg-background overflow-y-auto shadow-md border-border/30 sticky top-0">
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="relative flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 w-full">
            <Input
              type="text"
              placeholder="Search Patients"
              className="grow rounded-lg appearance-none pl-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-600" />
          </div>
          {useRole === 'receptionist' && (
            <Button variant="ghost" className="flex items-center ml-2 aspect-square" size="icon" onClick={() => setOpen(true)}>
              <UserPlus2 size={20} className="text-foreground" />
            </Button>
          )}
        </div>
        <ul>
          {filteredPatients.map((patient) => (
            <li
              key={patient.id}
              className={`flex items-center p-4 border-b cursor-pointer border-border/30
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
                <div className="text-sm text-muted-foreground line-clamp-1 break-all">
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
      <AddUserDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleRegisterUser}
        isPatient={true}
      />
    </>
  );
}

export default PatientList;