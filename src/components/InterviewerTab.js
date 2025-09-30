'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  setStatusFilter, 
  setDateRangeFilter, 
  setSearchTerm, 
  selectInterview, 
  removeInterview 
} from '../store/slices/dashboardSlice'
import InterviewDetails from './InterviewDetails'

export default function InterviewerTab() {
  const { 
    completedInterviews, 
    filters, 
    selectedInterview, 
    stats 
  } = useSelector((state) => state.dashboard)
  const dispatch = useDispatch()

  // Filter interviews based on current filters
  const filteredInterviews = completedInterviews.filter(interview => {
    // Status filter
    if (filters.status !== 'all' && interview.status !== filters.status) {
      return false
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const interviewDate = new Date(interview.completedAt)
      const now = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          if (interviewDate.toDateString() !== now.toDateString()) return false
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (interviewDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (interviewDate < monthAgo) return false
          break
      }
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesName = interview.candidateInfo.name.toLowerCase().includes(searchLower)
      const matchesEmail = interview.candidateInfo.email.toLowerCase().includes(searchLower)
      if (!matchesName && !matchesEmail) return false
    }

    return true
  })

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = Math.round((end - start) / 1000 / 60) // minutes
    return `${duration} min`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'abandoned':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getScoreBadge = (score) => {
    if (!score) return null
    const baseClasses = 'px-2 py-1 text-xs font-bold rounded'
    if (score >= 8) return `${baseClasses} bg-green-100 text-green-800`
    if (score >= 6) return `${baseClasses} bg-yellow-100 text-yellow-800`
    return `${baseClasses} bg-red-100 text-red-800`
  }

  if (selectedInterview) {
    return <InterviewDetails interview={selectedInterview} />
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageScore ? `${stats.averageScore}/10` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageTime ? `${stats.averageTime}m` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => dispatch(setDateRangeFilter(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Interview Results ({filteredInterviews.length})
          </h3>
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-500">No interviews match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInterviews.map((interview) => (
              <div key={interview.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {interview.candidateInfo.name}
                      </h4>
                      <span className={getStatusBadge(interview.status)}>
                        {interview.status}
                      </span>
                      {interview.evaluation?.overallScore && (
                        <span className={getScoreBadge(interview.evaluation.overallScore)}>
                          {interview.evaluation.overallScore}/10
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{interview.candidateInfo.email}</span>
                      <span>•</span>
                      <span>{formatDate(interview.completedAt)}</span>
                      {interview.endTime && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(interview.startTime, interview.endTime)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => dispatch(selectInterview(interview))}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => dispatch(removeInterview(interview.id))}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}