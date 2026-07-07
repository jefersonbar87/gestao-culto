import { getSettings } from './utils/settingsHelper';

const settings = getSettings();
let generatedImageUrl: string | null = null;
let serviceType: 'EBD' | 'CULTO À NOITE' | null = null;

// DOM elements
const inputDate = document.getElementById('input-date') as HTMLInputElement;
const dateDisplay = document.getElementById('date-display') as HTMLDivElement;
const inputGroup = document.getElementById('input-group') as HTMLInputElement;

const btnTypeEBD = document.getElementById('btn-type-ebd') as HTMLButtonElement;
const btnTypeNight = document.getElementById('btn-type-night') as HTMLButtonElement;

// Responsáveis
const respPortao = document.getElementById('resp-portao') as HTMLInputElement;
const respLouvor = document.getElementById('resp-louvor') as HTMLInputElement;
const respPalavra = document.getElementById('resp-palavra') as HTMLInputElement;
const respTexto = document.getElementById('resp-texto') as HTMLInputElement;

// Inputs Numéricos (Participantes)
const adultsMembers = document.getElementById('adults-members') as HTMLInputElement;
const adultsVisitors = document.getElementById('adults-visitors') as HTMLInputElement;
const kidsMembers = document.getElementById('kids-members') as HTMLInputElement;
const kidsVisitors = document.getElementById('kids-visitors') as HTMLInputElement;

// Inputs Numéricos (Obreiros)
const officersPastor = document.getElementById('officers-pastor') as HTMLInputElement;
const officersDeacon = document.getElementById('officers-deacon') as HTMLInputElement;
const officersWorkers = document.getElementById('officers-workers') as HTMLInputElement;

// Totais Labels
const totalAdultsDisplay = document.getElementById('total-adults') as HTMLSpanElement;
const totalKidsDisplay = document.getElementById('total-kids') as HTMLSpanElement;
const totalGeneralDisplay = document.getElementById('total-general') as HTMLSpanElement;

// Botões Ações
const btnClearService = document.getElementById('btn-clear-service') as HTMLButtonElement;
const btnGenerateReport = document.getElementById('btn-generate-report') as HTMLButtonElement;
const previewSection = document.getElementById('service-preview-section') as HTMLDivElement;
const previewImage = document.getElementById('service-preview-image') as HTMLImageElement;
const btnShareService = document.getElementById('btn-share-service') as HTMLButtonElement;
const btnDownloadService = document.getElementById('btn-download-service') as HTMLButtonElement;

const numericInputs = [
  adultsMembers, adultsVisitors, kidsMembers, kidsVisitors, 
  officersPastor, officersDeacon, officersWorkers
];
const textInputs = [inputGroup, respPortao, respLouvor, respPalavra, respTexto];

// Date Handlers
function updateDateDisplay() {
  if (!inputDate.value) return;
  const dateObj = new Date(inputDate.value + 'T00:00:00'); 
  const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
  const dayName = days[dateObj.getDay()];
  const formattedDate = dateObj.toLocaleDateString('pt-BR');
  dateDisplay.innerText = `Hoje: ${dayName} - ${formattedDate}`;
}

// Select Service Type Toggle
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
  saveFormData();
}

// Load saved form data from localStorage
function loadSavedData() {
  const saved = localStorage.getItem('SERVICE_NEW_DATA_FORM');
  const today = new Date();
  
  if (saved) {
    try {
      const data = JSON.parse(saved);
      inputDate.value = data.date || today.toISOString().split('T')[0];
      inputGroup.value = data.group || '';
      if (data.serviceType) setServiceType(data.serviceType);
      
      respPortao.value = data.respPortao || '';
      respLouvor.value = data.respLouvor || '';
      respPalavra.value = data.respPalavra || '';
      respTexto.value = data.respTexto || '';

      adultsMembers.value = data.adultsMembers ?? 0;
      adultsVisitors.value = data.adultsVisitors ?? 0;
      kidsMembers.value = data.kidsMembers ?? 0;
      kidsVisitors.value = data.kidsVisitors ?? 0;
      
      officersPastor.value = data.officersPastor ?? 0;
      officersDeacon.value = data.officersDeacon ?? 0;
      officersWorkers.value = data.officersWorkers ?? 0;
    } catch (e) {
      console.error(e);
      inputDate.value = today.toISOString().split('T')[0];
    }
  } else {
    inputDate.value = today.toISOString().split('T')[0];
  }
  updateDateDisplay();
  calculateTotals();
}

