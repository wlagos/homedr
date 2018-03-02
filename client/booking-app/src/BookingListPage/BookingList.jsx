import React from 'react';
import { BookingListRow } from './BookingListRow';

export const BookingList = ({ bookings, onDelete }) => {
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th>User</th>
          <th>LastUpdatedUser</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map(booking => BookingListRow({ booking, onDelete }))}
      </tbody>
    </table>
  )
};
