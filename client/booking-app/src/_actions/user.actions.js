import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';

export const userActions = {
  login,
  logout,
  register,
  forgetPassword,
  resetPassword,
  changePassword,
  getAll,
  getUsersByRole,
  getById,
  updateById,
  delete: _delete
};

function login(email, password) {
  let obj = {
    "email": email,
    "password": password
  };
  return dispatch => {
    dispatch(request({ email }));

    userService.login(obj)
      .then(
        user => {
          dispatch(success(user));
          history.push('/');
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
  function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
  function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
  userService.logout();
  return { type: userConstants.LOGOUT };
}

function register(user) {
  return dispatch => {
    dispatch(request(user));

    userService.register(user)
      .then(
        user => {
          dispatch(success(user));
          history.push('/login');
          dispatch(alertActions.success('Registration successful! A verification link has been sent to your email.'));
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
  function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
  function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function forgetPassword(user) {
  return dispatch => {
    dispatch(request(user));

    userService.forgetPassword(user)
      .then(
        user => {
          dispatch(success(user));
          history.push('/login');
          dispatch(alertActions.success('Reset Password link sent to your email.!'));
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(user) { return { type: userConstants.FORGET_PASSWORD_REQUEST, user } }
  function success(user) { return { type: userConstants.FORGET_PASSWORD_SUCCESS, user } }
  function failure(error) { return { type: userConstants.FORGET_PASSWORD_FAILURE, error } }
}

function resetPassword(token, data) {
  return dispatch => {
    dispatch(request(data));

    userService.resetPassword(token, data)
      .then(
        data => {
          dispatch(success(data));
          history.push('/login');
          dispatch(alertActions.success('Password updated successfully!'));
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(user) { return { type: userConstants.RESET_PASSWORD_REQUEST, user } }
  function success(user) { return { type: userConstants.RESET_PASSWORD_SUCCESS, user } }
  function failure(error) { return { type: userConstants.RESET_PASSWORD_FAILURE, error } }
}

function changePassword(id, data) {
  return dispatch => {
    dispatch(request(data));

    userService.changePassword(id, data)
      .then(
        data => {
          dispatch(success(data));
          dispatch(alertActions.success('Password updated successfully!'));
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(data) { return { type: userConstants.CHANGE_PASSWORD_REQUEST } }
  function success(data) { return { type: userConstants.CHANGE_PASSWORD_SUCCESS } }
  function failure(error) { return { type: userConstants.CHANGE_PASSWORD_FAILURE, error } }
}

function getAll() {
  return dispatch => {
    dispatch(request());

    userService.getAll()
      .then(
        users => dispatch(success(users)),
        error => dispatch(failure(error))
      );
  };

  function request() { return { type: userConstants.GETALL_REQUEST } }
  function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
  function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}

function getUsersByRole(role) {
  return dispatch => {
    dispatch(request());

    userService.getUsersByRole(role)
      .then(
        users => dispatch(success(users)),
        error => dispatch(failure(error))
      );
  };

  function request() { return { type: userConstants.GET_USERS_BY_ROLE_REQUEST } }
  function success(users) { return { type: userConstants.GET_USERS_BY_ROLE_SUCCESS, users } }
  function failure(error) { return { type: userConstants.GET_USERS_BY_ROLE_FAILURE, error } }
}

function getById(id) {
  return dispatch => {
    dispatch(request(id));

    userService.getById(id)
      .then(
        user => {
          dispatch(success(user));
          history.push('/');
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(id) { return { type: userConstants.GETBYID_REQUEST, id } }
  function success(user) { return { type: userConstants.GETBYID_SUCCESS, user } }
  function failure(error) { return { type: userConstants.GETBYID_FAILURE, error } }
}

function updateById(id, data) {
  return dispatch => {
    dispatch(request(id, data));

    userService.updateById(id, data)
      .then(
        user => {
          dispatch(success(user));
          dispatch(alertActions.success('Details updated successfully!'));
        },
        error => {
          dispatch(failure(id, error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(id) { return { type: userConstants.UPDATE_BY_ID_REQUEST, id, data } }
  function success(user) { return { type: userConstants.UPDATE_BY_ID_SUCCESS, user } }
  function failure(id, error) { return { type: userConstants.UPDATE_BY_ID_FAILURE, id, error } }
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  return dispatch => {
    dispatch(request(id));

    userService.delete(id)
      .then(
        user => {
          dispatch(success(id));
        },
        error => {
          dispatch(failure(id, error));
        }
      );
  };

  function request(id) { return { type: userConstants.DELETE_REQUEST, id } }
  function success(id) { return { type: userConstants.DELETE_SUCCESS, id } }
  function failure(id, error) { return { type: userConstants.DELETE_FAILURE, id, error } }
}