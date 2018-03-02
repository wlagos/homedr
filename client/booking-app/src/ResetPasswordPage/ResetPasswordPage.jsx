import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { userActions } from '../_actions';

import { statesList } from '../_constants';

class ResetPasswordPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        newPassword: ''
      },
      submitted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    const { data } = this.state;
    this.setState({
      data: {
        ...data,
        [name]: value
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const queryString = new URLSearchParams(this.props.location.search);
    const token = queryString.get('access_token') || '';
    this.setState({ submitted: true });
    const { dispatch } = this.props;
    const { data } = this.state;
    if (data.newPassword) {
      dispatch(userActions.resetPassword(token, data));
    }
  }

  render() {
    const { resetPassword } = this.props;
    const { data, submitted } = this.state;
    return (
      <div className="col-md-8 col-md-offset-2">
        <h2>Reset Password</h2>
        <form name="form" onSubmit={this.handleSubmit}>
          <div className={'form-group' + (submitted && !data.newPassword ? ' has-error' : '')}>
            <label htmlFor="newPassword">Reset Password</label>
            <input type="password" className="form-control" name="newPassword" value={data.newPassword} onChange={this.handleChange} />
            {submitted && !data.newPassword &&
              <div className="help-block">Password is required</div>
            }
          </div>
          <div className="form-group">
            <button className="btn btn-primary">Submit</button>
            {resetPassword &&
              <img alt='' src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            }
            <Link to="/login" className="btn btn-link">Cancel</Link>
          </div>
        </form>
      </div>
    );
  }
}

ResetPasswordPage.defaultProps = {
  states: statesList
};

function mapStateToProps(state) {
  const { resetPassword } = state.resetPassword;
  return {
    resetPassword
  };
}

const connectedResetPasswordPage = connect(mapStateToProps)(ResetPasswordPage);
export { connectedResetPasswordPage as ResetPasswordPage };