// Save form data to localStorage
function saveFormData() {
  const data = {
    date: inputDate.value,
    group: inputGroup.value,
    serviceType: serviceType,
    respPortao: respPortao.value,
    respLouvor: respLouvor.value,
    respPalavra: respPalavra.value,
    respTexto: respTexto.value,
    adultsMembers: parseInt(adultsMembers.value) || 0,
    adultsVisitors: parseInt(adultsVisitors.value) || 0,
    kidsMembers: parseInt(kidsMembers.value) || 0,
    kidsVisitors: parseInt(kidsVisitors.value) || 0,
    officersPastor: parseInt(officersPastor.value) || 0,
    officersDeacon: parseInt(officersDeacon.value) || 0,
    officersWorkers: parseInt(officersWorkers.value) || 0,
  };
  localStorage.setItem('SERVICE_NEW_DATA_FORM', JSON.stringify(data));
  hidePreview();
}

function calculateTotals() {
  const tAdults = (parseInt(adultsMembers.value) || 0) + (parseInt(adultsVisitors.value) || 0);
  const tKids = (parseInt(kidsMembers.value) || 0) + (parseInt(kidsVisitors.value) || 0);
  const tGeneral = tAdults + tKids;

  if (totalAdultsDisplay) totalAdultsDisplay.innerText = tAdults.toString();
  if (totalKidsDisplay) totalKidsDisplay.innerText = tKids.toString();
  if (totalGeneralDisplay) totalGeneralDisplay.innerText = tGeneral.toString();
}

function hidePreview() {
  generatedImageUrl = null;
  if (previewSection) previewSection.classList.add('hidden');
}

// Event Listeners for + / - buttons
document.querySelectorAll('.btn-plus').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const targetId = (e.currentTarget as HTMLButtonElement).dataset.target;
    if (targetId) {
      const input = document.getElementById(targetId) as HTMLInputElement;
      input.value = ((parseInt(input.value) || 0) + 1).toString();
      calculateTotals();
      saveFormData();
    }
  });
});

document.querySelectorAll('.btn-minus').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const targetId = (e.currentTarget as HTMLButtonElement).dataset.target;
    if (targetId) {
      const input = document.getElementById(targetId) as HTMLInputElement;
      let val = parseInt(input.value) || 0;
      if (val > 0) {
        input.value = (val - 1).toString();
        calculateTotals();
        saveFormData();
      }
    }
  });
});

numericInputs.forEach(input => {
  if (input) {
    input.addEventListener('input', () => {
      calculateTotals();
      saveFormData();
    });
  }
});

textInputs.forEach(txt => {
  if (txt) txt.addEventListener('input', saveFormData);
});

if (inputDate) inputDate.addEventListener('change', () => {
  updateDateDisplay();
  saveFormData();
});

if (btnTypeEBD) btnTypeEBD.addEventListener('click', () => setServiceType('EBD'));
if (btnTypeNight) btnTypeNight.addEventListener('click', () => setServiceType('CULTO À NOITE'));

if (btnClearService) {
  btnClearService.addEventListener('click', () => {
    if (confirm("Deseja realmente limpar todos os campos?")) {
      numericInputs.forEach(input => { if (input) input.value = '0'; });
      textInputs.forEach(txt => { if (txt) txt.value = ''; });
      serviceType = null;
      btnTypeEBD.classList.remove('bg-[#8f1919]', 'text-white');
      btnTypeEBD.classList.add('text-[#8f1919]');
      btnTypeNight.classList.remove('bg-[#8f1919]', 'text-white');
      btnTypeNight.classList.add('text-[#8f1919]');
      calculateTotals();
      saveFormData();
      hidePreview();
    }
  });
}

