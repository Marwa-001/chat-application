import api from "./axios";

export async function searchUsers(search) {
  const res = await api.get("/users", { params: { search } });
  return res.data;
}

export async function getUserById(userId) {
  const res = await api.get(`/users/${userId}`);
  return res.data;
}