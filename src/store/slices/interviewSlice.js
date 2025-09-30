import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Interview session data
  sessionId: null,
  candidateInfo: {
    name: '',
    email: '',
    phone: '',
    resume: null
  },
  
  // Questions and flow
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  
  // Timer and status
  timeRemaining: 0,
  isTimerActive: false,
  
  // Interview state
  status: 'not-started', // not-started, in-progress, completed, abandoned
  startTime: null,
  endTime: null,
  
  // Loading states
  loading: {
    questions: false,
    submission: false
  },
  
  error: null
}

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // Session management
    startInterview: (state, action) => {
      state.sessionId = action.payload.sessionId
      state.candidateInfo = action.payload.candidateInfo
      state.questions = action.payload.questions
      state.status = 'in-progress'
      state.startTime = new Date().toISOString()
      state.currentQuestionIndex = 0
      state.answers = []
      state.error = null
    },
    
    abandonInterview: (state) => {
      state.status = 'abandoned'
      state.endTime = new Date().toISOString()
      state.isTimerActive = false
      state.timeRemaining = 0
    },
    
    completeInterview: (state) => {
      state.status = 'completed'
      state.endTime = new Date().toISOString()
      state.isTimerActive = false
      state.timeRemaining = 0
    },
    
    resetInterview: (state) => {
      return initialState
    },
    
    // Question navigation
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload
      const currentQuestion = state.questions[action.payload]
      if (currentQuestion) {
        state.timeRemaining = currentQuestion.timeLimit
        state.isTimerActive = true
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1
        const currentQuestion = state.questions[state.currentQuestionIndex]
        if (currentQuestion) {
          state.timeRemaining = currentQuestion.timeLimit
          state.isTimerActive = true
        }
      } else {
        // Last question completed
        state.status = 'completed'
        state.endTime = new Date().toISOString()
        state.isTimerActive = false
        state.timeRemaining = 0
      }
    },
    
    // Timer management
    startTimer: (state) => {
      state.isTimerActive = true
    },
    
    pauseTimer: (state) => {
      state.isTimerActive = false
    },
    
    updateTimer: (state, action) => {
      state.timeRemaining = action.payload
      if (state.timeRemaining <= 0) {
        state.isTimerActive = false
        // Auto-skip to next question when time runs out
      }
    },
    
    // Answer management
    submitAnswer: (state, action) => {
      const { questionIndex, answer, timeTaken } = action.payload
      
      // Update or add answer
      const existingAnswerIndex = state.answers.findIndex(a => a.questionIndex === questionIndex)
      const answerData = {
        questionIndex,
        answer,
        timeTaken,
        submittedAt: new Date().toISOString()
      }
      
      if (existingAnswerIndex >= 0) {
        state.answers[existingAnswerIndex] = answerData
      } else {
        state.answers.push(answerData)
      }
      
      state.isTimerActive = false
    },
    
    skipQuestion: (state, action) => {
      const { questionIndex, timeTaken } = action.payload
      
      // Mark as skipped (0 score)
      const answerData = {
        questionIndex,
        answer: '',
        timeTaken,
        skipped: true,
        submittedAt: new Date().toISOString()
      }
      
      state.answers.push(answerData)
      state.isTimerActive = false
    },
    
    // Loading states
    setQuestionsLoading: (state, action) => {
      state.loading.questions = action.payload
    },
    
    setSubmissionLoading: (state, action) => {
      state.loading.submission = action.payload
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  startInterview,
  abandonInterview,
  completeInterview,
  resetInterview,
  setCurrentQuestion,
  nextQuestion,
  startTimer,
  pauseTimer,
  updateTimer,
  submitAnswer,
  skipQuestion,
  setQuestionsLoading,
  setSubmissionLoading,
  setError,
  clearError
} = interviewSlice.actions

export default interviewSlice.reducer