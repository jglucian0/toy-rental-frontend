// Salva o token no localStorage
export function setToken(token: string) {
  localStorage.setItem("token", token);
}

// Pega o token do localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// Remove token (logout)
export function removeToken() {
  localStorage.removeItem("token");
}

// Checa se está logado
export function isAuthenticated() {
  return !!getToken(); // true se tiver token
}
