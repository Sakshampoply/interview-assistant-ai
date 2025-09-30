'use client'

import { useDispatch } from 'react-redux'
import { clearSelection } from '../store/slices/dashboardSlice'

export default function InterviewDetails({ interview }) {
  const dispatch = useDispatch()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = Math.round((end - start) / 1000 / 60)
    return `${duration} minutes`
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
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

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Hire':
        return 'bg-green-100 text-green-800'
      case 'Consider':
        return 'bg-yellow-100 text-yellow-800'
      case 'Reject':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Interview Details: {interview.candidateInfo.name}
            </h1>
            <p className="text-gray-600">
              Completed on {formatDate(interview.completedAt)}
            </p>
          </div>
          <button
            onClick={() => dispatch(clearSelection())}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* Candidate Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Candidate Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <p className="text-gray-900">{interview.candidateInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-gray-900">{interview.candidateInfo.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Phone</label>
            <p className="text-gray-900">{interview.candidateInfo.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Resume</label>
            <p className="text-gray-900">{interview.candidateInfo.resume || 'Not uploaded'}</p>
          </div>
        </div>
      </div>

      {/* Interview Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Interview Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {interview.evaluation?.overallScore || 'N/A'}/10
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              interview.evaluation ? getRecommendationColor(interview.evaluation.recommendation) : 'bg-gray-100 text-gray-800'
            }`}>
              {interview.evaluation?.recommendation || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Recommendation</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {interview.endTime ? formatDuration(interview.startTime, interview.endTime) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {interview.questions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
        </div>

        {interview.evaluation?.summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">AI Assessment Summary</h3>
            <p className="text-blue-800">{interview.evaluation.summary}</p>
          </div>
        )}
      </div>

      {/* Strengths and Improvements */}
      {interview.evaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-2">
              {interview.evaluation.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {interview.evaluation.improvements?.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Questions and Answers */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Questions and Answers</h3>
        
        <div className="space-y-6">
          {interview.questions?.map((question, index) => {
            const answer = interview.answers?.find(a => a.questionIndex === index)
            const evaluation = interview.evaluation?.individualScores?.find(s => s.questionIndex === index)
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">Question {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {question.timeLimit}s • {question.category}
                    </span>
                  </div>
                  {evaluation && (
                    <div className={`text-lg font-bold ${getScoreColor(evaluation.score)}`}>
                      {evaluation.score}/10
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-800 font-medium mb-2">Question:</p>
                  <p className="text-gray-700">{question.question}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-800 font-medium mb-2">Candidate&apos;s Answer:</p>
                  <div className="bg-gray-50 rounded p-3">
                    {answer ? (
                      <>
                        <p className="text-gray-700">{answer.answer || 'Question was skipped'}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Time taken: {answer.timeTaken}s</span>
                          {answer.skipped && <span className="text-yellow-600">• Skipped</span>}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No answer provided</p>
                    )}
                  </div>
                </div>
                
                {evaluation?.feedback && (
                  <div>
                    <p className="text-gray-800 font-medium mb-2">AI Feedback:</p>
                    <p className="text-gray-700">{evaluation.feedback}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Interview Metadata */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Interview Metadata</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Session ID:</span>
            <span className="ml-2 text-gray-900">{interview.sessionId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>
            <span className="ml-2 text-gray-900 capitalize">{interview.status}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Started:</span>
            <span className="ml-2 text-gray-900">{formatDate(interview.startTime)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Completed:</span>
            <span className="ml-2 text-gray-900">
              {interview.endTime ? formatDate(interview.endTime) : 'Not completed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}