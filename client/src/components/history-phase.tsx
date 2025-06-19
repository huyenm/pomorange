import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Download, BarChart3, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";
import { format, startOfDay, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function ReportsPhase() {
  const { records, getStats } = useSessions();
  const stats = getStats();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getStatusBadge = (record: any) => {
    if (record.completed && record.actualFinishedEarly) {
      return <Badge className="bg-amber-100 text-amber-800">Early Finish</Badge>;
    } else if (record.completed) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    } else {
      return <Badge className="bg-slate-100 text-slate-800">Incomplete</Badge>;
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Task', 'Date', 'Start Time', 'End Time', 'Planned (min)', 'Actual (min)', 'Status'],
      ...records.map(record => [
        record.taskName,
        formatDate(record.startTimestamp),
        formatTime(record.startTimestamp),
        formatTime(record.endTimestamp),
        record.plannedMinutes.toString(),
        record.actualMinutes.toString(),
        record.completed ? (record.actualFinishedEarly ? 'Early Finish' : 'Completed') : 'Incomplete'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pomodoro-reports.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return records.filter(record => 
      isSameDay(record.startTimestamp, date)
    );
  };

  // Get sessions for selected date
  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];

  // Get calendar data with session counts
  const getCalendarData = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days.map(day => {
      const sessions = getSessionsForDate(day);
      const completedSessions = sessions.filter(s => s.completed).length;
      const totalMinutes = sessions.reduce((sum, s) => sum + s.actualMinutes, 0);
      
      return {
        date: day,
        sessionCount: sessions.length,
        completedCount: completedSessions,
        totalMinutes,
        hasData: sessions.length > 0
      };
    });
  };

  const calendarData = getCalendarData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-blue-600" />
              Reports & Analytics
            </CardTitle>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        
        {/* Statistics Cards */}
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{records.length}</div>
              <p className="text-sm text-slate-600">Total Sessions</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.completedTasks}</div>
              <p className="text-sm text-slate-600">Tasks Completed</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
              </div>
              <p className="text-sm text-slate-600">Focus Time</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.averageSession > 0 ? Math.round(stats.averageSession) : 0}m
              </div>
              <p className="text-sm text-slate-600">Avg Session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sessions yet</h3>
              <p className="text-slate-500">Complete your first Pomodoro session to see your reports here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-green-600" />
                Activity Calendar
              </CardTitle>
              <p className="text-sm text-slate-600">Click on a date to view session details</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Custom Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-slate-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarData.map((dayData, index) => {
                    const isSelected = selectedDate && isSameDay(dayData.date, selectedDate);
                    const isToday = isSameDay(dayData.date, new Date());
                    
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        className={`h-12 p-1 flex flex-col justify-center relative ${
                          isToday ? 'ring-2 ring-blue-400' : ''
                        } ${dayData.hasData ? 'bg-green-50 hover:bg-green-100' : ''}`}
                        onClick={() => setSelectedDate(dayData.date)}
                      >
                        <span className="text-xs">{format(dayData.date, 'd')}</span>
                        {dayData.hasData && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={`w-1 h-1 rounded-full ${
                              dayData.completedCount > 0 ? 'bg-green-500' : 'bg-amber-500'
                            }`} />
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Completed sessions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>Incomplete sessions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
              {selectedDate && (
                <p className="text-sm text-slate-600">
                  {selectedDateSessions.length} sessions on this day
                </p>
              )}
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateSessions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedDateSessions
                      .sort((a, b) => a.startTimestamp.getTime() - b.startTimestamp.getTime())
                      .map((session) => (
                        <div key={session.id} className="p-3 bg-slate-50 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-800 mb-1">{session.taskName}</h4>
                              <div className="text-sm text-slate-600 space-y-1">
                                <p>{formatTime(session.startTimestamp)} - {formatTime(session.endTimestamp)}</p>
                                <p>Duration: {session.actualMinutes} minutes (planned: {session.plannedMinutes})</p>
                              </div>
                            </div>
                            <div className="ml-3">
                              {getStatusBadge(session)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">No sessions on this date</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Select a date to view session details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
