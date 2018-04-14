import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { bookingActions } from '../_actions';

import { statesList } from '../_constants';

import { userService, bookingService } from '../_services';

class EditBookingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      booking: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        status: 'PENDING'
      },
      ...props,
      status: '',
      submitted: false,
      role: 'PATIENT'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && !_.isEmpty(nextProps.booking)) {
      this.state.booking = nextProps.booking;
      this.setState(this.state);
    }
  }

  componentWillMount() {
    let accessTokenData = JSON.parse(localStorage.getItem('accessToken'));
    this.state.role = accessTokenData.role || 'PATIENT';
    this.setState(this.state);
  }

  componentDidMount() {
    bookingService.getById(this.props.bookingId)
      .then((response) => {
        if (response.error) {
          console.error('resp error', response.error);
          return;
        }
        this.state.booking = response;
        this.state.status = response.status;
        this.state.loading = false;
        // this.props.loading = false;
        this.setState(this.state);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleChange(event) {
    const { name, value } = event.target;
    const { booking } = this.state;
    booking[name] = value;
    this.state.booking = booking;
    this.setState(this.state);
  }

  handleSubmit(event) {
    debugger;
    event.preventDefault();
    this.state.submitted = true;
    // this.setState({ submitted: true });
    const { booking } = this.state;
    const { dispatch, currentUserId } = this.props;
    const REQUIRED_FIELDS = ['address1', 'address2', 'city', 'state', 'country']

    let allValid = true;
    _.forEach(REQUIRED_FIELDS, (value, index) => {
      if (_.isEmpty(booking[value])) {
        allValid = false;
        return;
      }
    });

    if (!booking['zip'] || (booking['zip'].toString().length !== 5)) {
      allValid = false;
      return;
    }
    if (allValid && (booking.state !== 'Select State')) {
      this.setState(this.state);
      const { dispatch } = this.props;
      dispatch(bookingActions.updateById(this.props.bookingId, booking));
    }
  }

  updateStatus(status, event) {
    event.preventDefault();
    const { dispatch } = this.props;
    let updateData = {
      status
    }
    dispatch(bookingActions.updateById(this.props.bookingId, updateData));
  }

  render() {
    // const { loading } = this.props;
    const { booking, submitted, loading, status, role } = this.state;
    if (loading) {
      return <div>Loading...</div>
    }
    return (
      <div>
        <Link to="/bookings" className="btn btn-link">Go back</Link>
        <div className="col-md-6 col-md-offset-3">
          <h2>Booking</h2>
          <form name="form" onSubmit={this.handleSubmit}>
            <div className={'form-group' + (submitted && !booking.address1 ? ' has-error' : '') + 'disabled'}>
              <label htmlFor="address1">Address 1</label>
              <input type="text" className="form-control" name="address1" value={booking.address1} onChange={this.handleChange} />
              {submitted && !booking.address1 &&
                <div className="help-block">Address 1 is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && !booking.address2 ? ' has-error' : '') + 'disabled'}>
              <label htmlFor="address2">Address 2</label>
              <input type="text" className="form-control" name="address2" value={booking.address2} onChange={this.handleChange} />
              {submitted && !booking.address2 &&
                <div className="help-block">Address 2 is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && !booking.city ? ' has-error' : '')}>
              <label htmlFor="city">City</label>
              <input type="text" className="form-control" name="city" value={booking.city} onChange={this.handleChange} />
              {submitted && !booking.city &&
                <div className="help-block">City is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && (!booking.state || booking.state === 'State State') ? ' has-error' : '')}>
              <label htmlFor="state">State</label>
              <select className="form-control" name="state" value={booking.state} onChange={this.handleChange}>
                <option value="State State">Select State</option>
                {this.props.states.map(function (value, index) {
                  return (
                    <option key={value} value={value}>{value}</option>
                  )
                })}
              </select>
              {submitted && (!booking.state || booking.state === 'State State') &&
                <div className="help-block">State is required</div>
              }
            </div>
            <div className={'form-group' + (submitted && (!booking.zip || (booking.zip.toString().length !== 5)) ? ' has-error' : '')}>
              <label htmlFor="zip">Zip</label>
              <input type="text" className="form-control" name="zip" value={booking.zip} onChange={this.handleChange} />
              {(submitted && !booking.zip &&
                <div className="help-block">Zip is required</div>) ||
                (submitted && (booking.zip.toString().length !== 5) &&
                  <div className="help-block">Zip must be of length 5</div>)
              }
            </div>
            <div className={'form-group' + (submitted && !booking.country ? ' has-error' : '')}>
              <label htmlFor="country">Country</label>
              <input type="text" className="form-control" name="country" value={booking.country} onChange={this.handleChange} />
              {submitted && !booking.country &&
                <div className="help-block">Country is required</div>
              }
            </div>
            {
              (role === 'DISPATCHER' || role === 'ADMIN')?
              <div className={'form-group'}>
                <label htmlFor="state">Provider</label>
                <select className="form-control" name="providerId" disabled={booking.status !== 'PENDING'} value={booking.providerId} onChange={this.handleChange}>
                  <option value="">Select Provider</option>  
                  <option value="5ad157deac78af35f4e84fd1">Provider HomeDr</option>
                </select>
              </div>
              : <span></span>
            }
            {/*
              <div className={'form-group' + (submitted && (!booking.status) ? ' has-error' : '')}>
              <label htmlFor="state">Status</label>
              <select className="form-control" name="status" disabled={status === 'COMPLETED' || status === 'CANCELLED'} value={booking.status} onChange={this.handleChange}>
                <option value="PENDING">PENDING</option>
                <option value="COFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETE</option>
                <option value="CANCELLED">CANCEL</option>
              </select>
              {submitted && (!booking.status) &&
                <div className="help-block">Status is required</div>
              }
              </div>
            */}
            <div className="form-group">
              <button className="btn btn-primary" disabled={booking.status !== 'PENDING'} >Update</button>&nbsp;&nbsp;
              {
                (role !== 'PATIENT') ?
                  <span><button className="btn btn-primary" disabled={booking.status !== 'CONFIRMED'} onClick={(event) => this.updateStatus('COMPLETED', event)}>Complete</button> &nbsp; &nbsp;</span>
                  : <span></span>
              }
              <button className="btn btn-danger" disabled={booking.status === 'COMPLETED' || booking.status === 'CANCELLED'} onClick={(event) => this.updateStatus('CANCELLED', event)}>Cancel</button>&nbsp;&nbsp;
              {loading &&
                <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
              }
            </div>
          </form>
        </div>
      </div>
    );
  }
}

EditBookingPage.defaultProps = {
  states: statesList
};

function mapStateToProps(state, ownProps) {

  const bookingId = ownProps.match.params.id;
  const { booking, loading } = state.booking;
  const { currentUserId } = state.authentication;
  debugger;
  return {
    loading: loading === false ? loading : true,
    currentUserId,
    bookingId,
    booking: booking || {}
  };
}

const connectedEditBookingPage = connect(mapStateToProps)(EditBookingPage);
export { connectedEditBookingPage as EditBookingPage };