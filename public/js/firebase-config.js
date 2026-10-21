// public/js/firebase-config.js

// 1. Ganti nilai di dalam objek ini dengan data dari Firebase Console milikmu
const firebaseConfig = {
    apiKey: "AIzaSyD-CONTOH-API-KEY-ASLI-MILIKMU",
    authDomain: "alienshooter-12345.firebaseapp.com",
    projectId: "alienshooter-12345",
    storageBucket: "alienshooter-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcde12345fghij",
    measurementId: "G-ABCDEFG123" // Opsional, kadang tidak ada
};

// 2. Inisialisasi Firebase (Pastikan SDK Firebase sudah dimuat di HTML/Blade sebelumnya)
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase berhasil diinisialisasi!");
    }
} else {
    console.error("SDK Firebase belum dimuat! Pastikan tag <script> firebase-app.js dipanggil sebelum firebase-config.js");
}