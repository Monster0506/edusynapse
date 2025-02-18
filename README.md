<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [EduSynapse](#edusynapse)
  - [Inspiration](#inspiration)
  - [What it does](#what-it-does)
  - [How we built it](#how-we-built-it)
  - [Challenges we ran into](#challenges-we-ran-into)
  - [Accomplishments that we're proud of](#accomplishments-that-were-proud-of)
  - [What we learned](#what-we-learned)
  - [What's next for EduSynapse](#whats-next-for-edusynapse)
  - [Getting Started Experience](#getting-started-experience)
  - [Main Workflow](#main-workflow)
  - [Interactive Code Execution](#interactive-code-execution)
  - [Meet STEVE - Your AI Learning Assistant](#meet-steve-your-ai-learning-assistant)
  - [Core Features](#core-features)
  - [Technical Stack](#technical-stack)
  - [Development Setup](#development-setup)
  - [Acknowledgments](#acknowledgments)

<!-- TOC end -->

<!-- TOC --><a name="edusynapse"></a>

# EduSynapse

Connor Love and TJ Raklovits

EduSynapse is an intelligent learning platform that combines state-of-the-art AI technology with proven learning methodologies to create a personalized and effective educational experience.

<!-- TOC --><a name="inspiration"></a>

## Inspiration

Education is undergoing a massive transformation, yet many students still struggle with traditional one-size-fits-all learning approaches. We were inspired by the potential of AI to create a truly personalized learning experience that adapts to each student's unique learning style, pace, and interests. The breakthrough in AI scaling techniques, particularly the S1 paper, showed us how we could make this vision a reality.

<!-- TOC --><a name="what-it-does"></a>

## What it does

EduSynapse is an intelligent learning platform powered by STEVE (System for Teaching, Evaluating, and Visualizing Education), our custom AI assistant. It creates personalized learning paths, provides interactive feedback, and helps students master complex topics through:

- **Adaptive Learning Paths**: Custom-tailored educational journeys based on your learning style
- **Interactive Code Execution**: Run Python and JavaScript directly in your browser
- **Knowledge Visualization**: Graph-based representation of concepts and their relationships
- **Spaced Repetition**: Smart review scheduling using our custom ease factor algorithm
- **Real-time AI Assistance**: STEVE is always available to help explain concepts and answer questions

<!-- TOC --><a name="how-we-built-it"></a>

## How we built it

We combined cutting-edge technologies to create a robust and scalable platform:

1. **AI Core**:

   - Custom-trained models using S1 scaling (steve-small, steve-medium)
   - Base model from Qwen 2.5
   - Local deployment using Ollama
   - DeepSeek-R1 for advanced reasoning

2. **Frontend**:

   - Next.js 14 with App Router
   - TypeScript for type safety
   - shadcn/ui for a beautiful, accessible interface
   - D3.js and React Force Graph for knowledge visualization
   - KaTeX for mathematical notation

3. **Backend**:
   - Prisma ORM with PostgreSQL
   - JWT authentication
   - Custom spaced repetition algorithm

<!-- TOC --><a name="challenges-we-ran-into"></a>

## Challenges we ran into

1. **AI Model Training**:

   - Implementing S1 scaling correctly
   - Balancing model size with performance
   - Ensuring consistent quality across different types of content

2. **Code Execution**:

   - Implementing secure sandboxing for Python and JavaScript
   - Managing memory usage with Pyodide
   - Ensuring fast execution times

3. **Database Management**:

- Using Prisma to store user information in a robust, no SQL way
- Handling race conditions and developing pooling

<!-- TOC --><a name="accomplishments-that-were-proud-of"></a>

## Accomplishments that we're proud of

1. Successfully implemented a custom AI scaling approach based on cutting-edge research
2. Created an intuitive knowledge graph visualization system
3. Developed a sophisticated spaced repetition algorithm that adapts to user performance
4. Built a secure, sandboxed code execution environment
5. Achieved seamless integration between AI assistance and human learning patterns

<!-- TOC --><a name="what-we-learned"></a>

## What we learned

1. **Database Management with Prisma**:

   - Efficient schema design for learning paths and user progress
   - Handling complex relationships between modules and user data
   - Implementing middleware for automatic timestamps and relations
   - Optimizing database queries for large-scale operations

2. **AI Integration with Ollama**:

   - Setting up local model deployment and management
   - Optimizing model loading and response times
   - Implementing proper error handling and fallbacks
   - Managing model weights and configurations
   - Balancing between different model sizes (steve-small vs steve-medium)

3. **Next.js App Router Architecture**:
   - Structuring routes for optimal performance
   - Managing server-side vs client-side rendering
   - Implementing efficient data fetching patterns
   - Handling dynamic imports and code splitting

<!-- TOC --><a name="whats-next-for-edusynapse"></a>

## What's next for EduSynapse

1. **Enhanced Collaboration**:

   - Real-time collaborative workspaces
   - Peer learning features
   - Study group formation based on learning styles
   - Shared note-taking and annotation tools

2. **Advanced AI Features**:

   - More sophisticated knowledge mapping
   - Improved personalization algorithms
   - Integration with additional AI models
   - Enhanced natural language understanding

3. **Platform Expansion**:

   - Mobile application development
   - Offline learning capabilities
   - Integration with existing LMS systems
   - Support for more programming languages

4. **Learning Analytics**:
   - Advanced progress tracking
   - Predictive learning patterns
   - Detailed performance analytics
   - Learning style optimization

We're committed to making EduSynapse the most effective and accessible learning platform, helping students worldwide achieve their educational goals through the power of AI-assisted learning.

<!-- TOC --><a name="getting-started-experience"></a>

## Getting Started Experience

1. **Welcome Question**:

   - Live-generated unique question based on your interests
   - Demonstrates AI capabilities from the start
   - Personalized interaction to gauge your knowledge level

2. **User Profile Setup**:
   - Learning style assessment (Visual, Auditory, Reading/Writing, Kinesthetic)
   - Theme customization (Light/Dark mode, accent colors)
   - Profile picture and display name
   - Personal interests and goals tracking

<!-- TOC --><a name="main-workflow"></a>

## Main Workflow

1. **Create Learning Path**: Start by creating a personalized learning path for any topic. The AI analyzes your interests and learning style to structure the perfect learning journey.

2. **Module-Based Learning**: Each learning path is broken down into smaller, digestible modules that include:

   - Introduction and overview
   - Core concepts
   - Interactive examples
   - Key points
   - Practice quizzes

3. **Module Creation**: Create custom modules to learn, including:
   - Rich text content
   - Code examples with live execution
   - Interactive elements
   - Assessment questions

<!-- TOC --><a name="interactive-code-execution"></a>

## Interactive Code Execution

All code blocks in content and examples support live execution:

- **Python**: Run Python code directly in your browser using Pyodide
- **JavaScript**: Execute JavaScript code using secure eval
- **Real-time Output**: See results instantly
- **Interactive Examples**: Modify and experiment with code on the fly

<!-- TOC --><a name="meet-steve-your-ai-learning-assistant"></a>

## Meet STEVE - Your AI Learning Assistant

STEVE (System for Teaching, Evaluating, and Visualizing Education) is the powerful AI that drives EduSynapse. As your dedicated learning companion, STEVE helps you master new skills and build knowledge effectively:

- **Personalized Learning Paths**: Analyzes your interests and learning style to create custom educational journeys
- **Interactive Teaching**: Explains complex concepts with step-by-step breakdowns
- **Adaptive Support**: Adjusts difficulty and pacing based on your performance
- **Real-time Help**: Available 24/7 to answer questions and provide guidance

STEVE comes equipped with three powerful tools:

1. **File Reader**:

   - Reads and analyzes your uploaded learning materials
   - Extracts key concepts and creates study notes

2. **Think Tool**:

   - Powered by DeepSeek-R1 for advanced reasoning
   - Step-by-step explanation of solutions
   - Helps break down difficult concepts into understandable parts
   - Deep understanding of programming concepts and mathematics

3. **Calculator**:
   - Handles mathematical calculations of any complexity
   - Shows detailed work and explanations
   - Supports various mathematical notations and formats

<!-- TOC --><a name="core-features"></a>

## Core Features

- **AI-Powered Learning**: Utilizing a custom-trained AI model based on the S1 (Simple test-time scaling) approach from [this research paper](https://arxiv.org/pdf/2501.19393) and implemented using the [simplescaling/s1](https://github.com/simplescaling/s1) framework.

- **Adaptive Learning Paths**: Dynamically generated learning paths based on your learning style, interests, and progress.

- **Spaced Repetition System**: Implements an advanced spaced repetition algorithm using our custom ease factor formula:

  ```typescript
  EF' = EF * (1 + a) ^ s    // for correct answers
  EF' = EF * (1 - b) ^ s   // for incorrect answers
  ```

  where:

  - EF' is the new ease factor
  - EF is the current ease factor (default: 2.5)
  - a = 0.1 (correct answer factor)
  - b = 0.2 (incorrect answer factor)
  - Minimum ease factor: 1.3

- **Knowledge Graph**: Visual representation of learning concepts and their relationships.

- **Interactive Practice**: AI-generated practice questions with intelligent grading and feedback.

- **Progress Tracking**:

  - Detailed analytics
  - Learning style assessment
  - Performance metrics
  - Study streaks
  - Module creation and organization

- **Personalization**:
  - Learning style quiz
  - Interest-based recommendations
  - Adaptive difficulty scaling

<!-- TOC --><a name="technical-stack"></a>

## Technical Stack

- **Frontend**:

  - Next.js 14 with App Router
  - TypeScript for type safety
  - shadcn/ui for beautiful, accessible components
  - Tailwind CSS for styling
  - React Query for data fetching
  - KaTeX for mathematical notation
  - D3.js and React Force Graph for visualizations
  - React Beautiful DnD for drag-and-drop

- **Backend**:

  - Prisma ORM for database operations
  - PostgreSQL database
  - RESTful API endpoints
  - JWT authentication
  - Ollama for local AI model hosting

- **Content & Editing**:

  - Custom code editor with syntax highlighting
  - Markdown support with React Markdown
  - Math equations with KaTeX
  - Code syntax highlighting with Prism.js
  - Rich text editing capabilities

- **AI Integration**:

  - Custom-trained model using S1 scaling (steve-small, steve-medium)
  - Natural language processing for content understanding
  - Automated question generation
  - Intelligent answer grading
  - Personalized recommendations

- **Security**:
  - Role-based access control
  - Secure authentication
  - Data encryption
  - Privacy protection

<!-- TOC --><a name="development-setup"></a>

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:

   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   ```

4. Run database migrations: `npx prisma migrate dev`
5. Run the development server: `npm run dev`

<!-- TOC --><a name="acknowledgments"></a>

## Acknowledgments

- [S1 Simple test-time scaling paper](https://arxiv.org/pdf/2501.19393)
- [simplescaling/s1](https://github.com/simplescaling/s1) framework
- [Pyodide](https://pyodide.org) for in-browser Python execution
- [DeepSeek](https://deepseek.ai) for the DeepSeek-R1 model powering our Think Tool
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Ollama](https://ollama.com) for local LLM hosting
- [qwen2.5](https://github.com/QwenLM/Qwen2.5) for the base model of STEVE

