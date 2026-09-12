import { useEffect, useState } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../api.js'

const STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed']

const EMPTY_FORM = {
  name: '',
  client_name: '',
  location: '',
  status: 'Planning',
  start_date: '',
  end_date: '',
  budget: '',
  description: '',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Load projects whenever the page opens, or the search/filter changes
  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter])

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const data = await getProjects({ search, status: statusFilter })
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(project) {
    setEditingId(project.id)
    setForm({
      name: project.name || '',
      client_name: project.client_name || '',
      location: project.location || '',
      status: project.status || 'Planning',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget ?? '',
      description: project.description || '',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, budget: form.budget === '' ? 0 : Number(form.budget) }
      if (editingId) {
        await updateProject(editingId, payload)
      } else {
        await createProject(payload)
      }
      setShowModal(false)
      await loadProjects()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      await deleteProject(project.id)
      await loadProjects()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by project name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={openAddModal}>+ Add Project</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">No projects found. Click "Add Project" to create one.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Client</th>
              <th>Location</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Start Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.client_name || '-'}</td>
                <td>{p.location || '-'}</td>
                <td>
                  <span className={`status-badge status-${p.status.replace(' ', '.')}`}>
                    {p.status}
                  </span>
                </td>
                <td>${Number(p.budget).toLocaleString()}</td>
                <td>{p.start_date || '-'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => openEditModal(p)}>Edit</button>{' '}
                  <button className="btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Project' : 'Add Project'}</h2>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Client Name</label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Budget ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.start_date || ''}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>End Date</label>
                <input
                  type="date"
                  value={form.end_date || ''}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
