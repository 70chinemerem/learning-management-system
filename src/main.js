// Minimal client-side utilities: theme toggle, toasts, and auth form helpers.

function getEl(id) { return document.getElementById(id); }

// Initialize Lucide icons (handled by lucide-init.js)
// Keep this here for backwards compatibility but don't duplicate the logic

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
        // Extended language options with more languages
        const options = [
            ['en', 'English'], ['fr', 'Français'], ['es', 'Español'], ['de', 'Deutsch'], ['pt', 'Português'],
            ['it', 'Italiano'], ['ar', 'العربية'], ['zh', '中文'], ['hi', 'हिन्दी'], ['ja', '日本語'],
            ['ru', 'Русский'], ['ko', '한국어'], ['tr', 'Türkçe'], ['nl', 'Nederlands'], ['pl', 'Polski'],
            ['sv', 'Svenska'], ['no', 'Norsk'], ['fi', 'Suomi'], ['vi', 'Tiếng Việt'], ['th', 'ไทย']
        ];
        const savedLang = (() => { try { return localStorage.getItem('ui.lang') || 'en'; } catch { return 'en'; } })();
        document.documentElement.setAttribute('lang', savedLang);
        // RTL languages: Arabic and Hebrew (if added later)
        const rtlLanguages = ['ar', 'he'];
        document.documentElement.setAttribute('dir', rtlLanguages.includes(savedLang) ? 'rtl' : 'ltr');

        // Expanded dictionary for key UI strings across all pages
        const dict = {
            en: {
                'nav.features': 'Features', 'nav.saved': 'Saved', 'nav.signin': 'Sign in', 'nav.signup': 'Sign up',
                'nav.browse': 'Browse courses', 'nav.quiz': 'Take a quiz', 'nav.analytics': 'View analytics',
                'common.backHome': 'Back to home', 'common.submit': 'Submit', 'common.reset': 'Reset', 'common.apply': 'Apply now',
                'common.save': 'Save', 'common.preview': 'Preview', 'common.close': 'Close',
                'hero.title': 'Learning Management System', 'hero.subtitle': 'Create, organize, and track courses with a clean, modern interface.',
                'hero.getStarted': 'Get Started', 'hero.createAccount': 'Create account', 'hero.learnMore': 'Learn More',
                'quick.signin': 'Sign in', 'quick.browse': 'Browse courses', 'quick.quiz': 'Take a quiz', 'quick.analytics': 'View analytics',
                'testimonials.heading': 'What our users say', 'faq.heading': 'Frequently asked questions',
                'signin.title': 'Sign in to your account', 'signin.helper': 'Welcome back. Please enter your details.',
                'signin.submit': 'Sign In', 'signin.remember': 'Remember me', 'signin.forgot': 'Forgot password?',
                'signup.title': 'Create your account', 'signup.helper': 'Join the Learning Management System today.', 'signup.submit': 'Create account',
                'page.features': 'All features', 'page.courses': 'Browse our courses', 'page.quiz': 'Web Development Quiz',
                'page.analytics': 'Analytics overview', 'page.saved': 'Saved courses', 'page.about': 'About Us', 'page.careers': 'Join Our Team'
            },
            fr: {
                'nav.features': 'Fonctionnalités', 'nav.saved': 'Favoris', 'nav.signin': 'Se connecter', 'nav.signup': 'Créer un compte',
                'nav.browse': 'Parcourir les cours', 'nav.quiz': 'Passer un quiz', 'nav.analytics': 'Voir les analyses',
                'common.backHome': "Retour à l'accueil", 'common.submit': 'Soumettre', 'common.reset': 'Réinitialiser', 'common.apply': 'Postuler',
                'common.save': 'Enregistrer', 'common.preview': 'Aperçu', 'common.close': 'Fermer',
                'hero.title': 'Plateforme de formation', 'hero.subtitle': 'Créez, organisez et suivez vos cours avec une interface moderne.',
                'hero.getStarted': 'Commencer', 'hero.createAccount': 'Créer un compte', 'hero.learnMore': 'En savoir plus',
                'quick.signin': 'Se connecter', 'quick.browse': 'Parcourir les cours', 'quick.quiz': 'Passer un quiz', 'quick.analytics': 'Voir les analyses',
                'testimonials.heading': 'Ce que disent nos utilisateurs', 'faq.heading': 'Foire aux questions',
                'signin.title': 'Connectez-vous à votre compte', 'signin.helper': 'Bon retour. Entrez vos identifiants.',
                'signin.submit': 'Se connecter', 'signin.remember': 'Se souvenir de moi', 'signin.forgot': 'Mot de passe oublié ?',
                'signup.title': 'Créez votre compte', 'signup.helper': "Rejoignez la plateforme dès aujourd'hui.", 'signup.submit': 'Créer un compte',
                'page.features': 'Toutes les fonctionnalités', 'page.courses': 'Parcourir nos cours', 'page.quiz': 'Quiz Développement Web',
                'page.analytics': "Vue d'ensemble des analyses", 'page.saved': 'Cours enregistrés', 'page.about': 'À propos', 'page.careers': 'Rejoignez notre équipe'
            },
            es: {
                'nav.features': 'Funciones', 'nav.saved': 'Guardados', 'nav.signin': 'Iniciar sesión', 'nav.signup': 'Crear cuenta',
                'nav.browse': 'Explorar cursos', 'nav.quiz': 'Hacer un quiz', 'nav.analytics': 'Ver analíticas',
                'common.backHome': 'Volver al inicio', 'common.submit': 'Enviar', 'common.reset': 'Restablecer', 'common.apply': 'Aplicar ahora',
                'common.save': 'Guardar', 'common.preview': 'Vista previa', 'common.close': 'Cerrar',
                'hero.title': 'Plataforma de aprendizaje', 'hero.subtitle': 'Crea, organiza y sigue cursos con una interfaz moderna.',
                'hero.getStarted': 'Empezar', 'hero.createAccount': 'Crear cuenta', 'hero.learnMore': 'Saber más',
                'quick.signin': 'Iniciar sesión', 'quick.browse': 'Explorar cursos', 'quick.quiz': 'Hacer un quiz', 'quick.analytics': 'Ver analíticas',
                'testimonials.heading': 'Lo que dicen nuestros usuarios', 'faq.heading': 'Preguntas frecuentes',
                'signin.title': 'Inicia sesión en tu cuenta', 'signin.helper': 'Bienvenido de nuevo. Ingresa tus datos.',
                'signin.submit': 'Iniciar sesión', 'signin.remember': 'Recordarme', 'signin.forgot': '¿Olvidaste tu contraseña?',
                'signup.title': 'Crea tu cuenta', 'signup.helper': 'Únete hoy a la plataforma.', 'signup.submit': 'Crear cuenta',
                'page.features': 'Todas las funciones', 'page.courses': 'Explora nuestros cursos', 'page.quiz': 'Quiz de Desarrollo Web',
                'page.analytics': 'Resumen de analíticas', 'page.saved': 'Cursos guardados', 'page.about': 'Sobre nosotros', 'page.careers': 'Únete a nuestro equipo'
            },
            de: {
                'nav.features': 'Funktionen', 'nav.saved': 'Gespeichert', 'nav.signin': 'Anmelden', 'nav.signup': 'Registrieren',
                'nav.browse': 'Kurse durchsuchen', 'nav.quiz': 'Quiz machen', 'nav.analytics': 'Analysen ansehen',
                'common.backHome': 'Zurück zur Startseite', 'common.submit': 'Absenden', 'common.reset': 'Zurücksetzen', 'common.apply': 'Jetzt bewerben',
                'common.save': 'Speichern', 'common.preview': 'Vorschau', 'common.close': 'Schließen',
                'hero.title': 'Lernplattform', 'hero.subtitle': 'Kurse erstellen, organisieren und nachverfolgen.',
                'hero.getStarted': 'Loslegen', 'hero.createAccount': 'Konto erstellen', 'hero.learnMore': 'Mehr erfahren',
                'quick.signin': 'Anmelden', 'quick.browse': 'Kurse durchsuchen', 'quick.quiz': 'Quiz machen', 'quick.analytics': 'Analysen ansehen',
                'testimonials.heading': 'Das sagen unsere Nutzer', 'faq.heading': 'Häufige Fragen',
                'signin.title': 'Anmeldung', 'signin.helper': 'Willkommen zurück. Bitte Daten eingeben.',
                'signin.submit': 'Anmelden', 'signin.remember': 'Angemeldet bleiben', 'signin.forgot': 'Passwort vergessen?',
                'signup.title': 'Konto erstellen', 'signup.helper': 'Treten Sie der Plattform bei.', 'signup.submit': 'Konto erstellen',
                'page.features': 'Alle Funktionen', 'page.courses': 'Kurse durchsuchen', 'page.quiz': 'Webentwicklung-Quiz',
                'page.analytics': 'Analyse-Übersicht', 'page.saved': 'Gespeicherte Kurse', 'page.about': 'Über uns', 'page.careers': 'Unserem Team beitreten'
            },
            pt: {
                'nav.features': 'Recursos', 'nav.saved': 'Salvos', 'nav.signin': 'Entrar', 'nav.signup': 'Criar conta',
                'nav.browse': 'Explorar cursos', 'nav.quiz': 'Fazer um quiz', 'nav.analytics': 'Ver análises',
                'common.backHome': 'Voltar ao início', 'common.submit': 'Enviar', 'common.reset': 'Redefinir', 'common.apply': 'Candidatar-se',
                'common.save': 'Salvar', 'common.preview': 'Visualizar', 'common.close': 'Fechar',
                'hero.title': 'Plataforma de aprendizagem', 'hero.subtitle': 'Crie, organize e acompanhe cursos com interface moderna.',
                'hero.getStarted': 'Começar', 'hero.createAccount': 'Criar conta', 'hero.learnMore': 'Saiba mais',
                'quick.signin': 'Entrar', 'quick.browse': 'Explorar cursos', 'quick.quiz': 'Fazer um quiz', 'quick.analytics': 'Ver análises',
                'testimonials.heading': 'O que dizem os usuários', 'faq.heading': 'Perguntas frequentes',
                'signin.title': 'Entre na sua conta', 'signin.helper': 'Bem-vindo de volta. Informe seus dados.',
                'signin.submit': 'Entrar', 'signin.remember': 'Lembrar-me', 'signin.forgot': 'Esqueceu a senha?',
                'signup.title': 'Crie sua conta', 'signup.helper': 'Junte-se hoje à plataforma.', 'signup.submit': 'Criar conta',
                'page.features': 'Todos os recursos', 'page.courses': 'Explorar nossos cursos', 'page.quiz': 'Quiz de Desenvolvimento Web',
                'page.analytics': 'Visão geral de análises', 'page.saved': 'Cursos salvos', 'page.about': 'Sobre nós', 'page.careers': 'Junte-se à nossa equipe'
            },
            it: {
                'nav.features': 'Funzionalità', 'nav.saved': 'Salvati', 'nav.signin': 'Accedi', 'nav.signup': 'Registrati',
                'nav.browse': 'Sfoglia corsi', 'nav.quiz': 'Fai un quiz', 'nav.analytics': 'Visualizza analisi',
                'common.backHome': 'Torna alla home', 'common.submit': 'Invia', 'common.reset': 'Reimposta', 'common.apply': 'Candidati ora',
                'common.save': 'Salva', 'common.preview': 'Anteprima', 'common.close': 'Chiudi',
                'hero.title': 'Piattaforma di apprendimento', 'hero.subtitle': "Crea, organizza e monitora corsi con un'interfaccia moderna.",
                'hero.getStarted': 'Inizia', 'hero.createAccount': 'Crea account', 'hero.learnMore': 'Scopri di più',
                'quick.signin': 'Accedi', 'quick.browse': 'Sfoglia corsi', 'quick.quiz': 'Fai un quiz', 'quick.analytics': 'Visualizza analisi',
                'testimonials.heading': 'Cosa dicono i nostri utenti', 'faq.heading': 'Domande frequenti',
                'signin.title': 'Accedi al tuo account', 'signin.helper': 'Bentornato. Inserisci i tuoi dati.',
                'signin.submit': 'Accedi', 'signin.remember': 'Ricordami', 'signin.forgot': 'Password dimenticata?',
                'signup.title': 'Crea il tuo account', 'signup.helper': 'Unisciti alla piattaforma oggi.', 'signup.submit': 'Crea account',
                'page.features': 'Tutte le funzionalità', 'page.courses': 'Sfoglia i nostri corsi', 'page.quiz': 'Quiz Sviluppo Web',
                'page.analytics': 'Panoramica analisi', 'page.saved': 'Corsi salvati', 'page.about': 'Chi siamo', 'page.careers': 'Unisciti al nostro team'
            },
            ar: {
                'nav.features': 'الميزات', 'nav.saved': 'المحفوظة', 'nav.signin': 'تسجيل الدخول', 'nav.signup': 'إنشاء حساب',
                'nav.browse': 'تصفح الدورات', 'nav.quiz': 'أخذ اختبار', 'nav.analytics': 'عرض التحليلات',
                'common.backHome': 'العودة إلى الصفحة الرئيسية', 'common.submit': 'إرسال', 'common.reset': 'إعادة تعيين', 'common.apply': 'تقديم الآن',
                'common.save': 'حفظ', 'common.preview': 'معاينة', 'common.close': 'إغلاق',
                'hero.title': 'نظام إدارة التعلم', 'hero.subtitle': 'أنشئ ونظم وتتبع الدورات بواجهة عصرية.',
                'hero.getStarted': 'ابدأ', 'hero.createAccount': 'إنشاء حساب', 'hero.learnMore': 'اعرف المزيد',
                'quick.signin': 'تسجيل الدخول', 'quick.browse': 'تصفح الدورات', 'quick.quiz': 'أخذ اختبار', 'quick.analytics': 'عرض التحليلات',
                'testimonials.heading': 'ماذا يقول مستخدمونا', 'faq.heading': 'الأسئلة الشائعة',
                'signin.title': 'تسجيل الدخول إلى حسابك', 'signin.helper': 'مرحباً بعودتك. يرجى إدخال بياناتك.',
                'signin.submit': 'تسجيل الدخول', 'signin.remember': 'تذكرني', 'signin.forgot': 'نسيت كلمة المرور؟',
                'signup.title': 'إنشاء حسابك', 'signup.helper': 'انضم إلى المنصة اليوم.', 'signup.submit': 'إنشاء حساب',
                'page.features': 'جميع الميزات', 'page.courses': 'تصفح دوراتنا', 'page.quiz': 'اختبار تطوير الويب',
                'page.analytics': 'نظرة عامة على التحليلات', 'page.saved': 'الدورات المحفوظة', 'page.about': 'من نحن', 'page.careers': 'انضم إلى فريقنا'
            },
            zh: {
                'nav.features': '功能', 'nav.saved': '已保存', 'nav.signin': '登录', 'nav.signup': '注册',
                'nav.browse': '浏览课程', 'nav.quiz': '参加测验', 'nav.analytics': '查看分析',
                'common.backHome': '返回首页', 'common.submit': '提交', 'common.reset': '重置', 'common.apply': '立即申请',
                'common.save': '保存', 'common.preview': '预览', 'common.close': '关闭',
                'hero.title': '学习管理系统', 'hero.subtitle': '使用现代界面创建、组织和跟踪课程。',
                'hero.getStarted': '开始', 'hero.createAccount': '创建账户', 'hero.learnMore': '了解更多',
                'quick.signin': '登录', 'quick.browse': '浏览课程', 'quick.quiz': '参加测验', 'quick.analytics': '查看分析',
                'testimonials.heading': '用户评价', 'faq.heading': '常见问题',
                'signin.title': '登录您的账户', 'signin.helper': '欢迎回来。请输入您的信息。',
                'signin.submit': '登录', 'signin.remember': '记住我', 'signin.forgot': '忘记密码？',
                'signup.title': '创建您的账户', 'signup.helper': '立即加入我们的平台。', 'signup.submit': '创建账户',
                'page.features': '所有功能', 'page.courses': '浏览我们的课程', 'page.quiz': '网络开发测验',
                'page.analytics': '分析概览', 'page.saved': '已保存的课程', 'page.about': '关于我们', 'page.careers': '加入我们的团队'
            },
            hi: {
                'nav.features': 'सुविधाएं', 'nav.saved': 'सहेजे गए', 'nav.signin': 'साइन इन', 'nav.signup': 'साइन अप',
                'nav.browse': 'पाठ्यक्रम ब्राउज़ करें', 'nav.quiz': 'क्विज़ लें', 'nav.analytics': 'विश्लेषण देखें',
                'common.backHome': 'होम पर वापस', 'common.submit': 'सबमिट करें', 'common.reset': 'रीसेट', 'common.apply': 'अभी आवेदन करें',
                'common.save': 'सहेजें', 'common.preview': 'पूर्वावलोकन', 'common.close': 'बंद करें',
                'hero.title': 'लर्निंग मैनेजमेंट सिस्टम', 'hero.subtitle': 'एक आधुनिक इंटरफ़ेस के साथ पाठ्यक्रम बनाएं, व्यवस्थित करें और ट्रैक करें।',
                'hero.getStarted': 'शुरू करें', 'hero.createAccount': 'खाता बनाएं', 'hero.learnMore': 'अधिक जानें',
                'quick.signin': 'साइन इन', 'quick.browse': 'पाठ्यक्रम ब्राउज़ करें', 'quick.quiz': 'क्विज़ लें', 'quick.analytics': 'विश्लेषण देखें',
                'testimonials.heading': 'हमारे उपयोगकर्ता क्या कहते हैं', 'faq.heading': 'अक्सर पूछे जाने वाले प्रश्न',
                'signin.title': 'अपने खाते में साइन इन करें', 'signin.helper': 'वापसी पर स्वागत है। कृपया अपना विवरण दर्ज करें।',
                'signin.submit': 'साइन इन', 'signin.remember': 'मुझे याद रखें', 'signin.forgot': 'पासवर्ड भूल गए?',
                'signup.title': 'अपना खाता बनाएं', 'signup.helper': 'आज ही हमारे प्लेटफ़ॉर्म से जुड़ें।', 'signup.submit': 'खाता बनाएं',
                'page.features': 'सभी सुविधाएं', 'page.courses': 'हमारे पाठ्यक्रम ब्राउज़ करें', 'page.quiz': 'वेब डेवलपमेंट क्विज़',
                'page.analytics': 'विश्लेषण अवलोकन', 'page.saved': 'सहेजे गए पाठ्यक्रम', 'page.about': 'हमारे बारे में', 'page.careers': 'हमारी टीम में शामिल हों'
            },
            ja: {
                'nav.features': '機能', 'nav.saved': '保存済み', 'nav.signin': 'サインイン', 'nav.signup': 'サインアップ',
                'nav.browse': 'コースを閲覧', 'nav.quiz': 'クイズを受ける', 'nav.analytics': '分析を表示',
                'common.backHome': 'ホームに戻る', 'common.submit': '送信', 'common.reset': 'リセット', 'common.apply': '今すぐ応募',
                'common.save': '保存', 'common.preview': 'プレビュー', 'common.close': '閉じる',
                'hero.title': '学習管理システム', 'hero.subtitle': 'モダンなインターフェースでコースを作成、整理、追跡します。',
                'hero.getStarted': '始める', 'hero.createAccount': 'アカウントを作成', 'hero.learnMore': '詳細を見る',
                'quick.signin': 'サインイン', 'quick.browse': 'コースを閲覧', 'quick.quiz': 'クイズを受ける', 'quick.analytics': '分析を表示',
                'testimonials.heading': 'ユーザーの声', 'faq.heading': 'よくある質問',
                'signin.title': 'アカウントにサインイン', 'signin.helper': 'おかえりなさい。詳細を入力してください。',
                'signin.submit': 'サインイン', 'signin.remember': 'ログイン情報を記憶', 'signin.forgot': 'パスワードを忘れた場合',
                'signup.title': 'アカウントを作成', 'signup.helper': '今日からプラットフォームに参加しましょう。', 'signup.submit': 'アカウントを作成',
                'page.features': 'すべての機能', 'page.courses': 'コースを閲覧', 'page.quiz': 'Web開発クイズ',
                'page.analytics': '分析概要', 'page.saved': '保存されたコース', 'page.about': '私たちについて', 'page.careers': 'チームに参加'
            }
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
