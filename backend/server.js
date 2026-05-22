import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { GoogleGenAI } from '@google/genai'
//.env file variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
// Middleware Configurations
app.use(cors())
app.use(express.json())

// Initialize the Supabase structural database connector
export const supabase = createClient( process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false // Great for standalone backend APIs
  },
  realtime: {
    // This stops Supabase from trying to spin up WebSocket connections on Node 20
    transport: ws
  }
})

// Baseline Diagnostic Route Tracker
app.get('/api/health',(req,res) => {
    res.json({
        status:'healthy',
        timestamp: new Date().toISOString(),
        service: 'Malaysia AI Edu Backend Gateway'
    })
})

// Fire up the local network listener
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Secure API Proxy operational at: http://127.0.0.1:${PORT}`)
  console.log(`Health check endpoint live at: http://127.0.0.1:${PORT}/api/health`)
})

// ⚡ Updated: Table-Based Cloud Database Verification Route
app.get('/api/db-test', async (req, res) => {
  try {
    // Instead of system functions, we simply pull the schema structural metadata
    // This checks if we can read the root database directory map safely
    const { data, error } = await supabase
      .from('_analytics') 
      .select('*')
      .limit(1)

    // A "PGRST116" or "relation does not exist" code means we connected perfectly, 
    // it just means you haven't created any custom application tables yet!
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

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY})

app.post('/ai/chat',async(req,res) =>{
    try{
        const {prompt} = req.body

        if(!prompt){
            return res.status(400).json({error:'Prompt content is required!'})
        }

        const response = await ai.models.generateContent({
            model:'gemini-2.5-flash',
            contents:prompt,
        })

        res.json({
            success:true,
            reply:response.text
        })
    }
    catch(err){
        console.error('Gemini engine failure:',err)
        res.status(500).json({
            error:'Failed to process prompt through the AI gateway framework',
            details: err.message
        })
    }
})
