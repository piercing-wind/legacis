import { configureStore, combineReducers, UnknownAction } from '@reduxjs/toolkit'
import counterSlice from '@/lib/slices/counterSlice'
import authModelSlice from '@/lib/slices/authSlice'
import profileSlice from '@/lib/slices/profile'
import serviceSlice from '@/lib/slices/serviceSlice'
import checkoutSlice from '@/lib/slices/checkoutSlice'

const appReducer = combineReducers({
  counter: counterSlice,
  auth: authModelSlice,
  profile: profileSlice,
  service : serviceSlice,
  checkout : checkoutSlice
})

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (action.type === 'RESET_APP') {
    return appReducer(undefined, action) // resets all slices to initial state
  }
  return appReducer(state, action)
}

const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store

export function resetGlobalState(dispatch: AppDispatch) {
  dispatch({ type: 'RESET_APP' });
}
