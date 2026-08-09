// --- 1. GLOBAL & AUTHENTICATION ---
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');


if (!token) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const menuAdmin = document.getElementById('menuAdmin');
    
    // Sembunyikan atau tampilkan menu admin berdasarkan role
    if (menuAdmin) {
        if (role === 'admin') {
            menuAdmin.style.display = 'block'; // Tampil jika admin
        } else {
            menuAdmin.style.display = 'none';  // Sembunyikan jika user biasa
        }
    }

    if (token) {
        initDashboard();
    }
});

// --- 2. FORMATTER & STATE ---
const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

let allReports = [];
let currentTabReport = null;

// --- 3. DASHBOARD & TABS ---
// Perbarui fungsi initDashboard agar bisa menerima parameter preserveReportId
async function initDashboard(preserveReportId = null) {
    try {
        const today = new Date().toISOString().split('T')[0];
        await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ date: today })
        });

        const res = await fetch('/api/arsip', { headers: { 'Authorization': `Bearer ${token}` } });
        allReports = await res.json();
        
        renderTabs();
        hitungRingkasanBulanIni();

        // Jika ada ID yang ingin dipertahankan (tab aktif saat ini), buka tab tersebut
        if (preserveReportId) {
            const target = allReports.find(r => r.id === preserveReportId);
            if (target) {
                openTab(target);
                return;
            }
        }

        if (currentTabReport) {
            const target = allReports.find(r => r.id === currentTabReport.id);
            if (target) {
                openTab(target);
                return;
            }
        }

        if (allReports.length > 0) openTab(allReports[0]);
    } catch (err) {
        console.error('Error initDashboard:', err);
    }
}

