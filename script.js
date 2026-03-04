/* ========================================
   LET ME ASK AI FOR YOU — script.js
   ======================================== */

const homeView     = document.getElementById('home-view');
const playbackView = document.getElementById('playback-view');

const queryInput   = document.getElementById('query-input');
const generateBtn  = document.getElementById('generate-btn');
const resultPanel  = document.getElementById('result-panel');
const resultUrl    = document.getElementById('result-url');
const copyBtn      = document.getElementById('copy-btn');
const copyIcon     = document.getElementById('copy-icon');
const checkIcon    = document.getElementById('check-icon');
const copyLabel    = document.getElementById('copy-label');
const previewBtn   = document.getElementById('preview-btn');
const shareBtn     = document.getElementById('share-btn');

// Show share button only if Web Share API is available
if (navigator.share) shareBtn.style.display = 'flex';

/* ==============================
   ROUTING — decide which view
   ============================== */
function init() {
  const params = new URLSearchParams(window.location.search);
  const query  = params.get('q');

  if (query && query.trim()) {
    showPlayback(query.trim());
  } else {
    showHome();
  }
}

function showHome() {
  homeView.classList.remove('hidden');
  playbackView.classList.add('hidden');
}

function showPlayback(query) {
  homeView.classList.add('hidden');
  playbackView.classList.remove('hidden');
  runAnimation(query);
}

/* ==============================
   HOME — GENERATE LINK
   ============================== */
generateBtn.addEventListener('click', generateLink);
queryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateLink();
});

function generateLink() {
  const query = queryInput.value.trim();
  if (!query) {
    shake(queryInput.closest('.input-group'));
    return;
  }

  const url = buildUrl(query);
  resultUrl.textContent = url;

  resultPanel.classList.remove('hidden');

  // Wire up preview
  previewBtn.onclick = () => {
    window.location.href = url;
  };

  // Wire up share
  shareBtn.onclick = async () => {
    try {
      await navigator.share({ title: 'Let me ask AI for you', url });
    } catch (_) { /* user cancelled */ }
  };
}

function buildUrl(query) {
  const base = window.location.origin + window.location.pathname;
  return `${base}?q=${encodeURIComponent(query)}`;
}

/* ==============================
   COPY TO CLIPBOARD
   ============================== */
copyBtn.addEventListener('click', async () => {
  const url = resultUrl.textContent;
  try {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  } catch (_) {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }
});

function setCopied(copied) {
  if (copied) {
    copyIcon.classList.add('hidden');
    checkIcon.classList.remove('hidden');
    copyLabel.textContent = 'Copied!';
    copyBtn.classList.add('copied');
  } else {
    copyIcon.classList.remove('hidden');
    checkIcon.classList.add('hidden');
    copyLabel.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }
}

/* ==============================
   SHAKE ANIMATION (validation)
   ============================== */
function shake(el) {
  el.style.animation = 'none';
  el.style.transform = 'translateX(0)';

  const frames = [
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-3px)' },
    { transform: 'translateX(0)' },
  ];
  el.animate(frames, { duration: 400, easing: 'ease-out' });
}

/* ==============================
   PLAYBACK ANIMATION
   ============================== */
const typedText   = document.getElementById('typed-text');
const fakeCursor  = document.getElementById('fake-cursor');
const fakeSendBtn = document.getElementById('fake-send-btn');
const snarkOverlay   = document.getElementById('snark-overlay');
const snarkProgressBar = document.getElementById('snark-progress-bar');
const goNowBtn    = document.getElementById('go-now-btn');
const chatMessages = document.getElementById('chatgpt-messages');

function runAnimation(query) {
  // Delay before starting
  setTimeout(() => startTyping(query), 800);
}

function startTyping(query) {
  // Hide empty state
  const emptyState = document.querySelector('.chatgpt-empty-state');
  if (emptyState) emptyState.style.display = 'none';

  const chars = query.split('');
  let i = 0;

  // Vary typing speed for realism
  function typeNext() {
    if (i < chars.length) {
      typedText.textContent += chars[i];
      i++;
      const delay = 40 + Math.random() * 60;
      setTimeout(typeNext, delay);
    } else {
      // Done typing
      onTypingDone(query);
    }
  }

  typeNext();
}

