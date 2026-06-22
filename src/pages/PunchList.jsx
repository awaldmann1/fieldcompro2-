import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PunchList.css'

const INITIAL_ROSTER = [
  { trade: 'Drywall', name: 'Starr Drywall', foreman: 'Carlos M.', phone: '863-555-0111', email: 'office@starrdrywall.com', lang: 'es', lastOnSite: '2026-06-19', onSiteToday: true },
  { trade: 'Paint', name: 'Suncoast Paint Co.', foreman: 'José R.', phone: '863-555-0122', email: 'field@suncoastpaint.com', lang: 'es', lastOnSite: '2026-06-19', onSiteToday: true },
  { trade: 'Plumbing', name: 'Clearwater Plumbing', foreman: 'Dave H.', phone: '863-555-0144', email: 'info@clearwaterplumb.com', lang: 'en', lastOnSite: '2026-06-19', onSiteToday: true },
  { trade: 'Flooring', name: 'Bay Area Flooring', foreman: 'Miguel A.', phone: '863-555-0133', email: 'jobs@bayareaflooring.com', lang: 'es', lastOnSite: '2026-06-17', onSiteToday: false },
  { trade: 'Trim', name: 'Precision Trim LLC', foreman: 'Frank B.', phone: '863-555-0166', email: 'office@precisiontrim.com', lang: 'en', lastOnSite: '2026-06-18', onSiteToday: false },
  { trade: 'Insulation', name: 'Coastal Insulation', foreman: '', phone: '', email: 'office@coastalinsul.com', lang: '', lastOnSite: '2026-06-18', onSiteToday: false },
]

const ROSTER_SYNCED = '2026-06-19 7:10 AM'

const PROJECT_ROLES = {
  super: { role: 'Superintendent', name: 'T. Morrison', phone: '863-555-0100', note: 'Owns the sub list' },
  apm: { role: 'APM · Procore', name: 'R. Delgado', phone: '863-555-0102', note: 'Runs Procore in the field — fixes the list' },
}

const INITIAL_ZONES = {
  A: { as: 'J. Kane' },
  B: { as: 'L. Ruiz' },
  C: { as: 'M. Pope' },
}

