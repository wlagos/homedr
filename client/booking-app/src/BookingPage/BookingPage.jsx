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
      isFormValid: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    const { booking } = this.state;
    this.setState({
      booking: {
        ...booking,
        [name]: value
      }
    });
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
    booking.paymentToken = payload.token;
    dispatch(bookingActions.create(booking));
  }

  render() {
    const { registering } = this.props;
    const { booking, submitted, isFormValid, paymentError } = this.state;
    return (
      <div>
        {isFormValid ?
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
              <div className={'form-group' + (submitted && !booking.zip ? ' has-error' : '')}>
                <label htmlFor="zip">Zip</label>
                <input type="text" className="form-control" name="zip" value={booking.zip} onChange={this.handleChange} />
                {submitted && !booking.zip &&
                  <div className="help-block">Zip is required</div>
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