interface PrayerSlot {
  time: string;
  name: string;
}

let schedule: PrayerSlot[] = [];
let searchQuery = '';

// DOM elements
const inputSearch = document.getElementById('search-slots') as HTMLInputElement;
const btnExport = document.getElementById('btn-export-schedule') as HTMLButtonElement;
const btnClear = document.getElementById('btn-clear-schedule') as HTMLButtonElement;
const tbody = document.getElementById('slots-tbody') as HTMLTableSectionElement;

// Initialize 24-hour default list
const DEFAULT_SLOTS = Array(24).fill(null).map((_, i) => {
  const startStr = i.toString().padStart(2, '0') + ':00';
  const endStr = ((i + 1) % 24).toString().padStart(2, '0') + ':00';
  return {
    time: `${startStr} - ${endStr}`,
    name: ''
  };
});

function loadSchedule() {
  const saved = localStorage.getItem('PRAYER_SCHEDULE');
  if (saved) {
    try {
      schedule = JSON.parse(saved);
      // Ensure all 24 slots exist
      if (schedule.length !== 24) {
        schedule = DEFAULT_SLOTS.map((slot, i) => schedule[i] || slot);
      }
    } catch (e) {
      schedule = [...DEFAULT_SLOTS];
    }
  } else {
    schedule = [...DEFAULT_SLOTS];
  }
  renderTable();
}

function saveSchedule() {
  localStorage.setItem('PRAYER_SCHEDULE', JSON.stringify(schedule));
}

function renderTable() {
  if (!tbody) return;
  tbody.innerHTML = '';

  const query = searchQuery.trim().toLowerCase();

  schedule.forEach((slot, idx) => {
    // Check if the current slot is highlighted by search
    const isMatched = query && slot.name.toLowerCase().includes(query);

    const row = document.createElement('tr');
    row.className = isMatched ? 'bg-yellow-50/70 border-l-4 border-yellow-500' : 'hover:bg-slate-50';

    row.innerHTML = `
      <td class="p-3.5 font-bold text-slate-500 font-mono text-xs select-none">${slot.time}</td>
      <td class="p-2">
        <input 
          type="text" 
          value="${slot.name}" 
          class="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-red-500 focus:bg-slate-50/50 p-2 outline-none uppercase font-semibold text-slate-700 text-sm"
          placeholder="Toque para escalar..."
          data-index="${idx}"
        />
      </td>
    `;

    tbody.appendChild(row);
  });

  // Attach event listeners to input elements
  const inputs = tbody.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt((e.target as HTMLInputElement).getAttribute('data-index') || '0');
      schedule[idx].name = (e.target as HTMLInputElement).value.toUpperCase();
      saveSchedule();
    });
  });
}

// Search filter binding
if (inputSearch) {
  inputSearch.addEventListener('input', () => {
    searchQuery = inputSearch.value;
    renderTable();
  });
}

// Clear table
if (btnClear) {
  btnClear.addEventListener('click', () => {
    if (confirm("Limpar toda a escala de oração?")) {
      schedule = DEFAULT_SLOTS.map(slot => ({ ...slot, name: '' }));
      saveSchedule();
      renderTable();
    }
  });
}

// Export schedule
if (btnExport) {
  btnExport.addEventListener('click', () => {
    const activeSlots = schedule.filter(s => s.name.trim() !== '');
    if (activeSlots.length === 0) {
      alert("A escala está vazia!");
      return;
    }

    const today = new Date();
    let text = `========================================\n`;
    text += `ESCALA DE ORAÇÃO ININTERRUPTA - ICM\n`;
    text += `DATA DE EMISSÃO: ${today.toLocaleDateString('pt-BR')}\n`;
    text += `========================================\n\n`;

    schedule.forEach(slot => {
      text += `${slot.time} - ${slot.name.trim() || '[ VAGO / EM ORAÇÃO GLOBAL ]'}\n`;
    });

    text += `\n========================================\n`;
    text += `SISTEMA DE GESTÃO DO CULTO PROFÉTICO - ICM\n`;
    text += `========================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `escala-oracao.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  });
}

// Boot
loadSchedule();
export {};
