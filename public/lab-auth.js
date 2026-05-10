// lab-auth.js - authentication module for lab page
// provides user state management and session checking

(function() {
  'use strict';

  const labauth = {
    user: null,
    listeners: [],
    initialized: false,

    init() {
      console.log('lab-auth: init called, _supabaseClient exists:', !!window._supabaseClient);
      this.waitForSupabase();
    },

    waitForSupabase() {
      // auth.js creates _supabaseClient asynchronously
      // keep checking until it's available
      if (window._supabaseClient) {
        console.log('lab-auth: found _supabaseClient, initializing...');
        this.initialized = true;
        this.checkSession();
        this.setupAuthListener();
      } else {
        console.log('lab-auth: waiting for _supabaseClient...');
        setTimeout(() => this.waitForSupabase(), 500);
      }
    },

    async checkSession() {
      if (!window._supabaseClient) return;

      console.log('lab-auth: checking session...');
      const { data: { session }, error } = await window._supabaseClient.auth.getSession();
      if (error) console.error('lab-auth: getSession error:', error);
      console.log('lab-auth: session found:', !!session);
      this.user = session?.user || null;
      this.notifyListeners();
    },

    setupAuthListener() {
      if (!window._supabaseClient) return;

      window._supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          this.user = session?.user || null;
        } else if (event === 'SIGNED_OUT') {
          this.user = null;
        }
        this.notifyListeners();
      });
    },

    isLoggedIn() {
      return !!this.user;
    },

    getUser() {
      return this.user;
    },

    onAuthChange(callback) {
      this.listeners.push(callback);
    },

    notifyListeners() {
      this.listeners.forEach(cb => cb(this.user));
    },

    redirectToAuth() {
      window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
    }
  };

  window.labauth = labauth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => labauth.init());
  } else {
    labauth.init();
  }
})();
