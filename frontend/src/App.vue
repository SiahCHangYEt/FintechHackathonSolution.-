<script setup>
import { ref } from 'vue'
import SubjectDashboard from './components/SubjectDashboard.vue'

// 🎯 HARDCODED PROFILE MODE: Change these values to test different layout combinations!
const mockStudentProfile = ref({
  academicLevel: 'Form 5', // Try: 'Form 3', 'Form 4', 'Form 5'
  languagePreference: 'English', // Try: 'English', 'Bahasa Melayu'
  stream: 'sains', // Try: 'sains', 'sastera', or leave '' for lower secondary
  selectedElectives: ['addmath', 'physics', 'chemistry','compsci'] // Add/remove IDs to see the grid adapt
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Isolation Workspace Banner Badge -->
      <div class="flex items-center justify-between border border-amber-500/30 bg-amber-500/10 rounded-xl px-4 py-2.5 text-xs text-amber-400">
        <div class="flex items-center gap-2">
          <span class="animate-pulse h-2 w-2 rounded-full bg-amber-400"></span>
          <span><strong>Component Sandbox Mode:</strong> Bypassing entry form registration to expedite UI assembly line routing.</span>
        </div>
        <span class="hidden md:inline font-mono text-[10px] bg-gray-900 px-2 py-0.5 rounded text-gray-400 border border-gray-800">
          State: Simulated Sandbox Profile
        </span>
      </div>

      <!-- App Header Bar -->
      <header class="flex items-center justify-between pb-6 border-b border-gray-800">
        <div>
          <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Malaysia AI Edu Portal
          </h1>
          <p class="text-xs text-gray-400 mt-0.5">Core student profile analytical telemetry.</p>
        </div>
      </header>

      <!-- Mount the Child Subject Dashboard Directly -->
      <main class="mt-6">
        <SubjectDashboard :studentProfile="mockStudentProfile" />
      </main>

    </div>
  </div>
</template>