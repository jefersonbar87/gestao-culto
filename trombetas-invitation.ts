interface InvitationData {
  name: string;
  date: string;
  time: string;
  location: string;
}

const formInvite = document.getElementById('form-invitation') as HTMLFormElement;
const inputName = document.getElementById('invite-name') as HTMLInputElement;
const inputDate = document.getElementById('invite-date') as HTMLInputElement;
const inputTime = document.getElementById('invite-time') as HTMLInputElement;
const inputLocation = document.getElementById('invite-location') as HTMLInputElement;

const previewSection = document.getElementById('preview-section') as HTMLDivElement;
const generatedImg = document.getElementById('generated-invite-img') as HTMLImageElement;
const btnClosePreview = document.getElementById('btn-close-preview') as HTMLButtonElement;
const btnDownload = document.getElementById('btn-download-invite') as HTMLButtonElement;
const btnWhatsapp = document.getElementById('btn-share-whatsapp') as HTMLButtonElement;

let inviteImageUrl: string | null = null;

function loadSavedInvite() {
  const saved = localStorage.getItem('TROMBETAS_SAVED_INVITE_V2');
  if (saved) {
    try {
      const data: InvitationData = JSON.parse(saved);
      if (inputName) inputName.value = data.name || '';
      if (inputDate) inputDate.value = data.date || '';
      if (inputTime) inputTime.value = data.time || '';
      if (inputLocation) inputLocation.value = data.location || '';
    } catch (e) { console.error(e); }
  }
}

function saveInviteData() {
  const data: InvitationData = {
    name: inputName.value,
    date: inputDate.value,
    time: inputTime.value,
    location: inputLocation.value
  };
  localStorage.setItem('TROMBETAS_SAVED_INVITE_V2', JSON.stringify(data));
}

btnClosePreview?.addEventListener('click', () => {
  previewSection?.classList.add('hidden');
});

async function drawInvitation() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 800;
  const height = 1130; 
  canvas.width = width;
  canvas.height = height;

  // 1. CARREGAR A ARTE DO TEMPLATE
  const bgImage = new Image();
  bgImage.src = '/template-convite.png'; 
  
  await new Promise((resolve) => {
    bgImage.onload = resolve;
    bgImage.onerror = () => {
      console.warn("Imagem de template não encontrada.");
      resolve(null);
    };
  });

  if (bgImage.complete && bgImage.naturalHeight !== 0) {
    ctx.drawImage(bgImage, 0, 0, width, height);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // PREPARAÇÃO DE DADOS
  const dateObj = inputDate.value ? new Date(inputDate.value + 'T00:00:00') : null;
  const mesesAbrev = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const mesesCompletos = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  let dia = '--';
  let mesAbrv = '---';
  let dataCompletaStr = '---';
  const anoEvento = inputDate.value ? inputDate.value.split('-')[0] : '2026';

  if (dateObj) {
    dia = dateObj.getDate().toString().padStart(2, '0');
    mesAbrv = mesesAbrev[dateObj.getMonth()];
    dataCompletaStr = `${dateObj.getDate()} de ${mesesCompletos[dateObj.getMonth()]} de ${dateObj.getFullYear()}`;
  }

  let formattedTime = '---';
  if (inputTime.value) {
    formattedTime = inputTime.value.endsWith(':00') ? inputTime.value.split(':')[0] : inputTime.value;
  }

  // 2. FITA AZUL SUPERIOR DIREITA 
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  const ribbonX = 604; 

  ctx.font = 'bold 50px Arial';
  ctx.fillText(dia, ribbonX, 125); 

  ctx.font = 'bold 30px Arial';
  ctx.fillText(mesAbrv, ribbonX, 160); 

  ctx.font = '20px Arial';
  const horaTexto = formattedTime !== '---' ? `às ${formattedTime}h` : '---';
  ctx.fillText(horaTexto, ribbonX, 190); 

  // 3. ANO 
  ctx.fillStyle = '#7dd3fc'; 
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  const spacedYear = anoEvento.split('').join('  '); 
  ctx.fillText(spacedYear, 385, 472); 

  // 4. PARTE BRANCA INFERIOR (Fontes refinadas e proteção contra texto longo)
  const textRedColor = '#d9534f'; 
  const textBlackColor = '#212529'; 
  const textGrayColor = '#4b5563';

  // Reduzido de 22px para 20px
  ctx.fillStyle = textBlackColor;
  ctx.font = 'bold 20px Arial';
  ctx.fillText('CONVITE ESPECIAL', width / 2, 765);

  // Reduzido de 36px para 32px + Trava de 700px de largura máxima
  ctx.fillStyle = textRedColor;
  ctx.font = 'bold 32px Arial';
  ctx.fillText(`Olá, ${inputName.value.toUpperCase()}!`, width / 2, 810, 700);

  // Reduzido de 19px para 18px
  ctx.fillStyle = textGrayColor;
  ctx.font = '18px Arial';
  ctx.fillText('Você e sua família são nossos convidados de honra para o:', width / 2, 845);

  // Reduzido de 24px para 22px
  ctx.fillStyle = textBlackColor;
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`"Culto Internacional - Trombetas e Festas ${anoEvento}"`, width / 2, 885, 720);

  // Reduzido de 18px para 17px
  ctx.fillStyle = textGrayColor;
  ctx.font = '17px Arial';
  ctx.fillText('Será um evento de alerta para o mundo sobre os acontecimentos atuais', width / 2, 925);
  ctx.fillText('que antecedem a volta de Jesus.', width / 2, 950);

  // Reduzido de 18px para 17px
  ctx.fillStyle = textBlackColor;
  ctx.font = 'bold 17px Arial';
  ctx.fillText(`Data: ${dataCompletaStr}`, width / 2, 990);
  ctx.fillText(`Horário: ${formattedTime}h (Horário de Brasília)`, width / 2, 1015);

  // Reduzido de 19px para 18px
  ctx.fillStyle = textGrayColor;
  ctx.font = '18px Arial';
  ctx.fillText('Convidamos vocês para assistirem ao evento conosco na:', width / 2, 1060);

  // Reduzido de 26px para 24px + Trava de 720px de largura máxima
  ctx.fillStyle = textRedColor;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(inputLocation.value.toUpperCase(), width / 2, 1100, 720);

  // FINALIZAR
  inviteImageUrl = canvas.toDataURL('image/jpeg', 0.95);
  if (generatedImg) generatedImg.src = inviteImageUrl;
  
  if (previewSection) {
    previewSection.classList.remove('hidden');
    previewSection.scrollIntoView({ behavior: 'smooth' });
  }
}

formInvite?.addEventListener('submit', async (e: Event) => {
  e.preventDefault();
  saveInviteData();

  const submitBtn = formInvite.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GERANDO...';
  }

  await drawInvitation();

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-magic"></i> Criar Convite Oficial';
  }
});

btnDownload?.addEventListener('click', () => {
  if (!inviteImageUrl) return;
  const link = document.createElement('a');
  link.download = `convite-trombetas.jpg`;
  link.href = inviteImageUrl;
  link.click();
});

btnWhatsapp?.addEventListener('click', async () => {
  if (!inviteImageUrl) return;
  try {
    const res = await fetch(inviteImageUrl);
    const blob = await res.blob();
    const file = new File([blob], "convite.jpg", { type: "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Convite Trombetas' });
    } else {
      alert("Baixe o convite para compartilhar.");
    }
  } catch (e) {
    console.error(e);
    alert("Erro ao compartilhar.");
  }
});

loadSavedInvite();
export {};