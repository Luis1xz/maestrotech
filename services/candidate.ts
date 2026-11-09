import { CandidateProfile, TargetRole } from '@/types/candidate'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchPlatformState, mutatePlatformState } from '@/lib/platform-state-client'

const CANDIDATE_STORAGE_KEY = 'legado_docente_candidate_profile_v1'

/**
 * Motor de clasificación automática del aspirante según la normativa y respuestas.
 */
export function classifyCandidate(profile: Partial<CandidateProfile>): {
  primaryTag: string
  tags: string[]
} {
  const tags: string[] = []

  // 1. Clasificación del cargo principal
  let primaryTag = 'aspirante_sin_definir'
  switch (profile.target_role) {
    case 'docente_aula':
      primaryTag = 'docente_aula'
      tags.push('docente_aula')
      break
    case 'docente_orientador':
      primaryTag = 'docente_orientador'
      tags.push('docente_orientador')
      break
    case 'coordinador':
      primaryTag = 'directivo_coordinador'
      tags.push('directivo_coordinador')
      break
    case 'rector':
      primaryTag = 'directivo_rector'
      tags.push('directivo_rector')
      break
    case 'director_rural':
      primaryTag = 'directivo_director_rural'
      tags.push('directivo_director_rural')
      break
    default:
      primaryTag = 'aspirante_sin_definir'
      tags.push('aspirante_sin_definir')
  }

  // 2. Clasificación por formación académica
  const level = profile.education_level_highest
  if (level === 'licenciado') {
    tags.push('licenciado')
  } else if (level === 'normalista_superior') {
    tags.push('normalista')
  } else if (level === 'estudiante_universitario') {
    tags.push('estudiante_universitario')
  } else if (level === 'profesional_no_licenciado' || level === 'profesional_universitario') {
    tags.push('profesional_no_licenciado')
  }

  if (level === 'especialista' || level === 'magister' || level === 'doctor') {
    tags.push('profesional_con_posgrado')
    if (
      profile.professional_title?.toLowerCase().includes('licenc') ||
      profile.additional_degrees?.some((d) => d.degree_name.toLowerCase().includes('licenc'))
    ) {
      tags.push('licenciado')
    } else {
      tags.push('profesional_no_licenciado')
    }
  }

  // 3. Formación pedagógica
  if (profile.pedagogical_training === 'si' || level === 'licenciado' || level === 'normalista_superior') {
    tags.push('con_formacion_pedagogica')
  } else {
    tags.push('sin_formacion_pedagogica')
  }

  // 4. Experiencia docente
  if (
    profile.has_teaching_experience &&
    profile.teaching_experience_years &&
    profile.teaching_experience_years !== 'ninguna'
  ) {
    tags.push('con_experiencia_docente')
  } else {
    tags.push('sin_experiencia_docente')
  }

  // 5. Experiencia directiva
  if (
    profile.has_directorship_experience ||
    profile.has_management_experience ||
    (profile.management_experience_years && profile.management_experience_years !== 'ninguno')
  ) {
    tags.push('con_experiencia_directiva')
  }

  // 6. Historial en concursos
  if (profile.previous_exam_experience === 'primera_vez') {
    tags.push('aspirante_primera_vez')
  } else if (
    profile.previous_exam_experience === 'aprobo' ||
    profile.previous_exam_experience === 'no_aprobo'
  ) {
    tags.push('aspirante_con_experiencia_concurso')
  }

  return { primaryTag, tags: Array.from(new Set(tags)) }
}

/**
 * Guarda o actualiza el perfil completo del aspirante tanto en Supabase como en el store sincronizado
 */
