import { sendMessageToGemini, LiveSessionManager } from './services/geminiService';

// Tabs elements
const tabChat = document.getElementById('tab-chat') as HTMLButtonElement;
const tabVoice = document.getElementById('tab-voice') as HTMLButtonElement;
const viewChat = document.getElementById('view-chat') as HTMLDivElement;
const viewVoice = document.getElementById('view-voice') as HTMLDivElement;

// Chat elements
const formChat = document.getElementById('form-chat') as HTMLFormElement;
const inputMsg = document.getElementById('input-msg') as HTMLInputElement;
const chatMessages = document.getElementById('chat-messages') as HTMLDivElement;

// Voice elements
const btnVoiceToggle = document.getElementById('btn-voice-toggle') as HTMLButtonElement;
const voiceRipple1 = document.getElementById('voice-ripple-1') as HTMLDivElement;
const voiceRipple2 = document.getElementById('voice-ripple-2') as HTMLDivElement;
const voiceStatus = document.getElementById('voice-status') as HTMLParagraphElement;

// State variables
let activeTab: 'chat' | 'voice' = 'chat';
let isVoiceConnected = false;
let liveSession: LiveSessionManager | null = null;

// Tab switcher handler
function switchTab(tab: 'chat' | 'voice') {
  activeTab = tab;
  if (tab === 'chat') {
    tabChat.className = "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all bg-white text-slate-800 shadow-sm";
    tabVoice.className = "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all text-slate-500 hover:text-slate-800";
    viewChat.classList.remove('hidden');
    viewVoice.classList.add('hidden');
    // Stop voice if connected
    if (isVoiceConnected) {
      toggleVoiceSession();
    }
  } else {
    tabChat.className = "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all text-slate-500 hover:text-slate-800";
    tabVoice.className = "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all bg-white text-slate-800 shadow-sm";
    viewChat.classList.add('hidden');
    viewVoice.classList.remove('hidden');
  }
}

tabChat.addEventListener('click', () => switchTab('chat'));
tabVoice.addEventListener('click', () => switchTab('voice'));

// Text Chat Logic
function appendMessage(sender: 'user' | 'ai', text: string) {
  if (!chatMessages) return;

  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.className = `flex items-start gap-3 ${sender === 'user' ? 'justify-end' : ''}`;

  let iconHtml = '';
  if (sender === 'ai') {
    iconHtml = `
      <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[#8f1919] shrink-0 mt-1">
        <i class="fas fa-robot text-sm"></i>
      </div>
    `;
  }

  const bubble = document.createElement('div');
  if (sender === 'ai') {
    bubble.className = "bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]";
    bubble.innerHTML = `<p class="text-sm text-slate-700 whitespace-pre-wrap">${text}</p>`;
  } else {
    bubble.className = "bg-[#8f1919] text-white p-3.5 rounded-2xl rounded-tr-none shadow-md max-w-[80%]";
    bubble.innerHTML = `<p class="text-sm">${text}</p>`;
  }

  if (sender === 'ai') {
    bubbleWrapper.appendChild(bubble);
    // Insert icon beforehand for AI
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = iconHtml;
    const iconEl = tempDiv.firstElementChild;
    if (iconEl) bubbleWrapper.insertBefore(iconEl, bubble);
  } else {
    bubbleWrapper.appendChild(bubble);
  }

  chatMessages.appendChild(bubbleWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Typing feedback wrapper
function appendThinking(): HTMLDivElement {
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.className = 'flex items-start gap-3 thinking-bubble';

  const icon = document.createElement('div');
  icon.className = "w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[#8f1919] shrink-0 mt-1";
  icon.innerHTML = '<i class="fas fa-robot text-sm"></i>';

  const bubble = document.createElement('div');
  bubble.className = "bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]";
  bubble.innerHTML = `
    <div class="flex gap-1 items-center py-1.5 px-2">
      <div class="w-2 h-2 bg-red-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
      <div class="w-2 h-2 bg-red-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
      <div class="w-2 h-2 bg-red-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
    </div>
  `;

  bubbleWrapper.appendChild(icon);
  bubbleWrapper.appendChild(bubble);
  chatMessages.appendChild(bubbleWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return bubbleWrapper;
}

if (formChat) {
  formChat.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputMsg.value.trim();
    if (!text) return;

    inputMsg.value = '';
    appendMessage('user', text);

    const thinking = appendThinking();

    try {
      const response = await sendMessageToGemini(text);
      thinking.remove();
      appendMessage('ai', response.text);
    } catch (err: any) {
      thinking.remove();
      appendMessage('ai', "Desculpe, ocorreu uma falha de conexão. Por favor, verifique sua API_KEY ou tente novamente.");
    }
  });
}

// Live Voice Logic
function toggleVoiceSession() {
  if (isVoiceConnected) {
    // Disconnect
    isVoiceConnected = false;
    if (liveSession) {
      liveSession.disconnect();
      liveSession = null;
    }
    voiceStatus.innerText = "Sessão finalizada. Toque para reconectar.";
    btnVoiceToggle.className = "w-20 h-20 bg-[#8f1919] text-white rounded-full flex items-center justify-center text-3xl shadow-xl hover:bg-red-800 transition-all z-10 active:scale-95";
    voiceRipple1.classList.add('hidden');
    voiceRipple2.classList.add('hidden');
  } else {
    // Connect
    isVoiceConnected = true;
    voiceStatus.innerText = "Conectando ao assistente...";
    btnVoiceToggle.className = "w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl shadow-xl hover:bg-green-700 transition-all z-10 active:scale-95 animate-pulse";

    // Setup voice session
    liveSession = new LiveSessionManager(
      // Volume callback
      (volume: number) => {
        const scale1 = 1 + volume * 1.5;
        const scale2 = 1 + volume * 3.0;
        voiceRipple1.style.transform = `scale(${scale1})`;
        voiceRipple2.style.transform = `scale(${scale2})`;
        
        if (volume > 0.05) {
          voiceRipple1.classList.remove('hidden');
          voiceRipple2.classList.remove('hidden');
        } else {
          voiceRipple1.classList.add('hidden');
          voiceRipple2.classList.add('hidden');
        }
      },
      // Close/Disconnect callback
      () => {
        if (isVoiceConnected) {
          toggleVoiceSession();
        }
      }
    );

    liveSession.connect()
      .then(() => {
        voiceStatus.innerText = "Assistente ativo. Pode falar!";
        btnVoiceToggle.classList.remove('animate-pulse');
      })
      .catch(err => {
        console.error(err);
        alert("Falha ao abrir microfone ou conectar com o assistente do Gemini.");
        isVoiceConnected = false;
        btnVoiceToggle.className = "w-20 h-20 bg-[#8f1919] text-white rounded-full flex items-center justify-center text-3xl shadow-xl hover:bg-red-800 transition-all z-10 active:scale-95";
        voiceStatus.innerText = "Erro ao conectar. Toque para tentar novamente.";
      });
  }
}

if (btnVoiceToggle) {
  btnVoiceToggle.addEventListener('click', toggleVoiceSession);
}

export {};
