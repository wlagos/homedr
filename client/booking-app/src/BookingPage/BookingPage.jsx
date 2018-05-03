import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';

import { SplitForm } from '../Payment';
import Datetime from 'react-datetime';
import '../style/picker.css';
import '../Payment/split-form.css';
import Phone from 'react-phone-number-input';
import { parseNumber, formatNumber, isValidNumber } from 'libphonenumber-js';
import 'react-phone-number-input/rrui.css'
import 'react-phone-number-input/style.css'

import { bookingActions } from '../_actions';

import { statesList } from '../_constants';
import { STRIPE_API_KEY } from '../utils/config';
import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  PaymentRequestButtonElement,
  StripeProvider,
  Elements,
  injectStripe,
} from 'react-stripe-elements';

import { userService, bookingService } from '../_services';

class BookingPage extends React.Component {
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
      submitted: false,
      isFormValid: false,
      newCard: true,
      inValidDate: true,
      inValidTime: true,
      timeConfig: {
        startTime: 9,
        endTime: 18,
        minutesFromNow: 30
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.doBooking = this.doBooking.bind(this);
    this.handleDateTime = this.handleDateTime.bind(this);
    this.handlePhoneNumberChange = this.handlePhoneNumberChange.bind(this);
  }

  componentDidMount() {
    let userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      this.state.booking = {
        ...this.state.booking,
        address1: userData.address1 ? userData.address1 : '',
        address2: userData.address2 ? userData.address2 : '',
        city: userData.city ? userData.city : '',
        state: userData.state ? userData.state : '',
        zip: userData.zip ? userData.zip : '',
        country: userData.country ? userData.country : '',
        phoneNumber: userData.phoneNumber ? userData.phoneNumber : '',
      }
      this.setState(this.state);
    }
    userService.getById(userData.id)
      .then((response) => {
        if (response.error) {
          console.error('resp error', response.error);
          return;
        }
        localStorage.setItem('user', JSON.stringify(response));
        userData = JSON.parse(localStorage.getItem('user'));
        this.state.booking = {
          ...this.state.booking,
          address1: userData.address1 ? userData.address1 : '',
          address2: userData.address2 ? userData.address2 : '',
          city: userData.city ? userData.city : '',
          state: userData.state ? userData.state : '',
          zip: userData.zip ? userData.zip : '',
          country: userData.country ? userData.country : '',
          phoneNumber: userData.phoneNumber ? userData.phoneNumber : '',
        }
        let _defaultCard, _newCard = false;
        if (userData.stripeCustomer && userData.stripeCustomer.sources.data) {
          let defaultCard = _.find(userData.stripeCustomer.sources.data, ['id', userData.stripeCustomer.default_source]);
          if (defaultCard) {
            this.state.defaultCard = defaultCard;
            this.state.newCard = false;
          }
        }
        this.state.userData = userData;
        this.setState(this.state);
      })
      .catch((err) => {
        console.error(err);
      });