function onTypingDone(query) {
  // Activate send button
  fakeSendBtn.classList.add('ready');
  fakeSendBtn.disabled = false;

  setTimeout(() => {
    sendMessage(query);
  }, 800);
}

function sendMessage(query) {
  // Clear input area
  typedText.textContent = '';
  fakeSendBtn.classList.remove('ready');
  fakeSendBtn.disabled = true;
  fakeCursor.style.display = 'none';

  // Add user message bubble
  const userMsg = createBubble('user', query);
  chatMessages.innerHTML = '';
  chatMessages.style.justifyContent = 'flex-start';
  chatMessages.style.alignItems     = 'flex-start';
  chatMessages.style.paddingTop     = '16px';
  chatMessages.appendChild(userMsg);

  // Show typing indicator
  setTimeout(() => {
    const typingMsg = createTypingIndicator();
    chatMessages.appendChild(typingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Replace with AI response
    setTimeout(() => {
      chatMessages.removeChild(typingMsg);
      const aiMsg = createBubble('ai', "I'd be happy to help with that! " + getAIResponse(query));
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Show snark overlay after a beat
      setTimeout(() => showSnarkOverlay(query), 1200);
    }, 1800);
  }, 600);
}

function createBubble(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `chat-msg ${role}-msg`;

  const avatar = document.createElement('div');
  avatar.className = `chat-avatar ${role}-avatar`;
  avatar.textContent = role === 'user' ? '👤' : '';
  if (role === 'ai') {
    avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.259-2.325 10.078 10.078 0 0 0-9.604 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.259 2.325 10.078 10.078 0 0 0 9.604-6.978 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.239-11.817Z" fill="currentColor"/></svg>`;
  }

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  return wrap;
}

function createTypingIndicator() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg ai-msg';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar ai-avatar';
  avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.259-2.325 10.078 10.078 0 0 0-9.604 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.259 2.325 10.078 10.078 0 0 0 9.604-6.978 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.239-11.817Z" fill="currentColor"/></svg>`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  return wrap;
}

function getAIResponse(query) {
  // Generic helpful-sounding placeholder responses
  const responses = [
    "Here's a clear breakdown of everything you need to know about this topic.",
    "Great question! Let me walk you through a complete answer.",
    "This is actually a common question. Here's a thorough explanation.",
    "Sure thing! I'll explain this step by step for you.",
    "Happy to help! Here's what you need to know.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/* ==============================
   SNARK OVERLAY + REDIRECT
   ============================== */
const snarkBody         = document.getElementById('snark-body');
const snarkQueryPreview = document.getElementById('snark-query-preview');

async function showSnarkOverlay(query) {
  // Try to copy query to clipboard before showing overlay
  let copied = false;
  try {
    await navigator.clipboard.writeText(query);
    copied = true;
  } catch (_) {
    // Clipboard may be unavailable (e.g. non-secure context) — gracefully degrade
  }

  // Update overlay text based on clipboard success
  if (copied) {
    snarkBody.innerHTML = 'Your question has been copied to your clipboard.<br/>Opening ChatGPT — just paste it in.';
  } else {
    snarkBody.innerHTML = 'Opening ChatGPT in a new tab.<br/>Copy the question below and paste it in.';
  }

  // Show query preview so they can copy it manually if needed
  snarkQueryPreview.textContent = query;

  snarkOverlay.classList.remove('hidden');

  const DURATION = 5000; // ms
  const INTERVAL = 50;
  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += INTERVAL;
    const pct = Math.min((elapsed / DURATION) * 100, 100);
    snarkProgressBar.style.width = pct + '%';

    if (elapsed >= DURATION) {
      clearInterval(timer);
      redirectToChatGPT(query);
    }
  }, INTERVAL);

  goNowBtn.addEventListener('click', () => {
    clearInterval(timer);
    redirectToChatGPT(query);
  }, { once: true });
}

function redirectToChatGPT(query) {
  // ChatGPT doesn't support pre-filling via URL params, so we open the base
  // URL in a new tab. The query is already on the clipboard for easy pasting.
  window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
}

/* ==============================
   BOOT
   ============================== */
init();