// Perbarui fungsi tambahPenjualan agar mengirim activeId kembali ke initDashboard
async function tambahPenjualan(e) {
    e.preventDefault();
    if (!currentTabReport) return;
    
    const activeId = currentTabReport.id; // Simpan ID tab yang sedang aktif
    const payload = {
        report_id: activeId,
        product_name: document.getElementById('namaProduk').value,
        category: document.getElementById('kategori').value,
        qty: document.getElementById('qty').value,
        price: document.getElementById('harga').value
    };

    try {
        await fetch('/api/sales', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        document.getElementById('formPenjualan').reset();
        tutupModal();
        
        // Panggil initDashboard dengan membawa ID agar tetap di tab hari ini
        initDashboard(activeId); 
    } catch (err) {
        console.error('Error tambahPenjualan:', err);
    }
}
function renderTabs() {
    const tabContainer = document.getElementById('dateTabs');
    if (!tabContainer) return;
    tabContainer.innerHTML = '';
    
    allReports.forEach(report => {
        const isActive = currentTabReport && currentTabReport.id === report.id ? 'active' : '';
        tabContainer.innerHTML += `
            <div class="tab ${isActive}" onclick='openTabByID(${report.id})'>
                📅 ${report.date}
            </div>
        `;
    });
    
    tabContainer.innerHTML += `<div class="tab tab-add" onclick="tambahHariBaru()">+ Tambah Hari</div>`;
}

function openTabByID(id) {
    const report = allReports.find(r => r.id === id);
    if (report) openTab(report);
}

function openTab(report) {
    currentTabReport = report;
    renderTabs();
    
    const judulTanggal = document.getElementById('judulTanggal');
    const inputModalMakanan = document.getElementById('inputModalMakanan');
    const inputModalMinuman = document.getElementById('inputModalMinuman');

    if (judulTanggal) judulTanggal.innerText = `Dashboard Tanggal: ${report.date}`;
    if (inputModalMakanan) inputModalMakanan.value = report.modal_makanan;
    if (inputModalMinuman) inputModalMinuman.value = report.modal_minuman;
    
    loadSalesUntukTabIni();
}

async function loadSalesUntukTabIni() {
    if (!currentTabReport) return;
    try {
        const res = await fetch(`/api/sales/report/${currentTabReport.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const salesData = await res.json();
        
        const tbody = document.getElementById('tabelPenjualan');
        if (!tbody) return;
        tbody.innerHTML = '';
        let omzetMak = 0; 
        let omzetMin = 0;

        salesData.forEach(s => {
            if (s.category === 'Makanan') omzetMak += s.total;
            if (s.category === 'Minuman') omzetMin += s.total;
            tbody.innerHTML += `<tr>
                <td style="font-weight:600">${s.product_name}</td>
                <td><span style="background:#e0e7ff; color:#4f46e5; padding:4px 10px; border-radius:20px; font-size:12px;">${s.category}</span></td>
                <td>${s.qty}</td>
                <td style="font-weight:bold">${formatRp(s.total)}</td>
                <td><button class="btn btn-danger" style="padding:5px 10px; font-size:12px;" onclick="hapusPenjualan(${s.id})">Hapus</button></td>
            </tr>`;
        });

        const mMak = parseFloat(currentTabReport.modal_makanan) || 0;
        const mMin = parseFloat(currentTabReport.modal_minuman) || 0;

        document.getElementById('omzetMakanan').innerText = formatRp(omzetMak);
        document.getElementById('profitMakanan').innerText = formatRp(omzetMak - mMak);
        document.getElementById('omzetMinuman').innerText = formatRp(omzetMin);
        document.getElementById('profitMinuman').innerText = formatRp(omzetMin - mMin);

        const omzetTotal = omzetMak + omzetMin;
        const modalTotal = mMak + mMin;
        document.getElementById('omzetTotal').innerText = formatRp(omzetTotal);
        document.getElementById('modalTotal').innerText = formatRp(modalTotal);
        document.getElementById('profitTotal').innerText = formatRp(omzetTotal - modalTotal);
    } catch (err) {
        console.error('Error loadSalesUntukTabIni:', err);
    }
}

function hitungRingkasanBulanIni() {
    const bulanSekarang = new Date().toISOString().slice(0, 7);
    let totalOmzetBulan = 0;
    let totalModalBulan = 0;

    allReports.forEach(r => {
        if (r.date.startsWith(bulanSekarang)) {
            totalOmzetBulan += r.omzet_total || 0;
            totalModalBulan += ((r.modal_makanan || 0) + (r.modal_minuman || 0));
        }
    });

    const bulanOmzet = document.getElementById('bulanOmzet');
    const bulanProfit = document.getElementById('bulanProfit');
    if (bulanOmzet) bulanOmzet.innerText = formatRp(totalOmzetBulan);
    if (bulanProfit) bulanProfit.innerText = formatRp(totalOmzetBulan - totalModalBulan);
}

// --- 4. MODAL & DATA TRANSAKSI ---
function bukaModal() {
    if (!currentTabReport) return alert("Pilih tab tanggal dulu!");
    document.getElementById('teksModalTanggal').innerText = `Menambahkan data untuk tanggal: ${currentTabReport.date}`;
    document.getElementById('modalTambah').style.display = 'flex';
    setTimeout(() => document.getElementById('modalBox').classList.add('show'), 10);
}

function tutupModal() {
    const modalBox = document.getElementById('modalBox');
    if (modalBox) modalBox.classList.remove('show');
    setTimeout(() => {
        const modalTambah = document.getElementById('modalTambah');
        if (modalTambah) modalTambah.style.display = 'none';
    }, 300);
}

async function tambahHariBaru() {
    const tgl = prompt("Masukkan tanggal baru (Format: YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
    if (!tgl) return;
    
    try {
        const res = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ date: tgl })
        });
        const newReport = await res.json();
        
        // Refresh data arsip/tabs, lalu otomatis buka tab hari yang baru dibuat
        const resArsip = await fetch('/api/arsip', { headers: { 'Authorization': `Bearer ${token}` } });
        allReports = await resArsip.json();
        
        renderTabs();
        
        // Cari report berdasarkan ID yang baru dibuat dan buka otomatis
        const targetReport = allReports.find(r => r.date === tgl || r.id === newReport.id);
        if (targetReport) {
            openTab(targetReport);
        } else if (allReports.length > 0) {
            openTab(allReports[0]);
        }
    } catch (err) {
        console.error('Error tambahHariBaru:', err);
    }
}

async function tambahPenjualan(e) {
    e.preventDefault();
    if (!currentTabReport) {
        alert("Pilih tab tanggal terlebih dahulu!");
        return;
    }

    const payload = {
        report_id: currentTabReport.id,
        product_name: document.getElementById('namaProduk').value,
        category: document.getElementById('kategori').value,
        qty: document.getElementById('qty').value,
        price: document.getElementById('harga').value // Pastikan mengambil id 'harga'
    };

    try {
        const res = await fetch('/api/sales', {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            document.getElementById('formPenjualan').reset();
            tutupModal();
            initDashboard(); // Muat ulang data agar tabel dan omzet terupdate
        } else {
            const errData = await res.json();
            alert('Gagal menyimpan: ' + (errData.error || 'Terjadi kesalahan'));
        }
    } catch (err) {
        console.error('Error tambahPenjualan:', err);
    }
}

async function hapusPenjualan(id) {
    if (!confirm('Hapus barang ini?')) return;
    await fetch(`/api/sales/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    initDashboard();
}

async function updateModal() {
    if (!currentTabReport) return;
    const mm = document.getElementById('inputModalMakanan').value || 0;
    const mi = document.getElementById('inputModalMinuman').value || 0;
    await fetch(`/api/reports/${currentTabReport.id}/modal`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ modal_makanan: mm, modal_minuman: mi })
    });
    currentTabReport.modal_makanan = mm; 
    currentTabReport.modal_minuman = mi;
    initDashboard(); 
}

