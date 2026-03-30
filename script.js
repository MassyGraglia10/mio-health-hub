// Configurazione Firebase
const firebaseConfig = { 
    apiKey: "AIzaSyAS01EENxcYst32-dxZkSQ6febvYZnBtNc", 
    authDomain: "miomenu-e2e51.firebaseapp.com", 
    databaseURL: "https://miomenu-e2e51-default-rtdb.europe-west1.firebasedatabase.app", 
    projectId: "miomenu-e2e51" 
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const palinsesto = {
    "Lunedì": [{t:"09:00", c:"TONE UP"}, {t:"12:00", c:"POWER & FUNCTIONAL"}, {t:"18:00", c:"S. PUMP"}, {t:"19:00", c:"SPINNING"}],
    "Martedì": [{t:"10:00", c:"TONE UP"}, {t:"13:00", c:"TONE UP"}, {t:"19:00", c:"TRX"}, {t:"20:00", c:"ZUMBA"}],
    "Mercoledì": [{t:"09:00", c:"POSTURALE"}, {t:"13:00", c:"TOTAL BODY"}, {t:"18:00", c:"G.A.G"}, {t:"20:00", c:"PUMP"}],
    "Giovedì": [{t:"10:00", c:"PILATES"}, {t:"13:00", c:"POWER YOGA"}, {t:"18:00", c:"G.A.G"}, {t:"19:00", c:"SPINNING"}],
    "Venerdì": [{t:"09:00", c:"G.A.G"}, {t:"12:00", c:"TOTAL BODY"}, {t:"18:00", c:"FIT DANCE"}, {t:"19:00", c:"TONE UP"}],
    "Sabato": [{t:"09:00", c:"YOGA"}, {t:"11:00", c:"MOBILITY"}, {t:"12:00", c:"FIT DANCE"}],
    "Domenica": [{t:"10:00", c:"SALA PESI LIBERA"}]
};

let dataInizio = new Date();
dataInizio.setDate(dataInizio.getDate() - (dataInizio.getDay() === 0 ? 6 : dataInizio.getDay() - 1));
let curKey = "";

function renderCalendar() {
    const grid = document.getElementById('grid'); grid.innerHTML = "";
    for(let i=0; i<7; i++){
        let d = new Date(dataInizio); d.setDate(dataInizio.getDate()+i);
        let k = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        let dot = document.createElement('div');
        dot.className = `day-dot ${d.toDateString()==new Date().toDateString()?'today':''}`;
        dot.onclick = () => apriDettaglio(new Date(d));
        dot.innerHTML = `<div style="font-size:0.6rem; color:#888;">${d.toLocaleDateString('it-IT',{weekday:'short'}).toUpperCase()}</div><b style="font-size:1.2rem;">${d.getDate()}</b>`;
        grid.appendChild(dot);
    }
    document.getElementById('week-label').innerText = dataInizio.toLocaleDateString('it-IT',{day:'numeric',month:'short'}) + " - " + new Date(new Date(dataInizio).setDate(dataInizio.getDate()+6)).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
}

function apriDettaglio(data) {
    curKey = `${data.getFullYear()}-${data.getMonth()+1}-${data.getDate()}`;
    let gL = data.toLocaleDateString('it-IT', {weekday:'long'}); gL = gL.charAt(0).toUpperCase() + gL.slice(1);
    document.getElementById('modal-title').innerText = gL + " " + data.getDate();
    document.getElementById('modal').style.display = 'flex';
    
    db.ref("dailyData/" + curKey).once('value', snap => {
        const v = snap.val() || {};
        document.getElementById('check-pesi-m').checked = v['check-pesi-m'] || false;
        document.getElementById('check-pesi-l').checked = v['check-pesi-l'] || false;
        
        const buildList = (u) => (palinsesto[gL] || []).map(c => {
            const uid = `chk-${u}-${c.t.replace(':','')}-${c.c.substring(0,5).toLowerCase()}`;
            return `<div class="gym-row"><input type="checkbox" ${v[uid]?'checked':''} onchange="salvaCheck(this,'${uid}')"> <b style="margin:0 10px;">${c.t}</b> ${c.c}</div>`;
        }).join("");
        
        document.getElementById('gym-list-m').innerHTML = "<b>MASSIMO:</b>" + buildList('m');
        document.getElementById('gym-list-l').innerHTML = "<b>LILIANA:</b>" + buildList('l');
    });
}

function salvaCheck(el, id) { 
    document.getElementById('sync-status').innerText = "☁️...";
    db.ref("dailyData/" + curKey + "/" + (id||el.id)).set(el.checked).then(() => {
        document.getElementById('sync-status').innerText = "✅ SINCRO";
    });
}

function chiudi() { document.getElementById('modal').style.display = 'none'; }
function cambiaSett(n) { dataInizio.setDate(dataInizio.getDate()+n); renderCalendar(); }
function apriScheda(u) { 
    document.getElementById('view-src').src = (u === 'm' ? "Schedamassimo.jpg" : "schedaLiliana.jpg"); 
    document.getElementById('img-viewer').style.display = 'flex'; 
}

window.onload = renderCalendar;
function openTab(e, id) {
    // Nascondi tutti i contenuti
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    // Rimuovi stato attivo dai bottoni
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // Mostra quello selezionato
    document.getElementById(id).classList.add('active');
    e.currentTarget.classList.add('active');
}

// Modifica la funzione chiudi per resettare sulla prima tab quando riapri
function chiudi() {
    document.getElementById('modal').style.display = 'none';
    // Opzionale: riporta alla tab Gym per la prossima apertura
    const firstTab = document.querySelector('.tab-btn');
    if(firstTab) firstTab.click(); 
}
