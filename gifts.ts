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
let generatedImageUrl: string | null = null;

// DOM elements globais da tela
const inputChurch = document.getElementById('gift-church') as HTMLInputElement;
const checkIncludeDate = document.getElementById('gift-include-date') as HTMLInputElement;
const inputDate = document.getElementById('gift-date') as HTMLInputElement;
const checkJustify = document.getElementById('gift-justify-text') as HTMLInputElement;
const checkVertical = document.getElementById('gift-vertical-image') as HTMLInputElement;

const btnFontPlus = document.getElementById('btn-font-plus') as HTMLButtonElement;
const btnFontMinus = document.getElementById('btn-font-minus') as HTMLButtonElement;
const inputFontSize = document.getElementById('gift-font-size') as HTMLInputElement;
const fontSizeDisplay = document.getElementById('font-size-display') as HTMLSpanElement;

const btnGenerateGift = document.getElementById('btn-generate-gift') as HTMLButtonElement;
const previewSection = document.getElementById('gift-preview-section') as HTMLDivElement;
const previewImage = document.getElementById('gift-preview-image') as HTMLImageElement;
const btnShareGift = document.getElementById('btn-share-gift') as HTMLButtonElement;
const btnDownloadGift = document.getElementById('btn-download-gift') as HTMLButtonElement;
const fieldsContainer = document.getElementById('gift-fields-container') as HTMLDivElement;
const btnAddGiftField = document.getElementById('btn-add-gift-field') as HTMLButtonElement;

