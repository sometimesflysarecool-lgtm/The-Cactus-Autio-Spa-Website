(function () {
  // Copy this file to firebase-spots.js and fill in your Firebase config.
  // Get these values from: console.firebase.google.com → Project Settings
  // → Your apps → web app → SDK setup and configuration → Config
  //
  // IMPORTANT: firebase-spots.js is gitignored — never commit the real key.
  var firebaseConfig = {
    apiKey:            "REPLACE_WITH_YOUR_API_KEY",
    authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
    projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
    storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
    appId:             "REPLACE_WITH_YOUR_APP_ID",
    measurementId:     "REPLACE_WITH_YOUR_MEASUREMENT_ID"
  };
  // ───────────────────────────────────────────────────────────────────────────

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
        var count = (doc.exists && doc.data().promo !== undefined) ? doc.data().promo : 10;
        if (count < 0) count = 0;
        callback(count);
      }).catch(function () { callback(10); });
    },

    decrement: function () {
      return db.runTransaction(function (transaction) {
        return transaction.get(spotsDoc).then(function (doc) {
          var current = (doc.exists && doc.data().promo !== undefined) ? doc.data().promo : 10;
          if (current > 0) {
            transaction.set(spotsDoc, { promo: current - 1 });
          }
        });
      }).catch(function (e) { console.error('Spots decrement failed:', e); });
    }
  };
})();
