import { Task, Column } from '@/types/kanban';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  isDragOver: boolean;
}

export function BoardColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver,
}: BoardColumnProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      <div
        className="flex items-center justify-between p-3 rounded-t-lg mb-2"
        style={{ backgroundColor: column.color + '20', borderLeft: `4px solid ${column.color}` }}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">{column.name}</h2>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={`flex-1 p-2 rounded-lg transition-colors ${
          isDragOver ? 'bg-accent/50 border-2 border-dashed border-primary' : 'bg-muted/30'
        } overflow-y-auto`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.id)}
      >
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}
