import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import interviewSlice from './slices/interviewSlice'
import dashboardSlice from './slices/dashboardSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['dashboard'] // Only persist the dashboard slice
}

const rootReducer = combineReducers({
  interview: interviewSlice,
  dashboard: dashboardSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
})

export const persistor = persistStore(store)