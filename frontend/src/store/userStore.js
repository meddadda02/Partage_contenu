import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,  // Récupère le token depuis le localStorage
  isAuthenticated: !!localStorage.getItem('access_token'),  // Vérifie si l'utilisateur est authentifié
  setUser: (user, token) => {
    // Sauvegarder l'utilisateur et le token dans le store et le localStorage
    localStorage.setItem('access_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    // Retirer le token du localStorage et réinitialiser l'état
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
