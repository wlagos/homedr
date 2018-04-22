import { authHeader } from '../_helpers';
import { HOST_URL, SERVER_URL } from '../utils/config';

const LOGIN_URL = `${HOST_URL}/api/AppUsers/login`;
const REGISTER_URL = `${HOST_URL}/api/AppUsers`;
const FORGET_PASSWORD_URL = `${HOST_URL}/api/AppUsers/reset`;
const RESET_PASSWORD_URL = `${HOST_URL}/api/AppUsers/reset-password`;
const CHANGE_PASSWORD_URL = `${HOST_URL}/api/AppUsers/change-password`;
const GET_BY_ID_URL = `${HOST_URL}/api/AppUsers`;
const GET_ALL_URL = `${HOST_URL}/api/AppUsers`;
const GET_USERS_BY_ROLE_URL = `${HOST_URL}/api/AppUsers/getUsersByRole`;
const UPDATE_BY_ID_URL = `${HOST_URL}/api/AppUsers`;
const ASSIGN_ROLE_URL = `${HOST_URL}/api/AppUsers/assignRole`;

export const userService = {
  login,
  logout,
  register,
  forgetPassword,
  resetPassword,
  changePassword,
  getAll,
  getUsersByRole,
  assignRole,
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
    headers: { ...authHeader(), 'Content-Type': 'application/json' }
  };

  return fetch(GET_ALL_URL, requestOptions).then(handleResponse);
}

function getUsersByRole(role) {
  const requestOptions = {
    method: 'GET',
    headers: { ...authHeader(), 'Content-Type': 'application/json' }
  };
  let URL = `${GET_USERS_BY_ROLE_URL}?role=${role}`;
  return fetch(URL, requestOptions).then(handleResponse);
}

function assignRole(data) {
  const requestOptions = {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
  return fetch(ASSIGN_ROLE_URL, requestOptions).then(handleResponse);
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

function changePassword(id, data) {
  const requestOptions = {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
  return fetch(CHANGE_PASSWORD_URL, requestOptions).then((result) => {
    if (result.status == 204) {
      return {};
    }
    return result.json()
  }).then((response) => {
    if (response.error) {
      return Promise.reject(response.error.message);
    }
    return response;
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
    if ((response.status >= 400 && response.status < 500) && response.body) {
      let errorData = response.json();
      return errorData.then(function (errorObj) {
        if (errorObj.error && errorObj.error.statusCode == 422) {
          if (errorObj.error.details && errorObj.error.details.messages) {
            let keys = Object.keys(errorObj.error.details.messages);
            if (keys && keys.length) {
              return Promise.reject(errorObj.error.details.messages[keys[0]][0]);
            } else {
              return Promise.reject(response.statusText);
            }
          } else {
            return Promise.reject(response.statusText);
          }
        } else {
          return Promise.reject(response.statusText);
        }
      }, function (error) {
        return Promise.reject(response.statusText);
      });
    }
  } else {
    return response.json();
  }
}