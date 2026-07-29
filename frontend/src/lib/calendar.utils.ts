export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
  startTimeStr: string; // HH:MM
  endTimeStr: string; // HH:MM
}

function parseDateTimeISO(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatToICSDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

export function generateGoogleCalendarUrl(event: CalendarEventDetails): string {
  const start = parseDateTimeISO(event.dateStr, event.startTimeStr);
  const end = parseDateTimeISO(event.dateStr, event.endTimeStr);

  const dates = `${formatToICSDate(start)}/${formatToICSDate(end)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: dates,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICSFile(event: CalendarEventDetails) {
  const start = parseDateTimeISO(event.dateStr, event.startTimeStr);
  const end = parseDateTimeISO(event.dateStr, event.endTimeStr);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CardioCenter//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    `DTSTART:${formatToICSDate(start)}`,
    `DTEND:${formatToICSDate(end)}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Cita-CardioCenter-${event.dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
