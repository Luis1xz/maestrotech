'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Briefcase,
  Target,
  Sparkles,
  ShieldCheck,
  Building,
  School,
  Clock,
  Compass,
  FileCheck,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  CandidateProfile,
  TargetRole,
  EducationLevelInterest,
  SubjectArea,
  ProcessType,
  EducationLevelHighest,
  DegreeStatus,
  PedagogicalTraining,
  WorkExperienceYears,
  ManagementYears,
  InstitutionEnvironment,
  ExamHistory,
  KnowledgeLevel,
  StudyTime,
  PreparationGoal,
  AcademicDegree,
} from '@/types/candidate'
import { COLOMBIA_DEPARTMENTS, COMMON_ACADEMIC_TITLES } from '@/lib/colombia-data'
import { saveCandidateProfile, classifyCandidate } from '@/services/candidate'
import CelebrationParticles from '@/components/celebration-particles'

interface CandidateOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function CandidateOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}: CandidateOnboardingModalProps) {
  const { signUp, signIn, user } = useAuth()

  // Etapa actual: 1 a 5, y 6 para la pantalla de perfil listo
  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState<boolean>(false)

  // -------------------------------------------------------------
  // ETAPA 1: INFORMACIÓN PERSONAL Y CUENTA
  // -------------------------------------------------------------
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [department, setDepartment] = useState('Antioquia')
  const [municipality, setMunicipality] = useState('Medellín')
  const [dataConsent, setDataConsent] = useState(true)

  // -------------------------------------------------------------
  // ETAPA 2: ASPIRACIÓN AL CONCURSO
  // -------------------------------------------------------------
  const [targetRole, setTargetRole] = useState<TargetRole>('docente_aula')
  const [educationLevel, setEducationLevel] = useState<EducationLevelInterest>('secundaria')
  const [subjectArea, setSubjectArea] = useState<SubjectArea>('matematicas')
  const [processType, setProcessType] = useState<ProcessType>('ingreso')

  // Preguntas condicionales directivos
  const [mgmtEnvironment, setMgmtEnvironment] = useState<InstitutionEnvironment>('indiferente')
  const [hasMgmtExperience, setHasMgmtExperience] = useState<boolean>(false)
  const [hasCoordFunctions, setHasCoordFunctions] = useState<boolean>(false)
  const [mgmtYears, setMgmtYears] = useState<ManagementYears>('ninguno')

  // -------------------------------------------------------------
  // ETAPA 3: FORMACIÓN ACADÉMICA
  // -------------------------------------------------------------
  const [eduLevelHighest, setEduLevelHighest] = useState<EducationLevelHighest>('licenciado')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [graduationYear, setGraduationYear] = useState('2022')
  const [degreeStatus, setDegreeStatus] = useState<DegreeStatus>('graduado')
  const [pedagogicalTraining, setPedagogicalTraining] = useState<PedagogicalTraining>('si')
  const [pedagogyType, setPedagogyType] = useState('')
  const [pedagogyInstitution, setPedagogyInstitution] = useState('')
  const [additionalDegrees, setAdditionalDegrees] = useState<AcademicDegree[]>([])

  // Modal rápido para añadir posgrado
  const [showAddDegree, setShowAddDegree] = useState(false)
  const [newDegType, setNewDegType] = useState<'especializacion' | 'maestria' | 'doctorado'>('especializacion')
  const [newDegName, setNewDegName] = useState('')
  const [newDegInst, setNewDegInst] = useState('')
  const [newDegYear, setNewDegYear] = useState('2023')

  // -------------------------------------------------------------
  // ETAPA 4: EXPERIENCIA PROFESIONAL Y DOCENTE
  // -------------------------------------------------------------
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean>(true)
  const [totalWorkExp, setTotalWorkExp] = useState<WorkExperienceYears>('3_4')
  const [hasTeachingExperience, setHasTeachingExperience] = useState<boolean>(true)
  const [teachingInstType, setTeachingInstType] = useState<'oficial' | 'privada' | 'superior' | 'informal' | 'otra'>('oficial')
  const [teachingExpYears, setTeachingExpYears] = useState<WorkExperienceYears>('3_4')
  const [teachingLevels, setTeachingLevels] = useState<string[]>(['Básica secundaria', 'Educación media'])
  const [teachingSubjectsInput, setTeachingSubjectsInput] = useState('Matemáticas, Álgebra')

  const [hasDirectorshipExp, setHasDirectorshipExp] = useState<boolean>(false)
  const [selectedDirPositions, setSelectedDirPositions] = useState<string[]>([])
  const [dirExpYears, setDirExpYears] = useState<string>('Menos de 2 años')

