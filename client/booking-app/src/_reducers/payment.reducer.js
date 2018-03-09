import { paymentConstants } from '../_constants';
const initialState = { payment: [], currentpayment: {}, payment: false };
export function payment(state = {}, action) {
  switch (action.type) {
    case paymentConstants.CREATE_REQUEST:
      return { payment: true };
    case paymentConstants.CREATE_SUCCESS:
      return { payment: false };
    case paymentConstants.CREATE_FAILURE:
      return { payment: false };
    default: 
      return state
  }
}