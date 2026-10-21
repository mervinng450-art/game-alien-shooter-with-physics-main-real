class QuestionManager {
    constructor(uiContainerId) {
        this.uiContainer = document.getElementById(uiContainerId);
        this.currentQuestion = null;
        this.activeCallback = null;

        // Semua soal digabung dalam 1 pool (Bank Soal) agar acak secara merata
        this.questionBank = [
            {
                id: 'q1',
                concept: 'Distance & Speed',
                question: 'Pesawat alien bergerak dengan kecepatan konstan 20 m/s selama 5 detik. Berapa jarak yang ditempuh?',
                options: ['50 meter', '100 meter', '4 meter', '25 meter'],
                correctIndex: 1,
                explanation: 'Jarak = Kecepatan × Waktu (s = v × t). 20 m/s × 5 s = 100 meter.'
            },
            {
                id: 'q2',
                concept: 'Average Speed',
                question: 'Sebuah proyektil menempuh jarak 150 meter dalam 3 detik. Berapakah kecepatan rata-ratanya?',
                options: ['30 m/s', '450 m/s', '50 m/s', '15 m/s'],
                correctIndex: 2,
                explanation: 'Kecepatan = Jarak / Waktu. 150 m / 3 s = 50 m/s.'
            },
            {
                id: 'q3',
                concept: 'Hukum Newton II',
                question: 'Gaya sebesar 50 N ditembakkan ke puing angkasa bermassa 10 kg. Berapakah percepatannya?',
                options: ['5 m/s²', '500 m/s²', '0.2 m/s²', '60 m/s²'],
                correctIndex: 0,
                explanation: 'Percepatan = Gaya / Massa (a = F / m). 50 N / 10 kg = 5 m/s².'
            },
            {
                id: 'q4',
                concept: 'Gravitational Force',
                question: 'Berapakah berat alien bermassa 5 kg jika berada di dekat permukaan Bumi (g = 9.8 m/s²)?',
                options: ['49 N', '14.8 N', '1.96 N', '98 N'],
                correctIndex: 0,
                explanation: 'Berat = Massa × Gravitasi (W = m × g). 5 kg × 9.8 m/s² = 49 N.'
            },
            {
                id: 'q5',
                concept: 'Momentum',
                question: 'Sebuah roket bermassa 100 kg melaju dengan kecepatan 15 m/s. Berapakah momentumnya?',
                options: ['6.67 kg·m/s', '1500 kg·m/s', '115 kg·m/s', '85 kg·m/s'],
                correctIndex: 1,
                explanation: 'Momentum = Massa × Kecepatan (p = m × v). 100 kg × 15 m/s = 1500 kg·m/s.'
            },
            {
                id: 'q6',
                concept: 'Energi Kinetik',
                question: 'Berapakah energi kinetik dari peluru laser bermassa 2 kg yang bergerak pada kecepatan 4 m/s?',
                options: ['16 Joule', '8 Joule', '32 Joule', '4 Joule'],
                correctIndex: 0,
                explanation: 'Energi Kinetik = 1/2 × m × v². 0.5 × 2 kg × (4 m/s)² = 16 Joule.'
            },
            {
                id: 'q7',
                concept: 'Percepatan',
                question: 'Kecepatan pesawat meningkat dari 10 m/s menjadi 50 m/s dalam waktu 4 detik. Berapa percepatannya?',
                options: ['10 m/s²', '40 m/s²', '5 m/s²', '20 m/s²'],
                correctIndex: 0,
                explanation: 'Percepatan = Perubahan Kecepatan / Waktu. (50 - 10) / 4 = 40 / 4 = 10 m/s².'
            },
            {
                id: 'q8',
                concept: 'Usaha (Work)',
                question: 'Mesin pendorong memberikan gaya 20 N untuk memindahkan kargo sejauh 5 meter. Berapa usaha yang dilakukan?',
                options: ['25 Joule', '100 Joule', '4 Joule', '15 Joule'],
                correctIndex: 1,
                explanation: 'Usaha = Gaya × Jarak (W = F × s). 20 N × 5 m = 100 Joule.'
            },
            {
                id: 'q9',
                concept: 'Massa Jenis',
                question: 'Sebuah bongkahan asteroid memiliki massa 200 kg dan volume 4 m³. Berapakah massa jenisnya?',
                options: ['800 kg/m³', '50 kg/m³', '0.02 kg/m³', '204 kg/m³'],
                correctIndex: 1,
                explanation: 'Massa Jenis = Massa / Volume (ρ = m / v). 200 kg / 4 m³ = 50 kg/m³.'
            },
            {
                id: 'q10',
                concept: 'Daya (Power)',
                question: 'Generator pesawat melakukan usaha 1000 Joule dalam waktu 10 detik. Berapakah daya yang dihasilkan?',
                options: ['100 Watt', '10000 Watt', '10 Watt', '990 Watt'],
                correctIndex: 0,
                explanation: 'Daya = Usaha / Waktu (P = W / t). 1000 Joule / 10 s = 100 Watt.'
            }
        ];
    }

    getRandomQuestion() {
        const randomIndex = Math.floor(Math.random() * this.questionBank.length);
        return this.questionBank[randomIndex];
    }

    showQuestion(level, onResolved) {
        this.currentQuestion = this.getRandomQuestion();
        this.activeCallback = onResolved;

        // PERBAIKAN 1: Memaksa UI Container agar terlihat kembali (menimpa display: none)
        if (this.uiContainer) {
            this.uiContainer.style.display = 'block';
        }

        this.uiContainer.innerHTML = `
            <div class="modal-overlay">
                <h2>PHYSICS TARGET LOCK (${this.currentQuestion.concept})</h2>
                <div class="question-text">${this.currentQuestion.question}</div>
                <div class="options-container">
                    ${this.currentQuestion.options.map((opt, index) => `
                        <button class="option-btn" data-index="${index}">${String.fromCharCode(65 + index)}.${opt}</button>
                    `).join('')}
                </div>
                <div id="feedback" class="feedback-container"></div>
                <button id="continue-btn" class="modal-btn" style="display: none;">CONTINUE</button>
            </div>
        `;

        const optionButtons = this.uiContainer.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => this.evaluateAnswer(parseInt(btn.dataset.index)));
        });
    }

    evaluateAnswer(selectedIndex) {
        const feedbackEl = this.uiContainer.querySelector('#feedback');
        const continueBtn = this.uiContainer.querySelector('#continue-btn');
        const optionButtons = this.uiContainer.querySelectorAll('.option-btn');

        optionButtons.forEach(btn => btn.disabled = true);

        const isCorrect = selectedIndex === this.currentQuestion.correctIndex;

        if (isCorrect) {
            feedbackEl.className = 'feedback-container correct';
            feedbackEl.innerHTML = `<strong>JAWABAN BENAR!</strong> Sistem Senjata Terisi.<br>${this.currentQuestion.explanation}`;
            
            if (window.player) {
                if (typeof window.player.reloadAmmo === 'function') {
                    window.player.reloadAmmo(5);
                } else {
                    window.player.ammo = (window.player.ammo || 0) + 5;
                }
            }
        } else {
            feedbackEl.className = 'feedback-container incorrect';
            feedbackEl.innerHTML = `<strong>JAWABAN SALAH!</strong> Penalti Misfire.<br>${this.currentQuestion.explanation}`;
        }

        continueBtn.style.display = 'block';
        
        continueBtn.onclick = () => {
            this.clearUI();
            if (this.activeCallback) {
                this.activeCallback(isCorrect);
            }
        };
    }

    clearUI() {
        if (this.uiContainer) {
            this.uiContainer.innerHTML = '';
            // PERBAIKAN 2: Sembunyikan kembali UI agar kamu bisa melanjutkan game
            this.uiContainer.style.display = 'none';
        }
    }
}