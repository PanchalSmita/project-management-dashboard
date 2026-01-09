import React from 'react';
import TaskCard from './TaskCard';

const TaskList: React.FC<{ tasks: { id: string; title: string }[] }> = ({ tasks }) => (
  <div className="task-list">
    {tasks.map((t) => (
      <TaskCard key={t.id} task={t} />
    ))}
  </div>
);

export default TaskList;
