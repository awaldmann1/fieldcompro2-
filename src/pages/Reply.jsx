import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Reply.css'

const ITEMS = [
  { id: 'PL-002', pri: 'P1', desc: 'Touch-up missing on all Unit 204 door frames', loc: 'Bldg A — 204' },
  { id: 'PL-016', pri: 'P2', desc: 'Ceiling cut-in ragged edge — club room', loc: 'Bldg A — Club' },
  { id: 'PL-006', pri: 'P2', desc: 'Roller texture variation — bedroom 2', loc: 'Bldg B — 215' },
]

const TRADES = ['Drywall', 'Paint', 'Flooring', 'Plumbing', 'Electrical', 'Trim', 'Insulation', 'Other']

const TRADE_TRANSLATIONS = {
  Drywall: 'Tablaroca',
  Paint: 'Pintura',
  Flooring: 'Pisos',
  Plumbing: 'Plomería',
  Electrical: 'Eléctrico',
  Trim: 'Molduras',
  Insulation: 'Aislamiento',
  Other: 'Otro',
}

const TEXT = {
  yourItems: ['Your items', 'Tus ítems'],
  intro: [
    'Tap your answer on each item. Only talk if you need to add something.',
    'Toca tu respuesta en cada ítem. Solo habla si necesitas agregar algo.',
  ],
  done: ['Done', 'Listo'],
  work: ['Working on it', 'En eso'],
  notmine: ['Not mine', 'No es mío'],
  whenLabel: ['When will it be done?', '¿Cuándo estará listo?'],
  today: ['Today', 'Hoy'],
  tomorrow: ['Tomorrow', 'Mañana'],
  thisweek: ['This week', 'Esta semana'],
  nextweek: ['Next week', 'Próxima semana'],
  pickdate: ['Pick a date', 'Elegir fecha'],
  whoLabel: ['Whose work is it?', '¿De quién es?'],
  addnote: ['＋ Add a note / problem (talk)', '＋ Agregar nota / problema (hablar)'],
  hidenote: ['－ Hide note', '－ Ocultar nota'],
  notehint: ['Tap the mic and talk. We clean it up for you.', 'Toca el micrófono y habla. Lo arreglamos por ti.'],
  noteph: ['Or type here…', 'O escribe aquí…'],
  send: ['Send replies', 'Enviar respuestas'],
  whatsent: ['This is what gets sent', 'Esto es lo que se envía'],
  nothingtype: ['Goes to the FieldComm number — nothing to type.', 'Va al número de FieldComm — nada que escribir.'],
  back: ['Back', 'Volver'],
  sendit: ['Send it', 'Enviarlo'],
  tapfirst: ['Answer at least one item first', 'Responde al menos un ítem'],
  sent: ['Sent — thanks. You can close this.', 'Enviado — gracias. Puedes cerrar.'],
  micoff: ['Voice not available — type instead', 'Voz no disponible — escribe'],
  micstop: ['Voice stopped', 'Voz detenida'],
  exit: ['Exit', 'Salir'],
  exitPrompt: ['Exit?', '¿Salir?'],
  closed: ['Closed.', 'Cerrado.'],
}

const ETA_KEYS = ['today', 'tomorrow', 'thisweek', 'nextweek', 'pickdate']

const createInitialReplies = () =>
  Object.fromEntries(
    ITEMS.map((item) => [
      item.id,
      { status: null, eta: null, etaDate: '', reassign: null, note: '', noteOpen: false },
    ]),
  )

const etaText = (reply) => {
  const map = {
    today: 'TODAY',
    tomorrow: 'TOMORROW',
    thisweek: 'THIS_WEEK',
    nextweek: 'NEXT_WEEK',
    pickdate: reply.etaDate || 'DATE_TBD',
  }

  return map[reply.eta] || ''
}

