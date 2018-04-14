import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { bookingActions } from '../_actions';

import { BookingList } from './BookingList';

class BookingListPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ...props,
      role: 'PATIENT'
    };
    this.deleteBooking = this.deleteBooking.bind(this);
  }
  componentWillMount() {
    this.props.dispatch(bookingActions.getAll());
    let accessTokenData = JSON.parse(localStorage.getItem('accessToken'));
    if(accessTokenData) {
      this.state.role = accessTokenData.role || 'PATIENT';
      this.setState(this.state);
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('nxProp', nextProps);
  }

  deleteBooking(booking) {
    this.props.dispatch(bookingActions.delete(booking.id));
  }

  render() {
    const { user, users, bookings, _booking } = this.props;
    const { role } = this.state;
    console.log("_Booking", _booking);
    if (_booking) {
      return <div>Loading...</div>
    }
    return (
      <div>
        <Link to="/" className="btn btn-link">Go back</Link>
        <div className="">
          <h2>Booking Table</h2>

          <div className="row">
            <div className="col-md-6">
            </div>
            {
              role === 'PATIENT' ?
              <div className="col-md-6 text-right">
                <Link to="/booking" className="btn btn-primary">New Booking</Link>
              </div>
              : <span></span>
            }
          </div>
          {(bookings && bookings.length > 0) &&
            <BookingList bookings={bookings} onDelete={this.deleteBooking} />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { users, authentication, booking } = state;
  const { user } = authentication.user;
  const { bookings, booking: _booking } = booking;
  console.log('booking', booking);
  return {
    user,
    users,
    bookings,
    _booking
  };
}

const connectedBookingListPage = connect(mapStateToProps)(BookingListPage);
export { connectedBookingListPage as BookingListPage };