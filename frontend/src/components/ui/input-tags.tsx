"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type InputProps } from "./input";

type InputTagsProps = Omit<InputProps, "value" | "onChange"> & {
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
};

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState("");

    const addPendingDataPoint = () => {
      const trimmedTag = pendingDataPoint.trim();
      if (trimmedTag && !value.includes(trimmedTag)) {
        onChange([...value, trimmedTag]);
      }
      setPendingDataPoint("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addPendingDataPoint();
      } else if (
        e.key === "Backspace" &&
        pendingDataPoint.length === 0 &&
        value.length > 0
      ) {
        e.preventDefault();
        onChange(value.slice(0, -1));
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
          {value.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-3 w-3"
                onClick={() => {
                  onChange(value.filter((i) => i !== item));
                }}
              >
                <XIcon className="w-3" />
              </Button>
            </Badge>
          ))}
          <input
            className="flex-1 outline-none bg-background placeholder:text-muted-foreground text-foreground"
            value={pendingDataPoint}
            onChange={(e) => setPendingDataPoint(e.target.value)}
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
