import React from 'react';
import { UserListRow } from './UserListRow';

export const UserList = ({ users, onDelete }) => {
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => UserListRow({ user, onDelete }))}
      </tbody>
    </table>
  )
};
