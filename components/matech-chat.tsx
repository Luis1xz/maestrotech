'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Send,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Clock,
  RotateCcw,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { MaTechSourceCitation } from '@/types/matech'
import { useAuth } from '@/hooks/use-auth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: MaTechSourceCitation[]
  createdAt: string
  error?: boolean
}

interface MaTechChatProps {
  courseId: string
  courseTitle: string
  studentName?: string
  lessonContext?: {
    id: string
    title: string
    moduleTitle?: string
  }
  compact?: boolean
  className?: string
}

const QUICK_PROMPTS = [
  { label: 'Explicar concepto clave', prompt: 'Explícame el concepto principal de este tema paso a paso con una analogía didáctica.' },
  { label: 'Caso tipo prueba CNSC', prompt: 'Plantéame una pregunta de juicio situacional con 4 opciones (A, B, C, D) basada en este tema y la normativa colombiana.' },
  { label: 'Resumen orientativo', prompt: 'Hazme un resumen pedagógico de los puntos indispensables que debo dominar para la evaluación docente.' },
  { label: 'Aplicación en aula', prompt: '¿Cómo aplico este contenido en el aula de clases según los principios del DUA y la evaluación formativa?' },
]

export default function MaTechChat({
  courseId,
  courseTitle,
  studentName,
  lessonContext,
  compact = false,
  className = '',
}: MaTechChatProps) {
  const { user, profile } = useAuth()
  const effectiveStudentName = studentName || profile?.first_name || profile?.full_name || 'Profe'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola, **${effectiveStudentName}**! Soy **MaTech**, tu Mentor Pedagógico Inteligente en **Legado Docente**.\n\nEstoy conectado a las guías oficiales, normativas (Ley 115, Decreto 1278, Decreto 1290) y documentos publicados de **${courseTitle}**.\n\n¿Qué concepto pedagógico, normativa o ejercicio deseas que analicemos paso a paso hoy?`,
      createdAt: new Date().toISOString(),
    },
  ])

  const [inputQuery, setInputQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [remainingDaily, setRemainingDaily] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSourcesId, setExpandedSourcesId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownRemaining])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleSend = async (customPrompt?: string) => {
    const queryToSend = (customPrompt || inputQuery).trim()
    if (!queryToSend || isGenerating || cooldownRemaining > 0) return

    setErrorMessage(null)
    const userMessageId = `msg-${Date.now()}`
    const newUserMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: queryToSend,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMsg])
    setInputQuery('')
    setIsGenerating(true)

    // Preparamos historial de chat breve
    const chatHistory = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-6)
      .map((m) => ({
        role: m.role,
        text: m.content,
      }))

    try {
      const response = await fetch('/api/matech/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseTitle,
          question: queryToSend,
          studentName: effectiveStudentName,
          chatHistory,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo obtener respuesta de MaTech')
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.replyText,
        sources: data.sources || [],
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      if (typeof data.remainingDaily === 'number') {
        setRemainingDaily(data.remainingDaily)
      }

      // Activar cooldown de 10 segundos
      setCooldownRemaining(10)
    } catch (err: any) {
      console.error('[MaTech Chat] Error:', err)
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Lo siento, ocurrió un inconveniente temporal: ${err.message || 'No pude procesar tu consulta'}. Por favor intenta de nuevo en unos instantes.`,
        createdAt: new Date().toISOString(),
        error: true,
      }
      setMessages((prev) => [...prev, errorMsg])
      setErrorMessage(err.message)
    } finally {
      setIsGenerating(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${
        compact ? 'h-[500px]' : 'h-[650px]'
      } ${className}`}
    >
      {/* Cabecera MaTech con Aura Iridiscente y Brillo */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#142D49] via-[#1E3A8A] to-[#4338CA] text-white flex items-center justify-between shadow-md border-b border-white/10 shrink-0 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#4F46E5] to-[#E78B24] flex items-center justify-center text-white shadow-lg shadow-purple-600/30 glow-ring-purple">
              <Brain className="w-5 h-5 text-white animate-sparkle" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#142D49] shadow-xs" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                MaTech
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED]/40 to-[#E78B24]/40 text-[#F5B563] border border-[#F5B563]/40 flex items-center gap-1 animate-sparkle">
                  <Sparkles className="w-2.5 h-2.5 text-[#F5B563]" />
                  Tutor RAG
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-[240px] sm:max-w-md">
              Mentor Pedagógico • {courseTitle}
            </p>
          </div>
        </div>

        {/* Indicador de Cuota Diaria */}
        <div className="hidden sm:flex flex-col items-end text-right relative z-10">
          {remainingDaily !== null ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 shadow-2xs">
              {remainingDaily} consultas restantes hoy
            </span>
          ) : (
            <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Conectado a documentos del curso
            </span>
          )}
          <span className="text-[9px] text-[#F5B563] font-mono mt-0.5">
            Legado Docente
          </span>
        </div>
      </div>

      {/* Alerta de Error si ocurre */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cuerpo de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#176FC1] text-white rounded-br-xs'
                    : msg.error
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {/* Cabecera del mensaje del tutor */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] text-slate-400">
                    <span className="font-bold text-[#142D49] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#E78B24]" />
                      MaTech
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Copiar respuesta"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Texto del mensaje */}
                <div className="whitespace-pre-wrap font-sans text-[12px] sm:text-[13px] leading-relaxed">
                  {msg.content}
                </div>

                {/* Citas y Fuentes RAG Utilizadas */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() =>
                        setExpandedSourcesId(
                          expandedSourcesId === msg.id ? null : msg.id
                        )
                      }
                      className="w-full flex items-center justify-between text-[11px] font-bold text-[#176FC1] hover:text-[#135ca2]"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Fuentes consultadas en el curso ({msg.sources.length})
                      </span>
                      {expandedSourcesId === msg.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSourcesId === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1.5 overflow-hidden"
                        >
                          {msg.sources.map((src, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-[10px] text-slate-700"
                            >
                              <div className="flex items-center justify-between font-semibold text-[#142D49]">
                                <span className="truncate max-w-[200px]">
                                  📄 {src.document_title}
                                </span>
                                {src.page_number && (
                                  <span className="text-slate-500 font-mono">
                                    pág. {src.page_number}
                                  </span>
                                )}
                              </div>
                              {src.excerpt && (
                                <p className="mt-1 text-slate-500 italic line-clamp-2">
                                  "{src.excerpt}"
                                </p>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Indicador de Generando / Pensando */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 max-w-[280px]"
          >
            <div className="w-6 h-6 rounded-lg bg-[#E78B24]/20 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-[#E78B24] animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-[#142D49] text-[11px]">MaTech está consultando...</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176FC1] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#176FC1] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#176FC1] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] text-slate-400 ml-1">Buscando en documentos</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pastillas de Acciones Rápidas */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#E78B24]" />
          Sugerencias:
        </span>
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.prompt)}
            disabled={isGenerating || cooldownRemaining > 0}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#176FC1] text-slate-700 font-medium transition-colors disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input y Botón de Envío */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                cooldownRemaining > 0
                  ? `Espera ${cooldownRemaining}s antes de la siguiente pregunta...`
                  : 'Pregunta a MaTech sobre un concepto, normativa o caso de este curso...'
              }
              disabled={isGenerating || cooldownRemaining > 0}
              maxLength={2000}
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176FC1] disabled:bg-slate-50 disabled:text-slate-400 transition-all"
            />
            {inputQuery.length > 1500 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-600 font-mono">
                {2000 - inputQuery.length}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={
              !inputQuery.trim() || isGenerating || cooldownRemaining > 0
            }
            className="px-5 py-2.5 rounded-xl btn-purple-glow text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer group"
          >
            {cooldownRemaining > 0 ? (
              <span className="font-mono text-xs">{cooldownRemaining}s</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E6C565] animate-sparkle" />
                <span className="hidden sm:inline">Preguntar a MaTech</span>
                <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
