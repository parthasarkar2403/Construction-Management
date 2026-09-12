// This file is the ONLY place that talks to the Flask backend.
// Every other component calls these functions instead of using fetch() directly.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  return data
}

// GET /api/projects  (with optional ?search=...&status=...)
export async function getProjects(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString()
  const res = await fetch(`${API_URL}/api/projects${query ? `?${query}` : ''}`)
  return handleResponse(res)
}

// POST /api/projects
export async function createProject(project) {
  const res = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
  return handleResponse(res)
}

// PUT /api/projects/:id
export async function updateProject(id, project) {
  const res = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
  return handleResponse(res)
}

// DELETE /api/projects/:id
export async function deleteProject(id) {
  const res = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'DELETE',
  })
  return handleResponse(res)
}
