import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Download, BarChart3, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";
import { format, startOfDay, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from "date-fns";

export function ReportsPhase() {
  const { records, getStats } = useSessions();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"today" | "week" | "month" | "year" | "all">("today");

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getStatusBadge = (record: any) => {
    if (record.completed && record.actualFinishedEarly) {
      return <Badge className="bg-yellow-100 text-yellow-800">Early Finish</Badge>;
    } else if (record.completed) {
      return <Badge className="bg-green-100 text-[#147E50]">Completed</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Incomplete</Badge>;
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

  // Get filtered records based on view mode
  const getFilteredRecords = () => {
    const now = new Date();
    switch (viewMode) {
      case "today":
        return records.filter(record => isSameDay(record.startTimestamp, now));
      case "week":
        return records.filter(record => 
          isWithinInterval(record.startTimestamp, {
            start: startOfWeek(now),
            end: endOfWeek(now)
          })
        );
      case "month":
        return records.filter(record => 
          isWithinInterval(record.startTimestamp, {
            start: startOfMonth(now),
            end: endOfMonth(now)
          })
        );
      case "year":
        return records.filter(record => 
          isWithinInterval(record.startTimestamp, {
            start: startOfYear(now),
            end: endOfYear(now)
          })
        );
      case "all":
      default:
        return records;
    }
  };

  const filteredRecords = getFilteredRecords();
  
  // Calculate stats for filtered records
  const getFilteredStats = () => {
    const totalSessions = filteredRecords.length;
    const totalFocusTime = filteredRecords.reduce((sum, record) => sum + record.actualMinutes, 0);
    const completedTasks = filteredRecords.filter(record => record.completed).length;
    const averageSession = totalSessions > 0 ? totalFocusTime / totalSessions : 0;

    return {
      totalSessions,
      totalFocusTime,
      completedTasks,
      averageSession,
    };
  };

  const filteredStats = getFilteredStats();
  const calendarData = getCalendarData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-orange-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold card-heading flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-[#F3793A]" />
              Reports & Analytics
            </CardTitle>
            <div className="flex space-x-3">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="btn-secondary">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Statistics Cards */}
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
              <div className="text-2xl font-bold text-[#F3793A] mb-1">{filteredStats.totalSessions}</div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-[#147E50] mb-1">{filteredStats.completedTasks}</div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {Math.floor(filteredStats.totalFocusTime / 60)}h {filteredStats.totalFocusTime % 60}m
              </div>
              <p className="text-sm text-muted-foreground">Focus Time</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {filteredStats.averageSession > 0 ? Math.round(filteredStats.averageSession) : 0}m
              </div>
              <p className="text-sm text-muted-foreground">Avg Session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar-style Task Timeline */}
      <Card className="card-orange-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold card-heading flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#147E50]" />
            Session Timeline & Calendar
          </CardTitle>
          <p className="text-sm text-muted-foreground">Google Calendar-style view with date selection</p>
        </CardHeader>
        <CardContent>
          {/* Calendar for Date Selection */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1">
              <h4 className="font-semibold mb-3 text-sm">Select Date</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 scale-75 origin-top-left"
                modifiers={{
                  hasSession: (date) => getSessionsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasSession: { 
                    backgroundColor: '#147E50', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="text-xs text-muted-foreground mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#147E50] rounded"></div>
                  <span>Days with sessions</span>
                </div>
              </div>
            </div>

            {/* Selected Date Sessions */}
            <div className="md:col-span-3">
              <h4 className="font-semibold mb-3 text-sm">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h4>
              {selectedDate && selectedDateSessions.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedDateSessions.map((session) => (
                    <div key={session.id} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-slate-900 text-sm">{session.taskName}</h5>
                        {getStatusBadge(session)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>{formatTime(session.startTimestamp)} - {formatTime(session.endTimestamp)} • {session.actualMinutes} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-muted-foreground text-sm">No sessions on this date</p>
              ) : (
                <p className="text-muted-foreground text-sm">Select a date to view sessions</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6"></div>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-orange-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sessions found</h3>
              <p className="text-muted-foreground">Complete your first Pomodoro session to see your timeline here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Group sessions by month for year view */}
              {viewMode === "year" ? (
                (() => {
                  const sessionsByMonth = filteredRecords
                    .sort((a, b) => b.startTimestamp.getTime() - a.startTimestamp.getTime())
                    .reduce((acc, session) => {
                      const monthKey = format(session.startTimestamp, 'yyyy-MM');
                      const monthName = format(session.startTimestamp, 'MMMM yyyy');
                      if (!acc[monthKey]) {
                        acc[monthKey] = { monthName, sessions: [] };
                      }
                      acc[monthKey].sessions.push(session);
                      return acc;
                    }, {} as Record<string, { monthName: string; sessions: any[] }>);

                  return Object.entries(sessionsByMonth).map(([monthKey, { monthName, sessions }]) => (
                    <div key={monthKey}>
                      <h3 className="text-lg font-semibold card-heading text-[#F3793A] mb-3 px-2">{monthName}</h3>
                      {sessions.map((session) => {
                        const duration = session.actualMinutes;
                        const startTime = formatTime(session.startTimestamp);
                        const endTime = formatTime(session.endTimestamp);
                        const date = formatDate(session.startTimestamp);
                        
                        return (
                          <div 
                            key={session.id} 
                            className="relative border-l-4 border-[#F3793A] bg-orange-50 rounded-lg p-4 ml-4 hover:shadow-md transition-shadow mb-3"
                          >
                            <div className="absolute -left-2 top-4 w-4 h-4 bg-[#F3793A] rounded-full border-2 border-white"></div>
                            
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-slate-900">{session.taskName}</h4>
                                  {getStatusBadge(session)}
                                </div>
                                
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p className="flex items-center space-x-4">
                                    <span>{date}</span>
                                    <span>{startTime} - {endTime}</span>
                                    <span className="bg-white px-2 py-1 rounded text-xs font-medium">
                                      {duration} min
                                    </span>
                                  </p>
                                </div>
                                
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progress</span>
                                    <span>{session.actualFinishedEarly ? 'Finished early' : 'Full duration'}</span>
                                  </div>
                                  <div className="w-full bg-white rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        session.completed ? 'bg-[#147E50]' : 'bg-red-500'
                                      }`}
                                      style={{ 
                                        width: `${(session.actualMinutes / session.plannedMinutes) * 100}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()
              ) : (
                filteredRecords
                  .sort((a, b) => b.startTimestamp.getTime() - a.startTimestamp.getTime())
                  .map((session) => {
                  const duration = session.actualMinutes;
                  const startTime = formatTime(session.startTimestamp);
                  const endTime = formatTime(session.endTimestamp);
                  const date = formatDate(session.startTimestamp);
                  
                  return (
                    <div 
                      key={session.id} 
                      className="relative border-l-4 border-[#F3793A] bg-orange-50 rounded-lg p-4 ml-4 hover:shadow-md transition-shadow"
                    >
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-[#F3793A] rounded-full border-2 border-white"></div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{session.taskName}</h4>
                            {getStatusBadge(session)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center space-x-4">
                              <span>{date}</span>
                              <span>{startTime} - {endTime}</span>
                              <span className="bg-white px-2 py-1 rounded text-xs font-medium">
                                {duration} min
                              </span>
                            </p>
                          </div>
                          
                          {/* Progress bar showing completion */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{session.actualFinishedEarly ? 'Finished early' : 'Full duration'}</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  session.completed ? 'bg-[#147E50]' : 'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${(session.actualMinutes / session.plannedMinutes) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
