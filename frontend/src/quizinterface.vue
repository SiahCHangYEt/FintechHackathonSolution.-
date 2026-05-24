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
        <!-- API Status Indicator -->
        <div v-if="apiStatus" :class="['api-status', apiStatus.type]">
          {{ apiStatus.message }}
        </div>

        <!-- Loading indicator for AI personalization -->
        <div v-if="aiPersonalizing" class="ai-loading">
          <span class="loading-spinner"></span>
          Personalizing question with AI... 🎯
        </div>

        <div class="meta-tags">
          <span class="tag">{{ currentQuestion.subject || 'Math' }}</span>
          <span class="tag level">
            {{ currentQuestion.level ? `Level ${currentQuestion.level}` : 'General' }}
          </span>
        </div>
        
        <!-- Personalized Question Text -->
        <div class="problem-text mb-6" v-html="cleanText(aiPersonalizedQuestion || currentQuestion.problem, currentQuestion)"></div>

        <div class="input-container">
          <label class="input-label">Type your mathematical answer below:</label>
          <div class="math-input-wrapper">
            <div id="math-field-container" class="math-field-target"></div>
            <button @click="checkAnswer" class="submit-btn">Submit Answer</button>
          </div>
          <small class="hint-text">Tip: Use <code>/</code> for fractions, <code>^</code> for exponents, or click the keyboard icon inside the box.</small>
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

// Reactive Variable Footprints
const quizData = ref([]);
const currentIndex = ref(0);
const userAnswer = ref('');
const hasChecked = ref(false);
const isCorrect = ref(false);
const loading = ref(true);
const error = ref(null);
const aiPersonalizing = ref(false);
const apiStatus = ref(null);
let lastRequestTime = 0;

let mathVirtualField = null;
const aiPersonalizedQuestion = ref('');

const currentQuestion = computed(() => {
  return quizData.value.length > 0 ? quizData.value[currentIndex.value] : null;
});

// Check for API key
function checkApiKey() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    apiStatus.value = {
      type: 'warning',
      message: '⚠️ No OpenRouter API key found. Add VITE_OPENROUTER_API_KEY to your .env file for AI personalization'
    };
    return false;
  }
  apiStatus.value = {
    type: 'success',
    message: '✅ AI personalization active! Questions will be customized.'
  };
  return true;
}

// Simple fallback personalization (customize this to your needs)
function simplePersonalize(question, subject = 'math') {
  const prefixes = {
    'Math': ['📐 Math problem: ', '🧮 Calculation: ', '📊 Problem: '],
    'Algebra': ['🔤 Algebraic problem: ', '📐 Equation: ', '🔢 Algebra: '],
    'Calculus': ['∫ Calculus problem: ', '📈 Derivative: ', '🎯 Calculus: '],
    'Geometry': ['📐 Geometric problem: ', '🔺 Shape problem: ', '📏 Geometry: ']
  };
  
  const subjectLower = subject.toLowerCase();
  let prefixList = prefixes['Math'];
  
  for (const [key, list] of Object.entries(prefixes)) {
    if (subjectLower.includes(key.toLowerCase())) {
      prefixList = list;
      break;
    }
  }
  
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  return prefix + question;
}

// Rate limiting helper
async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 3000) {
    const waitTime = 3000 - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
}

