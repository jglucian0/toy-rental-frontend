// components/DatePickerField.tsx
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface DatePickerFieldProps {
  label?: string;
  selectedDate: string;
  onChange: (value: string) => void;
  position?: 'left' | 'right';
}

export function DatePickerField({ label, selectedDate, onChange, position }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
      setOpen(false);
    }
  };

  const formatDisplay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex w-full items-center px-3 py-2 rounded-md text-left "
      >
        <CalendarIcon className="h-5 w-5 text-gray-600" />
        <span className="ml-2">
          {selectedDate ? formatDisplay(selectedDate) : "--/--/--"}
        </span>
      </button>

      {open && (
        <div className={`${position === 'left' ? 'lg:right-0' : ''} absolute z-10 mt-2 bg-white border border-gray-300 rounded-md shadow-lg`}>
          <Calendar
            mode="single"
            selected={new Date(selectedDate + "T00:00:00")}
            onSelect={handleSelect}
            className="rounded-md border"
          />
        </div>
      )}
    </div>
  );
}
