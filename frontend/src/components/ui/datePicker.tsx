import * as React from "react";
import { format, parse, isValid, isBefore, endOfToday } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  id?: string;
  onDateChange?: (date: string) => void;
  className?: string;
  initialValue?: Date; // Add this line
}

export function DatePicker({ id = "datePicker", onDateChange, className, initialValue }: Props) {
  const [date, setDate] = React.useState<Date | undefined>(initialValue || new Date());
  const [inputValue, setInputValue] = React.useState(date ? format(date, "yyyy-MM-dd") : "");
  const [month, setMonth] = React.useState<Date>(initialValue || new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isBefore(selectedDate, endOfToday())) {
      setDate(selectedDate);
      setInputValue(format(selectedDate, "yyyy-MM-dd"));
      setMonth(selectedDate);
      if (onDateChange) {
        onDateChange(format(selectedDate, "yyyy-MM-dd"));
      }
    } else {
      console.error("Selected date must be in the past");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const parsedDate = parse(e.target.value, "yyyy-MM-dd", new Date());
    if (isValid(parsedDate) && isBefore(parsedDate, endOfToday())) {
      setDate(parsedDate);
      setMonth(parsedDate);
      if (onDateChange) {
        onDateChange(format(parsedDate, "yyyy-MM-dd"));
      }
    } else {
      setDate(undefined);
      console.error("Entered date must be in the past");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="YYYY-MM-DD"
          className={cn(
            className, "justify-start text-left font-normal bg-background border-muted p-2 border rounded-md text-foreground",
            !date && "text-foreground"
          )}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className="bg-background"
          id={id}
          month={month}
          onMonthChange={setMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
