import { COLETANEA_DATA, CIAS_DATA, AVULSOS_DATA } from './utils/hymnData';
import { getSettings } from './utils/settingsHelper';

interface HymnRow {
  number: string;
  name: string;
}

const settings = getSettings();

// DOM elements
const pageTitle = document.getElementById('page-title') as HTMLHeadingElement;
const btnToggleMode = document.getElementById('btn-toggle-mode') as HTMLButtonElement;
const radioColetanea = document.getElementById('radio-coletanea') as HTMLInputElement;
const radioCias = document.getElementById('radio-cias') as HTMLInputElement;
const radioAvulso = document.getElementById('radio-avulso') as HTMLInputElement; // <-- ADICIONADO AVULSO
const searchQuery = document.getElementById('search-query') as HTMLInputElement;
const btnVoiceSearch = document.getElementById('btn-voice-search') as HTMLButtonElement;
const searchResults = document.getElementById('search-results') as HTMLDivElement;
const btnClearList = document.getElementById('btn-clear-list') as HTMLButtonElement;
const tableContainer = document.getElementById('table-container') as HTMLDivElement;
const btnGenerateImage = document.getElementById('btn-generate-image') as HTMLButtonElement;
const previewSection = document.getElementById('preview-section') as HTMLDivElement;
const previewImage = document.getElementById('preview-image') as HTMLImageElement;
const btnShareWhatsapp = document.getElementById('btn-share-whatsapp') as HTMLButtonElement;
const btnDownloadImage = document.getElementById('btn-download-image') as HTMLButtonElement;

// App State
let isAfterWordMode = false;
let activeRowIndex = 0;
let rows: HymnRow[] = Array(8).fill(null).map(() => ({ number: '', name: '' }));
let generatedImageUrl: string | null = null;

function updateRowStyles() {
  if (!tableContainer) return;
  const rowsElements = tableContainer.children;
  for (let i = 0; i < rowsElements.length; i++) {
    rowsElements[i].className = `flex border-b last:border-0 items-center ${activeRowIndex === i ? 'bg-blue-50' : 'bg-white'}`;
  }
}

// Render dynamic rows
function renderTable() {
  if (!tableContainer) return;
  tableContainer.innerHTML = '';

  rows.forEach((row, idx) => {
    const rowEl = document.createElement('div');
    rowEl.className = `flex border-b last:border-0 items-center ${activeRowIndex === idx ? 'bg-blue-50' : 'bg-white'}`;

    // Up/Down Arrows Group - Ajustado com área de toque gigante para mobile
    const arrowGroup = document.createElement('div');
    arrowGroup.className = 'w-14 sm:w-16 border-r flex flex-col items-center bg-slate-50 text-sm text-slate-500 py-1 px-1 gap-1';

    const btnUp = document.createElement('button');
    btnUp.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btnUp.className = 'w-full py-2 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 rounded transition-colors';
    btnUp.addEventListener('click', () => moveRow(idx, 'up'));

    const btnDown = document.createElement('button');
    btnDown.innerHTML = '<i class="fas fa-chevron-down"></i>';
    btnDown.className = 'w-full py-2 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 rounded transition-colors';
    btnDown.addEventListener('click', () => moveRow(idx, 'down'));

    arrowGroup.appendChild(btnUp);
    arrowGroup.appendChild(btnDown);

    // Number input
    const numInput = document.createElement('input');
    numInput.type = 'text';
    numInput.value = row.number;
    numInput.className = 'w-16 sm:w-20 border-r text-center font-bold p-2 outline-none bg-transparent';
    numInput.placeholder = 'Nº';
    numInput.addEventListener('focus', () => { activeRowIndex = idx; updateRowStyles(); });
    numInput.addEventListener('input', (e) => {
      row.number = (e.target as HTMLInputElement).value.toUpperCase();
      hidePreview();
    });

    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = row.name;
    nameInput.className = 'flex-1 p-2 outline-none uppercase bg-transparent min-w-0';
    nameInput.placeholder = 'NOME DO HINO';
    nameInput.addEventListener('focus', () => { activeRowIndex = idx; updateRowStyles(); });
    nameInput.addEventListener('input', (e) => {
      row.name = (e.target as HTMLInputElement).value.toUpperCase();
      hidePreview();
    });

    rowEl.appendChild(arrowGroup);
    rowEl.appendChild(numInput);
    rowEl.appendChild(nameInput);

    tableContainer.appendChild(rowEl);
  });
}