  // -------------------------------------------------------------
  // ETAPA 5: DIAGNÓSTICO Y NECESIDADES DE PREPARACIÓN
  // -------------------------------------------------------------
  const [previousExam, setPreviousExam] = useState<ExamHistory>('no_aprobo')
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>('conoce_etapas')
  const [difficultyTopics, setDifficultyTopics] = useState<string[]>([
    'Competencias pedagógicas',
    'Razonamiento lógico',
    'Legislación educativa',
  ])
  const [studyTime, setStudyTime] = useState<StudyTime>('2_3h')
  const [preparationGoal, setPreparationGoal] = useState<PreparationGoal>('aprobar_concurso')

  // Resumen final calculado
  const [finalProfile, setFinalProfile] = useState<CandidateProfile | null>(null)

  // Municipios dinámicos por departamento
  const availableMunicipalities = useMemo(() => {
    return COLOMBIA_DEPARTMENTS[department] || ['Municipio Principal']
  }, [department])

  if (!isOpen) return null

  // Manejar cambio de departamento
  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept)
    const munis = COLOMBIA_DEPARTMENTS[dept] || []
    if (munis.length > 0) {
      setMunicipality(munis[0])
    }
  }

  // Toggle de selección múltiple de niveles enseñados
  const toggleTeachingLevel = (lvl: string) => {
    setTeachingLevels((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    )
  }

  // Toggle de selección múltiple de dificultades
  const toggleDifficultyTopic = (topic: string) => {
    setDifficultyTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  // Toggle de cargos directivos
  const toggleDirPosition = (pos: string) => {
    setSelectedDirPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    )
  }

  // Agregar posgrado
  const handleAddDegree = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDegName.trim()) return
    const deg: AcademicDegree = {
      id: crypto.randomUUID(),
      degree_type: newDegType,
      degree_name: newDegName.trim(),
      institution: newDegInst.trim() || 'Universidad',
      graduation_year: newDegYear,
      status: 'graduado',
    }
    setAdditionalDegrees((prev) => [...prev, deg])
    setNewDegName('')
    setNewDegInst('')
    setShowAddDegree(false)
  }

  // Validaciones por etapa
  const validateCurrentStep = (): boolean => {
    setErrorMsg(null)
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('Por favor ingresa tus nombres y apellidos completos.')
        return false
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Ingresa un correo electrónico válido.')
        return false
      }
      if (!user && password.length < 6) {
        setErrorMsg('La contraseña debe tener mínimo 6 caracteres.')
        return false
      }
      if (!user && password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.')
        return false
      }
      if (!dataConsent) {
        setErrorMsg('Debes aceptar el tratamiento de datos personales bajo la Ley 1581.')
        return false
      }
      return true
    }

    if (step === 3) {
      if (!professionalTitle.trim()) {
        setErrorMsg('Por favor ingresa tu título académico o programa.')
        return false
      }
      return true
    }

    return true
  }

  // Avanzar
  const handleNextStep = async () => {
    if (!validateCurrentStep()) return

    // Al completar la Etapa 1, registrar al usuario inmediatamente en Supabase
    if (step === 1 && !user?.id) {
      setLoading(true)
      setErrorMsg(null)
      try {
        const authRes = await signUp({
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })

        if (authRes.error) {
          const isAlreadyReg = Boolean(authRes.error.message?.toLowerCase().includes('already registered'))
          const isRateLim = Boolean(authRes.error.message?.toLowerCase().includes('rate limit'))

          if (isAlreadyReg) {
            const loginRes = await signIn({ email: email.trim().toLowerCase(), password })
            if (loginRes.error) {
              setErrorMsg(
                'Este correo ya se encuentra registrado en el sistema. Inicia sesión con tu contraseña o haz clic en "Ya tengo cuenta".'
              )
              setLoading(false)
              return
            }
          } else if (isRateLim) {
            setErrorMsg(
              'Supabase ha alcanzado el límite de correos del plan gratuito ("email rate limit exceeded"). Para permitir registros directos ilimitados, desactiva "Confirm email" en tu panel de Supabase (Authentication > Providers > Email).'
            )
            setLoading(false)
            return
          } else {
            setErrorMsg(authRes.error.message || 'Error al registrar usuario en Supabase.')
            setLoading(false)
            return
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al registrar usuario'
        setErrorMsg(msg)
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }

    if (step < 5) {
      setStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Finalizar y registrar perfil completo
      await handleCompleteOnboarding()
    }
  }

  // Retroceder
  const handlePrevStep = () => {
    setErrorMsg(null)
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  // Registro y persistencia completa
  const handleCompleteOnboarding = async () => {
    setLoading(true)
    setErrorMsg(null)

    try {
      // Obtener el ID del usuario real autenticado en Supabase
      let userId = user?.id
      try {
        const { getSupabase } = await import('@/lib/supabase/client')
        const client = getSupabase()
        const { data: userData } = await client.auth.getUser()
        if (userData?.user?.id) {
          userId = userData.user.id
        }
      } catch {
        // Fallback
      }

      // Si por alguna razón no tiene sesión aún, intentar registrarlo
      if (!userId) {
        const authRes = await signUp({
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })

        if (authRes.error) {
          setErrorMsg(authRes.error.message || 'Error al crear la cuenta en Supabase.')
          setLoading(false)
          return
        }

        try {
          const { getSupabase } = await import('@/lib/supabase/client')
          const { data: userData } = await getSupabase().auth.getUser()
          userId = userData?.user?.id
        } catch {
          // Fallback
        }
      }

      if (!userId) {
        setErrorMsg('No se pudo verificar la sesión del usuario en Supabase. Por favor intenta de nuevo.')
        setLoading(false)
        return
      }

      // Construir perfil completo del aspirante
      const candidateProfile: CandidateProfile = {
        id: crypto.randomUUID(),
        user_id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        department,
        municipality,
        data_consent_accepted: true,

        target_role: targetRole,
        education_level: targetRole === 'docente_aula' ? educationLevel : undefined,
        subject_area: targetRole === 'docente_aula' ? subjectArea : undefined,
        process_type: processType,

        management_institution_environment:
          ['coordinador', 'rector', 'director_rural'].includes(targetRole) ? mgmtEnvironment : undefined,
        has_management_experience: hasMgmtExperience,
        has_coordination_functions: hasCoordFunctions,
        management_experience_years: mgmtYears,

        education_level_highest: eduLevelHighest,
        professional_title: professionalTitle.trim(),
        institution_name: institutionName.trim() || 'Institución Universitaria',
        graduation_year: graduationYear,
        degree_status: degreeStatus,
        pedagogical_training: pedagogicalTraining,
        pedagogical_training_details: {
          type: pedagogyType,
          institution: pedagogyInstitution,
        },
        additional_degrees: additionalDegrees,

        has_work_experience: hasWorkExperience,
        total_work_experience: totalWorkExp,
        has_teaching_experience: hasTeachingExperience,
        teaching_institution_type: teachingInstType,
        teaching_experience_years: teachingExpYears,
        teaching_levels: teachingLevels,
        teaching_subjects: teachingSubjectsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        has_directorship_experience: hasDirectorshipExp,
        directorship_positions: selectedDirPositions,
        directorship_years: { experiencia: dirExpYears },

        previous_exam_experience: previousExam,
        knowledge_level: knowledgeLevel,
        difficulty_topics: difficultyTopics,
        study_time: studyTime,
        preparation_goal: preparationGoal,

        tags: [],
        primary_tag: '',
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Clasificación automática y persistencia
      const saved = await saveCandidateProfile(candidateProfile)
      if (saved.data) {
        setFinalProfile(saved.data)
      } else {
        const cls = classifyCandidate(candidateProfile)
        setFinalProfile({ ...candidateProfile, tags: cls.tags, primary_tag: cls.primaryTag })
      }

      setCelebrate(true)
      setStep(6) // Pantalla final de bienvenida y resumen
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el diagnóstico del aspirante.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  // Porcentaje de avance
  const progressPercent = Math.min(100, Math.round(((step - 1) / 4) * 100))

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B2545]/70 backdrop-blur-md overflow-y-auto">
        {celebrate && <CelebrationParticles count={40} />}

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl my-auto rounded-3xl bg-white border-2 border-[#C99E32] shadow-2xl p-6 sm:p-9 text-[#1E293B] max-h-[94vh] overflow-y-auto"
        >
          {/* Header con marca Legado Docente */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-[#C99E32] shadow-xs shrink-0 bg-white p-0.5">
                <img src="/logo-icon.png" alt="Legado Docente" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-base sm:text-lg text-[#0038DF] tracking-tight">
                    LEGADO DOCENTE
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold-metallic text-[#1A1A1A] font-extrabold uppercase tracking-wider">
                    Caracterización Inteligente
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] italic">
                  «Aprende, comparte, deja huella»
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso (para etapas 1 a 5) */}
          {step <= 5 && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#0038DF]">
                  Etapa {step} de 5: {
                    step === 1 ? 'Información Personal y Cuenta' :
                    step === 2 ? 'Aspiración al Concurso' :
                    step === 3 ? 'Formación Académica' :
                    step === 4 ? 'Experiencia Profesional y Docente' :
                    'Diagnóstico y Necesidades'
                  }
                </span>
                <span className="text-[#9C7316] font-mono">{progressPercent}% completado</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#0038DF] via-[#C99E32] to-[#E6C565] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Alerta de Error */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* ETAPA 1: INFORMACIÓN PERSONAL Y CUENTA                        */}
          {/* ============================================================== */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#142D49]">
                  Crea tu cuenta de aspirante
                </h2>
                <p className="text-xs sm:text-sm text-[#536B83] mt-1">
                  Ingresa tus datos personales y de contacto para asociar tu expediente y diagnóstico pedagógico.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Nombres <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Andrés"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Apellidos <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gómez Restrepo"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="docente@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Número de Celular / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 310 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                  />
                </div>
              </div>

              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#142D49] mb-1">
                      Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#142D49] mb-1">
                      Confirmar Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                    />
                  </div>
                </div>
              )}

              {/* Departamento y Municipio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Departamento de Residencia <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] cursor-pointer"
                  >
                    {Object.keys(COLOMBIA_DEPARTMENTS).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Municipio de Residencia <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] cursor-pointer"
                  >
                    {availableMunicipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consentimiento de Datos */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] text-[11px] text-[#536B83] cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataConsent}
                  onChange={(e) => setDataConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#0045E6] focus:ring-[#0045E6]"
                />
                <span>
                  Autorizo el tratamiento de mis datos personales de acuerdo con la <strong>Ley 1581 de 2012</strong> y las finalidades académicas de Legado Docente.
                </span>
              </label>

              {onSwitchToLogin && (
                <p className="text-center text-xs text-[#536B83] pt-2">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-[#0045E6] font-bold hover:underline"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              )}
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ETAPA 2: ASPIRACIÓN AL CONCURSO                               */}
          {/* ============================================================== */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#142D49]">
                  ¿A qué cargo deseas aspirar en el concurso docente?
                </h2>
                <p className="text-xs sm:text-sm text-[#536B83] mt-1">
                  Selecciona el cargo objetivo para adaptar las pruebas diagnósticas y temarios oficiales de la CNSC.
                </p>
              </div>

              {/* Tarjetas de cargo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'docente_aula', title: 'Docente de Aula', desc: 'Preescolar, Primaria, Secundaria y Media', icon: School },
                  { id: 'docente_orientador', title: 'Docente Orientador', desc: 'Convivencia, orientación y psicosocial', icon: Compass },
                  { id: 'coordinador', title: 'Coordinador', desc: 'Gestión académica y de convivencia', icon: Building },
                  { id: 'rector', title: 'Rector', desc: 'Dirección integral institucional', icon: Briefcase },
                  { id: 'director_rural', title: 'Director Rural', desc: 'Centros y sedes educativas rurales', icon: Building },
                  { id: 'orientacion_requerida', title: 'Necesito Orientación', desc: 'Aún no conozco los requisitos de cada cargo', icon: Target },
                ].map(({ id, title, desc, icon: Icon }) => {
                  const isSelected = targetRole === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTargetRole(id as TargetRole)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-2 border-[#0045E6] bg-[#0045E6]/5 shadow-sm'
                          : 'border-[#E5EDF5] bg-white hover:border-[#0045E6]/40 hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                        isSelected ? 'bg-[#0045E6] text-white' : 'bg-[#F3F8FD] text-[#0045E6]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="font-bold text-xs text-[#142D49]">{title}</p>
                      <p className="text-[10px] text-[#536B83] mt-0.5 line-clamp-2 leading-tight">{desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Condicional: Docente de aula */}
              {targetRole === 'docente_aula' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#142D49] mb-1.5">
                      ¿En qué nivel educativo deseas desempeñarte?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'preescolar', label: 'Preescolar' },
                        { id: 'primaria', label: 'Básica primaria' },
                        { id: 'secundaria', label: 'Básica secundaria' },
                        { id: 'media', label: 'Educación media' },
                        { id: 'no_sabe', label: 'Aún no lo sé' },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setEducationLevel(id as EducationLevelInterest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            educationLevel === id
                              ? 'bg-[#0045E6] text-white border-[#0045E6]'
                              : 'bg-white border-[#E5EDF5] text-[#536B83] hover:text-[#142D49]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#142D49] mb-1.5">
                      ¿En qué área deseas concursar?
                    </label>
                    <select
                      value={subjectArea}
                      onChange={(e) => setSubjectArea(e.target.value as SubjectArea)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] cursor-pointer"
                    >
                      <option value="matematicas">Matemáticas</option>
                      <option value="ciencias_naturales">Ciencias Naturales</option>
                      <option value="fisica">Física</option>
                      <option value="quimica">Química</option>
                      <option value="biologia">Biología</option>
                      <option value="ciencias_sociales">Ciencias Sociales</option>
                      <option value="historia">Historia</option>
                      <option value="geografia">Geografía</option>
                      <option value="lengua_castellana">Lengua Castellana / Humanidades</option>
                      <option value="ingles">Idioma Extranjero - Inglés</option>
                      <option value="tecnologia">Tecnología e Informática</option>
                      <option value="educacion_fisica">Educación Física, Recreación y Deportes</option>
                      <option value="educacion_artistica">Educación Artística</option>
                      <option value="primaria">Docente de Primaria (Todas las áreas)</option>
                      <option value="preescolar">Preescolar e Infancia</option>
                      <option value="otra">Otra / Aún no estoy seguro</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Condicional: Docente Orientador */}
              {targetRole === 'docente_orientador' && (
                <div className="p-4 rounded-2xl bg-[#0045E6]/5 border border-[#0045E6]/20 text-xs text-[#142D49] leading-relaxed">
                  <span className="font-bold text-[#0045E6] block mb-1">
                    Cargo de Docente Orientador:
                  </span>
                  Requiere formación profesional en Psicología, Trabajo Social, Psicopedagogía o carreras afines según el Manual Específico de Requisitos de la CNSC. No requiere experiencia pedagógica de aula obligatoria previa en el sector oficial.
                </div>
              )}

              {/* Condicional: Directivos (Coordinador, Rector, Director Rural) */}
              {['coordinador', 'rector', 'director_rural'].includes(targetRole) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#142D49] mb-1">
                        ¿En qué entorno institucional te interesa trabajar?
                      </label>
                      <select
                        value={mgmtEnvironment}
                        onChange={(e) => setMgmtEnvironment(e.target.value as InstitutionEnvironment)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        <option value="indiferente">Indiferente</option>
                        <option value="urbana">Institución Urbana</option>
                        <option value="rural">Institución Rural</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#142D49] mb-1">
                        ¿Años de experiencia en instituciones educativas?
                      </label>
                      <select
                        value={mgmtYears}
                        onChange={(e) => setMgmtYears(e.target.value as ManagementYears)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                      >
                        <option value="ninguno">Ninguno</option>
                        <option value="menos_2">Menos de 2 años</option>
                        <option value="2_4">Entre 2 y 4 años</option>
                        <option value="5_9">Entre 5 y 9 años</option>
                        <option value="10_mas">10 años o más</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#142D49] pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMgmtExperience}
                        onChange={(e) => setHasMgmtExperience(e.target.checked)}
                        className="rounded text-[#0045E6]"
                      />
                      <span>Tengo experiencia en cargos directivos educativos</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCoordFunctions}
                        onChange={(e) => setHasCoordFunctions(e.target.checked)}
                        className="rounded text-[#0045E6]"
                      />
                      <span>He desempeñado coordinación académica o de convivencia</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Tipo de proceso */}
              <div>
                <label className="block text-xs font-bold text-[#142D49] mb-1.5">
                  ¿Qué tipo de proceso de carrera te interesa?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ingreso', label: 'Ingreso al Magisterio' },
                    { id: 'ascenso', label: 'Ascenso en el Escalafón' },
                    { id: 'reubicacion', label: 'Reubicación Salarial' },
                    { id: 'directivos', label: 'Movilidad a Directivos' },
                    { id: 'desconoce', label: 'No conozco las opciones' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setProcessType(id as ProcessType)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        processType === id
                          ? 'bg-[#142D49] text-white border-[#142D49]'
                          : 'bg-white border-[#E5EDF5] text-[#536B83] hover:text-[#142D49]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ETAPA 3: FORMACIÓN ACADÉMICA                                  */}
          {/* ============================================================== */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#142D49]">
                  Formación académica y pedagógica
                </h2>
                <p className="text-xs sm:text-sm text-[#536B83] mt-1">
                  Registra tu nivel de estudios más alto y si cuentas con formación pedagógica reconocida.
                </p>
              </div>

              {/* Nivel más alto */}
              <div>
                <label className="block text-xs font-bold text-[#142D49] mb-1">
                  Nivel de formación más alto alcanzado <span className="text-rose-500">*</span>
                </label>
                <select
                  value={eduLevelHighest}
                  onChange={(e) => setEduLevelHighest(e.target.value as EducationLevelHighest)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] cursor-pointer"
                >
                  <option value="licenciado">Licenciado (Título de Licenciatura)</option>
                  <option value="profesional_no_licenciado">Profesional Universitario No Licenciado</option>
                  <option value="normalista_superior">Normalista Superior</option>
                  <option value="especialista">Especialista (Posgrado)</option>
                  <option value="magister">Magíster (Maestría)</option>
                  <option value="doctor">Doctor (Ph.D)</option>
                  <option value="tecnologo">Tecnólogo</option>
                  <option value="tecnico">Técnico Profesional</option>
                  <option value="estudiante_universitario">Estudiante Universitario (Últimos semestres)</option>
                  <option value="bachiller">Bachiller</option>
                </select>
              </div>

              {/* Título académico con sugerencias */}
              <div>
                <label className="block text-xs font-bold text-[#142D49] mb-1">
                  Título obtenido o programa académico <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Licenciatura en Matemáticas o Ingeniería de Sistemas"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  list="titles-datalist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none focus:border-[#0045E6] focus:ring-1 focus:ring-[#0045E6]"
                />
                <datalist id="titles-datalist">
                  {COMMON_ACADEMIC_TITLES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Universidad o Institución Educativa
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Universidad Pedagógica Nacional"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    Año de Graduación
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max="2030"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                  />
                </div>
              </div>

              {/* Formación pedagógica */}
              <div className="p-4 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] space-y-3">
                <label className="block text-xs font-bold text-[#142D49]">
                  ¿Tienes formación pedagógica formal?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'si', label: 'Sí, cuento con formación pedagógica' },
                    { id: 'no', label: 'No tengo formación pedagógica' },
                    { id: 'en_curso', label: 'Actualmente la estoy cursando' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPedagogicalTraining(id as PedagogicalTraining)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        pedagogicalTraining === id
                          ? 'bg-[#0045E6] text-white border-[#0045E6]'
                          : 'bg-white border-[#E5EDF5] text-[#536B83]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {pedagogicalTraining === 'si' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    <input
                      type="text"
                      placeholder="Tipo (Ej. Diplomado, Curso Pedagógico 12 créditos, etc.)"
                      value={pedagogyType}
                      onChange={(e) => setPedagogyType(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Institución que lo certifica"
                      value={pedagogyInstitution}
                      onChange={(e) => setPedagogyInstitution(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Estudios adicionales / Posgrados */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#142D49]">
                    Títulos adicionales o posgrados ({additionalDegrees.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddDegree(!showAddDegree)}
                    className="text-xs font-bold text-[#0045E6] flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar título adicional
                  </button>
                </div>

                {/* Lista de adicionales */}
                {additionalDegrees.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {additionalDegrees.map((deg) => (
                      <div
                        key={deg.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#142D49]">{deg.degree_name}</span>{' '}
                          <span className="text-[#536B83]">({deg.degree_type}) · {deg.institution} ({deg.graduation_year})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdditionalDegrees((prev) => prev.filter((d) => d.id !== deg.id))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario desplegable para agregar título */}
                {showAddDegree && (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#0045E6]/30 shadow-xs space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={newDegType}
                        onChange={(e) => setNewDegType(e.target.value as any)}
                        className="px-2.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs"
                      >
                        <option value="especializacion">Especialización</option>
                        <option value="maestria">Maestría</option>
                        <option value="doctorado">Doctorado</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Nombre del posgrado"
                        value={newDegName}
                        onChange={(e) => setNewDegName(e.target.value)}
                        className="px-2.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Universidad"
                        value={newDegInst}
                        onChange={(e) => setNewDegInst(e.target.value)}
                        className="px-2.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddDegree(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-[#536B83]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddDegree}
                        className="px-4 py-1.5 rounded-xl bg-[#0045E6] text-white text-xs font-bold"
                      >
                        Guardar título
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ETAPA 4: EXPERIENCIA PROFESIONAL Y DOCENTE                     */}
          {/* ============================================================== */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#142D49]">
                  Experiencia laboral, docente y directiva
                </h2>
                <p className="text-xs sm:text-sm text-[#536B83] mt-1">
                  Diferenciamos la experiencia docente de la experiencia laboral general conforme al Decreto 1278.
                </p>
              </div>

              {/* Experiencia laboral general */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D49]">¿Tienes experiencia laboral general previa?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasWorkExperience(true)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        hasWorkExperience ? 'bg-[#0045E6] text-white' : 'bg-white border text-[#536B83]'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasWorkExperience(false)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        !hasWorkExperience ? 'bg-[#0045E6] text-white' : 'bg-white border text-[#536B83]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {hasWorkExperience && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#536B83] mb-1">
                      Tiempo total de experiencia laboral:
                    </label>
                    <select
                      value={totalWorkExp}
                      onChange={(e) => setTotalWorkExp(e.target.value as WorkExperienceYears)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                    >
                      <option value="menos_1">Menos de 1 año</option>
                      <option value="1_2">1 a 2 años</option>
                      <option value="3_4">3 a 4 años</option>
                      <option value="5_9">5 a 9 años</option>
                      <option value="10_mas">10 años o más</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Experiencia Docente */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#0045E6]/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0045E6]">¿Has trabajado como docente de aula?</span>
                    <p className="text-[10px] text-[#536B83]">En colegios públicos, privados o universidades</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasTeachingExperience(true)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        hasTeachingExperience ? 'bg-[#0045E6] text-white' : 'bg-[#F8FAFC] border text-[#536B83]'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasTeachingExperience(false)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        !hasTeachingExperience ? 'bg-[#0045E6] text-white' : 'bg-[#F8FAFC] border text-[#536B83]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {hasTeachingExperience && (
                  <div className="space-y-3 pt-2 border-t border-[#E5EDF5]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#142D49] mb-1">
                          Tipo de institución docente:
                        </label>
                        <select
                          value={teachingInstType}
                          onChange={(e) => setTeachingInstType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        >
                          <option value="oficial">Institución Educativa Oficial (Pública)</option>
                          <option value="privada">Colegio Privado</option>
                          <option value="superior">Institución de Educación Superior (Universidad / Instituto)</option>
                          <option value="informal">Educación Informal / Clases Particulares</option>
                          <option value="otra">Otra</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#142D49] mb-1">
                          Años de experiencia docente:
                        </label>
                        <select
                          value={teachingExpYears}
                          onChange={(e) => setTeachingExpYears(e.target.value as WorkExperienceYears)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                        >
                          <option value="menos_1">Menos de 1 año</option>
                          <option value="1_2">1 a 2 años</option>
                          <option value="3_4">3 a 4 años</option>
                          <option value="5_9">5 a 9 años</option>
                          <option value="10_mas">10 años o más</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#142D49] mb-1.5">
                        Niveles educativos que has enseñado:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Preescolar', 'Básica primaria', 'Básica secundaria', 'Educación media', 'Superior'].map(
                          (lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => toggleTeachingLevel(lvl)}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                teachingLevels.includes(lvl)
                                  ? 'bg-[#0045E6] text-white border-[#0045E6]'
                                  : 'bg-[#F8FAFC] border-[#E5EDF5] text-[#536B83]'
                              }`}
                            >
                              {lvl}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Experiencia Directiva */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EDF5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D49]">
                    ¿Has desempeñado cargos directivos o de coordinación escolar?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasDirectorshipExp(true)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        hasDirectorshipExp ? 'bg-[#0045E6] text-white' : 'bg-white border text-[#536B83]'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasDirectorshipExp(false)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        !hasDirectorshipExp ? 'bg-[#0045E6] text-white' : 'bg-white border text-[#536B83]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {hasDirectorshipExp && (
                  <div className="pt-2 border-t border-[#E5EDF5] space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {['Coordinador', 'Rector', 'Director Rural', 'Director Académico', 'Otro'].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => toggleDirPosition(pos)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                            selectedDirPositions.includes(pos)
                              ? 'bg-[#142D49] text-white border-[#142D49]'
                              : 'bg-white border-[#E5EDF5] text-[#536B83]'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ETAPA 5: DIAGNÓSTICO Y NECESIDADES DE PREPARACIÓN            */}
          {/* ============================================================== */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#142D49]">
                  Diagnóstico y preferencias de estudio
                </h2>
                <p className="text-xs sm:text-sm text-[#536B83] mt-1">
                  Personalizamos tu ruta pedagógica según tu tiempo disponible y tus áreas de refuerzo prioritarias.
                </p>
              </div>

              {/* ¿Participación anterior? */}
              <div>
                <label className="block text-xs font-bold text-[#142D49] mb-1.5">
                  ¿Has participado anteriormente en un concurso docente de méritos?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'aprobo', label: 'Sí, participé y aprobé' },
                    { id: 'no_aprobo', label: 'Sí, participé pero no aprobé' },
                    { id: 'no_termino', label: 'Sí, pero no terminé el proceso' },
                    { id: 'primera_vez', label: 'No, sería mi primera vez' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPreviousExam(id as ExamHistory)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                        previousExam === id
                          ? 'bg-[#0045E6] text-white border-[#0045E6]'
                          : 'bg-[#F8FAFC] border-[#E5EDF5] text-[#536B83] hover:text-[#142D49]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificultades / Temas a reforzar (Múltiple) */}
              <div>
                <label className="block text-xs font-bold text-[#142D49] mb-1.5">
                  ¿Cuáles son tus principales temas o dificultades a reforzar? (Selecciona las que apliquen)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Competencias pedagógicas',
                    'Conocimientos específicos del área',
                    'Razonamiento lógico',
                    'Comprensión lectora',
                    'Legislación educativa',
                    'Constitución y normatividad',
                    'Competencias comportamentales',
                    'Gestión educativa y escolar',
                    'Liderazgo y administración',
                    'No sé qué debo estudiar',
                  ].map((topic) => {
                    const isSelected = difficultyTopics.includes(topic)
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleDifficultyTopic(topic)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#E5A83B]/15 text-[#C89228] border-[#E5A83B] font-bold'
                            : 'bg-white border-[#E5EDF5] text-[#536B83] hover:text-[#142D49]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{topic}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Tiempo disponible */}
                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    ¿Cuánto tiempo puedes dedicar a estudiar?
                  </label>
                  <select
                    value={studyTime}
                    onChange={(e) => setStudyTime(e.target.value as StudyTime)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                  >
                    <option value="menos_1h">Menos de 1 hora al día</option>
                    <option value="1_2h">Entre 1 y 2 horas al día</option>
                    <option value="2_3h">Entre 2 y 3 horas al día</option>
                    <option value="mas_3h">Más de 3 horas al día</option>
                    <option value="fines_de_semana">Principalmente los fines de semana</option>
                  </select>
                </div>

                {/* Objetivo */}
                <div>
                  <label className="block text-xs font-bold text-[#142D49] mb-1">
                    ¿Cuál es tu principal objetivo?
                  </label>
                  <select
                    value={preparationGoal}
                    onChange={(e) => setPreparationGoal(e.target.value as PreparationGoal)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EDF5] text-xs text-[#142D49] outline-none"
                  >
                    <option value="aprobar_concurso">Prepararme para aprobar el concurso</option>
                    <option value="conocer_requisitos">Conocer si cumplo los requisitos (VRM)</option>
                    <option value="fortalecer_conocimientos">Fortalecer mis conocimientos pedagógicos</option>
                    <option value="mejorar_perfil">Mejorar mi perfil académico y profesional</option>
                    <option value="cargo_directivo">Prepararme para un cargo directivo</option>
                    <option value="mejor_posicion">Obtener una mejor posición en la lista de elegibles</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ETAPA 6: PANTALLA FINAL: PERFIL DEL ASPIRANTE Y RUTA         */}
          {/* ============================================================== */}
          {step === 6 && finalProfile && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0045E6] to-[#E5A83B] text-white flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#142D49]">
                  ¡Tu perfil de aspirante está listo!
                </h2>
                <p className="text-xs sm:text-sm text-[#536B83] max-w-md mx-auto">
                  Hemos clasificado tu perfil conforme a la normativa oficial para el Concurso de Méritos Docente en Colombia.
                </p>
              </div>

              {/* Etiquetas automáticas de clasificación */}
              <div className="p-4 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] space-y-2.5">
                <span className="text-[11px] font-bold text-[#536B83] uppercase tracking-wider block">
                  Clasificación y Etiquetas del Aspirante
                </span>
                <div className="flex flex-wrap gap-2">
                  {finalProfile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white border border-[#E5EDF5] text-xs font-bold text-[#0045E6] shadow-2xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ficha Resumen del Perfil */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#E5EDF5]">
                  <div>
                    <span className="text-[#536B83]">Aspirante:</span>
                    <p className="font-bold text-[#142D49] text-sm">
                      {finalProfile.first_name} {finalProfile.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#536B83]">Cargo de Interés:</span>
                    <p className="font-bold text-[#0045E6] text-sm capitalize">
                      {finalProfile.target_role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[#536B83]">Ubicación:</span>
                    <p className="font-semibold text-[#142D49]">{finalProfile.municipality}, {finalProfile.department}</p>
                  </div>
                  <div>
                    <span className="text-[#536B83]">Formación:</span>
                    <p className="font-semibold text-[#142D49]">{finalProfile.professional_title || 'Profesional'}</p>
                  </div>
                  <div>
                    <span className="text-[#536B83]">Exp. Docente:</span>
                    <p className="font-semibold text-[#142D49]">
                      {finalProfile.has_teaching_experience ? 'Con experiencia docente' : 'Sin experiencia docente'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#536B83]">Tiempo de Estudio:</span>
                    <p className="font-semibold text-[#142D49]">{finalProfile.study_time}</p>
                  </div>
                </div>
              </div>

              {/* Sección: Tu Ruta de Preparación */}
              <div className="p-6 rounded-3xl bg-royal-depth text-white shadow-xl space-y-4 border-2 border-[#C99E32]">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gold-metallic text-[#1A1A1A] text-xs font-extrabold uppercase tracking-wider shadow-sm">
                    Tu Ruta de Preparación Recomendada
                  </span>
                </div>
                <div>
                  <h3 className="title-h1 text-xl sm:text-2xl font-extrabold text-white">
                    CURSO DE PREPARACIÓN INGRESO A LA CARRERA DOCENTE — 140 HORAS
                  </h3>
                  <p className="text-xs text-white/90 mt-1.5 leading-relaxed">
                    Legado Docente «Aprende, comparte, deja huella». 13 módulos completos (Módulo 0 al Módulo 12), simulacros tipo CNSC y fortalecimiento en tus áreas prioritarias.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      onSuccess?.()
                      onClose()
                    }}
                    className="flex-1 py-3 px-5 btn-gold-cta btn-gold-pill text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ingresar a mi Aula Virtual</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="py-3 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all border border-white/20 cursor-pointer"
                  >
                    Explorar el Catálogo
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Botones de navegación inferior (etapas 1 a 5) */}
          {step <= 5 && (
            <div className="mt-7 pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:text-[#0038DF] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="btn-gold-cta btn-gold-pill px-7 py-3 text-xs font-bold text-[#1A1A1A] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Guardando diagnóstico...</span>
                ) : step === 5 ? (
                  <>
                    <span>Finalizar y Ver Mi Perfil</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
