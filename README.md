# FintechHackathonSolution.-
Didik AI is an intelligent educational platform that personalizes learning by aligning the national curriculum with a student's personal interests, hobbies, and preferences. By bridging academic requirements with what students love, Didik AI transforms standard educational content into deeply engaging, contextualized learning experiences.

Project Architecture
The repository is split into two primary components: frontend and backend.

1. Backend (/backend)
Acts as the central business logic layer and the primary API gateway for the solution.

server.js: The core application gateway that handles routing and establishes secure connections with both Supabase (our primary data store) and Gemini AI.

package.json & Configuration: Configured to manage dependency trees and secure the proxy server and database bridge specific to this hackathon implementation.

.env: Stores critical environmental variables and sensitive API credentials securely.

2. Frontend (/frontend)
Provides a highly responsive, intuitive user interface.

Vue.js Framework (.vue files): Manages dynamic page rendering, component lifecycle, and state across the application.

Tailwind CSS: Powers the responsive design and visual styling with utility-first CSS architecture.

JavaScript & JSON: Drives client-side logic, environment setups, and configuration orchestration.

How It Works
Onboarding Profile: The student completes an onboarding form capturing their academic level, specialized streams, elective subjects, and core personal interests.

Contextual AI Tutoring: Students engage with a Gemini-powered Chatbot that adapts curriculum topics to match the student's personal interest profile.

Knowledge Validation: The system dynamically serves targeted quizzes to assess comprehension and reinforce learning outcomes.

