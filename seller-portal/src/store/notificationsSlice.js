import { createSlice } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      const list = action.payload || []
      state.list = list
      state.unreadCount = list.filter(n => !n.isRead).length
    },
    markRead: (state, action) => {
      const id = action.payload
      const item = state.list.find(n => n.id === id || n._id === id)
      if (item && !item.isRead) {
        item.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllRead: (state) => {
      state.list.forEach(n => {
        n.isRead = true
      })
      state.unreadCount = 0
    }
  }
})

export const { setNotifications, markRead, markAllRead } = notificationsSlice.actions
export default notificationsSlice.reducer
