export const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

export const convertTo24HourFormat = (time) => { //Convert the time to 24 hour format to filter the time slots
  const [hour, minutePart] = time.split(":");
  const [minute, period] = minutePart.split(" ");
  let hour24 = parseInt(hour, 10);
  if (period === "PM" && hour24 !== 12) {
  hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
  hour24 = 0;
  }
  return `${hour24.toString().padStart(2, "0")}:${minute}`;
};