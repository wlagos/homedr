import { userConstants } from '../_constants';

export function resetPassword(state = {}, action) {
  switch (action.type) {
    case userConstants.RESET_PASSWORD_REQUEST:
      return { resetPassword: true };
    case userConstants.RESET_PASSWORD_SUCCESS:
      return {};
    case userConstants.RESET_PASSWORD_FAILURE:
      return {};
    default:
      return state
  }
}