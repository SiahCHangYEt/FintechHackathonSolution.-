<template>
  <div class="quiz-container">
    <div class="card tex2jax_process">
      <div v-if="loading" class="status-msg">
        Fetching quiz data...
      </div>

      <div v-else-if="error" class="status-msg error-text">
        <span class="error-title">Failed to load questions:</span><br>
        {{ error }}
        <br><br>
        <small class="tip-text">
          Tip: Make sure QuizBank.jsonl is inside your "public" folder if it's not being found.
        </small>
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

        <div 
          v-if="hasChecked" 
          :class="['feedback-box mt-6 p-4 rounded-xl border', isCorrect ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200' : 'bg-rose-950/30 border-rose-800 text-rose-200']"
        >
          <div v-if="isCorrect" class="mb-3">
            <strong>✨ Correct!</strong> Your answer matches perfectly.
          </div>
          <div v-else class="mb-3">
            <strong>Keep Trying!</strong><br>
            Expected notation: <code class="bg-slate-900 px-2 py-0.5 rounded text-white">{{ currentQuestion.answer }}</code>
          </div>

          <div class="solution-section border-t border-slate-800/60 pt-3 mt-3">
            <strong class="text-indigo-400 block mb-2">Step-by-Step Solution:</strong>
            <div v-html="cleanText(currentQuestion.solution, currentQuestion)" class="text-slate-300 leading-relaxed"></div>
          </div>
        </div>

        <div class="nav-buttons flex gap-4 mt-6">
          <button @click="changeQuestion(-1)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">← Previous</button>
          <button @click="changeQuestion(1)" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">Next →</button>
        </div>
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