const buildPayload = (replies) => {
  const lines = []
  const notes = []

  ITEMS.forEach((item) => {
    const reply = replies[item.id]

    if (!reply.status) {
      return
    }

    if (reply.status === 'done') {
      lines.push(`${item.id} DONE`)
    } else if (reply.status === 'working') {
      const eta = etaText(reply)
      lines.push(`${item.id} WORKING${eta ? ` ETA=${eta}` : ''}`)
    } else if (reply.status === 'notmine') {
      lines.push(`${item.id} NOT_MINE${reply.reassign ? ` → ${reply.reassign.toUpperCase()}` : ''}`)
    }

    if (reply.note.trim()) {
      notes.push(`NOTE ${item.id}: "${reply.note.trim()}"`)
    }
  })

  return {
    body: lines.join('\n') + (notes.length ? `\n\n${notes.join('\n')}` : ''),
    count: lines.length,
  }
}

function Reply() {
  const navigate = useNavigate()
  const [spanish, setSpanish] = useState(false)
  const [replies, setReplies] = useState(createInitialReplies)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPayload, setModalPayload] = useState('')
  const [submitSub, setSubmitSub] = useState('')
  const [closed, setClosed] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState(null)
  const recognitionRef = useRef(null)
  const voiceTimerRef = useRef(null)

  const label = useCallback((key) => TEXT[key][spanish ? 1 : 0], [spanish])

  const showToast = useCallback((message, type = '') => {
    setToast({ show: true, message, type })
  }, [])

  const stopVoice = useCallback(() => {
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current)
      voiceTimerRef.current = null
    }

    recognitionRef.current = null
    setVoiceTarget(null)
  }, [])

  useEffect(() => {
    if (!toast.show) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }))
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(
    () => () => {
      if (voiceTimerRef.current) {
        clearTimeout(voiceTimerRef.current)
      }

      try {
        recognitionRef.current?.stop()
      } catch {
        // no-op
      }
    },
    [],
  )

  const updateReply = useCallback((id, updater) => {
    setReplies((current) => ({
      ...current,
      [id]: updater(current[id]),
    }))
  }, [])

  const setStatus = useCallback(
    (id, status) => {
      updateReply(id, (reply) => {
        const nextStatus = reply.status === status ? null : status

        return {
          ...reply,
          status: nextStatus,
          eta: nextStatus === 'working' ? reply.eta : null,
          etaDate: nextStatus === 'working' ? reply.etaDate : '',
          reassign: nextStatus === 'notmine' ? reply.reassign : null,
        }
      })
    },
    [updateReply],
  )

  const setEta = useCallback(
    (id, eta) => {
      updateReply(id, (reply) => {
        const nextEta = reply.eta === eta ? null : eta

        return {
          ...reply,
          eta: nextEta,
          etaDate: nextEta === 'pickdate' ? reply.etaDate : '',
        }
      })
    },
    [updateReply],
  )

  const setEtaDate = useCallback(
    (id, etaDate) => {
      updateReply(id, (reply) => ({ ...reply, etaDate }))
    },
    [updateReply],
  )

  const setReassign = useCallback(
    (id, reassign) => {
      updateReply(id, (reply) => ({
        ...reply,
        reassign: reply.reassign === reassign ? null : reassign,
      }))
    },
    [updateReply],
  )

  const setNote = useCallback(
    (id, note) => {
      updateReply(id, (reply) => ({ ...reply, note }))
    },
    [updateReply],
  )

  const toggleNote = useCallback(
    (id) => {
      updateReply(id, (reply) => ({ ...reply, noteOpen: !reply.noteOpen }))
    },
    [updateReply],
  )

  const startVoice = useCallback(
    (id) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        showToast(label('micoff'), 'warn')
        return
      }

      if (voiceTarget) {
        try {
          recognitionRef.current?.stop()
        } catch {
          // no-op
        }
        return
      }

      try {
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = spanish ? 'es-US' : 'en-US'
        recognitionRef.current = recognition
        setVoiceTarget(id)
        updateReply(id, (reply) => ({ ...reply, noteOpen: true }))

        recognition.onresult = (event) => {
          let transcript = ''

          for (let index = 0; index < event.results.length; index += 1) {
            transcript += event.results[index][0].transcript
          }

          setReplies((current) => ({
            ...current,
            [id]: {
              ...current[id],
              note: transcript,
              noteOpen: true,
            },
          }))
        }

        recognition.onerror = () => {
          showToast(label('micstop'), 'warn')
          stopVoice()
        }

        recognition.onend = () => {
          stopVoice()
        }

        recognition.start()
        voiceTimerRef.current = window.setTimeout(() => {
          try {
            recognition.stop()
          } catch {
            // no-op
          }
        }, 90000)
      } catch {
        showToast(label('micoff'), 'warn')
        stopVoice()
      }
    },
    [label, showToast, spanish, stopVoice, updateReply, voiceTarget],
  )

  const reviewSend = useCallback(() => {
    const payload = buildPayload(replies)

    if (payload.count === 0) {
      showToast(label('tapfirst'), 'warn')
      return
    }

    setModalPayload(payload.body)
    setModalOpen(true)
  }, [label, replies, showToast])

  const confirmSend = useCallback(() => {
    setModalOpen(false)

    if (Math.random() > 0.04) {
      showToast(`✅ ${label('sent')}`, 'success')
      setSubmitSub(
        `${spanish ? 'Enviado ' : 'Sent '}${new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      )
      return
    }

    showToast(spanish ? 'Falló — copiado, pégalo en un texto' : 'Send failed — copied, paste into a text', 'error')
  }, [label, showToast, spanish])

  const exitDemo = useCallback(() => {
    if (window.confirm(label('exitPrompt'))) {
      try {
        recognitionRef.current?.stop()
      } catch {
        // no-op
      }
      stopVoice()
      setClosed(true)
    }
  }, [label, stopVoice])

  const foremanLine = useMemo(() => `${spanish ? 'Pintura' : 'Paint'} — José`, [spanish])

  if (closed) {
    return <div className="reply-closed">{label('closed')}</div>
  }

  return (
    <div className="reply-page">
      <header className="reply-header">
        <div className="reply-header-left">
          <button type="button" className="reply-back-btn" onClick={() => navigate('/')}>
            ←
          </button>
          <span className="reply-logo">FieldComm</span>
          <span className="reply-title">{label('yourItems')}</span>
          <span className="reply-demo-badge">DEMO</span>
        </div>

        <div className="reply-header-right">
          <button
            type="button"
            className={`reply-lang-btn ${spanish ? 'on' : ''}`}
            onClick={() => setSpanish((current) => !current)}
          >
            {spanish ? 'EN' : 'ES'}
          </button>
          <button type="button" className="reply-exit-btn" onClick={exitDemo}>
            {label('exit')}
          </button>
        </div>
      </header>

      <div className="reply-eng">
        <strong>Keystone Build Partners</strong> · Cypress Pointe Phase II · <span>{foremanLine}</span>
      </div>

      <div className="reply-intro">{label('intro')}</div>

      <main className="reply-wrap">
        {ITEMS.map((item) => {
          const reply = replies[item.id]
          const priorityBadgeClass = item.pri === 'P1' ? 'pb1' : item.pri === 'P2' ? 'pb2' : 'pb3'

          return (
            <section key={item.id} className={`reply-card ${item.pri.toLowerCase()}`}>
              <div className="reply-card-top">
                <div className="reply-card-id-row">
                  <span className="reply-card-id">{item.id}</span>
                  <span className={`reply-priority-badge ${priorityBadgeClass}`}>{item.pri}</span>
                </div>

                <div className="reply-card-desc">{item.desc}</div>
                <div className="reply-card-loc">📍 {item.loc}</div>
              </div>

              <div className="reply-card-actions">
                <div className="reply-status-grid">
                  <button
                    type="button"
                    className={`reply-status-btn ${reply.status === 'done' ? 'sel-done' : ''}`}
                    onClick={() => setStatus(item.id, 'done')}
                  >
                    <span className="reply-status-icon">✅</span>
                    {label('done')}
                  </button>
                  <button
                    type="button"
                    className={`reply-status-btn ${reply.status === 'working' ? 'sel-work' : ''}`}
                    onClick={() => setStatus(item.id, 'working')}
                  >
                    <span className="reply-status-icon">🔧</span>
                    {label('work')}
                  </button>
                  <button
                    type="button"
                    className={`reply-status-btn ${reply.status === 'notmine' ? 'sel-not' : ''}`}
                    onClick={() => setStatus(item.id, 'notmine')}
                  >
                    <span className="reply-status-icon">🚫</span>
                    {label('notmine')}
                  </button>
                </div>

                <div className={`reply-reveal ${reply.status === 'working' ? 'show' : ''}`}>
                  <div className="reply-row-label">{label('whenLabel')}</div>
                  <div className="reply-chip-row">
                    {ETA_KEYS.map((etaKey) => (
                      <button
                        key={etaKey}
                        type="button"
                        className={`reply-chip ${reply.eta === etaKey ? 'sel' : ''}`}
                        onClick={() => setEta(item.id, etaKey)}
                      >
                        {label(etaKey)}
                      </button>
                    ))}
                  </div>

                  {reply.eta === 'pickdate' ? (
                    <input
                      type="date"
                      className="reply-date-input"
                      value={reply.etaDate}
                      onChange={(event) => setEtaDate(item.id, event.target.value)}
                    />
                  ) : null}
                </div>

                <div className={`reply-reveal ${reply.status === 'notmine' ? 'show' : ''}`}>
                  <div className="reply-row-label">{label('whoLabel')}</div>
                  <div className="reply-chip-row">
                    {TRADES.map((trade) => (
                      <button
                        key={trade}
                        type="button"
                        className={`reply-chip reply-chip-trade ${reply.reassign === trade ? 'sel' : ''}`}
                        onClick={() => setReassign(item.id, trade)}
                      >
                        {spanish ? TRADE_TRANSLATIONS[trade] || trade : trade}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" className="reply-note-toggle" onClick={() => toggleNote(item.id)}>
                  {reply.noteOpen ? label('hidenote') : label('addnote')}
                </button>

                <div className={`reply-note-box ${reply.noteOpen ? 'show' : ''}`}>
                  <div className="reply-note-inner">
                    <button
                      type="button"
                      className={`reply-mic-btn ${voiceTarget === item.id ? 'live' : ''}`}
                      onClick={() => startVoice(item.id)}
                    >
                      {voiceTarget === item.id ? '⏹' : '🎤'}
                    </button>
                    <textarea
                      className="reply-note-textarea"
                      rows="2"
                      placeholder={label('noteph')}
                      value={reply.note}
                      onChange={(event) => setNote(item.id, event.target.value)}
                    />
                  </div>
                  <div className="reply-note-hint">{label('notehint')}</div>
                </div>
              </div>
            </section>
          )
        })}
      </main>

      <div className="reply-submit-bar">
        <button type="button" className="reply-submit-btn" onClick={reviewSend}>
          {label('send')}
        </button>
        <div className="reply-submit-sub">{submitSub}</div>
      </div>

      <div className={`reply-toast ${toast.show ? 'show' : ''}${toast.type ? ` ${toast.type}` : ''}`}>{toast.message}</div>

      <div className={`reply-overlay ${modalOpen ? 'show' : ''}`}>
        <div className="reply-modal">
          <h3>{label('whatsent')}</h3>
          <div className="reply-modal-sub">{label('nothingtype')}</div>
          <div className="reply-payload">{modalPayload}</div>
          <div className="reply-modal-foot">
            <button type="button" className="reply-modal-back" onClick={() => setModalOpen(false)}>
              {label('back')}
            </button>
            <button type="button" className="reply-modal-send" onClick={confirmSend}>
              {label('sendit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reply
