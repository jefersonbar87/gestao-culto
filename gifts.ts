import { getSettings } from './utils/settingsHelper';

type GiftCategory = 'SONHO' | 'VISÃO' | 'REVELAÇÃO' | 'OUTROS';

interface ThemeConfig {
  primary: string;
  bgLight: string;
  border: string;
  text: string;
}

const THEMES: Record<GiftCategory, ThemeConfig> = {
  SONHO: { primary: '#a62626', bgLight: '#fef2f2', border: 'border-red-200', text: 'text-red-700' },
  VISÃO: { primary: '#047857', bgLight: '#ecfdf5', border: 'border-emerald-200', text: 'text-emerald-700' },
  REVELAÇÃO: { primary: '#1d4ed8', bgLight: '#eff6ff', border: 'border-blue-200', text: 'text-blue-700' },
  OUTROS: { primary: '#4b5563', bgLight: '#f9fafb', border: 'border-gray-200', text: 'text-gray-700' }
};

const settings = getSettings();
let selectedCategory: GiftCategory = 'SONHO';
let generatedImageUrl: string | null = null;

// DOM elements
const btnSonho = document.getElementById('cat-sonho') as HTMLButtonElement;
const btnVisao = document.getElementById('cat-visao') as HTMLButtonElement;
const btnRevelacao = document.getElementById('cat-revelacao') as HTMLButtonElement;
const btnOutros = document.getElementById('cat-outros') as HTMLButtonElement;

const customCategoryContainer = document.getElementById('custom-category-container') as HTMLDivElement;
const inputCustomCategory = document.getElementById('gift-custom-category') as HTMLInputElement;

const inputChurch = document.getElementById('gift-church') as HTMLInputElement;
const checkIncludeDate = document.getElementById('gift-include-date') as HTMLInputElement;
const inputDate = document.getElementById('gift-date') as HTMLInputElement;
const checkJustify = document.getElementById('gift-justify-text') as HTMLInputElement;
const checkVertical = document.getElementById('gift-vertical-image') as HTMLInputElement;
const inputContent = document.getElementById('gift-content') as HTMLTextAreaElement;

const btnFontPlus = document.getElementById('btn-font-plus') as HTMLButtonElement;
const btnFontMinus = document.getElementById('btn-font-minus') as HTMLButtonElement;
const inputFontSize = document.getElementById('gift-font-size') as HTMLInputElement;
const fontSizeDisplay = document.getElementById('font-size-display') as HTMLSpanElement;

const btnGenerateGift = document.getElementById('btn-generate-gift') as HTMLButtonElement;
const previewSection = document.getElementById('gift-preview-section') as HTMLDivElement;
const previewImage = document.getElementById('gift-preview-image') as HTMLImageElement;
const btnShareGift = document.getElementById('btn-share-gift') as HTMLButtonElement;
const btnDownloadGift = document.getElementById('btn-download-gift') as HTMLButtonElement;

const today = new Date();
if (inputDate) {
  inputDate.value = today.toISOString().split('T')[0];
}

const categories = [
  { btn: btnSonho, key: 'SONHO' as const },
  { btn: btnVisao, key: 'VISÃO' as const },
  { btn: btnRevelacao, key: 'REVELAÇÃO' as const },
  { btn: btnOutros, key: 'OUTROS' as const }
];

function selectCategory(cat: GiftCategory) {
  selectedCategory = cat;
  hidePreview();

  if (customCategoryContainer) {
    if (cat === 'OUTROS') {
      customCategoryContainer.classList.remove('hidden');
    } else {
      customCategoryContainer.classList.add('hidden');
    }
  }

  categories.forEach(({ btn, key }) => {
    if (!btn) return;
    const theme = THEMES[key];
    if (key === cat) {
      btn.className = `py-3 px-4 rounded-xl font-bold text-xs border uppercase text-center transition-all ${theme.bgLight} ${theme.text} ${theme.border} ring-2 ring-offset-1 ring-${key === 'SONHO' ? 'red' : key === 'REVELAÇÃO' ? 'blue' : key === 'VISÃO' ? 'emerald' : 'gray'}-500`;
    } else {
      btn.className = `py-3 px-4 rounded-xl font-bold text-xs border uppercase text-center transition-all bg-slate-50 text-slate-500 border-slate-200`;
    }
  });
}

