let currentProfile = 'default';
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentProfile = urlParams.get('profile') || 'default';

    initParticles(70);
    loadTasks();

    // 1. Atur otomatis tujuan link "Kembali ke Menu" beserta profilnya
  const backBtn = document.getElementById('back-to-menu');
if (backBtn && currentProfile) {
    backBtn.href = `../dashboard.html?profile=${encodeURIComponent(currentProfile)}`;
}

    // Filter Status Tab
    const filterButtons = document.querySelectorAll('.tab-btn, .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-status') || 'all';
            renderTasks();
        });
    });

    // Live Search
    const searchInput = document.getElementById('search-input') || document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTasks();
        });
    }

    // Form Submit (jika menggunakan form)
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await window.addTask();
        });
    }
});

// Fungsi Global untuk Tombol Tambah (bisa dipanggil via onclick HTML)
window.addTask = async function() {
    const input = document.getElementById('taskInput') || document.getElementById('task-input');
    if (!input) {
        alert('Input tugas tidak ditemukan!');
        return;
    }

    const description = input.value.trim();
    if (!description) {
        alert('Silakan masukkan tugas terlebih dahulu!');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, profile: currentProfile })
        });

        if (response.ok) {
            input.value = '';
            input.focus();
            loadTasks();
        } else {
            console.error('Gagal menyimpan tugas ke server');
        }
    } catch (error) {
        console.error('Error koneksi:', error);
    }
};

// Ambil data dari Server
async function loadTasks() {
    const taskContainer = document.getElementById('taskList') || document.getElementById('task-container') || document.getElementById('task-list');
    try {
        const res = await fetch(`/api/tasks?profile=${encodeURIComponent(currentProfile)}`);
        if (!res.ok) throw new Error('Gagal mengambil data');
        tasks = await res.json();
        renderTasks();
    } catch (error) {
        console.error('Gagal memuat tugas:', error);
        if (taskContainer) {
            taskContainer.innerHTML = `<p class="empty-state" style="padding: 20px; text-align: center; color: #64748b;">Gagal terhubung ke server.</p>`;
        }
    }
}

// Render Tugas ke HTML Berdasarkan Filter & Search
function renderTasks() {
    const taskContainer = document.getElementById('taskList') || document.getElementById('task-container') || document.getElementById('task-list');
    if (!taskContainer) return;

    const filteredTasks = tasks.filter(task => {
        const status = task.status || 'todo';
        const matchStatus = currentFilter === 'all' || status === currentFilter;
        const desc = task.description || task.title || task.text || '';
        const matchSearch = desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    taskContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
        taskContainer.innerHTML = `
            <div class="empty-state" style="padding: 30px; text-align: center; color: #64748b;">
                <i class="fa-solid fa-clipboard-check" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Hening di sini... Tidak ada tugas.</p>
            </div>`;
        return;
    }

    filteredTasks.forEach((task, index) => {
        const card = document.createElement('div');
        const status = task.status || 'todo';
        card.className = `task-card ${status}`;
        card.style.animationDelay = `${index * 80}ms`;

        const desc = task.description || task.title || task.text || '';
        const safeDesc = desc.replace(/'/g, "\\'");
        const statusClass = `status-${status}`;
        const statusLabel = status.replace('-', ' ');

        card.innerHTML = `
            <div class="task-content">
                <div class="task-desc">${desc}</div>
                <div class="task-meta">
                    <span>ID: #${task.id}</span>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="updateTaskStatus(${task.id}, 'todo')" title="Set Todo">
                    <i class="fa-regular fa-circle"></i>
                </button>
                <button class="action-btn" onclick="updateTaskStatus(${task.id}, 'in-progress')" title="Set In-Progress">
                    <i class="fa-solid fa-spinner"></i>
                </button>
                <button class="action-btn" onclick="updateTaskStatus(${task.id}, 'done')" title="Set Done">
                    <i class="fa-regular fa-circle-check"></i>
                </button>
                <button class="action-btn" onclick="editTaskDescription(${task.id}, '${safeDesc}')" title="Edit Deskripsi">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})" title="Hapus Tugas">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        taskContainer.appendChild(card);
    });
}

// Update Status Tugas
window.updateTaskStatus = async function(id, newStatus) {
    try {
        await fetch(`/api/tasks/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, profile: currentProfile })
        });
        loadTasks();
    } catch (error) {
        console.error('Gagal mengubah status:', error);
    }
};

// Edit Deskripsi Tugas
window.editTaskDescription = async function(id, oldDescription) {
    const newDescription = prompt("Ubah rencana kamu:", oldDescription);
    if (newDescription && newDescription.trim() !== "" && newDescription.trim() !== oldDescription) {
        try {
            await fetch(`/api/tasks/${id}/description`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newDescription.trim(), profile: currentProfile })
            });
            loadTasks();
        } catch (error) {
            console.error('Gagal mengubah deskripsi:', error);
        }
    }
};

// Hapus Tugas
window.deleteTask = async function(id) {
    if (!confirm('Hapus rencana ini selamanya?')) return;
    try {
        await fetch(`/api/tasks/${id}?profile=${encodeURIComponent(currentProfile)}`, { method: 'DELETE' });
        loadTasks();
    } catch (error) {
        console.error('Gagal menghapus tugas:', error);
    }
};

// Partikel Mengambang
function initParticles(num) {
    const container = document.getElementById('particle-container');
    if (!container) return;
    for (let i = 0; i < num; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 5 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100 + 100}%`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        const duration = Math.random() * 15 + 10;
        particle.style.animation = `floatParticle ${duration}s linear infinite`;
        particle.style.animationDelay = `${Math.random() * -duration}s`;
        container.appendChild(particle);
    }
}