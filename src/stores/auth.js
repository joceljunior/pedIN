import { reactive } from 'vue'
import Parse from '../services/parse'

export const authStore = reactive({
  user: null,
  role: null,
  isAuthenticated: false,

  async init() {
    const currentUser = Parse.User.current()
    if (currentUser) {
      this.user = currentUser
      this.role = currentUser.get('role')
      this.isAuthenticated = true
    }
  },

  async login(username, password) {
    try {
      const user = await Parse.User.logIn(username, password)
      this.user = user
      this.role = user.get('role')
      this.isAuthenticated = true
      return { success: true, role: this.role }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async logout() {
    try {
      await Parse.User.logOut()
      this.user = null
      this.role = null
      this.isAuthenticated = false
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
})
