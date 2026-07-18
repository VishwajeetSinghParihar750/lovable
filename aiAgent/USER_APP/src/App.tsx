import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Check,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Inbox,
  Calendar,
  AlertCircle,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  Palette,
  CheckSquare,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Compass
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

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  angle: number
  speed: number
}

type ThemeType = 'noir' | 'nordic' | 'warm-sand' | 'sage' | 'lavender-plum';

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    text: 'Explore custom React hooks and state management',
    priority: 'high',
    completed: false,
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
  },
  {
    id: '2',
    text: 'Design a highly polished minimalist interface',
    priority: 'medium',
    completed: true,
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
  },
  {
    id: '3',
    text: 'Go for a evening walk and practice mindfulness',
    priority: 'low',
    completed: false,
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
  },
  {
    id: '4',
    text: 'Finish building this elegant todo workspace',
    priority: 'high',
    completed: true,
    createdAt: Date.now() - 1800000, // 30 mins ago
  }
]

const THEMES: { id: ThemeType; name: string; color: string }[] = [
  { id: 'noir', name: 'Noir & Chalk', color: '#1a1a1a' },
  { id: 'nordic', name: 'Nordic Frost', color: '#4361ee' },
  { id: 'warm-sand', name: 'Warm Sand', color: '#c2410c' },
  { id: 'sage', name: 'Sage Forest', color: '#15803d' },
  { id: 'lavender-plum', name: 'Lavender Plum', color: '#7c3aed' },
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

  // Theme & Sound Preferences
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('taskflow_theme') as ThemeType
    return THEMES.find(t => t.id === saved) ? saved : 'noir'
  })

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskflow_sound')
    return saved !== 'false' // default to true
  })

  // General States
  const [inputText, setInputText] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'alphabetical'>('date')
  const [dueDate, setDueDate] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'delete' } | null>(null)
  
  // Confetti/Particle effect state
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdCounter = useRef(0)

  // Apply theme class to body and update localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('taskflow_theme', theme)
  }, [theme])

  // Save todos and sound preferences
  useEffect(() => {
    localStorage.setItem('taskflow_todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('taskflow_sound', soundEnabled.toString())
  }, [soundEnabled])

  // Simple Web Audio API Synthesizer for premium, satisfying soft clicks
  const playSound = (type: 'complete' | 'add' | 'delete' | 'click') => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'complete') {
        // High-end, delicate double chime
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.06) // A5
        gain2.gain.setValueAtTime(0.03, ctx.currentTime + 0.06)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
        osc2.start()
        osc2.stop(ctx.currentTime + 0.35)
      } else if (type === 'add') {
        // Soft rising water drop
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, ctx.currentTime) // A4
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12) // E5
        gain.gain.setValueAtTime(0.03, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
        osc.start()
        osc.stop(ctx.currentTime + 0.12)
      } else if (type === 'delete') {
        // Low soft thud
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(180, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } else if (type === 'click') {
        // Micro tap
        osc.type = 'sine'
        osc.frequency.setValueAtTime(950, ctx.currentTime)
        gain.gain.setValueAtTime(0.015, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
        osc.start()
        osc.stop(ctx.currentTime + 0.04)
      }
    } catch (e) {
      console.warn('Audio play failed', e)
    }
  }

  // Generate minimalist star particles on completion
  const triggerConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const newParticles: Particle[] = []
    const colors = ['#ffffff', '#a8a29e', '#78716c', 'var(--accent)', '#e7e5e4']

    for (let i = 0; i < 16; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1.5, // microscopic, elegant particles
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 4 + 2 // swift burst
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  // Update particles position
  useEffect(() => {
    if (particles.length === 0) return

    const frame = requestAnimationFrame(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed + 0.4, // ultra-light gravity
            speed: p.speed * 0.93 // elegant deceleration
          }))
          .filter(p => p.speed > 0.3)
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [particles])

  // Custom Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'delete' = 'success') => {
    setToast({ message, type })
    const timer = setTimeout(() => setToast(null), 2500)
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
    playSound('add')
    showToast('Task added successfully', 'success')
  }

  const handleToggleTodo = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    let playedSound = false
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const nextCompleted = !todo.completed
          if (nextCompleted) {
            triggerConfetti(e)
            playSound('complete')
            playedSound = true
            showToast('Task completed', 'success')
          } else {
            playSound('click')
            playedSound = true
          }
          return { ...todo, completed: nextCompleted }
        }
        return todo
      })
    )
    if (!playedSound) playSound('click')
  }

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    playSound('delete')
    showToast('Task removed', 'delete')
  }

  const handleClearCompleted = () => {
    const completedCount = todos.filter((t) => t.completed).length
    if (completedCount === 0) return
    setTodos((prev) => prev.filter((todo) => !todo.completed))
    playSound('delete')
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'info')
  }

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((t) => t.completed).length
    const pending = total - completed
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pending, percent }
  }, [todos])

  // Priority Weights
  const priorityWeight = { high: 3, medium: 2, low: 1 }

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase())
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
        return b.createdAt - a.createdAt
      })
  }, [todos, searchQuery, filter, sortBy])

  // Greetings helper based on time
  const greeting = useMemo(() => {
    const hours = new Date().getHours()
    if (hours < 12) return { main: 'Focus morning.', sub: 'Design your day with clarity.' }
    if (hours < 18) return { main: 'Afternoon flow.', sub: 'Keep progress continuous and serene.' }
    return { main: 'Evening review.', sub: 'Capture remaining tasks, then rest.' }
  }, [])

  return (
    <div className="app-container">
      {/* Elegant minimalist toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <Check size={14} className="toast-icon-check" />}
            {toast.type === 'delete' && <AlertCircle size={14} className="toast-icon-alert" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Confetti Particles Container */}
      <div className="particle-canvas">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>

      <header className="app-header">
        <div className="header-meta">
          <div className="brand">
            <CheckSquare size={18} className="logo-icon" />
            <span className="logo-text">workspace</span>
          </div>

          <div className="preferences-bar">
            <div className="theme-selectors">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { playSound('click'); setTheme(t.id); }}
                  className={`theme-dot-btn ${theme === t.id ? 'active' : ''}`}
                  style={{ backgroundColor: t.color }}
                  title={`${t.name} theme`}
                  aria-label={`Switch to ${t.name} theme`}
                />
              ))}
            </div>

            <button
              onClick={() => { setSoundEnabled(!soundEnabled); playSound('click'); }}
              className={`sound-toggle-btn ${soundEnabled ? 'active' : ''}`}
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>

        <div className="hero-greeting">
          <h1 className="hero-title">{greeting.main}</h1>
          <p className="hero-sub">{greeting.sub}</p>
        </div>

        {/* Minimal Thin Progress Bar */}
        {stats.total > 0 && (
          <div className="progress-minimal-wrapper">
            <div className="progress-meta">
              <span className="percent-label">{stats.percent}% completed</span>
              <span className="tasks-count-label">{stats.completed} of {stats.total} tasks</span>
            </div>
            <div className="progress-bar-rail">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="app-content">
        {/* Form to add a new Todo */}
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <div className="input-row">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a task, project, or aspiration..."
              maxLength={120}
              className="todo-input"
              autoFocus
            />
            <button type="submit" className="add-button" disabled={!inputText.trim()}>
              <Plus size={16} />
              <span>add</span>
            </button>
          </div>

          <div className="form-settings">
            <div className="settings-left">
              <span className="settings-label">priority</span>
              <div className="priority-group">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { playSound('click'); setPriority(p); }}
                    className={`priority-pill-btn ${p} ${priority === p ? 'active' : ''}`}
                  >
                    <span className="dot" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-right">
              <span className="settings-label">due date</span>
              <div className="date-input-wrapper">
                <Calendar size={12} className="calendar-icon" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Search, Filter and Sorting Workspace */}
        <div className="workspace-controls">
          <div className="search-field">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => { playSound('click'); setSearchQuery(''); }}
                className="clear-search"
                title="Clear Search"
              >
                &times;
              </button>
            )}
          </div>

          <div className="filter-sort-bar">
            <div className="filter-tabs">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { playSound('click'); setFilter(f); }}
                  className={`filter-tab-btn ${filter === f ? 'active' : ''}`}
                >
                  <span>{f}</span>
                  <span className="badge">
                    {f === 'all' && todos.length}
                    {f === 'active' && todos.filter(t => !t.completed).length}
                    {f === 'completed' && todos.filter(t => t.completed).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="sort-wrapper">
              <ArrowUpDown size={12} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => { playSound('click'); setSortBy(e.target.value as any); }}
                className="sort-select"
                title="Sort"
              >
                <option value="date">date</option>
                <option value="priority">priority</option>
                <option value="alphabetical">alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Todo Items List */}
        <div className="todos-section">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="empty-state">
              <Inbox size={28} className="empty-icon" />
              <p className="empty-title">Clear horizons</p>
              <p className="empty-desc">
                {searchQuery
                  ? "No tasks match your filter parameters."
                  : filter === 'completed'
                  ? "No completed tasks on record yet."
                  : filter === 'active'
                  ? "Every item has been beautifully checked off."
                  : "Create an aspiration above to start this space."}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button
                  onClick={() => {
                    playSound('click')
                    setSearchQuery('')
                    setFilter('all')
                  }}
                  className="reset-filters-btn"
                >
                  Reset view
                </button>
              )}
            </div>
          ) : (
            <div className="todo-list">
              {filteredAndSortedTodos.map((todo) => {
                const isOverdue = todo.dueDate && new Date(todo.dueDate + 'T23:59:59') < new Date() && !todo.completed
                return (
                  <div
                    key={todo.id}
                    className={`todo-row priority-${todo.priority} ${
                      todo.completed ? 'completed' : ''
                    }`}
                  >
                    <button
                      onClick={(e) => handleToggleTodo(todo.id, e)}
                      className="checkbox-wrapper"
                      aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <div className={`checkbox-circle ${todo.completed ? 'checked' : ''}`}>
                        {todo.completed && <Check className="check-icon" size={10} />}
                      </div>
                    </button>

                    <div className="todo-body">
                      <span className="todo-text">{todo.text}</span>
                      <div className="todo-meta-row">
                        <span className={`priority-tag p-${todo.priority}`}>
                          {todo.priority}
                        </span>
                        
                        {todo.dueDate && (
                          <span className={`meta-tag date-tag ${isOverdue ? 'overdue' : ''}`}>
                            <Calendar size={10} />
                            <span>
                              {new Date(todo.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              })}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </span>
                        )}

                        <span className="meta-tag time-tag">
                          <Clock size={10} />
                          <span>
                            {new Date(todo.createdAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="delete-btn"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {stats.total > 0 && (
          <div className="workspace-footer">
            <span className="footer-stats">
              {stats.pending} remaining task{stats.pending !== 1 && 's'}
            </span>
            <button
              onClick={handleClearCompleted}
              disabled={stats.completed === 0}
              className="clear-completed-btn"
            >
              Clear completed ({stats.completed})
            </button>
          </div>
        )}
      </main>

      <footer className="credits">
        <p className="credits-text">
          Designed with intentional simplicity.
        </p>
      </footer>
    </div>
  )
}

export default App
