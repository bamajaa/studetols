const fs = require('fs');
const path = require('path');

class Task {
  constructor(id, description, status = 'todo', createdAt = new Date().toISOString(), updatedAt = new Date().toISOString()) {
    this.id = id;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

class TaskManager {
  constructor(profileName = 'default') {
    // Bersihkan nama profil dari karakter aneh agar aman dijadikan nama file
    const safeProfile = profileName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    this.filePath = path.join(__dirname, `../../data/tasks_${safeProfile}.json`);
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  loadTasks() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const rawTasks = JSON.parse(data || '[]');
      return rawTasks.map(t => new Task(t.id, t.description, t.status, t.createdAt, t.updatedAt));
    } catch (error) {
      console.error('Error saat membaca data:', error.message);
      return [];
    }
  }

  getTasks() {
    return this.loadTasks();
  }

  saveTasks(tasks) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(tasks, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saat menyimpan data:', error.message);
    }
  }

  add(description) {
    if (!description || description.trim() === '') return;
    const tasks = this.loadTasks();
    const newId = tasks.length > 0 ? tasks.reduce((max, t) => (t.id > max ? t.id : max), 0) + 1 : 1;
    const newTask = new Task(newId, description);
    tasks.push(newTask);
    this.saveTasks(tasks);
  }

  update(id, newDescription) {
    if (!id || isNaN(id) || !newDescription) return;
    const tasks = this.loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === Number(id));
    if (taskIndex === -1) return;
    tasks[taskIndex].description = newDescription;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    this.saveTasks(tasks);
  }

  delete(id) {
    if (!id || isNaN(id)) return;
    const tasks = this.loadTasks();
    const filteredTasks = tasks.filter(t => t.id !== Number(id));
    if (tasks.length === filteredTasks.length) return;
    this.saveTasks(filteredTasks);
  }

  setStatus(id, status) {
    if (!id || isNaN(id)) return;
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === Number(id));
    if (!task) return;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    this.saveTasks(tasks);
  }
}

module.exports = TaskManager;