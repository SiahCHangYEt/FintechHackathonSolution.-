<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { addMathsSyllabusQuiz } from './constants/addMathsQuestions.js'

const props = defineProps({
  selectedSubject: { type: String, default: 'Additional Mathematics (Add Maths)' },
  selectedChapter: { type: String, default: 'Chapter 2: Quadratic Functions' },
  studentProfile: { type: Object, required: true }
})

const emit = defineEmits(['exit-quiz'])

// SPM KSSM Sample Evaluation Datasets Matrix
const questionsList = computed(() => {
  return addMathsSyllabusQuiz[props.selectedChapter] || [
    {
      id: 1,
      question: `Syllabus diagnostic template for ${props.selectedChapter}. Formulate questions inside constants catalog.`,
      options: ["Option Alpha", "Option Beta", "Option Gamma", "Option Delta"],
      correctAnswer: 0,
      explanation: "Syllabus file placeholder logic."
    }
  ]
})

const currentIndex = ref(0)
const selectedAnswer = ref(null)
const isAnswered = ref(false)
const correctCount = ref(0)
const quizFinished = ref(false)
const isSaving = ref(false)

const currentQuestion = computed(() => questionsList.value[currentIndex.value])

// ⚡ YOUR FIXED MATHJAX PARSER TRIGGER MODULE
const triggerMathJaxReparse = async () => {
  // Wait for Vue to fully update the HTML elements in the DOM first
  await nextTick()
  
  // If MathJax is fully loaded in the browser window, force a content sweep
  if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetPromise()
      .catch((err) => console.error('MathJax parsing failure:', err))
  }
}

// ⏳ Render initial LaTeX equations when component mounts
onMounted(() => {
  triggerMathJaxReparse()
})

const handleOptionClick = (index) => {
  if (isAnswered.value) return
  selectedAnswer.value = index
}

const checkAnswer = () => {
  if (selectedAnswer.value === null || isAnswered.value) return
  isAnswered.value = true
  if (selectedAnswer.value === currentQuestion.value.correctAnswer) {
    correctCount.value++
  }
  
  // ⚡ Reparse when explanation block drops into view
  triggerMathJaxReparse()
}

const advanceNextQuestion = async () => {
  if (currentIndex.value < questionsList.value.length - 1) {
    currentIndex.value++
    selectedAnswer.value = null
    isAnswered.value = false
    
    // ⚡ Reparse immediately when new text node updates inside DOM
    triggerMathJaxReparse()
  } else {
    quizFinished.value = true
    await dispatchQuizStats()
  }
}

