// Menunggu seluruh halaman HTML dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // MENGAMBIL SEMUA ELEMEN YANG DIBUTUHKAN DARI HTML
    // =========================================================================
    const modalOverlay = document.getElementById('add-testimonial-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtns = document.querySelectorAll('.modal-close-btn');
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialGrid = document.getElementById('testimonial-display-area');
    const statusText = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-testimonial-btn');
    const modalTitle = document.getElementById('modal-title');
    const successSound = document.getElementById('success-sound');

    // =========================================================================
    // FUNGSI UNTUK MENGATUR MODAL (POP-UP)
    // =========================================================================
    const openModal = () => modalOverlay.style.display = 'flex';
    const closeModal = () => {
        modalOverlay.style.display = 'none';
        testimonialForm.reset(); // Selalu reset form saat ditutup
        updateStars(0);
        document.getElementById('testimonial-id').value = ''; // Hapus ID edit
        modalTitle.textContent = 'Bagikan Pengalaman Anda';
        submitBtn.textContent = 'Kirim Testimoni';
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // =========================================================================
    // FUNGSI UNTUK RATING BINTANG INTERAKTIF
    // =========================================================================
    const stars = document.querySelectorAll('.star-rating-input .fa-star');
    const hiddenRatingInput = document.getElementById('rating-value');
    
    const updateStars = (selectedValue) => {
        stars.forEach(s => {
            // Bintang akan terisi jika nilainya <= nilai yang dipilih
            s.classList.toggle('fas', s.dataset.value <= selectedValue);
            s.classList.toggle('far', s.dataset.value > selectedValue);
        });
    };

    stars.forEach(star => {
        star.addEventListener('click', () => {
            hiddenRatingInput.value = star.dataset.value;
            updateStars(star.dataset.value);
        });
    });

    // =========================================================================
    // FUNGSI UNTUK MENGELOLA DATA DI LOCALSTORAGE (CRUD)
    // =========================================================================
    const getTestimonials = () => JSON.parse(localStorage.getItem('testimonials')) || [];
    const saveTestimonials = (testimonials) => localStorage.setItem('testimonials', JSON.stringify(testimonials));

    // =========================================================================
    // FUNGSI UNTUK MENAMPILKAN SEMUA TESTIMONI
    // =========================================================================
    const displayTestimonials = () => {
        const testimonials = getTestimonials();
        testimonialGrid.innerHTML = ''; 

        if (testimonials.length === 0) {
            testimonialGrid.innerHTML = '<p>Belum ada testimoni. Jadilah yang pertama!</p>';
            return;
        }

        testimonials.forEach(data => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';

            let ratingStars = '';
            for(let i = 0; i < 5; i++) {
                ratingStars += `<i class="fa-star ${i < data.rating ? 'fas' : 'far'}"></i>`;
            }

            const date = new Date(data.createdAt);
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            const maxLength = 120;
            let bodyHTML = '';
            const fullText = data.text.replace(/"/g, '&quot;');
            if (data.text.length > maxLength) {
                const truncatedText = data.text.substring(0, maxLength) + '...';
                bodyHTML = `<p class="testimonial-body" data-fulltext="${fullText}">"${truncatedText}"</p><button class="read-more-btn">Baca selengkapnya</button>`;
            } else {
                bodyHTML = `<p class="testimonial-body">"${data.text}"</p>`;
            }

            card.innerHTML = `
                <div class="card-actions">
                    <button class="action-btn edit-btn" data-id="${data.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn delete-btn" data-id="${data.id}"><i class="fas fa-trash"></i></button>
                </div>
                <div class="user-info">
                    <div class="user-avatar">${data.name.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <h4>${data.name}</h4>
                        <p>${data.service} - ${formattedDate}</p> 
                    </div>
                </div>
                <div class="rating-display">${ratingStars}</div>
                ${bodyHTML}
            `;
            testimonialGrid.appendChild(card);
        });
    };

    // =========================================================================
    // FUNGSI SAAT FORM DIKIRIM (MENAMBAH & MENGEDIT)
    // =========================================================================
    testimonialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('testimonial-id').value;
        const name = document.getElementById('customer-name').value.trim();
        const service = document.getElementById('service-type').value;
        const text = document.getElementById('testimonial-text').value.trim();
        const rating = parseInt(hiddenRatingInput.value);

        if (!name || !text || !service || rating === 0) {
            statusText.textContent = 'Harap isi semua kolom dan berikan rating.';
            return;
        }

        let testimonials = getTestimonials();
        if (id) { // Jika ada ID, berarti ini mode edit
            const index = testimonials.findIndex(t => t.id == id);
            if (index > -1) {
                testimonials[index] = { ...testimonials[index], name, service, text, rating };
            }
        } else { // Jika tidak ada ID, ini testimoni baru
            const newTestimonial = { id: Date.now(), name, service, text, rating, createdAt: new Date().toISOString() };
            testimonials.unshift(newTestimonial);
        }

        saveTestimonials(testimonials);
        displayTestimonials(); 
        
        successSound.play();
        closeModal();
    });

    // =========================================================================
    // EVENT LISTENER UNTUK AKSI PADA KARTU (EDIT, HAPUS, BACA)
    // =========================================================================
    testimonialGrid.addEventListener('click', (e) => {
        const target = e.target;

        // Logika untuk tombol "Baca selengkapnya"
        if (target.classList.contains('read-more-btn')) {
            const bodyP = target.previousElementSibling;
            bodyP.textContent = `"${bodyP.dataset.fulltext}"`;
            target.remove();
        }

        // Logika untuk tombol hapus
        const deleteBtn = target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm('Anda yakin ingin menghapus testimoni ini?')) {
                let testimonials = getTestimonials();
                const updatedTestimonials = testimonials.filter(t => t.id != id);
                saveTestimonials(updatedTestimonials);
                displayTestimonials();
            }
        }

        // Logika untuk tombol edit
        const editBtn = target.closest('.edit-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const testimonials = getTestimonials();
            const testimonialToEdit = testimonials.find(t => t.id == id);
            if (testimonialToEdit) {
                document.getElementById('testimonial-id').value = testimonialToEdit.id;
                document.getElementById('customer-name').value = testimonialToEdit.name;
                document.getElementById('service-type').value = testimonialToEdit.service;
                document.getElementById('testimonial-text').value = testimonialToEdit.text;
                hiddenRatingInput.value = testimonialToEdit.rating;
                updateStars(testimonialToEdit.rating);
                
                modalTitle.textContent = 'Edit Testimoni Anda';
                submitBtn.textContent = 'Simpan Perubahan';
                openModal();
            }
        }
    });

    // --- INISIALISASI ---
    displayTestimonials(); // Tampilkan data saat halaman dimuat
});
