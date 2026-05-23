<script setup>
import { computed } from 'vue'

const props = defineProps({
  subjectName: { type: String, required: true },
  studentProfile: { type: Object, required: true },
  formLevel: { type: String, default: 'Form 5' } 
})

const emit = defineEmits(['select-chapter', 'launch-quiz'])

// 🗂️ Master National KSSM Chapter Syllabus Registry Database Blueprint
const masterSyllabusRegistry = {
  'Additional Mathematics (Add Maths)': {
    'Form 4': [
      { number: 1, name: 'Functions', totalTopics: 3, difficulty: 'Easy' },
      { number: 2, name: 'Quadratic Functions', totalTopics: 4, difficulty: 'Medium' },
      { number: 3, name: 'Systems of Equations', totalTopics: 3, difficulty: 'Medium' },
      { number: 4, name: 'Indices, Surds and Logarithms', totalTopics: 4, difficulty: 'Hard' },
      { number: 5, name: 'Progressions', totalTopics: 3, difficulty: 'Easy' },
      { number: 6, name: 'Linear Law', totalTopics: 2, difficulty: 'Medium' },
      { number: 7, name: 'Coordinate Geometry', totalTopics: 4, difficulty: 'Medium' },
      { number: 8, name: 'Vectors', totalTopics: 3, difficulty: 'Hard' }
    ],
    'Form 5': [
      { number: 1, name: 'Circular Measure', totalTopics: 4, difficulty: 'Medium' },
      { number: 2, name: 'Differentiation', totalTopics: 5, difficulty: 'Hard' },
      { number: 3, name: 'Integration', totalTopics: 4, difficulty: 'Hard' },
      { number: 4, name: 'Permutation and Combination', totalTopics: 3, difficulty: 'Medium' },
      { number: 5, name: 'Probability Distribution', totalTopics: 4, difficulty: 'Hard' },
      { number: 6, name: 'Trigonometric Functions', totalTopics: 5, difficulty: 'Hard' },
      { number: 7, name: 'Kinematics of Linear Motion', totalTopics: 3, difficulty: 'Hard' }
    ]
  },
  'Physics (Fizik)': {
    'Form 4': [
      { number: 1, name: 'Measurement', totalTopics: 2, difficulty: 'Easy' },
      { number: 2, name: 'Force and Motion I', totalTopics: 7, difficulty: 'Medium' },
      { number: 3, name: 'Gravitation', totalTopics: 3, difficulty: 'Hard' },
      { number: 4, name: 'Heat', totalTopics: 4, difficulty: 'Medium' },
      { number: 5, name: 'Waves', totalTopics: 6, difficulty: 'Hard' }
    ],
    'Form 5': [
      { number: 1, name: 'Force and Motion II', totalTopics: 4, difficulty: 'Medium' },
      { number: 2, name: 'Pressure', totalTopics: 5, difficulty: 'Medium' },
      { number: 3, name: 'Electricity', totalTopics: 5, difficulty: 'Hard' },
      { number: 4, name: 'Electromagnetism', totalTopics: 4, difficulty: 'Hard' },
      { number: 5, name: 'Electronics', totalTopics: 3, difficulty: 'Medium' }
    ]
  },
  'Mathematics': {
    'Lower Secondary': [
      { number: 1, name: 'Rational Numbers', totalTopics: 5, difficulty: 'Easy' },
      { number: 2, name: 'Factors and Multiples', totalTopics: 3, difficulty: 'Easy' },
      { number: 3, name: 'Squares, Square Roots, Cubes and Cube Roots', totalTopics: 4, difficulty: 'Medium' },
      { number: 4, name: 'Ratios, Rates and Proportions', totalTopics: 3, difficulty: 'Easy' },
      { number: 5, name: 'Algebraic Expressions', totalTopics: 3, difficulty: 'Medium' },
      { number: 6, name: 'Linear Equations', totalTopics: 4, difficulty: 'Medium' }
    ],
    'Upper Secondary': [
      { number: 1, name: 'Quadratic Functions and Equations in One Variable', totalTopics: 2, difficulty: 'Easy' },
      { number: 2, name: 'Number Bases', totalTopics: 2, difficulty: 'Easy' },
      { number: 3, name: 'Mathematical Logic', totalTopics: 3, difficulty: 'Medium' },
      { number: 4, name: 'Operations on Sets', totalTopics: 3, difficulty: 'Medium' },
      { number: 5, name: 'Network in Graph Theory', totalTopics: 2, difficulty: 'Hard' },
      { number: 6, name: 'Linear Inequalities in Two Variables', totalTopics: 2, difficulty: 'Medium' }
    ]
  },
  'Sejarah': {
    'Lower Secondary': [
      { number: 1, name: 'Pengenalan Ilmu Sejarah', totalTopics: 4, difficulty: 'Easy' },
      { number: 2, name: 'Zaman Air Batu', totalTopics: 3, difficulty: 'Easy' },
      { number: 3, name: 'Zaman Prasejarah', totalTopics: 4, difficulty: 'Easy' },
      { number: 4, name: 'Mengenal Tamadun Dunia', totalTopics: 3, difficulty: 'Medium' }
    ],
    'Upper Secondary': [
      { number: 1, name: 'Warisan Negara Bangsa', totalTopics: 4, difficulty: 'Medium' },
      { number: 2, name: 'Kebangkitan Nasionalisme', totalTopics: 5, difficulty: 'Hard' },
      { number: 3, name: 'Konflik Dunia dan Pendudukan Jepun', totalTopics: 8, difficulty: 'Hard' },
      { number: 4, name: 'Era Peralihan Kuasa British', totalTopics: 4, difficulty: 'Medium' }
    ]
  }
}

