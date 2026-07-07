import { getSettings, saveSettings } from './utils/settingsHelper';

// Auxiliary helper to convert File to Base64 (raw string)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const parts = reader.result.split(',');
        resolve(parts[1] || '');
      } else {
        reject(new Error("Falha na leitura do arquivo"));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

const settings = getSettings();

// DOM elements
const logoPreview = document.getElementById('logo-preview') as HTMLImageElement;
const btnUploadLogo = document.getElementById('btn-upload-logo') as HTMLButtonElement;
const inputLogo = document.getElementById('input-logo') as HTMLInputElement;

const btnHeaderText = document.getElementById('btn-header-text') as HTMLButtonElement;
const btnHeaderImage = document.getElementById('btn-header-image') as HTMLButtonElement;
const containerHeaderText = document.getElementById('container-header-text') as HTMLDivElement;
const containerHeaderImage = document.getElementById('container-header-image') as HTMLDivElement;
const inputHeaderText = document.getElementById('input-header-text') as HTMLInputElement;
const headerImagePreview = document.getElementById('header-image-preview') as HTMLImageElement;
const btnUploadHeader = document.getElementById('btn-upload-header') as HTMLButtonElement;
const inputHeader = document.getElementById('input-header') as HTMLInputElement;

const inputIconHymns = document.getElementById('input-icon-hymns') as HTMLInputElement;
const inputIconGifts = document.getElementById('input-icon-gifts') as HTMLInputElement;
const inputIconOther = document.getElementById('input-icon-other') as HTMLInputElement;
const inputIconSupport = document.getElementById('input-icon-support') as HTMLInputElement;

const iconPreviewHymns = document.getElementById('icon-preview-hymns') as HTMLElement;
const iconPreviewGifts = document.getElementById('icon-preview-gifts') as HTMLElement;
const iconPreviewOther = document.getElementById('icon-preview-other') as HTMLElement;
const iconPreviewSupport = document.getElementById('icon-preview-support') as HTMLElement;

const btnResetSettings = document.getElementById('btn-reset-settings') as HTMLButtonElement;

// Apply initial state
function applySettingsUI() {
  if (logoPreview) logoPreview.src = settings.logo;
  
  if (settings.hymnHeaderType === 'text') {
    selectHeaderType('text');
  } else {
    selectHeaderType('image');
  }

  if (inputHeaderText) inputHeaderText.value = settings.hymnHeaderText;
  if (headerImagePreview && settings.hymnHeaderImage) {
    headerImagePreview.src = settings.hymnHeaderImage;
    headerImagePreview.classList.remove('hidden');
  }

  if (inputIconHymns) inputIconHymns.value = settings.icons.hymns;
  if (inputIconGifts) inputIconGifts.value = settings.icons.gifts;
  if (inputIconOther) inputIconOther.value = settings.icons.other;
  if (inputIconSupport) inputIconSupport.value = settings.icons.support;

  updateIconPreviews();
}

function updateIconPreviews() {
  if (iconPreviewHymns) iconPreviewHymns.className = `fas ${settings.icons.hymns}`;
  if (iconPreviewGifts) iconPreviewGifts.className = `fas ${settings.icons.gifts}`;
  if (iconPreviewOther) iconPreviewOther.className = `fas ${settings.icons.other}`;
  if (iconPreviewSupport) iconPreviewSupport.className = `fas ${settings.icons.support}`;
}

function selectHeaderType(type: 'text' | 'image') {
  settings.hymnHeaderType = type;
  saveSettings(settings);

  if (type === 'text') {
    btnHeaderText.className = 'flex-1 py-2 rounded-lg font-bold text-xs bg-[#8f1919] text-white';
    btnHeaderImage.className = 'flex-1 py-2 rounded-lg font-bold text-xs bg-red-50 text-red-400';
    containerHeaderText.classList.remove('hidden');
    containerHeaderImage.classList.add('hidden');
  } else {
    btnHeaderText.className = 'flex-1 py-2 rounded-lg font-bold text-xs bg-red-50 text-red-400';
    btnHeaderImage.className = 'flex-1 py-2 rounded-lg font-bold text-xs bg-[#8f1919] text-white';
    containerHeaderText.classList.add('hidden');
    containerHeaderImage.classList.remove('hidden');
  }
}

// Event Listeners
if (btnUploadLogo && inputLogo) {
  btnUploadLogo.addEventListener('click', () => inputLogo.click());
  inputLogo.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      settings.logo = `data:image/png;base64,${base64}`;
      saveSettings(settings);
      if (logoPreview) logoPreview.src = settings.logo;
    }
  });
}

if (btnHeaderText) {
  btnHeaderText.addEventListener('click', () => selectHeaderType('text'));
}
if (btnHeaderImage) {
  btnHeaderImage.addEventListener('click', () => selectHeaderType('image'));
}

if (inputHeaderText) {
  inputHeaderText.addEventListener('input', () => {
    settings.hymnHeaderText = inputHeaderText.value.toUpperCase();
    saveSettings(settings);
  });
}

if (btnUploadHeader && inputHeader) {
  btnUploadHeader.addEventListener('click', () => inputHeader.click());
  inputHeader.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      settings.hymnHeaderImage = `data:image/png;base64,${base64}`;
      saveSettings(settings);
      if (headerImagePreview) {
        headerImagePreview.src = settings.hymnHeaderImage;
        headerImagePreview.classList.remove('hidden');
      }
    }
  });
}

const iconInputs = [
  { input: inputIconHymns, key: 'hymns' as const },
  { input: inputIconGifts, key: 'gifts' as const },
  { input: inputIconOther, key: 'other' as const },
  { input: inputIconSupport, key: 'support' as const }
];

iconInputs.forEach(({ input, key }) => {
  if (input) {
    input.addEventListener('input', () => {
      settings.icons[key] = input.value;
      saveSettings(settings);
      updateIconPreviews();
    });
  }
});

if (btnResetSettings) {
  btnResetSettings.addEventListener('click', () => {
    if (confirm("Resetar para padrões?")) {
      localStorage.removeItem('APP_SETTINGS');
      window.location.reload();
    }
  });
}

// Initial boot
applySettingsUI();
export {};