/// --- 5. KALKULATOR ---
let calcExpression = "";
function calcAction(val) {
    const screen = document.getElementById('calcScreen');
    if (!screen) return;
    
    if (val === 'C') {
        calcExpression = "";
        screen.innerText = "0";
    } else if (val === 'DEL') {
        // Hapus 1 karakter terakhir dari ekspresi
        calcExpression = calcExpression.slice(0, -1);
        screen.innerText = calcExpression === "" ? "0" : calcExpression;
    } else if (val === '=') {
        try {
            calcExpression = new Function('return ' + calcExpression)().toString(); 
            screen.innerText = calcExpression;
        } catch (e) {
            screen.innerText = "Error";
            calcExpression = "";
        }
    } else {
        calcExpression += val;
        screen.innerText = calcExpression;
    }
}

function hitungPersen() {
    const p = parseFloat(document.getElementById('persenInput').value) || 0;
    const n = parseFloat(document.getElementById('nilaiInput').value) || 0;
    const hasilPersen = document.getElementById('hasilPersen');
    if (hasilPersen) hasilPersen.innerText = "Hasil: " + formatRp((p / 100) * n);
}

function hitungTambahKurang(isTambah) {
    const v = parseFloat(document.getElementById('valAwal').value) || 0;
    const p = parseFloat(document.getElementById('valPersen').value) || 0;
    const h = isTambah ? v + (v * (p / 100)) : v - (v * (p / 100));
    const hasilTambahKurang = document.getElementById('hasilTambahKurang');
    if (hasilTambahKurang) hasilTambahKurang.innerText = "Hasil: " + formatRp(h);
}

// --- 6. NAVIGASI & MENU MOBILE ---
function showPage(pageId, element) {
    // Sembunyikan semua halaman & pastikan style display-nya di-reset
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none'; // Tambahan pengaman agar benar-benar tertutup
    });

    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block'; // Paksa tampilkan halaman yang dituju
    }

    // Atur kelas active pada menu sidebar jika elemen diklik
    if (element) {
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        element.classList.add('active');
    }

    // Jika halaman admin dibuka, muat data user-nya
    if (pageId === 'adminPanel') {
        if (typeof loadAdminUsers === 'function') {
            loadAdminUsers();
        } else {
            console.warn("Fungsi loadAdminUsers belum didefinisikan!");
        }
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar) sidebar.classList.toggle('show');
}

