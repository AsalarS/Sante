import React, { useState } from "react";
import { Input } from "@/components/ui/input";

const PhoneInput = ({ value, onChange, className = "" }) => {
  const [inputValue, setInputValue] = useState(value || "");

  const handleChange = (e) => {
    let newValue = e.target.value;

    // REGEX Allow only numbers and a single leading +
    if (/^\+?\d*$/.test(newValue)) {
      setInputValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  return (
    <Input
      type="text"
      className= {className}
      value={inputValue}
      onChange={handleChange}
      placeholder="+000 00000000"
      required
    />
  );
};

export default PhoneInput;
