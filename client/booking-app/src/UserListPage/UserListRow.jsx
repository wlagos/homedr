import React from 'react';
import { Link } from 'react-router-dom';

export const UserListRow = ({ user, onDelete }) => {
  return (
    <tr key={user.id}>
      <td>{(user.firstName) ? user.firstName : '-'}</td>
      <td>{(user.lastName) ? user.lastName : '-'}</td>
      <td>{user.email}</td>
      <td>
        <div className="btn-toolbar pull-right">
          {/*<Link to={`/user/${user.id}`} className="btn btn-primary">Edit</Link>*/}
          {/* <a onClick={onDelete.bind(this, user)} className="btn btn-danger">Delete</a> */}
        </div>
      </td>
    </tr>
  )
};
