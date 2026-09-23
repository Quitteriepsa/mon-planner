let tasks = JSON.parse(localStorage.getItem('planner_tasks')) || [];
let notes = JSON.parse(localStorage.getItem('planner_notes')) || [];
let reviews = JSON.parse(localStorage.getItem('planner_reviews')) || [];
let currentCalendarView = 'month';

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'calendar') {
        renderCalendar();
    } else if (tabId === 'notes') {
        renderNotes();
    } else if (tabId === 'reviews') {
        renderReviews();
    }
}

// Gestion des tâches
function addTask(type) {
    const inputId = type === 'today' ? 'task-input' : 'inbox-input';
    const input = document.getElementById(inputId);
    const text = input.value.trim();

    if (text === '') return;

    tasks.push({
        id: Date.now(),
        text: text,
        type: type,
        completed: false
    });

    saveAndRenderTasks();
    input.value = '';
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAndRenderTasks();
    }
}

function moveToToday(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.type = 'today';
        saveAndRenderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRenderTasks();
}

function saveAndRenderTasks() {
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

// Révisions espacées (J0, J1, J3, J7, J14, J30)
function addSpacedReview() {
    const input = document.getElementById('review-input');
    const name = input.value.trim();
    if (name === '') return;

    const intervals = [0, 1, 3, 7, 14, 30];
    intervals.forEach(day => {
        reviews.push({
            id: Date.now() + Math.random(),
            text: `${name} (J${day})`,
            completed: false
        });
    });

    localStorage.setItem('planner_reviews', JSON.stringify(reviews));
    renderReviews();
    input.value = '';
    alert('Séquence de révisions espacées générée avec succès !');
}

function toggleReview(id) {
    const rev = reviews.find(r => r.id === id);
    if (rev) {
        rev.completed = !rev.completed;
        localStorage.setItem('planner_reviews', JSON.stringify(reviews));
        renderReviews();
    }
}

function deleteReview(id) {
    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem('planner_reviews', JSON.stringify(reviews));
    renderReviews();
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';
    reviews.forEach(rev => {
        const li = document.createElement('li');
        li.className = `task-item ${rev.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <label>
                <input type="checkbox" ${rev.completed ? 'checked' : ''} onclick="toggleReview(${rev.id})">
                <span>📚 ${rev.text}</span>
            </label>
            <button onclick="deleteReview(${rev.id})">❌</button>
        `;
        list.appendChild(li);
    });
}

// Notes libres
function addNote() {
    const input = document.getElementById('note-input');
    const text = input.value.trim();
    if (text === '') return;

    notes.push({ id: Date.now(), text: text });
    localStorage.setItem('planner_notes', JSON.stringify(notes));
    renderNotes();
    input.value = '';
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('planner_notes', JSON.stringify(notes));
    renderNotes();
}

function renderNotes() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;

    notesList.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span>📝 ${note.text}</span>
            <button onclick="deleteNote(${note.id})">❌</button>
        `;
        notesList.appendChild(li);
    });
}

// Calendrier
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
        saveAndRenderTasks();
        alert('Tâche ajoutée à votre liste du jour !');
    }
}

renderTasks();
