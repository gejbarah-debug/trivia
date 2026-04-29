// URL of the Cloudflare Worker that generates fresh trivia questions.
// Replace with your deployed worker URL after running `wrangler deploy`.
// Set to "" to disable LLM-generated questions (game falls back to static pool).
window.TRIVIA_WORKER_URL = "";

// Firebase initialization. Config below is public (Firebase web config is meant
// to be exposed; security comes from database rules).
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyABLcjz_ca-DYxTpWcz7aHrgxDxYxp-jkk",
    authDomain: "trivia-mp.firebaseapp.com",
    databaseURL: "https://trivia-mp-default-rtdb.firebaseio.com",
    projectId: "trivia-mp",
    storageBucket: "trivia-mp.firebasestorage.app",
    messagingSenderId: "118685802156",
    appId: "1:118685802156:web:ead4c87d4268dc96094909",
  };

  firebase.initializeApp(firebaseConfig);
  window.FB_DB = firebase.database();

  // Track server-time offset so all clients agree on `serverNow()` for the timer.
  // We expose a Promise that resolves the first time Firebase reports an offset,
  // so the game can wait for clock sync before starting the per-question timer.
  let serverTimeOffset = 0;
  let isReady = false;
  let resolveReady;
  window.serverTimeReady = new Promise((res) => { resolveReady = res; });
  window.isServerTimeReady = () => isReady;

  window.FB_DB.ref(".info/serverTimeOffset").on("value", (snap) => {
    serverTimeOffset = snap.val() || 0;
    if (!isReady) {
      isReady = true;
      resolveReady(serverTimeOffset);
    }
  });

  window.serverNow = () => Date.now() + serverTimeOffset;
})();
