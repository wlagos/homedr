import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { SplitForm } from '../Payment';

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

import { userService } from '../_services';

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
      newCard: true
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.doBooking = this.doBooking.bind(this);
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
    const REQUIRED_FIELDS = ['address1', 'address2', 'city', 'state', 'zip', 'country']

    let allValid = true;
    _.forEach(REQUIRED_FIELDS, (value, index) => {
      if (_.isEmpty(booking[value])) {
        allValid = false;
        return;
      }
    });

    if (allValid && (booking.state !== 'Select State') && (booking.zip.length == 5)) {
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

  render() {
    const { registering } = this.props;
    const { booking, submitted, isFormValid, paymentError, newCard, userData, defaultCard } = this.state;
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
              <StripeProvider apiKey={STRIPE_API_KEY}>
                <Elements>
                  <div>
                    <SplitForm fontSize={'14px'} callback={this.handlePayment} />
                    {paymentError &&
                      <div className="help-block">{paymentError}</div>
                    }
                  </div>
                </Elements>
              </StripeProvider>
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
              <div className={'form-group' + (submitted && !booking.address1 ? ' has-error' : '')}>
                <label htmlFor="address1">Address 1</label>
                <input type="text" className="form-control" name="address1" value={booking.address1} onChange={this.handleChange} />
                {submitted && !booking.address1 &&
                  <div className="help-block">Address 1 is required</div>
                }
              </div>
              <div className={'form-group' + (submitted && !booking.address2 ? ' has-error' : '')}>
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
              <div className={'form-group' + (submitted && (!booking.zip || (booking.zip.length != 5)) ? ' has-error' : '')}>
                <label htmlFor="zip">Zip</label>
                <input type="text" className="form-control" name="zip" value={booking.zip} onChange={this.handleChange} />
                {submitted && !booking.zip &&
                  <div className="help-block">Zip is required</div> ||
                  (submitted && (booking.zip.length != 5) &&
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