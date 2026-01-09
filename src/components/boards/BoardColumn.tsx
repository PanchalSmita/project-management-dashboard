import React from 'react';

type Props = { title: string; children?: React.ReactNode };

const BoardColumn: React.FC<Props> = ({ title, children }) => (
  <div className="board-column">
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
);

export default BoardColumn;
