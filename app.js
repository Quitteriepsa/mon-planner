// Tableau global pour stocker les tâches en mémoire (sauvegardées dans le navigateur)
let tasks = JSON.parse(localStorage.getItem('planner_tasks')) || [];

// Fonction pour basculer entre les onglets
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Ajouter une tâche
function addTask(type) {
    const inputId = type === 'today' ? 'task-input' : 'inbox-input';
    const input = document.getElementById(inputId);
    const text = input.value.trim();

    if (text === '') return;

    const newTask = {
        id: Date.now(),
        text: text,
        type: type, // 'today' ou 'inbox'
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    input.value = '';
}

// Cocher / Décocher une tâche
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAndRender();
    }
}

// Déplacer une tâche de l'Inbox vers Aujourd'hui
function moveToToday(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.type = 'today';
        saveAndRender();
    }
}

// Supprimer une tâche
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

// Sauvegarder dans le stockage local et rafraîchir l'affichage
function saveAndRender() {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
    renderTasks();
}

// Afficher les tâches dans le HTML
function renderTasks() {
    const todayList = document.getElementById('today-list');
    const completedList = document.getElementById('completed-list');
    const inboxList = document.getElementById('inbox-list');

    todayList.innerHTML = '';
    completedList.innerHTML = '';
    inboxList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        if (task.type === 'inbox') {
            li.innerHTML = `
                <span>${task.text}</span>
                <div class="task-actions">
                    <button class="move-btn" onclick="moveToToday(${task.id})">Mettre à aujourd'hui</button>
                    <button onclick="deleteTask(${task.id})">❌</button>
                </div>
            `;
            inboxList.appendChild(li);
        } else {
            li.innerHTML = `
                <label>
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
                    <span>${task.text}</span>
                </label>
                <button onclick="deleteTask(${task.id})">❌</button>
            `;
            if (task.completed) {
                completedList.appendChild(li);
            } else {
                todayList.appendChild(li);
            }
        }
    });
}

// Charger les tâches au démarrage
renderTasks();
