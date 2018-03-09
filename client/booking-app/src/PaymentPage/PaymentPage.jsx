import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { SplitForm } from '../Payment';

import { paymentActions } from '../_actions';

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

class PaymentPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };

    this.handleChange = this.handleChange.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
  }

  handleChange(event) {
    this.setState({
      
    });
  }

  handlePayment(payload) {
    // NEEDS to handle payment and then create booking saved in store.
  }

  render() {
    const { payment } = this.props;
    return (
      <div>
        Payment Page
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { booking } = state.booking;
  const { currentUserId } = state.authentication;
  return {
    booking,
    currentUserId
  };
}

const connectedPaymentPage = connect(mapStateToProps)(PaymentPage);
export { connectedPaymentPage as PaymentPage };