function moveRow(index: number, direction: 'up' | 'down') {
  if (direction === 'up' && index > 0) {
    const temp = rows[index];
    rows[index] = rows[index - 1];
    rows[index - 1] = temp;
    if (activeRowIndex === index) activeRowIndex = index - 1;
    else if (activeRowIndex === index - 1) activeRowIndex = index;
  } else if (direction === 'down' && index < rows.length - 1) {
    const temp = rows[index];
    rows[index] = rows[index + 1];
    rows[index + 1] = temp;
    if (activeRowIndex === index) activeRowIndex = index + 1;
    else if (activeRowIndex === index + 1) activeRowIndex = index;
  }
  renderTable();
  hidePreview();
}

function hidePreview() {
  generatedImageUrl = null;
  if (previewSection) {
    previewSection.classList.add('hidden');
  }
}

function triggerSearch() {
  const query = searchQuery.value.trim().toLowerCase();
  
  if (!query) {
    searchResults.innerHTML = '';
    searchResults.classList.add('hidden');
    return;
  }

  // Define dinamicamente o banco de dados baseado na seleção
  let db = COLETANEA_DATA;
  if (radioCias && radioCias.checked) {
    db = CIAS_DATA;
  } else if (radioAvulso && radioAvulso.checked) {
    db = AVULSOS_DATA;
  }

  const filtered = db.filter(h => h.number.includes(query) || h.name.toLowerCase().includes(query)).slice(0, 50);

  searchResults.innerHTML = '';
  if (filtered.length > 0) {
    filtered.forEach(h => {
      const item = document.createElement('button');
      item.className = 'w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex justify-between border-b uppercase';
      item.innerHTML = `<span>${h.name}</span><span class="font-bold text-red-500">${h.number}</span>`;
      item.addEventListener('click', () => selectHymn(h));
      searchResults.appendChild(item);
    });
    searchResults.classList.remove('hidden');
  } else {
    searchResults.classList.add('hidden');
  }
}

function selectHymn(hymn: { number: string; name: string }) {
  rows[activeRowIndex] = { number: hymn.number, name: hymn.name.toUpperCase() };
  if (activeRowIndex === rows.length - 1) {
    rows.push({ number: '', name: '' });
  }
  activeRowIndex = activeRowIndex + 1;
  searchQuery.value = '';
  searchResults.innerHTML = '';
  searchResults.classList.add('hidden');
  renderTable();
  hidePreview();
}

// Inserir hino avulso
function adicionarAvulsoManual() {
  const nomeAvulso = searchQuery.value.trim().toUpperCase();
  if (!nomeAvulso) return;
  selectHymn({ number: '-', name: nomeAvulso });
}

// On Search inputs
if (searchQuery) {
  searchQuery.addEventListener('input', triggerSearch);
  
  searchQuery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && radioAvulso && radioAvulso.checked) {
      e.preventDefault();
      adicionarAvulsoManual();
    }
  });
}

// Toggle radios
[radioColetanea, radioCias, radioAvulso].forEach(radio => {
  if (radio) {
    radio.addEventListener('change', () => {
      searchQuery.value = '';
      triggerSearch();
      hidePreview();
      
      if (radioAvulso && radioAvulso.checked) {
        searchQuery.placeholder = "BUSCAR LOUVOR AVULSO...";
      } else {
        searchQuery.placeholder = "BUSCAR LOUVOR...";
      }
    });
  }
});

// Clear lists
if (btnClearList) {
  btnClearList.addEventListener('click', () => {
    if (confirm("Limpar lista?")) {
      rows = Array(isAfterWordMode ? 3 : 8).fill(null).map(() => ({ number: '', name: '' }));
      activeRowIndex = 0;
      renderTable();
      hidePreview();
    }
  });
}

