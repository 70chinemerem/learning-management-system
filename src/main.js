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
    // Back to top button and header shadow
    (function () {
        const header = document.querySelector('header');
        const btn = document.createElement('button');
        btn.textContent = '↑ Top';
        btn.className = 'fixed bottom-4 right-4 px-3 py-2 text-sm rounded shadow bg-blue-600 text-white hidden';
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(btn);
        function onScroll() {
            const y = window.scrollY || document.documentElement.scrollTop;
            if (header) header.classList.toggle('shadow', y > 8);
            btn.classList.toggle('hidden', y < 200);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    })();
    // Mobile menu toggle (index page)
    (function () {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('mobileMenu');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', () => {
            const wasHidden = menu.classList.contains('hidden');
            menu.classList.toggle('hidden');
            const open = wasHidden;
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.textContent = open ? '✕' : '☰';
        });
    })();
    // Language selector + basic i18n (applies to all pages)
    (function () {
        const headerRow = document.querySelector('header .max-w-6xl');
        if (!headerRow) return;
        const select = document.createElement('select');
        select.id = 'langSelect';
        // Visible on mobile and desktop
        select.className = 'px-2 py-1 border rounded text-sm';
        const options = [['en', 'EN'], ['fr', 'FR'], ['es', 'ES'], ['de', 'DE'], ['pt', 'PT'], ['it', 'IT'], ['ar', 'AR'], ['zh', 'ZH'], ['hi', 'HI'], ['ja', 'JA']];
        const savedLang = (() => { try { return localStorage.getItem('ui.lang') || 'en'; } catch { return 'en'; } })();
        document.documentElement.setAttribute('lang', savedLang);
        document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');

        // Minimal dictionary for key UI strings
        const dict = {
            en: { 'nav.features': 'Features', 'nav.saved': 'Saved', 'nav.signin': 'Sign in', 'nav.signup': 'Sign up', 'hero.title': 'Learning Management System', 'hero.subtitle': 'Create, organize, and track courses with a clean, modern interface.', 'hero.getStarted': 'Get Started', 'hero.createAccount': 'Create account', 'hero.learnMore': 'Learn More', 'quick.signin': 'Sign in', 'quick.browse': 'Browse courses', 'quick.quiz': 'Take a quiz', 'quick.analytics': 'View analytics', 'testimonials.heading': 'What our users say', 'faq.heading': 'Frequently asked questions', 'signin.title': 'Sign in to your account', 'signin.helper': 'Welcome back. Please enter your details.', 'signin.submit': 'Sign In', 'signin.remember': 'Remember me', 'signin.forgot': 'Forgot password?', 'signup.title': 'Create your account', 'signup.helper': 'Join the Learning Management System today.', 'signup.submit': 'Create account' },
            fr: { 'nav.features': 'Fonctionnalités', 'nav.saved': 'Favoris', 'nav.signin': 'Se connecter', 'nav.signup': 'Créer un compte', 'hero.title': 'Plateforme de formation', 'hero.subtitle': 'Créez, organisez et suivez vos cours avec une interface moderne.', 'hero.getStarted': 'Commencer', 'hero.createAccount': 'Créer un compte', 'hero.learnMore': 'En savoir plus', 'quick.signin': 'Se connecter', 'quick.browse': 'Parcourir les cours', 'quick.quiz': 'Passer un quiz', 'quick.analytics': 'Voir les analyses', 'testimonials.heading': 'Ce que disent nos utilisateurs', 'faq.heading': 'Foire aux questions', 'signin.title': 'Connectez-vous à votre compte', 'signin.helper': 'Bon retour. Entrez vos identifiants.', 'signin.submit': 'Se connecter', 'signin.remember': 'Se souvenir de moi', 'signin.forgot': 'Mot de passe oublié ?', 'signup.title': 'Créez votre compte', 'signup.helper': 'Rejoignez la plateforme dès aujourd’hui.', 'signup.submit': 'Créer un compte' },
            es: { 'nav.features': 'Funciones', 'nav.saved': 'Guardados', 'nav.signin': 'Iniciar sesión', 'nav.signup': 'Crear cuenta', 'hero.title': 'Plataforma de aprendizaje', 'hero.subtitle': 'Crea, organiza y sigue cursos con una interfaz moderna.', 'hero.getStarted': 'Empezar', 'hero.createAccount': 'Crear cuenta', 'hero.learnMore': 'Saber más', 'quick.signin': 'Iniciar sesión', 'quick.browse': 'Explorar cursos', 'quick.quiz': 'Hacer un quiz', 'quick.analytics': 'Ver analíticas', 'testimonials.heading': 'Lo que dicen nuestros usuarios', 'faq.heading': 'Preguntas frecuentes', 'signin.title': 'Inicia sesión en tu cuenta', 'signin.helper': 'Bienvenido de nuevo. Ingresa tus datos.', 'signin.submit': 'Iniciar sesión', 'signin.remember': 'Recordarme', 'signin.forgot': '¿Olvidaste tu contraseña?', 'signup.title': 'Crea tu cuenta', 'signup.helper': 'Únete hoy a la plataforma.', 'signup.submit': 'Crear cuenta' },
            de: { 'nav.features': 'Funktionen', 'nav.saved': 'Gespeichert', 'nav.signin': 'Anmelden', 'nav.signup': 'Registrieren', 'hero.title': 'Lernplattform', 'hero.subtitle': 'Kurse erstellen, organisieren und nachverfolgen.', 'hero.getStarted': 'Loslegen', 'hero.createAccount': 'Konto erstellen', 'hero.learnMore': 'Mehr erfahren', 'quick.signin': 'Anmelden', 'quick.browse': 'Kurse durchsuchen', 'quick.quiz': 'Quiz machen', 'quick.analytics': 'Analysen ansehen', 'testimonials.heading': 'Das sagen unsere Nutzer', 'faq.heading': 'Häufige Fragen', 'signin.title': 'Anmeldung', 'signin.helper': 'Willkommen zurück. Bitte Daten eingeben.', 'signin.submit': 'Anmelden', 'signin.remember': 'Angemeldet bleiben', 'signin.forgot': 'Passwort vergessen?', 'signup.title': 'Konto erstellen', 'signup.helper': 'Treten Sie der Plattform bei.', 'signup.submit': 'Konto erstellen' },
            pt: { 'nav.features': 'Recursos', 'nav.saved': 'Salvos', 'nav.signin': 'Entrar', 'nav.signup': 'Criar conta', 'hero.title': 'Plataforma de aprendizagem', 'hero.subtitle': 'Crie, organize e acompanhe cursos com interface moderna.', 'hero.getStarted': 'Começar', 'hero.createAccount': 'Criar conta', 'hero.learnMore': 'Saiba mais', 'quick.signin': 'Entrar', 'quick.browse': 'Explorar cursos', 'quick.quiz': 'Fazer um quiz', 'quick.analytics': 'Ver análises', 'testimonials.heading': 'O que dizem os usuários', 'faq.heading': 'Perguntas frequentes', 'signin.title': 'Entre na sua conta', 'signin.helper': 'Bem-vindo de volta. Informe seus dados.', 'signin.submit': 'Entrar', 'signin.remember': 'Lembrar-me', 'signin.forgot': 'Esqueceu a senha?', 'signup.title': 'Crie sua conta', 'signup.helper': 'Junte-se hoje à plataforma.', 'signup.submit': 'Criar conta' }
        };
        function applyTranslations(lang) {
            const t = dict[lang] || dict.en;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key && t[key]) el.textContent = t[key];
            });
        }
        options.forEach(([value, label]) => {
            const opt = document.createElement('option');
            opt.value = value; opt.textContent = label; if (value === savedLang) opt.selected = true; select.appendChild(opt);
        });
        select.addEventListener('change', () => {
            const val = select.value || 'en';
            try { localStorage.setItem('ui.lang', val); } catch { }
            document.documentElement.setAttribute('lang', val);
            document.documentElement.setAttribute('dir', val === 'ar' ? 'rtl' : 'ltr');
            toast(`Language set to ${val.toUpperCase()}`);
            applyTranslations(val);
        });
        // Insert before the mobile toggle if present, else append
        const mobileBtn = document.getElementById('mobileMenuToggle');
        if (mobileBtn && mobileBtn.parentElement === headerRow) {
            headerRow.insertBefore(select, mobileBtn);
        } else {
            headerRow.appendChild(select);
        }
        // Initial apply
        applyTranslations(savedLang);
    })();
    // Announcement bar (dismissible)
    (function () {
        const key = 'ui.announce.dismissed.v1';
        let dismissed = false; try { dismissed = localStorage.getItem(key) === '1'; } catch { }
        if (dismissed) return;
        const header = document.querySelector('header');
        const bar = document.createElement('div');
        bar.setAttribute('role', 'status');
        bar.className = 'bg-blue-50 text-blue-900 text-sm';
        bar.innerHTML = '<div class="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">\
            <div>New: Analytics page with saved range + metrics — <a class="underline" href="analytics.html">check it out</a>.</div>\
            <button aria-label="Dismiss" class="px-2 py-1 text-blue-900/80 hover:text-blue-900">✕</button>\
        </div>';
        const closeBtn = bar.querySelector('button');
        closeBtn.addEventListener('click', () => { try { localStorage.setItem(key, '1'); } catch { }; bar.remove(); });
        if (header && header.parentElement) {
            header.parentElement.insertBefore(bar, header);
        } else {
            document.body.prepend(bar);
        }
    })();
    // Mark active nav links
    (function () {
        const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const links = document.querySelectorAll('nav a[href$=".html"]');
        links.forEach(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            const file = href.split('/').pop();
            const isIndex = (file === 'index.html' && (path === '' || path === 'index.html'));
            if (file === path || isIndex) {
                a.classList.add('text-blue-700', 'font-medium');
                a.setAttribute('aria-current', 'page');
            }
        });
    })();
});
