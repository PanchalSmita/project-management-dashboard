import React from 'react';

const UserCard: React.FC<{ name: string }> = ({ name }) => <div className="user-card">{name}</div>;

export default UserCard;
