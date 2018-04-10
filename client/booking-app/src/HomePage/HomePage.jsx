import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { userActions } from '../_actions';

class HomePage extends React.Component {
  componentDidMount() {
    // this.props.dispatch(userActions.getAll());
  }

  handleDeleteUser(id) {
    return (e) => this.props.dispatch(userActions.delete(id));
  }

  render() {
    const { user } = this.props;
    if (user) {
      return (
        <div className="col-md-6 col-md-offset-3">
          <h1>Hi {user.firstName} {user.lastName}!</h1>
          <p>You're logged in with {user.email}!!</p>
          <p>
            <Link to="/profile">Profile</Link><br />
            <Link to="/bookings">Bookings</Link><br />
            <Link to="/booking">Book</Link><br />
            <Link to="/login">Logout</Link>
          </p>
        </div>
      );
    } else {
      return (
        <div className="col-md-6 col-md-offset-3">
          <h1>Welcome!</h1>
          <p></p>
          <p>
            <Link to="/register">Register</Link><br />
            <Link to="/login">Login</Link>
          </p>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  const { users, authentication } = state;
  const { user } = authentication;
  return {
    user,
    users
  };
}

const connectedHomePage = connect(mapStateToProps)(HomePage);
export { connectedHomePage as HomePage };