const dispatchQuizStats = async () => {
  isSaving.value = true
  try {
    await fetch('http://127.0.0.1:5000/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: props.studentProfile.fullName || 'Siah Chang Yet',
        subjectName: props.selectedSubject,
        chapterName: props.selectedChapter,
        totalCorrect: correctCount.value,
        totalQuestions: questionsList.value.length
      })
    })
    console.log('Quiz metrics dispatched cleanly to Supabase instance cloud node.')
  } catch (err) {
    console.error('Failed syncing quiz tracking:', err)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto p-2">
    
    <div class="flex items-center justify-between border-b border-gray-800 pb-4">
      <div>
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>📝</span> SPM Assessment Engine
        </h2>
        <p class="text-xs text-gray-400 font-mono mt-0.5">{{ props.selectedSubject }} | {{ props.selectedChapter }}</p>
      </div>
      <button @click="emit('exit-quiz')" class="px-3 py-1.5 bg-gray-900 border border-gray-800 text-xs text-gray-400 hover:text-white rounded-xl transition-all">
        ✕ Quit Practice
      </button>
    </div>

    <div v-if="!quizFinished" class="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
      
      <div class="flex justify-between items-center text-xs font-mono text-gray-500">
        <span>QUESTION {{ currentIndex + 1 }} OF {{ questionsList.length }}</span>
        <span class="text-blue-400 font-bold">Accuracy Tracker: {{ correctCount }} Passed</span>
      </div>

      <div class="text-base font-medium text-gray-100 leading-relaxed bg-gray-950 p-5 rounded-xl border border-gray-800/60 font-mono">
        {{ currentQuestion.question }}
      </div>

      <div class="space-y-3">
        <div 
          v-for="(option, idx) in currentQuestion.options" 
          :key="idx"
          @click="handleOptionClick(idx)"
          :class="[
            'border p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between font-mono text-sm',
            selectedAnswer === idx ? 'border-blue-500 bg-blue-500/15 text-blue-300' : 'border-gray-800 bg-gray-950 text-gray-300 hover:border-gray-700',
            isAnswered && idx === currentQuestion.correctAnswer ? '!border-emerald-500 !bg-emerald-500/10 !text-emerald-400' : '',
            isAnswered && selectedAnswer === idx && selectedAnswer !== currentQuestion.correctAnswer ? '!border-rose-500 !bg-rose-500/10 !text-rose-400' : ''
          ]"
        >
          <span>{{ option }}</span>
          <div class="w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center text-[10px] font-bold">
            <span v-if="isAnswered && idx === currentQuestion.correctAnswer">✓</span>
            <span v-else-if="isAnswered && selectedAnswer === idx">✕</span>
            <span v-else>{{ String.fromCharCode(65 + idx) }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button 
          v-if="!isAnswered" 
          @click="checkAnswer" 
          :disabled="selectedAnswer === null"
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-white transition-all shadow-lg"
        >
          Verify Answer ✓
        </button>
        <button 
          v-else 
          @click="advanceNextQuestion"
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg text-center"
        >
          {{ currentIndex === questionsList.length - 1 ? 'Finish & Sync Result' : 'Next Question ➜' }}
        </button>
      </div>

      <div v-if="isAnswered" class="p-5 bg-gray-950 rounded-xl border border-gray-800 text-xs leading-relaxed text-gray-400 reveal">
        <span class="block text-gray-200 font-bold uppercase font-mono mb-1 tracking-wider text-[10px]" :class="selectedAnswer === currentQuestion.correctAnswer ? 'text-emerald-400' : 'text-rose-400'">
          {{ selectedAnswer === currentQuestion.correctAnswer ? 'Correct Solution Metrics:' : 'Incorrect. Remedial Review Framework:' }}
        </span>
        {{ currentQuestion.explanation }}
      </div>
    </div>

    <div v-else class="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl reveal">
      <div class="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto text-2xl">🏆</div>
      <div>
        <h3 class="text-2xl font-black text-white">Syllabus Evaluation Concluded!</h3>
        <p class="text-xs text-gray-400 mt-1">Your response profiles have been updated and synced into your database table cluster.</p>
      </div>

      <div class="max-w-xs mx-auto grid grid-cols-2 gap-3 font-mono text-xs border border-gray-800 p-4 rounded-xl bg-gray-950">
        <div class="text-left border-r border-gray-800/80 pr-2">
          <span class="block text-gray-500 font-bold">TOTAL SCORE:</span>
          <span class="text-lg font-black text-emerald-400">{{ Math.round((correctCount / questionsList.length) * 100) }}%</span>
        </div>
        <div class="text-left pl-2">
          <span class="block text-gray-500 font-bold">RAW RATING:</span>
          <span class="text-lg font-black text-gray-200">{{ correctCount }} / {{ questionsList.length }} Correct</span>
        </div>
      </div>

      <div class="pt-4 flex justify-center gap-3">
        <button @click="emit('exit-quiz')" class="px-5 py-2.5 bg-gray-900 border border-gray-800 hover:text-white text-gray-400 font-bold text-xs rounded-xl transition-all">
          Return to Dashboard
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.reveal { animation: flexFade 0.3s ease both; }
@keyframes flexFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>