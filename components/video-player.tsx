'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Sparkles } from 'lucide-react'

interface VideoPlayerProps {
  videoProvider?: string | null
  videoId?: string | null
  title?: string
  thumbnailUrl?: string | null
  durationSeconds?: number
  initialPositionSeconds?: number
  onProgress?: (watchedSeconds: number, totalSeconds: number) => void
  onEnded?: () => void
  className?: string
}

export default function VideoPlayer({
  videoProvider = 'mock',
  videoId,
  title,
  thumbnailUrl,
  durationSeconds = 2400,
  initialPositionSeconds = 0,
  onProgress,
  onEnded,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialPositionSeconds)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sincronizar tiempo inicial al cambiar de lección
  useEffect(() => {
    setCurrentTime(initialPositionSeconds || 0)
    setIsPlaying(false)
  }, [videoId, initialPositionSeconds])

  // Timer simulado para modo interactivo / mock
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1
          if (next >= durationSeconds) {
            setIsPlaying(false)
            onEnded?.()
            return durationSeconds
          }
          if (next % 5 === 0) {
            onProgress?.(next, durationSeconds)
          }
          return next
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, durationSeconds, onProgress, onEnded])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setCurrentTime(val)
    onProgress?.(val, durationSeconds)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error al activar pantalla completa:', err)
      })
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // 1. Proveedor: YouTube
  if (videoProvider === 'youtube' && videoId && videoId.length > 5) {
    return (
      <div className={`relative bg-black aspect-video w-full overflow-hidden rounded-2xl ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
          title={title || 'Clase'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // 2. Proveedor: Vimeo
  if (videoProvider === 'vimeo' && videoId) {
    return (
      <div className={`relative bg-black aspect-video w-full overflow-hidden rounded-2xl ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0`}
          title={title || 'Clase'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // 3. Proveedor: Cloudflare Stream
  if ((videoProvider === 'cloudflare' || videoProvider === 'cloudflare_stream') && videoId) {
    return (
      <div className={`relative bg-black aspect-video w-full overflow-hidden rounded-2xl ${className}`}>
        <iframe
          src={`https://iframe.videodelivery.net/${videoId}?poster=${encodeURIComponent(
            thumbnailUrl || ''
          )}&defaultTextTrack=es`}
          title={title || 'Clase'}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // 4. Reproductor nativo estilizado de MaestroTech (para mock, custom o demostración)
  const progressPercent = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`relative bg-neutral-950 aspect-video w-full overflow-hidden select-none group rounded-2xl border border-border/40 shadow-2xl ${className}`}
    >
      {/* Background visual con aura MaestroTech */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-background to-violet-950/60 flex items-center justify-center">
        <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        {/* Botón central Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className="relative z-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all shadow-xl group/btn"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white fill-white" />
          ) : (
            <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
          )}
        </motion.button>
      </div>

      {/* Info superior */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-white/90 tracking-wide truncate max-w-md">
            {title || 'Clase de Maestro'}
          </span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
          {videoProvider === 'cloudflare' ? 'Cloudflare Stream' : 'Reproductor Maestro'}
        </span>
      </div>

      {/* Controles inferiores */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Barra de progreso */}
        <div className="relative mb-3 flex items-center group/bar">
          <input
            type="range"
            min={0}
            max={durationSeconds}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => setCurrentTime(0)}
              className="p-1 hover:text-white transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="font-mono text-white/70">
              {formatTime(currentTime)} / {formatTime(durationSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 font-medium">
              {progressPercent >= 90 ? 'Completado ✓' : `${Math.round(progressPercent)}%`}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:text-white transition-colors"
              title="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
