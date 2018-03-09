import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
import { forgetPassword } from './forget-password.reducer';
import { resetPassword } from './reset-password.reducer';
import { users } from './users.reducer';
import { booking } from './booking.reducer';
import { alert } from './alert.reducer';
import { payment } from './payment.reducer';

const rootReducer = combineReducers({
  authentication,
  registration,
  forgetPassword,
  resetPassword,
  users,
  booking,
  payment,
  alert
});

export default rootReducer;