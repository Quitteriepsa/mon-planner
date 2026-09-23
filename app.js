let taches = JSON.parse(localStorage.getItem('study_taches')) || [];
let notes = JSON.parse(localStorage.getItem('study_notes')) || [];
let dateActuelle = new Date();
let dateSelectionneeStr = formaterDateCle(new Date());

// Chronomètre variables
let chronoInterval = null;
let tempsRestant = 25 * 60; // 25 minutes par défaut
let chronoActif = false;

document.addEventListener('DOMContentLoaded', () => {
    const themeEnregistre = localStorage.getItem('study_theme') || 'pink';
    const primaireEnregistree = localStorage.getItem('study_primaire') || '#ff2d55';
    const hoverEnregistre = localStorage.getItem('study_hover') || '#c41c3e';

    changerTheme(themeEnregistre, false);
    changerCouleurPrincipale(primaireEnregistree, hoverEnregistre, false);

    mettreAJourEn-têteDate();
    rendreTaches();
    rendreCalendrier();
    rendreNotes();
    mettreAJourAffichageChrono();
});

function changerOnglet(ongletId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(ongletId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (ongletId === 'calendrier') {
        rendreCalendrier();
    }
}

function mettreAJourEn-têteDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('fr-FR', options);
    const element = document.getElementById('date-du-jour-str');
    if (element) element.textContent = dateStr;
}

// Gestion des tâches et de la méthode des jours
function ajouterTache(type) {
    const inputId = type === 'aujourdhui' ? 'tache-aujourdhui-input' : (type === 'inbox' ? 'tache-inbox-input' : 'tache-elearning-input');
    const input = document.getElementById(inputId);
    const texte = input.value.trim();

    if (texte === '') return;

    // Détection automatique du mot "Apprendre" pour proposer la méthode des jours
    if (texte.toLowerCase().includes('apprendre') && confirm(`Voulez-vous activer la méthode des jours (révisions espacées J0, J1, J3, J7, J14, J30) pour "${texte}" ?`)) {
        creerSequenceRevisionSpaciees(texte);
    }

    taches.push({
        id: Date.now(),
        texte: texte,
        type: type,
        date: type === 'aujourdhui' ? formaterDateCle(new Date()) : null,
        terminee: false
    });

    sauvegarderEtRendre();
    input.value = '';
}

function basculerTache(id) {
    const tache = taches.find(t => t.id === id);
    if (tache) {
        tache.terminee = !tache.terminee;
        sauvegarderEtRendre();
    }
}

function supprimerTache(id) {
    taches = taches.filter(t => t.id !== id);
    sauvegarderEtRendre();
}

function sauvegarderEtRendre() {
    localStorage.setItem('study_taches', JSON.stringify(taches));
    rendreTaches();
    if (document.getElementById('calendrier').classList.contains('active')) {
        rendreCalendrier();
        rendreTachesJourSelectionne();
    }
}

function rendreTaches() {
    const listeAujourdhui = document.getElementById('liste-aujourdhui');
    const listeTerminees = document.getElementById('liste-terminees');
    const listeInbox = document.getElementById('liste-inbox');
    const listeElearning = document.getElementById('liste-elearning');

    if (!listeAujourdhui) return;

    listeAujourdhui.innerHTML = '';
    listeTerminees.innerHTML = '';
    listeInbox.innerHTML = '';
    listeElearning.innerHTML = '';

    const cleAujourdhui = formaterDateCle(new Date());

    taches.forEach(tache => {
        const li = document.createElement('li');
        li.className = `task-item ${tache.terminee ? 'completed' : ''}`;

        li.innerHTML = `
            <label>
                <input type="checkbox" ${tache.terminee ? 'checked' : ''} onclick="basculerTache(${tache.id})">
                <span>${tache.texte}</span>
            </label>
            <button class="delete-btn" onclick="supprimerTache(${tache.id})">🗑️</button>
        `;

        if (tache.type === 'inbox') {
            listeInbox.appendChild(li);
        } else if (tache.type === 'elearning') {
            listeElearning.appendChild(li);
        } else if (tache.type === 'aujourdhui' || tache.date === cleAujourdhui) {
            if (tache.terminee) {
                listeTerminees.appendChild(li);
            } else {
                listeAujourdhui.appendChild(li);
            }
        }
    });
}

// Méthode des jours (révisions espacées)
function creerSequenceRevisionSpaciees(nomCours) {
    const intervalles = [0, 1, 3, 7, 14, 30];
    const dateBase = new Date();

    intervalles.forEach(decalage => {
        const dateCible = new Date();
        dateCible.setDate(dateBase.getDate() + decalage);
        const cleDate = formaterDateCle(dateCible);

        taches.push({
            id: Date.now() + Math.random(),
            texte: `[Révision J${decalage}] ${nomCours}`,
            type: 'aujourdhui',
            date: cleDate,
            terminee: false
        });
    });
    alert('Planning de révisions espacées généré avec succès dans votre calendrier !');
}

