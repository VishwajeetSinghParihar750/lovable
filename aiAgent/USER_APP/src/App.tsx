import { useState, useEffect, useMemo } from 'react'
import {
  Check,
  Trash2,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Circle,
  SlidersHorizontal,
  Inbox,
  Calendar,
  AlertCircle
} from 'lucide-react'
import './App.css'

interface Todo {
  id: string
  text: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: number
  dueDate?: string
}

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    text: 'Explore custom React hooks and state management 🚀',
    priority: 'high',
    completed: false,
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
  },
  {
    id: '2',
    text: 'Design a highly polished user interface 🎨',
    priority: 'medium',
    completed: true,
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
  },
  {
    id: '3',
    text: 'Go for a walk and drink 8 glasses of water 💧',
    priority: 'low',
    completed: false,
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
  },
  {
    id: '4',
    text: 'Finish building this amazing Todo app! ✨',
    priority: 'high',
    completed: true,
    createdAt: Date.now() - 1800000, // 30 mins ago
  }
]

function App() {
  // Load todos from localStorage or use defaults
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('taskflow_todos')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved todos', e)
      }
    }
    return INITIAL_TODOS
  })

  // State
  const [inputText, setInputText] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'alphabetical'>('date')
  const [dueDate, setDueDate] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'delete' } | null>(null)

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskflow_todos', JSON.stringify(todos))
  }, [todos])

  // Custom Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'delete' = 'success') => {
    setToast({ message, type })
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }

  // Handlers
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      priority,
      completed: false,
      createdAt: Date.now(),
      dueDate: dueDate || undefined
    }

    setTodos((prev) => [newTodo, ...prev])
    setInputText('')
    setDueDate('')
    showToast('Task added successfully!', 'success')
  }

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const nextCompleted = !todo.completed
          if (nextCompleted) {
            showToast('Task marked as completed! 🎉', 'success')
          }
          return { ...todo, completed: nextCompleted }
        }
        return todo
      })
    )
  }

  const handleDeleteTodo = (id: string, text: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    showToast(`Deleted: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`, 'delete')
  }

  const handleClearCompleted = () => {
    const completedCount = todos.filter((t) => t.completed).length
    if (completedCount === 0) return
    setTodos((prev) => prev.filter((todo) => !todo.completed))
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}!`, 'info')
  }

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((t) => t.completed).length
    const pending = total - completed
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pending, percent }
  }, [todos])

  // Priority Weights for sorting
  const priorityWeight = { high: 3, medium: 2, low: 1 }

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        // Search query filter
        const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase())
        // Completion filter
        if (filter === 'active') return matchesSearch && !todo.completed
        if (filter === 'completed') return matchesSearch && todo.completed
        return matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityWeight[b.priority] - priorityWeight[a.priority]
        }
        if (sortBy === 'alphabetical') {
          return a.text.localeCompare(b.text)
        }
        // default: date (newest first)
        return b.createdAt - a.createdAt
      })
  }, [todos, searchQuery, filter, sortBy])

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <header className="app-header">
        <div className="brand">
          <div className="logo-container">
            <Check className="logo-icon" />
          </div>
          <div>
            <h1>TaskFlow</h1>
            <p className="subtitle">Streamline your daily accomplishments</p>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="stats-card">
          <div className="stats-header">
            <span className="stats-title">Progress Tracker</span>
            <span className="stats-percent">{stats.percent}% completed</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.percent}%` }}
            ></div>
          </div>
          <div className="stats-footer">
            <span>
              <strong>{stats.completed}</strong> of <strong>{stats.total}</strong> completed
            </span>
            <span>{stats.pending} pending</span>
          </div>
        </div>
      </header>

      <main className="app-content">
        {/* Form to add a new Todo */}
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <div className="input-group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={120}
              className="todo-input"
              autoFocus
            />
            <button type="submit" className="add-button" disabled={!inputText.trim()}>
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          </div>

          <div className="form-options">
            <div className="priority-selector">
              <span className="label">Priority:</span>
              <div className="radio-group">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <label
                    key={p}
                    className={`priority-btn ${p} ${priority === p ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                    />
                    <span className="capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="due-date-selector">
              <span className="label">Due Date:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        </form>

        {/* Filters and Actions */}
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search">
                &times;
              </button>
            )}
          </div>

          <div className="filter-sort-controls">
            <div className="filter-group">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                >
                  <span className="capitalize">{f}</span>
                </button>
              ))}
            </div>

            <div className="divider"></div>

            <div className="sort-group">
              <SlidersHorizontal size={14} className="control-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
                title="Sort By"
              >
                <option value="date">Newest First</option>
                <option value="priority">High Priority First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Todo Items List */}
        <div className="todos-container">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-container">
                <Inbox size={48} className="empty-icon" />
              </div>
              <h3>No tasks found</h3>
              <p>
                {searchQuery
                  ? "We couldn't find any tasks matching your search."
                  : filter === 'completed'
                  ? "You haven't completed any tasks yet. Keep going!"
                  : filter === 'active'
                  ? "All caught up! You don't have any pending tasks."
                  : "Start by adding a task above!"}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilter('all')
                  }}
                  className="reset-filters-btn"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="todo-list">
              {filteredAndSortedTodos.map((todo) => {
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
                return (
                  <div
                    key={todo.id}
                    className={`todo-item priority-${todo.priority} ${
                      todo.completed ? 'completed' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className="checkbox-button"
                      aria-label={todo.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="checkbox-icon checked" size={22} />
                      ) : (
                        <Circle className="checkbox-icon unchecked" size={22} />
                      )}
                    </button>

                    <div className="todo-content">
                      <span className="todo-text">{todo.text}</span>
                      <div className="todo-meta">
                        <span className={`priority-badge badge-${todo.priority}`}>
                          {todo.priority}
                        </span>
                        
                        {todo.dueDate && (
                          <span className={`meta-item date-badge ${isOverdue ? 'overdue' : ''}`}>
                            <Calendar size={12} />
                            <span>
                              {new Date(todo.dueDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              })}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </span>
                        )}

                        <span className="meta-item time">
                          {new Date(todo.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(todo.id, todo.text)}
                      className="delete-button"
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {stats.total > 0 && (
          <div className="list-footer">
            <span className="footer-stats">
              {stats.pending} pending item{stats.pending !== 1 && 's'}
            </span>
            <button
              onClick={handleClearCompleted}
              disabled={stats.completed === 0}
              className="clear-completed-btn"
            >
              Clear Completed ({stats.completed})
            </button>
          </div>
        )}
      </main>

      <footer className="credits">
        <p>
          <Sparkles size={14} className="sparkle-icon" /> TaskFlow App &copy; {new Date().getFullYear()}. Crafted beautifully.
        </p>
      </footer>
    </div>
  )
}

export default App
