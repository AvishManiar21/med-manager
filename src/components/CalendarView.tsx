import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Appointment, ServiceType } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

// Enable drag and drop
const DnDCalendar = withDragAndDrop(Calendar);

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onEventDrop?: (event: { appointmentId: string; newDate: string; newTime: string }) => Promise<void>;
  darkMode: boolean;
}

/**
 * Calendar view component for appointments
 * Supports month, week, day, and agenda views
 * Integrates with Firestore appointments data
 * Color-coded by service type and status
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onSelectSlot,
  onEventDrop,
  darkMode,
}) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Transform appointments to calendar events
  const events = useMemo(() => {
    return appointments.map(apt => {
      const [hours, minutes] = apt.time.split(':').map(Number);
      const startDate = new Date(apt.date);
      startDate.setHours(hours, minutes, 0);

      const endDate = new Date(startDate);
      endDate.setHours(hours + 1, minutes, 0); // Default 1 hour duration

      return {
        id: apt.id,
        title: `${apt.patientName} - ${apt.serviceType}`,
        start: startDate,
        end: endDate,
        resource: apt,
      };
    });
  }, [appointments]);

  // Get color based on service type and status
  const getEventColor = (event: typeof events[0]) => {
    const apt = event.resource as Appointment;

    // Status-based colors (takes priority)
    if (apt.status === 'Cancelled') {
      return darkMode
        ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
        : 'bg-orange-100 border-orange-300 text-orange-800';
    }

    if (apt.status === 'Completed') {
      return darkMode
        ? 'bg-green-500/20 border-green-500/40 text-green-300'
        : 'bg-green-100 border-green-300 text-green-800';
    }

    // Service type colors for scheduled appointments
    const serviceColors: Record<ServiceType, string> = {
      'Routine Checkup': darkMode
        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
        : 'bg-blue-100 border-blue-300 text-blue-800',
      'Cleaning': darkMode
        ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
        : 'bg-teal-100 border-teal-300 text-teal-800',
      'Filling': darkMode
        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
        : 'bg-amber-100 border-amber-300 text-amber-800',
      'Root Canal': darkMode
        ? 'bg-red-500/20 border-red-500/40 text-red-300'
        : 'bg-red-100 border-red-300 text-red-800',
      'Extraction': darkMode
        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
        : 'bg-purple-100 border-purple-300 text-purple-800',
      'Crown/Bridge': darkMode
        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
        : 'bg-indigo-100 border-indigo-300 text-indigo-800',
      'Whitening': darkMode
        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
        : 'bg-pink-100 border-pink-300 text-pink-800',
      'Emergency': darkMode
        ? 'bg-red-500/30 border-red-500/60 text-red-200'
        : 'bg-red-200 border-red-400 text-red-900',
      'Consultation': darkMode
        ? 'bg-slate-500/20 border-slate-500/40 text-slate-300'
        : 'bg-slate-100 border-slate-300 text-slate-800',
    };

    return serviceColors[apt.serviceType] || (darkMode
      ? 'bg-gray-500/20 border-gray-500/40 text-gray-300'
      : 'bg-gray-100 border-gray-300 text-gray-800');
  };

  // Custom event styling
  const eventStyleGetter = (event: typeof events[0]) => {
    const colorClass = getEventColor(event);
    return {
      className: `${colorClass} border-l-4 rounded-md px-2 py-1 text-sm font-medium`,
    };
  };

  // Handle view change
  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Handle navigation
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  // Handle event selection
  const handleSelectEvent = (event: typeof events[0]) => {
    onSelectAppointment(event.resource as Appointment);
  };

  // Handle slot selection (for creating new appointments)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  // Handle event drop (drag and drop rescheduling)
  const handleEventDrop = ({ event, start, end }: { event: any; start: Date; end: Date }) => {
    if (!onEventDrop) return;

    const appointment = event.resource as Appointment;
    const newDate = format(start, 'yyyy-MM-dd');
    const newTime = format(start, 'HH:mm');

    // Call the parent handler to update Firestore
    onEventDrop({
      appointmentId: appointment.id,
      newDate,
      newTime,
    });
  };

  // Handle event resize (optional, same as drop for now)
  const handleEventResize = ({ event, start, end }: { event: any; start: Date; end: Date }) => {
    handleEventDrop({ event, start, end });
  };

  return (
    <div className={`space-y-4 ${darkMode ? 'dark' : ''}`}>
      {/* Calendar Header with View Controls */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">
              {format(date, 'MMMM yyyy')}
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(date);
                if (view === 'month') newDate.setMonth(date.getMonth() - 1);
                else if (view === 'week') newDate.setDate(date.getDate() - 7);
                else if (view === 'day') newDate.setDate(date.getDate() - 1);
                handleNavigate(newDate);
              }}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-white/10 text-white/80'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleNavigate(new Date())}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => {
                const newDate = new Date(date);
                if (view === 'month') newDate.setMonth(date.getMonth() + 1);
                else if (view === 'week') newDate.setDate(date.getDate() + 7);
                else if (view === 'day') newDate.setDate(date.getDate() + 1);
                handleNavigate(newDate);
              }}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-white/10 text-white/80'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2">
            {(['month', 'week', 'day', 'agenda'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  view === v
                    ? darkMode
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-white/5 text-white/60 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-blue-500/40' : 'bg-blue-300'}`} />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-green-500/40' : 'bg-green-300'}`} />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-orange-500/40' : 'bg-orange-300'}`} />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className={`glass-card p-4 calendar-container ${darkMode ? 'calendar-dark' : 'calendar-light'}`}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          step={30}
          showMultiDayTimes
          defaultDate={new Date()}
        />
      </div>
    </div>
  );
};
