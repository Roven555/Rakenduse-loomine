const TOKEN_KEY = "token";
const USERS_KEY = "frontendUsers";
const CURRENT_USER_KEY = "username";

const createJsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "{}");

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getCurrentUser = () => {
  const username = localStorage.getItem(CURRENT_USER_KEY);
  const users = getUsers();
  return username ? users[username] : null;
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => Boolean(getToken() && localStorage.getItem(CURRENT_USER_KEY));

export const authenticatedFetch = async () => getProfile();

export const login = async (username, password) => {
  const users = getUsers();
  const user = users[username];

  if (!user || user.password !== password) {
    return createJsonResponse({ message: "Vale kasutajanimi või parool" }, 401);
  }

  const token = `frontend-${username}-${Date.now()}`;
  setToken(token);

  return createJsonResponse({
    message: "Sisselogimine õnnestus!",
    token,
    user: { username },
  });
};

export const register = async (username, password) => {
  const users = getUsers();

  if (users[username]) {
    return createJsonResponse({ message: "Kasutajanimi on juba kasutusel" }, 400);
  }

  users[username] = {
    username,
    password,
    likedMovies: [],
    dislikedMovies: [],
    watchlist: [],
  };
  saveUsers(users);

  return createJsonResponse({ message: "Registreerimine õnnestus!" }, 201);
};

export const getProfile = async () => {
  const user = getCurrentUser();

  if (!user) {
    return createJsonResponse({ message: "Kasutajat ei leitud" }, 404);
  }

  const { password, ...publicUser } = user;
  return createJsonResponse({ user: publicUser });
};

export const updatePreferences = async (preferences) => {
  const username = localStorage.getItem(CURRENT_USER_KEY);
  const users = getUsers();

  if (!username || !users[username]) {
    return createJsonResponse({ message: "Kasutajat ei leitud" }, 404);
  }

  users[username] = {
    ...users[username],
    ...preferences,
  };
  saveUsers(users);

  return createJsonResponse({ message: "Eelistused salvestatud" });
};
