import React from 'react';
import UserCard from './UserCard';

const UserList: React.FC<{ users: { id: string; name: string }[] }> = ({ users }) => (
  <div className="user-list">
    {users.map((u) => (
      <UserCard key={u.id} name={u.name} />
    ))}
  </div>
);

export default UserList;
