(function () {
  // ─── STEP 1: Paste your Firebase config here ───────────────────────────────
  // Go to https://console.firebase.google.com → your project → Project Settings
  // → "Your apps" → web app → SDK setup and configuration → Config
  var firebaseConfig = {
    apiKey:            "AIzaSyBMZLa5kaIkWmHGACDsteJ2tvsHDjzbjAk",
    authDomain:        "the-cactus-auto-spa.firebaseapp.com",
    projectId:         "the-cactus-auto-spa",
    storageBucket:     "the-cactus-auto-spa.firebasestorage.app",
    messagingSenderId: "346514331881",
    appId:             "1:346514331881:web:35b4c4405aa6d91e70f878",
    measurementId:     "G-9L3HKJ3C5G"
  };
  // ───────────────────────────────────────────────────────────────────────────

  // If config hasn't been filled in yet, fall back silently
  if (firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY") {
    window.CactusSpots = {
      get: function (cb) { cb(10); },
      decrement: function () { return Promise.resolve(); }
    };
    return;
  }

  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  var db = firebase.firestore();
  var spotsDoc = db.collection('promo').doc('spots');

  window.CactusSpots = {
    get: function (callback) {
      spotsDoc.get().then(function (doc) {
        var count = (doc.exists && doc.data().count !== undefined) ? doc.data().count : 10;
        if (count < 0) count = 0;
        callback(count);
      }).catch(function () { callback(10); });
    },

    decrement: function () {
      return db.runTransaction(function (transaction) {
        return transaction.get(spotsDoc).then(function (doc) {
          var current = (doc.exists && doc.data().count !== undefined) ? doc.data().count : 10;
          if (current > 0) {
            transaction.set(spotsDoc, { count: current - 1 });
          }
        });
      }).catch(function (e) { console.error('Spots decrement failed:', e); });
    }
  };
})();
