export type TargetRole =
  | 'docente_aula'
  | 'docente_orientador'
  | 'coordinador'
  | 'rector'
  | 'director_rural'
  | 'orientacion_requerida'

export type EducationLevelInterest =
  | 'preescolar'
  | 'primaria'
  | 'secundaria'
  | 'media'
  | 'no_sabe'

export type SubjectArea =
  | 'preescolar'
  | 'primaria'
  | 'matematicas'
  | 'ciencias_naturales'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'ciencias_sociales'
  | 'historia'
  | 'geografia'
  | 'lengua_castellana'
  | 'ingles'
  | 'tecnologia'
  | 'educacion_fisica'
  | 'educacion_artistica'
  | 'otra'

export type ProcessType =
  | 'ingreso'
  | 'ascenso'
  | 'reubicacion'
  | 'directivos'
  | 'desconoce'

export type EducationLevelHighest =
  | 'bachiller'
  | 'estudiante_universitario'
  | 'normalista_superior'
  | 'tecnico'
  | 'tecnologo'
  | 'profesional_universitario'
  | 'licenciado'
  | 'profesional_no_licenciado'
  | 'especialista'
  | 'magister'
  | 'doctor'

export type DegreeStatus = 'graduado' | 'en_curso' | 'pendiente_grado'

export type PedagogicalTraining = 'si' | 'no' | 'en_curso'

export type WorkExperienceYears = 'ninguna' | 'menos_1' | '1_2' | '3_4' | '5_9' | '10_mas'

export type ManagementYears = 'ninguno' | 'menos_2' | '2_4' | '5_9' | '10_mas'

export type InstitutionEnvironment = 'urbana' | 'rural' | 'indiferente'

export type ExamHistory = 'aprobo' | 'no_aprobo' | 'no_termino' | 'primera_vez'

export type KnowledgeLevel = 'no_conoce' | 'basico' | 'conoce_etapas' | 'realizo_anteriores'

export type StudyTime = 'menos_1h' | '1_2h' | '2_3h' | 'mas_3h' | 'fines_de_semana'

export type PreparationGoal =
  | 'aprobar_concurso'
  | 'conocer_requisitos'
  | 'fortalecer_conocimientos'
  | 'mejorar_perfil'
  | 'cargo_directivo'
  | 'mejor_posicion'

export interface AcademicDegree {
  id: string
  user_id?: string
  degree_type: 'pregrado' | 'especializacion' | 'maestria' | 'doctorado' | 'otro'
  degree_name: string
  institution: string
  graduation_year?: string
  status: DegreeStatus
  created_at?: string
}

export interface WorkExperienceRecord {
  id: string
  user_id?: string
  experience_type: 'docente' | 'directiva' | 'otra'
  institution_type?: 'oficial' | 'privada' | 'superior' | 'informal' | 'otra'
  position: string
  subject_area?: string
  years?: string
  start_date?: string
  end_date?: string
  description?: string
}

export interface CandidateProfile {
  id: string
  user_id: string
  // Etapa 1: Personal & Contact
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  department: string
  municipality: string
  data_consent_accepted: boolean

  // Etapa 2: Aspiración
  target_role: TargetRole
  education_level?: EducationLevelInterest
  subject_area?: SubjectArea
  process_type: ProcessType
  // Directivos específicos
  management_institution_environment?: InstitutionEnvironment
  has_management_experience?: boolean
  has_coordination_functions?: boolean
  management_experience_years?: ManagementYears

  // Etapa 3: Formación Académica
  education_level_highest: EducationLevelHighest
  professional_title: string
  institution_name: string
  graduation_year: string
  degree_status: DegreeStatus
  pedagogical_training: PedagogicalTraining
  pedagogical_training_details?: {
    type?: string
    institution?: string
    duration?: string
  }
  additional_degrees?: AcademicDegree[]

  // Etapa 4: Experiencia
  has_work_experience: boolean
  total_work_experience?: WorkExperienceYears
  has_teaching_experience: boolean
  teaching_institution_type?: 'oficial' | 'privada' | 'superior' | 'informal' | 'otra'
  teaching_experience_years?: WorkExperienceYears
  teaching_levels?: string[]
  teaching_subjects?: string[]
  has_directorship_experience?: boolean
  directorship_positions?: string[]
  directorship_years?: Record<string, string>

  // Etapa 5: Diagnóstico y Preparación
  previous_exam_experience: ExamHistory
  knowledge_level: KnowledgeLevel
  difficulty_topics: string[]
  study_time: StudyTime
  preparation_goal: PreparationGoal

  // Clasificación automática y estado
  tags: string[]
  primary_tag: string
  profile_completed: boolean
  created_at: string
  updated_at: string
}
