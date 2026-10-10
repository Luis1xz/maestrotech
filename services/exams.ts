import { ExamQuestionItem } from '@/lib/platform-store'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

export type ExamQuestionRecord = ExamQuestionItem & {
  correctAnswer?: string
}

export async function getExamQuestions(
  courseId?: string
): Promise<{ data: ExamQuestionRecord[]; error: Error | null }> {
  try {
    const state = await fetchPlatformState()
    let list = (state?.exam_questions || []).map((q) => ({
      ...q,
      correctAnswer: String.fromCharCode(65 + (q.correct ?? 0)),
    }))
    if (courseId && courseId !== 'all') {
      list = list.filter((q) => !q.course_id || q.course_id === courseId)
    }
    return { data: list, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener preguntas de simulacro'
    return { data: [], error: new Error(msg) }
  }
}

export async function createExamQuestion(payload: {
  course_id: string | null
  competency: string
  text: string
  options: { id: string; text: string }[] | string[]
  correctAnswer?: string
  correct?: number
  explanation: string
  difficulty?: 'Básico' | 'Intermedio' | 'Avanzado'
}): Promise<{ data: ExamQuestionRecord | null; error: Error | null }> {
  try {
    const normalizedOptions = payload.options.map((o) =>
      typeof o === 'string' ? o : o.text
    )
    const letterIndex = payload.correctAnswer
      ? Math.max(0, payload.correctAnswer.toUpperCase().charCodeAt(0) - 65)
      : payload.correct ?? 0

    const newQuestion: ExamQuestionRecord = {
      id: `q-${Date.now()}`,
      course_id: payload.course_id,
      competency: payload.competency,
      text: payload.text,
      options: normalizedOptions,
      correct: letterIndex,
      correctAnswer: String.fromCharCode(65 + letterIndex),
      explanation: payload.explanation,
      difficulty: payload.difficulty || 'Intermedio',
      created_at: new Date().toISOString(),
    }

    await mutatePlatformState('upsert_exam_question', newQuestion)
    return { data: newQuestion, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear pregunta de simulacro'
    return { data: null, error: new Error(msg) }
  }
}

export async function deleteExamQuestion(
  questionId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    await mutatePlatformState('delete_exam_question', { id: questionId })
    return { success: true, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar pregunta'
    return { success: false, error: new Error(msg) }
  }
}
