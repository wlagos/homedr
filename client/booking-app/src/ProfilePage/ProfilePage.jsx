import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as moment from 'moment';

import { userActions } from '../_actions';

import { statesList } from '../_constants';

import { userService } from '../_services';

class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      passwordData: {
        oldPassword: '',
        newPassword: ''
      },
      loading: true,
      submitted: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.inValidDob = this.inValidDob.bind(this);
  }

  componentDidMount() {
    let userData = JSON.parse(localStorage.getItem('user'));
    this.state.userId = userData.id;
    userService.getById(userData.id)
      .then((response) => {
        if (response.error) {
          console.error('resp error', response.error);
          return;
        }
        this.state.user = response;
        this.state.loading = false;
        this.setState(this.state);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleChange(event) {
    const { name, value } = event.target;
    const { user } = this.state;
    let _value = value;
    if (name === 'subscription') {
      _value = event.target.checked;
    }
    user[name] = _value;
    this.state.user = user;
    this.setState(this.state);
  }

  handlePasswordChange(event) {
    const { name, value } = event.target;
    const { passwordData } = this.state;
    let _value = value;
    passwordData[name] = _value;
    this.state.passwordData = passwordData;
    this.setState(this.state);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ submitted: true });
    // this.setState({ submitted: true });
    const { user, userId } = this.state;
    const { dispatch } = this.props;
    const REQUIRED_FIELDS = ['address1', 'address2', 'city', 'state', 'country']

    let allValid = true;
    _.forEach(REQUIRED_FIELDS, (value, index) => {
      if (!user[value] || _.isEmpty(user[value])) {
        allValid = false;
        return;
      }
    });

    if (!user['zip']) {
      allValid = false;
    }

    if (allValid && (user.state !== 'Select State') && (user.zip && user.zip.toString().length === 5)) {
      this.setState(this.state);
      const { dispatch } = this.props;
      let updateData = _.pick(user, ['firstName', 'lastName', 'dob', 'state', 'address1', 'address2', 'city', 'zip', 'country', 'subscription']);
      dispatch(userActions.updateById(userId, updateData));
    }
  }

  handlePasswordSubmit(event) {
    event.preventDefault();
    this.setState({ passwordSubmitted: true });
    // this.setState({ submitted: true });
    const { passwordData, userId } = this.state;
    const { dispatch } = this.props;
    const REQUIRED_FIELDS = ['oldPassword', 'newPassword']

    let allValid = true;
    _.forEach(REQUIRED_FIELDS, (value, index) => {
      if (!passwordData[value] || _.isEmpty(passwordData[value])) {
        allValid = false;
        return;
      }
    });

    if (allValid) {
      this.setState(this.state);
      const { dispatch } = this.props;
      dispatch(userActions.changePassword(userId, passwordData));
    }
  }

  inValidDob() {
    const { user } = this.state;

    const currentDate = moment();
    const dob = moment(user.dob);

    const years = currentDate.diff(dob, 'years');
    if (years >= 18) {
      return false;
    }
    return true;
  }

  render() {
    // const { loading } = this.props;
    const { user, submitted, loading, passwordData, passwordSubmitted } = this.state;
    if (loading) {
      return <div>Loading...</div>
    }
    return (
      <div>
        <div className="col-sm-12">
          <Link to="/" className="btn btn-link col-sm-1">Go back</Link>
        </div>
        <div className="col-sm-6">
          <h2>Profile</h2>
          <form name="form" onSubmit={this.handleSubmit}>
            <div className={'form-group' + (submitted && !user.firstName ? ' has-error' : '')}>
              <label htmlFor="firstName">First Name</label>
              <input type="text" className="form-control" name="firstName" value={user.firstName} onChange={this.handleChange} />
              {submitted && !user.firstName &&
                <div className="help-block">First Name is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && !user.lastName ? ' has-error' : '')}>
              <label htmlFor="lastName">Last Name</label>
              <input type="text" className="form-control" name="lastName" value={user.lastName} onChange={this.handleChange} />
              {submitted && !user.lastName &&
                <div className="help-block">Last Name is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && (!user.dob || this.inValidDob()) ? ' has-error' : '')}>
              <label htmlFor="dob">Date of Birth</label>
              <input type="date" className="form-control" name="dob" max={moment().format('YYYY-MM-DD')} value={moment(user.dob).format('YYYY-MM-DD')} onChange={this.handleChange} />
              {(submitted && !user.dob &&
                <div className="help-block">Date of Birth is required</div>) ||
                (submitted && this.inValidDob() &&
                  <div className="help-block">Must be 18 years or above!</div>)
              }
            </div>
            <div className={'form-group' + (submitted && !user.email ? ' has-error' : '') + ' disabled'}>
              <label htmlFor="email">Email</label>
              <input type="text" className="form-control" disabled name="email" value={user.email} onChange={this.handleChange} />
              {submitted && !user.email &&
                <div className="help-block">Email is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && (!user.state || user.state === 'Select State') ? ' has-error' : '')}>
              <label htmlFor="state">State</label>
              <select className="form-control" name="state" value={user.state} onChange={this.handleChange}>
                <option value="Select State">Select State</option>
                {this.props.states.map(function (value, index) {
                  return (
                    <option key={value} value={value}>{value}</option>
                  )
                })}
              </select>
              {submitted && (!user.state || user.state === 'Select State') &&
                <div className="help-block">State is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && !user.address1 ? ' has-error' : '')}>
              <label htmlFor="address1">Address 1</label>
              <input type="text" className="form-control" name="address1" value={user.address1} onChange={this.handleChange} />
              {submitted && !user.address1 &&
                <div className="help-block">Address 1 is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && !user.address2 ? ' has-error' : '')}>
              <label htmlFor="address2">Address 2</label>
              <input type="text" className="form-control" name="address2" value={user.address2} onChange={this.handleChange} />
              {submitted && !user.address2 &&
                <div className="help-block">Address 2 is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && !user.city ? ' has-error' : '')}>
              <label htmlFor="city">City</label>
              <input type="text" className="form-control" name="city" value={user.city} onChange={this.handleChange} />
              {submitted && !user.city &&
                <div className="help-block">City is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && (!user.zip || (user.zip.toString().length != 5)) ? ' has-error' : '')}>
              <label htmlFor="zip">Zip</label>
              <input type="text" className="form-control" name="zip" value={user.zip} onChange={this.handleChange} />
              {(submitted && !user.zip &&
                <div className="help-block">Zip is required</div>) ||
                (submitted && (user.zip.toString().length != 5) &&
                  <div className="help-block">Zip must be of length 5</div>)
              }
            </div>
            <div className={'form-group' + (submitted && !user.country ? ' has-error' : '')}>
              <label htmlFor="country">Country</label>
              <input type="text" className="form-control" name="country" value={user.country} onChange={this.handleChange} />
              {submitted && !user.country &&
                <div className="help-block">Country is required</div>
              }
            </div>
            <div className='form-group checkbox'>
              <label htmlFor="subscription"><input type="checkbox" name="subscription" value={user.subscription} checked={user.subscription} onChange={this.handleChange} /> Subscribe</label>
            </div>
            <div className="form-group">
              <button className="btn btn-primary">Update</button>
              {loading &&
                <img alt='' src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
              }
            </div>
          </form>
        </div>
        <div className="col-sm-5 col-sm-offset-1">
          <h2>Change Password</h2>
          <form name="form" onSubmit={this.handlePasswordSubmit}>
            <div className={'form-group' + (passwordSubmitted && !passwordData.oldPassword ? ' has-error' : '')}>
              <label htmlFor="oldPassword">old Password</label>
              <input type="password" className="form-control" name="oldPassword" value={passwordData.oldPassword} onChange={this.handlePasswordChange} />
              {passwordSubmitted && !passwordData.oldPassword &&
                <div className="help-block">Old Password is required</div>
              }
            </div>
            <div className={'form-group' + (passwordSubmitted && !passwordData.newPassword ? ' has-error' : '')}>
              <label htmlFor="newPassword">new Password</label>
              <input type="password" className="form-control" name="newPassword" value={passwordData.newPassword} onChange={this.handlePasswordChange} />
              {passwordSubmitted && !passwordData.newPassword &&
                <div className="help-block">New Password is required</div>
              }
            </div>
            <div className="form-group">
              <button className="btn btn-primary">Change Password</button>
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

ProfilePage.defaultProps = {
  states: statesList
};

function mapStateToProps(state, ownProps) {
  const { loading, user } = state.users;
  return {
    loading: loading === false ? loading : true,
    user
  };
}

const connectedProfilePage = connect(mapStateToProps)(ProfilePage);
export { connectedProfilePage as ProfilePage };