function hidePreview() {
  generatedImageUrl = null;
  if (previewSection) previewSection.classList.add('hidden');
}

if (btnFontPlus && btnFontMinus && inputFontSize && fontSizeDisplay) {
  btnFontPlus.addEventListener('click', () => {
    let val = parseInt(inputFontSize.value);
    val += 2;
    inputFontSize.value = val.toString();
    fontSizeDisplay.innerText = val + 'px';
    hidePreview();
  });
  
  btnFontMinus.addEventListener('click', () => {
    let val = parseInt(inputFontSize.value);
    if (val > 12) val -= 2;
    inputFontSize.value = val.toString();
    fontSizeDisplay.innerText = val + 'px';
    hidePreview();
  });
}

categories.forEach(({ btn, key }) => {
  if (btn) btn.addEventListener('click', () => selectCategory(key));
});

[inputChurch, checkIncludeDate, inputDate, checkJustify, checkVertical, inputContent, inputCustomCategory].forEach(input => {
  if (input) input.addEventListener('input', hidePreview);
});

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, justify: boolean, draw: boolean = true): number {
  const paragraphs = text.split('\n');
  let currentY = y;

  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') {
      currentY += lineHeight;
      return;
    }
    
    const words = paragraph.split(' ');
    let line = '';
    let lineWords: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && n > 0) {
        if (draw) {
          if (justify && lineWords.length > 1) {
             const totalWordWidth = lineWords.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
             const totalSpace = maxWidth - totalWordWidth;
             const spaceWidth = totalSpace / (lineWords.length - 1);
             
             let currentX = x;
             lineWords.forEach((word) => {
                 ctx.fillText(word, currentX, currentY);
                 currentX += ctx.measureText(word).width + spaceWidth;
             });
          } else {
             ctx.fillText(line.trim(), x, currentY);
          }
        }
        line = words[n] + ' ';
        lineWords = [words[n]];
        currentY += lineHeight;
      } else {
        line = testLine;
        lineWords.push(words[n]);
      }
    }
    if (draw) ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  });
  return currentY;
}