    bookingService.getConfig()
      .then((configs) => {
        this.state.timeConfig.timeZone = configs.timeZone && configs.timeZone;
        this.state.timeConfig.startTime = configs.startTime ? moment(moment.tz(configs.startTime, 'HH:mm', configs.timeZone).format()).format('HH:mm') : this.state.timeConfig.startTime;
        this.state.timeConfig.endTime = configs.endTime ? moment(moment.tz(configs.endTime, 'HH:mm', configs.timeZone).format()).format('HH:mm') : this.state.timeConfig.endTime;
        this.state.timeConfig.minutesFromNow = configs.minutesFromNow ? parseInt(configs.minutesFromNow) : this.state.timeConfig.minutesFromNow;
        this.setState(this.state);
      })
      .catch((err) => {
        console.log('ERROR > GETTING > CONFIG > ', err)
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
    event.preventDefault();
    this.state.submitted = true;
    // this.setState({ submitted: true });
    const { booking } = this.state;
    const { dispatch, currentUserId } = this.props;
    const REQUIRED_FIELDS = ['address1', 'city', 'state', 'country']

    let allValid = true;
    _.forEach(REQUIRED_FIELDS, (value, index) => {
      if (_.isEmpty(booking[value])) {
        allValid = false;
        return;
      }
    });

    if (booking.phoneNumber && !isValidNumber(booking.phoneNumber || '')) {
      allValid = false;
      return;
    }

    if (!booking['zip'] || (booking['zip'].toString().length !== 5) || this.state.inValidDate || this.inValidTime) {
      allValid = false;
      return;
    }

    if (booking.requestedOn) {
      let startDate = moment(booking.requestedOn).format('MM/DD/YYYY');
      let endDate = moment(booking.requestedOn).format('MM/DD/YYYY');
      // if (this.state.timeConfig.startTime > this.state.timeConfig.endTime) {
      //   endDate = moment(booking.requestedOn).add(1, 'day').format('MM/DD/YYYY');
      // }
      let tzStartDate = moment(momentTZ(`${startDate} ${this.state.timeConfig.startTime.toString()}`, 'MM/DD/YYYY HH:mm', this.state.timeConfig.timeZone));
      let tzEndDate = moment(momentTZ(`${endDate} ${this.state.timeConfig.endTime.toString()}`, 'MM/DD/YYYY HH:mm', this.state.timeConfig.timeZone));
      if (this.state.timeConfig.startTime > this.state.timeConfig.endTime) {
        let currentRequested = moment(booking.requestedOn);
        let cond1 = currentRequested.isAfter(tzStartDate);
        let cond2 = currentRequested.isBefore(moment().add(1, 'day').startOf('day'));
        let cond3 = currentRequested.isBefore(tzEndDate);
        let cond4 = moment(booking.requestedOn).isAfter(moment().startOf('day'));
        if ((cond1 && cond2) ||
          (cond3 && cond4)) {
          this.state.inValidDate = false;
        } else {
          this.state.inValidDate = true;         
          allValid = false; 
        }
      } else if (!(moment(booking.requestedOn).isAfter(tzStartDate) && moment(booking.requestedOn).isBefore(tzEndDate))) {
        this.state.inValidDate = true;
        allValid = false;
      } else {
        this.state.inValidDate = false;
      }
    }

    if (allValid && moment(booking.requestedOn).diff(moment(), 'minutes') < this.state.timeConfig.minutesFromNow) {
      this.state.inValidTime = true;
      allValid = false;
    }
    if (allValid && (booking.state !== 'Select State')) {
      this.state.isFormValid = true;
    }
    this.setState(this.state);
  }

  handlePayment(payload) {
    if (payload.error) {
      this.state.paymentError = payload.error.message;
      this.setState(this.state);
      return;
    }
    this.state.paymentError = null;
    this.state.isFormValid = false;
    this.setState(this.state);

    const { booking } = this.state;
    const { dispatch } = this.props;
    booking.token = payload.token;
    dispatch(bookingActions.create(booking));
  }

  doBooking() {
    this.state.isFormValid = false;
    this.setState(this.state);

    const { booking } = this.state;
    const { dispatch } = this.props;
    dispatch(bookingActions.create(booking));
  }

  handleToggle(event) {
    const { name, value } = event.target;
    this.state.newCard = !this.state.newCard;
    this.setState(this.state);
  }

  handleDateTime(dateObj) {
    if (typeof dateObj === 'string' || dateObj instanceof String) {
      this.state.submitted = true;
      this.state.inValidDate = true;
      this.setState(this.state);
    } else if (dateObj.diff(moment(), 'minutes') < this.state.timeConfig.minutesFromNow) {
      this.state.booking.requestedOn = dateObj.toDate();
      this.state.inValidDate = false;
      this.state.inValidTime = true;
      this.setState(this.state);
    } else {
      this.state.booking.requestedOn = dateObj.toDate();
      this.state.inValidDate = false;
      this.state.inValidTime = false;
      this.setState(this.state);
    }
  }

  handlePhoneNumberChange(value) {
    this.state.booking.phoneNumber = value;
    this.setState(this.state);
  }

  render() {
    const { registering } = this.props;
    const { booking, submitted, isFormValid, paymentError, newCard, userData, defaultCard, inValidDate, timeConfig, inValidTime } = this.state;

    const valid = function (current) {
      const yesterday = Datetime.moment().subtract(1, 'day');
      return current.isAfter(yesterday);
    };

    const timeConstraints = { /*hours: { min: timeConfig.startTime, max: timeConfig.endTime },*/ minutes: { step: 30 } }

    return (
      <div>
        {isFormValid ?
          <div>
            {defaultCard ?
              <div className="radio">
                <label>
                  <input type="radio" name="newCard" value='oldCard' checked={newCard === false} onChange={this.handleToggle} />
                  Old Card
              </label>
              </div> : <span></span>
            }
            <div className="radio">
              <label>
                <input type="radio" name="newCard" value='newCard' checked={newCard === true} onChange={this.handleToggle} />
                New Card
            </label>
            </div>
            {newCard ?
              <div id="payment">
                <StripeProvider apiKey={STRIPE_API_KEY}>
                  <Elements>
                    <div>
                      {paymentError &&
                        <div className="form-group has-error">{paymentError}</div>
                      }
                      <SplitForm fontSize={'14px'} callback={this.handlePayment} />
                    </div>
                  </Elements>
                </StripeProvider>
              </div>
              :
              <div>
                <div>
                  <label>Card: </label><span>XXXX-XXXX-XXXX-{defaultCard.last4}</span><br />
                  <label>Type: </label><span>{defaultCard.brand}</span><br />
                  <label>EXp: </label><span>{defaultCard.exp_month}/{defaultCard.exp_year}</span><br />
                </div>
                <div className="col-md-6 text-right">
                  <button className="btn btn-primary" onClick={this.doBooking}>Book</button>
                </div>
              </div>
            }
          </div>
          :
          <div className="col-md-6 col-md-offset-3">
            <h2>Booking</h2>
            <form name="form" onSubmit={this.handleSubmit}>
              <div className={'form-group' + (submitted && !booking.requestedOn || inValidDate || inValidTime ? ' has-error' : '')}>
                <label htmlFor="date">Requested On</label>
                <Datetime timeConstraints={timeConstraints} isValidDate={valid} onChange={this.handleDateTime} />
                {(submitted && !booking.requestedOn &&
                  <div className="help-block">Requested On is required</div>)
                  || (submitted && inValidDate &&
                    <div className="help-block">Select Valid date & time. Time must be between {timeConfig.startTime} - {timeConfig.endTime}</div>)
                  || (submitted && inValidTime &&
                    <div className="help-block">Time should be greater than {timeConfig.minutesFromNow} minutes from current time.</div>)
                }
              </div>
              <div className={'form-group' + (submitted && !booking.address1 ? ' has-error' : '')}>
                <label htmlFor="address1">Address 1</label>
                <input type="text" className="form-control" name="address1" value={booking.address1} onChange={this.handleChange} />
                {submitted && !booking.address1 &&
                  <div className="help-block">Address 1 is required</div>
                }
              </div>
              <div className={'form-group'}>
                <label htmlFor="address2">Address 2</label>
                <input type="text" className="form-control" name="address2" value={booking.address2} onChange={this.handleChange} />
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
              <div className={'form-group' + (submitted && (!booking.zip || (booking.zip.toString().length != 5)) ? ' has-error' : '')}>
                <label htmlFor="zip">Zip</label>
                <input type="text" className="form-control" name="zip" value={booking.zip} onChange={this.handleChange} />
                {submitted && !booking.zip &&
                  <div className="help-block">Zip is required</div> ||
                  (submitted && (booking.zip.toString().length != 5) &&
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
              {/*<div className='form-group'>
                <label htmlFor="phoneNumber">Phone</label>
                <input type="text" className="form-control" name="phoneNumber" value={booking.phoneNumber} onChange={this.handleChange} />
              </div>*/}
              <div className={'form-group' + ((submitted && booking.phoneNumber && !isValidNumber(booking.phoneNumber || '')) ? ' has-error' : '')}>
                <label htmlFor="phoneNumber">Phone</label>
                <Phone
                  className="form-control"
                  country="US"
                  placeholder="Start typing a phone number"
                  value={booking.phoneNumber}
                  error={(isValidNumber(booking.phoneNumber || '') ? undefined : 'Invalid phone number')}
                  onChange={this.handlePhoneNumberChange} />
                {submitted && booking.phoneNumber && !isValidNumber(booking.phoneNumber || '') &&
                  <div className="help-block">Invalid Phone Number</div>
                }
              </div>
              <div className="form-group">
                <button className="btn btn-primary">Book</button>
                {registering &&
                  <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                }
                <Link to="/" className="btn btn-link">Cancel</Link>
              </div>
            </form>
          </div>
        }
      </div>
    );
  }
}

BookingPage.defaultProps = {
  states: statesList
};

function mapStateToProps(state) {
  const { booking } = state.booking;
  const { currentUserId } = state.authentication;
  return {
    booking,
    currentUserId
  };
}

const connectedBookingPage = connect(mapStateToProps)(BookingPage);
export { connectedBookingPage as BookingPage };