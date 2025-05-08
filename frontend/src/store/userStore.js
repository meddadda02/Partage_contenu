import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  initUser: () => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      if (user && token) {
        set({
          user: JSON.parse(user),
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  },

  setUser: (user, token) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
}));
