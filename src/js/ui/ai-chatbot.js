const GEMINI_API_KEY = '[তোর_GEMINI_KEY_এখানে]';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a portfolio assistant representing Towhidul Islam Rafi, a CSE student and working software developer based in Dhaka, Bangladesh.

Answer recruiter and visitor questions about Rafi confidently and concisely (2-4 sentences max).

About Rafi:

- Role: Junior Executive, Software Development at iTech Velocity (full-time since Dec 14, 2025)
- Web Development Intern at Pinovation Tech Ltd. (Aug 2025 - Present)
- Skills: C, C++, C#, JavaScript, ASP.NET Core, .NET 8, MVC, Razor Pages, REST APIs, EF Core, SQL Server, RDLC, HTML, CSS, Bootstrap, IIS, Git, and GitHub
- Built 30+ RDLC business reports for enterprise clients
- Built 30+ responsive web interfaces during the Pinovation internship
- Works on Clarra ERP with reporting, customization, requirements, documentation, and client support
- Education: B.Sc. CSE at Presidency University of Bangladesh, expected graduation in 2029
- Email: tirafi29@gmail.com | GitHub: github.com/t-rafi | LinkedIn: linkedin.com/in/t-rafi
- Open to new opportunities

Rules:

- Be clear that you are a portfolio assistant if asked
- Keep answers short and professional
- If asked something unknown: "Rafi would be happy to discuss that -- reach him at tirafi29@gmail.com"
- Never make up skills or experience not listed above`;

const OPENING_MESSAGE = "Hi! I'm Rafi's portfolio assistant. Ask about his experience, skills, or projects. \u{1F44B}";
const FALLBACK_MESSAGE = 'Rafi would be happy to discuss that -- reach him at tirafi29@gmail.com';

const localReply = (question) => {
  const q = question.toLowerCase();
  if (/contact|email|reach|linkedin|github/.test(q)) return 'You can reach Rafi at tirafi29@gmail.com, find his work at github.com/t-rafi, or connect at linkedin.com/in/t-rafi/.';
  if (/education|degree|university|student|graduat/.test(q)) return 'Rafi is studying Computer Science & Engineering at Presidency University of Bangladesh, with expected graduation in 2029, while working full-time.';
  if (/pinovation|intern|frontend|interface/.test(q)) return 'Rafi has been a Web Development Intern at Pinovation Tech Ltd. since August 2025. He has built 30+ responsive interfaces using HTML, CSS, Bootstrap, and JavaScript.';
  if (/erp|clarra|business|client|report|rdlc/.test(q)) return 'At iTech Velocity, Rafi works on Clarra ERP customization, client requirements, documentation, and support. He has designed and customized 30+ RDLC business reports.';
  if (/skill|stack|tech|asp|net|language/.test(q)) return 'Rafi works with ASP.NET Core, C#, .NET 8, SQL Server, RDLC, HTML, CSS, Bootstrap, JavaScript, Git, and related ERP and reporting tools.';
  if (/work|opportunit|available/.test(q)) return 'Rafi is open to professional opportunities. Email him at tirafi29@gmail.com to discuss a role.';
  return FALLBACK_MESSAGE;
};

export function initAiChatbot() {
  if (window.__rafiAiChatbotInitialized) return;

  const trigger = document.getElementById('ai-chat-trigger');
  const panel = document.getElementById('ai-chat-panel');
  const closeButton = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const suggestions = document.getElementById('ai-chat-suggestions');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const sendButton = document.getElementById('ai-chat-send');
  const unreadBadge = document.getElementById('ai-chat-unread');

  if (!trigger || !panel || !closeButton || !messages || !suggestions || !form || !input || !sendButton || !unreadBadge) return;

  window.__rafiAiChatbotInitialized = true;

  let conversationHistory = [];
  let hasOpened = false;
  let isResponding = false;

  const getTimestamp = () => new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date());

  const isOpen = () => panel.classList.contains('is-open');

  const scrollMessagesToEnd = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  const setResponding = (responding) => {
    isResponding = responding;
    input.disabled = responding;
    sendButton.disabled = responding;
  };

  const appendMessage = (role, text, { typing = false } = {}) => {
    const message = document.createElement('article');
    message.className = `ai-chat-message is-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'ai-chat-bubble';

    if (typing) {
      bubble.innerHTML = '<span class="ai-chat-typing" aria-label="Rafi is typing"><span></span><span></span><span></span></span>';
      message.dataset.typing = 'true';
    } else {
      bubble.textContent = text;
    }

    const time = document.createElement('time');
    time.className = 'ai-chat-time';
    time.textContent = getTimestamp();

    message.append(bubble, time);
    messages.append(message);
    scrollMessagesToEnd();

    return message;
  };

  const showUnread = () => {
    unreadBadge.hidden = false;
  };

  const clearUnread = () => {
    unreadBadge.hidden = true;
  };

  const openChat = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    clearUnread();

    if (!hasOpened) {
      appendMessage('model', OPENING_MESSAGE);
      suggestions.hidden = false;
      hasOpened = true;
    }

    window.setTimeout(() => input.focus(), 80);
  };

  const closeChat = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const toggleChat = () => {
    isOpen() ? closeChat() : openChat();
  };

  const callGemini = async (question) => {
    if (GEMINI_API_KEY.startsWith('[')) return localReply(question);
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: conversationHistory
      })
    });

    const data = await response.json().catch(() => ({}));
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!response.ok || !reply) {
      throw new Error(data.error?.message || 'Gemini request failed.');
    }

    return reply;
  };

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || isResponding) return;

    appendMessage('user', question);
    suggestions.hidden = true;
    input.value = '';
    conversationHistory.push({ role: 'user', parts: [{ text: question }] });
    setResponding(true);

    const typingBubble = appendMessage('model', '', { typing: true });

    try {
      const reply = await callGemini(question);
      typingBubble.remove();
      appendMessage('model', reply);
      conversationHistory.push({ role: 'model', parts: [{ text: reply }] });

      if (!isOpen()) showUnread();
    } catch (_) {
      typingBubble.remove();
      appendMessage('model', FALLBACK_MESSAGE);

      if (!isOpen()) showUnread();
    } finally {
      setResponding(false);
      if (isOpen()) input.focus();
    }
  };

  trigger.addEventListener('click', toggleChat);
  closeButton.addEventListener('click', closeChat);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  suggestions.addEventListener('click', (event) => {
    const chip = event.target.closest('button');
    if (chip) sendMessage(chip.textContent || '');
  });
}
