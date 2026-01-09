import React from 'react';

type Task = { id: string; title: string };

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
  <div className="task-card">{task.title}</div>
);

export default TaskCard;
