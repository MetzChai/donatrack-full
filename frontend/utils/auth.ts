export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
export function setUser(user: any) {
  if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(user));
}
export function getUser() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  }
}
