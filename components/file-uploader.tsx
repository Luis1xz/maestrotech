'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  onClear?: () => void
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  selectedFile?: File | null
  uploading?: boolean
  progressText?: string
}

export default function FileUploader({
  onFileSelect,
  onClear,
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip',
  maxSizeMB = 50,
  disabled = false,
  selectedFile = null,
  uploading = false,
  progressText,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSelect = (file: File) => {
    setError(null)
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`El archivo supera el límite de ${maxSizeMB} MB.`)
      return
    }
    onFileSelect(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled || uploading) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || uploading) return
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="w-full space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border/70 hover:border-primary/50 hover:bg-muted/40'
          } ${disabled || uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-foreground mb-1">
            Haz clic para seleccionar o arrastra tu archivo aquí
          </p>
          <p className="text-[11px] text-muted-foreground">
            PDF, Word, PowerPoint, Excel o ZIP (hasta {maxSizeMB} MB)
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl glass border border-border/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">{progressText || 'Subiendo...'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  if (inputRef.current) inputRef.current.value = ''
                  onClear?.()
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Quitar archivo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
