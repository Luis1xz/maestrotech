'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Sparkles, Loader2 } from 'lucide-react'
import { getMaterialSignedUrl } from '@/lib/supabase/storage'

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

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function extractVimeoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

export default function VideoPlayer({
  videoProvider = 'custom',
  videoId,
  title,
  thumbnailUrl,
  durationSeconds = 1200,
  initialPositionSeconds = 0,
  onProgress,
  onEnded,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialPositionSeconds)
  const [realDuration, setRealDuration] = useState(durationSeconds || 1200)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastReportedRef = useRef<number>(0)

  // Resolver URL firmada si el video está en Supabase Storage o es URL directa
  useEffect(() => {
    let isMounted = true
    setCurrentTime(initialPositionSeconds || 0)
    setRealDuration(durationSeconds || 1200)
    setIsPlaying(false)

    async function resolveSource() {
      if (!videoId) {
        setResolvedVideoUrl(null)
        return
      }

      const raw = videoId.trim()
      const isDirectOrStorage =
        videoProvider === 'supabase' ||
        videoProvider === 'custom' ||
        videoProvider === 'mp4' ||
        raw.startsWith('http://') ||
        raw.startsWith('https://') ||
        raw.startsWith('/') ||
        raw.startsWith('data:') ||
        raw.startsWith('videos/') ||
        /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(raw)

      // Si es URL de YouTube aunque el provider diga custom
      if (raw.includes('youtube.com') || raw.includes('youtu.be')) {
        setResolvedVideoUrl(null)
        return
      }

      if (!isDirectOrStorage) {
        setResolvedVideoUrl(null)
        return
      }

      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/') || raw.startsWith('data:')) {
        if (isMounted) setResolvedVideoUrl(raw)
        return
      }

      setLoadingUrl(true)
      const { url } = await getMaterialSignedUrl(raw, 7200)
      if (isMounted) {
        setResolvedVideoUrl(url || null)
        setLoadingUrl(false)
      }
    }

    resolveSource()
    return () => {
      isMounted = false
    }
  }, [videoId, videoProvider, initialPositionSeconds, durationSeconds])

  // Timer simulado solo cuando NO hay fuente de video real (modo mock)
  useEffect(() => {
    if (resolvedVideoUrl) return
    let interval: NodeJS.Timeout | null = null
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1
          if (next >= realDuration) {
            setIsPlaying(false)
            onEnded?.()
            return realDuration
          }
          if (next % 5 === 0) {
            onProgress?.(next, realDuration)
          }
          return next
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, realDuration, onProgress, onEnded, resolvedVideoUrl])

  const formatTime = (secs: number) => {
    const valid = Math.max(0, Math.floor(secs || 0))
    const m = Math.floor(valid / 60)
    const s = Math.floor(valid % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const togglePlay = () => {
    if (videoRef.current && resolvedVideoUrl) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setCurrentTime(val)
    if (videoRef.current && resolvedVideoUrl) {
      videoRef.current.currentTime = val
    }
    onProgress?.(val, realDuration)
  }

  const handleRestart = () => {
    setCurrentTime(0)
    if (videoRef.current && resolvedVideoUrl) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    if (videoRef.current) {
      videoRef.current.muted = next
    }
  }

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2]
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // 1. Proveedor: YouTube (ID o URL completa)
  const ytId = videoId ? extractYouTubeId(videoId) : null
  if ((videoProvider === 'youtube' || (videoId && (videoId.includes('youtube.com') || videoId.includes('youtu.be')))) && ytId) {
    return (
      <div className={`relative bg-black aspect-video w-full overflow-hidden rounded-2xl border border-border/40 shadow-2xl ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
          title={title || 'Clase'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // 2. Proveedor: Vimeo
  const vimeoId = videoId ? extractVimeoId(videoId) : null
  if ((videoProvider === 'vimeo' || (videoId && videoId.includes('vimeo.com'))) && vimeoId) {
    return (
      <div className={`relative bg-black aspect-video w-full overflow-hidden rounded-2xl border border-border/40 shadow-2xl ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0`}
          title={title || 'Clase'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // 3. Proveedor: Cloudflare Stream
  if ((videoProvider === 'cloudflare' || videoProvider === 'cloudflare_stream') && videoId && !resolvedVideoUrl) {
    return (
      <div className={`relative bg-black aspect-video w-full overflow-hidden rounded-2xl border border-border/40 shadow-2xl ${className}`}>
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

  // 4. Reproductor HTML5 + Nativo Estilizado de MaestroTech (Supabase Storage / MP4 / WebM / Mock)
  const progressPercent = realDuration > 0 ? Math.min(100, (currentTime / realDuration) * 100) : 0

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`relative bg-neutral-950 aspect-video w-full overflow-hidden select-none group rounded-2xl border border-border/40 shadow-2xl ${className}`}
    >
      {/* Elemento de video HTML5 real si hay URL resuelta */}
      {resolvedVideoUrl ? (
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          poster={thumbnailUrl || undefined}
          playsInline
          onClick={togglePlay}
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget
            if (vid.duration && isFinite(vid.duration) && vid.duration > 0) {
              setRealDuration(Math.round(vid.duration))
            }
            if (initialPositionSeconds > 0 && initialPositionSeconds < vid.duration) {
              vid.currentTime = initialPositionSeconds
            }
          }}
          onTimeUpdate={(e) => {
            const vid = e.currentTarget
            const curr = Math.floor(vid.currentTime)
            const total = Math.floor(vid.duration || realDuration)
            setCurrentTime(curr)
            if (Math.abs(curr - lastReportedRef.current) >= 5) {
              lastReportedRef.current = curr
              onProgress?.(curr, total)
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false)
            onProgress?.(realDuration, realDuration)
            onEnded?.()
          }}
          className="w-full h-full object-contain bg-black cursor-pointer"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-background to-violet-950/60 flex items-center justify-center">
          <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Botón central Play/Pause superpuesto cuando está en pausa o cargando */}
      {(!isPlaying || loadingUrl) && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer z-10"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 hover:bg-white/25 transition-all shadow-2xl"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {loadingUrl ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
            )}
          </motion.button>
        </div>
      )}

      {/* Info superior */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 pointer-events-none transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-white/90 tracking-wide truncate max-w-md">
            {title || 'Clase de MaestroTech'}
          </span>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
          {videoProvider === 'supabase'
            ? 'Supabase Video Stream'
            : resolvedVideoUrl
            ? 'HD Video MaestroTech'
            : 'Reproductor MaestroTech'}
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
            max={realDuration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white/85">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="p-1 hover:text-white transition-colors"
              title="Reiniciar video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="font-mono text-white/75">
              {formatTime(currentTime)} / {formatTime(realDuration)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono text-white transition-colors"
              title="Velocidad de reproducción"
            >
              {playbackRate}x
            </button>
            <span className="text-[11px] text-emerald-400 font-medium">
              {progressPercent >= 90 ? 'Completado ✓' : `${Math.round(progressPercent)}%`}
            </span>
            <button
              type="button"
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
