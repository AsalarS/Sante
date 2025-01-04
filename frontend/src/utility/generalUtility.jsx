import api from "@/api";
import { toast } from "sonner";

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

// Format timestamp to dd/mm/yyyy HH:MM (24-hour format)
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const apiRequest = async (url, errorMessage = 'Faile to fetch data', method = 'get', data = undefined) => {
  try {
    const response = await api({
      url,
      method,
      data: ['post', 'put', 'patch'].includes(method.toLowerCase()) ? data : undefined,
      params: method.toLowerCase() === 'get' ? data : undefined,
    });

    return response.data;
  } catch (error) {
    toast.error(errorMessage, error);
    console.error(error);
  }
};