// Helper para desenhar retângulos com bordas arredondadas
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

// Canvas Generation 
async function generateServiceReport() {
  btnGenerateReport.disabled = true;
  btnGenerateReport.innerHTML = '<i class="fas fa-spinner animate-spin"></i> GERANDO...';

  const tAdults = (parseInt(adultsMembers.value) || 0) + (parseInt(adultsVisitors.value) || 0);
  const tKids = (parseInt(kidsMembers.value) || 0) + (parseInt(kidsVisitors.value) || 0);
  const total = tAdults + tKids;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  const height = 1560; // Altura corrigida para acomodar tudo com folga
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer Border (Cinza claro arredondado)
  drawRoundRect(ctx, 20, 20, width - 40, height - 40, 20, null, '#cbd5e1', 3);

  let cy = 100;

  // 1. HEADER
  ctx.fillStyle = '#991b1b'; // Vermelho escuro Maranata
  ctx.font = 'bold 38px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(settings.hymnHeaderText || 'IGREJA CRISTÃ MARANATA', width / 2, cy);

  cy += 45;
  ctx.fillStyle = '#dc2626'; // Vermelho vibrante
  ctx.font = 'bold 32px Arial';
  ctx.fillText('DADOS DO CULTO', width / 2, cy);

  cy += 40;
  if (serviceType) {
      ctx.fillText(serviceType, width / 2, cy);
  }

  cy += 45;
  ctx.fillStyle = '#1e293b'; // Preto/grafite
  ctx.font = 'bold 24px Arial';
  const dateText = dateDisplay.innerText.replace('Hoje: ', '').toUpperCase();
  ctx.fillText(dateText, width / 2, cy);

  cy += 35;
  // Group bar (Azul clarinho)
  const groupTxt = inputGroup.value.trim().toUpperCase() || 'NÃO INFORMADO';
  drawRoundRect(ctx, 60, cy, 960, 50, 8, '#eff6ff', null);
  ctx.fillStyle = '#1d4ed8'; // Azul royal
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`GRUPO DE ASSISTÊNCIA: ${groupTxt}`, width / 2, cy + 33);

  cy += 90;
  // Red line separator
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, cy);
  ctx.lineTo(1020, cy);
  ctx.stroke();

  cy += 30;
  // RESPONSÁVEIS Title (Vermelho claro)
  drawRoundRect(ctx, 60, cy, 960, 50, 8, '#fee2e2', null);
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('RESPONSÁVEIS', width / 2, cy + 34);

  cy += 80;
  const responsaveis = [
      { label: 'PORTÃO:', val: respPortao.value.toUpperCase() },
      { label: 'LOUVOR:', val: respLouvor.value.toUpperCase() },
      { label: 'PALAVRA:', val: respPalavra.value.toUpperCase() },
      { label: 'TEXTO LIDO:', val: respTexto.value.toUpperCase() }
  ];

  responsaveis.forEach((r) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(r.label, 80, cy);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(r.val || '-', 1000, cy);

      // Linha separadora bem suave
      cy += 20;
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, cy);
      ctx.lineTo(1020, cy);
      ctx.stroke();

      cy += 40;
  });

  cy += 20;
  // PARTICIPANTES Title
  drawRoundRect(ctx, 60, cy, 960, 50, 8, '#fee2e2', null);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('PARTICIPANTES DO CULTO', width / 2, cy + 34);

  cy += 80;
  // BIG BOXES
  // Adultos (Esquerda - Azul)
  drawRoundRect(ctx, 60, cy, 465, 120, 10, '#eff6ff', '#bfdbfe', 2);
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 48px Arial';
  ctx.fillText(tAdults.toString(), 60 + 465/2, cy + 65);
  ctx.font = 'bold 18px Arial';
  ctx.fillText('ADULTOS', 60 + 465/2, cy + 100);

  // Crianças (Direita - Verde)
  drawRoundRect(ctx, 555, cy, 465, 120, 10, '#f0fdf4', '#bbf7d0', 2);
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 48px Arial';
  ctx.fillText(tKids.toString(), 555 + 465/2, cy + 65);
  ctx.font = 'bold 18px Arial';
  ctx.fillText('CRIANÇAS', 555 + 465/2, cy + 100);

  cy += 140;
  // Small Boxes Row 1 (Adultos detalhados)
  drawRoundRect(ctx, 60, cy, 465, 60, 10, '#eff6ff', '#bfdbfe', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Adultos Membros:', 80, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(adultsMembers.value || '0', 505, cy + 40);

  drawRoundRect(ctx, 555, cy, 465, 60, 10, '#eff6ff', '#bfdbfe', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Adultos (Visitantes):', 575, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(adultsVisitors.value || '0', 1000, cy + 40);

  cy += 80;
  // Small Boxes Row 2 (Crianças detalhadas)
  drawRoundRect(ctx, 60, cy, 465, 60, 10, '#f0fdf4', '#bbf7d0', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Crianças:', 80, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(kidsMembers.value || '0', 505, cy + 40);

  drawRoundRect(ctx, 555, cy, 465, 60, 10, '#f0fdf4', '#bbf7d0', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Crianças (Visitantes):', 575, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(kidsVisitors.value || '0', 1000, cy + 40);

  cy += 100;
  // OBREIROS
  drawRoundRect(ctx, 60, cy, 960, 45, 8, '#fee2e2', null);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('GRUPO DE OBREIROS, DIÁCONOS, UNGIDOS E PASTORES PRESENTES', width / 2, cy + 30);

  cy += 65;
  // 3 Caixas menores divididas em 3 colunas perfeitas
  // Pastor (Roxo)
  drawRoundRect(ctx, 60, cy, 310, 60, 10, '#faf5ff', '#e9d5ff', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#7e22ce';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Pastor/Ungidos:', 75, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px Arial';
  ctx.fillText(officersPastor.value || '0', 350, cy + 38);

  // Diaconos (Laranja)
  drawRoundRect(ctx, 385, cy, 310, 60, 10, '#fff7ed', '#fed7aa', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c2410c';
  ctx.fillText('Diáconos:', 400, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(officersDeacon.value || '0', 675, cy + 38);

  // Obreiros (Azul)
  drawRoundRect(ctx, 710, cy, 310, 60, 10, '#eff6ff', '#bfdbfe', 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1d4ed8';
  ctx.fillText('Obreiros:', 725, cy + 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(officersWorkers.value || '0', 1000, cy + 38);

  cy += 110;
  // CAIXA DE TOTAL
  drawRoundRect(ctx, 60, cy, 960, 140, 10, '#fef2f2', '#fca5a5', 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 54px Arial';
  ctx.fillText(total.toString(), width / 2, cy + 70);
  ctx.font = 'bold 22px Arial';
  ctx.fillText('TOTAL GERAL DE PESSOAS', width / 2, cy + 115);

  // Ancorando o rodapé a partir do final do Canvas (height) para nunca sumir
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
  btnGenerateReport.innerHTML = '<i class="fas fa-image"></i> GERAR RELATÓRIO DO CULTO';
}

if (btnGenerateReport) btnGenerateReport.addEventListener('click', generateServiceReport);

if (btnDownloadService) {
  btnDownloadService.addEventListener('click', () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = `relatorio-culto.png`;
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
      const file = new File([blob], "relatorio-culto.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Relatório do Culto ICM' });
      } else {
        alert("O compartilhamento não é suportado no seu dispositivo. Baixe e compartilhe manualmente.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao compartilhar.");
    }
  });
}

// Boot
loadSavedData();
export {};