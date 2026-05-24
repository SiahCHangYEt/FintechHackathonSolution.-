<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'

// Simulated incoming route parameters from your friend's chapter selection grid
const props = defineProps({
  selectedSubject: { type: String, default: 'Additional Mathematics' },
  selectedChapter: { type: String, default: 'Chapter 2: Quadratic Functions' },
  studentProfile: {
    type: Object,
    default: () => ({
      academicLevel: 'Form 5',
      languagePreference: 'English',
      // We add an interest array to make our prompt completely dynamic!
      interests: ['Mobile Legends gaming', 'Formula 1 racing'] 
    })
  }
})

// Component UI and communication states
const chatMessages = ref([])
const userInput = ref('')
const isAIThinking = ref(false)
const chatScrollContainer = ref(null)

// The Prompt Engineer Blueprint (Connecting KSSM to Interests)
const generateSystemContextPrompt = (userPrompt, mode = 'chat') => {
  const interestList = props.studentProfile?.interests || ['gaming', 'sports'];
  const formattedInterests = Array.isArray(interestList) ? interestList.join(', ') : interestList;
  const context = `
    You are an elite, encouraging Malaysian high school tutor specializing in the KSSM curriculum for ${props.studentProfile?.academicLevel || 'Form 5'}.
    You are currently teaching the subject "${props.selectedSubject}", specifically "${props.selectedChapter}".
    The student prefers instruction in ${props.studentProfile?.languagePreference || 'English'}.
    Crucially, the student is passionate about: ${formattedInterests}.
    
    CRITICAL MATH FORMATTING RULES:
    - You MUST use strict standard LaTeX formatting for ALL mathematical variables, values, expressions, and full equations so that the client-side MathJax processor can parse them correctly.
    - Wrap single variables, brief terms, or inline expressions using SINGLE dollar signs. Example: $y = mx + c$ or $x$.
    - Wrap larger standalone equations, fractions, square roots, or multi-line formulas on their own lines using DOUBLE dollar signs. Example: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
    - Never write raw text symbols like ^, /, or sqrt() for math expressions. Always use the proper LaTeX equivalents (e.g., $x^2$, $\\frac{a}{b}$, $\\sqrt{x}$).
    
    INSTRUCTIONS:
    - Explain concepts using metaphors, examples, and analogies related directly to their interests (e.g., explaining quadratic curves using grenade trajectories in games or racing lines in F1).
    - Keep responses concise, engaging, and highly readable using clear Markdown bullet points.
    - If the language preference is English, use standard English but you can occasionally use light Malaysian context cues (like "jom", "la", "SPM") to keep it authentic. If Bahasa Melayu, use clean standard BM.
  `
  
  if (mode === 'init') {
    return `${context}\n\nAction: Introduce yourself enthusiastically, welcome the student to this specific chapter, and provide a fascinating 3-bullet-point introductory summary of "${props.selectedChapter}" completely explained through the lens of their interests.`
  }
  
  return `${context}\n\nStudent's direct question: ${userPrompt}`
}

// 🔄 Automatic Scroller to keep the latest chat bubbles visible
const scrollToBottom = async () => {
  await nextTick()
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight
  }
}
const triggerMathJaxReparse = async () => {
  // Wait for Vue to fully update the HTML elements in the DOM first
  await nextTick()
  
  // If MathJax is fully loaded in the browser window, force a content sweep
  if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetPromise()
      .catch((err) => console.error('MathJax parsing failure:', err))
  }
}
// Trigger the Initial AI Chapter Hook on Mount
const initializeTutorWelcome = async () => {
  try {
    isAIThinking.value = true
    const systemPrompt = generateSystemContextPrompt('', 'init')
    
    // Call your backend Express port 5000 gateway route
    const response = await axios.post('http://127.0.0.1:5000/ai/chat', { prompt: systemPrompt })
    
    chatMessages.value.push({
      sender: 'ai',
      text: response.data.reply
    })
    await triggerMathJaxReparse()
  } catch (err) {
    console.error('AI Initialization Error:', err.message)
    chatMessages.value.push({
      sender: 'ai',
      text: "Adoi! I had trouble connecting to my learning core. Make sure your backend server is running on port 5000!"
    })
  } finally {
    isAIThinking.value = false
    scrollToBottom()
  }
}

const lastSentPrompt = ref('') // Remembers the last question for the regenerate hook

// Copy Message text safely to the OS Clipboard
const copyMessageToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('Message copied to clipboard! 📋'))
    .catch(err => console.error('Could not copy text: ', err))
}

// Regenerate the absolute last AI Response
const handleRegenerateMessage = async () => {
  if (chatMessages.value.length === 0 || isAIThinking.value) return
  
  // Remove the last AI response from the stream array if it exists
  if (chatMessages.value[chatMessages.value.length - 1].sender === 'ai') {
    chatMessages.value.pop()
  }
  
  isAIThinking.value = true
  try {
    // Re-call using the system prompt contextual blueprint saved earlier
    const contextualPrompt = generateSystemContextPrompt(lastSentPrompt.value, lastSentPrompt.value ? 'chat' : 'init')
    const response = await axios.post('http://127.0.0.1:5000/ai/chat', { prompt: contextualPrompt })
    
    chatMessages.value.push({ 
      sender: 'ai', 
      text: response.data.reply,
      imageUrl: response.data.imageUrl // Handles image display
    })
    await triggerMathJaxReparse()
  } catch (err) {
    console.error('Regeneration core error:', err.message)
  } finally {
    isAIThinking.value = false
    await scrollToBottom()
  }
}