// Calendrier interactif
function rendreCalendrier() {
    const grille = document.getElementById('calendrier-grille');
    const elementMoisAnnee = document.getElementById('calendrier-mois-annee');
    if (!grille) return;

    grille.innerHTML = '';
    const annee = dateActuelle.getFullYear();
    const mois = dateActuelle.getMonth();

    const nomsMois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    elementMoisAnnee.textContent = `${nomsMois[mois]} ${annee}`;

    const premierJourIndex = (new Date(annee, mois, 1).getDay() + 6) % 7;
    const totalJours = new Date(annee, mois + 1, 0).getDate();
    const cleAujourdhui = formaterDateCle(new Date());

    for (let i = 0; i < premierJourIndex; i++) {
        const celluleVide = document.createElement('div');
        grille.appendChild(celluleVide);
    }

    for (let jour = 1; jour <= totalJours; jour++) {
        const objetDate = new Date(annee, mois, jour);
        const cleDate = formaterDateCle(objetDate);
        const cellule = document.createElement('div');
        cellule.className = 'calendar-day';
        cellule.textContent = jour;

        if (cleDate === cleAujourdhui) cellule.classList.add('today');
        if (cleDate === dateSelectionneeStr) cellule.classList.add('selected');

        const possedeTaches = taches.some(t => t.date === cleDate);
        if (possedeTaches) cellule.classList.add('has-tasks');

        cellule.onclick = () => {
            dateSelectionneeStr = cleDate;
            rendreCalendrier();
            rendreTachesJourSelectionne();
        };

        grille.appendChild(cellule);
    }
    rendreTachesJourSelectionne();
}

function changerMois(direction) {
    dateActuelle.setMonth(dateActuelle.getMonth() + direction);
    rendreCalendrier();
}

function formaterDateCle(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function rendreTachesJourSelectionne() {
    const titreElement = document.getElementById('titre-jour-selectionne');
    const listeElement = document.getElementById('liste-taches-calendrier');
    if (!titreElement || !listeElement) return;

    titreElement.textContent = `Tâches pour le ${dateSelectionneeStr.split('-').reverse().join('/')}`;
    listeElement.innerHTML = '';

    const tachesJour = taches.filter(t => t.date === dateSelectionneeStr);
    tachesJour.forEach(tache => {
        const li = document.createElement('li');
        li.className = `task-item ${tache.terminee ? 'completed' : ''}`;
        li.innerHTML = `
            <label>
                <input type="checkbox" ${tache.terminee ? 'checked' : ''} onclick="basculerTache(${tache.id})">
                <span>${tache.texte}</span>
            </label>
            <button class="delete-btn" onclick="supprimerTache(${tache.id})">🗑️</button>
        `;
        listeElement.appendChild(li);
    });
}

function ajouterTacheDateSelectionnee() {
    const input = document.getElementById('tache-calendrier-input');
    const texte = input.value.trim();
    if (!texte) return;

    if (texte.toLowerCase().includes('apprendre') && confirm(`Voulez-vous activer la méthode des jours pour "${texte}" ?`)) {
        creerSequenceRevisionSpaciees(texte);
    }

    taches.push({
        id: Date.now(),
        texte: texte,
        type: 'calendrier',
        date: dateSelectionneeStr,
        terminee: false
    });

    sauvegarderEtRendre();
    input.value = '';
}

// Notes libres
function ajouterNote() {
    const titreInput = document.getElementById('note-titre-input');
    const contenuInput = document.getElementById('note-contenu-input');
    const titre = titreInput.value.trim();
    const contenu = contenuInput.value.trim();

    if (!contenu) return;

    notes.push({ id: Date.now(), titre: titre || 'Note sans titre', contenu: contenu });
    localStorage.setItem('study_notes', JSON.stringify(notes));
    rendreNotes();
    titreInput.value = '';
    contenuInput.value = '';
}

function supprimerNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('study_notes', JSON.stringify(notes));
    rendreNotes();
}

function rendreNotes() {
    const listeNotes = document.getElementById('liste-notes');
    if (!listeNotes) return;
    listeNotes.innerHTML = '';

    notes.forEach(note => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginTop = '10px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h4 style="font-size:15px; font-weight:600;">${note.titre}</h4>
                <button class="delete-btn" onclick="supprimerNote(${note.id})">🗑️</button>
            </div>
            <p style="font-size:14px; color:var(--text-secondary); white-space:pre-wrap;">${note.contenu}</p>
        `;
        listeNotes.appendChild(div);
    });
}

// Chronomètre & Minuterie
function mettreAJourAffichageChrono() {
    const minutes = Math.floor(tempsRestant / 60);
    const secondes = tempsRestant % 60;
    const affichage = document.getElementById('affichage-chrono');
    if (affichage) {
        affichage.textContent = `${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`;
    }
}

function demarrerChrono() {
    if (chronoActif) return;
    chronoActif = true;
    chronoInterval = setInterval(() => {
        if (tempsRestant > 0) {
            tempsRestant--;
            mettreAJourAffichageChrono();
        } else {
            clearInterval(chronoInterval);
            chronoActif = false;
            alert('Temps écoulé ! Excellent travail.');
        }
    }, 1000);
}

function mettreEnPauseChrono() {
    clearInterval(chronoInterval);
    chronoActif = false;
}

function reinitialiserChrono() {
    clearInterval(chronoInterval);
    chronoActif = false;
    tempsRestant = 25 * 60;
    mettreAJourAffichageChrono();
}

function definirMinuterie(minutes) {
    clearInterval(chronoInterval);
    chronoActif = false;
    tempsRestant = minutes * 60;
    mettreAJourAffichageChrono();
}

// Personnalisation
function changerTheme(theme, sauvegarder = true) {
    document.body.setAttribute('data-theme', theme);
    if (sauvegarder) localStorage.setItem('study_theme', theme);
}

function changerCouleurPrincipale(couleur, couleurHover, sauvegarder = true) {
    document.documentElement.style.setProperty('--primary-color', couleur);
    document.documentElement.style.setProperty('--primary-hover', couleurHover);
    if (sauvegarder) {
        localStorage.setItem('study_primaire', couleur);
        localStorage.setItem('study_hover', couleurHover);
    }
}
