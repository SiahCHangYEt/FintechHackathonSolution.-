<template>
  <div class="min-h-screen bg-paper bg-grid flex items-center justify-center p-4">

    <div class="fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
         style="background: radial-gradient(circle, #ccfbf1, transparent 70%); transform: translate(30%, -30%);"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
         style="background: radial-gradient(circle, #fde68a, transparent 70%); transform: translate(-30%, 30%);"></div>

    <div class="w-full max-w-2xl">

      <div class="text-center mb-8 step-card">
        <div class="inline-flex items-center gap-2 bg-rose-100 text-rose px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Student Profile Onboarding
        </div>
        <h1 class="serif text-4xl text-ink mb-2">Build Your Student Profile</h1>
        <p class="text-stone-500 text-sm">Provide your program targets, personal details, and interests</p>
      </div>

      <div class="mb-6">
        <div class="flex justify-between text-xs text-stone-400 mb-2 font-medium">
          <span>{{ currentStep <= TOTAL_STEPS ? `Step ${currentStep} of ${TOTAL_STEPS}` : 'Application Complete' }}</span>
          <span>{{ progressPct }}%</span>
        </div>
        <div class="h-2 bg-cream rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-gradient-to-r from-teal to-emerald-400 progress-bar" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="flex justify-center gap-2 mt-3">
          <div v-for="s in TOTAL_STEPS" :key="s"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="s < currentStep ? 'w-6 bg-teal' : s === currentStep ? 'w-6 bg-teal opacity-60' : 'w-2 bg-stone-200'">
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">

        <div v-if="currentStep === 1" class="p-8 reveal">
          <div class="flex items-center gap-3 mb-6">
            <div class="step-badge bg-teal-soft text-teal">1</div>
            <div>
              <h2 class="serif text-2xl text-ink">Academic Level</h2>
              <p class="text-stone-400 text-sm">Which form are you currently in?</p>
            </div>
          </div>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div v-for="n in 5" :key="n" class="pill-option filter-teal">
              <input type="radio" :id="'form'+n" :value="n" v-model="formLevel">
              <label :for="'form'+n" class="flex-col py-4 gap-1">
                <span class="text-xl font-bold serif">{{ n }}</span>
                <span class="text-xs">Form {{ n }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end mt-8">
            <button @click="currentStep = 2" :disabled="!formLevel" class="btn-next bg-teal hover:bg-teal-700">Next</button>
          </div>
        </div>

        <div v-if="currentStep === 2" class="p-8 reveal">
          <div class="flex items-center gap-3 mb-6">
            <div class="step-badge bg-amber-soft text-amber">2</div>
            <div>
              <h2 class="serif text-2xl text-ink">Language Preference</h2>
              <p class="text-stone-400 text-sm">For Maths &amp; Science subjects</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="pill-option filter-amber">
              <input type="radio" id="lang-bm" value="BM" v-model="language">
              <label for="lang-bm" class="flex-col gap-2 py-5">
                <span class="text-2xl">🇲🇾</span>
                <span class="font-semibold">Bahasa Melayu</span>
              </label>
            </div>
            <div class="pill-option filter-amber">
              <input type="radio" id="lang-en" value="EN" v-model="language">
              <label for="lang-en" class="flex-col gap-2 py-5">
                <span class="text-2xl">🇬🇧</span>
                <span class="font-semibold">English</span>
              </label>
            </div>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 1" class="btn-back">Back</button>
            <button @click="currentStep = 3" :disabled="!language" class="btn-next bg-amber hover:bg-amber-600">Next</button>
          </div>
        </div>

        <div v-if="currentStep === 3" class="p-8 reveal">
          <div class="flex items-center gap-3 mb-6">
            <div class="step-badge bg-rose-100 text-rose">3</div>
            <div>
              <h2 class="serif text-2xl text-ink">Target Stream Track</h2>
              <p class="text-stone-400 text-sm">Select the program path you plan to enter</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="stream-card">
              <input type="radio" id="stream-sains" value="sains" v-model="stream">
              <label for="stream-sains">🔬 Sains</label>
            </div>
            <div class="stream-card">
              <input type="radio" id="stream-sastera" value="sastera" v-model="stream">
              <label for="stream-sastera">📚 Sastera</label>
            </div>
          </div>
          <div v-if="stream" class="reveal">
            <p class="section-label">Requested Elective Subjects</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div v-for="subj in currentElectives" :key="subj" class="elective-check">
                <input type="checkbox" :id="'elec-'+subj" :value="subj" v-model="selectedElectives">
                <label :for="'elec-'+subj">{{ subj }}</label>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 2" class="btn-back">Back</button>
            <button @click="currentStep = 4" :disabled="!canProceedStep3" class="btn-next bg-rose hover:bg-rose-700">Next</button>
          </div>
        </div>

        <div v-if="currentStep === 4" class="p-8 reveal">
          <div class="flex items-center gap-3 mb-6">
            <div class="step-badge bg-sky-100 text-sky-600">4</div>
            <div>
              <h2 class="serif text-2xl text-ink">Personal Information</h2>
              <p class="text-stone-400 text-sm">Please provide your institutional details</p>
            </div>
          </div>
          <div class="space-y-4">
            <input type="text" v-model="personal.fullName" placeholder="Full Student Name" class="field-input" />
            <input type="text" v-model="personal.schoolName" placeholder="Current Registered School" class="field-input" />
            <select v-model="personal.state" class="field-select">
              <option value="" disabled>Select State</option>
              <option v-for="s in malaysianStates" :key="s">{{ s }}</option>
            </select>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 3" class="btn-back">Back</button>
            <button @click="currentStep = 5" :disabled="!canProceedStep4" class="btn-next bg-sky-500 hover:bg-sky-600">Next</button>
          </div>
        </div>

        <div v-if="currentStep === 5" class="p-8 reveal">
          <div class="flex items-center gap-3 mb-6">
            <div class="step-badge bg-violet-100 text-violet-600">5</div>
            <div>
              <h2 class="serif text-2xl text-ink">Academic Justification Statement</h2>
              <p class="text-stone-400 text-sm">Write down your justification arguments</p>
            </div>
          </div>
          <div class="space-y-4">
            <select v-model="academic.appealReason" class="field-select">
              <option value="" disabled>Reason for Appeal</option>
              <option>Stream Re-assignment</option>
              <option>Incorrect Result Grading</option>
            </select>
            <textarea v-model="academic.appealText" rows="4" placeholder="Enter appeal description statement..." class="field-input resize-none pt-3"></textarea>
          </div>
          <div class="flex justify-between mt-8">
            <button @click="currentStep = 4" class="btn-back">Back</button>
            <button @click="currentStep = 6" :disabled="!canProceedStep5" class="btn-next bg-violet-600 hover:bg-violet-700">Next</button>
          </div>
        </div>

        <div v-if="currentStep === 6" class="p-8 reveal">
          <div class="flex items-center gap-3 mb-6">
            <div class="step-badge bg-emerald-100 text-emerald-600">6</div>
            <div>
              <h2 class="serif text-2xl text-ink">Hobbies &amp; Interests Form</h2>
              <p class="text-stone-400 text-sm">Tell us what you love to do outside of the classroom</p>
            </div>
          </div>

          <div class="space-y-6">
            <div class="field-group">
              <label class="field-label"><span class="field-icon">🚀</span> Primary Field of Interest</label>
              <div class="grid grid-cols-2 gap-3 mt-1">
                <div v-for="interest in interestOptions" :key="interest.value" class="stream-card filter-emerald">
                  <input type="radio" :id="'int-'+interest.value" :value="interest.value" v-model="lifestyle.primaryInterest">
                  <label :for="'int-'+interest.value">
                    <span class="text-2xl">{{ interest.icon }}</span>
                    <span class="font-semibold text-sm block">{{ interest.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label"><span class="field-icon">⚽</span> Personal Hobbies &amp; Activities</label>
              <div class="grid grid-cols-2 gap-2 mt-1">
                <div v-for="hobby in hobbyOptions" :key="hobby" class="elective-check filter-emerald-check">
                  <input type="checkbox" :id="'hobby-'+hobby" :value="hobby" v-model="lifestyle.selectedHobbies">
                  <label :for="'hobby-'+hobby">{{ hobby }}</label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8">
            <button @click="currentStep = 5" class="btn-back">Back</button>
            <button @click="submitForm" :disabled="!canSubmit" class="btn-next bg-emerald-600 hover:bg-emerald-700">Submit Application</button>
          </div>
        </div>

        <div v-if="currentStep === 7" class="p-8 reveal">
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 font-bold">✓</div>
            <h2 class="serif text-3xl text-ink mb-1">Application Dispatched!</h2>
          </div>
          <div class="space-y-4 text-sm bg-stone-50 p-4 rounded-xl">
            <p><strong>Full Name:</strong> {{ personal.fullName }}</p>
            <p><strong>Target Stream:</strong> {{ stream }}</p>
            <p><strong>Primary Interest:</strong> {{ lifestyle.primaryInterest }}</p>
            <p><strong>Selected Hobbies:</strong> {{ lifestyle.selectedHobbies.join(', ') || 'None' }}</p>
          </div>
          <div class="text-center mt-6">
            <button @click="resetForm" class="text-teal text-sm underline">Start Over</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'

const TOTAL_STEPS = 6

// Forces the view layer straight to the new Hobbies & Interests Step 6 form
const currentStep = ref(6) 
const formLevel   = ref(4)
const language    = ref('EN')
const stream      = ref('sains')
const selectedElectives = ref(['Physics (Fizik)'])

const personal = reactive({
  fullName:   'Muhammad Hazim bin Razak',
  schoolName: 'SMK Puchong Utama',
  state: 'Selangor',
  gender: 'male',
})

const academic = reactive({
  appealReason:  'Stream Re-assignment',
  targetSubject: 'Additional Mathematics',
  appealText:    'I am formally requesting alignment modifications to my registered curriculum targets.',
})

const lifestyle = reactive({
  primaryInterest: 'tech',
  selectedHobbies: ['Coding', 'Gaming']
})

const electivesList = {
  sains:   ['Physics (Fizik)', 'Chemistry (Kimia)', 'Biology (Biologi)', 'Additional Mathematics (Add Maths)'],
  sastera: ['Economics (Ekonomi)', 'Accounting (Perakaunan)', 'Business Studies (Perniagaan)']
}

const malaysianStates = ['Selangor', 'Johor', 'Penang', 'Sabah', 'Sarawak', 'Kuala Lumpur']
const hobbyOptions = ['Gaming', 'Coding', 'Music', 'Drawing', 'Football', 'Chess']

const interestOptions = [
  { value: 'tech',     label: 'Tech & Engineering', icon: '💻' },
  { value: 'arts',     label: 'Creative Arts',      icon: '🎨' },
  { value: 'sports',   label: 'Athletics & Sports', icon: '🏆' },
  { value: 'sciences', label: 'Research Sciences',  icon: '🧪' }
]

const currentElectives = computed(() => stream.value ? electivesList[stream.value] : [])
watch(stream, () => { selectedElectives.value = [] })

const progressPct = computed(() => Math.round((Math.min(currentStep.value, TOTAL_STEPS) / TOTAL_STEPS) * 100))

const canProceedStep3 = computed(() => !!stream.value && selectedElectives.value.length > 0)
const canProceedStep4 = computed(() => !!personal.fullName && !!personal.schoolName && !!personal.state)
const canProceedStep5 = computed(() => !!academic.appealReason && !!academic.appealText.trim())
const canSubmit       = computed(() => !!lifestyle.primaryInterest && lifestyle.selectedHobbies.length > 0)

function submitForm() { currentStep.value = 7 }
function resetForm() { 
  currentStep.value = 1 
  Object.assign(lifestyle, { primaryInterest: '', selectedHobbies: [] })
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;700&display=swap');
body { font-family: 'DM Sans', sans-serif; }
.serif { font-family: 'DM Serif Display', serif; }
.bg-grid { background-image: linear-gradient(rgba(15,118,110,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,0.06) 1px, transparent 1px); background-size: 40px 40px; }
.bg-paper { background-color: #faf7f2; }
.bg-cream  { background-color: #f0ebe0; }
.text-teal { color: #0f766e; } .text-amber { color: #d97706; } .text-rose { color: #be185d; } .text-ink { color: #1a1a2e; }
.bg-teal { background-color: #0f766e; } .bg-amber { background-color: #d97706; } .bg-rose { background-color: #be185d; }
.bg-teal-soft { background-color: #f0fdfa; } .bg-amber-soft { background-color: #fef3c7; } .bg-teal-light { background-color: #ccfbf1; }

.step-badge { width:2.5rem; height:2.5rem; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.125rem; }
.section-label { font-size:0.75rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#78716c; margin-bottom:0.75rem; display:block; }

.summary-section { border: 1px solid #e7e5e4; border-radius: 1rem; overflow: hidden; }
.summary-section-header { display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1rem; background:#faf7f2; font-weight:600; font-size:0.875rem; border-bottom:1px solid #e7e5e4; }
.summary-body { padding: 0.25rem 1rem; }
.summary-row { display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid #f0ece6; font-size:0.875rem; }

.btn-next { padding:0.75rem 1.75rem; border-radius:0.75rem; color:white; font-weight:600; font-size:0.875rem; cursor: pointer; }
.btn-next:disabled { opacity:0.4; cursor:not-allowed; }
.btn-back { padding:0.75rem 1.25rem; border-radius:0.75rem; color:#a8a29e; font-weight:500; font-size:0.875rem; cursor: pointer; }

.reveal { animation: fadeIn 0.35s ease both; }
@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.progress-bar { transition: width 0.5s cubic-bezier(0.16,1,0.3,1); }

.pill-option input[type="radio"] { display:none; }
.pill-option label { display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #e5e0d8; background:white; color:#44403c; border-radius:0.75rem; padding:0.85rem 1.25rem; font-weight:500; }
.pill-option.filter-teal input[type="radio"]:checked + label { border-color:#0f766e; background:#f0fdfa; color:#0f766e; }
.pill-option.filter-amber input[type="radio"]:checked + label { border-color:#d97706; background:#fef3c7; color:#b45309; }
.pill-option.filter-sky input[type="radio"]:checked + label { border-color:#0284c7; background:#f0f9ff; color:#0369a1; }

.stream-card input[type="radio"] { display:none; }
.stream-card label { display:flex; flex-direction:column; align-items:center; cursor:pointer; border:2px solid #e5e0d8; background:white; border-radius:1rem; padding:1.25rem 1rem; font-weight:500; }
.stream-card input[type="radio"]:checked + label { border-color:#d97706; background:#fef3c7; }

.stream-card.filter-emerald input[type="radio"]:checked + label { border-color:#059669; background:#ecfdf5; color:#047857; box-shadow:0 0 0 3px rgba(5,150,105,0.2); }

.elective-check input[type="checkbox"] { display:none; }
.elective-check label { display:flex; align-items:center; gap:0.75rem; cursor:pointer; border:2px solid #e5e0d8; background:white; border-radius:0.75rem; padding:0.75rem 1rem; font-size:0.9rem; }
.elective-check input[type="checkbox"]:checked + label { border-color:#be185d; background:#fdf2f8; color:#9d174d; }

.elective-check.filter-emerald-check input[type="checkbox"]:checked + label { border-color:#059669; background:#ecfdf5; color:#047857; }

.field-group { display:flex; flex-direction:column; gap:0.5rem; }
.field-label { display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; font-weight:600; }
.field-input { width:100%; padding:0.75rem 1rem; border:2px solid #e5e0d8; border-radius:0.75rem; background:white; font-size:0.9rem; outline:none; }
.field-select { width:100%; padding:0.75rem 2.5rem 0.75rem 1rem; border:2px solid #e5e0d8; border-radius:0.75rem; background:white; font-size:0.9rem; cursor:pointer; outline:none; }
</style>