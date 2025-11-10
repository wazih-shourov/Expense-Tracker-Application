
import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
}

const Calendar = ({ selectedDate, onDateSelect }: CalendarProps) => {
  const handleDateSelect = (date: Date | undefined) => {
    // If clicking the same date, unselect it
    if (date && selectedDate && date.toDateString() === selectedDate.toDateString()) {
      onDateSelect(undefined);
    } else {
      onDateSelect(date);
    }
  };
  
  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Calendar</h3>
        <span className="text-sm text-muted-foreground font-medium">
          {format(new Date(), 'MMMM yyyy')}
        </span>
      </div>
      
      <div className="flex justify-center mb-6">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-xl border-0 shadow-none p-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent rounded-md transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "relative h-8 w-8 text-center text-sm p-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground font-semibold",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
        />
      </div>
      
      {selectedDate && (
        <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-sm font-medium text-foreground text-center">
            📅 Filtering dashboard for: {format(selectedDate, 'EEEE, MMMM do, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Click the date again to view all data
          </p>
        </div>
      )}
      
      <div className="mt-6">
        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl relative overflow-hidden">
          <div className="absolute bottom-4 right-4">
            <div className="w-16 h-16 bg-primary/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