// Toggle mode
if (btnToggleMode) {
  btnToggleMode.addEventListener('click', () => {
    isAfterWordMode = !isAfterWordMode;
    if (isAfterWordMode) {
      pageTitle.innerText = "Louvor Após a Palavra";
      btnToggleMode.innerText = "Voltar para Lista Completa";
      rows = Array(3).fill(null).map(() => ({ number: '', name: '' }));
    } else {
      pageTitle.innerText = "Lista de Louvores";
      btnToggleMode.innerText = "Ir para Louvor Após a Palavra";
      rows = Array(8).fill(null).map(() => ({ number: '', name: '' }));
    }
    activeRowIndex = 0;
    renderTable();
    hidePreview();
  });
}

// Image Generator
async function generateImage() {
  if (!btnGenerateImage) return;
  btnGenerateImage.disabled = true;
  btnGenerateImage.innerHTML = '<i class="fas fa-spinner animate-spin"></i> GERANDO...';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    btnGenerateImage.disabled = false;
    btnGenerateImage.innerHTML = '<i class="fas fa-image"></i> GERAR IMAGEM';
    return;
  }

  const tableWidth = 1000;
  const headerHeight = 80;
  const tableHeaderHeight = 80;
  const rowHeight = 70;

  const sidePadding = 40;
  const topPadding = 160;
  const bottomPadding = 40;

  canvas.width = tableWidth + (sidePadding * 2);
  canvas.height = topPadding + headerHeight + tableHeaderHeight + (rows.length * rowHeight) + bottomPadding;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Draw top logo
  const img = new Image();
  img.src = './logoicm.png';

  await new Promise(resolve => {
    img.onload = resolve;
    img.onerror = resolve;
  });

  const imgHeight = 70;
  const imgWidth = img.height ? (img.width / img.height) * imgHeight : 70;
  const centerY = (topPadding - imgHeight) / 2;
  ctx.drawImage(img, sidePadding, centerY, imgWidth, imgHeight);

  ctx.save();
  ctx.translate(sidePadding, topPadding);

  // 2. LOUVORES header row
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, tableWidth, headerHeight);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px Arial';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('LOUVORES', 20, headerHeight / 2);

  const today = new Date();
  const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
  const dateStr = `${days[today.getDay()]} - ${today.toLocaleDateString('pt-BR')}`;
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, tableWidth - 20, headerHeight / 2);

  // 3. Table column headers
  const startY = headerHeight;
  ctx.fillStyle = '#999999';
  ctx.fillRect(0, startY, tableWidth, tableHeaderHeight);
  ctx.strokeRect(0, startY, tableWidth, tableHeaderHeight);

  const colDividerX = 200;
  ctx.beginPath();
  ctx.moveTo(colDividerX, startY);
  ctx.lineTo(colDividerX, startY + tableHeaderHeight);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Nº', colDividerX / 2, startY + (tableHeaderHeight / 2));
  ctx.fillText('Nome do Hino', colDividerX + (tableWidth - colDividerX) / 2, startY + (tableHeaderHeight / 2));

  // 4. Data Rows
  rows.forEach((row, i) => {
    const y = startY + tableHeaderHeight + (i * rowHeight);
    ctx.strokeRect(0, y, tableWidth, rowHeight);
    ctx.beginPath();
    ctx.moveTo(colDividerX, y);
    ctx.lineTo(colDividerX, y + rowHeight);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '30px Arial';
    if (row.number) ctx.fillText(row.number, colDividerX / 2, y + (rowHeight / 2));

    ctx.textAlign = 'left';
    if (row.name) {
      const maxTextWidth = tableWidth - colDividerX - 40;

      ctx.font = '30px Arial';
      const originalWidth = ctx.measureText(row.name).width;

      if (originalWidth <= maxTextWidth) {
        ctx.fillText(row.name, colDividerX + 30, y + (rowHeight / 2));
      } else {
        ctx.font = '24px Arial';
        const words = row.name.split(' ');
        let lines = [];
        let currentLine = '';

        for (let w of words) {
          const testLine = currentLine + w + ' ';
          if (ctx.measureText(testLine).width > maxTextWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = w + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine.trim());

        const lineHeight = 30;
        const totalTextHeight = (lines.length - 1) * lineHeight;
        const startTextY = y + (rowHeight / 2) - (totalTextHeight / 2);

        lines.forEach((lineText, index) => {
          ctx.fillText(lineText, colDividerX + 30, startTextY + (index * lineHeight));
        });
      }
    }
  });

  ctx.restore();

  generatedImageUrl = canvas.toDataURL('image/png');
  if (previewImage) {
    previewImage.src = generatedImageUrl;
  }
  if (previewSection) {
    previewSection.classList.remove('hidden');
    previewSection.scrollIntoView({ behavior: 'smooth' });
  }

  btnGenerateImage.disabled = false;
  btnGenerateImage.innerHTML = '<i class="fas fa-image"></i> GERAR IMAGEM';
}