export async function saveCandidateProfile(
  candidateData: CandidateProfile
): Promise<{ success: boolean; data?: CandidateProfile; error?: Error }> {
  try {
    const classification = classifyCandidate(candidateData)
    const completeProfile: CandidateProfile = {
      ...candidateData,
      tags: classification.tags,
      primary_tag: classification.primaryTag,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    }

    // 1. Guardar en localStorage del navegador como respaldo inmediato
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          `${CANDIDATE_STORAGE_KEY}_${completeProfile.user_id}`,
          JSON.stringify(completeProfile)
        )
        window.localStorage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(completeProfile))
      } catch {
        // Continue
      }
    }

    // 2. Guardar en store central de servidor / platform-state
    await mutatePlatformState('upsert_candidate_profile', completeProfile)

    // 3. Si Supabase está disponible, intentar insertar/actualizar en candidate_profiles
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { error } = await client
          .from('candidate_profiles')
          .upsert(
            {
              id: completeProfile.id,
              user_id: completeProfile.user_id,
              first_name: completeProfile.first_name,
              last_name: completeProfile.last_name,
              email: completeProfile.email,
              phone_number: completeProfile.phone_number,
              department: completeProfile.department,
              municipality: completeProfile.municipality,
              target_role: completeProfile.target_role,
              education_level: completeProfile.education_level,
              subject_area: completeProfile.subject_area,
              process_type: completeProfile.process_type,
              education_level_highest: completeProfile.education_level_highest,
              professional_title: completeProfile.professional_title,
              institution_name: completeProfile.institution_name,
              graduation_year: completeProfile.graduation_year,
              degree_status: completeProfile.degree_status,
              pedagogical_training: completeProfile.pedagogical_training,
              has_work_experience: completeProfile.has_work_experience,
              total_work_experience: completeProfile.total_work_experience,
              has_teaching_experience: completeProfile.has_teaching_experience,
              teaching_experience_years: completeProfile.teaching_experience_years,
              teaching_institution_type: completeProfile.teaching_institution_type,
              previous_exam_experience: completeProfile.previous_exam_experience,
              knowledge_level: completeProfile.knowledge_level,
              difficulty_topics: completeProfile.difficulty_topics,
              study_time: completeProfile.study_time,
              preparation_goal: completeProfile.preparation_goal,
              tags: completeProfile.tags,
              profile_completed: true,
              updated_at: completeProfile.updated_at,
            },
            { onConflict: 'user_id' }
          )

        if (error) {
          console.warn('[candidate-service] Supabase upsert notice:', error.message)
        }
      } catch (err) {
        console.warn('[candidate-service] Supabase table candidate_profiles error:', err)
      }
    }

    return { success: true, data: completeProfile }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al guardar perfil de aspirante'
    return { success: false, error: new Error(msg) }
  }
}

/**
 * Obtener perfil de un aspirante por user_id
 */
export async function getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
  // 1. Probar localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(`${CANDIDATE_STORAGE_KEY}_${userId}`)
      if (raw) return JSON.parse(raw)
      const rawGeneric = window.localStorage.getItem(CANDIDATE_STORAGE_KEY)
      if (rawGeneric) {
        const parsed = JSON.parse(rawGeneric)
        if (parsed.user_id === userId) return parsed
      }
    } catch {
      // Continue
    }
  }

  // 2. Probar platform-state
  try {
    const state = await fetchPlatformState()
    const found = (state?.candidate_profiles || []).find((c: CandidateProfile) => c.user_id === userId)
    if (found) return found
  } catch {
    // Continue
  }

  // 3. Probar Supabase
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabase()
      const { data, error } = await client
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (!error && data) return data as CandidateProfile
    } catch {
      // Continue
    }
  }

  return null
}

/**
 * Obtener todos los aspirantes caracterizados para el panel administrativo
 */
export async function getAllCandidates(): Promise<CandidateProfile[]> {
  try {
    const state = await fetchPlatformState()
    const profiles = state?.candidate_profiles || []

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()
        const { data, error } = await client
          .from('candidate_profiles')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          // Unir evitando duplicados
          const map = new Map<string, CandidateProfile>()
          for (const p of profiles) map.set(p.user_id, p)
          for (const d of data) map.set(d.user_id, d as CandidateProfile)
          return Array.from(map.values())
        }
      } catch {
        // Fallback to store
      }
    }

    return profiles
  } catch {
    return []
  }
}
