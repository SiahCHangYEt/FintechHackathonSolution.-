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
//ENGINE LISTENER KICKS OFF HERE (Absolute Bottom)
// ==========================================
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Secure API Proxy operational at: http://127.0.0.1:${PORT}`)
  console.log(`Health check endpoint live at: http://127.0.0.1:${PORT}/api/health`)
})

// Supabase Telemetry Data Synchronization Gateway
app.post('/api/my-new-route', async (req, res) => {
  try {
    const { student, school, state, stream, electives, interests, hobbies, formLevel } = req.body
    const coreSubjects = [
      'Bahasa Melayu (BM)', 
      'English', 
      'Mathematics', 
      'Sejarah', 
      'Pendidikan Islam/Moral'
    ]
    let calculatedSubjects = [...coreSubjects]
    
    if (formLevel >= 1 && formLevel <= 3) {
      // Lower Secondary adds general Science
      calculatedSubjects.push('Science')
    } else {
      // Upper Secondary adds whatever unique electives they ticked on Step 3
      if (electives && electives.length > 0) {
        calculatedSubjects = [...calculatedSubjects, ...electives]
      }
    }

    calculatedSubjects = [...new Set(calculatedSubjects)]

    // Insert record rows straight into the Supabase postgres schema cluster
    const { data, error } = await supabase
      .from('student_profiles')
      .insert([
        {
          student_name: student,
          school_name: school,
          state: state,
          stream: stream,
          electives: electives,          // Maps natively to text[] arrays
          primary_interest: interests,
          hobbies: hobbies               // Maps natively to text[] arrays
        }
      ])
      .select()

    if (error) throw error

    res.json({
      success: true,
      subjects:calculatedSubjects,
      message: 'Student profile telemetry synchronized perfectly with Supabase backend layer.',
      record: data[0]
    })

  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// 🏆 Supabase Quiz Attempt Statistics Logger
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { studentName, subjectName, chapterName, totalCorrect, totalQuestions } = req.body
    const scorePct = Math.round((totalCorrect / totalQuestions) * 100)

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          student_name: studentName,
          subject_name: subjectName,
          chapter_name: chapterName,
          score_percentage: scorePct,
          total_correct: totalCorrect,
          total_questions: totalQuestions
        }
      ])
      .select()

    if (error) throw error
    res.json({ success: true, record: data[0] })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// 🔐 Full-Stack Onboarding & Authentication Gateway
