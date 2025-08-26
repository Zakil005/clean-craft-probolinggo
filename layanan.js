document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    const loveButtons = document.querySelectorAll('.btn-love');
    const loveIconContainer = document.querySelector('.love-icon-container');
    const loveCountSpan = document.querySelector('.love-count');
    const loveModal = document.getElementById('love-modal');
    const favoriteList = loveModal ? loveModal.querySelector('.modal-body') : null;
    const loveModalCloseBtn = loveModal ? loveModal.querySelector('.modal-close-btn') : null;

    const orderModal = document.getElementById('order-modal');
    const orderModalCloseBtn = orderModal ? orderModal.querySelector('.modal-close-btn') : null;
    const orderForm = orderModal ? orderModal.querySelector('#order-form') : null;
    const confirmationMsg = orderModal ? document.getElementById('confirmation-message') : null;
    const uniqueCodeSpan = orderModal ? document.getElementById('unique-code') : null;
    const whatsappLink = orderModal ? document.getElementById('whatsapp-link') : null;

    const layananDipilihTextarea = orderModal ? document.getElementById('layanan-dipilih') : null;
    const tanggalPesanInput = orderModal ? document.getElementById('tanggal-pesan') : null;
    const pesanSekarangButtons = document.querySelectorAll('.service-card .btn-primary');

    // --- STATE MANAGEMENT ---
    let lovedServices = new Set();
    const WA_NUMBER = '6282337645011';

    // Inisialisasi dan Muat Data dari Local Storage
    function initializeFavorites() {
        try {
            const savedFavorites = JSON.parse(localStorage.getItem('lovedServices')) || [];
            lovedServices = new Set(savedFavorites);
            // Perbarui hitungan segera
            updateLoveCount();
            // Perbarui status tombol hanya jika elemennya ada di halaman
            if (loveButtons.length > 0) {
                updateServiceCardButtons();
            }
        } catch (e) {
            console.error("Failed to load favorites from localStorage", e);
            lovedServices = new Set();
            updateLoveCount();
        }
    }
    
    // Simpan Data ke Local Storage
    function saveFavorites() {
        localStorage.setItem('lovedServices', JSON.stringify(Array.from(lovedServices)));
    }

    // Perbarui jumlah pada ikon love di header
    function updateLoveCount() {
        loveCountSpan.textContent = lovedServices.size;
    }

    // Perbarui status tombol love di kartu layanan
    function updateServiceCardButtons() {
        loveButtons.forEach(button => {
            const card = button.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            let isLoved = false;
            for (let item of lovedServices) {
                if (item.name === serviceName) {
                    isLoved = true;
                    break;
                }
            }
            if (isLoved) {
                button.classList.add('loved');
            } else {
                button.classList.remove('loved');
            }
        });
    }

    // --- FUNCTIONS ---
    
    // Update Daftar Favorit di Modal
    function updateFavoriteList() {
        if (!favoriteList) return;
        favoriteList.innerHTML = '';
        if (lovedServices.size === 0) {
            favoriteList.innerHTML = '<p style="text-align: center; color: #888;">Belum ada layanan favorit.</p>';
        } else {
            lovedServices.forEach(service => {
                const item = document.createElement('div');
                item.classList.add('favorite-item');
                item.innerHTML = `
                    <div class="item-header">
                        <h4>${service.name}</h4>
                        <button class="btn-love-modal loved" data-item-name="${service.name}" title="Hapus dari Favorit">
                            <i class="fa fa-heart"></i>
                        </button>
                    </div>
                    <p class="item-description">${service.description}</p>
                    <div class="item-details">
                        <p class="price">${service.price}</p>
                        <a href="#" class="btn-pesan" data-item-name="${service.name}">Pesan</a>
                    </div>
                `;
                favoriteList.appendChild(item);
            });

            document.querySelectorAll('.btn-pesan').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceName = e.target.getAttribute('data-item-name');
                    openOrderModalForService(serviceName);
                });
            });

            document.querySelectorAll('.btn-love-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const serviceName = e.target.closest('button').getAttribute('data-item-name');
                    removeServiceFromFavorites(serviceName);
                    updateFavoriteList(); // Perbarui tampilan modal
                });
            });
        }
    }

    // Hapus Layanan dari Favorit
    function removeServiceFromFavorites(serviceName) {
        let itemToRemove;
        for(let item of lovedServices) {
            if (item.name === serviceName) {
                itemToRemove = item;
                break;
            }
        }
        if (itemToRemove) {
            lovedServices.delete(itemToRemove);
            updateLoveCount();
            updateServiceCardButtons();
            saveFavorites();
        }
    }
    
    // Buka Modal Pesanan
    function openOrderModalForService(serviceName) {
        if (!orderModal || !orderForm || !layananDipilihTextarea || !tanggalPesanInput) return;

        if (loveModal) loveModal.style.display = 'none';
        orderForm.style.display = 'block';
        if (confirmationMsg) confirmationMsg.style.display = 'none';
        
        layananDipilihTextarea.value = serviceName;
        tanggalPesanInput.value = formatDate(new Date());
        orderModal.style.display = 'flex';
    }

    // Tangani Form Pemesanan
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nama = document.getElementById('nama').value;
            const telepon = document.getElementById('telepon').value;
            const layanan = layananDipilihTextarea.value;
            const tanggal = tanggalPesanInput.value;
            const uniqueCode = generateUniqueCode();
            
            const waMessage = `Halo Clean Craft, saya ingin memesan layanan. Berikut detailnya:
Nama: ${nama}
No. HP: ${telepon}
Layanan: ${layanan}
Tanggal Pesan: ${tanggal}
Kode Unik: ${uniqueCode}

Mohon diproses, terima kasih.`;
            
            const encodedMessage = encodeURIComponent(waMessage);
            
            if (whatsappLink) whatsappLink.href = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;
            
            orderForm.style.display = 'none';
            if (confirmationMsg) confirmationMsg.style.display = 'block';
            if (uniqueCodeSpan) uniqueCodeSpan.textContent = uniqueCode;

            lovedServices.clear();
            updateLoveCount();
            updateServiceCardButtons();
            saveFavorites();
        });
    }
    
    // Fungsi Utility
    function generateUniqueCode() {
        const timestamp = Date.now().toString(36);
        const randomNum = Math.random().toString(36).substr(2, 5);
        return 'CLEAN-' + timestamp.toUpperCase() + randomNum.toUpperCase();
    }

    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }
    
    // --- EVENT LISTENERS ---
    
    // Filter Layanan (hanya berjalan di halaman layanan.html)
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                serviceCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filterValue === 'all' || filterValue === cardCategory) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Tombol "Pesan Sekarang" di setiap kartu layanan
    pesanSekarangButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = e.target.getAttribute('data-service-name');
            openOrderModalForService(serviceName);
        });
    });

    // Menambah/Menghapus Favorit
    loveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            const serviceDesc = card.querySelector('.description').textContent;
            const servicePrice = card.querySelector('.price').textContent;
            
            const serviceData = { name: serviceName, description: serviceDesc, price: servicePrice };
            
            let isLoved = false;
            let itemToDelete;
            for (let item of lovedServices) {
                if (item.name === serviceData.name) {
                    isLoved = true;
                    itemToDelete = item;
                    break;
                }
            }

            if (isLoved) {
                lovedServices.delete(itemToDelete);
                button.classList.remove('loved');
            } else {
                lovedServices.add(serviceData);
                button.classList.add('loved');
            }
            
            updateLoveCount();
            saveFavorites();
        });
    });

    // Buka Modal Favorit
    if (loveIconContainer) {
        loveIconContainer.addEventListener('click', (e) => {
            e.preventDefault();
            updateFavoriteList();
            if(loveModal) loveModal.style.display = 'flex';
        });
    }
    
    // Tutup Modal
    if (loveModalCloseBtn) loveModalCloseBtn.addEventListener('click', () => { loveModal.style.display = 'none'; });
    if (orderModalCloseBtn) orderModalCloseBtn.addEventListener('click', () => { orderModal.style.display = 'none'; });
    
    window.addEventListener('click', (e) => {
        if (e.target === loveModal) loveModal.style.display = 'none';
        if (e.target === orderModal) orderModal.style.display = 'none';
    });
    
    // Inisialisasi saat halaman dimuat
    initializeFavorites();
});

