<script setup>
import { computed } from 'vue'

const props = defineProps({
  studentProfile: {
    type: Object,
    required: true,
    default: () => ({
      fullName: 'Student',
      academicLevel: 'Form 5',
      stream: 'sains',
      selectedElectives: []
    })
  }
})

const emit = defineEmits(['select-subject'])

// 🎛️ Master Visual Catalog covering Mandatory Cores + Special Electives
const masterSubjectCatalog = {
  // 🇲🇾 Mandatory Core Subject Matrix
  'Bahasa Melayu (BM)': { desc: 'KSSM Tatabahasa, Karangan & Komunikasi', color: 'from-red-600 to-orange-500', icon: '✍️' },
  'English': { desc: 'KSSM Cambridge English CEFR Language Framework', color: 'from-blue-600 to-indigo-500', icon: '🇬🇧' },
  'Mathematics': { desc: 'Core KSSM algebraic principles & numeric functions', color: 'from-cyan-600 to-blue-500', icon: '🔢' },
  'Sejarah': { desc: 'National historical chronicles & legacy systems', color: 'from-amber-700 to-stone-600', icon: '📜' },
  'Pendidikan Islam/Moral': { desc: 'KSSM Etika, Akhlak & Nilai Kemasyarakatan', color: 'from-emerald-600 to-teal-500', icon: '⚖️' },
  
  // Upper Secondary Special Electives
  'Additional Mathematics (Add Maths)': { desc: 'Advanced Calculus, Vectors & Functions', color: 'from-indigo-500 to-purple-600', icon: '📐' },
  'Physics (Fizik)': { desc: 'Classical Mechanics & Wave Quantum Studies', color: 'from-purple-600 to-pink-600', icon: '⚛️' },
  'Chemistry (Kimia)': { desc: 'Organic Pathways & Periodic Configurations', color: 'from-yellow-600 to-amber-500', icon: '🧪' },
  'Biology (Biologi)': { desc: 'Anatomy, Bio-genetics & Environmental Ecosystems', color: 'from-emerald-500 to-green-600', icon: '🌿' },
  'Economics (Ekonomi)': { desc: 'Macro & Micro Financial Market Frameworks', color: 'from-fuchsia-600 to-pink-500', icon: '📊' },
  'Accounting (Perakaunan)': { desc: 'Ledgers, Balance Audits & Financial Verification', color: 'from-sky-500 to-cyan-500', icon: '💼' },
  'Business Studies (Perniagaan)': { desc: 'Corporate Strategy & Operational Models', color: 'from-rose-500 to-red-600', icon: '🏢' },
  
  // Lower Secondary General Science
  'Science': { desc: 'Baseline physical & natural science blocks', color: 'from-teal-600 to-emerald-500', icon: '🔬' }
}
// 🧠 Dynamic Matrix Computer: Generates card list on the fly based on the onboarding metrics!
const resolvedActiveSubjects = computed(() => {
  const profile = props.studentProfile
  let baseList = [
    'Bahasa Melayu (BM)', 
    'English', 
    'Mathematics', 
    'Sejarah', 
    'Pendidikan Islam/Moral'
  ]

  // Check if student profile details point to Lower Secondary tier arrays
  if (profile.academicLevel === 'Form 1' || profile.academicLevel === 'Form 2' || profile.academicLevel === 'Form 3') {
    baseList.push('Science')
  } else {
    // If Form 4/5, append their chosen elective modules cleanly
    if (profile.selectedElectives && profile.selectedElectives.length > 0) {
      baseList = [...baseList, ...profile.selectedElectives]
    }
  }

  // Deduplicate and filter out placeholder values from the onboarding skip-step
  const cleanList = [...new Set(baseList)].filter(name => 
    name !== 'Core Mathematics' && name !== 'Sains Am'
  )

  // Turn into rich reactive objects for the dashboard cards
  return cleanList.map((subjectName, i) => {
    const meta = masterSubjectCatalog[subjectName] || { desc: 'KSSM National Curriculum Module', color: 'from-gray-600 to-slate-700', icon: '📚' }
    return {
      id: `sub-${i}`,
      name: subjectName,
      description: meta.desc,
      gradient: meta.color,
      icon: meta.icon,
      progress: Math.floor(Math.random() * 35) + 15
    }
  })
})

const handleCardSelection = (subject) => {
  // Clean string name pass up the tree to activate SubjectChapters.vue
  emit('select-subject', subject.name)
}
</script>

<template>
  <div class="space-y-6">
    
    <div class="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md">
      <div>
        <h2 class="text-xl font-bold text-white">Your Academic Track Workspace</h2>
        <p class="text-xs text-gray-400 mt-1">
          Currently configured for: 
          <span class="text-blue-400 font-mono font-bold uppercase ml-1">{{ props.studentProfile.academicLevel }}</span> 
          <span v-if="props.studentProfile.stream" class="text-gray-500 mx-1">|</span>
          <span class="text-purple-400 font-mono font-bold capitalize">{{ props.studentProfile.stream }} Track</span>
        </p>
      </div>
      <div class="text-xs px-3 py-1 bg-gray-950 border border-gray-800 rounded-xl font-mono text-gray-400">
        Active Modules: <span class="text-emerald-400 font-bold font-mono">{{ resolvedActiveSubjects.length }} Units</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="subject in resolvedActiveSubjects"
        :key="subject.id"
        @click="handleCardSelection(subject)"
        class="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer group relative overflow-hidden"
      >
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity" :class="subject.gradient"></div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="p-3 rounded-xl bg-gray-950 border border-gray-800 group-hover:border-gray-700 text-2xl transition-colors">
              {{ subject.icon }}
            </div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 group-hover:text-blue-400 transition-colors">
              Review Analytics ➜
            </span>
          </div>

          <div>
            <h3 class="text-lg font-black text-gray-100 group-hover:text-white transition-colors truncate">
              {{ subject.name }}
            </h3>
            <p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {{ subject.description }}
            </p>
          </div>
        </div>

        <div class="mt-6 space-y-2 border-t border-gray-800/60 pt-4">
          <div class="flex justify-between text-[11px] font-mono text-gray-500">
            <span>Syllabus Mastery Progress</span>
            <span class="text-gray-300 font-bold">{{ subject.progress }}%</span>
          </div>
          <div class="h-1.5 bg-gray-950 rounded-full overflow-hidden p-0.5 border border-gray-800/40">
            <div class="h-full rounded-full bg-gradient-to-r" :class="subject.gradient" :style="{ width: subject.progress + '%' }"></div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>