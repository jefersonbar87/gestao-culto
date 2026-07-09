interface EventInfo {
  date: string;
  time: string;
  inviter: string;
}

interface Guest {
  id: string;
  name: string;
  phone: string;
}

let guests: Guest[] = [];
let eventInfo: EventInfo = { date: '', time: '', inviter: '' };

// DOM elements - Formulário do Evento
const inputDate = document.getElementById('event-date') as HTMLInputElement;
const inputTime = document.getElementById('event-time') as HTMLInputElement;
const inputInviter = document.getElementById('event-inviter') as HTMLInputElement;

// DOM elements - Formulário do Convidado
const form = document.getElementById('form-guest') as HTMLFormElement;
const inputName = document.getElementById('guest-name') as HTMLInputElement;
const inputPhone = document.getElementById('guest-phone') as HTMLInputElement;

// DOM elements - Lista e Ações
const guestsListTbody = document.getElementById('guests-list') as HTMLTableSectionElement;
const guestCount = document.getElementById('guest-count') as HTMLSpanElement;
const btnClearGuests = document.getElementById('btn-clear-guests') as HTMLButtonElement;

// DOM elements - Geração de Imagem
const btnGenerateImage = document.getElementById('btn-generate-image') as HTMLButtonElement;
const previewSection = document.getElementById('image-preview-section') as HTMLDivElement;
const generatedImage = document.getElementById('generated-image') as HTMLImageElement;
const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
const btnWhatsapp = document.getElementById('btn-whatsapp') as HTMLButtonElement;
const btnClosePreview = document.getElementById('btn-close-preview') as HTMLButtonElement;

let currentImageUrl: string | null = null;

// Máscara de telefone segura para o TypeScript
inputPhone?.addEventListener('input', function(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target) return;
  
  let x = target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
  if (x) {
    target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  }
});

// Load and Save helpers
function loadData() {
  const savedGuests = localStorage.getItem('TROMBETAS_GUESTS');
  const savedEvent = localStorage.getItem('TROMBETAS_EVENT');
  
  if (savedGuests) {
    try { guests = JSON.parse(savedGuests); } catch (e) { console.error(e); }
  }
  if (savedEvent) {
    try { 
      eventInfo = JSON.parse(savedEvent); 
      if(inputDate) inputDate.value = eventInfo.date || '';
      if(inputTime) inputTime.value = eventInfo.time || '';
      if(inputInviter) inputInviter.value = eventInfo.inviter || '';
    } catch (e) { console.error(e); }
  }
  
  updateUI();
}

function saveData() {
  eventInfo = {
    date: inputDate ? inputDate.value : '',
    time: inputTime ? inputTime.value : '',
    inviter: inputInviter ? inputInviter.value.toUpperCase() : ''
  };
  localStorage.setItem('TROMBETAS_GUESTS', JSON.stringify(guests));
  localStorage.setItem('TROMBETAS_EVENT', JSON.stringify(eventInfo));
  updateUI();
}

[inputDate, inputTime, inputInviter].forEach(input => {
  input?.addEventListener('change', saveData);
  input?.addEventListener('input', saveData);
});

function updateUI() {
  if (guestCount) guestCount.innerText = guests.length.toString();
  renderTable();
}

function renderTable() {
  if (!guestsListTbody) return;
  guestsListTbody.innerHTML = '';

  if (guests.length === 0) {
    guestsListTbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-slate-400 italic text-sm py-6 border border-slate-300">
          Nenhum convidado adicionado ainda.
        </td>
      </tr>`;
    return;
  }

  guests.forEach((g, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border border-slate-300 p-2.5 font-bold text-[#0d2f40]">${index + 1}</td>
      <td class="border border-slate-300 p-2.5 text-left font-bold text-[#0d2f40] uppercase">${g.name}</td>
      <td class="border border-slate-300 p-2.5 font-bold text-[#c2410c]">${g.phone || ''}</td>
      <td class="border border-slate-300 p-2.5">
        <button class="btn-delete w-6 h-6 bg-red-50 text-red-400 rounded-full inline-flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors" data-id="${g.id}">
          <i class="fas fa-times text-[10px]"></i>
        </button>
      </td>
    `;
    guestsListTbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e: Event) => {
      const currentTarget = e.currentTarget as HTMLButtonElement;
      const id = currentTarget.getAttribute('data-id');
      if (id) {
        guests = guests.filter(g => g.id !== id);
        saveData();
      }
    });
  });
}

if (form) {
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const name = inputName.value.trim().toUpperCase();
    const phone = inputPhone.value.trim();

    if (!name) return;

    guests.push({
      id: Date.now().toString(),
      name,
      phone
    });

    saveData();
    inputName.value = '';
    inputPhone.value = '';
    inputName.focus();
  });
}

if (btnClearGuests) {
  btnClearGuests.addEventListener('click', () => {
    if (confirm("Tem certeza que deseja limpar toda a lista?")) {
      guests = [];
      saveData();
      if(previewSection) previewSection.classList.add('hidden');
    }
  });
}

// Ocultar preview
if (btnClosePreview) {
  btnClosePreview.addEventListener('click', () => {
    if (previewSection) previewSection.classList.add('hidden');
  });
}

