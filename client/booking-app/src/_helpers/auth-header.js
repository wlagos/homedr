export function authHeader() {
  // return authorization header with jwt token
  let accessToken = JSON.parse(localStorage.getItem('accessToken'));

  if (accessToken && accessToken.id) {
    return { 'Authorization': accessToken.id };
  } else {
    return {};
  }
}