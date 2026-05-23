<script setup>
import { ref } from 'vue'
import OnboardingForm from './form.vue' 
import SubjectDashboard from './components/SubjectDashboard.vue'
import SubjectChapters from './SubjectChapters.vue'
import AITutor from './AITutor.vue'
import QuizInterface from './quizinterface.vue' // 👈 1. Import your friend's quiz component page file

const currentView = ref('onboarding') 

const selectedSubjectName = ref('')
const selectedChapterName = ref('')

const mockStudentProfile = ref({
  academicLevel: 'Form 5', 
  languagePreference: 'English', 
  stream: '', 
  selectedElectives: [],
  interests: []
})

const handleOnboardingComplete = (formPayload) => {
  mockStudentProfile.value = {
    fullName: formPayload.student,
    schoolName: formPayload.school,
    state: formPayload.state,
    academicLevel: `Form ${formPayload.formLevel || 5}`,
    languagePreference: formPayload.language === 'BM' ? 'Bahasa Melayu' : 'English',
    stream: formPayload.stream,
    selectedElectives: formPayload.electives,
    interests: [formPayload.interests, ...formPayload.hobbies]
  }
  currentView.value = 'dashboard'
}

const handleSubjectSelected = (subjectName) => {
  selectedSubjectName.value = subjectName
  currentView.value = 'chapters'
}

const handleChapterSelected = (payload) => {
  selectedSubjectName.value = payload.subject
  selectedChapterName.value = payload.chapter
  currentView.value = 'tutor'
}

// ⚡ 2. New callback function to handle moving into the quiz view!
const handleQuizSelected = (payload) => {
  selectedSubjectName.value = payload.subject
  selectedChapterName.value = payload.chapter
  currentView.value = 'quiz' // Changes screen view state to quiz map interface!
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 relative">
    
    <OnboardingForm 
      v-if="currentView === 'onboarding'" 
      @onboarding-success="handleOnboardingComplete" 
    />

    <div v-else class="p-6 md:p-12 max-w-6xl mx-auto space-y-6">
      
      <header class="flex items-center justify-between pb-6 border-b border-gray-800">
        <div>
          <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Malaysia AI Edu Portal
          </h1>
          <p class="text-xs text-gray-400 mt-0.5 font-mono">
            <span v-if="currentView === 'dashboard'">
              Welcome back, <span class="text-blue-400 font-bold">{{ mockStudentProfile.fullName }}</span> | Core Track Matrix
            </span>
            <span v-else-if="currentView === 'chapters'" class="flex items-center gap-2">
              <button @click="currentView = 'dashboard'" class="text-blue-400 hover:underline">📚 Dashboard</button> 
              <span>/ {{ selectedSubjectName }}</span>
            </span>
            <span v-else-if="currentView === 'tutor' || currentView === 'quiz'" class="flex items-center gap-2">
              <button @click="currentView = 'dashboard'" class="text-blue-400 hover:underline">Home</button> /
              <button @click="currentView = 'chapters'" class="text-amber-400 hover:underline">{{ selectedSubjectName }}</button> 
              <span v-if="currentView === 'tutor'">/ 🧠 AI Tutor</span>
              <span v-if="currentView === 'quiz'">/ 📝 Active Quiz</span>
            </span>
          </p>
        </div>
      </header>

      <main class="mt-6">
        <SubjectDashboard 
          v-if="currentView === 'dashboard'" 
          :studentProfile="mockStudentProfile"
          @select-subject="handleSubjectSelected" 
        />
        
        <SubjectChapters 
          v-if="currentView === 'chapters'" 
          :subjectName="selectedSubjectName"
          :studentProfile="mockStudentProfile"
          :formLevel="mockStudentProfile.academicLevel"
          @select-chapter="handleChapterSelected" 
          @launch-quiz="handleQuizSelected" 
        />
        
        <AITutor 
          v-if="currentView === 'tutor'" 
          :selectedSubject="selectedSubjectName"
          :selectedChapter="selectedChapterName"
          :studentProfile="mockStudentProfile" 
        />

        <QuizInterface
          v-if="currentView === 'quiz'"
          :selectedSubject="selectedSubjectName"
          :selectedChapter="selectedChapterName"
          :studentProfile="mockStudentProfile"
          @exit-quiz="currentView = 'chapters'"
        />
      </main>

    </div>
  </div>
</template>