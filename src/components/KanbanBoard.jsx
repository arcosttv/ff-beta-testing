import React from 'react';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard({
  tasks,
  activeCharacter,
  selectedCategory,
  searchQuery,
  onSelectTask,
  onClaimTask,
  onMoveTask,
  onOpenCreateModal
}) {
  const columns = ['To Test', 'In Progress', 'Result', 'Failed'];

  // Filter tasks based on category & search query
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || task.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (task.title && task.title.toLowerCase().includes(query)) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.assigned_to && task.assigned_to.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((columnTitle) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === columnTitle
          );

          return (
            <KanbanColumn
              key={columnTitle}
              title={columnTitle}
              tasks={columnTasks}
              activeCharacter={activeCharacter}
              onSelectTask={onSelectTask}
              onClaimTask={onClaimTask}
              onMoveTask={onMoveTask}
              onOpenCreateModal={onOpenCreateModal}
            />
          );
        })}
      </div>
    </div>
  );
}
