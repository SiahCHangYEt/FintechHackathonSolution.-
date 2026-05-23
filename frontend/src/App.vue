<script setup>
import { ref } from 'vue'
import OnboardingForm from './form.vue' // 👈 1. Import your newly styled onboarding form
import SubjectDashboard from './components/SubjectDashboard.vue'
import SubjectChapters from './SubjectChapters.vue'
import AITutor from './AITutor.vue'

// 🏁 Rule: The application lifecycle begins strictly on the onboarding gate
const currentView = ref('onboarding') 

// Active global session state context parameters
const selectedSubjectName = ref('')
const selectedChapterName = ref('')

// Reactive Student Profile object shell to be filled dynamically by form.vue
const mockStudentProfile = ref({
  academicLevel: 'Form 5', 
  languagePreference: 'English', 
  stream: '', 
  selectedElectives: [],
  interests: []
})

// 🔄 Step 0 to Step 1: Onboarding completed callback handler
const handleOnboardingComplete = (formPayload) => {
  // Extract data from form.vue and map it to your main global app tracking shell
  mockStudentProfile.value = {
    fullName: formPayload.student,
    schoolName: formPayload.school,
    state: formPayload.state,
    academicLevel: `Form ${formPayload.formLevel || 5}`,
    languagePreference: formPayload.language === 'BM' ? 'Bahasa Melayu' : 'English',
    stream: formPayload.stream,
    selectedElectives: formPayload.electives,
    // Turn their specific selections into a single combined string array for Gemini to read
    interests: [formPayload.interests, ...formPayload.hobbies]
  }

  // Release the lock and move the user onto the active dashboard!
  currentView.value = 'dashboard'
}

// Step 1 to Step 2: Dashboard subject card selected tracking
const handleSubjectSelected = (subjectName) => {
  selectedSubjectName.value = subjectName
  currentView.value = 'chapters'
}

// Step 2 to Step 3: Chapter milestone card selected tracking
const handleChapterSelected = (payload) => {
  selectedSubjectName.value = payload.subject
  selectedChapterName.value = payload.chapter
  currentView.value = 'tutor'
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
              Welcome back, <span class="text-blue-400 font-bold">{{ mockStudentProfile.fullName }}</span> | Active Target Track Matrix
            </span>
            <span v-else-if="currentView === 'chapters'" class="flex items-center gap-2">
              <button @click="currentView = 'dashboard'" class="text-blue-400 hover:underline">📚 Dashboard</button> 
              <span>/ {{ selectedSubjectName }}</span>
            </span>
            <span v-else-if="currentView === 'tutor'" class="flex items-center gap-2">
              <button @click="currentView = 'dashboard'" class="text-blue-400 hover:underline">Home</button> /
              <button @click="currentView = 'chapters'" class="text-amber-400 hover:underline">{{ selectedSubjectName }}</button> 
              <span>/ {{ selectedChapterName }}</span>
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
          @select-chapter="handleChapterSelected" 
          :formLevel="mockStudentProfile.academicLevel" 
        />
        
        <AITutor 
          v-if="currentView === 'tutor'" 
          :selectedSubject="selectedSubjectName"
          :selectedChapter="selectedChapterName"
          :studentProfile="mockStudentProfile" 
        />
      </main>

    </div>
  </div>
</template>