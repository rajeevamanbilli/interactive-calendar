"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isWithinInterval,
  isAfter,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

// Innovative themes sourced from Unsplash
const THEMES = {
  Nature: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  Space: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop",
  Abstract: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
};

export default function CalendarChallenge() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>("Space");

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("calendar-notes");
    if (savedNotes) setNotes(savedNotes);
  }, []);

  // Save notes to localStorage
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    localStorage.setItem("calendar-notes", e.target.value);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const onDateClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start a new range
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Complete the range
      if (isBefore(day, startDate)) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const isSelected = (day: Date) => {
    return (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate));
  };

  const isHoverRange = (day: Date) => {
    if (startDate && !endDate && hoverDate) {
      const start = isBefore(startDate, hoverDate) ? startDate : hoverDate;
      const end = isAfter(hoverDate, startDate) ? hoverDate : startDate;
      return isWithinInterval(day, { start, end });
    }
    return false;
  };

  const isInRange = (day: Date) => {
    if (startDate && endDate) {
      return isWithinInterval(day, { start: startDate, end: endDate });
    }
    return false;
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDateGrid;
  let formattedDate = "";

  while (day <= endDateGrid) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;

      // Determine CSS classes for visual states
      let dayClasses = "h-10 w-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200 ";
      
      if (!isSameMonth(day, monthStart)) {
        dayClasses += "text-gray-300 ";
      } else if (isSelected(day)) {
        dayClasses += "bg-blue-600 text-white font-bold shadow-md ";
      } else if (isInRange(day) || isHoverRange(day)) {
        dayClasses += "bg-blue-100 text-blue-800 ";
      } else {
        dayClasses += "text-gray-700 hover:bg-gray-100 ";
      }

      days.push(
        <div
          key={day.toString()}
          className="flex justify-center"
          onClick={() => onDateClick(cloneDay)}
          onMouseEnter={() => setHoverDate(cloneDay)}
          onMouseLeave={() => setHoverDate(null)}
        >
          <span className={dayClasses}>{formattedDate}</span>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="grid grid-cols-7 gap-1 mt-2" key={day.toString()}>{days}</div>);
    days = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      {/* Main Wall Calendar Container - Responsive Stack/Side-by-side */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left Side: Hero Image & Theme Switcher */}
        <div className="relative w-full md:w-5/12 h-64 md:h-auto overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform hover:scale-105"
            style={{ backgroundImage: `url(${THEMES[activeTheme]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-extrabold tracking-tight">
              {format(currentDate, "yyyy")}
            </h1>
            <h2 className="text-2xl font-light uppercase tracking-widest mt-1">
              {format(currentDate, "MMMM")}
            </h2>
          </div>

          {/* Theme Selector (Creative Liberty Feature) */}
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-xl flex items-center gap-2">
            <ImageIcon size={18} className="text-white" />
            <select 
              value={activeTheme}
              onChange={(e) => setActiveTheme(e.target.value as keyof typeof THEMES)}
              className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer [&>option]:text-black"
            >
              {Object.keys(THEMES).map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Calendar Grid & Notes */}
        <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-between">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800">
              {format(currentDate, "MMMM yyyy")}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                <ChevronLeft className="text-gray-600" size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                <ChevronRight className="text-gray-600" size={20} />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((dayName) => (
              <div key={dayName} className="text-xs font-bold text-gray-400 tracking-wider">
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="mb-8" onMouseLeave={() => setHoverDate(null)}>
            {rows}
          </div>

          {/* Interactive Notes Section */}
          <div className="mt-auto border-t border-gray-100 pt-6">
            <div className="flex justify-between items-end mb-3">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Monthly Notes
              </label>
              {startDate && (
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                  Selected: {format(startDate, "MMM d")} {endDate ? `- ${format(endDate, "MMM d")}` : ""}
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Jot down your plans, tasks, or goals..."
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

        </div>
      </div>
    </div>
  );
}