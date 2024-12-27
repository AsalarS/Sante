import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Replace with your shadcn Input import
import { LucideMinus, LucidePlus } from "lucide-react"; // Import icons from Lucide

interface NumberFieldProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
  prefix?: string;
  suffix?: string;
}

const NumberField: React.FC<NumberFieldProps> = ({
  value = 0,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  allowNegative = true,
  prefix = "",
  suffix = "",
}) => {
  const [internalValue, setInternalValue] = useState<number>(value);

  const formatValue = (num: number): string => {
    return `${prefix}${num}${suffix}`;
  };

  const parseValue = (formattedValue: string): number => {
    const strippedValue = formattedValue
      .replace(prefix, "")
      .replace(suffix, "")
      .trim();
    const num = parseFloat(strippedValue);
    return isNaN(num) ? 0 : num;
  };

  const handleIncrement = () => {
    let newValue = internalValue + step;
    if (newValue > max) newValue = max;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleDecrement = () => {
    let newValue = internalValue - step;
    if (!allowNegative && newValue < 0) newValue = 0;
    if (newValue < min) newValue = min;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const parsedValue = parseValue(rawValue);
    if (parsedValue >= min && parsedValue <= max) {
      setInternalValue(parsedValue);
      onChange?.(parsedValue);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Minus Icon */}
      <span
        onClick={handleDecrement}
        className="absolute left-4 cursor-pointer text-foreground"
        role="button"
        aria-label="decrement"
      >
        <LucideMinus size={16} />
      </span>
      {/* Input Field */}
      <Input
        type="text"
        value={formatValue(internalValue)}
        onChange={handleInputChange}
        className="text-center pl-8 pr-8"
      />
      {/* Plus Icon */}
      <span
        onClick={handleIncrement}
        className="absolute right-4 cursor-pointer text-foreground"
        role="button"
        aria-label="increment"
      >
        <LucidePlus size={16} />
      </span>
    </div>
  );
};

export default NumberField;
