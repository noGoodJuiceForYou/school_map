import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const UserNameKey = 'Admin-UserName'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserName() {
  return Cookies.get(UserNameKey)
}

export function setUserName(username) {
  return Cookies.set(UserNameKey, username)
}

export function removeUserName() {
  return Cookies.remove(UserNameKey)
}