const INITIAL_ITEMS = [
  { id: 'PL-001', trade: 'Drywall', pri: 'P1', desc: 'Drywall butt joint gap >1/4" — Bldg A stairwell', bldg: 'A', unit: 'Stairwell', due: '2026-06-22', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-002', trade: 'Paint', pri: 'P1', desc: 'Touch-up missing on all Unit 204 door frames', bldg: 'A', unit: '204', due: '2026-06-21', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-003', trade: 'Flooring', pri: 'P1', desc: 'LVP seam peaking — Unit 312 living room', bldg: 'C', unit: '312', due: '2026-06-20', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-004', trade: 'Plumbing', pri: 'P1', desc: 'Shower valve handle loose — Unit 108 master bath', bldg: 'A', unit: '108', due: '2026-06-20', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-005', trade: 'Drywall', pri: 'P2', desc: 'Screw pops in hallway — Bldg B corridor', bldg: 'B', unit: 'Corridor', due: '2026-06-24', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-006', trade: 'Paint', pri: 'P2', desc: 'Roller texture variation — Unit 215 bedroom 2', bldg: 'B', unit: '215', due: '2026-06-24', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-007', trade: 'Electrical', pri: 'P2', desc: 'GFCI outlet not resetting — Unit 110 kitchen', bldg: 'A', unit: '110', due: '2026-06-23', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-008', trade: 'Trim', pri: 'P2', desc: 'Base shoe gap at threshold — Units 201-208', bldg: 'B', unit: '201-208', due: '2026-06-25', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-009', trade: 'Flooring', pri: 'P2', desc: 'Grout joint inconsistency — Bldg C entry tile', bldg: 'C', unit: 'Entry', due: '2026-06-25', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-010', trade: 'Paint', pri: 'P3', desc: 'Minor sheen variation — Unit 118 accent wall', bldg: 'A', unit: '118', due: '2026-06-27', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-011', trade: 'Trim', pri: 'P3', desc: 'Crown molding paint line rough — Unit 305', bldg: 'C', unit: '305', due: '2026-06-28', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-012', trade: 'Drywall', pri: 'P3', desc: 'Hairline crack at window head — Unit 220', bldg: 'B', unit: '220', due: '2026-06-28', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-013', trade: 'Electrical', pri: 'P3', desc: 'Receptacle cover plate slightly misaligned — 114', bldg: 'A', unit: '114', due: '2026-06-29', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-014', trade: 'Flooring', pri: 'P3', desc: 'LVP end cap trim not fully seated — Unit 212', bldg: 'B', unit: '212', due: '2026-06-29', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-015', trade: 'Plumbing', pri: 'P3', desc: 'Vanity faucet drip — Unit 321 second bath', bldg: 'C', unit: '321', due: '2026-06-30', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-016', trade: 'Paint', pri: 'P2', desc: 'Ceiling cut-in ragged edge — Bldg A club room', bldg: 'A', unit: 'Club', due: '2026-06-24', status: 'open', trackerStep: 0, dispatchedAt: null },
  { id: 'PL-017', trade: 'Insulation', pri: 'P2', desc: 'Batt gap at rim joist — Bldg B attic access', bldg: 'B', unit: 'Attic', due: '2026-06-26', status: 'open', trackerStep: 0, dispatchedAt: null },
]

const STEPS_EN = ['📤 Dispatched', '👍 Acknowledged', '🔧 In Progress', '✅ Done']
const STEPS_ES = ['📤 Despachado', '👍 Recibido', '🔧 En Progreso', '✅ Listo']

const defaultNewItem = {
  desc: '',
  trade: 'Drywall',
  pri: 'P2',
  bldg: '',
  unit: '',
  due: '',
}

function fld(value, placeholder) {
  return value !== undefined && value !== null && String(value).trim() !== '' ? value : placeholder
}

function getNextId(items) {
  const max = items.reduce((highest, item) => {
    const match = item.id.match(/PL-(\d+)/)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)

  return max + 1
}

function PunchList() {
  const navigate = useNavigate()
  const nextIdRef = useRef(getNextId(INITIAL_ITEMS))
  const recognitionRef = useRef(null)
  const voiceTimerRef = useRef(null)
  const [spanishMode, setSpanishMode] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [currentDispatchType, setCurrentDispatchType] = useState(null)
  const [subLangOverride, setSubLangOverride] = useState({})
  const [roster, setRoster] = useState(INITIAL_ROSTER)
  const [zones, setZones] = useState(INITIAL_ZONES)
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [mode, setMode] = useState('basic')
  const [activeTab, setActiveTab] = useState('field')
  const [basicPri, setBasicPri] = useState('P2')
  const [basicDesc, setBasicDesc] = useState('')
  const [basicLoc, setBasicLoc] = useState('')
  const [filterTrade, setFilterTrade] = useState('all')
  const [filterPri, setFilterPri] = useState('all')
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [newItem, setNewItem] = useState(defaultNewItem)
  const [isRosterDetailOpen, setIsRosterDetailOpen] = useState(false)
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false)
  const [editState, setEditState] = useState({ type: null, key: null, value: '' })
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '', visible: false })
  const [isClosed, setIsClosed] = useState(false)
  const [recognitionActive, setRecognitionActive] = useState(false)

  const t = (en, es) => (spanishMode ? es : en)
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const getSub = (trade) => roster.find((sub) => sub.trade === trade) ?? null
  const getAS = (bldg) => zones[bldg]?.as?.trim() ?? ''
  const subLang = (sub) => (sub?.lang?.trim() ? sub.lang : 'en')

  const tradeOptions = useMemo(() => {
    const trades = new Set([...roster.map((entry) => entry.trade), ...items.map((item) => item.trade).filter(Boolean)])
    return [...trades].sort()
  }, [items, roster])

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        (filterTrade === 'all' || item.trade === filterTrade) &&
        (filterPri === 'all' || item.pri === filterPri),
    )
  }, [filterPri, filterTrade, items])

  const openItems = useMemo(() => items.filter((item) => item.status === 'open'), [items])
  const dispatchedItems = useMemo(
    () => items.filter((item) => ['dispatched', 'done', 'flagged'].includes(item.status)),
    [items],
  )
  const basicOpenItems = useMemo(() => items.filter((item) => item.status !== 'done'), [items])
  const basicDoneItems = useMemo(() => items.filter((item) => item.status === 'done'), [items])

  const stats = useMemo(
    () => ({
      p1: openItems.filter((item) => item.pri === 'P1').length,
      p2: openItems.filter((item) => item.pri === 'P2').length,
      p3: openItems.filter((item) => item.pri === 'P3').length,
      dispatched: items.filter((item) => item.status === 'dispatched').length,
    }),
    [items, openItems],
  )

  const selectedByTrade = useMemo(() => {
    return selectedIds.reduce((grouped, id) => {
      const item = items.find((entry) => entry.id === id)
      if (!item) return grouped
      if (!grouped[item.trade]) grouped[item.trade] = []
      grouped[item.trade].push(item)
      return grouped
    }, {})
  }, [items, selectedIds])

  const missingTrades = useMemo(() => {
    const tradesWithOpenWork = [...new Set(openItems.map((item) => item.trade))]
    return tradesWithOpenWork.filter((trade) => !getSub(trade))
  }, [openItems, roster])

  const rosterSummary = useMemo(() => {
    if (roster.length === 0) {
      return `⚠️ ${t('No subs loaded — import Procore commitments', 'Sin subs — importar Procore')}`
    }

    const onSiteToday = roster.filter((sub) => sub.onSiteToday).length
    return `${roster.length} ${t('from Procore (active + open work)', 'de Procore (activos + trabajo abierto)')} · ${onSiteToday} ${t('on site today', 'en obra hoy')} · ${t('synced', 'sinc.')} ${ROSTER_SYNCED}`
  }, [roster, spanishMode])

  const currentModeHint = mode === 'basic'
    ? t('Just capture items — act on them later.', 'Solo capture ítems — actúe después.')
    : t('Subs, dispatch, zones, languages.', 'Subs, despacho, zonas, idiomas.')

  const modalTypeLabel = currentDispatchType === 'text'
    ? t('Text Foreman', 'Texto Capataz')
    : currentDispatchType === 'email'
      ? t('Email Sub Office', 'Email Oficina')
      : t('Text + Email', 'Texto + Email')

  useEffect(() => {
    if (!toast.visible) return undefined

    const timer = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }))
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!isAddFormOpen) return

    const defaultDue = new Date()
    defaultDue.setDate(defaultDue.getDate() + 5)
    setNewItem((current) => ({
      ...current,
      due: current.due || defaultDue.toISOString().split('T')[0],
    }))
  }, [isAddFormOpen])

  useEffect(() => {
    if (mode === 'basic') {
      setDispatchModalOpen(false)
      setCurrentDispatchType(null)
      setSelectMode(false)
      setSelectedIds([])
      setSubLangOverride({})
    }
  }, [mode])

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // noop
        }
      }
    }
  }, [])

  const showToast = (message, type = '') => {
    setToast({ message, type, visible: true })
  }

  const formatNewItemId = () => {
    const next = nextIdRef.current
    nextIdRef.current += 1
    return `PL-${String(next).padStart(3, '0')}`
  }

  const toggleLanguage = () => {
    setSpanishMode((current) => !current)
    showToast(spanishMode ? 'English mode active' : 'Modo español activo', 'success')
  }

  const toggleSelectionMode = () => {
    setSelectMode((current) => {
      const next = !current
      if (!next) {
        setSelectedIds([])
      }
      return next
    })
  }

  const toggleSelect = (id) => {
    if (!selectMode) return

    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((entry) => entry !== id)
      return [...current, id]
    })
  }

  const cancelSelect = () => {
    setSelectMode(false)
    setSelectedIds([])
  }

  const openDispatchModal = (type) => {
    if (selectedIds.length === 0) {
      showToast(t('No items selected', 'Sin ítems seleccionados'), 'warn')
      return
    }

    setCurrentDispatchType(type)
    setDispatchModalOpen(true)
  }

  const buildMessage = (trade, tradeItems, sub, spanish) => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const foreman = fld(sub?.foreman, spanish ? 'capataz' : 'Foreman')

    if (spanish) {
      const lines = tradeItems
        .map((item) => `  • ${item.id}: ${item.desc} (Edif. ${item.bldg} – ${item.unit}, ${item.pri})`)
        .join('\n')
      return `Hola ${foreman},\n\nFieldComm – Cypress Pointe Ph II (${date})\n\nPendientes de ${trade}:\n${lines}\n\nFavor confirmar recibo y ETA. "En eso" es suficiente.\n\n– Equipo FieldComm`
    }

    const lines = tradeItems
      .map((item) => `  • ${item.id}: ${item.desc} (Bldg ${item.bldg} – ${item.unit}, ${item.pri})`)
      .join('\n')
    return `Hi ${foreman},\n\nFieldComm – Cypress Pointe Ph II (${date})\n\n${trade} punch items:\n${lines}\n\nPlease confirm receipt and ETA. "On it" is fine.\n\n— The FieldComm Team`
  }

  const toggleSubLanguage = (trade) => {
    const sub = getSub(trade)
    if (!sub) return

    setSubLangOverride((current) => {
      const isSpanish = current[trade] ?? (subLang(sub) === 'es')
      return { ...current, [trade]: !isSpanish }
    })
  }

  const closeModal = () => {
    setDispatchModalOpen(false)
    setSubLangOverride({})
    setCurrentDispatchType(null)
  }

  const confirmDispatch = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    let successCount = 0
    let failCount = 0
    let flaggedCount = 0

    setItems((current) => {
      return current.map((item) => {
        if (!selectedSet.has(item.id)) return item

        if (!getSub(item.trade)) {
          flaggedCount += 1
          return { ...item, status: 'flagged', dispatchedAt: now }
        }

        if (Math.random() > 0.05) {
          successCount += 1
          return { ...item, status: 'dispatched', dispatchedAt: now, trackerStep: 0 }
        }

        failCount += 1
        return item
      })
    })

    closeModal()

    const parts = []
    if (successCount > 0) parts.push(`✅ ${successCount} ${t('sent', 'enviados')}`)
    if (flaggedCount > 0) parts.push(`⚠️ ${flaggedCount} ${t('flagged to super (no sub on site)', 'marcados al super (sin sub)')}`)
    if (failCount > 0) parts.push(`❌ ${failCount} ${t('failed — copied to clipboard, paste manually', 'fallidos — copiados, pegar manual')}`)

    showToast(`${parts.join(' · ')} (${now})`, failCount > 0 ? 'error' : flaggedCount > 0 ? 'warn' : 'success')
    setSelectedIds([])
    setSelectMode(false)
  }

  const advanceTracker = (id, step) => {
    let nextLabel = ''
    let completedId = ''

    setItems((current) => current.map((item) => {
      if (item.id !== id) return item

      const trackerStep = step + 1 < 4 ? step + 1 : step
      const labels = spanishMode ? STEPS_ES : STEPS_EN
      nextLabel = labels[trackerStep] || labels[3]
      if (trackerStep === 3) completedId = item.id
      return {
        ...item,
        trackerStep,
        status: trackerStep === 3 ? 'done' : item.status,
      }
    }))

    if (nextLabel) showToast(`${id} → ${nextLabel}`, 'success')
    if (completedId) showToast(`✅ ${completedId} ${t('closed — WCA logged', 'cerrado — WCA registrado')}`, 'success')
  }

  const toggleAddForm = () => {
    setIsAddFormOpen((current) => !current)
  }

  const addItem = () => {
    const desc = newItem.desc.trim()
    if (!desc) {
      showToast(t('Enter a description', 'Ingrese descripción'), 'warn')
      return
    }

    setItems((current) => ([
      {
        id: formatNewItemId(),
        trade: newItem.trade,
        pri: newItem.pri,
        desc,
        bldg: newItem.bldg.trim() || '?',
        unit: newItem.unit.trim() || '?',
        due: newItem.due || '—',
        status: 'open',
        trackerStep: 0,
        dispatchedAt: null,
      },
      ...current,
    ]))

    setNewItem(defaultNewItem)
    setIsAddFormOpen(false)
    showToast(t('Item added', 'Ítem agregado'), 'success')
  }

  const startEdit = (type, key, value) => {
    setEditState({ type, key, value })
    if (type === 'foreman') setIsRosterDetailOpen(true)
    if (type === 'as') setIsTeamDetailOpen(true)
  }

  const cancelEdit = () => {
    setEditState({ type: null, key: null, value: '' })
    setIsRosterDetailOpen(true)
    setIsTeamDetailOpen(true)
  }

  const saveForeman = (trade) => {
    setRoster((current) => current.map((sub) => (
      sub.trade === trade ? { ...sub, foreman: editState.value.trim() } : sub
    )))
    setEditState({ type: null, key: null, value: '' })
    setIsRosterDetailOpen(true)
    showToast(`${t('Foreman updated', 'Capataz actualizado')}${editState.value.trim() ? ` → ${editState.value.trim()}` : ` (${t('cleared', 'vacío')})`}`, 'success')
  }

  const saveAS = (bldg) => {
    const value = editState.value.trim()
    setZones((current) => ({
      ...current,
      [bldg]: { ...(current[bldg] || {}), as: value },
    }))
    setEditState({ type: null, key: null, value: '' })
    setIsTeamDetailOpen(true)
    showToast(`${t('Area Super updated', 'Super de área actualizado')}${value ? ` → ${value}` : ''}`, 'success')
  }

  const addBasicItem = () => {
    const desc = basicDesc.trim()
    if (!desc) {
      showToast(t('Say or type an item first', 'Diga o escriba un ítem'), 'warn')
      return
    }

    setItems((current) => ([
      {
        id: formatNewItemId(),
        trade: '',
        pri: basicPri,
        desc,
        bldg: '',
        unit: fld(basicLoc.trim(), '—'),
        due: '',
        status: 'open',
        trackerStep: 0,
        dispatchedAt: null,
      },
      ...current,
    ]))
    setBasicDesc('')
    setBasicLoc('')
    showToast(t('Added', 'Agregado'), 'success')
  }

  const toggleDone = (id) => {
    let nextStatus = 'open'

    setItems((current) => current.map((item) => {
      if (item.id !== id) return item
      nextStatus = item.status === 'done' ? 'open' : 'done'
      return { ...item, status: nextStatus }
    }))

    if (nextStatus === 'done') {
      showToast(`✓ ${t('Done', 'Listo')}`, 'success')
    }
  }

  const stopVoice = () => {
    setRecognitionActive(false)
    if (voiceTimerRef.current) {
      window.clearTimeout(voiceTimerRef.current)
      voiceTimerRef.current = null
    }
  }

  const basicVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast(t('Voice not available here — type the item', 'Voz no disponible — escriba el ítem'), 'warn')
      return
    }

    if (recognitionActive && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // noop
      }
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = spanishMode ? 'es-US' : 'en-US'
      setRecognitionActive(true)

      recognition.onresult = (event) => {
        let transcript = ''
        for (let index = 0; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript
        }
        setBasicDesc(transcript)
      }

      recognition.onerror = () => {
        showToast(t('Voice stopped — type instead', 'Voz detenida — escriba'), 'warn')
        stopVoice()
      }

      recognition.onend = () => stopVoice()
      recognition.start()

      voiceTimerRef.current = window.setTimeout(() => {
        if (!recognitionRef.current) return
        try {
          recognitionRef.current.stop()
        } catch {
          // noop
        }
      }, 90000)
    } catch {
      showToast(t('Voice unavailable — type the item', 'Voz no disponible — escriba'), 'warn')
      stopVoice()
    }
  }

  const quickDispatch = (id) => {
    setSelectedIds([id])
    setCurrentDispatchType('both')
    setDispatchModalOpen(true)
  }

  const exitDemo = () => {
    if (window.confirm(t('Exit demo?', '¿Salir del demo?'))) {
      setIsClosed(true)
    }
  }

  const renderItemCard = (item, context = 'field') => {
    const isDispatched = item.status === 'dispatched'
    const isFlagged = item.status === 'flagged'
    const priorityLabel = item.pri === 'P1'
      ? t('P1 Critical', 'P1 Crítico')
      : item.pri === 'P2'
        ? t('P2 Standard', 'P2 Estándar')
        : t('P3 Minor', 'P3 Menor')
    const priorityClass = item.pri.toLowerCase()
    const steps = spanishMode ? STEPS_ES : STEPS_EN
    const showCheckbox = context === 'field' && selectMode

    return (
      <div key={`${context}-${item.id}`} className={`punch-item ${priorityClass}-border ${isDispatched ? 'dispatched-item' : ''}`}>
        <div className="item-header">
          {showCheckbox ? (
            <button
              type="button"
              className={`item-check ${selectedSet.has(item.id) ? 'checked' : ''}`}
              onClick={() => toggleSelect(item.id)}
            >
              {selectedSet.has(item.id) ? '✓' : ''}
            </button>
          ) : null}
          <div className="item-body">
            <div className="item-title-row">
              <span className="item-id">{item.id}</span>
              <span className={`priority-badge ${priorityClass}-badge`}>{priorityLabel}</span>
            </div>
            <div className="item-desc">{item.desc}</div>
            <div className="item-meta">
              <span className="meta-chip">🏗️ {fld(item.trade, t('Unassigned trade', 'Comercio sin asignar'))}</span>
              <span className="meta-chip">🏢 {t('Bldg', 'Edif.')} {fld(item.bldg, '—')} — {fld(item.unit, '—')}</span>
              <span className="meta-chip">👷 AS: {fld(getAS(item.bldg), t('unassigned', 'sin asignar'))}</span>
              <span className="meta-chip">📅 {fld(item.due, '—')}</span>
            </div>
            {isDispatched ? (
              <div className="dispatch-tag">📤 {t('Dispatched', 'Despachado')} {item.dispatchedAt}</div>
            ) : null}
            {isFlagged ? (
              <div className="dispatch-tag dispatch-tag-warning">⚠️ {t('Flagged to super — no sub on site', 'Marcado al super — sin sub')} {item.dispatchedAt}</div>
            ) : null}
          </div>
        </div>

        {isDispatched ? (
          <div className="reply-tracker visible">
            <span className="tracker-label">{t('Reply:', 'Respuesta:')}</span>
            <div className="tracker-steps">
              {steps.map((stepLabel, index) => (
                <button
                  key={`${item.id}-${stepLabel}`}
                  type="button"
                  className={`tracker-step ${item.trackerStep > index ? 'done' : item.trackerStep === index ? 'active' : ''}`}
                  onClick={() => advanceTracker(item.id, index)}
                >
                  {stepLabel}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!isDispatched ? (
          <div className="item-actions">
            {!selectMode ? (
              <button type="button" className="action-btn dispatch-btn" onClick={() => quickDispatch(item.id)}>
                {t('Dispatch', 'Despachar')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  if (isClosed) {
    return <div className="punch-closed-screen">FC-PUNCH-001 Demo closed.</div>
  }

  return (
    <div className="punch-page">
      <div className="header">
        <div className="header-left">
          <button type="button" className="back-btn" onClick={() => navigate('/')}>
            ← {t('Back', 'Volver')}
          </button>
          <span className="header-logo">FieldComm Pro</span>
          <span className="header-title">Punch List</span>
          <span className="header-badge">DEMO · NOT SAVED</span>
        </div>
        <div className="header-right">
          <button type="button" className={`lang-toggle ${spanishMode ? 'es-active' : ''}`} onClick={toggleLanguage}>
            {spanishMode ? 'EN' : 'ES'}
          </button>
          <button type="button" className="exit-btn" onClick={exitDemo}>
            {t('Exit', 'Salir')}
          </button>
        </div>
      </div>

      <div className="eng-banner">
        <span><strong>GC:</strong> Keystone Build Partners</span>
        <span><strong>Project:</strong> Cypress Pointe Phase II</span>
        <span><strong>Location:</strong> Lakeland, FL</span>
        <span><strong>Units:</strong> 312</span>
        <span><strong>Module:</strong> FC-PUNCH-001 Rev 8</span>
      </div>

      <div className="mode-toggle-bar">
        <div className="mode-toggle-switch">
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'basic' ? 'active' : ''}`}
            onClick={() => setMode('basic')}
          >
            {t('Basic list', 'Lista básica')}
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'full' ? 'active' : ''}`}
            onClick={() => {
              setMode('full')
              setActiveTab('field')
            }}
          >
            {t('Full tools', 'Herramientas')}
          </button>
        </div>
        <span className="mode-hint">{currentModeHint}</span>
      </div>

      {mode === 'full' ? (
        <div className="tabs">
          <button type="button" className={`tab-btn ${activeTab === 'field' ? 'active' : ''}`} onClick={() => setActiveTab('field')}>
            {t('Field Walk', 'Recorrido')}
          </button>
          <button type="button" className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`} onClick={() => setActiveTab('dispatch')}>
            {t('Dispatch', 'Despacho')}
          </button>
          <button type="button" className={`tab-btn ${activeTab === 'open' ? 'active' : ''}`} onClick={() => setActiveTab('open')}>
            {t('All Open', 'Todos')}
          </button>
        </div>
      ) : null}

      <div className={`panel ${mode === 'basic' ? 'active' : ''}`}>
        <div className="quick-add-card">
          <div className="quick-add-row">
            <button type="button" id="micBtn" className={`mic-btn ${recognitionActive ? 'recording' : ''}`} onClick={basicVoice} title="Voice">
              {recognitionActive ? '⏹' : '🎤'}
            </button>
            <textarea
              id="basicDesc"
              className="basic-textarea"
              rows="2"
              placeholder={t('Tap mic and talk, or type the item…', 'Toque el micrófono o escriba el ítem…')}
              value={basicDesc}
              onChange={(event) => setBasicDesc(event.target.value)}
            />
          </div>
          <div className="quick-add-controls">
            <input
              id="basicLoc"
              type="text"
              className="basic-loc-input"
              placeholder={t('Location (e.g. Bldg A – 204) — optional', 'Ubicación (opcional)')}
              value={basicLoc}
              onChange={(event) => setBasicLoc(event.target.value)}
            />
            <div className="basic-pri-chips">
              {['P1', 'P2', 'P3'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className={`basic-pri-btn ${basicPri === priority ? 'active' : ''}`}
                  onClick={() => setBasicPri(priority)}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="basic-add-btn" onClick={addBasicItem}>
            {t('Add to list', 'Agregar a la lista')}
          </button>
        </div>

        <div className="basic-list-header">
          <span className="section-header basic-section-title">{t('To do', 'Pendiente')}</span>
          <span className="muted-count">{`${basicOpenItems.length} ${t('open', 'abierto')}`}</span>
        </div>
        <div>
          {basicOpenItems.length ? basicOpenItems.map((item) => {
            const priorityColor = item.pri === 'P1' ? 'var(--fc-red)' : item.pri === 'P3' ? 'var(--fc-teal)' : 'var(--fc-amber)'
            const location = fld(item.unit, '')
            const showLocation = location && location !== '—'
            const showTrade = Boolean(fld(item.trade, ''))
            const isDone = false

            return (
              <div key={`basic-open-${item.id}`} className="basic-row-card" style={{ borderLeftColor: priorityColor }}>
                <button
                  type="button"
                  className="basic-status-btn"
                  style={{ borderColor: isDone ? 'var(--fc-green)' : 'var(--fc-gray-200)', background: isDone ? 'var(--fc-green)' : 'white' }}
                  onClick={() => toggleDone(item.id)}
                >
                  {isDone ? '✓' : ''}
                </button>
                <div className="basic-row-content">
                  <div className="basic-row-desc">{item.desc}</div>
                  <div className="basic-row-meta">
                    {showTrade ? <span className="basic-trade-label">{item.trade} · </span> : null}
                    <span className="basic-priority-label" style={{ color: priorityColor }}>{item.pri}</span>
                    {showLocation ? <span className="basic-location-label">· {location}</span> : null}
                  </div>
                </div>
              </div>
            )
          }) : <div className="empty-state">{t('Empty — add your first item above.', 'Vacío — agregue su primer ítem arriba.')}</div>}
        </div>

        <div className="basic-list-header basic-done-header">
          <span className="section-header basic-section-title">{t('Done', 'Listo')}</span>
          <span className="muted-count">{basicDoneItems.length}</span>
        </div>
        <div>
          {basicDoneItems.length ? basicDoneItems.map((item) => {
            const priorityColor = item.pri === 'P1' ? 'var(--fc-red)' : item.pri === 'P3' ? 'var(--fc-teal)' : 'var(--fc-amber)'
            const location = fld(item.unit, '')
            const showLocation = location && location !== '—'
            const showTrade = Boolean(fld(item.trade, ''))

            return (
              <div key={`basic-done-${item.id}`} className="basic-row-card" style={{ borderLeftColor: priorityColor }}>
                <button
                  type="button"
                  className="basic-status-btn"
                  style={{ borderColor: 'var(--fc-green)', background: 'var(--fc-green)' }}
                  onClick={() => toggleDone(item.id)}
                >
                  ✓
                </button>
                <div className="basic-row-content">
                  <div className="basic-row-desc is-done">{item.desc}</div>
                  <div className="basic-row-meta">
                    {showTrade ? <span className="basic-trade-label">{item.trade} · </span> : null}
                    <span className="basic-priority-label" style={{ color: priorityColor }}>{item.pri}</span>
                    {showLocation ? <span className="basic-location-label">· {location}</span> : null}
                  </div>
                </div>
              </div>
            )
          }) : <div className="basic-done-empty">{t('Nothing checked off yet.', 'Nada marcado aún.')}</div>}
        </div>
      </div>

      <div className={`panel ${mode === 'full' && activeTab === 'field' ? 'active' : ''}`}>
        <div className="stats-row">
          <div className="stat-card red"><div className="stat-num">{stats.p1}</div><div className="stat-label">{t('Critical', 'Crítico')}</div></div>
          <div className="stat-card amber"><div className="stat-num">{stats.p2}</div><div className="stat-label">{t('Standard', 'Estándar')}</div></div>
          <div className="stat-card green"><div className="stat-num">{stats.p3}</div><div className="stat-label">{t('Minor', 'Menor')}</div></div>
          <div className="stat-card blue"><div className="stat-num">{stats.dispatched}</div><div className="stat-label">{t('Dispatched', 'Despachado')}</div></div>
        </div>

        <div className="filter-row">
          <select value={filterTrade} onChange={(event) => setFilterTrade(event.target.value)}>
            <option value="all">{t('All Trades', 'Todos los comercios')}</option>
            {tradeOptions.map((trade) => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
          <select value={filterPri} onChange={(event) => setFilterPri(event.target.value)}>
            <option value="all">{t('All Priority', 'Todas las prioridades')}</option>
            <option value="P1">{t('P1 Critical', 'P1 Crítico')}</option>
            <option value="P2">{t('P2 Standard', 'P2 Estándar')}</option>
            <option value="P3">{t('P3 Minor', 'P3 Menor')}</option>
          </select>
          <button type="button" className="add-btn" onClick={toggleAddForm}>
            {t('+ Add Item', '+ Agregar')}
          </button>
        </div>

        <button type="button" className="detail-bar roster-bar" onClick={() => setIsRosterDetailOpen((current) => !current)}>
          <span><strong>{t('Sub directory:', 'Directorio:')}</strong> <span>{rosterSummary}</span></span>
          <span className="caret-toggle">{isRosterDetailOpen ? '▾' : '▸'}</span>
        </button>
        {isRosterDetailOpen ? (
          <div className="detail-card">
            {roster.length === 0 ? (
              <div className="detail-empty">{t('No contracted subs found. Connect a Procore Commitments export (contracts + POs) to populate the directory. Dispatch will flag all items to super until then.', 'Sin subs contratados. Conecte una exportación de Procore.')}</div>
            ) : (
              <>
                {roster.map((sub) => {
                  const isEditingForeman = editState.type === 'foreman' && editState.key === sub.trade
                  return (
                    <div key={sub.trade} className="detail-row">
                      <span>
                        <span className={`detail-dot ${sub.onSiteToday ? 'green' : 'amber'}`}>●</span>{' '}
                        <strong>{sub.trade}</strong> — {fld(sub.name, t('Unnamed', 'Sin nombre'))}{' '}
                        {isEditingForeman ? (
                          <span className="inline-edit-wrap">
                            <input
                              type="text"
                              className="inline-edit-input"
                              placeholder={t('foreman name', 'nombre capataz')}
                              value={editState.value}
                              onChange={(event) => setEditState((current) => ({ ...current, value: event.target.value }))}
                            />
                            <button type="button" className="inline-edit-save" onClick={() => saveForeman(sub.trade)}>{t('Save', 'Guardar')}</button>
                            <button type="button" className="inline-edit-cancel" onClick={cancelEdit}>✕</button>
                          </span>
                        ) : (
                          <span className="detail-muted-inline">
                            ({fld(sub.foreman, t('no foreman', 'sin capataz'))}){' '}
                            <button type="button" className="inline-edit-trigger" onClick={() => startEdit('foreman', sub.trade, fld(sub.foreman, ''))}>✎</button>
                          </span>
                        )}
                      </span>
                      <span className="detail-status-pill-row">
                        <span className={`detail-lang-pill ${subLang(sub) === 'es' ? 'es' : 'en'}`}>{subLang(sub).toUpperCase()}</span>
                        <span className="detail-small-text">
                          {sub.onSiteToday ? t('on site today', 'en obra hoy') : `${t('last', 'última')} ${fld(sub.lastOnSite, '—')}`}
                        </span>
                      </span>
                    </div>
                  )
                })}
                {missingTrades.length ? (
                  <div className="detail-warning-box">
                    ⚠️ {t('Open punch items exist for', 'Hay ítems para')}: <strong>{missingTrades.join(', ')}</strong> — {t('no sub on site. These flag to super on dispatch.', 'sin sub en obra. Se marcan al super.')}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        <button type="button" className="detail-bar team-bar" onClick={() => setIsTeamDetailOpen((current) => !current)}>
          <span><strong>{t('Team & help:', 'Equipo y ayuda:')}</strong> <span>{`${t('Super', 'Super')} ${fld(PROJECT_ROLES.super.name, '—')} · APM ${fld(PROJECT_ROLES.apm.name, '—')}`}</span></span>
          <span className="caret-toggle">{isTeamDetailOpen ? '▾' : '▸'}</span>
        </button>
        {isTeamDetailOpen ? (
          <div className="detail-card">
            <div className="detail-section-title">{t('Need a sub added or fixed? Contact:', '¿Necesita corregir la lista? Contacte:')}</div>
            {[PROJECT_ROLES.super, PROJECT_ROLES.apm].map((person) => (
              <div key={person.role} className="detail-row">
                <span>
                  <strong>{person.role}</strong> — {fld(person.name, t('not set', 'sin asignar'))}
                  <br />
                  <span className="detail-note">{person.note}</span>
                </span>
                <a href={`tel:${fld(person.phone, '')}`} className="detail-phone-link">📞 {fld(person.phone, t('no number', 'sin número'))}</a>
              </div>
            ))}
            <div className="detail-section-title team-zone-title">{t('Area Supers by zone', 'Supers de área por zona')}</div>
            {Object.keys(zones).map((zone) => {
              const isEditingAS = editState.type === 'as' && editState.key === zone
              return (
                <div key={zone} className="detail-row">
                  <span><strong>{t('Bldg', 'Edif.')} {zone}</strong> {t('Area Super', 'Super de Área')}:</span>
                  <span className="detail-inline-value">
                    {isEditingAS ? (
                      <span className="inline-edit-wrap">
                        <input
                          type="text"
                          className="inline-edit-input zone-edit-input"
                          placeholder={t('AS name', 'nombre AS')}
                          value={editState.value}
                          onChange={(event) => setEditState((current) => ({ ...current, value: event.target.value }))}
                        />
                        <button type="button" className="inline-edit-save" onClick={() => saveAS(zone)}>{t('Save', 'Guardar')}</button>
                        <button type="button" className="inline-edit-cancel" onClick={cancelEdit}>✕</button>
                      </span>
                    ) : (
                      <>
                        {fld(getAS(zone), t('unassigned', 'sin asignar'))}{' '}
                        <button type="button" className="inline-edit-trigger" onClick={() => startEdit('as', zone, getAS(zone))}>✎</button>
                      </>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="select-row">
          <button type="button" className={`action-btn select-btn ${selectMode ? 'select-btn-active' : ''}`} onClick={toggleSelectionMode}>
            {selectMode ? t('Cancel Select', 'Cancelar') : t('Select to Dispatch', 'Seleccionar')}
          </button>
          {selectMode ? <span className="muted-count">{`${selectedIds.length} ${t('selected', 'seleccionados')}`}</span> : null}
        </div>

        {isAddFormOpen ? (
          <div className="add-form visible">
            <div className="form-row">
              <label className="form-label">{t('Description', 'Descripción')}</label>
              <input
                className="form-input"
                type="text"
                placeholder={t('What needs to be fixed?', '¿Qué se debe corregir?')}
                value={newItem.desc}
                onChange={(event) => setNewItem((current) => ({ ...current, desc: event.target.value }))}
              />
            </div>
            <div className="form-row-2">
              <div className="form-row">
                <label className="form-label">{t('Trade', 'Comercio')}</label>
                <select
                  className="form-select"
                  value={newItem.trade}
                  onChange={(event) => setNewItem((current) => ({ ...current, trade: event.target.value }))}
                >
                  {tradeOptions.map((trade) => <option key={trade}>{trade}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">{t('Priority', 'Prioridad')}</label>
                <select
                  className="form-select"
                  value={newItem.pri}
                  onChange={(event) => setNewItem((current) => ({ ...current, pri: event.target.value }))}
                >
                  <option value="P1">{t('P1 – Critical', 'P1 – Crítico')}</option>
                  <option value="P2">{t('P2 – Standard', 'P2 – Estándar')}</option>
                  <option value="P3">{t('P3 – Minor', 'P3 – Menor')}</option>
                </select>
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-row">
                <label className="form-label">{t('Building', 'Edificio')}</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="A"
                  value={newItem.bldg}
                  onChange={(event) => setNewItem((current) => ({ ...current, bldg: event.target.value }))}
                />
              </div>
              <div className="form-row">
                <label className="form-label">{t('Unit / Zone', 'Unidad')}</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="101"
                  value={newItem.unit}
                  onChange={(event) => setNewItem((current) => ({ ...current, unit: event.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">{t('Due Date', 'Fecha Límite')}</label>
              <input
                className="form-input"
                type="date"
                value={newItem.due}
                onChange={(event) => setNewItem((current) => ({ ...current, due: event.target.value }))}
              />
            </div>
            <div className="form-btns">
              <button type="button" className="form-save-btn" onClick={addItem}>{t('Save Item', 'Guardar')}</button>
              <button type="button" className="form-cancel-btn" onClick={toggleAddForm}>{t('Cancel', 'Cancelar')}</button>
            </div>
          </div>
        ) : null}

        <div className={selectMode ? 'select-mode' : ''}>
          {filteredItems.length ? filteredItems.map((item) => renderItemCard(item, 'field')) : <div className="empty-state">{t('No items match filters.', 'Sin ítems con estos filtros.')}</div>}
        </div>
      </div>

      <div className={`panel ${mode === 'full' && activeTab === 'dispatch' ? 'active' : ''}`}>
        <div className="section-header">{t('Dispatched Items — Reply Tracking', 'Ítems Despachados — Seguimiento')}</div>
        {dispatchedItems.length ? dispatchedItems.map((item) => renderItemCard(item, 'dispatch')) : (
          <div className="dispatch-empty">
            <div className="dispatch-empty-icon">📤</div>
            <span>{t('No dispatched items yet — select items in Field Walk and dispatch them.', 'Sin ítems despachados aún.')}</span>
          </div>
        )}
      </div>

      <div className={`panel ${mode === 'full' && activeTab === 'open' ? 'active' : ''}`}>
        <div className="section-header">{t('All Open Items by Trade', 'Todos por Comercio')}</div>
        {openItems.length ? Object.entries(openItems.reduce((grouped, item) => {
          if (!grouped[item.trade]) grouped[item.trade] = []
          grouped[item.trade].push(item)
          return grouped
        }, {})).map(([trade, tradeItems]) => (
          <div key={trade}>
            <div className="section-header">{trade} ({tradeItems.length})</div>
            {tradeItems.map((item) => renderItemCard(item, 'open'))}
          </div>
        )) : <div className="empty-state">{t('All items dispatched!', '¡Todos despachados!')}</div>}
      </div>

      <div className={`dispatch-bar ${selectMode && selectedIds.length ? 'visible' : ''}`}>
        <div className="dispatch-bar-top">
          <span className="dispatch-count">{`${selectedIds.length} ${t('items selected', 'ítems seleccionados')}`}</span>
          <button type="button" className="dispatch-cancel" onClick={cancelSelect}>{t('Cancel', 'Cancelar')}</button>
        </div>
        <div className="dispatch-actions">
          <button type="button" className="dispatch-action-btn" onClick={() => openDispatchModal('text')}>{t('📱 Text Foreman', '📱 Texto Capataz')}</button>
          <button type="button" className="dispatch-action-btn email" onClick={() => openDispatchModal('email')}>{t('📧 Email Sub Office', '📧 Email Oficina')}</button>
          <button type="button" className="dispatch-action-btn both" onClick={() => openDispatchModal('both')}>{t('✅ Both', '✅ Ambos')}</button>
        </div>
      </div>

      <div className={`modal-overlay ${dispatchModalOpen ? 'visible' : ''}`}>
        <div className="modal">
          <div className="modal-title">📤 {t('Dispatch', 'Despacho')} — {modalTypeLabel}</div>
          <div className="modal-sub">{t('Review by trade. Toggle EN/ES per sub.', 'Revisar por comercio.')}</div>
          <div>
            {Object.keys(selectedByTrade).length ? Object.entries(selectedByTrade).map(([trade, tradeItems]) => {
              const sub = getSub(trade)
              if (!sub) {
                return (
                  <div key={trade} className="sub-dispatch-block sub-dispatch-warning">
                    <div className="sub-header">
                      <div className="sub-name sub-warning-title">⚠️ {trade} — {t('No sub on site', 'Sin sub en obra')}</div>
                    </div>
                    <div className="sub-warning-copy">{t('This trade is not in the Daily Log roster (demobbed or never logged). Cannot auto-dispatch.', 'Este comercio no está en el registro diario. No se puede despachar.')}</div>
                    <ul className="sub-items-list sub-warning-list">
                      {tradeItems.map((item) => <li key={item.id}>{item.id} — {item.desc.length > 50 ? `${item.desc.slice(0, 50)}…` : item.desc}</li>)}
                    </ul>
                    <div className="sub-warning-action">→ {t('Will flag super to schedule return trip', 'Se notificará al super para reprogramar')}</div>
                    <div className="sub-warning-help">
                      {t('Need this sub added? Contact', '¿Agregar este sub? Contacte')} {fld(PROJECT_ROLES.apm.name, 'APM')} (APM · Procore){' '}
                      <a href={`tel:${fld(PROJECT_ROLES.apm.phone, '')}`} className="sub-help-link">📞 {fld(PROJECT_ROLES.apm.phone, t('no number', 'sin número'))}</a>
                    </div>
                  </div>
                )
              }

              const useSpanish = subLangOverride[trade] ?? (subLang(sub) === 'es')
              const hasPhone = fld(sub.phone, '') !== ''
              const hasEmail = fld(sub.email, '') !== ''
              const contactLine = currentDispatchType === 'text'
                ? `📱 ${hasPhone ? sub.phone : t('no phone on file', 'sin teléfono')}`
                : currentDispatchType === 'email'
                  ? `📧 ${hasEmail ? sub.email : t('no email on file', 'sin correo')}`
                  : `📱 ${hasPhone ? sub.phone : t('no phone on file', 'sin teléfono')} · 📧 ${hasEmail ? sub.email : t('no email on file', 'sin correo')}`
              const showChannelWarning = (currentDispatchType === 'text' && !hasPhone)
                || (currentDispatchType === 'email' && !hasEmail)
                || (currentDispatchType === 'both' && !hasPhone && !hasEmail)

              return (
                <div key={trade} className="sub-dispatch-block">
                  <div className="sub-header">
                    <div>
                      <div className="sub-name">{fld(sub.name, t('Unnamed sub', 'Sub sin nombre'))}</div>
                      <div className="detail-small-text">{contactLine}</div>
                      <div className="detail-small-text site-status-line">
                        {sub.onSiteToday ? <span className="status-green">● {t('on site today', 'en obra hoy')}</span> : <span className="status-amber">● {t('last on site', 'última vez')} {fld(sub.lastOnSite, t('unknown', 'desconocido'))}</span>}
                      </div>
                      {showChannelWarning ? <div className="channel-warning">⚠️ {t('No target for this channel — will report and hold', 'Sin destino — se reportará y retendrá')}</div> : null}
                    </div>
                    <button type="button" className={`sub-lang-pill ${useSpanish ? 'es' : ''}`} onClick={() => toggleSubLanguage(trade)}>
                      {useSpanish ? 'ES' : 'EN'}
                    </button>
                  </div>
                  <div className="msg-preview">{buildMessage(trade, tradeItems, sub, useSpanish)}</div>
                  <ul className="sub-items-list">
                    {tradeItems.map((item) => <li key={item.id}>{item.id} — {item.desc.length > 50 ? `${item.desc.slice(0, 50)}…` : item.desc}</li>)}
                  </ul>
                </div>
              )
            }) : <p className="empty-state">No items.</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel-btn" onClick={closeModal}>{t('Back', 'Volver')}</button>
            <button type="button" className="modal-send-btn" onClick={confirmDispatch}>{t('Confirm & Send All', 'Confirmar y Enviar')}</button>
          </div>
        </div>
      </div>

      <div className={`toast ${toast.visible ? `show ${toast.type}`.trim() : ''}`}>{toast.message}</div>
    </div>
  )
}

export default PunchList
