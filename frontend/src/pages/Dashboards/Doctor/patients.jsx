import PatientInformation from "@/components/patientInformation";
import PatientList from "@/components/patientList";
import { useState } from "react";

function PatientsPage() {

    const [selectedConversation, setSelectedConversation] = useState(null);
    const conversations = [
        { id: 1, name: 'John Doe', current: 'in-patient', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, name: 'Jane Doe', current: 'out-patient', avatar: '/path/to/pharmacy-avatar.png' },
    ];


    return (
        <>
            <div className="flex">
                <PatientList
                    conversations={conversations}
                    onSelectConversation={(id) => setSelectedConversation(id)}
                />
                <div className="grow">
                    <PatientInformation />
                </div>
            </div>
        </>
    );
}

export default PatientsPage