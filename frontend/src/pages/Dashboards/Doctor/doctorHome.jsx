import StatBox from "@/components/statBox";

function DoctorHome() {
    return (
        <>
            <div className="p-6 grid grid-cols-12 gap-6">
                {/* Row 1 - Stat Boxes */}
                <div className="col-span-3">
                    <StatBox title="Appointments Done" number="34" />
                </div>
                <div className="col-span-3">
                    <StatBox title="Revenue" number="$8,450" />
                </div>
                <div className="col-span-3">
                    <StatBox title="New Patients" number="15" />
                </div>
                <div className="col-span-3">
                    <StatBox title="Returning Patients" number="20" />
                </div>
            </div>
        </>
    );
}

export default DoctorHome