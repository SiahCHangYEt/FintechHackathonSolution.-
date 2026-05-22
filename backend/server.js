import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
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