// OpenRouter API personalization
async function personalizeWithAI(originalQuestion, subject, level) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return simplePersonalize(originalQuestion, subject);
  }
  
  const model = "meta-llama/llama-3.3-70b-instruct:free";
  let retryCount = 0;
  const maxRetries = 3;
  
  async function makeRequest() {
    try {
      await waitForRateLimit();
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Math Quiz with AI'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: `You are a math problem rewriter. Keep ALL numbers, equations, variables, and LaTeX exactly the same. Only change the context/story while maintaining mathematical difficulty. Return ONLY the rewritten question, no explanations.`
            },
            {
              role: "user",
              content: `Rewrite this ${subject} problem (level ${level}) to be more engaging while keeping all math identical:\n\n${originalQuestion}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });
      
      if (response.status === 429 && retryCount < maxRetries) {
        retryCount++;
        const waitTime = retryCount * 5000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return makeRequest();
      }
      
      if (!response.ok) {
        console.error(`API Error: ${response.status}`);
        return simplePersonalize(originalQuestion, subject);
      }
      
      const data = await response.json();
      const aiContent = data?.choices?.[0]?.message?.content;
      
      if (aiContent && aiContent.trim() && aiContent.length > 10) {
        return aiContent.trim().replace(/^["']|["']$/g, '');
      }
      
      return simplePersonalize(originalQuestion, subject);
      
    } catch (error) {
      console.error('AI Personalization error:', error);
      return simplePersonalize(originalQuestion, subject);
    }
  }
  
  return makeRequest();
}

// Personalize current question
async function personalizeCurrentQuestion() {
  if (!currentQuestion.value) return;
  
  aiPersonalizing.value = true;
  
  const originalText = currentQuestion.value.problem;
  const subject = currentQuestion.value.subject || 'Math';
  const level = currentQuestion.value.level || 'General';
  
  try {
    const personalized = await personalizeWithAI(originalText, subject, level);
    
    if (personalized && personalized.length > 10) {
      aiPersonalizedQuestion.value = personalized;
      if (apiStatus.value?.type !== 'warning') {
        apiStatus.value = { 
          type: 'success', 
          message: '✨ AI personalized this question!' 
        };
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          if (apiStatus.value?.type === 'success') {
            apiStatus.value = null;
          }
        }, 3000);
      }
    } else {
      aiPersonalizedQuestion.value = simplePersonalize(originalText, subject);
    }
  } catch (error) {
    console.error('Personalization failed:', error);
    aiPersonalizedQuestion.value = simplePersonalize(originalText, subject);
  } finally {
    aiPersonalizing.value = false;
    triggerMathJax();
  }
}

// Dynamic Programmatic MathLive Field Builder Interface
async function initMathField() {
  await nextTick();
  const container = document.getElementById('math-field-container');
  if (!container) return;

  container.innerHTML = '';

  mathVirtualField = document.createElement('math-field');
  mathVirtualField.setAttribute('id', 'math-input-field');
  mathVirtualField.setAttribute('placeholder', 'Click to type or use math panel...');
  mathVirtualField.value = userAnswer.value;
  mathVirtualField.mathVirtualKeyboardPolicy = "auto";

  mathVirtualField.addEventListener('input', (event) => {
    userAnswer.value = event.target.value.trim();
  });

  container.appendChild(mathVirtualField);
}

async function loadQuizData() {
  try {
    checkApiKey();
    
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
    
    await initMathField();
    await personalizeCurrentQuestion(); // AI personalization on load
    triggerMathJax();
  } catch (err) {
    console.error("Data load failure:", err);
    error.value = err.message;
    loading.value = false;
  }
}

function cleanText(text, questionObj = null) {
  if (!text) return '';

  let cleaned = text;

  const hasAsyBlock = cleaned.includes('[asy]');
  const hasOmittedText = cleaned.includes('(Vector diagram syntax omitted for clarity)');

  if ((hasAsyBlock || hasOmittedText) && questionObj) {
    let idStr = String(questionObj.unique_id || questionObj.id || '');
    let fileNumber = idStr.replace('.json', '').split('/').pop();
    
    let rawSubject = String(questionObj.subject || 'algebra').toLowerCase().trim();
    let subjectFolder = 'Algebra';

    if (rawSubject.includes('algebra')) subjectFolder = 'Algebra';
    if (rawSubject.includes('calc')) subjectFolder = 'Calculus';
    if (rawSubject.includes('geo')) subjectFolder = 'Geometry';
    if (rawSubject.includes('count') || rawSubject.includes('prob')) subjectFolder = 'Counting_and_Probability';
    if (rawSubject.includes('int') || rawSubject.includes('num')) subjectFolder = 'Number_Theory';
    if (rawSubject.includes('precalc')) subjectFolder = 'Precalculus';

    let splitDir = 'test';
    if (idStr.includes('train')) {
      splitDir = 'train';
    }

    const imageUrl = `https://raw.githubusercontent.com/hendrycks/math/main/vignettes/${splitDir}/${subjectFolder}/${fileNumber}.png`;

    const imageHtml = `
      <div class="my-4 flex justify-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <img src="${imageUrl}" alt="Math Diagram Illustration" class="max-h-[250px] object-contain invert brightness-200" 
             onerror="console.warn('Image not found:', this.src); this.parentElement.style.display='none';" />
      </div>
    `;

    if (hasAsyBlock) {
      cleaned = cleaned.replace(/\[asy\]([\s\S]*?)\[\/asy\]/g, imageHtml);
    } else {
      cleaned = cleaned.replace('(Vector diagram syntax omitted for clarity)', imageHtml);
    }
  } else {
    cleaned = cleaned.replace(/\[asy\]([\s\S]*?)\[\/asy\]/g, '');
    cleaned = cleaned.replace('(Vector diagram syntax omitted for clarity)', '');
  }

  cleaned = cleaned.replace(/\\n/g, ' ');
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

async function changeQuestion(direction) {
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
  
  await initMathField();
  await personalizeCurrentQuestion(); // Re-personalize for new question
  triggerMathJax();
}

async function triggerMathJax() {
  await nextTick();
  await nextTick();
  if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetClear();
    const target = document.getElementById('quiz-content');
    if (target) {
      window.MathJax.typesetPromise([target]).catch((err) => console.error("MathJax handling issue:", err));
    }
  }
}

onMounted(() => {
  loadQuizData();
});
</script>

<style scoped>
.quiz-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.card {
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.meta-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background-color: #334155;
  color: #cbd5e1;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
}

.tag.level {
  background-color: #312e81;
  color: #c7d2fe;
}

.problem-text {
  font-size: 1.15rem;
  line-height: 1.75;
}

.input-container {
  margin-top: 2rem;
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

.math-input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.math-field-target {
  flex: 1;
  display: flex;
}

.math-field-target :deep(math-field) {
  flex: 1;
  font-size: 1.25rem;
  background-color: #0f172a;
  color: #ffffff;
  border: 2px solid #475569;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  outline: none;
  width: 100%;
}

.math-field-target :deep(math-field:focus-within) {
  border-color: #6366f1;
}

.submit-btn {
  background-color: #4f46e5;
  color: white;
  padding: 0rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s;
  height: 48px;
}

.submit-btn:hover {
  background-color: #4338ca;
}

.hint-text {
  color: #64748b;
  font-size: 0.8rem;
}

.status-msg {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.error-text {
  color: #f87171;
}

/* AI Personalization Styles */
.api-status {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
  animation: slideDown 0.3s ease-out;
}

.api-status.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid #22c55e;
  color: #22c55e;
}

.api-status.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

.ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #a78bfa;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #334155;
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-box {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.tip-text {
  color: #64748b;
  font-size: 0.75rem;
}
</style>