import zlib from 'zlib'

export interface ExtractedPage {
  pageNumber: number
  text: string
}

export interface DocumentChunk {
  chunkIndex: number
  pageNumber: number
  content: string
}

/**
 * Extrae texto de un archivo buffer según su tipo.
 * Implementación 100% nativa en TypeScript sin dependencias pesadas ni binarios C++.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: string
): Promise<ExtractedPage[]> {
  const cleanType = fileType.toLowerCase().replace(/^\./, '')

  switch (cleanType) {
    case 'txt':
    case 'text/plain':
      return extractTxt(buffer)

    case 'docx':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractDocx(buffer)

    case 'pdf':
    case 'application/pdf':
      return extractPdf(buffer)

    case 'pptx':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return extractPptx(buffer)

    case 'xlsx':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return extractXlsx(buffer)

    default:
      // Fallback a texto plano
      return [{ pageNumber: 1, text: buffer.toString('utf-8') }]
  }
}

/**
 * Extrae texto de archivos .txt
 */
function extractTxt(buffer: Buffer): ExtractedPage[] {
  const content = buffer.toString('utf-8')
  // Dividir por saltos de página de impresión si existen
  const pages = content.split('\f')
  return pages.map((p, idx) => ({
    pageNumber: idx + 1,
    text: p.trim(),
  })).filter((p) => p.text.length > 0)
}

/**
 * Extrae texto de un archivo PDF mediante análisis de streams de texto PDF
 */
function extractPdf(buffer: Buffer): ExtractedPage[] {
  const raw = buffer.toString('binary')
  const pages: ExtractedPage[] = []

  // Buscar marcadores de página o bloques de texto
  const pageBlocks = raw.split(/\/Type\s*\/Page\b/)
  if (pageBlocks.length > 1) {
    for (let i = 1; i < pageBlocks.length; i++) {
      const block = pageBlocks[i]
      const textMatches: string[] = []

      // Extraer strings dentro de operadores BT ... ET o Tj / TJ
      const regexBT = /BT[\s\S]*?ET/g
      let match: RegExpExecArray | null
      while ((match = regexBT.exec(block)) !== null) {
        const btBlock = match[0]
        const tjRegex = /\((.*?)\)\s*Tj/g
        let tjMatch: RegExpExecArray | null
        while ((tjMatch = tjRegex.exec(btBlock)) !== null) {
          textMatches.push(tjMatch[1])
        }
      }

      const pageText = textMatches.join(' ').replace(/\\([()\\])/g, '$1').trim()
      if (pageText.length > 10) {
        pages.push({ pageNumber: i, text: pageText })
      }
    }
  }

  // Si no se detectaron páginas individuales por streams simples, extraer todo el texto legible
  if (pages.length === 0) {
    const readable = raw.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ')
    const cleaned = readable.replace(/\s+/g, ' ').trim()
    // Dividir en páginas simuladas de ~1500 caracteres
    const chunkSize = 1500
    for (let i = 0; i < cleaned.length; i += chunkSize) {
      pages.push({
        pageNumber: Math.floor(i / chunkSize) + 1,
        text: cleaned.slice(i, i + chunkSize).trim(),
      })
    }
  }

  return pages.filter((p) => p.text.length > 0)
}

/**
 * Extrae texto de documentos Word (.docx).
 * Los archivos .docx son contenedores ZIP que tienen el texto principal en `word/document.xml`.
 */
function extractDocx(buffer: Buffer): ExtractedPage[] {
  const xmlContent = readZipFileEntry(buffer, 'word/document.xml')
  if (!xmlContent) {
    return [{ pageNumber: 1, text: buffer.toString('utf-8').replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ') }]
  }

  // Extraer texto de etiquetas <w:t>
  const textMatches: string[] = []
  const regex = /<w:t[^>]*>(.*?)<\/w:t>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(xmlContent)) !== null) {
    textMatches.push(match[1])
  }

  const fullText = textMatches.join(' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()

  // Dividir en páginas estimadas de ~1200 caracteres
  const pages: ExtractedPage[] = []
  const chunkSize = 1200
  for (let i = 0; i < fullText.length; i += chunkSize) {
    pages.push({
      pageNumber: Math.floor(i / chunkSize) + 1,
      text: fullText.slice(i, i + chunkSize).trim(),
    })
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }]
}

/**
 * Extrae texto de presentaciones PowerPoint (.pptx).
 */
function extractPptx(buffer: Buffer): ExtractedPage[] {
  const pages: ExtractedPage[] = []
  // Buscar diapositivas numeradas slide1.xml, slide2.xml, etc.
  for (let s = 1; s <= 100; s++) {
    const slideXml = readZipFileEntry(buffer, `ppt/slides/slide${s}.xml`)
    if (!slideXml) break

    const textMatches: string[] = []
    const regex = /<a:t[^>]*>(.*?)<\/a:t>/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(slideXml)) !== null) {
      textMatches.push(match[1])
    }

    const slideText = textMatches.join(' ').trim()
    if (slideText) {
      pages.push({ pageNumber: s, text: slideText })
    }
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, text: buffer.toString('utf-8').replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ') }]
}

