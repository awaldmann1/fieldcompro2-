import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DailyReport.css'

const TRADES = [
  { id: 'Concrete', en: 'Concrete', es: 'Concreto' },
  { id: 'Framing', en: 'Framing', es: 'Estructura' },
  { id: 'Electrical', en: 'Electrical', es: 'Eléctrico' },
  { id: 'Plumbing', en: 'Plumbing', es: 'Plomería' },
  { id: 'HVAC', en: 'HVAC', es: 'HVAC' },
  { id: 'Insulation', en: 'Insulation', es: 'Aislamiento' },
  { id: 'Drywall', en: 'Drywall', es: 'Drywall' },
  { id: 'Painting', en: 'Painting', es: 'Pintura' },
  { id: 'Flooring', en: 'Flooring', es: 'Pisos' },
  { id: 'Trim', en: 'Trim', es: 'Molduras' },
]

const STRINGS = {
  en: {
    nb0: 'Start',
    nb1: 'Report',
    nb2: 'Procore',
    nb3: 'Guide',
    s0cta: 'Begin AS Report →',
    pilotNote:
      '🧪 <strong>Pilot version</strong> — Dropdowns show sample data. After your setup call with the FieldComm team, your AS names, zones, and sub roster will be loaded. Tap <strong>Begin AS Report</strong> to try it now.',
    pnote: "⚠ Pilot mode — sample data in dropdowns. Final version uses your team's real names.",
    lDate: 'Date',
    lAS: 'AS Name',
    lZone: 'Zone / Building',
    lCrew: 'Total Workers Today',
    lTrades: 'Sub Trades on Site',
    ctWork: 'Work Status',
    lDone: 'Work Completed Today',
    donePh: 'What was finished today?',
    lProg: 'Work In Progress',
    progPh: "What's still in progress?",
    ctIssues: 'Issues & Safety',
    lDelay: 'Delay Today?',
    lDelayType: 'Delay Type',
    lDelayDesc: 'Delay Description',
    delayPh: 'Describe the delay...',
    lSafety: 'Safety Event?',
    lSafetyType: 'Event Type',
    lSafetyDesc: 'Safety Description',
    safetyPh: 'Describe the event...',
    ctInsp: 'Inspections',
    lInsp: 'Inspection Today',
    lInspResult: 'Result',
    ctPhoto: 'Photos',
    lPhoto: 'Add Photos',
    ctNotes: 'Open Notes',
    lNotes: 'Additional Notes',
    notesPh: 'Anything else for the record?',
    submitBtn: 'Submit Daily Report',
    exitTitle: 'Exit Demo?',
    exitMsg: 'Your report data will not be saved.',
    cancelLabel: 'Stay',
    exitConfirmLabel: 'Exit',
    langBtn: 'ES',
    proNote:
      "This preview updates live as the AS fills out the form. Fields in <span class=\"daily-report-accent\">amber</span> are not yet entered. In the live system, Submit routes directly to Procore's daily log API.",
    amberBanner: '⚠ Report is incomplete — tap to finish missing fields',
    voiceTip:
      '🎤 <strong>Voice tip:</strong> Tap the mic, wait a beat, speak naturally. Tap again to stop. Requires Safari on iOS 15+ or Chrome on Android.',
    browserTip:
      '📱 <strong>Opening this file:</strong> If you see code text instead of this page — press and hold the attachment, tap <em>Save to Files</em>, then open it from the Files app in Safari.',
    g1h: 'AS Opens This Link',
    g1p: 'Each AS taps a URL at end of day — no login, no app to install. Opens in Safari on iPhone or iPad.',
    g2h: 'Voice or Tap',
    g2p: 'Tap 🎤 to dictate hands-free in English or Spanish. Dropdowns stay click-only for Procore data integrity.',
    g3h: 'Procore Log Builds Live',
    g3p: 'The form data formats into a Procore daily log entry in real time — no re-typing, no reformatting.',
    g4h: 'Super Reviews & Approves',
    g4p: 'You see all AS reports in one view. Review, approve, and Procore updates automatically.',
    g5h: 'Dead Zones? No Problem',
    g5p: 'Reports queue offline and auto-send when signal returns. Nothing gets lost in the field.',
    f1t: 'Voice Input',
    f1d: 'Dictate field notes hands-free in English or Spanish',
    f2t: 'Procore Ready',
    f2d: 'Auto-builds daily log entry as you fill the form',
    f3t: 'Works Offline',
    f3d: 'Reports queue locally and send when back online',
    f4t: 'Skip-Friendly',
    f4d: 'Never blocked — skip any field and come back later',
    heroSub: 'Keystone Build Partners · Lakeland, FL · 312 units',
    hdrProj: 'Cypress Pointe II',
    ph: 'Procore Daily Log Preview',
    ctCrew: 'Crew on Site',
    ctGuide: 'How It Works',
    skipMsg: '⚠ Come back to this',
    photoCount: (count) => `${count} photo${count === 1 ? '' : 's'} added`,
    voiceStart: 'Listening — tap mic to stop',
    voiceError: 'Voice unavailable — requires Safari iOS 15+',
    exitLabel: 'Exit',
    langSwitched: 'Switched to English',
    proEmptyTitle: 'No report data yet',
    proEmptyDesc: 'Fill out the Report tab and tap Submit — the Procore daily log will build here in real time.',
    proEmptyBtn: 'Go to Report →',
    backLabel: 'Back',
  },
  es: {
    nb0: 'Inicio',
    nb1: 'Reporte',
    nb2: 'Procore',
    nb3: 'Guía',
    s0cta: 'Comenzar Reporte →',
    pilotNote:
      '🧪 <strong>Versión piloto</strong> — Los menús muestran datos de muestra. Después de su llamada con el equipo de FieldComm, se cargarán sus nombres de AS, zonas y subcontratistas. Toque <strong>Comenzar Reporte</strong> para probar.',
    pnote: '⚠ Modo piloto — datos de muestra. La versión final usa los nombres reales de su equipo.',
    lDate: 'Fecha',
    lAS: 'Nombre del AS',
    lZone: 'Zona / Edificio',
    lCrew: 'Total de Trabajadores Hoy',
    lTrades: 'Subcontratistas en Obra',
    ctWork: 'Estado del Trabajo',
    lDone: 'Trabajo Completado Hoy',
    donePh: '¿Qué se terminó hoy?',
    lProg: 'Trabajo en Progreso',
    progPh: '¿Qué sigue en proceso?',
    ctIssues: 'Problemas y Seguridad',
    lDelay: '¿Hubo Retraso Hoy?',
    lDelayType: 'Tipo de Retraso',
    lDelayDesc: 'Descripción del Retraso',
    delayPh: 'Describa el retraso...',
    lSafety: '¿Evento de Seguridad?',
    lSafetyType: 'Tipo de Evento',
    lSafetyDesc: 'Descripción',
    safetyPh: 'Describa el evento...',
    ctInsp: 'Inspecciones',
    lInsp: 'Inspección Hoy',
    lInspResult: 'Resultado',
    ctPhoto: 'Fotos',
    lPhoto: 'Agregar Fotos',
    ctNotes: 'Notas Abiertas',
    lNotes: 'Notas Adicionales',
    notesPh: '¿Algo más para el registro?',
    submitBtn: 'Enviar Reporte Diario',
    exitTitle: '¿Salir del Demo?',
    exitMsg: 'Los datos del reporte no se guardarán.',
    cancelLabel: 'Quedarme',
    exitConfirmLabel: 'Salir',
    langBtn: 'EN',
    proNote:
      'Esta vista previa se actualiza en tiempo real. Los campos en <span class="daily-report-accent">ámbar</span> no han sido ingresados aún.',
    amberBanner: '⚠ Reporte incompleto — toque para terminar los campos faltantes',
    voiceTip:
      '🎤 <strong>Consejo de voz:</strong> Toque el micrófono, espere un momento, hable normalmente. Toque de nuevo para detener.',
    browserTip:
      '📱 <strong>Abrir este archivo:</strong> Si ve código de texto — mantenga presionado el archivo adjunto, toque <em>Guardar en Archivos</em>, luego ábralo desde la app Archivos en Safari.',
    g1h: 'El AS Abre Este Enlace',
    g1p: 'Cada AS toca un enlace al final del día. Sin contraseña, sin instalar apps.',
    g2h: 'Voz o Toque',
    g2p: 'Toque 🎤 para dictar en inglés o español. Los menús permanecen de solo toque para mantener la integridad de los datos en Procore.',
    g3h: 'Registro de Procore Automático',
    g3p: 'Los datos del formulario se formatean en tiempo real. Sin volver a escribir, sin reformatear.',
    g4h: 'El Super Revisa y Aprueba',
    g4p: 'Usted ve todos los reportes de AS en una vista. Revise, apruebe y Procore se actualiza.',
    g5h: '¿Sin Señal? Sin Problema',
    g5p: 'Los reportes se guardan offline y se envían automáticamente al recuperar señal.',
    f1t: 'Entrada de Voz',
    f1d: 'Dicte notas sin manos en inglés o español',
    f2t: 'Listo para Procore',
    f2d: 'Crea automáticamente la entrada del registro diario',
    f3t: 'Funciona Offline',
    f3d: 'Los reportes se envían al recuperar señal',
    f4t: 'Flexible',
    f4d: 'Nunca bloqueado — omita cualquier campo y vuelva después',
    heroSub: 'Keystone Build Partners · Lakeland, FL · 312 unidades',
    hdrProj: 'Cypress Pointe II',
    ph: 'Vista Previa del Registro Diario Procore',
    ctCrew: 'Equipo en Obra',
    ctGuide: 'Cómo Funciona',
    skipMsg: '⚠ Volver a esto',
    photoCount: (count) => `${count} foto${count === 1 ? '' : 's'} agregada${count === 1 ? '' : 's'}`,
    voiceStart: 'Escuchando — toque para detener',
    voiceError: 'Voz no disponible — requiere Safari iOS 15+',
    exitLabel: 'Salir',
    langSwitched: 'Cambiado a Español',
    proEmptyTitle: 'Sin datos de reporte',
    proEmptyDesc: 'Complete la pestaña Reporte y toque Enviar — el registro diario de Procore aparecerá aquí.',
    proEmptyBtn: 'Ir al Reporte →',
    backLabel: 'Atrás',
  },
}

