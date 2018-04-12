import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { userActions } from '../_actions';

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      isAdmin: false
    }
  }

  componentDidMount() {
    // this.props.dispatch(userActions.getAll());
  }

  componentWillMount() {
    let accessTokenData = JSON.parse(localStorage.getItem('accessToken'));
    if (accessTokenData.role === "ADMIN") {
      this.state.isAdmin = true;
      this.setState(this.state);
    }
  }

  handleDeleteUser(id) {
    return (e) => this.props.dispatch(userActions.delete(id));
  }

  render() {
    const { user } = this.props;
    const { isAdmin } = this.state;
    if (user) {
      return (
        <div className="col-md-6 col-md-offset-3">
          <h1>Hi {user.firstName} {user.lastName}!</h1>
          <p>You're logged in with {user.email}!!</p>
          <p>
            <Link to="/profile">Profile</Link><br />
            {isAdmin ?
              <div><Link to="/users">Users</Link><br /></div>
              : <span></span>
            }
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
  const { authentication } = state;
  const { user } = authentication;
  return {
    user
  };
}

const connectedHomePage = connect(mapStateToProps)(HomePage);
export { connectedHomePage as HomePage };