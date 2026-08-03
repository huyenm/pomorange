import { Fragment, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Download, BarChart3, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSessions } from "@/hooks/use-sessions";
import { useTasks } from "@/hooks/use-tasks";
import { useLabels } from "@/hooks/use-labels";
import { format, startOfDay, endOfDay, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

export function ReportsPhase() {
  const { records, getStats } = useSessions();
  const { tasks } = useTasks();
  const { labels } = useLabels();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"today" | "week" | "month" | "year" | "custom" | "all">("today");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [labelFilter, setLabelFilter] = useState("all");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 6;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // Helper function to get proper task name with fallback logic
  const getTaskName = (session: any) => {
    // If taskName exists and is not "Unknown Task", use it
    if (session.taskName && session.taskName !== "Unknown Task") {
      return session.taskName;
    }
    
    // Try to find the task by ID in current tasks
    const currentTask = tasks.find(t => t.id === session.taskId);
    if (currentTask) {
      return currentTask.text;
    }
    
    // If still no task found, use the taskId as a fallback
    return session.taskName || `Task ${session.taskId}`;
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
        getTaskName(record),
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

  // Reset pagination when view mode changes
  const handleViewModeChange = (newViewMode: typeof viewMode) => {
    setViewMode(newViewMode);
    setCurrentPage(1);
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return records.filter(record => 
      isSameDay(record.startTimestamp, date)
    );
  };

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
    const recordsForLabel = records.filter(record => {
      if (labelFilter === "all") return true;
      const task = tasks.find(
        currentTask => String(currentTask.id) === String(record.taskId),
      );
      if (labelFilter === "none") return !task?.labelId;
      return task?.labelId === labelFilter;
    });

    switch (viewMode) {
      case "today":
        return recordsForLabel.filter(record => isSameDay(record.startTimestamp, now));
      case "week":
        return recordsForLabel.filter(record =>
          isWithinInterval(record.startTimestamp, {
            start: startOfWeek(now),
            end: endOfWeek(now)
          })
        );
      case "month":
        return recordsForLabel.filter(record =>
          isWithinInterval(record.startTimestamp, {
            start: startOfMonth(now),
            end: endOfMonth(now)
          })
        );
      case "year":
        return recordsForLabel.filter(record =>
          isWithinInterval(record.startTimestamp, {
            start: startOfYear(now),
            end: endOfYear(now)
          })
        );
      case "custom":
        return selectedRange?.from
          ? recordsForLabel.filter(record =>
              isWithinInterval(record.startTimestamp, {
                start: startOfDay(selectedRange.from!),
                end: endOfDay(selectedRange.to || selectedRange.from!),
              }),
            )
          : [];
      case "all":
      default:
        return recordsForLabel;
    }
  };

  const filteredRecords = getFilteredRecords();
  
  // Calculate stats for filtered records
  const getFilteredStats = () => {
    const totalSessions = filteredRecords.length;
    const totalFocusTime = filteredRecords.reduce((sum, record) => sum + record.actualMinutes, 0);
    const completedTasks = new Set(
      filteredRecords
        .filter(record => record.completed)
        .map(record => String(record.taskId || getTaskName(record))),
    ).size;
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
  const groupedTaskRecords = Array.from(
    filteredRecords.reduce((groups, record) => {
      const key = String(record.taskId || getTaskName(record));
      const existing = groups.get(key);

      if (existing) {
        existing.sessions.push(record);
        existing.totalActualMinutes += record.actualMinutes;
        existing.totalPlannedMinutes += record.plannedMinutes;
        existing.completed = existing.completed || record.completed;
        if (record.startTimestamp < existing.firstStartedAt) {
          existing.firstStartedAt = record.startTimestamp;
        }
        if (record.endTimestamp > existing.lastEndedAt) {
          existing.lastEndedAt = record.endTimestamp;
        }
      } else {
        groups.set(key, {
          key,
          taskName: getTaskName(record),
          sessions: [record],
          totalActualMinutes: record.actualMinutes,
          totalPlannedMinutes: record.plannedMinutes,
          completed: record.completed,
          firstStartedAt: record.startTimestamp,
          lastEndedAt: record.endTimestamp,
        });
      }

      return groups;
    }, new Map<string, {
      key: string;
      taskName: string;
      sessions: typeof filteredRecords;
      totalActualMinutes: number;
      totalPlannedMinutes: number;
      completed: boolean;
      firstStartedAt: Date;
      lastEndedAt: Date;
    }>()),
  )
    .map(([, group]) => group)
    .sort((a, b) => b.lastEndedAt.getTime() - a.lastEndedAt.getTime());

  const totalTaskPages = Math.ceil(groupedTaskRecords.length / sessionsPerPage);
  const paginatedTaskRecords = groupedTaskRecords.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage,
  );

  const formatTotalMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes} min`;
  };

  const toggleTaskRecords = (key: string) => {
    setExpandedTasks(current => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-orange-border">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl font-semibold card-heading text-heading-custom flex items-center mobile-text-2xl">
                <BarChart3 className="mr-2 h-6 w-6 text-[#F3793A]" />
                Reports & Analytics
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="select-task-trigger w-full min-w-48 justify-between bg-background text-foreground hover:bg-accent mobile-button-compact sm:w-auto"
                  >
                    {viewMode === "today" && "Today"}
                    {viewMode === "week" && "This Week"}
                    {viewMode === "month" && "This Month"}
                    {viewMode === "year" && "This Year"}
                    {viewMode === "all" && "All Time"}
                    {selectedRange?.from && viewMode === "custom" && (
                      selectedRange.to &&
                      !isSameDay(selectedRange.from, selectedRange.to)
                        ? `${format(selectedRange.from, "MMM d")} – ${format(selectedRange.to, "MMM d, yyyy")}`
                        : format(selectedRange.from, "MMM d, yyyy")
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto max-w-[calc(100vw-2rem)] p-0"
                  align="end"
                >
                  <div className="flex flex-col p-3 sm:flex-row sm:items-start sm:gap-4">
                      <div className="w-full space-y-1 sm:w-40 sm:shrink-0">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { handleViewModeChange("today"); setCalendarOpen(false); }}
                        >
                          Today
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { handleViewModeChange("week"); setCalendarOpen(false); }}
                        >
                          Last 7 days
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { handleViewModeChange("month"); setCalendarOpen(false); }}
                        >
                          This month
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { handleViewModeChange("year"); setCalendarOpen(false); }}
                        >
                          This year
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { handleViewModeChange("all"); setCalendarOpen(false); }}
                        >
                          All time
                        </Button>
                      </div>
                      <div className="border-t pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                        <Calendar
                          mode="range"
                          selected={selectedRange}
                          onSelect={setSelectedRange}
                          numberOfMonths={1}
                          className="rounded-md border-0"
                        />
                        <div className="flex justify-end px-3 pb-3">
                          <Button
                            size="sm"
                            className="btn-primary"
                            disabled={!selectedRange?.from}
                            onClick={() => {
                              handleViewModeChange("custom");
                              setCalendarOpen(false);
                            }}
                          >
                            Apply range
                          </Button>
                        </div>
                      </div>
                  </div>
                </PopoverContent>
                </Popover>
                <Select
                  value={labelFilter}
                  onValueChange={(value) => {
                    setLabelFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="select-task-trigger w-full sm:w-44">
                    <SelectValue placeholder="All labels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All labels</SelectItem>
                    <SelectItem value="none">Unlabeled</SelectItem>
                    {labels.map(label => (
                      <SelectItem key={label.id} value={label.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport} className="btn-secondary w-full gap-0 sm:w-auto mobile-button-compact">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Statistics Cards */}
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="reports-total-sessions bg-orange-50 rounded-lg p-4 text-center border border-[#E98B5B]">
              <div className="text-2xl font-bold text-[#F3793A] mb-1">{filteredStats.totalSessions}</div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-[#35A77A]">
              <div className="text-2xl font-bold text-[#147E50] mb-1">{filteredStats.completedTasks}</div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-500">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {Math.floor(filteredStats.totalFocusTime / 60)}h {filteredStats.totalFocusTime % 60}m
              </div>
              <p className="text-sm text-muted-foreground">Focus Time</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border border-[#EF6B6B]">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {filteredStats.averageSession > 0 ? Math.round(filteredStats.averageSession) : 0}m
              </div>
              <p className="text-sm text-muted-foreground">Avg Session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Timeline */}
      <Card className="card-orange-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold card-heading text-heading-custom flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6 text-[#147E50]" />
            Session Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-orange-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sessions found</h3>
              <p className="text-muted-foreground">Complete your first Pomodoro session to see your timeline here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pagination and session count info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>
                  {groupedTaskRecords.length} task{groupedTaskRecords.length !== 1 ? "s" : ""} across{" "}
                  {filteredRecords.length} session{filteredRecords.length !== 1 ? "s" : ""}
                </span>
                {totalTaskPages > 1 && (
                  <span>
                    Page {currentPage} of {totalTaskPages}
                  </span>
                )}
              </div>
              
              {/* Grouped tasks container */}
              <div className="min-h-[600px] max-h-[600px] overflow-y-auto space-y-4">
                {paginatedTaskRecords.map((group, index) => {
                  const progress = group.totalPlannedMinutes > 0
                    ? Math.min(
                        100,
                        (group.totalActualMinutes / group.totalPlannedMinutes) * 100,
                      )
                    : 0;
                  const previousGroup = paginatedTaskRecords[index - 1];
                  const startsDateGroup =
                    !previousGroup ||
                    !isSameDay(
                      previousGroup.lastEndedAt,
                      group.lastEndedAt,
                    );

                  return (
                    <Fragment key={group.key}>
                    {startsDateGroup && (
                      <div className="flex items-center gap-3 px-2 pt-1">
                        <span className="whitespace-nowrap text-sm font-semibold text-[#F3793A]">
                          {format(group.lastEndedAt, "EEEE, MMMM d, yyyy")}
                        </span>
                        <span className="h-px flex-1 bg-orange-200 dark:bg-orange-900/60" />
                      </div>
                    )}
                    <div 
                      className="relative border-l-4 border-[#F3793A] bg-orange-50 rounded-lg p-4 ml-4 hover:shadow-md transition-shadow"
                    >
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-[#F3793A] rounded-full border-2 border-white"></div>
                      
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{group.taskName}</h4>
                          {getStatusBadge({
                            ...group.sessions[group.sessions.length - 1],
                            completed: group.completed,
                          })}
                          {group.sessions.length > 1 && (
                            <Badge variant="outline" className="bg-white text-xs">
                              {group.sessions.length} sessions
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>
                            {formatTime(group.firstStartedAt)} –{" "}
                            {formatTime(group.lastEndedAt)}
                          </span>
                          <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-[#41210A]">
                            Total focus: {formatTotalMinutes(group.totalActualMinutes)}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Focus time vs plan</span>
                            <span>
                              {formatTotalMinutes(group.totalActualMinutes)} focused
                              {" · "}
                              {formatTotalMinutes(group.totalPlannedMinutes)} planned
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white">
                            <div
                              className={`h-2 rounded-full ${
                                group.completed ? "bg-[#147E50]" : "bg-[#F3793A]"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {group.sessions.length > 1 && (
                          <div className="mt-3 border-t border-orange-200 pt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTaskRecords(group.key)}
                              className="h-8 gap-0 px-2 text-xs text-[#F3793A] hover:bg-white/70"
                              aria-expanded={expandedTasks.has(group.key)}
                            >
                              {expandedTasks.has(group.key) ? (
                                <ChevronUp className="mr-1.5 h-4 w-4" />
                              ) : (
                                <ChevronDown className="mr-1.5 h-4 w-4" />
                              )}
                              {expandedTasks.has(group.key)
                                ? "Hide session records"
                                : `View all ${group.sessions.length} session records`}
                            </Button>

                            {expandedTasks.has(group.key) && (
                              <div className="mt-2 space-y-2">
                                {[...group.sessions]
                                  .sort(
                                    (a, b) =>
                                      a.startTimestamp.getTime() -
                                      b.startTimestamp.getTime(),
                                  )
                                  .map((session, index) => (
                                    <div
                                      key={session.id}
                                      className="rounded-lg bg-white p-3 text-sm"
                                    >
                                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-medium text-slate-900">
                                          Session {index + 1}
                                        </span>
                                        {getStatusBadge(session)}
                                      </div>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span>{formatDate(session.startTimestamp)}</span>
                                        <span>
                                          {formatTime(session.startTimestamp)} –{" "}
                                          {formatTime(session.endTimestamp)}
                                        </span>
                                        <span className="font-medium">
                                          {session.actualMinutes} min
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    </Fragment>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {totalTaskPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalTaskPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        const totalPages = totalTaskPages;
                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "btn-primary" : "btn-secondary"}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalTaskPages))}
                    disabled={currentPage === totalTaskPages}
                    className="btn-secondary"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
