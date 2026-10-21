<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Alien Shooter With Physics</title>
    <link rel="stylesheet" href="{{ asset('css/game.css') }}">
    
    <!-- Firebase Web SDK (Diperbarui ke Versi 13.0.0 Terbaru - Compat Mode) -->
    <script src="https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/13.0.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore-compat.js"></script>
</head>
<body>

    <div id="game-container">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div id="ui-layer" class="ui-overlay"></div>
        <div id="ammo-display" style="position: absolute; top: 10px; right: 10px; color: white; font-size: 20px; font-weight: bold;">
           Peluru: <span id="ammo-count">20</span> / 20
        </div>
    </div>

    <!-- Pass Laravel Config to JS safely -->
    <script>
        window.FirebaseConfig = {
            apiKey: "{{ config('firebase.api_key') }}",
            authDomain: "{{ config('firebase.auth_domain') }}",
            projectId: "{{ config('firebase.project_id') }}",
            storageBucket: "{{ config('firebase.storage_bucket') }}",
            messagingSenderId: "{{ config('firebase.messaging_sender_id') }}",
            appId: "{{ config('firebase.app_id') }}",
            measurementId: "{{ config('firebase.measurement_id') }}"
        };
    </script>

    <!-- Game Scripts Loaded in Dependency Order -->
    <script src="{{ asset('js/firebase-config.js') }}"></script>
    <script src="{{ asset('js/AuthManager.js') }}"></script>
    <script src="{{ asset('js/GameLoop.js') }}"></script>
    <script src="{{ asset('js/InputHandler.js') }}"></script>
    <script src="{{ asset('js/Player.js') }}"></script>
    <script src="{{ asset('js/Projectile.js') }}"></script>
    <script src="{{ asset('js/Enemy.js') }}"></script> 
    <script src="{{ asset('js/EnemyManager.js') }}"></script>
    <script src="{{ asset('js/GameState.js') }}"></script>
    <script src="{{ asset('js/QuestionManager.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>
</html>