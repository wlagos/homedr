import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as moment from 'moment';

import { userActions } from '../_actions';

import { statesList } from '../_constants';

class RegisterPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: 'United States'
      },
      submitted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inValidDob = this.inValidDob.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        [name]: value
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({ submitted: true });
    let { user } = this.state;
    const { dispatch } = this.props;
    const REQUIRED_FIELDS = ['firstName', 'lastName', 'dob', 'email', 'password', 'address1', 'address2', 'state', 'city', 'zip', 'country', 'terms']

    let allValid = true;
    _.forEach(REQUIRED_FIELDS, (value, index) => {
      if (_.isEmpty(user[value])) {
        allValid = false;
        return;
      }
    });

    if (allValid && (user.password === user.confirmPassword)) {
      user.birthYear = moment(user.dob).format('YYYY');
      user.birthMonth = moment(user.dob).format('MM');
      user.birthDate = moment(user.dob).format('DD');
      user = _.omit(user, ['confirmPassword']);
      dispatch(userActions.register(user));
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
    const { registering } = this.props;
    const { user, submitted } = this.state;
    return (
      <div className="col-md-8 col-md-offset-2">
        <h2>Register</h2>
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
            <input type="date" className="form-control" name="dob" max={moment().format('YYYY-MM-DD')} value={user.dob} onChange={this.handleChange} />
            {(submitted && !user.dob &&
              <div className="help-block">Date of Birth is required</div>) ||
              (submitted && this.inValidDob() &&
                <div className="help-block">Must be 18 years or above!</div>)
            }
          </div>
          <div className={'form-group' + (submitted && !user.email ? ' has-error' : '')}>
            <label htmlFor="email">Email</label>
            <input type="text" className="form-control" name="email" value={user.email} onChange={this.handleChange} />
            {submitted && !user.email &&
              <div className="help-block">Email is required</div>
            }
          </div>
          <div className={'form-group' + (submitted && (!user.state || user.state === 'State State') ? ' has-error' : '')}>
            <label htmlFor="state">State</label>
            <select className="form-control" name="state" value={user.state} onChange={this.handleChange}>
              <option value="State State">Select State</option>
              {this.props.states.map(function (value, index) {
                return (
                  <option key={value} value={value}>{value}</option>
                )
              })}
            </select>
            {submitted && (!user.state || user.state === 'State State') &&
              <div className="help-block">State is required</div>
            }
          </div>
          <div className={'form-group' + (submitted && !user.password ? ' has-error' : '')}>
            <label htmlFor="password">Password</label>
            <input type="password" className="form-control" name="password" value={user.password} onChange={this.handleChange} />
            {submitted && !user.password &&
              <div className="help-block">Password is required</div>
            }
          </div>
          <div className={'form-group' + (submitted && (!user.confirmPassword || (user.password !== user.confirmPassword)) ? ' has-error' : '')}>
            <label htmlFor="password">Confirm Password</label>
            <input type="password" className="form-control" name="confirmPassword" value={user.confirmPassword} onChange={this.handleChange} />
            {(submitted && !user.confirmPassword &&
              <div className="help-block">Confirm Password is required</div>) ||
              (submitted && (user.confirmPassword !== user.password) &&
                <div className="help-block">Password did not match!</div>)
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
          <div className={'form-group' + (submitted && !user.zip ? ' has-error' : '')}>
            <label htmlFor="zip">Zip</label>
            <input type="text" className="form-control" name="zip" value={user.zip} onChange={this.handleChange} />
            {submitted && !user.zip &&
              <div className="help-block">Zip is required</div>
            }
          </div>
          <div className={'form-group' + (submitted && !user.country ? ' has-error' : '')}>
            <label htmlFor="country">Country</label>
            <input type="text" className="form-control" name="country" value={user.country} onChange={this.handleChange} />
            {submitted && !user.country &&
              <div className="help-block">Country is required</div>
            }
          </div>
          <div className={'form-group' + (submitted && !user.terms ? ' has-error' : '') + ' checkbox'}>
            <label htmlFor="terms"><input type="checkbox" name="terms" value={user.terms} onChange={this.handleChange} /> Terms</label>
            {submitted && !user.terms &&
              <div className="help-block">Please agree to terms and services</div>
            }
          </div>
          <div className='form-group checkbox'>
            <label htmlFor="subscription"><input type="checkbox" name="subscription" value={user.subscription} onChange={this.handleChange} /> Subscribe</label>
          </div>
          <div className="form-group">
            <button className="btn btn-primary">Register</button>
            {registering &&
              <img alt='' src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            }
            <Link to="/login" className="btn btn-link">Cancel</Link>
          </div>
        </form>
      </div>
    );
  }
}

RegisterPage.defaultProps = {
  states: statesList
};

function mapStateToProps(state) {
  const { registering } = state.registration;
  return {
    registering
  };
}

const connectedRegisterPage = connect(mapStateToProps)(RegisterPage);
export { connectedRegisterPage as RegisterPage };