document.addEventListener('DOMContentLoaded', () => {
    class LuckyWheel {
        constructor() {
            // --- Konfigurasi Game ---
            this.segments = [
                { label: 'zonk', type: 'lose' }, { label: 'diskon 5%', type: 'win' }, { label: 'zonk', type: 'lose' },
                { label: 'free reglue', type: 'win' }, { label: 'zonk', type: 'lose' }, { label: 'free onkir', type: 'win' },
                { label: 'zonk', type: 'lose' }, { label: 'zonk', type: 'lose' }, { label: 'free parfum', type: 'win' },
                { label: 'zonk', type: 'lose' }, { label: 'fast 13k', type: 'win' }, { label: 'zonk', type: 'lose' },
                { label: 'zonk', type: 'lose' }, { label: 'free kantong cc', type: 'win' }, { label: 'zonk', type: 'lose' },
                { label: 'zonk', type: 'lose' }, { label: 'zonk', type: 'lose' }, { label: 'zonk', type: 'lose' },
                { label: 'zonk', type: 'lose' }, { label: 'zonk', type: 'lose' }
            ];
            this.colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#f8b595', '#f67280', '#c06c84', '#6c5b7b', '#355c7d', '#f3a683', '#f19066', '#77dd77', '#fdfd96', '#84b6f4', '#fdcae1', '#b0e0e6'];
            
            // Mengambil HANYA indeks yang kalah (zonk)
            this.losingIndices = [];
            this.segments.forEach((seg, i) => {
                if (seg.type === 'lose') this.losingIndices.push(i);
            });

            // --- Elemen HTML & Suara ---
            this.canvas = document.getElementById('spinWheel');
            this.spinButton = document.getElementById('spinButton');
            this.resultText = document.getElementById('resultText');
            this.spinSound = document.getElementById('spinSound');
            this.loseSound = document.getElementById('loseSound');
            
            if (!this.canvas || !this.spinButton || !this.spinSound || !this.loseSound) {
                console.error("Elemen penting (canvas, tombol, atau suara) tidak ditemukan.");
                return;
            }

            // --- Properti Game ---
            this.ctx = this.canvas.getContext('2d');
            this.segmentCount = this.segments.length;
            this.segmentAngle = 360 / this.segmentCount;
            this.currentRotation = 0;
            this.isSpinning = false;
            
            this.init();
        }

        // Fungsi untuk menonaktifkan game secara permanen (untuk 24 jam)
        _disableGame(message) {
            this.spinButton.disabled = true;
            this.resultText.innerText = message;
        }

        // Fungsi untuk memeriksa batas waktu 24 jam
        _checkDailyLimit() {
            const lastSpinTimestamp = localStorage.getItem('lastSpinTimestamp');
            if (lastSpinTimestamp) {
                const now = Date.now();
                const timeDifference = now - parseInt(lastSpinTimestamp, 10);
                const hours_24 = 24 * 60 * 60 * 1000;

                if (timeDifference < hours_24) {
                    this._disableGame("Anda sudah bermain hari ini. Coba lagi besok!");
                    return false; // Mengindikasikan limit aktif
                }
            }
            return true; // Mengindikasikan boleh bermain
        }

        drawWheel() {
            // ... (Fungsi drawWheel tidak berubah, jadi saya persingkat agar tidak terlalu panjang)
            const centerX = this.canvas.width / 2, centerY = this.canvas.height / 2, radius = this.canvas.width / 2; this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); this.segments.forEach((segment, i) => { const startAngleRad = (i * this.segmentAngle - 90) * (Math.PI / 180), endAngleRad = ((i + 1) * this.segmentAngle - 90) * (Math.PI / 180); this.ctx.beginPath(); this.ctx.fillStyle = this.colors[i % this.colors.length]; this.ctx.moveTo(centerX, centerY); this.ctx.arc(centerX, centerY, radius, startAngleRad, endAngleRad); this.ctx.lineTo(centerX, centerY); this.ctx.fill(); this.ctx.save(); this.ctx.translate(centerX, centerY); this.ctx.rotate(startAngleRad + (endAngleRad - startAngleRad) / 2); this.ctx.textAlign = 'right'; this.ctx.fillStyle = '#333'; this.ctx.font = 'bold 12px Poppins'; this.ctx.fillText(segment.label, radius - 15, 5); this.ctx.restore(); });
        }

        handleResult(targetSegmentIndex) {
            // SINKRONISASI: Hentikan suara putaran & putar suara kalah
            this.spinSound.pause();
            this.spinSound.currentTime = 0;
            this.loseSound.play();
            
            // KETERANGAN AKURAT: Pesan selalu ZONK
            this.resultText.innerText = "ZONK! Coba lagi lain kali!";
            
            // NONAKTIFKAN GAME SETELAH SELESAI
            this._disableGame("Anda sudah bermain hari ini. Coba lagi besok!");
        }

        spin() {
            if (this.isSpinning) return;

            // Simpan waktu main untuk limit 24 jam
            localStorage.setItem('lastSpinTimestamp', Date.now().toString());

            this.isSpinning = true;
            this.spinButton.disabled = true;
            this.resultText.innerText = "Semoga beruntung...";
            
            // SINKRONISASI: Putar suara saat animasi dimulai
            this.spinSound.loop = true;
            this.spinSound.play();

            // LOGIKA 0% LUCKY: Hanya pilih dari segmen ZONK
            const targetSegmentIndex = this.losingIndices[Math.floor(Math.random() * this.losingIndices.length)];
            
            const fullSpins = 5 * 360;
            const targetAngleCenter = (targetSegmentIndex * this.segmentAngle) + (this.segmentAngle / 2);
            const rotationOffset = 360 - targetAngleCenter;

            this.currentRotation += fullSpins + rotationOffset;
            this.canvas.style.transform = `rotate(${this.currentRotation}deg)`;

            // Durasi 5000ms (5 detik) ini HARUS SAMA dengan durasi transisi di CSS-mu
            setTimeout(() => this.handleResult(targetSegmentIndex), 5000);
        }
        
        init() {
            this.drawWheel();
            
            // Cek limit saat game dimuat
            if (this._checkDailyLimit()) {
                this.resultText.innerText = "Anda punya 1 kesempatan hari ini!";
                this.spinButton.addEventListener('click', this.spin.bind(this));
            }
        }
    }
    
    new LuckyWheel();
});