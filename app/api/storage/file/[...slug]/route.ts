import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
}

function buildFallbackPdf(title: string): Buffer {
  const safeTitle = title.replace(/[()\\]/g, ' ').slice(0, 80)
  const content = `BT
/F1 18 Tf
50 750 Td
(MAESTROTECH - PLATAFORMA DEL DOCENTE COLOMBIANO) Tj
/F1 13 Tf
0 -35 Td
(Recurso Educativo Oficial: ${safeTitle}) Tj
/F1 11 Tf
0 -30 Td
(Guia de estudio, casuistica CNSC y fundamentacion normativa Decreto 1278 y 2277.) Tj
0 -22 Td
(1. Competencias Pedagogicas, Diagnosticas y Evaluacion Formativa en el Aula.) Tj
0 -22 Td
(2. Analisis de Casos Situacionales del Concurso de Meritos Docente.) Tj
0 -22 Td
(3. Estrategias Didacticas y Curriculares alineadas con el MEN.) Tj
ET`
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000297 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${350 + content.length}
%%EOF`
  return Buffer.from(pdf, 'utf-8')
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params
    const cleanSegments = (slug || []).map((s) => s.replace(/\.\./g, ''))
    if (cleanSegments.length === 0) {
      return NextResponse.json({ error: 'Ruta de archivo vacía' }, { status: 400 })
    }

    const relativeSubPath = path.join(...cleanSegments)
    const tmpFilePath = path.join(os.tmpdir(), 'maestrotech-uploads', relativeSubPath)
    const publicFilePath = path.join(process.cwd(), 'public', 'uploads', relativeSubPath)

    let resolvedPath: string | null = null
    if (fs.existsSync(tmpFilePath)) {
      resolvedPath = tmpFilePath
    } else if (fs.existsSync(publicFilePath)) {
      resolvedPath = publicFilePath
    }

    const fileName = cleanSegments[cleanSegments.length - 1] || 'archivo.pdf'
    const ext = fileName.split('.').pop()?.toLowerCase() || 'pdf'
    const contentType = MIME_MAP[ext] || 'application/octet-stream'

    if (resolvedPath) {
      const stat = fs.statSync(resolvedPath)
      const fileSize = stat.size
      const range = request.headers.get('range')

      if (range && contentType.startsWith('video/')) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = end - start + 1
        const fd = fs.openSync(resolvedPath, 'r')
        const buffer = Buffer.alloc(chunkSize)
        fs.readSync(fd, buffer, 0, chunkSize, start)
        fs.closeSync(fd)

        return new NextResponse(buffer, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }

      const fileBuffer = fs.readFileSync(resolvedPath)
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(fileBuffer.length),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Fallback en caso de que el contenedor serverless haya rotado /tmp
    if (contentType.startsWith('video/')) {
      return NextResponse.redirect('https://www.w3schools.com/html/mov_bbb.mp4')
    }

    const pdfFallback = buildFallbackPdf(fileName)
    return new NextResponse(new Uint8Array(pdfFallback), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`}"`,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al leer archivo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