// Tambahkan di dalam document.addEventListener('DOMContentLoaded', ...)
const accordionItems = document.querySelectorAll('.tips-accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
        item.classList.toggle('open');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    const loveButtons = document.querySelectorAll('.btn-love');
    const loveIconContainer = document.querySelector('.love-icon-container');
    const loveCountSpan = document.querySelector('.love-count');
    const loveModal = document.getElementById('love-modal');
    const favoriteList = loveModal ? loveModal.querySelector('.modal-body') : null;
    const loveModalCloseBtn = loveModal ? loveModal.querySelector('.modal-close-btn') : null;

    const orderModal = document.getElementById('order-modal');
    const orderModalCloseBtn = orderModal ? orderModal.querySelector('.modal-close-btn') : null;
    const orderForm = orderModal ? orderModal.querySelector('#order-form') : null;
    const confirmationMsg = orderModal ? document.getElementById('confirmation-message') : null;
    const uniqueCodeSpan = orderModal ? document.getElementById('unique-code') : null;
    const whatsappLink = orderModal ? document.getElementById('whatsapp-link') : null;

    const layananDipilihTextarea = orderModal ? document.getElementById('layanan-dipilih') : null;
    const tanggalPesanInput = orderModal ? document.getElementById('tanggal-pesan') : null;
    const pesanSekarangButtons = document.querySelectorAll('.service-card .btn-primary');

    // --- TESTIMONIAL FORM ---
    const addTestimonialBtn = document.getElementById('open-testimonial-modal');
    const addTestimonialModal = document.getElementById('add-testimonial-modal');
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialGrid = document.querySelector('.testimonials-grid');
    const testimonialModalCloseBtn = addTestimonialModal ? addTestimonialModal.querySelector('.modal-close-btn') : null;
    const starRatingInput = document.querySelector('.star-rating-input');
    const hiddenRatingInput = document.getElementById('hidden-rating');
    const starIcons = starRatingInput ? starRatingInput.querySelectorAll('i') : [];

    // --- STATE MANAGEMENT ---
    let lovedServices = new Set();
    const WA_NUMBER = '6282337645011';
    let testimonials = [];

    // Inisialisasi dan Muat Data dari Local Storage
    function initializeFavorites() {
        try {
            const savedFavorites = JSON.parse(localStorage.getItem('lovedServices')) || [];
            lovedServices = new Set(savedFavorites);
            updateLoveCount();
            if (loveButtons.length > 0) {
                updateServiceCardButtons();
            }
        } catch (e) {
            console.error("Failed to load favorites from localStorage", e);
            lovedServices = new Set();
            updateLoveCount();
        }
    }
    
    function initializeTestimonials() {
        const savedTestimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
        testimonials = savedTestimonials;
        renderTestimonials();
    }

    // Simpan Data ke Local Storage
    function saveFavorites() {
        localStorage.setItem('lovedServices', JSON.stringify(Array.from(lovedServices)));
    }

    function saveTestimonials() {
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
    }

    // Perbarui jumlah pada ikon love di header
    function updateLoveCount() {
        if (loveCountSpan) {
            loveCountSpan.textContent = lovedServices.size;
        }
    }

    // Perbarui status tombol love di kartu layanan
    function updateServiceCardButtons() {
        loveButtons.forEach(button => {
            const card = button.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            let isLoved = false;
            for (let item of lovedServices) {
                if (item.name === serviceName) {
                    isLoved = true;
                    break;
                }
            }
            if (isLoved) {
                button.classList.add('loved');
            } else {
                button.classList.remove('loved');
            }
        });
    }

    // --- FUNCTIONS ---
    
    // Update Daftar Favorit di Modal
    function updateFavoriteList() {
        if (!favoriteList) return;
        favoriteList.innerHTML = '';
        if (lovedServices.size === 0) {
            favoriteList.innerHTML = '<p style="text-align: center; color: #888;">Belum ada layanan favorit.</p>';
        } else {
            lovedServices.forEach(service => {
                const item = document.createElement('div');
                item.classList.add('favorite-item');
                item.innerHTML = `
                    <div class="item-header">
                        <h4>${service.name}</h4>
                        <button class="btn-love-modal loved" data-item-name="${service.name}" title="Hapus dari Favorit">
                            <i class="fa fa-heart"></i>
                        </button>
                    </div>
                    <p class="item-description">${service.description}</p>
                    <div class="item-details">
                        <p class="price">${service.price}</p>
                        <a href="#" class="btn-pesan" data-item-name="${service.name}">Pesan</a>
                    </div>
                `;
                favoriteList.appendChild(item);
            });

            document.querySelectorAll('.btn-pesan').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceName = e.target.getAttribute('data-item-name');
                    openOrderModalForService(serviceName);
                });
            });

            document.querySelectorAll('.btn-love-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const serviceName = e.target.closest('button').getAttribute('data-item-name');
                    removeServiceFromFavorites(serviceName);
                    updateFavoriteList();
                });
            });
        }
    }

    // Hapus Layanan dari Favorit
    function removeServiceFromFavorites(serviceName) {
        let itemToRemove;
        for(let item of lovedServices) {
            if (item.name === serviceName) {
                itemToRemove = item;
                break;
            }
        }
        if (itemToRemove) {
            lovedServices.delete(itemToRemove);
            updateLoveCount();
            updateServiceCardButtons();
            saveFavorites();
        }
    }
    
    // Buka Modal Pesanan
    function openOrderModalForService(serviceName) {
        if (!orderModal || !orderForm || !layananDipilihTextarea || !tanggalPesanInput) return;

        if (loveModal) loveModal.style.display = 'none';
        orderForm.style.display = 'block';
        if (confirmationMsg) confirmationMsg.style.display = 'none';
        
        layananDipilihTextarea.value = serviceName;
        tanggalPesanInput.value = formatDate(new Date());
        orderModal.style.display = 'flex';
    }

    // Tangani Form Pemesanan
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nama = document.getElementById('nama').value;
            const telepon = document.getElementById('telepon').value;
            const layanan = layananDipilihTextarea.value;
            const tanggal = tanggalPesanInput.value;
            const uniqueCode = generateUniqueCode();
            
            const waMessage = `Halo Clean Craft, saya ingin memesan layanan. Berikut detailnya:
Nama: ${nama}
No. HP: ${telepon}
Layanan: ${layanan}
Tanggal Pesan: ${tanggal}
Kode Unik: ${uniqueCode}

Mohon diproses, terima kasih.`;
            
            const encodedMessage = encodeURIComponent(waMessage);
            
            if (whatsappLink) whatsappLink.href = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;
            
            orderForm.style.display = 'none';
            if (confirmationMsg) confirmationMsg.style.display = 'block';
            if (uniqueCodeSpan) uniqueCodeSpan.textContent = uniqueCode;

            lovedServices.clear();
            updateLoveCount();
            updateServiceCardButtons();
            saveFavorites();
        });
    }
    
    // Fungsi Utility
    function generateUniqueCode() {
        const timestamp = Date.now().toString(36);
        const randomNum = Math.random().toString(36).substr(2, 5);
        return 'CLEAN-' + timestamp.toUpperCase() + randomNum.toUpperCase();
    }

    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }
    
    function generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
        if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
        return stars;
    }

    // --- LOGIKA FORM TESTIMONI ---
    // Fungsi untuk merender testimoni dari array
    function renderTestimonials() {
        if (!testimonialGrid) return;
        testimonialGrid.innerHTML = '';
        testimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.classList.add('testimonial-card');
            card.innerHTML = `
                <div class="before-after">
                    <p>Before & After</p>
                    ${testimonial.photo1 ? `<img src="${testimonial.photo1}" alt="Before" style="width:100%; height:auto;">` : ''}
                    ${testimonial.photo2 ? `<img src="${testimonial.photo2}" alt="After" style="width:100%; height:auto; margin-top: 5px;">` : ''}
                </div>
                <div class="card-content">
                    <h4>${testimonial.name}</h4>
                    <p class="service-name">${testimonial.service}</p>
                    <p class="card-quote">${testimonial.text}</p>
                    <div class="star-rating">
                        ${generateStarRating(testimonial.rating)}
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" data-index="${index}"><i class="fas fa-pencil-alt"></i></button>
                        <button class="delete-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
            testimonialGrid.appendChild(card);
        });
        
        // Atur event listeners untuk tombol yang baru dibuat
        setupTestimonialActionListeners();
    }
    
    // Atur listener untuk edit dan hapus
    function setupTestimonialActionListeners() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').getAttribute('data-index');
                if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
                    testimonials.splice(index, 1);
                    saveTestimonials();
                    renderTestimonials();
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').getAttribute('data-index');
                const testimonialToEdit = testimonials[index];
                
                // Isi formulir dengan data yang ada
                document.getElementById('customer-name').value = testimonialToEdit.name;
                document.getElementById('service-type').value = testimonialToEdit.service;
                document.getElementById('testimonial-text').value = testimonialToEdit.text;
                document.getElementById('hidden-rating').value = testimonialToEdit.rating;
                
                // Tampilkan bintang yang sesuai
                starIcons.forEach(icon => {
                    if (parseInt(icon.getAttribute('data-value')) <= testimonialToEdit.rating) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                });
                
                // Buka modal
                if (addTestimonialModal) {
                    addTestimonialModal.style.display = 'flex';
                }
                
                // Logika edit
                testimonialForm.onsubmit = (e) => {
                    e.preventDefault();
                    // Update data
                    testimonials[index].name = document.getElementById('customer-name').value;
                    testimonials[index].service = document.getElementById('service-type').value;
                    testimonials[index].text = document.getElementById('testimonial-text').value;
                    testimonials[index].rating = document.getElementById('hidden-rating').value;
                    saveTestimonials();
                    renderTestimonials();
                    addTestimonialModal.style.display = 'none';
                    // Kembalikan onsubmit ke mode tambah
                    testimonialForm.onsubmit = submitNewTestimonial;
                };
            });
        });
    }

    // Fungsi submit baru
    function submitNewTestimonial(e) {
        e.preventDefault();
        const name = document.getElementById('customer-name').value;
        const service = document.getElementById('service-type').value;
        const text = document.getElementById('testimonial-text').value;
        const rating = document.getElementById('hidden-rating').value;
        const photo1 = document.getElementById('photo-url-1').value;
        const photo2 = document.getElementById('photo-url-2').value;

        const newTestimonial = { name, service, text, rating, photo1, photo2 };
        testimonials.push(newTestimonial);
        saveTestimonials();
        renderTestimonials();

        if (addTestimonialModal) {
            addTestimonialModal.style.display = 'none';
        }
        testimonialForm.reset();
        alert("Testimoni Anda telah berhasil ditambahkan!");
    }
    
    // Menambah event listener untuk submit form
    if (testimonialForm) {
        testimonialForm.onsubmit = submitNewTestimonial;
    }

    // Event listener untuk bintang di form testimoni
    if (starRatingInput) {
        starRatingInput.addEventListener('click', (e) => {
            const rating = e.target.getAttribute('data-value');
            if (rating) {
                hiddenRatingInput.value = rating;
                starIcons.forEach(icon => {
                    if (parseInt(icon.getAttribute('data-value')) <= rating) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                });
            }
        });
    }

    // --- EVENT LISTENERS LAINNYA ---
    // ... (kode event listener lainnya, seperti filter, love, modal, dll)
    if (loveButtons.length > 0) {
        loveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.service-card');
                const serviceName = card.querySelector('h3').textContent;
                const serviceDesc = card.querySelector('.description').textContent;
                const servicePrice = card.querySelector('.price').textContent;
                
                const serviceData = { name: serviceName, description: serviceDesc, price: servicePrice };
                
                let isLoved = false;
                let itemToDelete;
                for (let item of lovedServices) {
                    if (item.name === serviceData.name) {
                        isLoved = true;
                        itemToDelete = item;
                        break;
                    }
                }
    
                if (isLoved) {
                    lovedServices.delete(itemToDelete);
                    button.classList.remove('loved');
                } else {
                    lovedServices.add(serviceData);
                    button.classList.add('loved');
                }
                
                updateLoveCount();
                saveFavorites();
            });
        });
    }

    // Buka Modal Favorit
    if (loveIconContainer) {
        loveIconContainer.addEventListener('click', (e) => {
            e.preventDefault();
            updateFavoriteList();
            if(loveModal) loveModal.style.display = 'flex';
        });
    }
    
    // Tutup Modal
    if (loveModalCloseBtn) loveModalCloseBtn.addEventListener('click', () => { loveModal.style.display = 'none'; });
    if (orderModalCloseBtn) orderModalCloseBtn.addEventListener('click', () => { orderModal.style.display = 'none'; });
    if (testimonialModalCloseBtn) testimonialModalCloseBtn.addEventListener('click', () => { addTestimonialModal.style.display = 'none'; });
    
    window.addEventListener('click', (e) => {
        if (e.target === loveModal) loveModal.style.display = 'none';
        if (e.target === orderModal) orderModal.style.display = 'none';
        if (e.target === addTestimonialModal) addTestimonialModal.style.display = 'none';
    });

    // Inisialisasi saat halaman dimuat
    initializeFavorites();
    initializeTestimonials();
});


// UNTUK NAMBAH FOTO DI
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // ... (selektor-selektor lainnya)
    const addTestimonialBtn = document.getElementById('open-testimonial-modal');
    const addTestimonialModal = document.getElementById('add-testimonial-modal');
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialGrid = document.querySelector('.testimonials-grid');
    const testimonialModalCloseBtn = addTestimonialModal ? addTestimonialModal.querySelector('.modal-close-btn') : null;
    const starRatingInput = testimonialForm ? testimonialForm.querySelector('.star-rating-input') : null;
    const hiddenRatingInput = testimonialForm ? document.getElementById('hidden-rating') : null;
    const starIcons = starRatingInput ? starRatingInput.querySelectorAll('i') : [];

    // --- STATE MANAGEMENT ---
    let lovedServices = new Set();
    const WA_NUMBER = '6282337645011';
    let testimonials = [];

    // ... (fungsi-fungsi lainnya)

    function generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
        if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
        return stars;
    }

    // --- LOGIKA FORM TESTIMONI ---
    // ... (fungsi render dan setup action lainnya)

    // Logika untuk menampilkan modal testimoni
    if (addTestimonialBtn) {
        addTestimonialBtn.addEventListener('click', () => {
            if (addTestimonialModal) {
                addTestimonialModal.style.display = 'flex';
                testimonialForm.reset(); // Mereset form saat modal dibuka
                hiddenRatingInput.value = 0; // Mereset rating
                // Reset tampilan bintang
                starIcons.forEach(icon => {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                });
                testimonialForm.onsubmit = submitNewTestimonial; // Pastikan form dalam mode 'tambah'
            }
        });
    }

    // ... (event listener untuk bintang di form testimoni)
    if (starRatingInput) {
        starRatingInput.addEventListener('click', (e) => {
            const rating = e.target.getAttribute('data-value');
            if (rating) {
                hiddenRatingInput.value = rating;
                starIcons.forEach(icon => {
                    if (parseInt(icon.getAttribute('data-value')) <= rating) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                });
            }
        });
    }

    // Fungsi submit baru
    function submitNewTestimonial(e) {
        e.preventDefault();
        const name = document.getElementById('customer-name').value;
        const service = document.getElementById('service-type').value;
        const text = document.getElementById('testimonial-text').value;
        const rating = document.getElementById('hidden-rating').value;

        const newTestimonial = { name, service, text, rating };
        testimonials.push(newTestimonial);
        saveTestimonials();
        renderTestimonials();

        if (addTestimonialModal) {
            addTestimonialModal.style.display = 'none';
        }
    }
    
    // Inisialisasi listener untuk tombol submit
    if (testimonialForm) {
        testimonialForm.onsubmit = submitNewTestimonial;
    }

    // ... (listener dan fungsi lainnya)
    // initializeFavorites();
    // initializeTestimonials();
});

// anjay
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    const loveButtons = document.querySelectorAll('.btn-love');
    const loveIconContainer = document.querySelector('.love-icon-container');
    const loveCountSpan = document.querySelector('.love-count');
    const loveModal = document.getElementById('love-modal');
    const favoriteList = loveModal ? loveModal.querySelector('.modal-body') : null;
    const loveModalCloseBtn = loveModal ? loveModal.querySelector('.modal-close-btn') : null;

    const orderModal = document.getElementById('order-modal');
    const orderModalCloseBtn = orderModal ? orderModal.querySelector('.modal-close-btn') : null;
    const orderForm = orderModal ? orderModal.querySelector('#order-form') : null;
    const confirmationMsg = orderModal ? document.getElementById('confirmation-message') : null;
    const uniqueCodeSpan = orderModal ? document.getElementById('unique-code') : null;
    const whatsappLink = orderModal ? document.getElementById('whatsapp-link') : null;

    const layananDipilihTextarea = orderModal ? document.getElementById('layanan-dipilih') : null;
    const tanggalPesanInput = orderModal ? document.getElementById('tanggal-pesan') : null;
    const pesanSekarangButtons = document.querySelectorAll('.service-card .btn-primary');
    
    // --- TESTIMONIAL FORM ---
    const addTestimonialBtn = document.getElementById('open-testimonial-modal');
    const addTestimonialModal = document.getElementById('add-testimonial-modal');
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialGrid = document.querySelector('.testimonials-grid');
    const testimonialModalCloseBtn = addTestimonialModal ? addTestimonialModal.querySelector('.modal-close-btn') : null;
    const starRatingInput = testimonialForm ? testimonialForm.querySelector('.star-rating-input') : null;
    const hiddenRatingInput = testimonialForm ? document.getElementById('hidden-rating') : null;
    const starIcons = starRatingInput ? starRatingInput.querySelectorAll('i') : [];

    // --- STATE MANAGEMENT ---
    let lovedServices = new Set();
    const WA_NUMBER = '6282337645011';
    let testimonials = [];

    // Inisialisasi dan Muat Data dari Local Storage
    function initializeFavorites() {
        try {
            const savedFavorites = JSON.parse(localStorage.getItem('lovedServices')) || [];
            lovedServices = new Set(savedFavorites);
            updateLoveCount();
            if (loveButtons.length > 0) {
                updateServiceCardButtons();
            }
        } catch (e) {
            console.error("Failed to load favorites from localStorage", e);
            lovedServices = new Set();
            updateLoveCount();
        }
    }
    
    function initializeTestimonials() {
        const savedTestimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
        testimonials = savedTestimonials;
        renderTestimonials();
    }

    // Simpan Data ke Local Storage
    function saveFavorites() {
        localStorage.setItem('lovedServices', JSON.stringify(Array.from(lovedServices)));
    }

    function saveTestimonials() {
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
    }

    // Perbarui jumlah pada ikon love di header
    function updateLoveCount() {
        if (loveCountSpan) {
            loveCountSpan.textContent = lovedServices.size;
        }
    }

    // Perbarui status tombol love di kartu layanan
    function updateServiceCardButtons() {
        loveButtons.forEach(button => {
            const card = button.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            let isLoved = false;
            for (let item of lovedServices) {
                if (item.name === serviceName) {
                    isLoved = true;
                    break;
                }
            }
            if (isLoved) {
                button.classList.add('loved');
            } else {
                button.classList.remove('loved');
            }
        });
    }

    // --- FUNCTIONS ---
    
    // Update Daftar Favorit di Modal
    function updateFavoriteList() {
        if (!favoriteList) return;
        favoriteList.innerHTML = '';
        if (lovedServices.size === 0) {
            favoriteList.innerHTML = '<p style="text-align: center; color: #888;">Belum ada layanan favorit.</p>';
        } else {
            lovedServices.forEach(service => {
                const item = document.createElement('div');
                item.classList.add('favorite-item');
                item.innerHTML = `
                    <div class="item-header">
                        <h4>${service.name}</h4>
                        <button class="btn-love-modal loved" data-item-name="${service.name}" title="Hapus dari Favorit">
                            <i class="fa fa-heart"></i>
                        </button>
                    </div>
                    <p class="item-description">${service.description}</p>
                    <div class="item-details">
                        <p class="price">${service.price}</p>
                        <a href="#" class="btn-pesan" data-item-name="${service.name}">Pesan</a>
                    </div>
                `;
                favoriteList.appendChild(item);
            });

            document.querySelectorAll('.btn-pesan').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceName = e.target.getAttribute('data-item-name');
                    openOrderModalForService(serviceName);
                });
            });

            document.querySelectorAll('.btn-love-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const serviceName = e.target.closest('button').getAttribute('data-item-name');
                    removeServiceFromFavorites(serviceName);
                    updateFavoriteList();
                });
            });
        }
    }

    // Hapus Layanan dari Favorit
    function removeServiceFromFavorites(serviceName) {
        let itemToRemove;
        for(let item of lovedServices) {
            if (item.name === serviceName) {
                itemToRemove = item;
                break;
            }
        }
        if (itemToRemove) {
            lovedServices.delete(itemToRemove);
            updateLoveCount();
            updateServiceCardButtons();
            saveFavorites();
        }
    }
    
    // Buka Modal Pesanan
    function openOrderModalForService(serviceName) {
        if (!orderModal || !orderForm || !layananDipilihTextarea || !tanggalPesanInput) return;

        if (loveModal) loveModal.style.display = 'none';
        orderForm.style.display = 'block';
        if (confirmationMsg) confirmationMsg.style.display = 'none';
        
        layananDipilihTextarea.value = serviceName;
        tanggalPesanInput.value = formatDate(new Date());
        orderModal.style.display = 'flex';
    }

    // Tangani Form Pemesanan
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nama = document.getElementById('nama').value;
            const telepon = document.getElementById('telepon').value;
            const layanan = layananDipilihTextarea.value;
            const tanggal = tanggalPesanInput.value;
            const uniqueCode = generateUniqueCode();
            
            const waMessage = `Halo Clean Craft, saya ingin memesan layanan. Berikut detailnya:
Nama: ${nama}
No. HP: ${telepon}
Layanan: ${layanan}
Tanggal Pesan: ${tanggal}
Kode Unik: ${uniqueCode}

Mohon diproses, terima kasih.`;
            
            const encodedMessage = encodeURIComponent(waMessage);
            
            if (whatsappLink) whatsappLink.href = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;
            
            orderForm.style.display = 'none';
            if (confirmationMsg) confirmationMsg.style.display = 'block';
            if (uniqueCodeSpan) uniqueCodeSpan.textContent = uniqueCode;

            lovedServices.clear();
            updateLoveCount();
            updateServiceCardButtons();
            saveFavorites();
        });
    }
    
    // Fungsi Utility
    function generateUniqueCode() {
        const timestamp = Date.now().toString(36);
        const randomNum = Math.random().toString(36).substr(2, 5);
        return 'CLEAN-' + timestamp.toUpperCase() + randomNum.toUpperCase();
    }

    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }
    
    function generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
        if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
        return stars;
    }

    // --- LOGIKA FORM TESTIMONI ---
    // Fungsi untuk merender testimoni dari array
    function renderTestimonials() {
        if (!testimonialGrid) return;
        testimonialGrid.innerHTML = '';
        testimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.classList.add('testimonial-card');
            card.innerHTML = `
                <div class="before-after">
                    ${testimonial.photo1 || testimonial.photo2 ? '' : '<p>Before & After</p>'}
                    ${testimonial.photo1 ? `<img src="${testimonial.photo1}" alt="Before" style="width:100%; height:auto;">` : ''}
                    ${testimonial.photo2 ? `<img src="${testimonial.photo2}" alt="After" style="width:100%; height:auto; margin-top: 5px;">` : ''}
                </div>
                <div class="card-content">
                    <h4>${testimonial.name}</h4>
                    <p class="service-name">${testimonial.service}</p>
                    <p class="card-quote">${testimonial.text}</p>
                    <div class="star-rating">
                        ${generateStarRating(testimonial.rating)}
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" data-index="${index}"><i class="fas fa-pencil-alt"></i></button>
                        <button class="delete-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
            testimonialGrid.appendChild(card);
        });
        
        setupTestimonialActionListeners();
    }
    
    // Atur listener untuk edit dan hapus
    function setupTestimonialActionListeners() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').getAttribute('data-index');
                if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
                    testimonials.splice(index, 1);
                    saveTestimonials();
                    renderTestimonials();
                }
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').getAttribute('data-index');
                const testimonialToEdit = testimonials[index];
                
                document.getElementById('customer-name').value = testimonialToEdit.name;
                document.getElementById('service-type').value = testimonialToEdit.service;
                document.getElementById('testimonial-text').value = testimonialToEdit.text;
                document.getElementById('hidden-rating').value = testimonialToEdit.rating;
                document.getElementById('photo-url-1').value = testimonialToEdit.photo1;
                document.getElementById('photo-url-2').value = testimonialToEdit.photo2;

                const starIconsInForm = document.querySelector('.star-rating-input').querySelectorAll('i');
                starIconsInForm.forEach(icon => {
                    if (parseInt(icon.getAttribute('data-value')) <= testimonialToEdit.rating) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                });
                
                if (addTestimonialModal) {
                    addTestimonialModal.style.display = 'flex';
                }
                
                testimonialForm.onsubmit = (e) => {
                    e.preventDefault();
                    testimonials[index].name = document.getElementById('customer-name').value;
                    testimonials[index].service = document.getElementById('service-type').value;
                    testimonials[index].text = document.getElementById('testimonial-text').value;
                    testimonials[index].rating = document.getElementById('hidden-rating').value;
                    testimonials[index].photo1 = document.getElementById('photo-url-1').value;
                    testimonials[index].photo2 = document.getElementById('photo-url-2').value;
                    saveTestimonials();
                    renderTestimonials();
                    addTestimonialModal.style.display = 'none';
                    testimonialForm.onsubmit = submitNewTestimonial;
                };
            });
        });
    }

    function submitNewTestimonial(e) {
        e.preventDefault();
        const name = document.getElementById('customer-name').value;
        const service = document.getElementById('service-type').value;
        const text = document.getElementById('testimonial-text').value;
        const rating = document.getElementById('hidden-rating').value;
        
        // Cek jika ada file yang diunggah
        const photo1File = document.getElementById('photo1').files[0];
        const photo2File = document.getElementById('photo2').files[0];
        const photo1Url = photo1File ? URL.createObjectURL(photo1File) : '';
        const photo2Url = photo2File ? URL.createObjectURL(photo2File) : '';

        const newTestimonial = { name, service, text, rating, photo1: photo1Url, photo2: photo2Url };
        testimonials.push(newTestimonial);
        saveTestimonials();
        renderTestimonials();

        if (addTestimonialModal) {
            addTestimonialModal.style.display = 'none';
        }
        testimonialForm.reset();
        alert("Testimoni Anda telah berhasil ditambahkan!");
    }
    
    if (testimonialForm) {
        testimonialForm.onsubmit = submitNewTestimonial;
    }

    if (starRatingInput) {
        starRatingInput.addEventListener('click', (e) => {
            const rating = e.target.getAttribute('data-value');
            if (rating) {
                hiddenRatingInput.value = rating;
                const starIconsInForm = starRatingInput.querySelectorAll('i');
                starIconsInForm.forEach(icon => {
                    if (parseInt(icon.getAttribute('data-value')) <= rating) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                });
            }
        });
    }
    
    // --- EVENT LISTENERS UTAMA ---
    if (loveButtons.length > 0) {
        loveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.service-card');
                const serviceName = card.querySelector('h3').textContent;
                const serviceDesc = card.querySelector('.description').textContent;
                const servicePrice = card.querySelector('.price').textContent;
                
                const serviceData = { name: serviceName, description: serviceDesc, price: servicePrice };
                
                let isLoved = false;
                let itemToDelete;
                for (let item of lovedServices) {
                    if (item.name === serviceData.name) {
                        isLoved = true;
                        itemToDelete = item;
                        break;
                    }
                }
    
                if (isLoved) {
                    lovedServices.delete(itemToDelete);
                    button.classList.remove('loved');
                } else {
                    lovedServices.add(serviceData);
                    button.classList.add('loved');
                }
                
                updateLoveCount();
                saveFavorites();
            });
        });
    }

    if (loveIconContainer) {
        loveIconContainer.addEventListener('click', (e) => {
            e.preventDefault();
            updateFavoriteList();
            if(loveModal) loveModal.style.display = 'flex';
        });
    }

    if (addTestimonialBtn) {
        addTestimonialBtn.addEventListener('click', () => {
            if (addTestimonialModal) {
                addTestimonialModal.style.display = 'flex';
                testimonialForm.reset();
                if (hiddenRatingInput) hiddenRatingInput.value = 0;
                if (starIcons.length > 0) {
                    starIcons.forEach(icon => {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    });
                }
                testimonialForm.onsubmit = submitNewTestimonial;
            }
        });
    }
    
    if (loveModalCloseBtn) loveModalCloseBtn.addEventListener('click', () => { loveModal.style.display = 'none'; });
    if (orderModalCloseBtn) orderModalCloseBtn.addEventListener('click', () => { orderModal.style.display = 'none'; });
    if (testimonialModalCloseBtn) testimonialModalCloseBtn.addEventListener('click', () => { addTestimonialModal.style.display = 'none'; });
    
    window.addEventListener('click', (e) => {
        if (e.target === loveModal) loveModal.style.display = 'none';
        if (e.target === orderModal) orderModal.style.display = 'none';
        if (e.target === addTestimonialModal) addTestimonialModal.style.display = 'none';
    });
    
    initializeFavorites();
    initializeTestimonials();
});







