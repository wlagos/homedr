import { authHeader } from '../_helpers';
import { HOST_URL, SERVER_URL } from '../utils/config';

const LOGIN_URL = `${HOST_URL}/api/AppUsers/login`;
const REGISTER_URL = `${HOST_URL}/api/AppUsers`;
const FORGET_PASSWORD_URL = `${HOST_URL}/api/AppUsers/reset`;
const RESET_PASSWORD_URL = `${HOST_URL}/api/AppUsers/reset-password`;
const GET_BY_ID_URL = `${HOST_URL}/api/AppUsers`;
const UPDATE_BY_ID_URL = `${HOST_URL}/api/AppUsers`;

export const userService = {
  login,
  logout,
  register,
  forgetPassword,
  resetPassword,
  getAll,
  getById,
  updateById,
  update,
  delete: _delete
};

function login(data) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
  let URL = `${LOGIN_URL}?include=user`;
  return fetch(URL, requestOptions)
    .then(response => {
      if (!response.ok) {
        return Promise.reject(response.statusText);
      }

      return response.json();
    })
    .then(accessToken => {
      // login successful if there's a jwt token in the response
      if (accessToken && accessToken.id) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
        localStorage.setItem('user', JSON.stringify(accessToken.user));
      }

      return accessToken.user;
    });
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

function getAll() {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };

  return fetch('/users', requestOptions).then(handleResponse);
}

function getById(id) {
  const requestOptions = {
    method: 'GET',
    headers: { ...authHeader(), 'Content-Type': 'application/json' }
  };

  let URL = `${GET_BY_ID_URL}/${id}`;
  return fetch(URL, requestOptions).then(handleResponse);
}

function register(user) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  };

  return fetch(REGISTER_URL, requestOptions).then(handleResponse);
}

function forgetPassword(user) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  };

  return fetch(FORGET_PASSWORD_URL, requestOptions).then((response) => {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return user;
  });
}

function resetPassword(token, data) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify(data)
  };

  return fetch(RESET_PASSWORD_URL, requestOptions).then((response) => {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return data;
  });
}

function update(user) {
  const requestOptions = {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  };

  return fetch('/users/' + user.id, requestOptions).then(handleResponse);
}

function updateById(id, user) {
  const requestOptions = {
    method: 'PATCH',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  };
  let URL = `${UPDATE_BY_ID_URL}/${id}`;
  return fetch(URL, requestOptions).then(handleResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader()
  };

  return fetch('/users/' + id, requestOptions).then(handleResponse);
}

function handleResponse(response) {
  if (!response.ok) {
    return Promise.reject(response.statusText);
  }

  return response.json();
}