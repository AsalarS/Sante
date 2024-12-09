import React from "react";
import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type InputProps } from "./input";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type SelectTagInputProps = Omit<InputProps, "value" | "onChange"> & {
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  options: Option[];
};

const SelectTagInput = React.forwardRef<HTMLInputElement, SelectTagInputProps>(
  ({ className, value, onChange, options, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState("");
    const [isDropdownOpen, setDropdownOpen] = React.useState(false);

    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(pendingDataPoint.toLowerCase()) &&
        !value.includes(option.value)
    );

    const addPendingDataPoint = (newOption?: Option) => {
      if (newOption && !value.includes(newOption.value)) {
        // Add valid option from the list
        onChange([...value, newOption.value]);
      }
      setPendingDataPoint("");
      setDropdownOpen(false);
    };

    const getLabelByValue = (val: string) => {
      const matchedOption = options.find((option) => option.value === val);
      return matchedOption ? matchedOption.label : val;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          // Add the first matching option from the dropdown
          addPendingDataPoint(filteredOptions[0]);
        }
      } else if (
        e.key === "Backspace" &&
        pendingDataPoint.length === 0 &&
        value.length > 0
      ) {
        e.preventDefault();
        onChange(value.slice(0, -1));
      }
    };

    const handleDropdownClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "flex w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-h-24"
          )}
        >
          {value.map((val) => (
            <Badge key={val} variant="secondary">
              {getLabelByValue(val)}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-3 w-3"
                onClick={() => onChange(value.filter((i) => i !== val))}
              >
                <XIcon className="w-3" />
              </Button>
            </Badge>
          ))}
          <input
            className={cn(
              "flex-1 outline-none bg-background placeholder:text-muted-foreground text-foreground"
            )}
            value={pendingDataPoint}
            onChange={(e) => {
              setPendingDataPoint(e.target.value);
              setDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
            {...props}
            ref={ref}
          />
        </div>
        {isDropdownOpen && pendingDataPoint && (
          <ul
            className="absolute left-0 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 text-sm shadow-lg ring-1 ring-ring ring-opacity-5 focus:outline-none"
            role="listbox"
            onMouseDown={handleDropdownClick}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className="cursor-pointer select-none px-4 py-2 text-foreground hover:bg-muted hover:text-accent-foreground"
                  onClick={() => addPendingDataPoint(option)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="cursor-not-allowed select-none px-4 py-2 text-muted-foreground">
                No options found
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

SelectTagInput.displayName = "SelectTagInput";

export { SelectTagInput };
