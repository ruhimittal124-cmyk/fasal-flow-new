import React from 'react';
import { Phone, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { normalizePhoneNumber, validateIndianPhoneNumber } from '../utils/userProfiles';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  onEnterPress?: () => void;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onEnterPress,
  error,
  disabled = false,
  autoFocus = true,
  id = 'phone-input-field',
}) => {
  const cleanDigits = normalizePhoneNumber(value);
  const validation = validateIndianPhoneNumber(cleanDigits);
  const isValid = validation.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric inputs, max 10 digits
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(numeric);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const handleClear = () => {
    if (!disabled) {
      onChange('');
    }
  };

  // Format display value: e.g. 98221 45678
  const formattedDisplay =
    cleanDigits.length > 5
      ? `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : cleanDigits;

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="relative flex items-center">
        {/* Country Code Prefix */}
        <div className="absolute left-0 inset-y-0 flex items-center pl-3.5 pr-2.5 pointer-events-none border-r border-slate-200 text-slate-700 bg-slate-50/80 rounded-l-xl">
          <span className="text-base mr-1.5" role="img" aria-label="India flag">
            🇮🇳
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">+91</span>
        </div>

        {/* Input */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11} // allows space
          autoFocus={autoFocus}
          disabled={disabled}
          value={formattedDisplay}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter 10-digit mobile number"
          className={`w-full pl-24 pr-10 py-3 text-sm sm:text-base font-mono tracking-wider font-semibold rounded-xl border transition-all duration-150 focus:outline-none ${
            error
              ? 'border-rose-300 bg-rose-50/30 text-rose-950 focus:ring-2 focus:ring-rose-500/30'
              : isValid
              ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
              : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600'
          } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
        />

        {/* Right Status / Clear Button */}
        <div className="absolute right-3 inset-y-0 flex items-center space-x-1.5">
          {cleanDigits.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : cleanDigits.length > 0 && !error ? (
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {cleanDigits.length}/10
            </span>
          ) : null}
        </div>
      </div>

      {/* Validation Message / Error */}
      {error ? (
        <div className="flex items-center space-x-1 text-xs text-rose-600 font-medium pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : cleanDigits.length > 0 && !isValid ? (
        <p className="text-[11px] text-slate-500">
          Must be 10 digits starting with 6, 7, 8, or 9
        </p>
      ) : null}
    </div>
  );
};