// Canvas image generator
async function generateGiftPoster() {
  if (!btnGenerateGift) return;
  
  btnGenerateGift.disabled = true;
  const originalText = btnGenerateGift.innerHTML;
  btnGenerateGift.innerHTML = '<i class="fas fa-spinner animate-spin"></i> GERANDO...';

  try {
    const churchName = inputChurch?.value.trim().toUpperCase() || '';
    const content = inputContent?.value.trim() || 'NENHUM CONTEÚDO INFORMADO';
    const isVertical = checkVertical?.checked || false;
    const isJustified = checkJustify?.checked || false;
    const includeDate = checkIncludeDate?.checked || false;
    
    const uiFontSize = parseInt(inputFontSize?.value || '24');
    const scaleFactor = 2; 
    const finalFontSize = uiFontSize * scaleFactor;
    
    // Define largura baseada na escolha: 1080 (vertical) ou 1920 (horizontal)
    const width = isVertical ? 1080 : 1920;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Contexto 2D não suportado");

    ctx.font = `${finalFontSize}px Arial`;
    let simulatedY = 120;
    if (churchName || (settings.hymnHeaderType === 'image' && settings.hymnHeaderImage)) {
      simulatedY = 150; 
    } else {
      simulatedY += 80;
    }
    simulatedY += 40;
    simulatedY += 60;
    if (includeDate) simulatedY += 100; 
    else simulatedY += 40;

    // Margens maiores se a imagem for horizontal (TV)
    const sideMargin = isVertical ? 80 : 120;
    const maxTextWidth = width - (sideMargin * 2);
    const lineHeight = finalFontSize * 1.5;

    const finalTextY = wrapText(ctx, content, sideMargin, simulatedY, maxTextWidth, lineHeight, isJustified, false);
    
    const requiredHeight = finalTextY + 120; 

    // Altura base: 1350 para vertical, 1080 para horizontal
    const baseHeight = isVertical ? 1350 : 1080;
    const height = Math.max(baseHeight, requiredHeight);
    
    canvas.width = width;
    canvas.height = height;

    const theme = THEMES[selectedCategory];

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    let currentY = 120;

    if (churchName) {
      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(churchName, width / 2, currentY);
      currentY += 80;
    } else if (settings.hymnHeaderType === 'image' && settings.hymnHeaderImage) {
       try {
         const img = new Image();
         img.crossOrigin = "anonymous"; 
         img.src = settings.hymnHeaderImage;
         await Promise.race([
           new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }),
           new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
         ]);
         
         const imgHeight = 70;
         const imgWidth = img.height ? (img.width / img.height) * imgHeight : 70;
         ctx.drawImage(img, (width - imgWidth) / 2, 40, imgWidth, imgHeight);
         currentY = 150;
       } catch (e) {
         ctx.fillStyle = theme.primary;
         ctx.font = 'bold 36px Arial';
         ctx.textAlign = 'center';
         ctx.fillText(settings.hymnHeaderText || 'IGREJA CRISTÃ MARANATA', width / 2, currentY);
         currentY += 80;
       }
    } else {
      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(settings.hymnHeaderText || 'IGREJA CRISTÃ MARANATA', width / 2, currentY);
      currentY += 80;
    }

    let displayTitle = selectedCategory as string;
    if (selectedCategory === 'OUTROS' && inputCustomCategory?.value.trim()) {
      displayTitle = inputCustomCategory.value.trim().toUpperCase();
    }

    ctx.fillStyle = theme.primary;
    ctx.font = '900 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(displayTitle, width / 2, currentY);
    currentY += 40;

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, currentY);
    ctx.lineTo(width - 150, currentY);
    ctx.stroke();
    currentY += 60;

    if (includeDate) {
      const dateVal = inputDate?.value;
      let dateStr = new Date().toLocaleDateString('pt-BR');
      if (dateVal) {
         const [y, m, d] = dateVal.split('-');
         dateStr = `${d}/${m}/${y}`;
      }
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`DATA: ${dateStr}`, width / 2, currentY);
      currentY += 100;
    } else {
      currentY += 40;
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = `${finalFontSize}px Arial`;
    ctx.textAlign = 'left';
    
    wrapText(ctx, content, sideMargin, currentY, maxTextWidth, lineHeight, isJustified, true);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('SISTEMA DE GESTÃO DO CULTO PROFÉTICO - ICM', width / 2, height - 50);

    generatedImageUrl = canvas.toDataURL('image/png');
    if (previewImage) previewImage.src = generatedImageUrl;
    if (previewSection) {
      previewSection.classList.remove('hidden');
      previewSection.scrollIntoView({ behavior: 'smooth' });
    }

  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    alert("Ocorreu um erro ao gerar a imagem. Verifique o console.");
  } finally {
    btnGenerateGift.disabled = false;
    btnGenerateGift.innerHTML = originalText;
  }
}

if (btnGenerateGift) btnGenerateGift.addEventListener('click', generateGiftPoster);

if (btnDownloadGift) {
  btnDownloadGift.addEventListener('click', () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = `dom-${selectedCategory.toLowerCase()}.png`;
    link.href = generatedImageUrl;
    link.click();
  });
}

if (btnShareGift) {
  btnShareGift.addEventListener('click', async () => {
    if (!generatedImageUrl) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const file = new File([blob], `dom-${selectedCategory.toLowerCase()}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Registro de Dom Espiritual' });
      } else {
        alert("O compartilhamento direto não é suportado no seu dispositivo. Use o botão Baixar.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao compartilhar.");
    }
  });
}

selectCategory('SONHO');
export {};