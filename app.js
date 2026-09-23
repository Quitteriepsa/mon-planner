let tasks = JSON.parse(localStorage.getItem('planner_tasks')) || [];
let currentCalendarView = 'month';

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'calendar') {
        renderCalendar();
    }
}

function addTask(type) {
    const inputId = type === 'today' ? 'task-input' : 'inbox-input';
    const input = document.getElementById(inputId);
    const text = input.value.trim();

    if (text === '') return;

    const newTask = {
        id: Date.now(),
        text: text,
        type: type,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    input.value = '';
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAndRender();
    }
}

function moveToToday(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.type = 'today';
        saveAndRender();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const todayList = document.getElementById('today-list');
    const completedList = document.getElementById('completed-list');
    const inboxList = document.getElementById('inbox-list');

    if (!todayList) return;

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
                    <button class="move-btn" onclick="moveToToday(${task.id})">Aujourd'hui</button>
                    <button onclick="deleteTask(${task.id})">❌</button>
                </div>
            `;
            inboxList.appendChild(li);
        } else if (task.type === 'today') {
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

function changeView(view) {
    currentCalendarView = view;
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendar-view-container');
    if (!container) return;
    container.innerHTML = '';

    if (currentCalendarView === 'month') {
        let html = '<div class="calendar-grid">';
        for (let i = 1; i <= 30; i++) {
            html += `
                <div class="calendar-day-cell">
                    <h4>Jour ${i}</h4>
                    <button onclick="addTaskOnDate(${i})">+ Tâche</button>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    } else if (currentCalendarView === 'week') {
        container.innerHTML = '<h3>Vue Semaine</h3><p>Fonctionnalité en cours de développement.</p>';
    } else {
        container.innerHTML = '<h3>Vue Jour</h3><p>Fonctionnalité en cours de développement.</p>';
    }
}

function addTaskOnDate(dayNumber) {
    const taskText = prompt(`Ajouter une tâche pour le jour ${dayNumber} :`);
    if (taskText) {
        tasks.push({
            id: Date.now(),
            text: `[Jour ${dayNumber}] ${taskText}`,
            type: 'today',
            completed: false
        });
        saveAndRender();
        alert('Tâche ajoutée à votre liste du jour !');
    }
}

renderTasks();
