'use client'

import { useSelector, useDispatch } from 'react-redux'
import { setActiveTab } from '../store/slices/dashboardSlice'
import IntervieweeTab from '../components/IntervieweeTab'
import InterviewerTab from '../components/InterviewerTab'

export default function Home() {
  const { activeTab } = useSelector((state) => state.dashboard)
  const dispatch = useDispatch()

  const tabs = [
    { id: 'interviewee', label: 'Interviewee Dashboard', icon: '👤' },
    { id: 'interviewer', label: 'Interviewer Dashboard', icon: '👨‍💼' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🤖 AI Interview Assistant
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Gemini AI
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setActiveTab(tab.id))}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'interviewee' && <IntervieweeTab />}
        {activeTab === 'interviewer' && <InterviewerTab />}
      </main>
    </div>
  )
}