app.post('/api/auth/sync-profile', async (req, res) => {
  try {
    const { studentName, password, isNewcomer, school, state, stream, electives, interests, hobbies, formLevel } = req.body

    // 1. Check if the student already has a tracking entry profile row inside the DB
    const { data: existingUser, error: fetchError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('student_name', studentName)
      .maybeSingle()

    if (fetchError) throw fetchError

    // 🚪 RETURNING USER AUTHENTICATION FLOW
    if (!isNewcomer) {
      if (!existingUser) {
        return res.status(404).json({ success: false, message: 'Student name not recognized. Please toggle Newcomer registration mode!' })
      }
      if (existingUser.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid secure credentials profile passphrase!' })
      }

      // Successful verification login: Return their archived tracking rows directly to hydration engines
      return res.json({
        success: true,
        message: 'Login session authorized.',
        isNewUser: false,
        profile: existingUser
      })
    }

    // 🆕 NEWCOMER ACCOUNT REGISTRATION FLOW
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This student name is already registered! Please login instead.' })
    }

    // Set fallback structures for curriculum layers
    const defaultCore = ['Bahasa Melayu (BM)', 'English', 'Mathematics', 'Sejarah', 'Pendidikan Islam/Moral']
    const calculatedSubjects = (formLevel >= 1 && formLevel <= 3) 
      ? [...defaultCore, 'Science'] 
      : [...defaultCore, ...(electives || [])]

    const { data: newUser, error: insertError } = await supabase
      .from('student_profiles')
      .insert([
        {
          student_name: studentName,
          password: password, // Securely tracked row key
          school_name: school,
          state: state,
          stream: stream || 'General Lower Secondary',
          electives: [...new Set(calculatedSubjects)],
          primary_interest: interests || 'tech',
          hobbies: hobbies || []
        }
      ])
      .select()
      .single()

    if (insertError) throw insertError

    res.json({
      success: true,
      message: 'New system-wide profile identity instantiated successfully.',
      isNewUser: true,
      profile: newUser
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// 🔧 UPDATE PROFILE PROFILE PARAMETERS ENDPOINT
app.post('/api/profile/update', async (req, res) => {
  try {
    const { id, school_name, state, stream, electives, password } = req.body

    const { data, error } = await supabase
      .from('student_profiles')
      .update({
        school_name,
        state,
        stream,
        electives,
        password
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, profile: data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Adaptive KSSM Gemini Linguistic Routing Layer
//  Adaptive KSSM Gemini Linguistic & Dynamic Charting Gateway
app.post('/ai/chat', async (req, res) => {
  try {
    const { prompt, selectedSubject, selectedChapter, studentProfile } = req.body
    
    if (!prompt) return res.status(400).json({ error: 'Prompt content is required!' })

    // 🇲🇾 Check if the subject falls under strict National Language curriculum guidelines
    const nationalCoreSubjects = ['Bahasa Melayu (BM)', 'Sejarah', 'Pendidikan Islam/Moral']
    const isNationalCore = nationalCoreSubjects.includes(selectedSubject)

    // Context Harvesting: Inject KSSM metadata, textbook chapter parameters, and interest fields
    const systemInstruction = `You are an expert Malaysian KSSM secondary school tutor specializing in ${selectedSubject}.
Currently teaching: ${selectedChapter}.
Student Profile: ${studentProfile?.fullName || 'Student'}, studying at ${studentProfile?.schoolName || 'KSSM school'}.
Student Analytical Interests: ${studentProfile?.interests ? studentProfile.interests.join(', ') : 'General Education'}.

[LINGUISTIC MATRIX RULES]
${isNationalCore 
  ? `CRITICAL: Because the subject is "${selectedSubject}", you MUST conduct the entire session, explain concepts, and formulate examples strictly in BAHASA MELAYU by default. If the student explicitly asks to switch to English, honor it immediately.` 
  : `Conduct the session primarily in ${studentProfile?.languagePreference || 'English'}. However, the student might use casual Malaysian cross-lingual phrases (Bahasa Melayu or Manglish). Always respond in the language they are using to prompt you.`
}

[VISUALAID GUARDRAIL]
Analyze the user's prompt. If they ask for a visualization, function plot, coordinates, sketch, or schematic—or if explaining this specific ${selectedChapter} concept heavily relies on a 2D Cartesian coordinate chart layout—you must set "requiresVisualGraph" to true. This applies whether they ask in English ("draw a graph", "plot functions") or in Bahasa Melayu ("lukis graf", "plot paksi-x", "visualisasi", "rajah parabola").`

    // Force Gemini to return an immutable structured JSON schema object
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            tutorReply: { 
              type: "string", 
              description: "The full conversational KSSM tutorial response. Incorporate clean standard LaTeX format for math variables or complex math formatting using inline $ equations or standalone $$ math display blocks." 
            },
            requiresVisualGraph: { 
              type: "boolean", 
              description: "True if the student explicitly requests a chart, grid plot, diagram, or graph in any language (English/Malay), or if the textbook chapter topic requires a coordinate visual to explain properly." 
            },
            chartEquationType: {
              type: "string",
              enum: ["linear", "quadratic", "cubic", "trig-sin", "trig-cos", "none"],
              description: "The mathematical archetype of the graph requested, to format the data plotting vector correctly."
            }
          },
          required: ["tutorReply", "requiresVisualGraph", "chartEquationType"]
        }
      }
    })

    // Parse the secure structured JSON response safely
    const aiPayload = JSON.parse(response.text)
    let generatedImageUrl = null

    // 📈 DYNAMIC QUICKCHART ROUTER
    if (aiPayload.requiresVisualGraph) {
      let chartConfig = ""

      // Tweak dataset arrays automatically based on the mathematical shape the AI detected!
      switch (aiPayload.chartEquationType) {
        case "quadratic": // Perfect for Form 4/5 Add Maths Quadratics & Calculus functions!
          chartConfig = `{type:'line',data:{labels:[-3,-2,-1,0,1,2,3],datasets:[{label:'f(x) = x² - 2x - 3',data:[12,5,0,-3,-4,-3,0],borderColor:'rgb(244,63,94)',backgroundColor:'rgba(244,63,94,0.05)',fill:true,pointRadius:4}]}}`
          break
        case "trig-sin": // Perfect for Form 5 Add Maths Chapter 6 Trigonometric Functions!
          chartConfig = `{type:'line',data:{labels:['0°','90°','180°','270°','360°'],datasets:[{label:'y = sin(x)',data:[0,1,0,-1,0],borderColor:'rgb(59,130,246)',backgroundColor:'transparent',lineTension:0.4}]}}`
          break
        case "linear":
          chartConfig = `{type:'line',data:{labels:[-2,-1,0,1,2],datasets:[{label:'y = 2x + 1',data:[-3,-1,1,3,5],borderColor:'rgb(16,185,129)',fill:false}]}}`
          break
        default: // Balanced default fallback fallback grid
          chartConfig = `{type:'line',data:{labels:[1,2,3,4,5],datasets:[{label:'Syllabus Concept Trend',data:[2,4,7,11,16],borderColor:'rgb(139,92,246)'}]}}`
      }

      generatedImageUrl = `https://quickchart.io/chart?c=${encodeURIComponent(chartConfig)}`
    }

    res.json({ 
      success: true, 
      reply: aiPayload.tutorReply, 
      imageUrl: generatedImageUrl
    })

  } catch (err) {
    console.error('Gemini structural engine failure:', err)
    res.status(500).json({ error: 'Internal pipeline fault', details: err.message })
  }
})
