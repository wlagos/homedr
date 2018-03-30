import { bookingConstants } from '../_constants';
const initialState = { bookings: [], currentBooking: {}, booking: false };
export function booking(state = {}, action) {
  switch (action.type) {
    case bookingConstants.CREATE_REQUEST:
      return { booking: true };
    case bookingConstants.CREATE_SUCCESS:
      return { booking: false };
    case bookingConstants.CREATE_FAILURE:
      return { booking: false };
    case bookingConstants.GETALL_REQUEST:
      return { booking: true };
    case bookingConstants.GETALL_SUCCESS:
      return {
        ...state,
        ...{
          booking: false,
          bookings: action.bookings
        }
      };
    case bookingConstants.GETALL_FAILURE:
      return { booking: false };

    case bookingConstants.DELETE_REQUEST:
      return {
        ...state,
        ...{
          booking: true
        }
      };
    case bookingConstants.DELETE_SUCCESS:
      return {
        ...state,
        ...{
          booking: false,
          bookings: state.bookings.filter(booking => booking.id !== action.id)
        }
      };
    case bookingConstants.DELETE_FAILURE:
      return {
        ...state,
        ...{
          booking: false
        }
      };
    case bookingConstants.UPDATE_BY_ID_REQUEST:
      return {
        ...state,
        ...{
          loading: true
        }
      };
    case bookingConstants.UPDATE_BY_ID_SUCCESS:
      return {
        ...state,
        ...{
          loading: false,
          booking: action.booking
        }
      };
    case bookingConstants.UPDATE_BY_ID_FAILURE:
      return {
        ...state,
        ...{
          loading: false
        }
      };
    default:
      return state
  }
}