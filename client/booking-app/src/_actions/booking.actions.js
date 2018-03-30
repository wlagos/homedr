import { bookingConstants } from '../_constants';
import { bookingService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';

export const bookingActions = {
  create,
  getAll,
  updateById,
  delete: _delete
};

function create(data) {
  return dispatch => {
    dispatch(request(data));

    bookingService.create(data)
      .then(
        data => {
          dispatch(success(data));
          history.push('/');
          dispatch(alertActions.success('Booking successful'));
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(data) { return { type: bookingConstants.CREATE_REQUEST, data } }
  function success(data) { return { type: bookingConstants.CREATE_SUCCESS, data } }
  function failure(error) { return { type: bookingConstants.CREATE_FAILURE, error } }
}

function getAll() {
  return dispatch => {
    dispatch(request());
    bookingService.getAll()
      .then(
        bookings => dispatch(success(bookings)),
        error => dispatch(failure(error))
      );
  };

  function request() { return { type: bookingConstants.GETALL_REQUEST } }
  function success(bookings) { return { type: bookingConstants.GETALL_SUCCESS, bookings } }
  function failure(error) { return { type: bookingConstants.GETALL_FAILURE, error } }
}

function updateById(id, data) {
  return dispatch => {
    dispatch(request(id, data));

    bookingService.updateById(id, data)
      .then(
        booking => {
          dispatch(success(booking));
        },
        error => {
          dispatch(failure(id, error));
        }
      );
  };

  function request(id) { return { type: bookingConstants.UPDATE_BY_ID_REQUEST, id, data } }
  function success(booking) { return { type: bookingConstants.UPDATE_BY_ID_SUCCESS, booking } }
  function failure(id, error) { return { type: bookingConstants.UPDATE_BY_ID_FAILURE, id, error } }
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  return dispatch => {
    dispatch(request(id));

    bookingService.delete(id)
      .then(
        booking => {
          dispatch(success(id));
        },
        error => {
          dispatch(failure(id, error));
        }
      );
  };

  function request(id) { return { type: bookingConstants.DELETE_REQUEST, id } }
  function success(id) { return { type: bookingConstants.DELETE_SUCCESS, id } }
  function failure(id, error) { return { type: bookingConstants.DELETE_FAILURE, id, error } }
}
