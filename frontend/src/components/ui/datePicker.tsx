import * as React from "react";
import { format, parse, isValid, isBefore, endOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface Props {
  id?: string;
  onDateChange?: (date: string) => void;
  className?: string;
  initialValue?: Date;
}

export function DatePicker({ id = "datePicker", onDateChange, className, initialValue }: Props) {
  const [date, setDate] = React.useState<Date | undefined>(initialValue || new Date());
  const [inputValue, setInputValue] = React.useState(date ? format(date, "yyyy-MM-dd") : "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsedDate = parse(newValue, "yyyy-MM-dd", new Date());
    if (isValid(parsedDate) && isBefore(parsedDate, endOfToday())) {
      setDate(parsedDate);
      if (onDateChange) {
        onDateChange(format(parsedDate, "yyyy-MM-dd"));
      }
    } else {
      setDate(undefined);
      console.error("Entered date must be in the past");
    }
  };

  return (
    <Input
      type="date"
      id={id}
      value={inputValue}
      onChange={handleInputChange}
      max={format(endOfToday(), "yyyy-MM-dd")}
      className={cn(
        className,
        "bg-background border-muted p-2 border rounded-md text-foreground",
        !date && "text-muted-foreground"
      )}
    />
  );
}