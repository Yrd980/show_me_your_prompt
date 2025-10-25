import { useMemo } from 'react';
import { Task, Column } from '@/types/kanban';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatsPanelProps {
  tasks: Task[];
  columns: Column[];
}

export function StatsPanel({ tasks, columns }: StatsPanelProps) {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const doneColumn = columns.find((col) => col.id === 'done');
    const doneTasks = doneColumn
      ? tasks.filter((task) => task.columnId === doneColumn.id).length
      : 0;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const priorityBreakdown = {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    };

    const columnCounts = columns.map((col) => ({
      column: col,
      count: tasks.filter((t) => t.columnId === col.id).length,
    }));

    return { totalTasks, doneTasks, completionRate, priorityBreakdown, columnCounts };
  }, [tasks, columns]);

  return (
    <Card className="p-4 mb-4">
      <h2 className="text-lg font-semibold mb-4">Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.totalTasks}</div>
          <div className="text-xs text-muted-foreground">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.doneTasks}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <div className="text-xs text-muted-foreground">Completion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.priorityBreakdown.high}</div>
          <div className="text-xs text-muted-foreground">High Priority</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium mb-2">Tasks by Column</div>
          <div className="flex flex-wrap gap-2">
            {stats.columnCounts.map(({ column, count }) => (
              <div
                key={column.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
                style={{ borderLeftWidth: '3px', borderLeftColor: column.color }}
              >
                <span className="text-sm font-medium">{column.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Priority Breakdown</div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">High: {stats.priorityBreakdown.high}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Medium: {stats.priorityBreakdown.medium}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Low: {stats.priorityBreakdown.low}</span>
            </div>
          </div>
        </div>

        {stats.totalTasks > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Progress</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