//promo spin
document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // KONFIGURASI GAME
    // =========================================================================
    const segments = [
        { label: 'zonk' }, { label: 'diskon 5%' }, { label: 'zonk' }, 
        { label: 'free reglue' }, { label: 'zonk' }, { label: 'free onkir' },
        { label: 'zonk' }, { label: 'zonk' }, { label: 'free parfum' }, 
        { label: 'zonk' }, { label: 'fast 13k' }, { label: 'zonk' }, 
        { label: 'zonk' }, { label: 'free kantong cc' }, { label: 'zonk' }, 
        { label: 'zonk' }, { label: 'zonk' }, { label: 'zonk' }, 
        { label: 'zonk' }, { label: 'zonk' }
    ];
    const colors = [
        '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
        '#f8b595', '#f67280', '#c06c84', '#6c5b7b', '#355c7d', '#f3a683', '#f19066',
        '#77dd77', '#fdfd96', '#84b6f4', '#fdcae1', '#b0e0e6'
    ];
    const LUCKY_DATES = [3, 8, 12, 19, 25, 27];
    const MAX_TRIES = 3;

    // =========================================================================
    // ELEMEN HTML & VARIABEL STATUS
    // =========================================================================
    const canvas = document.getElementById('spinWheel');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const spinButtonText = document.getElementById('spinButtonText');
    const resultText = document.getElementById('resultText');
    const whatsappButton = document.getElementById('whatsappButton');
    const spinSound = document.getElementById('spinSound');
    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');
    
    const segmentCount = segments.length;
    const segmentAngle = 360 / segmentCount;
    let isSpinning = false;
    let currentRotation = 0;
    let playCount = 0;

    // =========================================================================
    // FUNGSI UTAMA
    // =========================================================================

    const drawWheel = () => {
        const centerX = 250, centerY = 250, radius = 250;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        segments.forEach((segment, i) => {
            const startAngleRad = (i * segmentAngle - 90) * (Math.PI / 180);
            const endAngleRad = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
            ctx.beginPath();
            ctx.fillStyle = colors[i];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngleRad, endAngleRad);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngleRad + (endAngleRad - startAngleRad) / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Poppins';
            ctx.fillText(segment.label, radius - 15, 5);
            ctx.restore();
        });
    };
    
    const checkDailyLimit = () => {
        const today = new Date().toISOString().split('T')[0];
        const lastPlayDate = localStorage.getItem('spinLastPlayDate');
        if (lastPlayDate !== today) {
            localStorage.setItem('spinPlayCount', '0');
            localStorage.setItem('spinLastPlayDate', today);
        }
        playCount = parseInt(localStorage.getItem('spinPlayCount') || '0');
        updateUI();
    };

    const updateUI = () => {
        whatsappButton.style.display = 'none';
        if (playCount >= MAX_TRIES) {
            resultText.innerText = "tidak ada hadiah untukmu hari ini, coba lagi besok";
            spinButton.disabled = true;
            spinButtonText.innerText = "Habis";
        } else {
            const triesLeft = MAX_TRIES - playCount;
            resultText.innerText = `Anda punya ${triesLeft} kesempatan hari ini!`;
            spinButton.disabled = false;
            spinButtonText.innerText = "Start";
        }
    };
    
    const handleResult = (targetSegmentIndex) => {
        spinSound.pause();
        spinSound.currentTime = 0;
        
        playCount++;
        localStorage.setItem('spinPlayCount', playCount.toString());
        
        const winningSegment = segments[targetSegmentIndex];
        
        if (winningSegment.label !== 'zonk') {
            winSound.play();
            let winMessage = "";
            switch(winningSegment.label) {
                case 'diskon 5%': winMessage = "HOKI! Anda dapat diskon 5%, hubungi mimin!"; break;
                default: winMessage = `HOKI! Anda dapat ${winningSegment.label}, hubungi mimin!`;
            }
            resultText.innerHTML = `<strong>${winMessage}</strong>`;
            whatsappButton.style.display = 'block';
            localStorage.setItem('spinPlayCount', MAX_TRIES.toString());
            checkDailyLimit();
        } else {
            loseSound.play();
            if (playCount === 1) {
                resultText.innerText = "haha, kamu tidak cukup beruntung";
            } else if (playCount === 2) {
                resultText.innerText = "gagal lagi, mungkin kamu tidak di takdirkan menang";
            }
            updateUI(); 
        }
        isSpinning = false;
    };

    const spin = () => {
        if (isSpinning || playCount >= MAX_TRIES) return;

        isSpinning = true;
        spinButton.disabled = true;
        spinButtonText.innerText = "...";
        resultText.innerText = "Semoga beruntung...";
        whatsappButton.style.display = 'none';
        spinSound.loop = true;
        spinSound.play();

        const today = new Date().getDate();
        const canWinToday = LUCKY_DATES.includes(today);
        let targetSegmentIndex;
        
        const losingIndices = segments.map((s, i) => s.label === 'zonk' ? i : -1).filter(i => i !== -1);
        
        if (canWinToday && Math.random() < 0.5) {
             const winningIndices = segments.map((s, i) => s.label !== 'zonk' ? i : -1).filter(i => i !== -1);
             targetSegmentIndex = winningIndices[Math.floor(Math.random() * winningIndices.length)];
        } else {
            targetSegmentIndex = losingIndices[Math.floor(Math.random() * losingIndices.length)];
        }
        
        const targetAngleCenter = (targetSegmentIndex * segmentAngle) + (segmentAngle / 2);
        const rotationOffset = 360 - targetAngleCenter;
        const fullSpins = 5 * 360;
        const finalRotation = Math.round(currentRotation / 360) * 360 + fullSpins + rotationOffset;
        currentRotation = finalRotation;

        canvas.style.transform = `rotate(${finalRotation}deg)`;
        
        setTimeout(() => handleResult(targetSegmentIndex), 5000);
    };

    spinButton.onclick = spin;
    drawWheel();
    checkDailyLimit();
});
