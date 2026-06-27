import { createSlice } from '@reduxjs/toolkit'

const initialToken = localStorage.getItem('vendorToken') || null
let initialVendor = null

try {
  const storedVendor = localStorage.getItem('vendorUser')
  if (storedVendor) {
    initialVendor = JSON.parse(storedVendor)
  }
} catch (e) {
  console.error('Failed to parse initial vendor user state:', e)
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    vendor: initialVendor,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
      if (action.payload) {
        localStorage.setItem('vendorToken', action.payload)
      } else {
        localStorage.removeItem('vendorToken')
      }
    },
    setVendor: (state, action) => {
      state.vendor = action.payload
      if (action.payload) {
        localStorage.setItem('vendorUser', JSON.stringify(action.payload))
      } else {
        localStorage.removeItem('vendorUser')
      }
    },
    clearAuth: (state) => {
      state.token = null
      state.vendor = null
      localStorage.removeItem('vendorToken')
      localStorage.removeItem('vendorUser')
    }
  }
})

export const { setToken, setVendor, clearAuth } = authSlice.actions
export default authSlice.reducer