const AS_OPTIONS = [
  'AS-01 (Add Name)',
  'AS-02 (Add Name)',
  'AS-03 (Add Name)',
  'AS-04 (Add Name)',
  'AS-05 (Add Name)',
  'AS-06 (Add Name)',
  'AS-07 (Add Name)',
  'AS-08 (Add Name)',
]

const ZONE_OPTIONS = ['Building A', 'Building B', 'Building C', 'Building D', 'Common Area', 'Site / Grounds']
const DELAY_OPTIONS = ['Material delivery', 'Weather', 'Subcontractor no-show', 'Inspection hold', 'Design issue', 'Equipment failure', 'Other']
const SAFETY_OPTIONS = ['Near-miss', 'First aid', 'Property damage', 'Equipment issue', 'Environmental', 'Other']
const INSPECTION_OPTIONS = ['Framing', 'MEP Rough-In', 'Insulation', 'Pre-Drywall', 'Drywall', 'Concrete Pour', 'Final', 'Other']
const INSPECTION_RESULT_OPTIONS = ['Passed', 'Failed — corrections required', 'Pending', 'Rescheduled']
const FEATURE_CARDS = [
  { icon: '🎤', title: 'f1t', desc: 'f1d' },
  { icon: '🏗️', title: 'f2t', desc: 'f2d' },
  { icon: '📶', title: 'f3t', desc: 'f3d' },
  { icon: '⚡', title: 'f4t', desc: 'f4d' },
]
const GUIDE_STEPS = [
  { heading: 'g1h', body: 'g1p' },
  { heading: 'g2h', body: 'g2p' },
  { heading: 'g3h', body: 'g3p' },
  { heading: 'g4h', body: 'g4p' },
  { heading: 'g5h', body: 'g5p' },
]