function logout() { 
    localStorage.clear(); 
    window.location.href = 'index.html'; 
}
// --- 7. ADMIN PANEL FUNCTIONS ---
async function loadAdmin() {
    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Gagal mengambil data admin');
        const users = await res.json();
        
        const tbody = document.getElementById('tabelAdmin');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (Array.isArray(users) && users.length > 0) {
            users.forEach(u => {
                const isActive = u.status === 'aktif'; // atau u.active !== false
                tbody.innerHTML += `
                    <tr>
                        <td>${u.access_key}</td> <!-- Ubah dari u.key menjadi u.access_key -->
                        <td>${u.label}</td>
                        <td><span style="color: ${isActive ? 'green' : 'red'}">${u.status || 'Aktif'}</span></td>
                        <td><button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="hapusUser(${u.id})">Hapus</button></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:gray;">Belum ada user terdaftar</td></tr>';
        }
    } catch (err) {
        console.error('Error loadAdmin:', err);
    }
}

async function buatUser() {
    const newKey = document.getElementById('newKey').value.trim();
    const newLabel = document.getElementById('newLabel').value.trim();

    if (!newKey || !newLabel) {
        alert('Access Key dan Nama Label harus diisi!');
        return;
    }

    try {
        const res = await fetch('/api/kasir/users', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') 
            },
            body: JSON.stringify({ access_key: newKey, label: newLabel })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Berhasil membuat Access Key baru!');
            document.getElementById('newKey').value = '';
            document.getElementById('newLabel').value = '';
            loadAdminUsers(); // Refresh tabel
        } else {
            alert(data.error || 'Gagal membuat user');
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan pada server');
    }
}

async function hapusUser(key) {
    if (!confirm(`Yakin ingin menghapus user ${key}?`)) return;
    try {
        const res = await fetch(`/api/admin/users/${key}`, { 
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            loadAdmin();
        } else {
            alert('Gagal menghapus user');
        }
    } catch (err) {
        console.error('Error hapusUser:', err);
    }
}

let arsipChart = null;
let currentMonthOffset = 0; // 0 = Bulan aktif saat ini, minus/plus untuk geser bulan

function geserBulan(direction) {
    currentMonthOffset += direction;
    loadArsip();
}

function loadArsip() {
    const tbody = document.getElementById('tabelArsip');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let reportsData = (typeof allReports !== 'undefined' && allReports) ? allReports : [];
    if (reportsData.length === 0) {
        const localData = localStorage.getItem('allReports') || localStorage.getItem('reports') || localStorage.getItem('kasir_reports');
        if (localData) {
            try { reportsData = JSON.parse(localData); } catch(e) {}
        }
    }

    if (reportsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #6b7280;">Belum ada data arsip.</td></tr>';
        return;
    }

    // Kelompokkan data harian berdasarkan bulan (Format: "YYYY-MM")
    const monthlyMap = {};

    reportsData.forEach(report => {
        const dateStr = report.date || report.tanggal || report.tgl || '';
        if (!dateStr) return;
        
        const monthKey = dateStr.substring(0, 7); // Contoh: "2026-08"

        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = [];
        }

        let omzet = 0;
        let modal = (Number(report.modal_makanan) || Number(report.modalMakanan) || Number(report.modal_makan) || 0) + 
                    (Number(report.modal_minuman) || Number(report.modalMinuman) || Number(report.modal_minum) || 0);
        
        Object.keys(report).forEach(key => {
            const lowerKey = key.toLowerCase();
            if ((lowerKey.includes('omzet') || lowerKey.includes('total') || lowerKey.includes('pendapatan') || lowerKey.includes('penjualan')) && typeof report[key] === 'number') {
                if (report[key] > omzet) omzet = report[key];
            }
        });

        const possibleArrays = [report.items, report.penjualan, report.transaksi, report.list, report.data, report.products];
        possibleArrays.forEach(arr => {
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    let itemTotal = 0;
                    Object.keys(item).forEach(k => {
                        const lk = k.toLowerCase();
                        if ((lk.includes('total') || lk.includes('subtotal') || lk.includes('jumlah_harga')) && typeof item[k] === 'number') {
                            itemTotal = item[k];
                        }
                    });
                    if (itemTotal === 0) {
                        let q = 0, p = 0;
                        Object.keys(item).forEach(k => {
                            const lk = k.toLowerCase();
                            if ((lk === 'qty' || lk === 'quantity' || lk === 'jumlah' || lk === 'jml' || lk === 'count') && typeof item[k] === 'number') q = item[k];
                            if ((lk === 'price' || lk === 'harga' || lk === 'hargasatuan' || lk === 'tarif') && typeof item[k] === 'number') p = item[k];
                        });
                        itemTotal = q * p;
                    }
                    omzet += itemTotal;
                });
            }
        });

        monthlyMap[monthKey].push({
            date: dateStr,
            omzet: omzet,
            modal: modal,
            profit: omzet - modal
        });
    });

    const sortedMonths = Object.keys(monthlyMap).sort();
    if (sortedMonths.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #6b7280;">Tidak ada data bulan ditemukan.</td></tr>';
        return;
    }

    // Batasi navigasi offset agar aman sesuai jumlah bulan yang ada
    const maxOffset = 0;
    const minOffset = -(sortedMonths.length - 1);
    if (currentMonthOffset > maxOffset) currentMonthOffset = maxOffset;
    if (currentMonthOffset < minOffset) currentMonthOffset = minOffset;

    const activeMonthKey = sortedMonths[sortedMonths.length - 1 + currentMonthOffset];
    const dailyDataOfActiveMonth = monthlyMap[activeMonthKey] || [];

    // Urutkan data harian berdasarkan tanggal secara kronologis
    dailyDataOfActiveMonth.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Render Tabel Arsip Harian
    const thead = document.querySelector('#arsip table thead tr');
    if (thead) {
        thead.innerHTML = '<th>Tanggal</th><th>Total Omzet</th><th>Total Modal</th><th>Keuntungan Bersih</th>';
    }

    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const [yTarget, mTarget] = activeMonthKey.split('-');
    const namaBulanAktif = `${namaBulan[parseInt(mTarget, 10) - 1]} ${yTarget}`;

    const titleHeader = document.querySelector('#arsip h2');
    if (titleHeader) {
        titleHeader.innerText = `Grafik & Arsip Harian - ${namaBulanAktif}`;
    }

    if (dailyDataOfActiveMonth.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #6b7280;">Tidak ada data pada bulan ${namaBulanAktif}.</td></tr>`;
    } else {
        let rowsHtml = '';
        // Urutkan dari tanggal terbaru ke terlama untuk tampilan tabel
        const reversedRows = [...dailyDataOfActiveMonth].reverse();
        reversedRows.forEach(item => {
            rowsHtml += `
                <tr>
                    <td>${item.date}</td>
                    <td>Rp${item.omzet.toLocaleString('id-ID')}</td>
                    <td>Rp${item.modal.toLocaleString('id-ID')}</td>
                    <td style="font-weight: bold; color: ${item.profit >= 0 ? '#10b981' : '#ef4444'};">Rp${item.profit.toLocaleString('id-ID')}</td>
                </tr>
            `;
        });
        tbody.innerHTML = rowsHtml;
    }

    // Render Grafik Garis Harian
    const chartLabels = dailyDataOfActiveMonth.map(item => item.date); // Tanggal lengkap harian
    const chartOmzet = dailyDataOfActiveMonth.map(item => item.omzet);
    const chartModal = dailyDataOfActiveMonth.map(item => item.modal);
    const chartProfit = dailyDataOfActiveMonth.map(item => item.profit);

    const ctx = document.getElementById('chartArsip');
    if (ctx) {
        if (arsipChart) {
            arsipChart.destroy();
        }
        
        arsipChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Total Omzet Harian',
                        data: chartOmzet,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Total Modal Harian',
                        data: chartModal,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Keuntungan Bersih Harian',
                        data: chartProfit,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: `Periode: ${namaBulanAktif}`
                    }
                }
            }
        });
    }
}

