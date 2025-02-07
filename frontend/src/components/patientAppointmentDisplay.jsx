import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NextAppointmentCard = ({ nextAppointment }) => {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showCountdown, setShowCountdown] = useState(false);
  const navigate = useNavigate();

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
      const appointmentDateTime = new Date(nextAppointment.date);
      appointmentDateTime.setHours(parseInt(appointmentHours), parseInt(appointmentMinutes), 0);
      const timeDiff = appointmentDateTime - now;

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

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const appointmentDate = new Date(date);
    return (
      today.getDate() === appointmentDate.getDate() &&
      today.getMonth() === appointmentDate.getMonth() &&
      today.getFullYear() === appointmentDate.getFullYear()
    );
  };

  return (
    <Card 
      className="p-4 bg-background rounded-lg mb-6 text-foreground flex flex-col items-center justify-center border-none"
    >
      <CardHeader className="text-2xl font-semibold text-foreground w-full text-center">
        Next Appointment
      </CardHeader>
      <div className="flex flex-col space-y-4 w-full">
        <div className="flex flex-row justify-between w-full">
          <div>
            <h3 className="text-xl font-semibold">
              {nextAppointment?.doctor_name || 'Dr. Name'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{nextAppointment?.office_number || ''}</span>
              <span>•</span>
              <span>{nextAppointment?.specialization || 'Specialization'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {isToday(nextAppointment?.date) && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 rounded-full">
                <Clock size={12} className="text-primary" />
                <span className="text-xs font-medium text-primary">Today</span>
              </div>
            )}
          </div>
        </div>
        {showCountdown && (
          <div className="flex justify-between pt-2 border-t border-border items-center gap-4">
            <span className="text-sm text-muted-foreground">Until Appointment</span>
            <span className="text-2xl font-bold bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {formatCountdown()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NextAppointmentCard;