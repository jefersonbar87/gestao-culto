interface Guest {
  id: string;
  name: string;
  type: 'Adulto' | 'Criança';
  invitedBy: string;
  confirmed: boolean;
}

let guests: Guest[] = [];
let currentFilter: 'all' | 'adult' | 'child' | 'confirmed' | 'pending' = 'all';

// DOM elements
const form = document.getElementById('form-guest') as HTMLFormElement;
const inputName = document.getElementById('guest-name') as HTMLInputElement;
const inputInvitedBy = document.getElementById('guest-invited-by') as HTMLInputElement;
const radioAdult = document.getElementById('type-adult') as HTMLInputElement;
const radioChild = document.getElementById('type-child') as HTMLInputElement;

const statTotal = document.getElementById('stat-total') as HTMLSpanElement;
const statAdults = document.getElementById('stat-adults') as HTMLSpanElement;
const statKids = document.getElementById('stat-kids') as HTMLSpanElement;
const statConfirmed = document.getElementById('stat-confirmed') as HTMLSpanElement;

const filterAll = document.getElementById('filter-all') as HTMLButtonElement;
const filterAdult = document.getElementById('filter-adult') as HTMLButtonElement;
const filterChild = document.getElementById('filter-child') as HTMLButtonElement;
const filterConfirmed = document.getElementById('filter-confirmed') as HTMLButtonElement;
const filterPending = document.getElementById('filter-pending') as HTMLButtonElement;

const btnExportTxt = document.getElementById('btn-export-txt') as HTMLButtonElement;
const btnClearGuests = document.getElementById('btn-clear-guests') as HTMLButtonElement;
const tbody = document.getElementById('guests-tbody') as HTMLTableSectionElement;

const filterButtons = [
  { btn: filterAll, val: 'all' as const },
  { btn: filterAdult, val: 'adult' as const },
  { btn: filterChild, val: 'child' as const },
  { btn: filterConfirmed, val: 'confirmed' as const },
  { btn: filterPending, val: 'pending' as const }
];

