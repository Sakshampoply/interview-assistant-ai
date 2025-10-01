'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  nextQuestion, 
  submitAnswer, 
  skipQuestion, 
  updateTimer, 
  startTimer, 
  pauseTimer,
  abandonInterview,
  completeInterview,
  setSubmissionLoading 
} from '../store/slices/interviewSlice'
import { addCompletedInterview } from '../store/slices/dashboardSlice'

export default function InterviewSession() {
  const { 
    questions, 
    currentQuestionIndex, 
    answers, 
    timeRemaining, 
    isTimerActive,
    candidateInfo,
    sessionId,
    startTime,
    loading
  } = useSelector((state) => state.interview)
  
  const dispatch = useDispatch()
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showConfirmAbandon, setShowConfirmAbandon] = useState(false)
  const intervalRef = useRef(null)
  const questionStartTime = useRef(Date.now())

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const evaluateInterview = async () => {
    dispatch(setSubmissionLoading(true))
    
    try {
      // Prepare answers for evaluation
      const allAnswers = [...answers]
      
      // Add current answer if exists
      if (currentAnswer.trim()) {
        const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000)
        allAnswers.push({
          questionIndex: currentQuestionIndex,
          answer: currentAnswer.trim(),
          timeTaken
        })
      }

      const response = await fetch('/api/evaluate-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questions,
          answers: allAnswers.map(ans => ({
            answer: ans.answer,
            timeTaken: ans.timeTaken
          }))
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Complete interview and save to dashboard
        dispatch(completeInterview())
        dispatch(addCompletedInterview({
          sessionId,
          candidateInfo,
          questions,
          answers: allAnswers,
          evaluation: result.evaluation,
          startTime,
          endTime: new Date().toISOString(),
          status: 'completed'
        }))
      }
    } catch (error) {
      console.error('Evaluation failed:', error)
    }
    
    dispatch(setSubmissionLoading(false))
  }

  const handleSkipQuestion = useCallback(() => {
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000)
    
    dispatch(skipQuestion({
      questionIndex: currentQuestionIndex,
      timeTaken
    }))

    if (isLastQuestion) {
      evaluateInterview()
    } else {
      dispatch(nextQuestion())
    }
  }, [currentQuestionIndex, isLastQuestion, dispatch, evaluateInterview])

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        dispatch(updateTimer(timeRemaining - 1))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      
      // Auto-skip when timer reaches 0
      if (timeRemaining === 0 && isTimerActive) {
        handleSkipQuestion()
      }
    }

    return () => clearInterval(intervalRef.current)
  }, [isTimerActive, timeRemaining, dispatch, handleSkipQuestion])

  // Start timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      dispatch(updateTimer(currentQuestion.timeLimit))
      dispatch(startTimer())
      questionStartTime.current = Date.now()
      setCurrentAnswer('')
    }
  }, [currentQuestionIndex, currentQuestion, dispatch])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return

    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000)
    
    dispatch(submitAnswer({
      questionIndex: currentQuestionIndex,
      answer: currentAnswer.trim(),
      timeTaken
    }))

    if (isLastQuestion) {
      // Complete interview and evaluate
      await evaluateInterview()
    } else {
      dispatch(nextQuestion())
    }
  }

  const handleAbandonInterview = () => {
    dispatch(abandonInterview())
    dispatch(addCompletedInterview({
      sessionId,
      candidateInfo,
      questions,
      answers,
      startTime,
      endTime: new Date().toISOString(),
      status: 'abandoned'
    }))
    setShowConfirmAbandon(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!currentQuestion) {
    return <div className="text-center py-8">Loading question...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Interview Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Question</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`text-lg font-mono ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
            <button
              onClick={() => setShowConfirmAbandon(true)}
              className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Abandon Interview
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm text-gray-500">
            ({answers.length} answered, {questions.length - answers.length - 1} remaining)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Question {currentQuestionIndex + 1}</h2>
            <span className="text-sm text-gray-500">• {currentQuestion.category}</span>
          </div>
          <p className="text-gray-800 text-lg leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
              disabled={timeRemaining === 0}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentAnswer.length} characters
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSkipQuestion}
                disabled={loading.submission}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Skip Question
              </button>
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || loading.submission}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading.submission ? 'Processing...' : isLastQuestion ? 'Complete Interview' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Interview Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{answers.length}</div>
            <div className="text-xs text-gray-500">Answered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{answers.filter(a => a.skipped).length}</div>
            <div className="text-xs text-gray-500">Skipped</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((Date.now() - new Date(startTime)) / 1000 / 60)}
            </div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{questions.length - currentQuestionIndex - 1}</div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
        </div>
      </div>

      {/* Confirm Abandon Modal */}
      {showConfirmAbandon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Abandon Interview?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to abandon this interview? All progress will be lost and cannot be recovered.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmAbandon(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={handleAbandonInterview}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}