/**
 * Extrae texto de hojas de cálculo Excel (.xlsx).
 */
function extractXlsx(buffer: Buffer): ExtractedPage[] {
  // En Excel, la mayoría de los textos residen en xl/sharedStrings.xml
  const sharedXml = readZipFileEntry(buffer, 'xl/sharedStrings.xml')
  if (!sharedXml) {
    return [{ pageNumber: 1, text: 'Hoja de cálculo sin cadenas de texto compartidas.' }]
  }

  const textMatches: string[] = []
  const regex = /<t[^>]*>(.*?)<\/t>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(sharedXml)) !== null) {
    textMatches.push(match[1])
  }

  const fullText = textMatches.join(', ').trim()
  return [{ pageNumber: 1, text: fullText }]
}

/**
 * Función auxiliar para leer una entrada específica dentro de un contenedor ZIP
 * sin requerir paquetes nativos pesados externos.
 */
function readZipFileEntry(zipBuffer: Buffer, targetEntryName: string): string | null {
  try {
    let offset = 0
    while (offset < zipBuffer.length - 30) {
      // Firma de Local File Header: 0x04034b50
      if (zipBuffer.readUInt32LE(offset) !== 0x04034b50) {
        offset++
        continue
      }

      const compressionMethod = zipBuffer.readUInt16LE(offset + 8)
      const compressedSize = zipBuffer.readUInt32LE(offset + 18)
      const fileNameLength = zipBuffer.readUInt16LE(offset + 26)
      const extraFieldLength = zipBuffer.readUInt16LE(offset + 28)

      const fileName = zipBuffer.toString('utf-8', offset + 30, offset + 30 + fileNameLength)
      const dataOffset = offset + 30 + fileNameLength + extraFieldLength

      if (fileName.toLowerCase() === targetEntryName.toLowerCase()) {
        const compressedData = zipBuffer.subarray(dataOffset, dataOffset + compressedSize)
        if (compressionMethod === 0) {
          // Sin compresión (Stored)
          return compressedData.toString('utf-8')
        } else if (compressionMethod === 8) {
          // Comprimido con Deflate
          try {
            return zlib.inflateRawSync(compressedData).toString('utf-8')
          } catch {
            return null
          }
        }
      }

      offset = dataOffset + compressedSize
    }
  } catch {
    // Retornar null si el ZIP está truncado o dañado
  }
  return null
}

/**
 * Fragmentador de texto inteligente (Chunking semántico).
 * Genera fragmentos de ~600 a 800 caracteres con solapamiento (~100 caracteres)
 * respetando párrafos y oraciones.
 */
export function chunkExtractedPages(
  pages: ExtractedPage[],
  chunkSize: number = 700,
  chunkOverlap: number = 100
): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  let globalChunkIndex = 0

  for (const page of pages) {
    const text = page.text.trim()
    if (!text) continue

    if (text.length <= chunkSize) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        pageNumber: page.pageNumber,
        content: text,
      })
      continue
    }

    // Dividir por párrafos
    const paragraphs = text.split(/\n\s*\n/)
    let currentChunk = ''

    for (const paragraph of paragraphs) {
      const p = paragraph.trim()
      if (!p) continue

      if ((currentChunk + ' ' + p).length <= chunkSize) {
        currentChunk = currentChunk ? `${currentChunk}\n\n${p}` : p
      } else {
        if (currentChunk) {
          chunks.push({
            chunkIndex: globalChunkIndex++,
            pageNumber: page.pageNumber,
            content: currentChunk.trim(),
          })
          // Solapamiento
          const words = currentChunk.split(/\s+/)
          const overlapWords = words.slice(-Math.max(10, Math.floor(chunkOverlap / 6))).join(' ')
          currentChunk = overlapWords ? `${overlapWords}\n\n${p}` : p
        } else {
          // Párrafo muy largo: dividir por oraciones
          const sentences = p.split(/(?<=[.?!])\s+/)
          for (const sentence of sentences) {
            if ((currentChunk + ' ' + sentence).length <= chunkSize) {
              currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence
            } else {
              if (currentChunk) {
                chunks.push({
                  chunkIndex: globalChunkIndex++,
                  pageNumber: page.pageNumber,
                  content: currentChunk.trim(),
                })
              }
              currentChunk = sentence
            }
          }
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        pageNumber: page.pageNumber,
        content: currentChunk.trim(),
      })
    }
  }

  return chunks
}
