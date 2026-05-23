<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 🎯 1. Explicitly Initialize Reactive State Holders
const studentProfile = ref({
  academicLevel: 'Form 5',
  languagePreference: 'English',
  stream: 'sains',
  selectedElectives: ['addmath', 'physics', 'chemistry', 'compsci']
  
})

const completedChaptersLog = ref({})
const isLoading = ref(true)

// Static Curriculum Map Configuration Database
const coreSubjectsDB = [
  { id: 'bm', name: 'Bahasa Melayu', chapters: 6, category: 'core' },
  { id: 'bi', name: 'English', chapters: 8, category: 'core' },
  { id: 'math', name: 'Mathematics (Matematik)', chapters: 10, category: 'core' },
  { id: 'science', name: 'Science (Sains)', chapters: 12, category: 'core' },
  { id: 'history', name: 'Sejarah', chapters: 10, category: 'core' },
  { id: 'islamic_moral', name: 'Pendidikan Islam / Moral', chapters: 7, category: 'core' }
]

const electiveSubjectsDB = {
  sains: [
    { id: 'addmath', name: 'Additional Mathematics', chapters: 10, category: 'elective' },
    { id: 'physics', name: 'Physics (Fizik)', chapters: 7, category: 'elective' },
    { id: 'chemistry', name: 'Chemistry (Kimia)', chapters: 8, category: 'elective' },
    { id: 'biology', name: 'Biology (Biologi)', chapters: 9, category: 'elective' },
    { id: 'compsci', name: 'Computer Science', chapters: 5, category: 'elective' }
  ],
  sastera: [
    { id: 'accounts', name: 'Principles of Accounting', chapters: 8, category: 'elective' },
    { id: 'economics', name: 'Economics (Ekonomi)', chapters: 6, category: 'elective' },
    { id: 'business', name: 'Business Studies', chapters: 7, category: 'elective' },
    { id: 'art', name: 'Visual Arts Education', chapters: 10, category: 'elective' }
  ]
}

// 🎯 2. API Pipeline Integration Hook
const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    const testUserId = 'a4b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d'
    
    const response = await axios.get(`http://127.0.0.1:5000/api/student/${testUserId}/dashboard`)
    
    if (response.data) {
      studentProfile.value = response.data.studentProfile
      completedChaptersLog.value = response.data.completedChaptersLog
    }
  } catch (err) {
    console.error('Frontend Fetch API Failure Error:', err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

// 🎯 3. Standardized Business Logic Metric Calculators
const activeSubjects = computed(() => {
  const list = [...coreSubjectsDB]
  const isUpper = ['Form 4', 'Form 5'].includes(studentProfile.value.academicLevel)
  
  if (isUpper && studentProfile.value.stream) {
    const streamElectives = electiveSubjectsDB[studentProfile.value.stream] || []
    const chosenElectives = streamElectives.filter(sub => 
      studentProfile.value.selectedElectives.includes(sub.id)
    )
    return [...list, ...chosenElectives]
  }
  return list
})

const totalActiveChapters = computed(() => {
  return activeSubjects.value.reduce((acc, sub) => acc + sub.chapters, 0)
})

const totalCompletedChapters = computed(() => {
  return activeSubjects.value.reduce((acc, sub) => {
    return acc + (completedChaptersLog.value[sub.id] || 0)
  }, 0)
})

const overallProgressPercentage = computed(() => {
  if (totalActiveChapters.value === 0) return 0
  return Math.round((totalCompletedChapters.value / totalActiveChapters.value) * 100)
})

const getSubjectProgress = (subject) => {
  const done = completedChaptersLog.value[subject.id] || 0
  const total = subject.chapters
  return { done, total, percent: Math.round((done / total) * 100) }
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center py-12 flex flex-col items-center gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="text-xs text-gray-400">Syncing curriculum maps from Supabase cloud ledger...</p>
    </div>

    <div v-else class="space-y-8">
      
      <div class="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-700/50 rounded-2xl p-6 shadow-xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <span class="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full uppercase border border-blue-500/30">
              {{ studentProfile.academicLevel }} Layout
            </span>
            <h2 class="text-xl font-bold mt-2 text-white">Academic Progress Tracker</h2>
            <p class="text-xs text-gray-400 mt-1">
              Instruction Language Mode: <span class="text-gray-200 font-medium">{{ studentProfile.languagePreference }}</span>
              <span v-if="studentProfile.stream"> | Stream: <span class="text-gray-200 font-medium capitalize">{{ studentProfile.stream }}</span></span>
            </p>
          </div>

          <div class="flex items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700/50">
            <div class="text-right">
              <span class="block text-xs text-gray-400">Total Curriculum Done</span>
              <span class="text-sm font-semibold text-gray-200">{{ totalCompletedChapters }} / {{ totalActiveChapters }} Chapters</span>
            </div>
            <div class="text-3xl font-extrabold text-blue-400 border-l border-gray-700 pl-4">
              {{ overallProgressPercentage }}%
            </div>
          </div>

        </div> 

        <div class="w-full bg-gray-900 rounded-full h-2 mt-5 overflow-hidden border border-gray-800">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: overallProgressPercentage + '%' }"></div>
        </div>   
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
          <span>📚</span> Active Course Subjects
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="subject in activeSubjects"
            :key="subject.id"
            class="bg-gray-800 border border-gray-700/70 hover:border-gray-600 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all hover:-translate-y-0.5"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider', 
                  subject.category === 'core' ? 'bg-gray-700 text-gray-300' : 'bg-purple-950 text-purple-300 border border-purple-800/50']">
                  {{ subject.category }}
                </span>
                <span class="text-xs text-gray-400 font-medium">
                  {{ getSubjectProgress(subject).done }}/{{ subject.chapters }} Ch.
                </span>
              </div>
              <h4 class="text-base font-bold text-gray-100 line-clamp-1">{{ subject.name }}</h4>
            </div>

            <div class="mt-4 pt-2">
              <div class="flex justify-between items-center mb-1.5 text-xs text-gray-400">
                <span>Chapter Coverage</span>
                <span class="font-semibold text-gray-200">{{ getSubjectProgress(subject).percent }}%</span>
              </div>
              <div class="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  :class="['h-1.5 rounded-full transition-all duration-300', getSubjectProgress(subject).percent === 100 ? 'bg-emerald-500' : 'bg-blue-500']" 
                  :style="{ width: getSubjectProgress(subject).percent + '%' }"
                ></div>
              </div>
            </div>

          </div>
        </div> 
      </div>
    </div>
  </div>
</template>