// Handle Active Student Follow-up Questions
const handleSendMessage = async () => {
  if (!userInput.value.trim() || isAIThinking.value) return
  
  const studentText = userInput.value
  lastSentPrompt.value = studentText
  chatMessages.value.push({ sender: 'student', text: studentText })
  userInput.value = ''
  isAIThinking.value = true
  await scrollToBottom()
  
  try {
    const contextualPrompt = generateSystemContextPrompt(studentText, 'chat')
    const response = await axios.post('http://127.0.0.1:5000/ai/chat', { prompt: contextualPrompt })
    
    chatMessages.value.push({ sender: 'ai', text: response.data.reply,imageUrl: response.data.url })
    await triggerMathJaxReparse()
  } catch (err) {
    console.error('AI Chat Error:', err.message)
    chatMessages.value.push({ sender: 'ai', text: "Sorry, my proxy line dropped. Let's try that question again!" })
  } finally {
    isAIThinking.value = false
    await scrollToBottom()
  }
}

onMounted(() => {
  initializeTutorWelcome()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh] max-w-6xl mx-auto p-4 text-gray-100">
    
    <div class="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div class="space-y-4">
        <div class="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl">
          <span class="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Active Classroom</span>
          <h2 class="text-lg font-black text-white mt-1">{{ props.selectedSubject }}</h2>
          <p class="text-xs text-gray-400 mt-0.5">{{ props.selectedChapter }}</p>
        </div>
        
        <div class="space-y-2">
          <span class="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">Your Synced Interests</span>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="interest in props.studentProfile.interests" :key="interest" class="px-2.5 py-1 text-xs bg-purple-950/60 text-purple-300 rounded-lg border border-purple-800/30 font-medium">
              🎮 {{ interest }}
            </span>
          </div>
        </div>
      </div>

      <div class="text-[10px] text-gray-500 border-t border-gray-800 pt-4">
        Powered by Gemini 2.5 Flash Engine Gateway
      </div>
    </div>

    <div class="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
      
      <div class="bg-gray-800/40 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h3 class="text-sm font-bold text-gray-200">Personalized AI Tutor Instance</h3>
        </div>
      </div>

      <div ref="chatScrollContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-950/30">
        <div 
          v-for="(msg, index) in chatMessages" 
          :key="index"
          :class="['flex w-full', msg.sender === 'student' ? 'justify-end' : 'justify-start']"
        >
          <div :class="['max-w-[85%] rounded-2xl p-4 shadow-md text-sm leading-relaxed whitespace-pre-wrap', 
            msg.sender === 'student' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-100 border border-gray-700/60 rounded-bl-none']"
          >
          <div>
            {{ msg.text }}
            <div v-if="msg.imageUrl" class="mt-4 border border-gray-700 rounded-xl overflow-hidden bg-gray-900 p-2">
            <img :src="msg.imageUrl" alt="AI Generated Math Vector Chart" class="max-h-64 object-contain mx-auto" />
          </div>
          <div class="mt-2 pt-2 border-t border-gray-700/40 flex gap-3 text-[11px] text-gray-400 justify-end">
        <button @click="copyMessageToClipboard(msg.text)" class="hover:text-white transition-colors flex items-center gap-1">
          📋 Copy
        </button>
        <button 
          v-if="msg.sender === 'ai' && index === chatMessages.length - 1" 
          @click="handleRegenerateMessage" 
          class="hover:text-purple-400 transition-colors flex items-center gap-1"
        >
          🔄 Regenerate
        </button>
      </div>
        </div>
          </div>
          </div>
        <div v-if="isAIThinking" class="flex justify-start w-full">
          <div class="bg-gray-800 border border-gray-700/60 text-gray-400 rounded-2xl rounded-bl-none p-4 flex items-center gap-1 text-xs">
            <span class="animate-bounce">●</span>
            <span class="animate-bounce [animation-delay:0.2s]">●</span>
            <span class="animate-bounce [animation-delay:0.4s]">●</span>
            <span class="ml-1">Tutor generating analogy link...</span>
          </div>
        </div>
      </div>

      <div class="p-4 bg-gray-900 border-t border-gray-800">
        <form @submit.prevent="handleSendMessage" class="flex gap-3">
          <input 
            v-model="userInput"
            type="text"
            placeholder="Ask a question or request a different real-world scenario analogy..."
            class="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            :disabled="isAIThinking"
          />
          <button 
            type="submit"
            class="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 font-semibold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg"
            :disabled="isAIThinking || !userInput.trim()"
          >
            Ask Tutor
          </button>
        </form>
      </div>

    </div>
  </div>
</template>