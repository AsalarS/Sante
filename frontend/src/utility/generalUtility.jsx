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

export const apiRequest = async (url, errorMessage = 'Failed to fetch data', method = 'get', data = undefined) => {
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

// Format any 24-hour or 12-hour time to its respective time format without the seconds
export const formatTimeNoSeconds = (time) => {
  const [hour, minutePart] = time.split(":");
  const [minute, period] = minutePart ? minutePart.split(" ") : [minutePart, null];
  let hour24 = parseInt(hour, 10);

  if (period) {
    // 12-hour format
    if (period.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0;
    }
  }

  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";

  return {
    "24-hour": `${hour24.toString().padStart(2, "0")}:${minute}`,
    "12-hour": `${hour12.toString().padStart(2, "0")}:${minute} ${ampm}`
  };
};