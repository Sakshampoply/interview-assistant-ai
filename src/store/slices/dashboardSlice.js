import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Completed interviews
  completedInterviews: [],
  
  // Current view
  activeTab: 'interviewee', // interviewee, interviewer
  
  // Filters and search
  filters: {
    status: 'all', // all, completed, abandoned
    dateRange: 'all', // all, today, week, month
    searchTerm: ''
  },
  
  // Selected interview for detailed view
  selectedInterview: null,
  
  // Statistics
  stats: {
    totalInterviews: 0,
    completedInterviews: 0,
    abandonedInterviews: 0,
    averageScore: 0,
    averageTime: 0
  }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Tab management
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    
    // Interview management
    addCompletedInterview: (state, action) => {
      const interview = {
        ...action.payload,
        id: Date.now().toString(),
        completedAt: new Date().toISOString()
      }
      state.completedInterviews.push(interview)
      
      // Update statistics
      state.stats.totalInterviews = state.completedInterviews.length
      state.stats.completedInterviews = state.completedInterviews.filter(i => i.status === 'completed').length
      state.stats.abandonedInterviews = state.completedInterviews.filter(i => i.status === 'abandoned').length
      
      // Calculate average score for completed interviews
      const completedWithScores = state.completedInterviews.filter(i => i.status === 'completed' && i.evaluation)
      if (completedWithScores.length > 0) {
        const totalScore = completedWithScores.reduce((sum, i) => sum + (i.evaluation.overallScore || 0), 0)
        state.stats.averageScore = Math.round(totalScore / completedWithScores.length * 10) / 10
      }
      
      // Calculate average time
      const completedInterviews = state.completedInterviews.filter(i => i.status === 'completed')
      if (completedInterviews.length > 0) {
        const totalTime = completedInterviews.reduce((sum, i) => {
          const start = new Date(i.startTime)
          const end = new Date(i.endTime)
          return sum + (end - start)
        }, 0)
        state.stats.averageTime = Math.round(totalTime / completedInterviews.length / 1000 / 60) // in minutes
      }
    },
    
    removeInterview: (state, action) => {
      state.completedInterviews = state.completedInterviews.filter(i => i.id !== action.payload)
    },
    
    // Selection
    selectInterview: (state, action) => {
      state.selectedInterview = action.payload
    },
    
    clearSelection: (state) => {
      state.selectedInterview = null
    },
    
    // Filters
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload
    },
    
    setDateRangeFilter: (state, action) => {
      state.filters.dateRange = action.payload
    },
    
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        dateRange: 'all',
        searchTerm: ''
      }
    }
  }
})

export const {
  setActiveTab,
  addCompletedInterview,
  removeInterview,
  selectInterview,
  clearSelection,
  setStatusFilter,
  setDateRangeFilter,
  setSearchTerm,
  clearFilters
} = dashboardSlice.actions

export default dashboardSlice.reducer