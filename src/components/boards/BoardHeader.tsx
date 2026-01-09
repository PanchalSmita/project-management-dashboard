import React from 'react';

const BoardHeader: React.FC<{ title?: string }> = ({ title }) => (
  <header className="board-header">{title || 'Board'}</header>
);

export default BoardHeader;
