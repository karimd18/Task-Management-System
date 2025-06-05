import React, { useRef } from 'react';

interface VerificationInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const VerificationInput: React.FC<VerificationInputProps> = ({ value, onChange }) => {
  // refs for each of the six inputs
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return; // only allow 0–9 or empty
    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // move focus to next input if digit entered
    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newValue = [...value];
    pasted.forEach((digit, idx) => {
      if (idx < newValue.length) {
        newValue[idx] = digit;
      }
    });
    onChange(newValue);
    // focus the next empty box (or last if all filled)
    const firstEmpty = newValue.findIndex((d) => !d);
    const focusIndex = firstEmpty === -1 ? newValue.length - 1 : firstEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {value.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          ref={(el) => (inputRefs.current[index] = el)}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="
            w-12 h-12 text-center border-2 rounded-lg text-xl font-semibold
            border-gray-300 dark:border-gray-600
            focus:border-indigo-500 focus:ring-indigo-500
            dark:bg-gray-700 dark:text-white
            transition-all duration-200
          "
        />
      ))}
    </div>
  );
};

export default VerificationInput;
