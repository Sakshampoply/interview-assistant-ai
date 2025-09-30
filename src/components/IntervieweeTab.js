'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { startInterview, resetInterview } from '../store/slices/interviewSlice'
import InterviewSetup from './InterviewSetup'
import InterviewSession from './InterviewSession'
import InterviewResults from './InterviewResults'

export default function IntervieweeTab() {
  const { status, candidateInfo, sessionId } = useSelector((state) => state.interview)
  const dispatch = useDispatch()

  const handleStartNewInterview = () => {
    dispatch(resetInterview())
  }

  const renderContent = () => {
    switch (status) {
      case 'not-started':
        return <InterviewSetup key="interview-setup" />
      
      case 'in-progress':
        return <InterviewSession key="interview-session" />
      
      case 'completed':
        return <InterviewResults key="interview-results" />
      
      case 'abandoned':
        return (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Abandoned</h3>
              <p className="text-gray-600 mb-4">
                Your interview session was abandoned. You can start a new interview anytime.
              </p>
              <button
                onClick={handleStartNewInterview}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Interview
              </button>
            </div>
          </div>
        )
      
      default:
        return <InterviewSetup />
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      {status !== 'not-started' && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                status === 'in-progress' ? 'bg-green-500' : 
                status === 'completed' ? 'bg-blue-500' : 
                'bg-yellow-500'
              }`} />
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {candidateInfo.name ? `${candidateInfo.name}'s Interview` : 'Interview Session'}
                </h2>
                <p className="text-sm text-gray-500">
                  Status: {status === 'in-progress' ? 'In Progress' : 
                          status === 'completed' ? 'Completed' : 
                          status === 'abandoned' ? 'Abandoned' : 'Not Started'}
                  {sessionId && ` • Session ID: ${sessionId.slice(-8)}`}
                </p>
              </div>
            </div>
            
            {(status === 'completed' || status === 'abandoned') && (
              <button
                onClick={handleStartNewInterview}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Start New Interview
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {renderContent()}
    </div>
  )
}