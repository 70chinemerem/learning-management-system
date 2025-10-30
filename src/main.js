// Minimal client-side utilities: theme toggle, toasts, and auth form helpers.

function getEl(id) { return document.getElementById(id); }

// Theme toggle with localStorage persistence
const themeKey = 'ui.theme';
function setTheme(next) {
    try { localStorage.setItem(themeKey, next); } catch { }
    document.documentElement.classList.toggle('dark', next === 'dark');
}
function initTheme() {
    let t; try { t = localStorage.getItem(themeKey); } catch { }
    if (!t) {
        t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setTheme(t);
    const btn = getEl('themeToggle');
    if (btn) {
        btn.textContent = document.documentElement.classList.contains('dark') ? 'Light' : 'Dark';
        btn.addEventListener('click', () => {
            const currentlyDark = document.documentElement.classList.contains('dark');
            const next = currentlyDark ? 'light' : 'dark';
            setTheme(next);
            btn.textContent = next === 'dark' ? 'Light' : 'Dark';
        });
    }
}

// Toasts
function toast(message, type = 'info') {
    const root = getEl('toast-root');
    if (!root) return;
    const div = document.createElement('div');
    div.className = `px-3 py-2 rounded shadow text-sm ${type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`;
    div.textContent = message;
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    root.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Validation helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bindSignin() {
    const form = getEl('signinForm');
    if (!form) return;
    const email = getEl('email');
    const emailError = getEl('emailError');
    const password = getEl('password');
    const passwordError = getEl('passwordError');
    const toggle = getEl('togglePassword');
    const remember = getEl('rememberMe');
    const submit = getEl('signinSubmit');

    // Prefill remember me
    try {
        const savedEmail = localStorage.getItem('auth.rememberEmail');
        if (savedEmail) { email.value = savedEmail; remember.checked = true; }
    } catch { }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isPw = password.type === 'password';
            password.type = isPw ? 'text' : 'password';
            toggle.textContent = isPw ? 'Hide' : 'Show';
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        if (!emailRegex.test(email.value)) { emailError.classList.remove('hidden'); ok = false; } else { emailError.classList.add('hidden'); }
        if (!password.value) { passwordError.classList.remove('hidden'); ok = false; } else { passwordError.classList.add('hidden'); }
        if (!ok) { toast('Please fix the errors', 'error'); return; }
        submit.disabled = true; submit.classList.add('opacity-60');
        try { remember.checked ? localStorage.setItem('auth.rememberEmail', email.value) : localStorage.removeItem('auth.rememberEmail'); } catch { }
        setTimeout(() => { toast('Signed in successfully'); submit.disabled = false; submit.classList.remove('opacity-60'); }, 800);
    });
}

function bindSignup() {
    const form = getEl('signupForm');
    if (!form) return;
    const name = getEl('fullName');
    const nameError = getEl('nameError');
    const email = getEl('email');
    const emailError = getEl('emailError');
    const password = getEl('password');
    const passwordError = getEl('passwordError');
    const confirm = getEl('confirm');
    const confirmError = getEl('confirmError');
    const strength = getEl('pwStrength');
    const toggle = getEl('togglePassword');
    const submit = getEl('signupSubmit');

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isPw = password.type === 'password';
            password.type = isPw ? 'text' : 'password';
            toggle.textContent = isPw ? 'Hide' : 'Show';
        });
    }

    password.addEventListener('input', () => {
        const v = password.value || '';
        const score = Math.min(1, (v.length >= 12 ? 1 : v.length / 12));
        strength.style.width = `${Math.max(0.1, score) * 100}%`;
        strength.className = 'h-1 rounded ' + (v.length >= 10 ? 'bg-green-500' : v.length >= 8 ? 'bg-yellow-500' : 'bg-red-500');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        if (!name.value.trim()) { nameError.classList.remove('hidden'); ok = false; } else { nameError.classList.add('hidden'); }
        if (!emailRegex.test(email.value)) { emailError.classList.remove('hidden'); ok = false; } else { emailError.classList.add('hidden'); }
        if ((password.value || '').length < 8) { passwordError.classList.remove('hidden'); ok = false; } else { passwordError.classList.add('hidden'); }
        if (confirm.value !== password.value) { confirmError.classList.remove('hidden'); ok = false; } else { confirmError.classList.add('hidden'); }
        if (!ok) { toast('Please fix the errors', 'error'); return; }
        submit.disabled = true; submit.classList.add('opacity-60');
        setTimeout(() => { toast('Account created'); submit.disabled = false; submit.classList.remove('opacity-60'); }, 800);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    bindSignin();
    bindSignup();
    // Social buttons placeholder
    document.querySelectorAll('.socialBtn').forEach(btn => {
        btn.addEventListener('click', () => toast('Social sign-in not configured', 'info'));
    });
});
