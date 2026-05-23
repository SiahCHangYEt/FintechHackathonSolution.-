import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { GoogleGenAI } from '@google/genai'

// .env file variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 1. Middleware Configurations (Must be near the top)
app.use(cors({
  origin: 'http://127.0.0.1:5173', // Permit traffic from your local Vue server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())

// Initialize the Supabase structural database connector
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false // Great for standalone backend APIs
  },
  realtime: {
    transport: ws // Stops Supabase from trying to spin up WebSocket connections on Node 20
  }
})

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ==========================================
// 🚀 ALL ROUTES REGISTERED HERE
// ==========================================

// Baseline Diagnostic Route Tracker
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Malaysia AI Edu Backend Gateway'
  })
})

// Table-Based Cloud Database Verification Route
app.get('/api/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('_analytics') 
      .select('*')
      .limit(1)

    if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
      return res.status(500).json({
        status: 'error',
        message: 'Could not communicate with Supabase database instance.',
        details: error.message
      })
    }

    res.json({
      status: 'connected',
      message: 'Supabase PostgreSQL handshake verified successfully!',
      databaseState: 'Authenticated & waiting for application tables.'
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during database test routing step.',
      error: err.message
    })
  }
})

// Live AI Core Pathway Endpoint
app.post('/ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt content is required!' })

    // 🤖 Force Gemini to return a structured JSON object containing both the text and a flag!
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            tutorReply: { type: "string", description: "The full conversational math explanation incorporating strict LaTeX." },
            requiresVisualGraph: { type: "boolean", description: "True if the user explicitly asked for a visualization, graph, or diagram, or if explaining the concept heavily benefits from a coordinate plot." }
          },
          required: ["tutorReply", "requiresVisualGraph"]
        }
      }
    })

    // Parse the JSON string payload safely
    const aiPayload = JSON.parse(response.text)
    let generatedImageUrl = null

    // If the AI model decides a visual aid is necessary, attach the live chart engine link!
    if (aiPayload.requiresVisualGraph) {
      // Dynamic Charting: You can customize these dataset arrays to display live parabola vectors!
      generatedImageUrl = `https://quickchart.io/chart?c={type:'line',data:{labels:[-3,-2,-1,0,1,2,3],datasets:[{label:'f(x) = x^2 - 2x',data:[15,8,3,0,-1,0,3],borderColor:'rgb(96,165,250)',backgroundColor:'rgba(96,165,250,0.1)',fill:true,lineTension:0.4}]}}`
    }

    res.json({ 
      success: true, 
      reply: aiPayload.tutorReply, // Maps directly to your text bubble
      imageUrl: generatedImageUrl
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gemini dynamic engine failure', details: err.message })
  }
})
// 📊 End-to-End Student Profile and Progress Aggregation Gateway
app.get('/api/student/:id/dashboard', async (req, res) => {
  try {
    const studentId = req.params.id

    const [profileRes, progressRes] = await Promise.all([
      supabase.from('student_profiles').select('*').eq('id', studentId).single(),
      supabase.from('subject_progress').select('subject_id, completed_chapters').eq('student_id', studentId)
    ])

    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database profile capture failure', details: profileRes.error.message })
    }

    if (!profileRes.data) {
      return res.json({
        profileFound: false,
        studentProfile: {
          academicLevel: 'Form 5',
          languagePreference: 'English',
          stream: 'sains',
          selectedElectives: ['addmath', 'physics', 'chemistry', 'compsci']
        },
        completedChaptersLog: {}
      })
    }

    const formattedProgressLog = {}
    if (progressRes.data) {
      progressRes.data.forEach(row => {
        formattedProgressLog[row.subject_id] = row.completed_chapters
      })
    }

    res.json({
      profileFound: true,
      studentProfile: {
        academicLevel: profileRes.data.academic_level,
        languagePreference: profileRes.data.language_preference,
        stream: profileRes.data.academic_stream,
        selectedElectives: profileRes.data.selected_electives
      },
      completedChaptersLog: formattedProgressLog
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal system crash in dashboard during loop', details: err.message })
  }
})

// 📈 Save or update chapter completion endpoint
app.post('/api/student/update-progress', async (req, res) => {
  try {
    const { studentId, subjectId, completedChapters } = req.body
    
    if (!studentId || !subjectId) {
      return res.status(400).json({ error: 'Missing mandatory payload variables!' })
    }

    const { data, error } = await supabase
      .from('subject_progress')
      .upsert({
        student_id: studentId, 
        subject_id: subjectId, 
        completed_chapters: completedChapters, 
        updated_at: new Date()
      }, { onConflict: 'student_id,subject_id' })
      .select()

    if (error) {
      return res.status(500).json({ error: 'Upsert record pipeline transaction error', details: error.message })
    }

    res.json({ success: true, message: 'Academic progress metric recorded successfully.', data })
  } catch (err) {
    res.status(500).json({ error: 'Internal system crash in progress update route', details: err.message })
  }
})

// ==========================================
// 🏁 2. ENGINE LISTENER KICKS OFF HERE (Absolute Bottom)
// ==========================================
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Secure API Proxy operational at: http://127.0.0.1:${PORT}`)
  console.log(`Health check endpoint live at: http://127.0.0.1:${PORT}/api/health`)
})