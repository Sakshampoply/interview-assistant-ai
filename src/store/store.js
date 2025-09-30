import { configureStore } from '@reduxjs/toolkit'
import interviewSlice from './slices/interviewSlice'
import dashboardSlice from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    interview: interviewSlice,
    dashboard: dashboardSlice,
  },
})

export default store