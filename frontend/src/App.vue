<script setup>
import { ref } from 'vue'

// Simple counter state to ensure Vue interactivity works along with Tailwind
const clickCount = ref(0)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 antialiased selection:bg-indigo-500 selection:text-white">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden group">
      
      <!-- Top Decorative Accent Lines (Tests Absolute Positioning & Gradients) -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>
      
      <!-- Header Section (Tests Flexbox, Alignments, and Spacing) -->
      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            System Diagnostics
          </span>
          <h1 class="text-2xl font-black text-white tracking-tight pt-2">
            Tailwind CSS Test
          </h1>
        </div>
        
        <!-- Status Indicator (Tests Pulsing Animations) -->
        <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-xs font-bold text-emerald-400">Active</span>
        </div>
      </div>

      <!-- Feature Grid Checklist (Tests Tailwind Grid System & Background Tints) -->
      <div class="grid grid-cols-1 gap-3 pt-2">
        <div class="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors">
          <span class="text-indigo-400 font-bold">✓</span>
          <p class="text-sm font-medium text-slate-300">Base Utilities & Layout Engines</p>
        </div>
        <div class="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors">
          <span class="text-blue-400 font-bold">✓</span>
          <p class="text-sm font-medium text-slate-300">Arbitrary Colors & Layer Opacity</p>
        </div>
        <div class="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors">
          <span class="text-purple-400 font-bold">✓</span>
          <p class="text-sm font-medium text-slate-300">Dynamic UI Transitions & States</p>
        </div>
      </div>

      <!-- Interactive Counter Area (Tests Vue + Tailwind Interactive Binding) -->
      <div class="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 text-center space-y-3">
        <p class="text-xs text-slate-500 font-mono tracking-tight">
          Interactive Testing Environment
        </p>
        <button 
          @click="clickCount++"
          class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Click Sandbox: <span class="font-black bg-white/20 px-2 py-0.5 rounded ml-1">{{ clickCount }}</span>
        </button>
      </div>

      <!-- Footer Badge -->
      <p class="text-center text-xs text-slate-600 font-medium">
        Vite Compilation Hub &bull; Ready for Sandbox Coding
      </p>

    </div>
  </div>
</template>