const DEFAULT_FORM = {
  date: '',
  asName: '',
  zone: '',
  done: '',
  prog: '',
  delayType: '',
  delayDesc: '',
  safetyType: '',
  safetyDesc: '',
  insp: '',
  inspResult: '',
  notes: '',
}

const DEFAULT_VOICE_STATUS = {
  done: '',
  prog: '',
  delayDesc: '',
  safetyDesc: '',
  notes: '',
}

const DEFAULT_SKIPPED = {
  done: false,
  prog: false,
  delayDesc: false,
  safetyDesc: false,
  notes: false,
}

const formatToday = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function DailyReport() {
  const navigate = useNavigate()
  const activeRecRef = useRef(null)
  const voiceStopTimerRef = useRef(null)
  const toastTimerRef = useRef(null)
  const tabRefs = useRef({})
  const photoInputRef = useRef(null)
  const previousPhotosRef = useRef([])

  const [currentTab, setCurrentTab] = useState('0')
  const [currentLang, setCurrentLang] = useState('en')
  const [crewCount, setCrewCount] = useState(0)
  const [selectedTrades, setSelectedTrades] = useState({})
  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM, date: formatToday() }))
  const [showDelay, setShowDelay] = useState(false)
  const [showSafety, setShowSafety] = useState(false)
  const [photoFiles, setPhotoFiles] = useState([])
  const [submitDone, setSubmitDone] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [proReceivedMessage, setProReceivedMessage] = useState('')
  const [showExitModal, setShowExitModal] = useState(false)
  const [toast, setToast] = useState('')
  const [deviceBanner, setDeviceBanner] = useState({ visible: false, message: '', type: '' })
  const [skippedFields, setSkippedFields] = useState(DEFAULT_SKIPPED)
  const [voiceStatuses, setVoiceStatuses] = useState(DEFAULT_VOICE_STATUS)
  const [activeVoiceField, setActiveVoiceField] = useState(null)

  const t = useCallback(
    (key) => {
      const value = STRINGS[currentLang]?.[key]
      return value ?? STRINGS.en[key] ?? key
    },
    [currentLang],
  )

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 3200)
  }, [])

  const stopActiveRecognition = useCallback(() => {
    if (activeRecRef.current) {
      activeRecRef.current.stop()
      activeRecRef.current = null
    }
    window.clearTimeout(voiceStopTimerRef.current)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('fc_test', '1')
      window.localStorage.removeItem('fc_test')
    } catch (error) {
      showToast(`⚠ Storage unavailable — offline queue disabled`)
    }
  }, [showToast])

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafariIOS = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    const isChromeAndroid = isAndroid && /Chrome/i.test(ua)
    const isDesktop = !isIOS && !isAndroid
    const hasVoice = Boolean(window.webkitSpeechRecognition || window.SpeechRecognition)
    const isFile = window.location.protocol === 'file:'

    let message = ''
    let type = ''
    let autoDismiss = false

    if (isFile) {
      message = '⚠ Opened as a local file — voice input and offline queue require a hosted link. Drop this file on Netlify to enable all features.'
      type = 'warn'
    } else if (isSafariIOS) {
      message = '✓ iPhone / iPad Safari — all features available.'
      type = 'ok'
      autoDismiss = true
    } else if (isChromeAndroid) {
      message = '✓ Android Chrome — all features available.'
      type = 'ok'
      autoDismiss = true
    } else if (isDesktop && hasVoice) {
      message = 'ℹ Desktop browser detected — voice input works here. This tool is optimized for iPhone and iPad on-site.'
      type = 'info'
    } else if (!hasVoice) {
      message = '⚠ Voice input is not supported in this browser. You can type field notes manually — all other features work normally.'
      type = 'warn'
    }

    if (!message) {
      return undefined
    }

    setDeviceBanner({ visible: true, message, type })

    if (!autoDismiss) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setDeviceBanner((prev) => ({ ...prev, visible: false }))
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      try {
        const queue = JSON.parse(window.localStorage.getItem('fc_q') || '[]')
        const pending = queue.filter((report) => report.status === 'queued')

        if (!pending.length) {
          return
        }

        const nextQueue = queue.map((report) => (
          report.status === 'queued' ? { ...report, status: 'sent' } : report
        ))

        window.localStorage.setItem('fc_q', JSON.stringify(nextQueue))
        showToast(`📶 Back online — ${pending.length} report(s) sent`)
      } catch {
        // no-op
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [showToast])

  useEffect(() => () => {
    stopActiveRecognition()
    window.clearTimeout(toastTimerRef.current)
  }, [stopActiveRecognition])

  useEffect(() => {
    const current = new Set(photoFiles.map((photo) => photo.preview))

    previousPhotosRef.current
      .filter((photo) => !current.has(photo.preview))
      .forEach((photo) => URL.revokeObjectURL(photo.preview))

    previousPhotosRef.current = photoFiles
  }, [photoFiles])

  useEffect(() => () => {
    previousPhotosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview))
  }, [])

  useEffect(() => {
    tabRefs.current[currentTab]?.scrollTo?.({ top: 0, behavior: 'smooth' })
  }, [currentTab])

  const selectedTradeLabels = useMemo(
    () => TRADES.filter((trade) => selectedTrades[trade.id]).map((trade) => trade.id),
    [selectedTrades],
  )

  const requiredFieldCount = useMemo(
    () => [form.asName, form.zone, form.done.trim(), form.prog.trim()].filter(Boolean).length,
    [form.asName, form.zone, form.done, form.prog],
  )

  const badgeCount = submitDone ? 4 - requiredFieldCount : 0

  const delaySummary = showDelay ? `${form.delayType || '—'}${form.delayDesc ? ` — ${form.delayDesc.trim()}` : ''}` : 'None'
  const safetySummary = showSafety ? `${form.safetyType || '—'}${form.safetyDesc ? ` — ${form.safetyDesc.trim()}` : ''}` : 'None'
  const inspectionSummary = form.insp ? `${form.insp}${form.inspResult ? ` (${form.inspResult})` : ''}` : null

  const procoreRows = useMemo(
    () => [
      { label: 'Date', value: form.date || null },
      { label: 'AS Name', value: form.asName || null },
      { label: 'Zone', value: form.zone || null },
      { label: 'Crew Count', value: crewCount > 0 ? `${crewCount} workers` : null },
      { label: 'Trades on Site', value: selectedTradeLabels.length ? selectedTradeLabels.join(', ') : null },
      { label: 'Work Completed', value: form.done.trim() || null },
      { label: 'Work In Progress', value: form.prog.trim() || null },
      { label: 'Delay', value: delaySummary },
      { label: 'Safety', value: safetySummary },
      { label: 'Inspection', value: inspectionSummary },
      { label: 'Photos', value: photoFiles.length ? `${photoFiles.length} attached` : null },
      { label: 'Notes', value: form.notes.trim() || null },
    ],
    [crewCount, delaySummary, form, inspectionSummary, photoFiles.length, safetySummary, selectedTradeLabels],
  )

  const html = useCallback((key) => ({ __html: t(key) }), [t])

  const handleTabChange = useCallback((tabId) => {
    setCurrentTab(tabId)
  }, [])

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const toggleTrade = useCallback((tradeId) => {
    setSelectedTrades((prev) => ({ ...prev, [tradeId]: !prev[tradeId] }))
  }, [])

  const adjustCrew = useCallback((delta) => {
    setCrewCount((prev) => Math.max(0, prev + delta))
  }, [])

  const skipField = useCallback((field) => {
    setSkippedFields((prev) => ({ ...prev, [field]: true }))
  }, [])

  const toggleLang = useCallback(() => {
    setCurrentLang((prev) => {
      const next = prev === 'en' ? 'es' : 'en'
      window.setTimeout(() => showToast(STRINGS[next].langSwitched), 0)
      return next
    })
  }, [showToast])

  const handlePhotos = useCallback(
    (event) => {
      const files = Array.from(event.target.files || [])
      const validPhotos = []

      files.forEach((file) => {
        if (file.size > 15 * 1024 * 1024) {
          showToast('Photo over 15MB — skipped')
          return
        }

        validPhotos.push({ file, preview: URL.createObjectURL(file) })
      })

      if (validPhotos.length) {
        setPhotoFiles((prev) => [...prev, ...validPhotos])
      }

      event.target.value = ''
    },
    [showToast],
  )

  const startVoice = useCallback(
    (field) => {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

      if (!SpeechRecognition) {
        showToast(t('voiceError'))
        return
      }

      if (activeRecRef.current) {
        stopActiveRecognition()
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = currentLang === 'es' ? 'es-US' : 'en-US'
      recognition.continuous = true
      recognition.interimResults = true

      const baseValue = form[field]
      let finalBuffer = ''

      activeRecRef.current = recognition
      setActiveVoiceField(field)
      setVoiceStatuses((prev) => ({ ...prev, [field]: t('voiceStart') }))
      voiceStopTimerRef.current = window.setTimeout(() => recognition.stop(), 90000)

      recognition.onresult = (event) => {
        let interim = ''

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0].transcript.trim()

          if (event.results[index].isFinal) {
            finalBuffer += `${finalBuffer ? ' ' : ''}${transcript}`
          } else {
            interim += `${interim ? ' ' : ''}${transcript}`
          }
        }

        const nextValue = [baseValue, finalBuffer, interim].filter(Boolean).join(' ')
        setForm((prev) => ({ ...prev, [field]: nextValue }))
      }

      recognition.onerror = (event) => {
        window.clearTimeout(voiceStopTimerRef.current)
        activeRecRef.current = null
        setActiveVoiceField(null)
        setVoiceStatuses((prev) => ({ ...prev, [field]: '' }))

        if (event.error === 'not-allowed') {
          showToast(
            currentLang === 'es'
              ? 'Mic bloqueado — permita acceso en la barra de dirección'
              : 'Mic blocked — tap lock icon in address bar to allow',
          )
        } else if (event.error !== 'aborted') {
          showToast(`Mic: ${event.error}`)
        }
      }

      recognition.onend = () => {
        window.clearTimeout(voiceStopTimerRef.current)
        activeRecRef.current = null
        setActiveVoiceField(null)
        setVoiceStatuses((prev) => ({ ...prev, [field]: '' }))

        if (finalBuffer) {
          const nextValue = [baseValue, finalBuffer].filter(Boolean).join(' ')
          setForm((prev) => ({ ...prev, [field]: nextValue }))
        }
      }

      try {
        recognition.start()
      } catch (error) {
        activeRecRef.current = null
        setActiveVoiceField(null)
        setVoiceStatuses((prev) => ({ ...prev, [field]: '' }))
        showToast(`Could not start mic: ${error.message}`)
      }
    },
    [currentLang, form, showToast, stopActiveRecognition, t],
  )

  const submitReport = useCallback(() => {
    const nextLang = currentLang !== 'en' ? 'en' : currentLang

    if (currentLang !== 'en') {
      setCurrentLang('en')
      showToast('Switched to English for Procore')
    }

    setSubmitDone(true)

    const now = new Date()
    const report = {
      id: now.getTime(),
      ts: now.toISOString(),
      date: form.date,
      as: form.asName,
      zone: form.zone,
      crew: crewCount,
      trades: selectedTradeLabels,
      done: form.done,
      prog: form.prog,
      notes: form.notes,
      photos: photoFiles.length,
      status: navigator.onLine ? 'sent' : 'queued',
    }

    try {
      const queue = JSON.parse(window.localStorage.getItem('fc_q') || '[]')
      window.localStorage.setItem('fc_q', JSON.stringify([...queue, report]))
    } catch (error) {
      showToast(`⚠ Local save failed: ${error.message}`)
    }

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const online = navigator.onLine
    const statusString = online ? 'Sent' : 'Queued — will send when online'
    setProReceivedMessage(`Report logged at ${timeString} · ${statusString}`)
    setSubmitStatus(online ? `✓ Sent ${timeString}` : '⚠ Offline — queued')

    if (requiredFieldCount < 4) {
      showToast(`Saved — ${requiredFieldCount}/4 key fields ⚠`)
    } else {
      showToast(online ? '✓ Report submitted' : '📶 Queued — will send when online')
    }

    window.setTimeout(() => {
      setCurrentTab('2')
      setCurrentLang(nextLang)
    }, 600)
  }, [crewCount, currentLang, form, photoFiles.length, requiredFieldCount, selectedTradeLabels, showToast])

  const renderVoiceField = (config) => (
    <div className="field-row">
      <label htmlFor={config.id}>{t(config.label)}</label>
      <div className="voice-row">
        <textarea
          id={config.id}
          className="voice-ta"
          rows={config.rows}
          placeholder={t(config.placeholder)}
          value={form[config.field]}
          onChange={(event) => handleFieldChange(config.field, event.target.value)}
        />
        <div className="voice-actions">
          <button
            type="button"
            className={`voice-btn ${activeVoiceField === config.field ? 'listening' : ''}`}
            onClick={() => startVoice(config.field)}
            aria-label={`Voice input for ${t(config.label)}`}
          >
            🎤
          </button>
          <button type="button" className="skip-btn" onClick={() => skipField(config.field)}>
            SKIP
          </button>
        </div>
      </div>
      <div className="voice-status">{voiceStatuses[config.field]}</div>
      <div className={`skip-badge ${skippedFields[config.field] ? 'show' : ''}`}>{t('skipMsg')}</div>
    </div>
  )

  return (
    <div className="daily-report-page">
      <header id="hdr">
        <div id="hdrInner">
          <div className="hdr-left-group">
            <button type="button" className="hdrBtn hdrBackBtn" onClick={() => navigate('/')}>
              ← <span>{t('backLabel')}</span>
            </button>
            <div>
              <div className="fc-mark">
                FieldComm <span className="demo-badge">DEMO · NOT SAVED</span>
              </div>
              <div className="proj-sub">{t('hdrProj')}</div>
            </div>
          </div>
          <div id="hdrRight">
            <button type="button" className="hdrBtn" onClick={toggleLang}>
              <span>{t('langBtn')}</span>
            </button>
            <button type="button" className="hdrBtn" id="exitBtn" onClick={() => setShowExitModal(true)}>
              ✕ <span>{t('exitLabel')}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={(element) => {
          tabRefs.current['0'] = element
        }}
        className={`tab ${currentTab === '0' ? 'active' : ''}`}
      >
        {deviceBanner.visible ? (
          <div id="deviceBanner" className={deviceBanner.type}>
            <span>{deviceBanner.message}</span>
            <button type="button" id="deviceBannerX" onClick={() => setDeviceBanner((prev) => ({ ...prev, visible: false }))}>
              ✕
            </button>
          </div>
        ) : null}

        <div className="start-hero">
          <div className="hero-eyebrow">FieldComm Daily Report</div>
          <div className="hero-title">Cypress Pointe<br />Phase II</div>
          <div className="hero-sub">{t('heroSub')}</div>
          <button type="button" className="start-cta" onClick={() => handleTabChange('1')}>
            {t('s0cta')}
          </button>
        </div>

        <div className="feat-grid">
          {FEATURE_CARDS.map((card) => (
            <div key={card.title} className="feat-card">
              <div className="feat-icon">{card.icon}</div>
              <div className="feat-title">{t(card.title)}</div>
              <div className="feat-desc">{t(card.desc)}</div>
            </div>
          ))}
        </div>

        <div className="pilot-note-box" dangerouslySetInnerHTML={html('pilotNote')} />
      </div>

      <div
        ref={(element) => {
          tabRefs.current['1'] = element
        }}
        className={`tab ${currentTab === '1' ? 'active' : ''}`}
      >
        <div className="card">
          <div className="placeholder-note">{t('pnote')}</div>
          <div className="field-row">
            <label htmlFor="fDate">{t('lDate')}</label>
            <input id="fDate" type="date" value={form.date} onChange={(event) => handleFieldChange('date', event.target.value)} />
          </div>
          <div className="field-row">
            <label htmlFor="fAS">{t('lAS')}</label>
            <select id="fAS" value={form.asName} onChange={(event) => handleFieldChange('asName', event.target.value)}>
              <option value="">— Select AS —</option>
              {AS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="fZone">{t('lZone')}</label>
            <select id="fZone" value={form.zone} onChange={(event) => handleFieldChange('zone', event.target.value)}>
              <option value="">— Select Zone —</option>
              {ZONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t('ctCrew')}</div>
          <div className="field-row">
            <label>{t('lCrew')}</label>
            <div className="crew-row">
              <button type="button" className="crew-btn" onClick={() => adjustCrew(-1)}>
                −
              </button>
              <div className="crew-val">{crewCount}</div>
              <button type="button" className="crew-btn" onClick={() => adjustCrew(1)}>
                +
              </button>
            </div>
          </div>
          <div className="field-row">
            <label>{t('lTrades')}</label>
            <div className="check-grid">
              {TRADES.map((trade) => {
                const selected = Boolean(selectedTrades[trade.id])
                return (
                  <button
                    key={trade.id}
                    type="button"
                    className={`check-item ${selected ? 'selected' : ''}`}
                    onClick={() => toggleTrade(trade.id)}
                  >
                    <div className="check-box">{selected ? '✓' : ''}</div>
                    <span className="check-lbl">{currentLang === 'es' ? trade.es : trade.en}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t('ctWork')}</div>
          {renderVoiceField({ id: 'fDone', field: 'done', label: 'lDone', placeholder: 'donePh', rows: 3 })}
          {renderVoiceField({ id: 'fProg', field: 'prog', label: 'lProg', placeholder: 'progPh', rows: 3 })}
        </div>

        <div className="card">
          <div className="card-title">{t('ctIssues')}</div>
          <div className="field-row">
            <div className="toggle-row">
              <span className="toggle-label">{t('lDelay')}</span>
              <button type="button" className={`toggle-switch ${showDelay ? 'on' : ''}`} onClick={() => setShowDelay((prev) => !prev)} />
            </div>
            <div className={`toggle-sub ${showDelay ? 'show' : ''}`}>
              <div className="field-row">
                <label htmlFor="fDelayType">{t('lDelayType')}</label>
                <select id="fDelayType" value={form.delayType} onChange={(event) => handleFieldChange('delayType', event.target.value)}>
                  <option value="">— Select —</option>
                  {DELAY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {renderVoiceField({ id: 'fDelayDesc', field: 'delayDesc', label: 'lDelayDesc', placeholder: 'delayPh', rows: 2 })}
            </div>
          </div>
          <div className="field-row">
            <div className="toggle-row">
              <span className="toggle-label">{t('lSafety')}</span>
              <button type="button" className={`toggle-switch ${showSafety ? 'on' : ''}`} onClick={() => setShowSafety((prev) => !prev)} />
            </div>
            <div className={`toggle-sub ${showSafety ? 'show' : ''}`}>
              <div className="field-row">
                <label htmlFor="fSafetyType">{t('lSafetyType')}</label>
                <select id="fSafetyType" value={form.safetyType} onChange={(event) => handleFieldChange('safetyType', event.target.value)}>
                  <option value="">— Select —</option>
                  {SAFETY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {renderVoiceField({ id: 'fSafetyDesc', field: 'safetyDesc', label: 'lSafetyDesc', placeholder: 'safetyPh', rows: 2 })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t('ctInsp')}</div>
          <div className="field-row">
            <label htmlFor="fInsp">{t('lInsp')}</label>
            <select id="fInsp" value={form.insp} onChange={(event) => handleFieldChange('insp', event.target.value)}>
              <option value="">None</option>
              {INSPECTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="fInspResult">{t('lInspResult')}</label>
            <select id="fInspResult" value={form.inspResult} onChange={(event) => handleFieldChange('inspResult', event.target.value)}>
              <option value="">— Select —</option>
              {INSPECTION_RESULT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t('ctPhoto')}</div>
          <div>
            <button type="button" className="photo-btn" onClick={() => photoInputRef.current?.click()}>
              📷 <span>{t('lPhoto')}</span>
            </button>
            <span className="photo-count">{photoFiles.length ? t('photoCount')(photoFiles.length) : ''}</span>
          </div>
          <div className="photo-thumbs">
            {photoFiles.map((photo) => (
              <img key={`${photo.file.name}-${photo.file.size}-${photo.preview}`} className="photo-thumb" src={photo.preview} alt={photo.file.name} />
            ))}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="photo-input" />
        </div>

        <div className="card">
          <div className="card-title">{t('ctNotes')}</div>
          {renderVoiceField({ id: 'fNotes', field: 'notes', label: 'lNotes', placeholder: 'notesPh', rows: 3 })}
        </div>

        {submitDone && badgeCount > 0 ? (
          <div id="amberBanner" onClick={() => handleTabChange('1')}>
            {t('amberBanner')}
          </div>
        ) : null}
        <button type="button" className="submit-btn" onClick={submitReport}>
          {t('submitBtn')}
        </button>
        <div className="submit-status">{submitStatus}</div>
      </div>

      <div
        ref={(element) => {
          tabRefs.current['2'] = element
        }}
        className={`tab ${currentTab === '2' ? 'active' : ''}`}
      >
        {submitDone ? (
          <>
            <div className="pro-received-bar">✓ <span>{proReceivedMessage || 'Report received'}</span></div>
            <div className="procore-header">🏗️ <span>{t('ph')}</span></div>
            <div className="procore-body">
              {procoreRows.map((row) => (
                <div key={row.label} className="pro-row">
                  <div className="pro-lbl">{row.label}</div>
                  <div className={`pro-val ${row.value ? 'filled' : 'empty'}`}>{row.value || '— not entered —'}</div>
                </div>
              ))}
            </div>
            <div className="card pro-note-card">
              <div className="pro-note-text" dangerouslySetInnerHTML={html('proNote')} />
              <div className="pro-note-footer">🇺🇸 Procore log is always submitted in English regardless of field language used.</div>
            </div>
          </>
        ) : (
          <div className="pro-empty-state">
            <div className="pro-empty-icon">📋</div>
            <div className="pro-empty-title">{t('proEmptyTitle')}</div>
            <div className="pro-empty-desc">{t('proEmptyDesc')}</div>
            <button type="button" className="pro-empty-btn" onClick={() => handleTabChange('1')}>
              {t('proEmptyBtn')}
            </button>
          </div>
        )}
      </div>

      <div
        ref={(element) => {
          tabRefs.current['3'] = element
        }}
        className={`tab ${currentTab === '3' ? 'active' : ''}`}
      >
        <div className="card">
          <div className="card-title">{t('ctGuide')}</div>
          {GUIDE_STEPS.map((step, index) => (
            <div key={step.heading} className="step-item">
              <div className="step-num">{index + 1}</div>
              <div className="step-body">
                <h4>{t(step.heading)}</h4>
                <p>{t(step.body)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="tip-box" dangerouslySetInnerHTML={html('voiceTip')} />
        <div className="tip-box" dangerouslySetInnerHTML={html('browserTip')} />
      </div>

      <nav id="nav">
        {[
          { id: '0', icon: '🏠', label: 'nb0' },
          { id: '1', icon: '📋', label: 'nb1' },
          { id: '2', icon: '🏗', label: 'nb2' },
          { id: '3', icon: '❓', label: 'nb3' },
        ].map((item) => (
          <button key={item.id} type="button" className={`nb ${currentTab === item.id ? 'active' : ''}`} onClick={() => handleTabChange(item.id)}>
            <span className="nb-ic">{item.icon}</span>
            <span className="nb-tx">{t(item.label)}</span>
            {item.id === '1' ? <span className={`nb-badge ${submitDone && badgeCount > 0 ? 'show' : ''}`}>{badgeCount}</span> : null}
          </button>
        ))}
      </nav>

      <div id="toast" className={toast ? 'show' : ''}>
        {toast}
      </div>

      <div id="exitModal" className={showExitModal ? 'show' : ''}>
        <div className="modal-box">
          <h3>{t('exitTitle')}</h3>
          <p>{t('exitMsg')}</p>
          <div className="modal-btns">
            <button type="button" className="modal-cancel" onClick={() => setShowExitModal(false)}>
              {t('cancelLabel')}
            </button>
            <button type="button" className="modal-exit-btn" onClick={() => navigate('/')}>
              {t('exitConfirmLabel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyReport
