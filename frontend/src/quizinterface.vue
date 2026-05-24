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

      <div v-else-if="currentQuestion" id="quiz-content">
        <div class="meta-tags">
          <span class="tag">{{ currentQuestion.subject || 'Math' }}</span>
          <span class="tag level">
            {{ currentQuestion.level ? `Level ${currentQuestion.level}` : 'General' }}
          </span>
        </div>
        
        <div class="problem-text mb-6" v-html="cleanText(currentQuestion.problem, currentQuestion)"></div>

        <div class="input-container">
          <label class="input-label">Type your mathematical answer below:</label>
          <div class="math-input-wrapper">
            <math-field 
              id="math-input-field"
              placeholder="e.g., p - q or \frac{a}{b}"
              @input="handleMathInput"
            ></math-field>
            
            <button @click="checkAnswer" class="submit-btn">Submit Answer</button>
          </div>
          <small class="hint-text">Tip: Use <code>/</code> for fractions, <code>^</code> for exponents, or use the virtual keyboard pop-up below.</small>
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

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

const JSON_URL = '/QuizBank.jsonl';

// State Management
const quizData = ref([]);
const currentIndex = ref(0);
const userAnswer = ref('');
const hasChecked = ref(false);
const isCorrect = ref(false);
const loading = ref(true);
const error = ref(null);

// Computed Properties
const currentQuestion = computed(() => {
  return quizData.value.length > 0 ? quizData.value[currentIndex.value] : null;
});

// Logic Methods
function handleMathInput(event) {
  userAnswer.value = event.target.value.trim();
}

async function loadQuizData() {
  try {
    const response = await fetch(JSON_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const rawText = await response.text();
    let parsedData = [];
    
    try {
      parsedData = JSON.parse(rawText.trim());
    } catch (e) {
      parsedData = rawText.trim().split('\n').map(line => JSON.parse(line));
    }

    if (parsedData.length === 0) throw new Error("The quiz file is empty.");
    
    quizData.value = parsedData;
    loading.value = false;
    triggerMathJax();
  } catch (err) {
    console.error("Failed to safely load data:", err);
    error.value = err.message;
    loading.value = false;
  }
}

// FIXED: Corrected the broken formatting brackets and regex processing loops
function cleanText(text, questionObj = null) {
  if (!text) return '';

  let cleaned = text;

  // Process and inject image elements if an Asymptote block layout pattern is encountered
  if (cleaned.includes('[asy]') && questionObj && questionObj.unique_id) {
    const pathClean = questionObj.unique_id.replace('.json', '');
    const imageUrl = `https://raw.githubusercontent.com/hendrycks/math/main/vignettes/${pathClean}.png`;

    const imageHtml = `
      <div class="my-4 flex justify-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <img src="${imageUrl}" alt="Math Diagram" class="max-h-[250px] object-contain invert brightness-200" onerror="this.parentElement.style.display='none';" />
      </div>
    `;
    cleaned = cleaned.replace(/\[asy\]([\s\S]*?)\[\/asy\]/g, imageHtml);
  } else {
    // If no context object is present, clear the code brackets entirely
    cleaned = cleaned.replace(/\[asy\]([\s\S]*?)\[\/asy\]/g, '');
  }

  // Sanitize double backslashes left by JSON formats so MathJax can render successfully
  cleaned = cleaned.replace(/\\\\/g, '\\');
  return cleaned;
}

function checkAnswer() {
  if (!currentQuestion.value) return;

  const studentAns = userAnswer.value.trim().toLowerCase();
  const correctAns = currentQuestion.value.answer.trim().toLowerCase();

  isCorrect.value = (studentAns === correctAns || studentAns.replace(/\s+/g, '') === correctAns.replace(/\s+/g, ''));
  hasChecked.value = true;
  
  triggerMathJax();
}

function changeQuestion(direction) {
  if (quizData.value.length === 0) return;
  
  userAnswer.value = '';
  hasChecked.value = false;
  isCorrect.value = false;

  let nextIndex = currentIndex.value + direction;
  if (nextIndex < 0) {
    nextIndex = quizData.value.length - 1;
  } else if (nextIndex >= quizData.value.length) {
    nextIndex = 0;
  }
  
  currentIndex.value = nextIndex;
  triggerMathJax();
}

async function triggerMathJax() {
  await nextTick();
  if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetClear();
    window.MathJax.typesetPromise().catch((err) => console.error("MathJax conversion halted:", err));
  }
}

onMounted(() => {
  loadQuizData();
});
</script>

<style scoped>
.input-container {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

math-field {
  flex: 1;
  font-size: 1.2rem;
  background-color: #0f172a;
  color: #ffffff;
  border: 2px solid #334155;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

math-field:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.math-input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.submit-btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s;
}
.submit-btn:hover {
  background-color: #4338ca;
}

.hint-text {
  color: #64748b;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
</style>