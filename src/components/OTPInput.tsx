import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  idPrefix?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  hasError = false,
  disabled = false,
  autoFocus = true,
  idPrefix = 'otp-input',
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Array of digits based on current value
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const setDigitAt = (index: number, newDigit: string) => {
    const updated = digits.slice();
    updated[index] = newDigit;
    const newOtp = updated.join('').replace(/[^0-9]/g, '');
    onChange(newOtp);

    if (newOtp.length === length && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        // Clear current digit
        setDigitAt(index, '');
      } else if (index > 0) {
        // Move back and clear previous
        inputsRef.current[index - 1]?.focus();
        setDigitAt(index - 1, '');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const inputVal = e.target.value;
    
    // Take the last character typed if length > 1
    const cleanDigit = inputVal.replace(/[^0-9]/g, '').slice(-1);

    if (cleanDigit) {
      setDigitAt(index, cleanDigit);
      // Auto-focus next input
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      setDigitAt(index, '');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pasteData) return;

    onChange(pasteData);

    // Focus last filled or next empty
    const focusIndex = Math.min(pasteData.length, length - 1);
    inputsRef.current[focusIndex]?.focus();

    if (pasteData.length === length && onComplete) {
      onComplete(pasteData);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border-2 transition-all duration-150 focus:outline-none ${
            hasError
              ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-500/20'
              : digits[i]
              ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 focus:ring-4 focus:ring-emerald-500/20'
              : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
          } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'shadow-xs'}`}
        />
      ))}
    </div>
  );
};