// Lógica Visual do Canvas de Alta Fidelidade
async function generateReportImage() {
  if (guests.length === 0) {
    alert("Adicione pelo menos um convidado para gerar a imagem.");
    return;
  }

  btnGenerateImage.disabled = true;
  btnGenerateImage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GERANDO...';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1000;
  const rowHeight = 50;
  const minRows = 3; 
  const totalRows = Math.max(guests.length, minRows); 
  const height = 250 + ((totalRows + 1) * rowHeight) + 80; 

  canvas.width = width;
  canvas.height = height;

  // Fundo Branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const marginX = 40;
  let currentY = 40;

  // 1. Caixa do Título
  const titleBoxHeight = 85;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.strokeRect(marginX, currentY, width - (marginX * 2), titleBoxHeight);

  // Título Principal - Ajustado para evitar colisão
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px Arial'; // Diminuído de 30px
  ctx.textAlign = 'left';
  ctx.fillText('CONVIDADOS TROMBETAS E FESTAS 2026', marginX + 20, currentY + 51);

  // Informações do Lado Direito
  ctx.textAlign = 'right';
  const dateStr = eventInfo.date ? new Date(eventInfo.date + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----';
  const timeStr = eventInfo.time ? eventInfo.time + 'h' : '--:--h';

  if (eventInfo.inviter && eventInfo.inviter.trim() !== '') {
    ctx.font = 'bold 16px Arial'; // Diminuído de 18px
    ctx.fillText(`CONVIDADOS DE: ${eventInfo.inviter}`, width - marginX - 20, currentY + 36);
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Data do evento: ${dateStr} - ${timeStr}`, width - marginX - 20, currentY + 63);
  } else {
    ctx.font = 'bold 18px Arial'; // Mantém um pouco maior se for só a data
    ctx.fillText(`Data do evento: ${dateStr} - ${timeStr}`, width - marginX - 20, currentY + 51);
  }

  currentY += titleBoxHeight + 25; // Espaço até a tabela

  // 2. Cabeçalho da Tabela
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(marginX, currentY, width - (marginX * 2), rowHeight);
  ctx.strokeRect(marginX, currentY, width - (marginX * 2), rowHeight);

  // Colunas: Ajuste de Larguras
  const col1W = 80;
  const col3W = 200;
  const col2W = width - (marginX * 2) - col1W - col3W;
  
  const col1X = marginX;
  const col2X = marginX + col1W;
  const col3X = marginX + col1W + col2W;

  // Textos do Cabeçalho
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Nº', col1X + (col1W / 2), currentY + 32);
  ctx.fillText('NOME DO CONVIDADO', col2X + (col2W / 2), currentY + 32);
  ctx.fillText('TELEFONE', col3X + (col3W / 2), currentY + 32);

  // Linhas verticais do cabeçalho
  ctx.beginPath();
  ctx.moveTo(col2X, currentY);
  ctx.lineTo(col2X, currentY + rowHeight);
  ctx.moveTo(col3X, currentY);
  ctx.lineTo(col3X, currentY + rowHeight);
  ctx.stroke();

  currentY += rowHeight;

  // 3. Linhas da Tabela
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < totalRows; i++) {
    const isGuest = i < guests.length;
    
    // Borda da linha inteira
    ctx.strokeRect(marginX, currentY, width - (marginX * 2), rowHeight);
    
    // Linhas verticais separadoras
    ctx.beginPath();
    ctx.moveTo(col2X, currentY);
    ctx.lineTo(col2X, currentY + rowHeight);
    ctx.moveTo(col3X, currentY);
    ctx.lineTo(col3X, currentY + rowHeight);
    ctx.stroke();

    if (isGuest) {
      const g = guests[i];
      ctx.font = 'bold 16px Arial';
      
      // Nº
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), col1X + (col1W / 2), currentY + 31);
      
      // Nome
      ctx.textAlign = 'left';
      ctx.fillText(g.name, col2X + 25, currentY + 31);
      
      // Telefone
      ctx.textAlign = 'center';
      ctx.fillText(g.phone || '', col3X + (col3W / 2), currentY + 31);
    }
    currentY += rowHeight;
  }

  // 4. Rodapé Final
  currentY += 40;
  
  // Linha fina separadora acima do rodapé
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, currentY);
  ctx.lineTo(width - marginX, currentY);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  
  // Rodapé ajustado conforme o padrão solicitado
  ctx.fillText('SISTEMA DE GESTÃO DO CULTO PROFÉTICO - ICM', width / 2, currentY + 25);

  // Finalizar Imagem
  currentImageUrl = canvas.toDataURL('image/png');
  generatedImage.src = currentImageUrl;
  previewSection.classList.remove('hidden');
  previewSection.scrollIntoView({ behavior: 'smooth' });

  btnGenerateImage.disabled = false;
  btnGenerateImage.innerHTML = '<i class="far fa-image"></i> Gerar Imagem';
}

if (btnGenerateImage) {
  btnGenerateImage.addEventListener('click', generateReportImage);
}

// Botões da Tela de Preview
if (btnDownload) {
  btnDownload.addEventListener('click', () => {
    if (!currentImageUrl) return;
    const link = document.createElement('a');
    link.download = `lista-trombetas.png`;
    link.href = currentImageUrl;
    link.click();
  });
}

if (btnWhatsapp) {
  btnWhatsapp.addEventListener('click', async () => {
    if (!currentImageUrl) return;
    try {
      const res = await fetch(currentImageUrl);
      const blob = await res.blob();
      const file = new File([blob], "lista-trombetas.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Lista Trombetas' });
      } else {
        alert("Baixe a imagem para compartilhar no seu dispositivo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao compartilhar.");
    }
  });
}

// Boot
loadData();
export {};