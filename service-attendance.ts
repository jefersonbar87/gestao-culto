import { getSettings } from './utils/settingsHelper';

const settings = getSettings();
let generatedImageUrl: string | null = null;
let serviceType: 'EBD' | 'CULTO À NOITE' | null = null;

interface Person {
  id: string;
  name: string;
  role: string;
  isPresent: boolean;
}

let peopleList: Person[] = [];
const ROLES = ['PASTOR', 'UNGIDO', 'DIÁCONO', 'OBREIRO', 'G.LOUVOR','INSTRUMENTISTA', 'G.INTERCESSÃO', 'PROFESSOR (A)', 'QUINZENAIS'];

// DOM elements
const inputDate = document.getElementById('input-date') as HTMLInputElement;
const dateDisplay = document.getElementById('date-display') as HTMLDivElement;
const btnTypeEBD = document.getElementById('btn-type-ebd') as HTMLButtonElement;
const btnTypeNight = document.getElementById('btn-type-night') as HTMLButtonElement;
const btnAddPerson = document.getElementById('btn-add-person') as HTMLButtonElement;
const peopleListContainer = document.getElementById('people-list') as HTMLDivElement;

const btnGenerateReport = document.getElementById('btn-generate-report') as HTMLButtonElement;
const previewSection = document.getElementById('service-preview-section') as HTMLDivElement;
const previewImage = document.getElementById('service-preview-image') as HTMLImageElement;
const btnShareService = document.getElementById('btn-share-service') as HTMLButtonElement;
const btnDownloadService = document.getElementById('btn-download-service') as HTMLButtonElement;

// Date Handlers
function updateDateDisplay() {
  if (!inputDate.value) return;
  const dateObj = new Date(inputDate.value + 'T00:00:00'); 
  const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
  const dayName = days[dateObj.getDay()];
  const formattedDate = dateObj.toLocaleDateString('pt-BR');
  dateDisplay.innerText = `${dayName} - ${formattedDate}`;
  saveData();
}

function setServiceType(type: 'EBD' | 'CULTO À NOITE') {
  serviceType = type;
  if (type === 'EBD') {
    btnTypeEBD.classList.add('bg-[#8f1919]', 'text-white');
    btnTypeEBD.classList.remove('text-[#8f1919]');
    btnTypeNight.classList.remove('bg-[#8f1919]', 'text-white');
    btnTypeNight.classList.add('text-[#8f1919]');
  } else {
    btnTypeNight.classList.add('bg-[#8f1919]', 'text-white');
    btnTypeNight.classList.remove('text-[#8f1919]');
    btnTypeEBD.classList.remove('bg-[#8f1919]', 'text-white');
    btnTypeEBD.classList.add('text-[#8f1919]');
  }
  saveData();
}

// Storage - Usando uma chave nova para não misturar com o Trombetas
function loadData() {
  const saved = localStorage.getItem('SERVICE_ATTENDANCE_DATA');
  const today = new Date();
  inputDate.value = today.toISOString().split('T')[0];

  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.date) inputDate.value = data.date;
      if (data.serviceType) setServiceType(data.serviceType);
      if (data.people && Array.isArray(data.people)) {
        peopleList = data.people;
      }
    } catch (e) { console.error(e); }
  }
  
  if (!serviceType) setServiceType('CULTO À NOITE');
  updateDateDisplay();
  renderList();
}

function saveData() {
  const data = {
    date: inputDate.value,
    serviceType: serviceType,
    people: peopleList
  };
  localStorage.setItem('SERVICE_ATTENDANCE_DATA', JSON.stringify(data));
  hidePreview();
}

// List Management
function renderList() {
  peopleListContainer.innerHTML = '';
  
  if (peopleList.length === 0) {
    peopleListContainer.innerHTML = '<p class="text-center text-slate-400 text-sm italic py-4">Nenhuma pessoa adicionada. Clique em "Adicionar" acima.</p>';
    return;
  }

  peopleList.forEach(person => {
    const row = document.createElement('div');
    row.className = `flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl border transition-colors ${person.isPresent ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`;
    
    // Checkbox customizado
    const checkDiv = document.createElement('div');
    checkDiv.className = 'flex items-center gap-3 w-full sm:w-auto flex-1';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = person.isPresent;
    checkbox.className = 'w-6 h-6 accent-green-600 rounded cursor-pointer shrink-0';
    checkbox.onchange = (e) => {
      person.isPresent = (e.target as HTMLInputElement).checked;
      saveData();
      renderList(); 
    };

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = person.name;
    nameInput.placeholder = 'Nome do irmão...';
    nameInput.className = 'w-full bg-transparent border-b border-dashed border-slate-300 outline-none uppercase text-sm font-bold text-slate-700 px-1 py-1 focus:border-[#8f1919]';
    nameInput.oninput = (e) => {
      person.name = (e.target as HTMLInputElement).value.toUpperCase();
      saveData();
    };

    checkDiv.appendChild(checkbox);
    checkDiv.appendChild(nameInput);

    // Select Role & Delete
    const actionDiv = document.createElement('div');
    actionDiv.className = 'flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0';

    const roleSelect = document.createElement('select');
    roleSelect.className = 'bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 outline-none p-2 w-full sm:w-36';
    ROLES.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.innerText = r;
      if (person.role === r) opt.selected = true;
      roleSelect.appendChild(opt);
    });
    roleSelect.onchange = (e) => {
      person.role = (e.target as HTMLSelectElement).value;
      saveData();
    };

    const btnDel = document.createElement('button');
    btnDel.innerHTML = '<i class="fas fa-trash-alt"></i>';
    btnDel.className = 'w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shrink-0';
    btnDel.onclick = () => {
      if(confirm('Remover este irmão da lista?')) {
        peopleList = peopleList.filter(p => p.id !== person.id);
        saveData();
        renderList();
      }
    };

    actionDiv.appendChild(roleSelect);
    actionDiv.appendChild(btnDel);

    row.appendChild(checkDiv);
    row.appendChild(actionDiv);
    peopleListContainer.appendChild(row);
  });
}

