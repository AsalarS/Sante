"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type InputProps } from "./input";

type InputTagsProps = Omit<InputProps, "value" | "onChange"> & {
  value: Record<string, string>; // Object with key-value pairs
  onChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  useKeyAsValue?: boolean; // Boolean to control key-value behavior
};

const formatDate = () => {
  const date = new Date();
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  ({ className, value, onChange, useKeyAsValue, ...props }, ref) => {
    const [pendingKey, setPendingKey] = React.useState("");

    const addPendingDataPoint = () => {
      const trimmedKey = pendingKey.trim();
      if (trimmedKey && !(trimmedKey in value)) {
        const newValue = useKeyAsValue 
          ? trimmedKey 
          : formatDate();
    
        const updatedValue = { ...value, [trimmedKey]: newValue };
        
        onChange(updatedValue);
        setPendingKey(""); // Clear the input after adding
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addPendingDataPoint();
      } else if (
        e.key === "Backspace" &&
        pendingKey.length === 0 &&
        Object.keys(value).length > 0
      ) {
        e.preventDefault();
        const lastKey = Object.keys(value)[Object.keys(value).length - 1];
        const updatedValue = { ...value };
        delete updatedValue[lastKey];
        onChange(updatedValue);
      }
    };

    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "flex w-full flex-wrap gap-2 overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "max-h-24"
          )}
        >
          {Object.keys(value).map((key) => (
            <Badge key={key} variant="secondary">
              {key}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-3 w-3"
                onClick={() => {
                  const updatedValue = { ...value };
                  delete updatedValue[key];
                  onChange(updatedValue);
                }}
              >
                <XIcon className="w-3" />
              </Button>
            </Badge>
          ))}
          <input
            className="flex-1 outline-none bg-background placeholder:text-muted-foreground text-foreground"
            value={pendingKey}
            onChange={(e) => setPendingKey(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addPendingDataPoint}
            {...props}
            ref={ref}
          />
        </div>
      </div>
    );
  }
);

InputTags.displayName = "InputTags";

export { InputTags };
