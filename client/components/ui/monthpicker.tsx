import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MonthPickerProps {
  selectedMonth?: { month: number; year: number };
  onSelect: (month: number, year: number) => void;
  className?: string;
}

export function MonthPicker({ selectedMonth, onSelect, className }: MonthPickerProps) {
  const [year, setYear] = React.useState(selectedMonth?.year || new Date().getFullYear());

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  return (
    <div className={`p-3 bg-white border border-gray-300 rounded-lg shadow-lg ${className}`}>
      {/* Cabeçalho do ano */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setYear(y => y - 1)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-medium">{year}</span>
        <button
          onClick={() => setYear(y => y + 1)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grid de meses */}
      <div className="grid grid-cols-3 gap-3 w-48">
        {months.map((m, index) => (
          <button
            key={index}
            onClick={() => onSelect(index + 1, year)}
            className={`py-2 rounded hover:bg-primary hover:text-white ${selectedMonth?.month === index + 1 && selectedMonth.year === year
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700"
              }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}