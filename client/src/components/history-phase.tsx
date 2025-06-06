import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, BarChart3 } from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";

export function HistoryPhase() {
  const { records, getStats } = useSessions();
  const stats = getStats();

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
    a.download = 'pomodoro-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Session History</CardTitle>
          <div className="flex space-x-3">
            <Select defaultValue="week">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Cards */}
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

        {/* History Table */}
        {records.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No sessions yet</h3>
            <p className="text-slate-500">Complete your first Pomodoro session to see your history here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Task</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Start Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">End Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Planned</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Actual</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .sort((a, b) => b.startTimestamp.getTime() - a.startTimestamp.getTime())
                  .map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-800 font-medium">{record.taskName}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(record.startTimestamp)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatTime(record.startTimestamp)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatTime(record.endTimestamp)}</td>
                      <td className="py-3 px-4 text-slate-600">{record.plannedMinutes} min</td>
                      <td className="py-3 px-4 text-slate-600">{record.actualMinutes} min</td>
                      <td className="py-3 px-4">{getStatusBadge(record)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
