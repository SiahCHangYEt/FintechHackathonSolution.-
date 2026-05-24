<template>
  <div class="min-h-screen bg-gray-950 bg-grid flex items-center justify-center p-4 text-gray-100 relative overflow-hidden">

    <div class="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
         style="background: radial-gradient(circle, #3b82f6, transparent 70%); transform: translate(30%, -30%);"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
         style="background: radial-gradient(circle, #8b5cf6, transparent 70%); transform: translate(-30%, 30%);"></div>

    <div class="w-full max-w-2xl relative z-10">

      <div class="text-center mb-8 reveal">
        <div class="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20 mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Student Profile Onboarding
        </div>
        <h1 class="serif text-4xl text-white font-black mb-2">Build Your Student Profile</h1>
        <p class="text-gray-400 text-sm">Provide your curriculum targets, personal details, and interests to synchronize the AI Core</p>
      </div>

      <div class="mb-6">
        <div class="flex justify-between text-xs text-gray-400 mb-2 font-mono">
          <span>{{ currentStep <= TOTAL_STEPS ? `STEP ${currentStep} OF ${TOTAL_STEPS}` : 'ONBOARDING COMPLETE' }}</span>
          <span class="font-bold text-blue-400">{{ progressPct }}%</span>
        </div>
        <div class="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div class="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 progress-bar" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="flex justify-center gap-2 mt-3">
          <div v-for="s in TOTAL_STEPS" :key="s"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="s < currentStep ? 'w-6 bg-blue-500' : s === currentStep ? 'w-6 bg-blue-500 opacity-50' : 'w-2 bg-gray-800'">
          </div>
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800/80 overflow-hidden backdrop-blur-md bg-opacity-70">

        <div v-if="currentStep === 1" class="p-8 reveal">
          <div class="flex items-center gap-4 mb-6">
            <div class="step-badge bg-blue-500/10 text-blue-400 border border-blue-500/20">1</div>
            <div>
              <h2 class="serif text-2xl text-white font-bold">Academic Level</h2>
              <p class="text-gray-400 text-sm">Which secondary block class form are you currently registered in?</p>
            </div>
          </div>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div v-for="n in 5" :key="n" class="pill-option filter-blue">
              <input type="radio" :id="'form'+n" :value="n" v-model="formLevel">
              <label :for="'form'+n" class="flex-col py-4 gap-1">
                <span class="text-xl font-black text-gray-100">{{ n }}</span>
                <span class="text-[10px] uppercase font-mono text-gray-400">Form {{ n }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end mt-8">
            <button @click="currentStep = 2" :disabled="!formLevel" class="btn-next bg-blue-600 hover:bg-blue-500">Next Step ➜</button>
          </div>
        </div>

        <div v-if="currentStep === 2" class="p-8 reveal">
          <div class="flex items-center gap-4 mb-6">
            <div class="step-badge bg-amber-500/10 text-amber-400 border border-amber-500/20">2</div>
            <div>
              <h2 class="serif text-2xl text-white font-bold">Language Preference</h2>
              <p class="text-gray-400 text-sm">Select targeted instruction delivery text styles for Math &amp; Science</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="pill-option filter-amber">
              <input type="radio" id="lang-bm" value="BM" v-model="language">
              <label for="lang-bm" class="flex-col gap-2 py-5">
                <span class="text-2xl">🇲🇾</span>
                <span class="font-bold text-gray-200">Bahasa Melayu</span>
              </label>
            </div>
            <div class="pill-option filter-amber">
              <input type="radio" id="lang-en" value="EN" v-model="language">
              <label for="lang-en" class="flex-col gap-2 py-5">
                <span class="text-2xl">🇬🇧</span>
                <span class="font-bold text-gray-200">English Mode</span>
              </label>
            </div>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 1" class="btn-back">⬅ Back</button>
            <button @click="handleStep2Next" :disabled="!language" class="btn-next bg-amber-600 hover:bg-amber-500">Next Step ➜</button>
          </div>
        </div>

        <div v-if="currentStep === 3" class="p-8 reveal">
          <div class="flex items-center gap-4 mb-6">
            <div class="step-badge bg-rose-500/10 text-rose-400 border border-rose-500/20">3</div>
            <div>
              <h2 class="serif text-2xl text-white font-bold">Target Stream Track</h2>
              <p class="text-gray-400 text-sm">Select the structural curriculum path you plan to enter</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="stream-card filter-rose">
              <input type="radio" id="stream-sains" value="sains" v-model="stream">
              <label for="stream-sains" class="font-bold text-gray-200 text-sm">🔬 Sains Track</label>
            </div>
            <div class="stream-card filter-rose">
              <input type="radio" id="stream-sastera" value="sastera" v-model="stream">
              <label for="stream-sastera" class="font-bold text-gray-200 text-sm">📚 Sastera Track</label>
            </div>
          </div>
          
          <div v-if="stream" class="reveal border-t border-gray-800 pt-5 mt-5">
            <p class="section-label">Requested Elective Course Modules</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div v-for="subj in currentElectives" :key="subj" class="elective-check filter-rose-check">
                <input type="checkbox" :id="'elec-'+subj" :value="subj" v-model="selectedElectives">
                <label :for="'elec-'+subj" class="text-gray-300 font-medium text-xs">{{ subj }}</label>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 2" class="btn-back">⬅ Back</button>
            <button @click="currentStep = 4" :disabled="!canProceedStep3" class="btn-next bg-rose-600 hover:bg-rose-500">Next Step ➜</button>
          </div>
        </div>

        <div v-if="currentStep === 4" class="p-8 reveal">
          <div class="flex items-center gap-4 mb-6">
            <div class="step-badge bg-sky-500/10 text-sky-400 border border-sky-500/20">4</div>
            <div>
              <h2 class="serif text-2xl text-white font-bold">Personal Information</h2>
              <p class="text-gray-400 text-sm">Please provide your verified institutional tracking metrics</p>
            </div>
          </div>
          <div class="space-y-4">
            <input type="text" v-model="personal.fullName" placeholder="Full Student Name" class="field-input" />
            <input type="text" v-model="personal.schoolName" placeholder="Current Registered School Name" class="field-input" />
            <div class="relative">
              <select v-model="personal.state" class="field-select">
                <option value="" disabled>Select Location State</option>
                <option v-for="s in malaysianStates" :key="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="handleStep4Back" class="btn-back">⬅ Back</button>
            <button @click="currentStep = 5" :disabled="!canProceedStep4" class="btn-next bg-sky-600 hover:bg-sky-500">Next Step ➜</button>
          </div>
        </div>

        <div v-if="currentStep === 5" class="p-8 reveal">
          <div class="flex items-center gap-4 mb-6">
            <div class="step-badge bg-purple-500/10 text-purple-400 border border-purple-500/20">5</div>
            <div>
              <h2 class="serif text-2xl text-white font-bold">Academic Justification Statement</h2>
              <p class="text-gray-400 text-sm">Provide system-wide data argument texts regarding module adjustments</p>
            </div>
          </div>
          <div class="space-y-4">
            <select v-model="academic.appealReason" class="field-select">
              <option value="" disabled>What is the bottleneck you face in learning?</option>
              <option>Unable to concentrate</option>
              <option>Constantly procastinate</option>
              <option>Unable to memorize key knowledges</option>
              <option>Unable to score in exam</option>
            </select>
            <textarea v-model="academic.appealText" rows="4" placeholder="Enter appeal description justification arguments..." class="field-input resize-none pt-3"></textarea>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 4" class="btn-back">⬅ Back</button>
            <button @click="currentStep = 6" :disabled="!canProceedStep5" class="btn-next bg-purple-600 hover:bg-purple-500">Next Step ➜</button>
          </div>
        </div>

        <div v-if="currentStep === 6" class="p-8 reveal">
          <div class="flex items-center gap-4 mb-6">
            <div class="step-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">6</div>
            <div>
              <h2 class="serif text-2xl text-white font-bold">Hobbies &amp; Interests Context</h2>
              <p class="text-gray-400 text-sm">This syncs the Gemini core parser with what you love outside the classroom</p>
            </div>
          </div>

          <div class="space-y-6">
            <div class="field-group">
              <label class="field-label text-gray-300"><span class="text-lg">🚀</span> Primary Analytical Area of Interest</label>
              <div class="grid grid-cols-2 gap-3 mt-1">
                <div v-for="interest in interestOptions" :key="interest.value" class="stream-card filter-emerald">
                  <input type="radio" :id="'int-'+interest.value" :value="interest.value" v-model="lifestyle.primaryInterest">
                  <label :for="'int-'+interest.value">
                    <span class="text-2xl mb-1">{{ interest.icon }}</span>
                    <span class="font-bold text-xs text-gray-200 block mt-1">{{ interest.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="field-group border-t border-gray-800 pt-4 mt-4">
              <label class="field-label text-gray-300"><span class="text-lg">⚽</span> Personal Active Hobbies &amp; Activities</label>
              <div class="grid grid-cols-2 gap-2 mt-1">
                <div v-for="hobby in hobbyOptions" :key="hobby" class="elective-check filter-emerald-check">
                  <input type="checkbox" :id="'hobby-'+hobby" :value="hobby" v-model="lifestyle.selectedHobbies">
                  <label :for="'hobby-'+hobby" class="text-xs font-semibold text-gray-300">{{ hobby }}</label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8">
            <button @click="currentStep = 5" :disabled="isSubmitting" class="btn-back">⬅ Back</button>
            <button 
              @click="submitForm" 
              :disabled="!canSubmit || isSubmitting" 
              class="btn-next bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 font-bold"
            >
              {{ isSubmitting ? 'Syncing Learning Core...' : 'Submit Profile Data 🚀' }}
            </button>
          </div>
        </div>

        <div v-if="currentStep === 7" class="p-8 reveal text-center">
          <div class="mb-6">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-2xl font-black">✓</div>
            <h2 class="serif text-3xl text-white font-black mb-1">Application Dispatched!</h2>
            <p class="text-xs text-gray-400">Telemetry handshake verified across backend framework router targets.</p>
          </div>
          <div class="space-y-3 text-left text-xs bg-gray-950 border border-gray-800 p-5 rounded-xl font-mono text-gray-300">
            <p><span class="text-gray-500">STUDENT_NAME:</span> <span class="text-gray-100 font-bold">{{ personal.fullName }}</span></p>
            <p><span class="text-gray-500">TARGET_STREAM:</span> <span class="text-rose-400 font-bold capitalize">{{ stream || 'General Lower Secondary' }}</span></p>
            <p><span class="text-gray-500">PRIMARY_CORE:</span> <span class="text-blue-400 font-bold uppercase">{{ lifestyle.primaryInterest }}</span></p>
            <p><span class="text-gray-500">AI_INTEREST_LOGS:</span> <span class="text-purple-400 font-bold">{{ lifestyle.selectedHobbies.join(', ') || 'None' }}</span></p>
          </div>
          <div class="mt-6">
            <button @click="resetForm" class="text-blue-400 text-xs hover:underline cursor-pointer">Re-register System Profile</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'

// 🏁 FIXED: Declare compiler emits macro explicitly at the top-level scope!
const emit = defineEmits(['onboarding-success'])

const BACKEND_URL = 'http://127.0.0.1:5000'
const TOTAL_STEPS = 6

const currentStep = ref(1) 
const formLevel   = ref(null) 
const language    = ref('')
const stream      = ref('')
const isSubmitting = ref(false)
const selectedElectives = ref(['Additional Mathematics (Add Maths)', 'Physics (Fizik)', 'Chemistry (Kimia)', 'Biology (Biologi)'])

const personal = reactive({
  fullName:   '', 
  schoolName: '',
  state: 'Selangor',
  gender: '',
})

const academic = reactive({
  appealReason:  'Stream Re-assignment',
  targetSubject: 'Additional Mathematics',
  appealText:    'Formally establishing AI data interface telemetry paths matching KSSM computational models.',
})

const lifestyle = reactive({
  primaryInterest: 'tech',
  selectedHobbies: ['Coding', 'Gaming']
})

const electivesList = {
  sains:   ['Physics (Fizik)', 'Chemistry (Kimia)', 'Biology (Biologi)', 'Additional Mathematics (Add Maths)'],
  sastera: ['Economics (Ekonomi)', 'Accounting (Perakaunan)', 'Business Studies (Perniagaan)']
}

const malaysianStates = ['Selangor', 'Johor', 'Penang', 'Sabah', 'Sarawak', 'Kuala Lumpur','Kedah','Perlis','Pahang','Kelantan','Terengganu','Putrajaya',]
const hobbyOptions = [
  'Coding', 'Gaming', 'Mobile App Dev', 'Robotics building',
  'Chess', 'Mathematics Puzzles', 'Reading Sci-Fi', 'Creative Writing',
  'Drawing/Animation', 'Music/Instrument', 'Photography', 'Video Editing',
  'Football', 'Badminton', 'Basketball', 'Athletics'
]

const interestOptions = [
  { value: 'tech',       label: 'Computer Science & AI', icon: '💻' },
  { value: 'robotics',   label: 'Robotics & Engineering',icon: '🤖' },
  { value: 'sciences',   label: 'Pure & Research Sciences',icon: '🧪' },
  { value: 'medical',    label: 'Medical & Healthcare',  icon: '🩺' },
  { value: 'finance',    label: 'Fintech & Economics',   icon: '📈' },
  { value: 'arts',       label: 'Creative & Digital Arts',icon: '🎨' },
  { value: 'literature', label: 'Literature & Languages',icon: '📚' },
  { value: 'law',        label: 'Law & Social Sciences', icon: '⚖️' }
]

// 🛠️ KSSM Lower Secondary Skipper Mechanics
const isLowerSecondary = computed(() => formLevel.value >= 1 && formLevel.value <= 3)

const handleStep2Next = () => {
  if (isLowerSecondary.value) {
    stream.value = 'General Lower Secondary'
    selectedElectives.value = ['Core Mathematics', 'Sains Am']
    currentStep.value = 4 // Bypass Step 3 stream choice entirely!
  } else {
    currentStep.value = 3
  }
}

const handleStep4Back = () => {
  if (isLowerSecondary.value) {
    currentStep.value = 2 // Go back straight to Language choice
  } else {
    currentStep.value = 3
  }
}

const currentElectives = computed(() => stream.value && electivesList[stream.value] ? electivesList[stream.value] : [])
const progressPct = computed(() => Math.round((Math.min(currentStep.value, TOTAL_STEPS) / TOTAL_STEPS) * 100))

const canProceedStep3 = computed(() => isLowerSecondary.value || (!!stream.value && selectedElectives.value.length > 0))
const canProceedStep4 = computed(() => !!personal.fullName && !!personal.schoolName && !!personal.state)
const canProceedStep5 = computed(() => !!academic.appealReason && !!academic.appealText.trim())
const canSubmit       = computed(() => true)

watch(stream, () => { 
  if (!isLowerSecondary.value && stream.value !== 'General Lower Secondary') selectedElectives.value = [] 
})

async function submitForm() {
  isSubmitting.value = true
  try {
    await fetch(`${BACKEND_URL}/api/my-new-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: personal.fullName,
        school: personal.schoolName,
        state: personal.state,
        stream: stream.value,
        electives: selectedElectives.value,
        interests: lifestyle.primaryInterest,
        hobbies: lifestyle.selectedHobbies
      })
    })

    const aiResponse = await fetch(`${BACKEND_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `A student named ${personal.fullName} from ${personal.schoolName} who likes ${lifestyle.primaryInterest} and matches hobbies ${lifestyle.selectedHobbies.join(', ')} just onboarded. Give them a short, 2-sentence encouraging welcome statement.`
      })
    })
    
    const aiData = await aiResponse.json()
    if (aiData.success) {
       console.log('Gemini Welcome Handshake:', aiData.reply)
    }

    // ⚡ Trigger screen shift to dashboard inside App.vue!
    emit('onboarding-success', {
      student: personal.fullName,
      school: personal.schoolName,
      state: personal.state,
      formLevel: formLevel.value,
      language: language.value,
      stream: stream.value,
      electives: selectedElectives.value,
      interests: lifestyle.primaryInterest,
      hobbies: lifestyle.selectedHobbies
    })

    currentStep.value = 7
  } catch (error) {
    console.error('Handshake failed across gateway framework:', error)
    alert('Failed to connect to backend server proxy.')
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() { 
  currentStep.value = 1 
  Object.assign(lifestyle, { primaryInterest: '', selectedHobbies: [] })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
body { font-family: 'DM Sans', sans-serif; }

.bg-grid { 
  background-image: linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px); 
  background-size: 40px 40px; 
}

.step-badge { width:2.5rem; height:2.5rem; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.125rem; }
.section-label { font-size:0.75rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#94a3b8; margin-bottom:0.75rem; display:block; font-family: monospace; }

.btn-next { padding:0.75rem 1.75rem; border-radius:0.75rem; color:white; font-weight:700; font-size:0.875rem; cursor: pointer; border: none; transition: background 0.2s; }
.btn-next:disabled { opacity:0.3; cursor:not-allowed; }
.btn-back { padding:0.75rem 1.25rem; border-radius:0.75rem; color:#64748b; font-weight:600; font-size:0.875rem; cursor: pointer; background: transparent; border: none; transition: color 0.2s; }
.btn-back:hover { color: #94a3b8; }

.reveal { animation: fadeIn 0.35s ease both; }
@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.progress-bar { transition: width 0.5s cubic-bezier(0.16,1,0.3,1); }

.pill-option input[type="radio"] { display:none; }
.pill-option label { display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #334155; background:#1e293b; color:#94a3b8; border-radius:0.75rem; padding:0.85rem 1.25rem; font-weight:600; transition: all 0.2s; }
.pill-option label:hover { border-color: #475569; color: #cbd5e1; }

.pill-option.filter-blue input[type="radio"]:checked + label { border-color:#3b82f6; background:rgba(59,130,246,0.15); color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,0.2); }
.pill-option.filter-amber input[type="radio"]:checked + label { border-color:#f59e0b; background:rgba(245,158,11,0.15); color:#fbbf24; box-shadow:0 0 0 3px rgba(245,158,11,0.2); }

.stream-card input[type="radio"] { display:none; }
.stream-card label { display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; border:2px solid #334155; background:#1e293b; border-radius:1rem; padding:1.25rem 1rem; font-weight:700; transition: all 0.2s; text-align: center; }
.stream-card label:hover { border-color: #475569; }

.stream-card.filter-rose input[type="radio"]:checked + label { border-color:#f43f5e; background:rgba(244,63,94,0.15); color:#f43f5e; box-shadow:0 0 0 3px rgba(244,63,94,0.2); }
.stream-card.filter-emerald input[type="radio"]:checked + label { border-color:#10b981; background:rgba(16,185,129,0.15); color:#34d399; box-shadow:0 0 0 3px rgba(16,185,129,0.2); }

.elective-check input[type="checkbox"] { display:none; }
.elective-check label { display:flex; align-items:center; gap:0.75rem; cursor:pointer; border:2px solid #334155; background:#1e293b; border-radius:0.75rem; padding:0.75rem 1rem; font-size:0.9rem; font-weight:600; transition: all 0.2s; }
.elective-check label:hover { border-color: #475569; }

.elective-check input[type="checkbox"]:checked + label { border-color:#f43f5e; background:rgba(244,63,94,0.15); color:#f43f5e; }
.elective-check.filter-emerald-check input[type="checkbox"]:checked + label { border-color:#10b981; background:rgba(16,185,129,0.15); color:#34d399; }

.field-input, .field-select { width:100%; padding:0.75rem 1rem; border:2px solid #334155; border-radius:0.75rem; background:#1e293b; font-size:0.9rem; font-weight:500; color:white; outline:none; transition: border-color 0.2s; appearance: none; }
.field-input:focus, .field-select:focus { border-color: #4f46e5; }
.field-select { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1.25rem; }
</style>