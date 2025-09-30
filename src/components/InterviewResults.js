'use client'

import { useSelector, useDispatch } from 'react-redux'
import { resetInterview } from '../store/slices/interviewSlice'

export default function InterviewResults() {
  const { candidateInfo, questions, answers, startTime, endTime } = useSelector((state) => state.interview)
  const { completedInterviews } = useSelector((state) => state.dashboard)
  const dispatch = useDispatch()

  // Find the latest completed interview for this session
  const latestInterview = completedInterviews[completedInterviews.length - 1]
  const evaluation = latestInterview?.evaluation

  const calculateDuration = () => {
    if (!startTime || !endTime) return 'N/A'
    const duration = Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60)
    return `${duration} minutes`
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
          <p className="text-gray-600">
            Thank you for completing the interview. Here are your results:
          </p>
        </div>
      </div>

      {/* Overall Results */}
      {evaluation && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                {evaluation.overallScore}/10
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(evaluation.recommendation)}`}>
                {evaluation.recommendation}
              </div>
              <div className="text-sm text-gray-600 mt-1">Recommendation</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{calculateDuration()}</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>

          {evaluation.summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{evaluation.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Strengths and Areas for Improvement */}
      {evaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-2">
              {evaluation.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
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
              {evaluation.improvements?.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Individual Question Results */}
      {evaluation?.individualScores && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Question-by-Question Breakdown</h3>
          
          <div className="space-y-4">
            {evaluation.individualScores.map((result, index) => {
              const question = questions[result.questionIndex]
              const answer = answers.find(a => a.questionIndex === result.questionIndex)
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">Q{result.questionIndex + 1}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        question?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        question?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question?.difficulty}
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/10
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{question?.question}</p>
                  
                  {answer && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                      <p className="text-gray-800">{answer.answer || 'Skipped'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Time taken: {answer.timeTaken}s
                      </p>
                    </div>
                  )}
                  
                  {result.feedback && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                      <p className="text-gray-700">{result.feedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Interview Statistics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Interview Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {answers.filter(a => a.answer && !a.skipped).length}
            </div>
            <div className="text-sm text-gray-600">Answered</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {answers.filter(a => a.skipped).length}
            </div>
            <div className="text-sm text-gray-600">Skipped</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {evaluation?.totalTime ? Math.round(evaluation.totalTime / 60) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Total Time (min)</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-gray-900">What&apos;s Next?</h3>
          <p className="text-gray-600">
            Your interview results have been saved. You can take another interview anytime.
          </p>
          <button
            onClick={() => dispatch(resetInterview())}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Another Interview
          </button>
        </div>
      </div>
    </div>
  )
}