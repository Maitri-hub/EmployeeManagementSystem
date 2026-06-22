const BASE_URL = "https://employeemanagementsystem-lplz.onrender.com";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    throw new Error(body?.message || body?.error || `Request failed (${res.status})`);
  }

  return body;
}

export const getDashboardStats = () =>
  request("/api/dashboard/stats");

export const getUsers = () =>
  request("/api/user/all");

export const getDepartments = () =>
  request("/api/departments");

export const createDepartment = (data) =>
  request("/api/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });

  export const updateDepartment = (id, data) =>
  request(`/api/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteDepartment = (id) =>
  request(`/api/departments/${id}`, {
    method: "DELETE",
  });

export const getSkills = () =>
  request("/api/skills");

export const createSkill = (data) =>
  request("/api/skills", {
    method: "POST",
    body: JSON.stringify(data),
  });

  export const updateSkill = (id, data) =>
  request(`/api/skills/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteSkill = (id) =>
  request(`/api/skills/${id}`, {
    method: "DELETE",
  });

export const getEmployees = () =>
  request("/api/employees");

export const getEmployee = (id) =>
  request(`/api/employees/${id}`);

export const createEmployee = (data) =>
  request("/api/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEmployee = (id, data) =>
  request(`/api/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteEmployee = (id) =>
  request(`/api/employees/${id}`, {
    method: "DELETE",
  });

export async function uploadEmployeeFiles(employeeId, files) {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  formData.append("employeeId", String(employeeId));

  const res = await fetch(`${BASE_URL}/api/employees/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    throw new Error(body?.message || body?.error || `Upload failed (${res.status})`);
  }

  return body;
}

export const deleteEmployeeFile = (id) =>
  request(`/api/employees/upload/${id}`, {
    method: "DELETE",
  });
  
export default BASE_URL;