// Cek apakah yang login adalah admin
// --- CEK ROLE PENGGUNA SAAT HALAMAN DIMUAT ---
const userRole = localStorage.getItem('role');

if (userRole === 'admin') {
    console.log("Login sebagai Admin Kasir");
    
    // Tampilkan menu admin di sidebar
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) adminMenu.style.display = 'block';

    // Tampilkan elemen panel admin jika ada
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'block';
} else {
    // Sembunyikan menu dan panel admin jika bukan admin
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) adminMenu.style.display = 'none';

    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'none';
}

// Fungsi untuk memuat daftar user/access key khusus admin
async function loadAdminUsers() {
    try {
        const res = await fetch('/api/kasir/users', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const users = await res.json();
        
        const tbody = document.getElementById('tabelAdmin');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td><b>${u.access_key || u.username}</b></td>
                    <td>${u.label || '-'}</td>
                    <td>${u.status}</td>
                    <td><button class="btn btn-danger" onclick="hapusUser(${u.id})">Hapus</button></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Gagal memuat data admin:', err);
    }
}

// Fungsi untuk membuat user/access key baru
async function buatUser() {
    const newKey = document.getElementById('newKey').value.trim();
    const newLabel = document.getElementById('newLabel').value.trim();

    if (!newKey || !newLabel) {
        alert('Access Key dan Nama Label harus diisi!');
        return;
    }

    try {
        const res = await fetch('/api/kasir/users', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') 
            },
            body: JSON.stringify({ access_key: newKey, label: newLabel })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Berhasil membuat Access Key baru!');
            document.getElementById('newKey').value = '';
            document.getElementById('newLabel').value = '';
            loadAdminUsers(); // Refresh tabel
        } else {
            alert(data.error || 'Gagal membuat user');
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan pada server');
    }
}

/// --- LOAD NAMA TOKO DAN FITUR EDIT SAAT HALAMAN DIBUKA ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. LOAD NAMA TOKO SAAT HALAMAN DIBUKA
    const displayNamaToko = document.getElementById('displayNamaToko');
    const savedStoreName = localStorage.getItem('label') || localStorage.getItem('storeName') || 'Kasir Pro';
    
    if (displayNamaToko) {
        displayNamaToko.textContent = savedStoreName;
    }

    // 2. FITUR KLIK IKON PENSIL UNTUK UBAH NAMA TOKO
    const btnEditToko = document.getElementById('btnEditToko');
    if (btnEditToko) {
        btnEditToko.addEventListener('click', async () => {
            const namaBaru = prompt("Masukkan Nama Toko yang baru:", displayNamaToko.textContent);
            
            if (namaBaru && namaBaru.trim() !== "") {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/kasir/store-name', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ new_label: namaBaru })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        displayNamaToko.textContent = result.new_label;
                        localStorage.setItem('label', result.new_label);
                        localStorage.setItem('storeName', result.new_label);
                        alert("Nama toko berhasil diperbarui!");
                    } else {
                        alert(result.error || "Gagal mengubah nama toko.");
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert("Gagal terhubung ke server.");
                }
            }
        });
    }

    // 3. FITUR TOGGLE MENU MOBILE (GARIS 3)
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
        });

        // Menutup sidebar jika pengguna mengklik di luar area menu
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }
    // --- FITUR PERPINDAHAN HALAMAN / MENU SIDEBAR ---
    const navLinks = document.querySelectorAll('.sidebar a, .sidebar-menu a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetHash = link.getAttribute('href');
            
            // Cek apakah link mengarah ke halaman internal (#)
            if (targetHash && targetHash.startsWith('#')) {
                const targetId = targetHash.substring(1);
                
                // Kecualikan jika tombol logout
                if (targetId === 'logout') return;

                e.preventDefault();
                
                // 1. Sembunyikan semua halaman, lalu tampilkan halaman yang diklik
                pages.forEach(page => {
                    if (page.id === targetId) {
                        page.classList.add('active');
                    } else {
                        page.classList.remove('active');
                    }
                });

                // 2. Perbarui status aktif pada menu sidebar
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // 3. Otomatis tutup sidebar di HP setelah menu diklik
                const sidebar = document.getElementById('sidebar');
                if (window.innerWidth <= 900 && sidebar) {
                    sidebar.classList.remove('show');
                }
            }
        });
    });
});

// --- FITUR EDIT NAMA TOKO ---
function editStoreName() {
    const currentName = localStorage.getItem('storeName') || 'Kasir Pro';
    const newName = prompt("Masukkan nama toko baru:", currentName);
    
    if (newName && newName.trim() !== "") {
        localStorage.setItem('storeName', newName.trim());
        const storeTitleEl = document.getElementById('storeTitle');
        if (storeTitleEl) {
            storeTitleEl.textContent = newName.trim();
        }
        alert("Nama toko berhasil diperbarui!");
    }
}