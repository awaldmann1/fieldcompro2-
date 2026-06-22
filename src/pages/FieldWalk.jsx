import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FieldWalk.css'

const STORAGE_KEY = 'fc_walk'

const TYPES = {
  safety: {
    icon: '⚠',
    en: 'Safety',
    es: 'Seguridad',
    cls: 'sel-safety',
    kw: ['safety', 'fall', 'ppe', 'hazard', 'stop', 'ladder', 'tie off', 'not tied', 'no ppe'],
  },
  quality: {
    icon: '🔧',
    en: 'Quality',
    es: 'Calidad',
    cls: 'sel-quality',
    kw: ['wrong', 'fix', 'redo', 'incorrect', 'not right', 'bad', 'repair', 'replace', 'missing', 'backwards'],
  },
  inspect: {
    icon: '🔍',
    en: 'Inspect',
    es: 'Inspección',
    cls: 'sel-inspect',
    kw: ['inspection', 'inspect', 'framing', 'final', 'ready', 'call for', 'schedule', 'mep'],
  },
  punch: {
    icon: '📋',
    en: 'Punch',
    es: 'Punch',
    cls: 'sel-punch',
    kw: ['punch', 'missing', 'incomplete', 'need', 'lacks', 'forgot', 'leftover', 'not done'],
  },
  note: {
    icon: '💬',
    en: 'Note',
    es: 'Nota',
    cls: 'sel-note',
    kw: [],
  },
}

const PRIORITIES = {
  P1: { en: 'P1 — Stop', es: 'P1 — Alto', cls: 'sel-p1', dot: 'p1-dot', sec: '🔴' },
  P2: { en: 'P2 — Today', es: 'P2 — Hoy', cls: 'sel-p2', dot: 'p2-dot', sec: '🟡' },
  P3: { en: 'P3 — Week', es: 'P3 — Semana', cls: 'sel-p3', dot: 'p3-dot', sec: '⬜' },
}

const SEED = [
  {
    id: 1,
    text: 'Ladder not tied off at north stairwell — stop work immediately',
    type: 'safety',
    priority: 'P1',
    zone: 'Building C',
    assignedTo: 'Framing',
    status: 'open',
    createdBy: 'super',
    note: '',
  },
  {
    id: 2,
    text: 'Framing inspection ready units 301-305, call for inspection',
    type: 'inspect',
    priority: 'P1',
    zone: 'Building B',
    assignedTo: 'myself',
    status: 'open',
    createdBy: 'super',
    note: '',
  },
  {
    id: 3,
    text: 'Drywall corners 2nd floor not bullnosed correctly — redo required',
    type: 'quality',
    priority: 'P2',
    zone: 'Building A',
    assignedTo: 'Drywall',
    status: 'inprogress',
    createdBy: 'super',
    note: '',
  },
  {
    id: 4,
    text: 'Missing fire caulk penetrations above ceiling tile grid',
    type: 'punch',
    priority: 'P2',
    zone: 'Building D',
    assignedTo: 'Electrical',
    status: 'inprogress',
    createdBy: 'as',
    note: '',
  },
  {
    id: 5,
    text: 'Check concrete pour schedule for next week parking deck area',
    type: 'note',
    priority: 'P3',
    zone: 'Site / Grounds',
    assignedTo: 'myself',
    status: 'open',
    createdBy: 'super',
    note: '',
  },
]