const today = new Date();
if (inputDate) {
  inputDate.value = today.toISOString().split('T')[0];
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

[inputChurch, checkIncludeDate, inputDate, checkJustify, checkVertical].forEach(input => {
  if (input) input.addEventListener('input', hidePreview);
});

if (fieldsContainer) {
    fieldsContainer.addEventListener('input', (e) => {
        if ((e.target as HTMLElement).classList.contains('gift-textarea')) hidePreview();
    });
}


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

// =========================================================================
// MÁQUINA DE RECONHECIMENTO DE VOZ CONTÍNUO (ESTILO WHATSAPP)
// =========================================================================
function criarReconhecimentoVozDons(onTextoCapturado: (texto: string) => void, btnElement: HTMLButtonElement) {
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognitionAPI) {
    alert("Seu navegador não suporta reconhecimento de voz.");
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'pt-BR';
  recognition.maxAlternatives = 1;

  let localIsListening = false;
  let manualStop = false;

  recognition.onstart = () => {
    localIsListening = true;
    manualStop = false;
    if (btnElement) {
      btnElement.className = "btn-voice-don absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white animate-pulse shadow-lg ring-4 ring-red-200 transition-all z-10";
      btnElement.title = "Ouvindo... Clique para parar";
    }
  };

  recognition.onend = () => {
    if (localIsListening && !manualStop) {
      try {
        recognition.start();
        return;
      } catch (e) {}
    }
    
    localIsListening = false;
    if (btnElement) {
      btnElement.className = "btn-voice-don absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10";
      btnElement.title = "Ditar dom por voz";
    }
  };

  recognition.onerror = (event: any) => {
    console.warn("Aviso de voz:", event.error);
    if (event.error === 'not-allowed') {
      alert("Permissão de microfone negada. Verifique as configurações do navegador.");
      localIsListening = false;
    }
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript.trim()) onTextoCapturado(finalTranscript.trim());
  };

  return {
    toggle: () => {
      if (localIsListening) {
        manualStop = true;
        localIsListening = false;
        recognition.stop();
      } else {
        manualStop = false;
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

// Configura o ouvinte de microfone para um bloco específico
function bindVoiceButton(block: HTMLElement) {
    const btnVoice = block.querySelector('.btn-voice-don') as HTMLButtonElement;
    const textArea = block.querySelector('.gift-textarea') as HTMLTextAreaElement;
    
    if (btnVoice && textArea && !(btnVoice as any)._voiceInitialized) {
        (btnVoice as any)._voiceInitialized = true;
        const vozDons = criarReconhecimentoVozDons((textoFinal) => {
            const valorAtual = textArea.value;
            textArea.value = valorAtual ? `${valorAtual} ${textoFinal}` : textoFinal;
            hidePreview(); 
        }, btnVoice);

        if (vozDons) {
            btnVoice.addEventListener('click', (e) => {
                e.preventDefault();
                vozDons.toggle();
            });
        }
    }
}

// Vincula voz aos blocos já existentes ao carregar
if (fieldsContainer) {
    fieldsContainer.querySelectorAll('.gift-item-block').forEach(block => bindVoiceButton(block as HTMLElement));
}

// Vincula voz aos novos blocos quando forem adicionados via HTML Script
if (btnAddGiftField) {
    btnAddGiftField.addEventListener('click', () => {
        setTimeout(() => {
            if (fieldsContainer && fieldsContainer.lastElementChild) {
                bindVoiceButton(fieldsContainer.lastElementChild as HTMLElement);
            }
        }, 50);
    });
}

// Canvas image generator com suporte a múltiplos blocos
async function generateGiftPoster() {
  if (!btnGenerateGift || !fieldsContainer) return;
  
  btnGenerateGift.disabled = true;
  const originalText = btnGenerateGift.innerHTML;
  btnGenerateGift.innerHTML = '<i class="fas fa-spinner animate-spin"></i> GERANDO...';

  try {
    const churchName = inputChurch?.value.trim().toUpperCase() || '';
    const isVertical = checkVertical?.checked || false;
    const isJustified = checkJustify?.checked || false;
    const includeDate = checkIncludeDate?.checked || false;
    
    const uiFontSize = parseInt(inputFontSize?.value || '24');
    const scaleFactor = 2; 
    const finalFontSize = uiFontSize * scaleFactor;
    
    const width = isVertical ? 1080 : 1920;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Contexto 2D não suportado");

    ctx.font = `${finalFontSize}px Arial`;
    
    // Coleta todos os blocos preenchidos da tela
    const allBlocks = fieldsContainer.querySelectorAll('.gift-item-block');
    const giftsData: { category: string, text: string }[] = [];
    
    allBlocks.forEach(block => {
        const textElement = block.querySelector('.gift-textarea') as HTMLTextAreaElement;
        const activeCatElement = block.querySelector('.cat-btn.active') as HTMLButtonElement;
        
        if (textElement && activeCatElement) {
            const txt = textElement.value.trim();
            if (txt) {
                giftsData.push({
                    category: activeCatElement.getAttribute('data-val') || 'OUTROS',
                    text: txt
                });
            }
        }
    });

    if (giftsData.length === 0) {
        giftsData.push({ category: 'MENSAGEM', text: 'NENHUM CONTEÚDO INFORMADO' });
    }

    // Cálculo dinâmico da altura total da imagem
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

    const sideMargin = isVertical ? 80 : 120;
    const maxTextWidth = width - (sideMargin * 2);
    const lineHeight = finalFontSize * 1.5;

    // Simula a escrita de todos os blocos para calcular a altura exata
    giftsData.forEach(gift => {
        ctx.font = '900 48px Arial'; // Título da categoria
        simulatedY += 80; 
        ctx.font = `${finalFontSize}px Arial`; // Texto do dom
        simulatedY = wrapText(ctx, gift.text, sideMargin, simulatedY, maxTextWidth, lineHeight, isJustified, false);
        simulatedY += 60; // Margem entre dons
    });

    const requiredHeight = simulatedY + 100; 
    const baseHeight = isVertical ? 1350 : 1080;
    const height = Math.max(baseHeight, requiredHeight);
    
    canvas.width = width;
    canvas.height = height;

    // Define cor primária baseada no primeiro dom para a borda geral, ou vermelho se não houver
    const mainThemeColor = giftsData.length > 0 ? (THEMES[giftsData[0].category.toUpperCase() as GiftCategory]?.primary || THEMES.SONHO.primary) : THEMES.SONHO.primary;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = mainThemeColor;
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    let currentY = 120;

    // Cabeçalho - Igreja e Logo
    if (churchName) {
      ctx.fillStyle = mainThemeColor;
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
         ctx.fillStyle = mainThemeColor;
         ctx.font = 'bold 36px Arial';
         ctx.textAlign = 'center';
         ctx.fillText(settings.hymnHeaderText || 'IGREJA CRISTÃ MARANATA', width / 2, currentY);
         currentY += 80;
       }
    } else {
      ctx.fillStyle = mainThemeColor;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(settings.hymnHeaderText || 'IGREJA CRISTÃ MARANATA', width / 2, currentY);
      currentY += 80;
    }

    // Título Principal
    ctx.fillStyle = mainThemeColor;
    ctx.font = '900 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('REGISTRO DE DONS', width / 2, currentY);
    currentY += 40;

    ctx.strokeStyle = mainThemeColor;
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

    // Desenha cada bloco individualmente
    giftsData.forEach(gift => {
        const catUpper = gift.category.toUpperCase() as GiftCategory;
        const blockThemeColor = THEMES[catUpper]?.primary || THEMES.SONHO.primary;
        
        ctx.fillStyle = blockThemeColor;
        ctx.font = '900 48px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`► ${gift.category.toUpperCase()}`, sideMargin, currentY);
        currentY += 60;

        ctx.fillStyle = '#0f172a';
        ctx.font = `${finalFontSize}px Arial`;
        ctx.textAlign = 'left';
        currentY = wrapText(ctx, gift.text, sideMargin, currentY, maxTextWidth, lineHeight, isJustified, true);
        currentY += 80; // Margem espaçosa após cada dom
    });

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
    link.download = `registro-dons.png`;
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
      const file = new File([blob], `registro-dons.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Registro de Dons' });
      } else {
        alert("O compartilhamento direto não é suportado no seu dispositivo. Use o botão Baixar.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao compartilhar.");
    }
  });
}

export {};