function addPerson() {
  peopleList.push({
    id: Date.now().toString(),
    name: '',
    role: 'OBREIRO',
    isPresent: true
  });
  renderList();
  saveData();
}

function hidePreview() {
  generatedImageUrl = null;
  if (previewSection) previewSection.classList.add('hidden');
}

// Events
if (inputDate) inputDate.addEventListener('change', updateDateDisplay);
if (btnTypeEBD) btnTypeEBD.addEventListener('click', () => setServiceType('EBD'));
if (btnTypeNight) btnTypeNight.addEventListener('click', () => setServiceType('CULTO À NOITE'));
if (btnAddPerson) btnAddPerson.addEventListener('click', addPerson);

// Helpers para Desenho
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillStyle: string | null, strokeStyle: string | null, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
}

// Gerar Imagem Mágica
async function generateReport() {
  btnGenerateReport.disabled = true;
  btnGenerateReport.innerHTML = '<i class="fas fa-spinner animate-spin"></i> GERANDO...';

  const presentes = peopleList.filter(p => p.isPresent && p.name.trim() !== '');

  const grouped: Record<string, string[]> = {};
  ROLES.forEach(r => grouped[r] = []); 
  presentes.forEach(p => {
    if (grouped[p.role]) grouped[p.role].push(p.name);
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  
  let simulatedY = 320; 
  ROLES.forEach(role => {
    if (grouped[role].length > 0) {
      simulatedY += 60; 
      simulatedY += (grouped[role].length * 35);
      simulatedY += 40; 
    }
  });
  
  const totalPessoas = presentes.length;
  simulatedY += 160; 

  const height = Math.max(1000, simulatedY);
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  drawRoundRect(ctx, 20, 20, width - 40, height - 40, 20, null, '#cbd5e1', 3);

  let cy = 100;

  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 38px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(settings.hymnHeaderText || 'IGREJA CRISTÃ MARANATA', width / 2, cy);

  cy += 45;
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('LISTA DE PRESENÇA', width / 2, cy);

  cy += 40;
  if (serviceType) {
      ctx.fillText(serviceType, width / 2, cy);
  }

  cy += 45;
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 24px Arial';
  const dateText = dateDisplay.innerText.replace('Hoje: ', '').toUpperCase();
  ctx.fillText(dateText, width / 2, cy);

  cy += 60;
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, cy);
  ctx.lineTo(1020, cy);
  ctx.stroke();

  cy += 50;

  if (totalPessoas === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NENHUMA PRESENÇA REGISTRADA NESTE CULTO.', width / 2, cy + 50);
    cy += 150;
  } else {
    ROLES.forEach(role => {
      const nomes = grouped[role];
      if (nomes.length > 0) {
        drawRoundRect(ctx, 80, cy, 920, 45, 8, '#fee2e2', null);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(role + (nomes.length > 1 && !role.endsWith('S') ? 'S' : ''), width / 2, cy + 30);
        
        cy += 70;

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px Arial';
        
        if (nomes.length > 5) {
          ctx.textAlign = 'left';
          for (let i = 0; i < nomes.length; i++) {
            const xPos = i % 2 === 0 ? 120 : 580;
            ctx.fillText(`• ${nomes[i]}`, xPos, cy);
            if (i % 2 !== 0 || i === nomes.length - 1) {
              cy += 35;
            }
          }
        } else {
          ctx.textAlign = 'center';
          nomes.forEach(n => {
            ctx.fillText(n, width / 2, cy);
            cy += 35;
          });
        }
        cy += 20; 
      }
    });
  }

  cy += 30;
  drawRoundRect(ctx, 340, cy, 400, 90, 10, '#fef2f2', '#fca5a5', 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(`TOTAL: ${totalPessoas}`, width / 2, cy + 55);

  const footerLineY = height - 90;
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, footerLineY);
  ctx.lineTo(1020, footerLineY);
  ctx.stroke();

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('SISTEMA DE GESTÃO DO CULTO PROFÉTICO - ICM', width / 2, height - 50);

  generatedImageUrl = canvas.toDataURL('image/png');
  if (previewImage) previewImage.src = generatedImageUrl;
  if (previewSection) {
    previewSection.classList.remove('hidden');
    previewSection.scrollIntoView({ behavior: 'smooth' });
  }

  btnGenerateReport.disabled = false;
  btnGenerateReport.innerHTML = '<i class="fas fa-image"></i> GERAR RELATÓRIO DE PRESENÇA';
}

if (btnGenerateReport) btnGenerateReport.addEventListener('click', generateReport);

if (btnDownloadService) {
  btnDownloadService.addEventListener('click', () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = `lista-presenca.png`;
    link.href = generatedImageUrl;
    link.click();
  });
}

if (btnShareService) {
  btnShareService.addEventListener('click', async () => {
    if (!generatedImageUrl) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const file = new File([blob], "lista-presenca.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Lista de Presença ICM' });
      } else {
        alert("Baixe a imagem para compartilhar no seu dispositivo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao compartilhar.");
    }
  });
}

loadData();
export {};