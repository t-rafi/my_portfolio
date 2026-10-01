const SYSTEM_PROMPT = `You are an expert career coach specializing in software engineering roles.
Write a tailored, confident cover letter for the candidate below.
Rules:
- 3 paragraphs only: (1) why this role, (2) specific relevant experience, (3) closing
- No generic filler like "I am excited to apply"
- Never start a sentence with "I"
- Reference specific technologies from the job description
- Tone: professional but human, not robotic
- No date, address, or "Dear Hiring Manager" header — body only
- Max 250 words`;

const CANDIDATE_INFO = `Candidate information:
Name: Jaki Towhidul Islam (Rafi)
Title: CSE Student | Software Developer | ERP & .NET
Location: Dhaka, Bangladesh
Skills: C, C++, C#, JavaScript, ASP.NET Core, .NET 8, MVC, Razor Pages, REST APIs, EF Core, SQL Server, RDLC, HTML, CSS, Bootstrap, IIS, Git, GitHub
Summary: CSE student and working software developer focused on ERP applications, RDLC reporting, business requirements, documentation, and client support.
Experience: Junior Executive, Software Development at iTech Velocity (full-time since Dec 14, 2025; 30+ RDLC reports, ERP customization and client support); Web Development Intern at Pinovation Tech Ltd. (Aug 2025 - Present; 30+ responsive interfaces). Expected CSE graduation: 2029.`;
const API_KEY_STORAGE = 'gemini_api_key';

export function initCoverLetterTool() {
  const form = document.querySelector('.cover-letter-form');
  if (!form) return;
  const keyInput = document.getElementById('gemini-api-key');
  const keyToggle = form.querySelector('.cover-letter-key-toggle');
  const keyFields = form.querySelector('.cover-letter-key-fields');
  const visibilityToggle = form.querySelector('.cover-letter-key-visibility');
  const jobInput = document.getElementById('job-description');
  const counter = form.querySelector('.cover-letter-char-count');
  const submitButton = form.querySelector('.cover-letter-generate');
  const submitLabel = form.querySelector('.cover-letter-generate-label');
  const errorAlert = form.querySelector('.cover-letter-error');
  const dismissError = form.querySelector('.cover-letter-error-dismiss');
  const outputEmpty = document.querySelector('.cover-letter-output-empty');
  const outputCard = document.querySelector('.cover-letter-output-card');
  const output = document.getElementById('cover-letter-output');
  const copyButton = document.querySelector('.cover-letter-copy');
  const downloadButton = document.querySelector('.cover-letter-download');

  try { keyInput.value = sessionStorage.getItem(API_KEY_STORAGE) || ''; } catch (_) {}
  const updateCounter = () => { counter.textContent = `${jobInput.value.length.toLocaleString()} chars`; };
  updateCounter();
  jobInput.addEventListener('input', updateCounter);
  keyInput.addEventListener('input', () => { try { keyInput.value.trim() ? sessionStorage.setItem(API_KEY_STORAGE, keyInput.value.trim()) : sessionStorage.removeItem(API_KEY_STORAGE); } catch (_) {} });
  keyToggle.addEventListener('click', () => { const opening = keyFields.hidden; keyFields.hidden = !opening; keyToggle.setAttribute('aria-expanded', String(opening)); if (opening) keyInput.focus(); });
  visibilityToggle.addEventListener('click', () => { const visible = keyInput.type === 'text'; keyInput.type = visible ? 'password' : 'text'; visibilityToggle.textContent = visible ? 'Show' : 'Hide'; visibilityToggle.setAttribute('aria-label', visible ? 'Show API key' : 'Hide API key'); visibilityToggle.setAttribute('aria-pressed', String(!visible)); });
  const showError = () => { errorAlert.hidden = false; };
  const clearError = () => { errorAlert.hidden = true; };
  dismissError.addEventListener('click', clearError);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const apiKey = keyInput.value.trim();
    const jobDescription = jobInput.value.trim();
    clearError();
    if (!apiKey || !jobDescription) { showError(); return; }
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    submitLabel.textContent = 'Generating...';
    try {
      const fullPrompt = `${SYSTEM_PROMPT}\n\n${CANDIDATE_INFO}\n\nJob description:\n${jobDescription}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });
      const data = await response.json().catch(() => ({}));
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!response.ok || !result) throw new Error(data.error?.message || 'Generation failed.');
      output.textContent = result.trim();
      outputEmpty.hidden = true;
      outputCard.hidden = false;
    } catch (_) { showError();
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
      submitLabel.textContent = 'Generate Cover Letter';
    }
  });
  copyButton.addEventListener('click', async () => {
    if (!output.textContent) return;
    const originalLabel = copyButton.textContent;
    try { await navigator.clipboard.writeText(output.textContent); } catch (_) { const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents(output); selection.removeAllRanges(); selection.addRange(range); document.execCommand('copy'); selection.removeAllRanges(); }
    copyButton.textContent = 'Copied!'; window.setTimeout(() => { copyButton.textContent = originalLabel; }, 1500);
  });
  downloadButton.addEventListener('click', () => {
    if (!output.textContent) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([output.textContent], { type: 'text/plain;charset=utf-8' }));
    link.download = 'Cover-Letter-Rafi.txt'; link.click(); URL.revokeObjectURL(link.href);
  });
}