const ZONES = ['Building A', 'Building B', 'Building C', 'Building D', 'Common Area', 'Site / Grounds']
const TRADES = ['Concrete', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Insulation', 'Drywall', 'Painting', 'Flooring', 'Trim']

const COPY = {
  en: {
    project: 'Cypress Pointe II',
    projectSub: 'Keystone Build Partners · Lakeland, FL · 312 units',
    demo: 'DEMO · NOT SAVED',
    roleTitle: 'Who are you today?',
    startWalk: 'Start Walk-Around →',
    quickGuide: 'Quick guide',
    guide: [
      ['🎤', 'Speak', 'your observation — type auto-detects'],
      ['🔴🟡⬜', 'Set priority', '— P1 stops work, P2 today, P3 this week'],
      ['↑↓', 'Assign', 'up to Super or down to a sub trade'],
      ['📋', 'My List', 'sorts everything by priority'],
      ['📊', 'Dashboard', 'tracks all open items across the job'],
    ],
    captureTitle: 'Log an Observation',
    zone: 'Zone / Building',
    observation: 'Observation',
    observationPlaceholder: 'What do you see? Speak or type...',
    type: 'Type',
    priority: 'Priority',
    assign: 'Assign To',
    selectTrade: '— Select Trade —',
    logIt: 'Log It',
    myListEmptyTitle: 'No items yet',
    myListEmptyDesc: 'Tap Capture to log your first observation.',
    dashboardEmptyTitle: 'No data loaded',
    dashboardEmptyDesc: 'Log an observation on the Capture tab to start tracking.',
    tabs: ['Start', 'Capture', 'My List', 'Dashboard'],
    filters: { all: 'All', mine: 'Mine', out: 'Assigned Out', p1: '🔴 P1 Only' },
    counts: { open: 'Open', inprogress: 'In Progress', done: 'Done' },
    status: { open: 'Open', inprogress: 'In Progress', done: 'Done ✓' },
    statusToast: 'Status: ',
    notePlaceholder: 'Add a note...',
    autoDetected: 'Auto-detected:',
    listening: 'Listening…',
    voiceUnsupported: 'Voice not available in this browser',
    enterObservation: 'Enter an observation first',
    loggedAt: 'logged at',
    switched: 'Switched to English',
    switchedEs: 'Switched to Spanish',
    exitTitle: 'Exit Demo?',
    exitBody: 'Your logged items will not be saved.',
    stay: 'Stay',
    exit: 'Exit',
    back: '← Back',
    roleNames: { super: 'Super', as: 'AS', sub: 'Trade' },
    roleSubs: { super: 'Sees all', as: 'Send up/down', sub: 'My tasks' },
    assignLabels: { myself: 'Myself', as: '→ AS', sub: '→ Sub ▼', up: '↑ Super' },
    noData: 'No data loaded',
    noDataDesc: 'Log an observation on the Capture tab to start tracking.',
    storageUnavailable: '⚠ Storage unavailable — items won\'t persist',
    deviceFile: '⚠ Opened as local file — voice input needs a hosted URL. Drop on Netlify for full features.',
    deviceIOS: '✓ iPhone / iPad Safari — all features available.',
    deviceAndroid: '✓ Android Chrome — all features available.',
    deviceDesktop: 'ℹ Desktop browser — voice works here. Optimized for mobile.',
    deviceNoVoice: '⚠ Voice not supported — type your observations. All other features work.',
  },
  es: {
    project: 'Cypress Pointe II',
    projectSub: 'Keystone Build Partners · Lakeland, FL · 312 units',
    demo: 'DEMO · NO GUARDADO',
    roleTitle: '¿Quién eres hoy?',
    startWalk: 'Iniciar recorrido →',
    quickGuide: 'Guía rápida',
    guide: [
      ['🎤', 'Habla', 'tu observación — el tipo se detecta automáticamente'],
      ['🔴🟡⬜', 'Define prioridad', '— P1 detiene, P2 hoy, P3 esta semana'],
      ['↑↓', 'Asigna', 'hacia Super o hacia un subcontratista'],
      ['📋', 'Mi Lista', 'ordena todo por prioridad'],
      ['📊', 'Panel', 'muestra todos los pendientes en la obra'],
    ],
    captureTitle: 'Registrar observación',
    zone: 'Zona / Edificio',
    observation: 'Observación',
    observationPlaceholder: '¿Qué ves? Habla o escribe...',
    type: 'Tipo',
    priority: 'Prioridad',
    assign: 'Asignar a',
    selectTrade: '— Seleccionar oficio —',
    logIt: 'Registrar',
    myListEmptyTitle: 'Aún no hay elementos',
    myListEmptyDesc: 'Toca Captura para registrar tu primera observación.',
    dashboardEmptyTitle: 'Sin datos',
    dashboardEmptyDesc: 'Registra una observación en Captura para empezar.',
    tabs: ['Inicio', 'Captura', 'Mi Lista', 'Panel'],
    filters: { all: 'Todos', mine: 'Míos', out: 'Asignados', p1: '🔴 Solo P1' },
    counts: { open: 'Abierto', inprogress: 'En progreso', done: 'Listo' },
    status: { open: 'Abierto', inprogress: 'En progreso', done: 'Listo ✓' },
    statusToast: 'Estado: ',
    notePlaceholder: 'Agregar nota...',
    autoDetected: 'Detectado:',
    listening: 'Escuchando…',
    voiceUnsupported: 'Voz no disponible en este navegador',
    enterObservation: 'Escribe una observación primero',
    loggedAt: 'registrado a las',
    switched: 'Cambiado a Inglés',
    switchedEs: 'Cambiado a Español',
    exitTitle: '¿Salir del demo?',
    exitBody: 'Los elementos registrados no se guardarán.',
    stay: 'Quedarme',
    exit: 'Salir',
    back: '← Volver',
    roleNames: { super: 'Super', as: 'AS', sub: 'Oficio' },
    roleSubs: { super: 'Ve todo', as: 'Envía arriba/abajo', sub: 'Mis tareas' },
    assignLabels: { myself: 'Yo', as: '→ AS', sub: '→ Sub ▼', up: '↑ Super' },
    noData: 'Sin datos',
    noDataDesc: 'Registra una observación en Captura para empezar.',
    storageUnavailable: '⚠ Almacenamiento no disponible — no persistirá',
    deviceFile: '⚠ Abierto como archivo local — la voz necesita una URL publicada.',
    deviceIOS: '✓ Safari en iPhone / iPad — todas las funciones disponibles.',
    deviceAndroid: '✓ Chrome en Android — todas las funciones disponibles.',
    deviceDesktop: 'ℹ Navegador de escritorio — la voz funciona aquí. Optimizado para móvil.',
    deviceNoVoice: '⚠ Voz no compatible — escribe tus observaciones. Lo demás funciona.',
  },
}

function detectType(text) {
  const lower = text.toLowerCase()
  for (const key of ['safety', 'quality', 'inspect', 'punch']) {
    if (TYPES[key].kw.some((kw) => lower.includes(kw))) {
      return key
    }
  }
  return 'note'
}

function getAssignOptions(role, copy) {
  if (role === 'super') {
    return [
      { id: 'myself', label: copy.assignLabels.myself, cls: 'sel-myself' },
      { id: 'as', label: copy.assignLabels.as, cls: 'sel-down' },
      { id: 'sub', label: copy.assignLabels.sub, cls: 'sel-down' },
    ]
  }

  if (role === 'as') {
    return [
      { id: 'myself', label: copy.assignLabels.myself, cls: 'sel-myself' },
      { id: 'up', label: copy.assignLabels.up, cls: 'sel-up' },
      { id: 'sub', label: copy.assignLabels.sub, cls: 'sel-down' },
    ]
  }

  return [{ id: 'myself', label: copy.assignLabels.myself, cls: 'sel-myself' }]
}

function TaskCard({ task, copy, lang, expanded, onToggle, onStatusChange, onNoteChange }) {
  const type = TYPES[task.type] ?? TYPES.note
  const statusClass = task.status === 'open' ? 'status-open' : task.status === 'inprogress' ? 'status-inprogress' : 'status-done'

  return (
    <div className={`task-card ${task.priority.toLowerCase()}`} onClick={() => onToggle(task.id)}>
      <div className="task-main">
        <div className="task-header">
          <span className="task-type-icon">{type.icon}</span>
          <span className="task-text">{task.text}</span>
        </div>
        <div className="task-meta">
          <span className="meta-pill">{task.zone}</span>
          {task.assignedTo !== 'myself' && <span className="meta-pill">→ {task.assignedTo}</span>}
          <span className={`status-chip ${statusClass}`}>{copy.status[task.status]}</span>
        </div>
      </div>

      <div className={`task-expand${expanded ? ' show' : ''}`}>
        <textarea
          className="expand-note"
          placeholder={copy.notePlaceholder}
          rows="2"
          value={task.note ?? ''}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onNoteChange(task.id, event.target.value)}
        />
        <div className="status-row" onClick={(event) => event.stopPropagation()}>
          {['open', 'inprogress', 'done'].map((status) => (
            <button
              key={status}
              type="button"
              className={`status-btn${task.status === status ? ` active-${status === 'inprogress' ? 'inprogress' : status}` : ''}`}
              onClick={() => onStatusChange(task.id, status)}
            >
              {copy.status[status]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FieldWalk() {
  const navigate = useNavigate()
  const recognitionRef = useRef(null)
  const toastTimerRef = useRef(null)
  const bannerTimerRef = useRef(null)

  const [currentRole, setCurrentRole] = useState('super')
  const [currentTab, setCurrentTab] = useState('0')
  const [currentLang, setCurrentLang] = useState('en')
  const [captureType, setCaptureType] = useState('safety')
  const [capturePriority, setCapturePriority] = useState('P2')
  const [captureAssign, setCaptureAssign] = useState('myself')
  const [captureZone, setCaptureZone] = useState('Building A')
  const [captureText, setCaptureText] = useState('')
  const [subTrade, setSubTrade] = useState('')
  const [dashFilter, setDashFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [detectedType, setDetectedType] = useState('')
  const [exitOpen, setExitOpen] = useState(false)
  const [logStatus, setLogStatus] = useState('')
  const [toast, setToast] = useState({ show: false, message: '' })
  const [banner, setBanner] = useState({ show: false, message: '', type: 'info' })
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : SEED.slice()
    } catch {
      return SEED.slice()
    }
  })

  const copy = COPY[currentLang]
  const assignOptions = useMemo(() => getAssignOptions(currentRole, copy), [currentRole, copy])

  const showToast = (message) => {
    setToast({ show: true, message })
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  useEffect(() => {
    const valid = assignOptions.map((option) => option.id)
    if (!valid.includes(captureAssign)) {
      setCaptureAssign('myself')
    }
  }, [assignOptions, captureAssign])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      }
      window.localStorage.setItem('fc_wtest', '1')
      window.localStorage.removeItem('fc_wtest')
    } catch {
      showToast(copy.storageUnavailable)
    }

    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafariIOS = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    const hasVoice = Boolean(window.webkitSpeechRecognition || window.SpeechRecognition)
    const isFile = window.location.protocol === 'file:'

    let message = ''
    let type = 'info'
    let autoDismiss = false

    if (isFile) {
      message = copy.deviceFile
      type = 'warn'
    } else if (isSafariIOS) {
      message = copy.deviceIOS
      type = 'ok'
      autoDismiss = true
    } else if (isAndroid && /Chrome/i.test(ua)) {
      message = copy.deviceAndroid
      type = 'ok'
      autoDismiss = true
    } else if (!isIOS && !isAndroid && hasVoice) {
      message = copy.deviceDesktop
      type = 'info'
    } else if (!hasVoice) {
      message = copy.deviceNoVoice
      type = 'warn'
    }

    if (message) {
      setBanner({ show: true, message, type })
      if (autoDismiss) {
        bannerTimerRef.current = window.setTimeout(() => {
          setBanner((prev) => ({ ...prev, show: false }))
        }, 3500)
      }
    }

    return () => {
      window.clearTimeout(toastTimerRef.current)
      window.clearTimeout(bannerTimerRef.current)
      recognitionRef.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // noop
    }
  }, [tasks])

  const myTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (currentRole === 'super') return true
      if (currentRole === 'as') {
        return task.createdBy === 'as' || ['up', 'as', 'myself'].includes(task.assignedTo)
      }
      return ['myself', 'sub'].includes(task.assignedTo)
    })
  }, [currentRole, tasks])

  const filteredTasks = useMemo(() => {
    if (dashFilter === 'mine') return myTasks
    if (dashFilter === 'out') return tasks.filter((task) => task.assignedTo !== 'myself')
    if (dashFilter === 'p1') return tasks.filter((task) => task.priority === 'P1')
    return tasks
  }, [dashFilter, myTasks, tasks])

  const counts = useMemo(() => {
    return {
      open: tasks.filter((task) => task.status === 'open').length,
      inprogress: tasks.filter((task) => task.status === 'inprogress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }
  }, [tasks])

  const myOpenCount = useMemo(() => myTasks.filter((task) => task.status !== 'done').length, [myTasks])
  const p1OpenCount = useMemo(() => tasks.filter((task) => task.priority === 'P1' && task.status !== 'done').length, [tasks])

  const handleObservationChange = (value) => {
    setCaptureText(value)
    if (value.trim().length > 3) {
      const type = detectType(value)
      setCaptureType(type)
      setDetectedType(type)
      return
    }
    setDetectedType('')
  }

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast(copy.voiceUnsupported)
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      return
    }

    const recognition = new SpeechRecognition()
    const existingText = captureText
    recognition.lang = currentLang === 'es' ? 'es-US' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognitionRef.current = recognition
    setIsListening(true)
    setVoiceStatus(copy.listening)

    const timeoutId = window.setTimeout(() => recognition.stop(), 60000)

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) {
          finalText += event.results[index][0].transcript
        } else {
          interimText += event.results[index][0].transcript
        }
      }

      handleObservationChange(`${existingText ? `${existingText} ` : ''}${finalText || interimText}`)
    }

    recognition.onerror = (event) => {
      window.clearTimeout(timeoutId)
      setIsListening(false)
      setVoiceStatus('')
      recognitionRef.current = null
      if (event.error !== 'aborted') {
        showToast(`Mic: ${event.error}`)
      }
    }

    recognition.onend = () => {
      window.clearTimeout(timeoutId)
      setIsListening(false)
      setVoiceStatus('')
      recognitionRef.current = null
    }

    recognition.start()
  }

  const handleLogItem = () => {
    const text = captureText.trim()
    if (!text) {
      showToast(copy.enterObservation)
      return
    }

    const assignedTo = captureAssign === 'sub' ? subTrade || 'sub' : captureAssign
    const task = {
      id: Date.now(),
      text,
      type: captureType,
      priority: capturePriority,
      zone: captureZone,
      assignedTo,
      status: 'open',
      createdBy: currentRole,
      note: '',
      ts: new Date().toISOString(),
    }

    setTasks((prev) => [task, ...prev])
    setCaptureText('')
    setDetectedType('')
    setCaptureType('safety')
    setCapturePriority('P2')
    setLogStatus(`✓ Item #${tasks.length + 1} ${copy.loggedAt} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    showToast(`✓ Logged ${capturePriority} ${TYPES[captureType]?.icon ?? '💬'} — ${captureZone}`)
  }

  const updateTask = (taskId, updater) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? updater(task) : task)))
  }

  const handleStatusChange = (taskId, status) => {
    updateTask(taskId, (task) => ({ ...task, status }))
    showToast(`${copy.statusToast}${status}`)
  }

  const handleNoteChange = (taskId, note) => {
    updateTask(taskId, (task) => ({ ...task, note }))
  }

  const toggleLanguage = () => {
    setCurrentLang((prev) => {
      const next = prev === 'en' ? 'es' : 'en'
      window.requestAnimationFrame(() => {
        showToast(next === 'es' ? COPY.es.switchedEs : COPY.en.switched)
      })
      return next
    })
  }

  const renderGroupedTasks = (taskList) => (
    ['P1', 'P2', 'P3'].map((priority) => {
      const matching = taskList.filter((task) => task.priority === priority)
      if (!matching.length) return null
      const meta = PRIORITIES[priority]

      return (
        <div className="priority-section" key={priority}>
          <div className="priority-header">
            <div className={`priority-dot ${meta.dot}`} />
            {meta.sec} {meta[currentLang]} ({matching.length})
          </div>
          {matching.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              copy={copy}
              lang={currentLang}
              expanded={expandedId === task.id}
              onToggle={(taskId) => setExpandedId((prev) => (prev === taskId ? null : taskId))}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
          ))}
        </div>
      )
    })
  )

  return (
    <div className="fieldwalk-page">
      <header id="hdr">
        <div id="hdrInner">
          <div className="hdr-left">
            <button type="button" className="hdrBtn back-btn" onClick={() => navigate('/')}>
              {copy.back}
            </button>
            <div>
              <div className="fc-mark">
                FieldComm <span className="demo-badge">{copy.demo}</span>
              </div>
              <div className="proj-sub">{copy.project}</div>
            </div>
          </div>
          <div id="hdrRight">
            <span className="hdrBtn" id="roleTag">
              {copy.roleNames[currentRole]}
            </span>
            <button type="button" className="hdrBtn" id="langBtn" onClick={toggleLanguage}>
              <span id="langLabel">{currentLang === 'en' ? 'ES' : 'EN'}</span>
            </button>
            <button type="button" className="hdrBtn" id="exitBtn" onClick={() => setExitOpen(true)}>
              ✕ {copy.exit}
            </button>
          </div>
        </div>
      </header>

      {currentTab === '0' && (
        <div className="tab active" id="tab0">
          {banner.show && (
            <div id="deviceBanner" className={banner.type}>
              <span id="deviceBannerMsg">{banner.message}</span>
              <button type="button" id="deviceBannerX" onClick={() => setBanner((prev) => ({ ...prev, show: false }))}>
                ✕
              </button>
            </div>
          )}

          <div className="start-hero">
            <div className="hero-eyebrow">FieldComm Field Walk</div>
            <div className="hero-title">{copy.project}</div>
            <div className="hero-sub">{copy.projectSub}</div>
          </div>

          <div className="card start-card">
            <div className="card-title">{copy.roleTitle}</div>
            <div className="role-grid">
              {['super', 'as', 'sub'].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-card${currentRole === role ? ' selected' : ''}`}
                  onClick={() => setCurrentRole(role)}
                >
                  <div className="role-icon">{role === 'super' ? '👷' : role === 'as' ? '🦺' : '🔧'}</div>
                  <div className="role-lbl">{copy.roleNames[role]}</div>
                  <div className="role-sub">{copy.roleSubs[role]}</div>
                </button>
              ))}
            </div>
            <button type="button" className="start-cta" onClick={() => setCurrentTab('1')}>
              {copy.startWalk}
            </button>
          </div>

          <div className="card">
            <div className="card-title">{copy.quickGuide}</div>
            <div className="quick-guide">
              {copy.guide.map(([icon, title, text]) => (
                <div key={`${icon}-${title}`}>
                  {icon} <strong>{title}</strong> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentTab === '1' && (
        <div className="tab active" id="tab1">
          <div className="card">
            <div className="card-title">{copy.captureTitle}</div>
            <div className="field-row">
              <label htmlFor="cZone">{copy.zone}</label>
              <select id="cZone" value={captureZone} onChange={(event) => setCaptureZone(event.target.value)}>
                {ZONES.map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <label htmlFor="cText">{copy.observation}</label>
              <div className="voice-row">
                <textarea
                  className="voice-ta"
                  id="cText"
                  placeholder={copy.observationPlaceholder}
                  rows="3"
                  value={captureText}
                  onChange={(event) => handleObservationChange(event.target.value)}
                />
                <button type="button" className={`voice-btn${isListening ? ' listening' : ''}`} id="vbCapture" onClick={handleVoice}>
                  🎤
                </button>
              </div>
              <div className="voice-status" id="vsCapture">
                {voiceStatus}
              </div>
              <div className="detected-type" id="detectedType">
                {detectedType ? `${copy.autoDetected} ${TYPES[detectedType].icon} ${TYPES[detectedType][currentLang]}` : ''}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">{copy.type}</div>
            <div className="chip-row" id="typeChips">
              {Object.entries(TYPES).map(([key, type]) => (
                <button
                  key={key}
                  type="button"
                  className={`chip${captureType === key ? ` ${type.cls}` : ''}`}
                  id={`chip-${key}`}
                  onClick={() => setCaptureType(key)}
                >
                  {type.icon} {type[currentLang]}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">{copy.priority}</div>
            <div className="chip-row">
              {Object.entries(PRIORITIES).map(([key, priority]) => (
                <button
                  key={key}
                  type="button"
                  className={`chip${capturePriority === key ? ` ${priority.cls}` : ''}`}
                  id={`chip-${key}`}
                  onClick={() => setCapturePriority(key)}
                >
                  {priority.sec} {priority[currentLang]}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">{copy.assign}</div>
            <div className="chip-row" id="assignChips">
              {assignOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`chip${captureAssign === option.id ? ` ${option.cls}` : ''}`}
                  id={`chip-assign-${option.id}`}
                  onClick={() => setCaptureAssign(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={`sub-select${captureAssign === 'sub' ? ' show' : ''}`} id="subSelect">
              <select id="subTrade" value={subTrade} onChange={(event) => setSubTrade(event.target.value)}>
                <option value="">{copy.selectTrade}</option>
                {TRADES.map((trade) => (
                  <option key={trade}>{trade}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="log-wrap">
            <button type="button" className="log-btn" id="logBtn" onClick={handleLogItem}>
              {copy.logIt}
            </button>
            <div id="logStatus" className="log-status">
              {logStatus}
            </div>
          </div>
        </div>
      )}

      {currentTab === '2' && (
        <div className="tab active" id="tab2">
          <div id="myListBody" className="list-body">
            {!myTasks.length ? (
              <div className="empty-state" id="myListEmpty">
                <div className="empty-icon">📋</div>
                <div className="empty-title">{copy.myListEmptyTitle}</div>
                <div className="empty-desc">{copy.myListEmptyDesc}</div>
              </div>
            ) : (
              renderGroupedTasks(myTasks)
            )}
          </div>
        </div>
      )}

      {currentTab === '3' && (
        <div className="tab active" id="tab3">
          <div className="dash-counts" id="dashCounts">
            <div className="dash-count">
              <div className="dash-num open" id="cntOpen">{counts.open}</div>
              <div className="dash-lbl" id="lblOpen">{copy.counts.open}</div>
            </div>
            <div className="dash-count">
              <div className="dash-num inprog" id="cntProg">{counts.inprogress}</div>
              <div className="dash-lbl" id="lblProg">{copy.counts.inprogress}</div>
            </div>
            <div className="dash-count">
              <div className="dash-num done" id="cntDone">{counts.done}</div>
              <div className="dash-lbl" id="lblDone">{copy.counts.done}</div>
            </div>
          </div>
          <div className="filter-row">
            {Object.entries(copy.filters).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`filter-chip${dashFilter === key ? ' active' : ''}`}
                id={`f${key === 'p1' ? 'P1' : key[0].toUpperCase()}${key.slice(1)}`}
                onClick={() => setDashFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div id="dashBody" className="dashboard-body">
            {!filteredTasks.length ? (
              <div className="empty-state" id="dashEmpty">
                <div className="empty-icon">📊</div>
                <div className="empty-title">{copy.dashboardEmptyTitle}</div>
                <div className="empty-desc">{copy.dashboardEmptyDesc}</div>
              </div>
            ) : (
              <div className="task-list-wrap">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    copy={copy}
                    lang={currentLang}
                    expanded={expandedId === task.id}
                    onToggle={(taskId) => setExpandedId((prev) => (prev === taskId ? null : taskId))}
                    onStatusChange={handleStatusChange}
                    onNoteChange={handleNoteChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <nav id="nav">
        {copy.tabs.map((tabLabel, index) => {
          const tabId = String(index)
          const icon = ['🏠', '✏️', '📋', '📊'][index]
          const badge = index === 2 ? myOpenCount : index === 3 ? p1OpenCount : 0

          return (
            <button key={tabId} type="button" className={`nb${currentTab === tabId ? ' active' : ''}`} id={`nb${tabId}`} onClick={() => setCurrentTab(tabId)}>
              <span className="nb-ic">{icon}</span>
              <span className="nb-tx">{tabLabel}</span>
              {badge > 0 && <span className="nb-badge">{badge}</span>}
            </button>
          )
        })}
      </nav>

      <div id="toast" className={toast.show ? 'show' : ''}>
        {toast.message}
      </div>

      <div id="exitModal" className={exitOpen ? 'show' : ''}>
        <div className="modal-box">
          <h3>{copy.exitTitle}</h3>
          <p>{copy.exitBody}</p>
          <div className="modal-btns">
            <button type="button" className="modal-cancel" onClick={() => setExitOpen(false)}>
              {copy.stay}
            </button>
            <button type="button" className="modal-exit-btn" onClick={() => navigate('/')}>
              {copy.exit}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FieldWalk
