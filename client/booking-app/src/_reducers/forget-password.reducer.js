import { userConstants } from '../_constants';

export function forgetPassword(state = {}, action) {
  switch (action.type) {
    case userConstants.FORGET_PASSWORD_REQUEST:
      return { forgetPassword: true };
    case userConstants.FORGET_PASSWORD_SUCCESS:
      return {};
    case userConstants.FORGET_PASSWORD_FAILURE:
      return {};
    default:
      return state
  }
}