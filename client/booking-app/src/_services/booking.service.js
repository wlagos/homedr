import { authHeader } from '../_helpers';
import { HOST_URL, SERVER_URL } from '../utils/config';

const CREATE_URL = `${HOST_URL}/api/Bookings`;
const GET_ALL_URL = `${HOST_URL}/api/Bookings`;
const DELETE_URL = `${HOST_URL}/api/Bookings`;

export const bookingService = {
  create,
  getAll,
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
  const filter = JSON.stringify({ "include": ["user","lastUpdater"], "order": "createdAt DESC" });
  const URL = `${GET_ALL_URL}?filter=${filter}`
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
    return Promise.reject(response.statusText);
  }

  return response.json();
}