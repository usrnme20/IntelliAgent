# AP Tutor - AI-Powered Learning Platform

A comprehensive AI tutoring platform for AP courses using Letta's stateful agents. Each course has a dedicated AI tutor that remembers student interactions and adapts to individual learning needs.

## Features

- **6 AP Courses**: Biology, US History, Spanish, French, Chemistry, Computer Science A
- **Personalized AI Tutors**: Each course has a specialized Letta agent with deep curriculum knowledge
- **Adaptive Learning**: Agents remember student strengths/weaknesses and provide targeted help
- **Interactive Practice**: Unit quizzes, review sessions, and full-length practice exams
- **Language Learning**: Speaking/listening practice for Spanish and French courses
- **Progress Tracking**: Detailed analytics and progress visualization

## Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd ap-tutor-platform
   npm install
   \`\`\`

2. **Get Letta API Key**
   - Sign up at [app.letta.com](https://app.letta.com)
   - Create an API key at [app.letta.com/api-keys](https://app.letta.com/api-keys)

3. **Setup Environment**
   \`\`\`bash
   cp .env.example .env.local
   # Add your LETTA_API_KEY to .env.local
   \`\`\`

4. **Create AI Tutors**
   \`\`\`bash
   npm run setup-agents
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Architecture

The platform uses Letta's stateful agents [^1] to create persistent AI tutors that:

- **Remember Everything**: Each agent maintains memory of student interactions
- **Adapt Over Time**: Agents learn student strengths/weaknesses and adjust teaching
- **Provide Expertise**: Each tutor has comprehensive AP curriculum knowledge
- **Track Progress**: Agents store learning patterns in their long-term memory

### Agent Memory Structure

Each tutor agent has specialized memory blocks:
- **Persona**: Teaching style and expertise
- **Course Knowledge**: Complete AP curriculum and exam format
- **Student Progress**: Individual learning patterns and weak areas
- **Human**: Student profile and preferences

## Course Coverage

### AP Biology
- 8 units from Chemistry of Life to Ecology
- Lab analysis and data interpretation
- FRQ practice and exam strategies

### AP US History
- 9 historical periods from 1491-Present
- DBQ and LEQ writing practice
- Primary source analysis

### AP Spanish/French
- 6 thematic units with cultural focus
- Speaking and listening practice as well as AI conversation
- Authentic resource integration

### AP Chemistry
- 9 units covering all major chemistry concepts
- Mathematical problem-solving
- Laboratory skills and analysis

### AP Computer Science A
- 10 units of Java programming
- Object-oriented programming concepts
- Algorithm development and analysis

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI Agents**: Letta Cloud with GPT-4.1 models
- **UI Components**: shadcn/ui with Radix primitives
- **Styling**: Tailwind CSS with custom design system

## Development

### Adding New Features

The platform is designed for easy extension:

1. **New Courses**: Add course configs to `scripts/setup-agents.js`
2. **Enhanced Quizzes**: Extend `QuizSection` component with new question types
3. **Progress Analytics**: Add new metrics to `ProgressDashboard`
4. **Language Features**: Expand `LanguageSection` with more interactive elements

### API Integration

The chat interface uses the Vercel AI SDK with Letta provider [^1]:

\`\`\`typescript
import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider'
import { streamText } from 'ai'

const result = streamText({
  model: lettaCloud(agentId),
  prompt: userMessage, // Only send new message, not history
})
\`\`\`

## Deployment

1. **Environment Variables**: Ensure all `LETTA_AGENT_*` variables are set
2. **Build**: `npm run build`
3. **Deploy**: Compatible with Vercel, Netlify, or any Node.js hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with your Letta agents
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
