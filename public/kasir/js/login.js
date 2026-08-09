let currentMode = 'login';

function switchTab(mode) {
    currentMode = mode;
    const loginTab = document.getElementById('btn-login-tab');
    const registerTab = document.getElementById('btn-register-tab');
    const storeNameGroup = document.getElementById('storeNameGroup');
    const storeNameInput = document.getElementById('storeName');
    const submitBtn = document.getElementById('submitBtn');

    if (mode === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        storeNameGroup.style.display = 'none';
        storeNameInput.removeAttribute('required');
        submitBtn.textContent = 'Masuk & Buka Toko';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        storeNameGroup.style.display = 'block';
        storeNameInput.setAttribute('required', 'true');
        submitBtn.textContent = 'Daftar & Buat Akun';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accessToken = document.getElementById('accessToken').value;
        const storeName = document.getElementById('storeName') ? document.getElementById('storeName').value : '';

        try {
            let endpoint, payload;

            if (currentMode === 'login') {
                // Sesuai dengan app.post('/api/kasir/login') di server.js
                endpoint = '/api/kasir/login';
                payload = { access_key: accessToken };
            } else {
                // Sesuai dengan app.post('/api/kasir/users') di server.js
                endpoint = '/api/kasir/users';
                payload = { key: accessToken, label: storeName };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                if (currentMode === 'login') {
                    // Simpan token JWT ke localStorage agar bisa dipakai request selanjutnya
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('role', result.role);
                    localStorage.setItem('label', result.label);
                    
                    alert('Login Berhasil!');
                    // UBAH BARIS INI:
                    window.location.href = '/kasir/app.html';
                } else {
                    alert('Akun Toko Berhasil Dibuat! Silakan pindah ke tab Login.');
                    switchTab('login'); // Otomatis pindah ke tab login setelah sukses daftar
                }
            } else {
                alert(result.error || result.message || 'Terjadi kesalahan pada autentikasi.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal terhubung ke server.');
        }
    });
});