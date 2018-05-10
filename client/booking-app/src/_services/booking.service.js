import { authHeader } from '../_helpers';
import { HOST_URL, SERVER_URL } from '../utils/config';

const CREATE_URL = `${HOST_URL}/api/Bookings/create-booking`;
const GET_ALL_URL = `${HOST_URL}/api/Bookings`;
const GET_BY_ID = `${HOST_URL}/api/Bookings`;
const DELETE_URL = `${HOST_URL}/api/Bookings`;
const UPDATE_BY_ID_URL = `${HOST_URL}/api/Bookings`;
const GET_CONFIG_URL = `${HOST_URL}/api/Bookings/config`;

export const bookingService = {
  create,
  getAll,
  getById,
  updateById,
  getConfig,
  delete: _delete
};

function create(data) {
  const requestOptions = {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };

  return fetch(CREATE_URL, requestOptions).then(handleResponse);
}

function getAll() {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const filter = JSON.stringify({ "include": ["user", "lastUpdater"], "order": "createdAt DESC" });
  const URL = `${GET_ALL_URL}?filter=${filter}`
  return fetch(URL, requestOptions).then(handleResponse);
}

function getById(id) {
  const requestOptions = {
    method: 'GET',
    headers: { ...authHeader(), 'Content-Type': 'application/json' }
  };
  const URL = `${GET_BY_ID}/${id}`
  return fetch(URL, requestOptions).then(handleResponse);
}

function getConfig() {
  const requestOptions = {
    method: 'GET',
    headers: { ...authHeader(), 'Content-Type': 'application/json' }
  };
  return fetch(GET_CONFIG_URL, requestOptions).then(handleResponse);
}

function updateById(id, data) {
  const requestOptions = {
    method: 'PATCH',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
  let URL = `${UPDATE_BY_ID_URL}/${id}`;
  return fetch(URL, requestOptions).then(handleResponse);
}

function _delete(id) {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader()
  };
  const URL = `${DELETE_URL}/${id}`
  return fetch(URL, requestOptions).then(handleResponse);
}

function handleResponse(response) {
  if (!response.ok) {
    if ((response.status >= 400 && response.status < 500) && response.body) {
      let errorData = response.json();
      return errorData.then(function (errorObj) {
        if (errorObj.error && errorObj.error.statusCode == 422) {
          if (errorObj.error.details && errorObj.error.details.messages) {
            let keys = Object.keys(errorObj.error.details.messages);
            if (keys && keys.length) {
              return Promise.reject(errorObj.error.details.messages[keys[0]][0]);
            } else {
              return Promise.reject(errorObj.error.message || response.statusText);
            }
          } else {
            return Promise.reject(errorObj.error.message || response.statusText);
          }
        } else {
          return Promise.reject(errorObj.error.message || response.statusText);
        }
      }, function (error) {
        return Promise.reject(error.message || response.statusText);
      });
    } else {
      return Promise.reject(response.statusText)
    }
  } else {
    if (response.status == 204) {
      return {};
    }
    return response.json();
  }
}