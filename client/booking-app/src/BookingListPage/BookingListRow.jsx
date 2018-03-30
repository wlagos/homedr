import React from 'react';
import { Link } from 'react-router-dom';

export const BookingListRow = ({ booking, onDelete }) => {
  return (
    <tr key={booking.id}>
      <td>{(booking.user) ? booking.user.firstName : '-'}</td>
      <td>{(booking.lastUpdater) ? booking.lastUpdater.firstName : '-'}</td>
      <td>{booking.status}</td>
      <td>
        <div className="btn-toolbar pull-right">
          <Link to={`/booking/${booking.id}`} className="btn btn-primary">Edit</Link>
          {/* <a onClick={onDelete.bind(this, booking)} className="btn btn-danger">Delete</a> */}
        </div>
      </td>
    </tr>
  )
};