// Load and Save helpers
function loadGuests() {
  const saved = localStorage.getItem('GUEST_LIST');
  if (saved) {
    try {
      guests = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  updateUI();
}

function saveGuests() {
  localStorage.setItem('GUEST_LIST', JSON.stringify(guests));
  updateUI();
}

function updateUI() {
  updateStats();
  renderTable();
}

function updateStats() {
  const total = guests.length;
  const adults = guests.filter(g => g.type === 'Adulto').length;
  const kids = guests.filter(g => g.type === 'Criança').length;
  const confirmed = guests.filter(g => g.confirmed).length;

  if (statTotal) statTotal.innerText = total.toString();
  if (statAdults) statAdults.innerText = adults.toString();
  if (statKids) statKids.innerText = kids.toString();
  if (statConfirmed) statConfirmed.innerText = confirmed.toString();
}

function renderTable() {
  if (!tbody) return;
  tbody.innerHTML = '';

  let filtered = guests;
  if (currentFilter === 'adult') {
    filtered = guests.filter(g => g.type === 'Adulto');
  } else if (currentFilter === 'child') {
    filtered = guests.filter(g => g.type === 'Criança');
  } else if (currentFilter === 'confirmed') {
    filtered = guests.filter(g => g.confirmed);
  } else if (currentFilter === 'pending') {
    filtered = guests.filter(g => !g.confirmed);
  }

  if (filtered.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4" class="p-8 text-center text-slate-400 italic font-medium">Nenhum convidado nesta categoria.</td>`;
    tbody.appendChild(row);
    return;
  }

  filtered.forEach(g => {
    const row = document.createElement('tr');
    row.className = g.confirmed ? 'bg-red-50/20' : 'hover:bg-slate-50';

    row.innerHTML = `
      <td class="p-3 font-bold text-slate-700 uppercase">${g.name}</td>
      <td class="p-3 text-slate-500 text-xs">
        <span class="px-2 py-0.5 rounded-full font-bold ${g.type === 'Adulto' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}">${g.type}</span>
      </td>
      <td class="p-3 text-slate-500 uppercase text-xs">${g.invitedBy}</td>
      <td class="p-3 text-center flex items-center justify-center gap-3">
        <button class="btn-toggle-presence w-8 h-8 rounded-full flex items-center justify-center border transition-all ${g.confirmed ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'}" data-id="${g.id}">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn-delete-guest w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50" data-id="${g.id}">
          <i class="far fa-trash-alt"></i>
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Attach action event listeners
  const btnToggles = tbody.querySelectorAll('.btn-toggle-presence');
  btnToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
      if (id) toggleGuestPresence(id);
    });
  });

  const btnDeletes = tbody.querySelectorAll('.btn-delete-guest');
  btnDeletes.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
      if (id) deleteGuest(id);
    });
  });
}

function toggleGuestPresence(id: string) {
  guests = guests.map(g => g.id === id ? { ...g, confirmed: !g.confirmed } : g);
  saveGuests();
}

function deleteGuest(id: string) {
  if (confirm("Excluir convidado?")) {
    guests = guests.filter(g => g.id !== id);
    saveGuests();
  }
}

// Add guest submit
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputName.value.trim().toUpperCase();
    const invitedBy = inputInvitedBy.value.trim().toUpperCase();
    const type = radioChild.checked ? 'Criança' : 'Adulto';

    if (!name || !invitedBy) return;

    const newGuest: Guest = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      invitedBy,
      type,
      confirmed: false
    };

    guests.push(newGuest);
    saveGuests();

    inputName.value = '';
    inputInvitedBy.value = '';
    radioAdult.checked = true;
  });
}

// Set active filter button styling
function applyFilter(filter: typeof currentFilter) {
  currentFilter = filter;
  filterButtons.forEach(({ btn, val }) => {
    if (!btn) return;
    if (val === filter) {
      btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-red-50 text-red-700 border border-red-100";
    } else {
      btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-slate-50 text-slate-500 hover:bg-slate-100";
    }
  });
  renderTable();
}

filterButtons.forEach(({ btn, val }) => {
  if (btn) {
    btn.addEventListener('click', () => applyFilter(val));
  }
});

// Clear list
if (btnClearGuests) {
  btnClearGuests.addEventListener('click', () => {
    if (confirm("Limpar toda a lista de convidados?")) {
      guests = [];
      saveGuests();
    }
  });
}

// Export TXT
if (btnExportTxt) {
  btnExportTxt.addEventListener('click', () => {
    if (guests.length === 0) {
      alert("A lista está vazia!");
      return;
    }

    const today = new Date();
    let text = `========================================\n`;
    text += `LISTA DE CONVIDADOS - CULTO DE TROMBETAS\n`;
    text += `DATA DE EMISSÃO: ${today.toLocaleDateString('pt-BR')}\n`;
    text += `========================================\n\n`;

    const total = guests.length;
    const confirmed = guests.filter(g => g.confirmed).length;
    const pending = total - confirmed;

    text += `RESUMO GERAL:\n`;
    text += `- TOTAL DE CONVIDADOS: ${total}\n`;
    text += `- CONFIRMADOS: ${confirmed}\n`;
    text += `- PENDENTES: ${pending}\n\n`;

    text += `----------------------------------------\n`;
    text += `LISTAGEM GERAL DE CONVIDADOS:\n`;
    text += `----------------------------------------\n`;

    guests.forEach((g, i) => {
      text += `${i + 1}. [${g.confirmed ? 'CONFIRMADO' : 'PENDENTE'}] ${g.name} (${g.type.toUpperCase()}) - CONVIDADO POR: ${g.invitedBy}\n`;
    });

    text += `\n========================================\n`;
    text += `SISTEMA DE GESTÃO DO CULTO PROFÉTICO - ICM\n`;
    text += `========================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `convidados-trombetas.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  });
}

// Boot
loadGuests();
export {};
