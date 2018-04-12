import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { userActions } from '../_actions';
import { UserList } from './UserList';
import { history } from '../_helpers';

class UserListPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ...props,
      loading: true
    }
    this.deleteUser = this.deleteUser.bind(this);
  }
  componentWillMount() {
    let accessTokenData = JSON.parse(localStorage.getItem('accessToken'));
    if (accessTokenData.role !== "ADMIN") {
      return history.goBack();
    }
    this.props.dispatch(userActions.getAll());
  }

  componentWillReceiveProps(nextProps) {
    console.log('nxProp', nextProps);
  }

  deleteUser(user) {
    this.props.dispatch(userActions.delete(user.id));
  }

  render() {
    const { users, loading } = this.props;
    if (loading) {
      return <div>Loading...</div>
    }
    return (
      <div>
        <div className="col-sm-12">
          <Link to="/" className="btn btn-link col-sm-1">Go back</Link>
        </div>
        <div className="">
          <h2>User Table</h2>

          <div className="row">
            <div className="col-md-6">
            </div>
            <div className="col-md-6 text-right">
              {/*<Link to="/user" className="btn btn-primary">New User</Link>*/}
            </div>
          </div>
          {(users && users.length > 0) &&
            <UserList users={users} onDelete={this.deleteUser} />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loading, users } = state.users;
  return {
    loading: loading === false ? loading : true,
    users: users || []
  };
}

const connectedUserListPage = connect(mapStateToProps)(UserListPage);
export { connectedUserListPage as UserListPage };