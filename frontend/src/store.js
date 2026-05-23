import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from './supabase';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        profile: null,
        isPsychologist: false,
        consentGiven: null,
        onboarded: null,
        showLanding: true,

        setUser: (user) => set({ user }),
        setShowLanding: (v) => set({ showLanding: v }),

        checkOnboarding: async (userId) => {
          const { data } = await supabase
            .from('profiles')
            .select('onboarded, display_name, concerns, urgency, goals, role, consent_given')
            .eq('id', userId)
            .single();

          if (!data) return;

          set({
            profile: data,
            onboarded: data.onboarded === true,
            consentGiven: data.consent_given === true,
            isPsychologist: data.role === 'psychologist',
          });
        },

        login: async (user) => {
          set({ user, showLanding: false });
          await get().checkOnboarding(user.id);
        },

        logout: async () => {
          await supabase.auth.signOut();
          set({
            user: null,
            profile: null,
            isPsychologist: false,
            consentGiven: null,
            onboarded: null,
            showLanding: true,
          });
        },

        giveConsent: () => set({ consentGiven: true }),
        completeOnboarding: () => set({ onboarded: true }),
      }),
      {
        name: 'psycheflow-auth',
        partialize: (state) => ({ showLanding: state.showLanding }),
      }
    )
  )
);

export const useAssessmentStore = create(
  devtools((set) => ({
    results: null,
    fullReport: null,
    screen: 'home',
    setResults: (results) => set({ results }),
    setFullReport: (fullReport) => set({ fullReport }),
    setScreen: (screen) => set({ screen }),
    reset: () => set({ results: null, fullReport: null, screen: 'home' }),
  }))
);
