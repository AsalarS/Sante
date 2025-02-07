import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AppointmentDisplay = ({ nextAppointment }) => {
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [showCountdown, setShowCountdown] = useState(false);
    const navigate = useNavigate();

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '';
        // Assuming time is in format "HH:MM" or "HH:MM:SS"
        try {
            const [hours, minutes] = time.split(':');
            const timeDate = new Date();
            timeDate.setHours(parseInt(hours), parseInt(minutes), 0);

            return timeDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const calculateTimeLeft = () => {
        if (!nextAppointment?.date || !nextAppointment?.time) {
            return {
                showCountdown: false,
                countdown: { hours: 0, minutes: 0, seconds: 0 }
            };
        }

        try {
            const now = new Date();
            const [appointmentHours, appointmentMinutes] = nextAppointment.time.split(':');

            // Create a date object for the appointment
            const appointmentDateTime = new Date(nextAppointment.date);
            appointmentDateTime.setHours(parseInt(appointmentHours), parseInt(appointmentMinutes), 0);

            const timeDiff = appointmentDateTime - now;

            // Check if appointment is within next 24 hours and in the future
            if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                return {
                    showCountdown: true,
                    countdown: { hours, minutes, seconds }
                };
            }
        } catch (error) {
            console.error('Error calculating time left:', error);
        }

        return {
            showCountdown: false,
            countdown: { hours: 0, minutes: 0, seconds: 0 }
        };
    };

    useEffect(() => {
        const updateTime = () => {
            const { showCountdown: shouldShowCountdown, countdown: timeLeft } = calculateTimeLeft();
            setCountdown(timeLeft);
            setShowCountdown(shouldShowCountdown);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [nextAppointment]);

    const formatCountdown = () => {
        const { hours, minutes, seconds } = countdown;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{nextAppointment?.patient_name}</h3>
            <div className="flex justify-center space-x-4">
                <span className="text-sm text-gray-500">
                    {calculateAge(nextAppointment?.patient_dob)}y
                </span>
                <span className="text-sm text-gray-500">
                    {nextAppointment?.patient_gender}
                </span>
                <span className="text-sm text-gray-500">
                    {nextAppointment?.patient_blood_type}
                </span>
            </div>
            <Button
                className="text-sm text-gray-500"
                variant="ghost"
                onClick={() => {
                    if (showCountdown) {
                        navigate(`/doctor/patients/appointment/${nextAppointment?.appointment_id}`);
                    }
                }}>
                <span className="font-bold bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    {showCountdown ? (
                        formatCountdown()
                    ) : (
                        <>
                            {formatDate(nextAppointment?.date)} {nextAppointment?.date && nextAppointment?.time ? 'at' : ''} {formatTime(nextAppointment?.time)}
                        </>
                    )}
                </span>
                {showCountdown ? " Until Appointment" : ""}
            </Button>
        </div>
    );
};

export default AppointmentDisplay;