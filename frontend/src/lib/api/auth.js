import api from "./axios";

export async function signupRequest(data) {
  const res = await api.post("/auth/signup", data);
  return res.data; // { token, user }
}

export async function loginRequest(data) {
  const res = await api.post("/auth/login", data);
  return res.data; // { token, user }
}