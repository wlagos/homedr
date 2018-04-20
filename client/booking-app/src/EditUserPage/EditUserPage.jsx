import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as moment from 'moment';

import { bookingActions, userActions } from '../_actions';

import { statesList } from '../_constants';

import { userService, bookingService } from '../_services';

class EditUserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      ...props,
      user: {
        firstName: '',
        lastName: '',
        email: '',
      },
      submitted: false,
      role: 'PATIENT'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && !_.isEmpty(nextProps.user)) {
      this.state.user = nextProps.user;
      this.state.role = nextProps.user.role || 'PATIENT';
      this.state.loading = nextProps.loading;
      this.setState(this.state);
    }
  }

  componentWillMount() {
    let userId = this.state.userId;
    const { dispatch } = this.props;
    dispatch(userActions.getById(userId));
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.state.role = value;
    this.setState(this.state);
  }

  handleSubmit(event) {
    event.preventDefault();

    const { dispatch } = this.props;
    let data = {
      userId: this.state.user.id,
      role: this.state.role
    }
    dispatch(userActions.assignRole(data));
  }

  render() {
    // const { loading } = this.props;
    const { submitted, loading, role, user } = this.state;
    if (loading) {
      return <div>Loading...</div>
    }
    return (
      <div>
        <Link to="/users" className="btn btn-link">Go back</Link>
        <div className="col-md-6 col-md-offset-3">
          <h2>Manage User</h2>
          <form name="form" onSubmit={this.handleSubmit}>
            <div className='form-group disabled'>
              <label htmlFor="firstName">First Name</label>
              <input type="text" className="form-control" disabled name="firstName" value={user.firstName} />
            </div>
            <div className='form-group disabled'>
              <label htmlFor="lastName">Last Name</label>
              <input type="text" className="form-control" disabled name="lastName" value={user.lastName} />
            </div>
            <div className='form-group disabled'>
              <label htmlFor="email">Email</label>
              <input type="text" className="form-control" disabled name="email" value={user.email} />
            </div>
            <div className='form-group'>
              <label htmlFor="role">Role</label>
              <select className="form-control" name="role" value={role} onChange={this.handleChange}>
                <option value="ADMIN">ADMIN</option>
                <option value="DISPATCHER">DISPATCHER</option>
                <option value="PROVIDER">PROVIDER</option>
                <option value="PATIENT">PATIENT</option>
              </select>
            </div>
            <div className="form-group">
              <button className="btn btn-primary">Change Role</button>
              {loading &&
                <img alt='' src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
              }
            </div>
          </form>
        </div>
      </div>
    );
  }
}

EditUserPage.defaultProps = {
  states: statesList
};

function mapStateToProps(state, ownProps) {

  const userId = ownProps.match.params.id;
  const { user, loading } = state.users;
  return {
    loading: loading === false ? loading : true,
    user,
    userId
  };
}

const connectedEditUserPage = connect(mapStateToProps)(EditUserPage);
export { connectedEditUserPage as EditUserPage };