const resolvedChapters = computed(() => {
  const currentSubject = props.subjectName
  const rawForm = props.formLevel
  
  const subjectRegistry = masterSyllabusRegistry[currentSubject]
  if (!subjectRegistry) return generateFallbackChapters()

  if (rawForm === 'Form 1' || rawForm === 'Form 2' || rawForm === 'Form 3') {
    if (subjectRegistry['Lower Secondary']) return subjectRegistry['Lower Secondary']
    return subjectRegistry[rawForm] || generateFallbackChapters()
  } else {
    if (subjectRegistry['Upper Secondary']) return subjectRegistry['Upper Secondary']
    return subjectRegistry[rawForm] || subjectRegistry['Form 4'] || generateFallbackChapters()
  }
})

function generateFallbackChapters() {
  return [
    { number: 1, name: `Introduction to foundational ${props.subjectName} concepts`, totalTopics: 4, difficulty: 'Easy' },
    { number: 2, name: 'Core theoretical methodology and problem solving', totalTopics: 5, difficulty: 'Medium' },
    { number: 3, name: 'Advanced analytical tracking & exam preparation rules', totalTopics: 3, difficulty: 'Hard' }
  ]
}

const handleStudyRoomClick = (chapter) => {
  emit('select-chapter', {
    subject: props.subjectName,
    chapter: `Chapter ${chapter.number}: ${chapter.name}`
  })
}

const handleTakeQuizClick = (chapter) => {
  emit('launch-quiz', {
    subject: props.subjectName,
    chapter: `Chapter ${chapter.number}: ${chapter.name}`
  })
}
</script>

<template>
  <div class="space-y-6">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-5 gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            KSSM {{ props.formLevel }}
          </span>
          <span class="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Active Registry Syllabus
          </span>
        </div>
        <h2 class="text-2xl font-black text-white mt-2.5">{{ props.subjectName }} Curriculum Grid</h2>
        <p class="text-xs text-gray-400 mt-1">Select an action milestone from any core chapter box below to engage with the study core.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="chapter in resolvedChapters" 
        :key="chapter.number"
        class="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between group relative"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-gray-500">
              UNIT 0{{ chapter.number }}
            </span>
            <span :class="['text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border tracking-wider',
              chapter.difficulty === 'Easy' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/20' : 
              chapter.difficulty === 'Medium' ? 'bg-amber-950/30 text-amber-400 border-amber-800/20' : 
              'bg-rose-950/30 text-rose-400 border-rose-800/20']">
              {{ chapter.difficulty }}
            </span>
          </div>

          <div>
            <h3 class="text-base font-bold text-gray-200 line-clamp-2 leading-snug">
              {{ chapter.name }}
            </h3>
            <p class="text-xs text-gray-500 mt-1.5 font-medium">{{ chapter.totalTopics }} adaptive learning sub-nodes</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-800/60 flex flex-col gap-2">
          <button 
            @click="handleStudyRoomClick(chapter)"
            class="w-full text-left px-3 py-2 bg-gray-950 hover:bg-blue-600/10 border border-gray-800 hover:border-blue-500/40 rounded-xl text-xs font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center justify-between group/btn"
          >
            <span>🧠 Open AI Tutor Room</span>
            <span class="transform group-hover/btn:translate-x-1 transition-transform">➜</span>
          </button>
          
          <button 
            @click="handleTakeQuizClick(chapter)"
            class="w-full text-left px-3 py-2 bg-gray-950 hover:bg-emerald-600/10 border border-gray-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-between group/btn"
          >
            <span>📝 Take Chapter Quiz</span>
            <span class="transform group-hover/btn:translate-x-1 transition-transform">➜</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>