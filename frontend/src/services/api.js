/* ─────────────────────────────────────────────────────────
   src/services/api.js
   Central API helper for Employee Management System.
   Base URL: https://employeemanagementsystem-lplz.onrender.com
   All protected endpoints use Bearer token from localStorage.
───────────────────────────────────────────────────────── */

const BASE_URL = 'https://employeemanagementsystem-lplz.onrender.com';

/* ── Auth header helper ── */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Generic request wrapper — throws on non-2xx ── */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  // Parse JSON body whether success or error
  let body;
  try { body = await res.json(); } catch { body = {}; }

  if (!res.ok) {
    const message = body?.message || body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
export const getDashboardStats = () =>
  request('/api/dashboard/stats');

/* ═══════════════════════════════════════════
   DEPARTMENTS
═══════════════════════════════════════════ */
export const getDepartments = () =>
  request('/api/departments');

export const createDepartment = (data) =>
  request('/api/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateDepartment = (id, data) =>
  request(`/api/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteDepartment = (id) =>
  request(`/api/departments/${id}`, { method: 'DELETE' });

/* ═══════════════════════════════════════════
   SKILLS
═══════════════════════════════════════════ */
export const getSkills = () =>
  request('/api/skills');

export const createSkill = (data) =>
  request('/api/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSkill = (id, data) =>
  request(`/api/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSkill = (id) =>
  request(`/api/skills/${id}`, { method: 'DELETE' });

/* ═══════════════════════════════════════════
   EMPLOYEES
═══════════════════════════════════════════ */
export const getEmployees = () =>
  request('/api/employees');

export const getEmployee = (id) =>
  request(`/api/employees/${id}`);

export const createEmployee = (data) =>
  request('/api/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateEmployee = (id, data) =>
  request(`/api/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteEmployee = (id) =>
  request(`/api/employees/${id}`, { method: 'DELETE' });

/* ═══════════════════════════════════════════
   FILE UPLOAD
   Uses FormData — no Content-Type header
   (browser sets multipart boundary automatically)
═══════════════════════════════════════════ */
export async function uploadEmployeeFiles(employeeId, files) {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  // Append each file under the key "files"
  Array.from(files).forEach((file) => formData.append('files', file));

  // Append employee id so backend can associate files
  formData.append('employeeId', employeeId);

  const res = await fetch(`${BASE_URL}/api/employees/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  let body;
  try { body = await res.json(); } catch { body = {}; }

  if (!res.ok) {
    const message = body?.message || body?.error || `Upload failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export default BASE_URL;