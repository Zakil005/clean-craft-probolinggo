document.addEventListener('DOMContentLoaded', () => {
    // FUNGSI UNTUK FILTER LAYANAN
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');

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

    // FUNGSI UNTUK TOMBOL LOVE DAN MODAL
    const loveButtons = document.querySelectorAll('.btn-love');
    const loveIconContainer = document.querySelector('.love-icon-container');
    const loveCountSpan = document.querySelector('.love-count');
    const loveModal = document.getElementById('love-modal');
    const favoriteList = document.getElementById('favorite-list');
    const loveModalCloseBtn = loveModal.querySelector('.modal-close-btn');

    const orderModal = document.getElementById('order-modal');
    const orderModalCloseBtn = orderModal.querySelector('.modal-close-btn');
    const orderForm = document.getElementById('order-form');
    const confirmationMsg = document.getElementById('confirmation-message');
    const uniqueCodeSpan = document.getElementById('unique-code');

    let lovedServices = new Set();

    // Menambahkan atau menghapus layanan favorit
    loveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            const serviceDesc = card.querySelector('.description').textContent;
            const servicePrice = card.querySelector('.price').textContent;
            
            const serviceData = {
                name: serviceName,
                desc: serviceDesc,
                price: servicePrice
            };
            
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
            
            loveCountSpan.textContent = lovedServices.size;
        });
    });

    // Menampilkan modal favorit
    loveIconContainer.addEventListener('click', (e) => {
        e.preventDefault();
        updateFavoriteList();
        loveModal.style.display = 'flex';
    });

    // Menutup modal favorit
    loveModalCloseBtn.addEventListener('click', () => {
        loveModal.style.display = 'none';
    });

    // Menutup modal saat klik di luar area
    window.addEventListener('click', (e) => {
        if (e.target === loveModal) {
            loveModal.style.display = 'none';
        }
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
            orderForm.reset();
            orderForm.style.display = 'block';
            confirmationMsg.style.display = 'none';
        }
    });

    // Memperbarui daftar favorit di dalam modal
    function updateFavoriteList() {
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
                        <button class="btn-love loved" data-item-name="${service.name}" title="Hapus dari Favorit">
                            <i class="fa fa-heart"></i>
                        </button>
                    </div>
                    <p class="item-description">${service.desc}</p>
                    <div class="item-details">
                        <p class="price">${service.price}</p>
                        <a href="#" class="btn-pesan">Pesan</a>
                    </div>
                `;
                favoriteList.appendChild(item);
            });
            // Menambahkan event listener ke setiap tombol 'Pesan' yang baru dibuat
            document.querySelectorAll('.btn-pesan').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    loveModal.style.display = 'none';
                    orderModal.style.display = 'flex';
                });
            });
        }
    }

    // Menutup modal pemesanan
    orderModalCloseBtn.addEventListener('click', () => {
        orderModal.style.display = 'none';
        orderForm.reset();
        orderForm.style.display = 'block';
        confirmationMsg.style.display = 'none';
    });

    // Menangani pengiriman formulir
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nama = document.getElementById('nama').value;
        const telepon = document.getElementById('telepon').value;

        const uniqueCode = generateUniqueCode();
        
        orderForm.style.display = 'none';
        confirmationMsg.style.display = 'block';
        uniqueCodeSpan.textContent = uniqueCode;

        lovedServices.clear();
        loveCountSpan.textContent = 0;
    });

    // Fungsi untuk membuat kode unik
    function generateUniqueCode() {
        const timestamp = Date.now().toString(36);
        const randomNum = Math.random().toString(36).substr(2, 5);
        return 'CLEAN-' + timestamp.toUpperCase() + randomNum.toUpperCase();
    }
});