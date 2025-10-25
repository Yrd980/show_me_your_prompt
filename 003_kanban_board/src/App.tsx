import { useState } from 'react';
import { Task, Column, KanbanState } from '@/types/kanban';
import { BoardColumn } from '@/components/BoardColumn';
import { TaskDialog } from '@/components/TaskDialog';
import { StatsPanel } from '@/components/StatsPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import columnsData from '@/data/columns.json';
import tasksData from '@/data/tasks.json';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus } from 'lucide-react';

const initialColumns = columnsData.columns as Column[];
const initialTasks = tasksData.tasks as Task[];

function App() {
  const [kanbanState, setKanbanState] = useLocalStorage<KanbanState>('kanbanState', {
    tasks: initialTasks,
    columns: initialColumns,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>(undefined);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);

  const handleAddTask = (columnId: string) => {
    setDefaultColumnId(columnId);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultColumnId(undefined);
    setDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setKanbanState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'order'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing task
      setKanbanState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                tags: taskData.tags,
                columnId: taskData.columnId,
              }
            : t
        ),
      }));
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        tags: taskData.tags,
        columnId: taskData.columnId,
        createdAt: Date.now(),
        order: kanbanState.tasks.filter((t) => t.columnId === taskData.columnId).length,
      };

      setKanbanState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
      }));
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedTaskId) return;

    const draggedTask = kanbanState.tasks.find((t) => t.id === draggedTaskId);
    if (!draggedTask || draggedTask.columnId === targetColumnId) {
      setDraggedTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    // Move task to new column
    setKanbanState((prev) => {
      const tasksInTargetColumn = prev.tasks.filter(
        (t) => t.columnId === targetColumnId && t.id !== draggedTaskId
      );

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === draggedTaskId
            ? { ...t, columnId: targetColumnId, order: tasksInTargetColumn.length }
            : t
        ),
      };
    });

    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const sortedColumns = [...kanbanState.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks between columns
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showStats ? 'default' : 'outline'}
            onClick={() => setShowStats(!showStats)}
            size="sm"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          <Button onClick={() => handleAddTask(sortedColumns[0]?.id)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {showStats && (
          <StatsPanel tasks={kanbanState.tasks} columns={kanbanState.columns} />
        )}

        <div className="flex gap-4 h-full pb-4">
          {sortedColumns.map((column) => {
            const columnTasks = kanbanState.tasks.filter(
              (task) => task.columnId === column.id
            );
            return (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragOver={dragOverColumnId === column.id}
              />
            );
          })}
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        columns={kanbanState.columns}
        defaultColumnId={defaultColumnId}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default App;