if (btnGenerateImage) {
  btnGenerateImage.addEventListener('click', generateImage);
}

// Download/Share actions
if (btnDownloadImage) {
  btnDownloadImage.addEventListener('click', () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = 'louvores.png';
    link.href = generatedImageUrl;
    link.click();
  });
}

if (btnShareWhatsapp) {
  btnShareWhatsapp.addEventListener('click', async () => {
    if (!generatedImageUrl) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const file = new File([blob], "louvores.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Lista de Louvores ICM' });
      } else {
        alert("O compartilhamento direto de arquivos não é suportado pelo seu navegador/dispositivo. Baixe a imagem e envie manualmente.");
      }
    } catch (e) {
      console.error(e);
      alert("Não foi possível compartilhar automaticamente.");
    }
  });
}

// Start
renderTable();

// =========================================================================
// MÁQUINA DE RECONHECIMENTO DE VOZ ANTIBUG (HINOS)
// =========================================================================
function criarReconhecimentoVozHinos(onTextoCapturado: (texto: string) => void, btnElement: HTMLButtonElement) {
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognitionAPI) {
    alert("Seu navegador não suporta reconhecimento de voz.");
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false; // Trava o loop: só pega a frase finalizada
  recognition.interimResults = false; // Ignora o lixo do navegador em tempo real
  recognition.lang = 'pt-BR';
  recognition.maxAlternatives = 1;

  let localIsListening = false;

  recognition.onstart = () => {
    localIsListening = true;
    if (btnElement) {
      btnElement.className = "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white animate-pulse shadow-md transition-all";
    }
  };

  recognition.onend = () => {
    localIsListening = false;
    if (btnElement) {
      btnElement.className = "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors";
    }
  };

  recognition.onerror = (event: any) => {
    console.warn("Aviso de voz:", event.error);
    localIsListening = false;
    if (btnElement) {
      btnElement.className = "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors";
    }
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      // Limpeza pesada: tira pontos e vírgulas que o navegador tenta colocar em números de hinos
      const textoLimpo = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
      onTextoCapturado(textoLimpo);
    }
  };

  return {
    toggle: () => {
      if (localIsListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          recognition.abort();
          recognition.start();
        }
      }
    },
    isListening: () => localIsListening
  };
}

if (searchQuery && btnVoiceSearch) {
  const vozHinos = criarReconhecimentoVozHinos((textoFinal) => {
    const valorAtual = searchQuery.value;
    searchQuery.value = valorAtual && !valorAtual.endsWith(' ') ? `${valorAtual} ${textoFinal}` : `${valorAtual}${textoFinal}`;
    
    // Dispara o evento de input sozinho para a lista filtrar na mesma hora
    const inputEvent = new Event('input', { bubbles: true });
    searchQuery.dispatchEvent(inputEvent);
  }, btnVoiceSearch);

  if (vozHinos) {
    const novoBtnVoiceSearch = btnVoiceSearch.cloneNode(true) as HTMLButtonElement;
    btnVoiceSearch.parentNode?.replaceChild(novoBtnVoiceSearch, btnVoiceSearch);
    
    novoBtnVoiceSearch.addEventListener('click', (e) => {
      e.preventDefault();
      vozHinos.toggle();
    });
  }
}

export {};