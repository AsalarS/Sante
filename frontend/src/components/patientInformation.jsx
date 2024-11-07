import CompactListBox from "@/components/compactListBox";

function PatientInformation() {
    const listData = [
        { title: "Medications", data: ["Medicine A", "Medicine B", "Medicine C"] },
        { title: "Appointments",  data: ["Checkup 1", "Checkup 2", "Checkup 3"] },
        { title: "Allergies",  data: ["Pollen", "Peanuts"] },
        { title: "Vitals",  data: ["Blood Pressure", "Heart Rate"] },
    ];

    return (
        <div className="bg-[#E1E7FE] h-screen p-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {listData.map((item, index) => (
                <CompactListBox
                    key={index}
                    title={item.title}

                    data={item.data}
                    onClickIcon={() => console.log(`${item.title} icon clicked`)}
                    onClickSelf={() => console.log(`${item.title} clicked`)}
                />
            ))}
        </div>
    );
}

export default PatientInformation;
