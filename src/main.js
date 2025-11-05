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
        const mainHeader = document.getElementById('mainHeader');
        const header = mainHeader || document.querySelector('header');

        // Create enhanced back-to-top button
        const btn = document.createElement('button');
        btn.id = 'backToTop';
        btn.className = 'fixed bottom-6 right-6 z-40 group hidden';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = `
            <div class="relative w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95">
                <i data-lucide="arrow-up" class="w-5 h-5 text-white"></i>
                <div class="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
        `;
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Add visual feedback
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => { btn.style.transform = ''; }, 150);
        });
        document.body.appendChild(btn);

        // Initialize icon after button is added
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, 100);

        function onScroll() {
            const y = window.scrollY || document.documentElement.scrollTop;
            // Skip header shadow if mainHeader exists (handled by index.html)
            if (header && !mainHeader) {
                header.classList.toggle('shadow', y > 8);
            }
            // Show/hide button with smooth transition
            if (y > 300) {
                btn.classList.remove('hidden');
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            } else {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (window.scrollY < 300) {
                        btn.classList.add('hidden');
                    }
                }, 300);
            }
        }

        // Add CSS for smooth transitions
        if (!document.getElementById('backToTopStyles')) {
            const style = document.createElement('style');
            style.id = 'backToTopStyles';
            style.textContent = `
                #backToTop {
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                #backToTop:not(.hidden) {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    })();
    // Mobile menu toggle (works with Lucide icons)
    (function () {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('mobileMenu');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', () => {
            const wasHidden = menu.classList.contains('hidden');
            menu.classList.toggle('hidden');
            const open = wasHidden;
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            // Update Lucide icon if present
            const icon = toggle.querySelector('i[data-lucide]');
            if (icon) {
                icon.setAttribute('data-lucide', open ? 'x' : 'menu');
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                }
            } else {
                // Fallback for text-based toggles
                toggle.textContent = open ? '✕' : '☰';
            }
        });
    })();
    // Language selector + basic i18n (applies to all pages)
    (function () {
        // Desktop language selector
        const desktopWrapper = document.getElementById('langSelectorWrapper');
        // Mobile language selector
        const mobileWrapper = document.getElementById('mobileLangSelectorWrapper');

        if (!desktopWrapper && !mobileWrapper) return;

        function createLangSelector(isMobile = false) {
            const select = document.createElement('select');
            select.id = isMobile ? 'langSelectMobile' : 'langSelect';
            select.className = 'lang-select pl-10 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm appearance-none bg-white hover:border-violet-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all cursor-pointer';
            select.style.backgroundImage = 'none';

            // Add wrapper with dropdown arrow icon
            const wrapper = document.createElement('div');
            wrapper.className = 'relative inline-flex items-center';

            // Dropdown arrow icon (replaces globe, flag will be shown separately)
            const arrowIcon = document.createElement('i');
            arrowIcon.setAttribute('data-lucide', 'chevron-down');
            arrowIcon.className = 'absolute right-2.5 w-4 h-4 text-gray-400 pointer-events-none z-10';
            wrapper.appendChild(select);
            wrapper.appendChild(arrowIcon);
            return { select, wrapper };
        }
        // Extended language options with more languages and flags
        const options = [
            ['en', 'English', '🇺🇸'], ['fr', 'Français', '🇫🇷'], ['es', 'Español', '🇪🇸'], ['de', 'Deutsch', '🇩🇪'], ['pt', 'Português', '🇵🇹'],
            ['it', 'Italiano', '🇮🇹'], ['ar', 'العربية', '🇸🇦'], ['zh', '中文', '🇨🇳'], ['hi', 'हिन्दी', '🇮🇳'], ['ja', '日本語', '🇯🇵'],
            ['ru', 'Русский', '🇷🇺'], ['ko', '한국어', '🇰🇷'], ['tr', 'Türkçe', '🇹🇷'], ['nl', 'Nederlands', '🇳🇱'], ['pl', 'Polski', '🇵🇱'],
            ['sv', 'Svenska', '🇸🇪'], ['no', 'Norsk', '🇳🇴'], ['fi', 'Suomi', '🇫🇮'], ['vi', 'Tiếng Việt', '🇻🇳'], ['th', 'ไทย', '🇹🇭']
        ];
        const savedLang = (() => { try { return localStorage.getItem('ui.lang') || 'en'; } catch { return 'en'; } })();
        document.documentElement.setAttribute('lang', savedLang);
        // RTL languages: Arabic and Hebrew (if added later)
        const rtlLanguages = ['ar', 'he'];
        document.documentElement.setAttribute('dir', rtlLanguages.includes(savedLang) ? 'rtl' : 'ltr');

        // Create desktop selector
        if (desktopWrapper) {
            const { select: desktopSelect, wrapper: desktopWrap } = createLangSelector(false);
            desktopWrapper.appendChild(desktopWrap);
            populateSelector(desktopSelect);
        }

        // Create mobile selector
        if (mobileWrapper) {
            const { select: mobileSelect, wrapper: mobileWrap } = createLangSelector(true);
            mobileSelect.className += ' w-full'; // Full width on mobile
            mobileWrapper.appendChild(mobileWrap);
            populateSelector(mobileSelect);
        }

        function populateSelector(select) {
            // Clear existing options to prevent duplicates
            select.innerHTML = '';

            // Populate options with flags (flag only in display, short code in option text)
            options.forEach(([value, label, flag]) => {
                const opt = document.createElement('option');
                opt.value = value;
                opt.textContent = value.toUpperCase(); // Show short code (e.g., "EN", "FR") instead of full name
                opt.setAttribute('data-flag', flag);
                if (value === savedLang) opt.selected = true;
                select.appendChild(opt);
            });

            // Update display to show selected flag
            function updateDisplay() {
                const selectedOption = select.options[select.selectedIndex];
                const flag = selectedOption ? selectedOption.getAttribute('data-flag') : '🌐';
                const wrapper = select.parentElement;
                const flagDisplay = wrapper.querySelector('.lang-flag-display');
                if (flagDisplay) {
                    flagDisplay.textContent = flag;
                }
            }

            // Create flag display element only if it doesn't exist
            const wrapper = select.parentElement;
            let flagDisplay = wrapper.querySelector('.lang-flag-display');
            if (!flagDisplay) {
                flagDisplay = document.createElement('span');
                flagDisplay.className = 'lang-flag-display absolute left-2.5 text-base pointer-events-none z-10';
                wrapper.insertBefore(flagDisplay, select);
            }
            const selectedOption = select.options[select.selectedIndex];
            flagDisplay.textContent = selectedOption ? selectedOption.getAttribute('data-flag') : '🌐';

            // Add change event listener only if not already added
            if (!select.hasAttribute('data-lang-listener')) {
                select.setAttribute('data-lang-listener', 'true');
                select.addEventListener('change', () => {
                    const val = select.value || 'en';
                    try { localStorage.setItem('ui.lang', val); } catch { }
                    document.documentElement.setAttribute('lang', val);
                    document.documentElement.setAttribute('dir', rtlLanguages.includes(val) ? 'rtl' : 'ltr');
                    const langData = options.find(([code]) => code === val);
                    const langName = langData ? langData[1] : val.toUpperCase();
                    toast(`Language set to ${langName}`);
                    applyTranslations(val);

                    // Update display
                    updateDisplay();

                    // Update other selector if it exists
                    const allSelectors = document.querySelectorAll('.lang-select');
                    allSelectors.forEach(s => {
                        if (s !== select) {
                            s.value = val;
                            // Update display for other selectors
                            const otherWrapper = s.parentElement;
                            const otherFlagDisplay = otherWrapper.querySelector('.lang-flag-display');
                            if (otherFlagDisplay) {
                                const otherOption = s.options[s.selectedIndex];
                                otherFlagDisplay.textContent = otherOption ? otherOption.getAttribute('data-flag') : '🌐';
                            }
                        }
                    });

                    // Re-initialize Lucide icons after language change
                    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                        setTimeout(() => lucide.createIcons(), 50);
                    }
                });
            }

            // Initial display update
            updateDisplay();
        }

        // Expanded dictionary for key UI strings across all pages
        const dict = {
            en: {
                'nav.features': 'Features', 'nav.saved': 'Saved', 'nav.signin': 'Sign in', 'nav.signup': 'Sign up',
                'nav.browse': 'Browse courses', 'nav.quiz': 'Take a quiz', 'nav.analytics': 'View analytics',
                'common.backHome': 'Back to home', 'common.submit': 'Submit', 'common.reset': 'Reset', 'common.apply': 'Apply now',
                'common.save': 'Save', 'common.preview': 'Preview', 'common.close': 'Close', 'common.or': 'or',
                'hero.title': 'Learning Management System', 'hero.subtitle': 'Create, organize, and track courses with a clean, modern interface.',
                'hero.getStarted': 'Get Started', 'hero.createAccount': 'Create account', 'hero.learnMore': 'Learn More',
                'quick.signin': 'Sign in', 'quick.browse': 'Browse courses', 'quick.quiz': 'Take a quiz', 'quick.analytics': 'View analytics',
                'quick.actions.title': 'Quick actions',
                'testimonials.heading': 'What our users say', 'testimonials.subtitle': 'Join thousands of educators and learners who trust our platform',
                'testimonials.navigation': 'Testimonial navigation',
                'testimonials.amara.quote': 'Setup took minutes and my students love the clean UI. The intuitive design makes it easy for both instructors and learners.',
                'testimonials.amara.name': 'Mrs Amara', 'testimonials.amara.role': 'Instructor',
                'testimonials.luis.quote': 'Quizzes and progress tracking made our bootcamp smoother. We can now easily identify students who need extra support.',
                'testimonials.luis.name': 'Mr Virus', 'testimonials.luis.role': 'Program Lead',
                'testimonials.zara.quote': 'Finally, a simple LMS that looks modern and works fast. Creating courses has never been this enjoyable!',
                'testimonials.zara.name': 'Mr Chinemerem', 'testimonials.zara.role': 'Creator',
                'faq.heading': 'Frequently asked questions', 'faq.subtitle': 'Have more questions?', 'faq.viewFull': 'View our full FAQ', 'faq.viewAll': 'View all FAQs',
                'faq.free.question': 'Is this free to use?', 'faq.free.answer': 'Yes, this demo is free. You can extend it as needed. We offer a free tier with basic features, and you can upgrade to access advanced capabilities like unlimited courses, detailed analytics, and priority support.',
                'faq.account.question': 'Do I need to create an account?', 'faq.account.answer': 'Create an account to save progress and access courses. Your account allows you to track your learning journey, save favorite courses, and receive personalized recommendations.',
                'faq.import.question': 'Can I import existing content?', 'faq.import.answer': 'You can add courses manually now; import tools can be added later. Our intuitive course builder makes it easy to create content from scratch, and we\'re working on bulk import features for SCORM and other formats.',
                'home.trusted': 'Trusted by teams and creators worldwide',
                'home.features.title': 'Powerful features for modern learning', 'home.features.subtitle': 'Everything you need to create, manage, and track educational content in one place.', 'home.features.viewAll': 'View all features',
                'home.feature.course.title': 'Course Management', 'home.feature.course.desc': 'Build structured courses with lessons, videos, and assessments. Organize content in a logical learning path.',
                'home.feature.assessment.title': 'Assessments', 'home.feature.assessment.desc': 'Create interactive quizzes to evaluate progress and understanding. Get instant feedback and track performance.',
                'home.feature.insights.title': 'Insights', 'home.feature.insights.desc': 'Track learner engagement and completion at a glance. Identify at-risk students and measure course effectiveness.',
                'footer.product': 'Product', 'footer.company': 'Company', 'footer.resources': 'Resources', 'footer.docs': 'Docs',
                'footer.stayUpdated': 'Stay updated', 'footer.stayUpdated.desc': 'Get the latest updates, tips, and resources delivered to your inbox.',
                'footer.email.placeholder': 'Enter your email', 'footer.subscribe': 'Subscribe', 'footer.privacy': 'We respect your privacy. Unsubscribe anytime.',
                'signin.title': 'Sign in to your account', 'signin.helper': 'Welcome back. Please enter your details.',
                'signin.submit': 'Sign In', 'signin.remember': 'Remember me', 'signin.forgot': 'Forgot password?',
                'signin.google': 'Continue with Google', 'signin.email': 'Email', 'signin.emailPlaceholder': 'you@example.com',
                'signin.emailError': 'Please enter a valid email.', 'signin.password': 'Password', 'signin.passwordPlaceholder': '••••••••',
                'signin.show': 'Show', 'signin.passwordError': 'Password is required.', 'signin.noAccount': "Don't have an account?",
                'signin.createAccount': 'Create account',
                'signup.title': 'Create your account', 'signup.helper': 'Join the Learning Management System today.', 'signup.submit': 'Create account',
                'signup.google': 'Sign up with Google', 'signup.github': 'Sign up with GitHub', 'signup.fullName': 'Full name',
                'signup.fullNamePlaceholder': 'Jane Doe', 'signup.nameError': 'Full name is required.', 'signup.email': 'Email',
                'signup.emailPlaceholder': 'you@example.com', 'signup.emailError': 'Please enter a valid email.', 'signup.password': 'Password',
                'signup.passwordPlaceholder': '••••••••', 'signup.show': 'Show', 'signup.passwordError': 'Password must be at least 8 characters.',
                'signup.confirmPassword': 'Confirm password', 'signup.confirmError': 'Passwords do not match.', 'signup.agree': 'I agree to the',
                'signup.terms': 'Terms', 'signup.and': 'and', 'signup.privacy': 'Privacy Policy', 'signup.haveAccount': 'Already have an account?',
                'signup.signin': 'Sign in',
                'page.features': 'All features', 'page.courses': 'Browse our courses', 'page.quiz': 'Web Development Quiz',
                'page.analytics': 'Analytics overview', 'page.saved': 'Saved courses', 'page.about': 'About Us', 'page.careers': 'Join Our Team',
                'saved.subtitle': 'Your bookmarked courses, ready to continue learning.',
                'saved.empty.title': 'No saved courses yet', 'saved.empty.desc': 'Start exploring our course catalog and save courses you\'re interested in for easy access later.',
                'saved.continue': 'Continue',
                'forgot.title': 'Reset your password', 'forgot.helper': 'Enter your email address and we\'ll send you reset instructions.',
                'forgot.email': 'Email', 'forgot.emailPlaceholder': 'you@example.com', 'forgot.submit': 'Send reset link',
                'forgot.backToSignin': 'Back to sign in',
                'about.hero.desc': 'We\'re on a mission to make quality education accessible to everyone, everywhere. Founded in 2020, we\'ve helped thousands of learners achieve their learning goals through our modern, intuitive platform.',
                'about.mission.title': 'Our Mission', 'about.mission.desc1': 'Education should be accessible, engaging, and effective for everyone. We believe that learning doesn\'t stop after school—it\'s a lifelong journey. Our platform empowers educators and learners to create, share, and discover knowledge in ways that work for them.',
                'about.mission.desc2': 'Whether you\'re teaching a class, running a bootcamp, or learning a new skill, we provide the tools you need to succeed. No complexity, no barriers—just learning made simple.',
                'about.mission.future': 'Building the future of learning', 'about.mission.join': 'Join us in transforming how people learn and teach online.',
                'about.values.title': 'Our Values', 'about.values.innovation': 'Innovation', 'about.values.innovation.desc': 'We continuously improve our platform with new features and technologies to enhance the learning experience.',
                'about.values.community': 'Community', 'about.values.community.desc': 'We believe learning is a collaborative journey. We foster connections between educators and learners.',
                'about.values.accessibility': 'Accessibility', 'about.values.accessibility.desc': 'Education should be available to everyone, regardless of background, location, or resources.',
                'about.values.simplicity': 'Simplicity', 'about.values.simplicity.desc': 'We keep things simple and intuitive, so you can focus on what matters: teaching and learning.',
                'about.values.data': 'Data-Driven', 'about.values.data.desc': 'We use analytics and insights to help educators understand learner progress and improve outcomes.',
                'about.values.security': 'Security & Privacy', 'about.values.security.desc': 'We protect your data and privacy with industry-leading security practices and transparency.',
                'about.story.title': 'Our Story', 'about.story.p1': 'It started with a simple observation: existing learning management systems were too complex, expensive, or outdated. Educators and learners deserved better.',
                'about.story.p2': 'In 2020, our founding team—comprising educators, developers, and designers—came together to build a platform that put the user experience first. We launched with a focus on simplicity, beautiful design, and powerful features that actually work.',
                'about.story.p3': 'Today, we serve thousands of users worldwide, from individual instructors to large organizations. But our mission remains the same: make learning accessible, engaging, and effective for everyone.',
                'about.story.p4': 'We\'re just getting started. Join us as we continue to innovate and expand our platform to meet the evolving needs of the education community.',
                'about.team.title': 'Meet the Team', 'about.stats.title': 'By the Numbers', 'about.stats.learners': 'Active Learners',
                'about.stats.instructors': 'Instructors', 'about.stats.countries': 'Countries', 'about.stats.satisfaction': 'Satisfaction Rate',
                'about.cta.title': 'Ready to get started?', 'about.cta.desc': 'Join thousands of educators and learners who are already using our platform to create amazing learning experiences.',
                'about.cta.createAccount': 'Create your account', 'about.cta.joinTeam': 'Join our team',
                'features.hero.subtitle': 'Discover everything our Learning Management System has to offer. From course creation to analytics, we\'ve got you covered.',
                'features.core.title': 'Core Features', 'features.core.course.title': 'Course Management',
                'features.core.course.desc': 'Create and organize courses with lessons, videos, and resources. Build structured learning paths.',
                'features.core.course.item1': '• Multi-format content support', 'features.core.course.item2': '• Course templates', 'features.core.course.item3': '• Drag-and-drop organization',
                'features.core.quiz.title': 'Quizzes & Assessments', 'features.core.quiz.desc': 'Assess learners with interactive quizzes, instant scoring, and detailed feedback.',
                'features.core.quiz.item1': '• Multiple question types', 'features.core.quiz.item2': '• Auto-grading', 'features.core.quiz.item3': '• Performance tracking',
                'features.core.analytics.title': 'Analytics & Reporting', 'features.core.analytics.desc': 'Track engagement, completion rates, and identify at-risk learners with comprehensive analytics.',
                'features.core.analytics.item1': '• Real-time dashboards', 'features.core.analytics.item2': '• Exportable reports', 'features.core.analytics.item3': '• Learner insights',
                'features.core.users.title': 'User Management', 'features.core.users.desc': 'Manage learners, instructors, and admins with role-based permissions and access control.',
                'features.core.users.item1': '• Role-based access', 'features.core.users.item2': '• Bulk user import', 'features.core.users.item3': '• User activity tracking',
                'features.core.security.title': 'Authentication & Security', 'features.core.security.desc': 'Secure sign-in/up flows with validation, password recovery, and social login options.',
                'features.core.security.item1': '• Email verification', 'features.core.security.item2': '• Social authentication', 'features.core.security.item3': '• Password encryption',
                'features.core.accessibility.title': 'Accessibility', 'features.core.accessibility.desc': 'Built with accessibility in mind - skip links, ARIA labels, and keyboard navigation support.',
                'features.core.accessibility.item1': '• WCAG 2.1 compliant', 'features.core.accessibility.item2': '• Screen reader support', 'features.core.accessibility.item3': '• Keyboard navigation',
                'features.additional.title': 'Additional Features', 'features.additional.save.title': 'Save Courses',
                'features.additional.save.desc': 'Bookmark and save your favorite courses for easy access later.', 'features.additional.save.link': 'View saved courses',
                'features.additional.lang.title': 'Multi-language Support', 'features.additional.lang.desc': 'Access the platform in 20+ languages with RTL support for Arabic and Hebrew.',
                'features.additional.ui.title': 'Modern UI/UX', 'features.additional.ui.desc': 'Clean, intuitive interface with responsive design that works on all devices.',
                'features.additional.performance.title': 'Fast Performance', 'features.additional.performance.desc': 'Lightning-fast page loads and smooth interactions powered by modern web technologies.',
                'features.additional.mobile.title': 'Mobile Responsive', 'features.additional.mobile.desc': 'Full functionality on mobile, tablet, and desktop devices with optimized layouts.',
                'features.additional.notifications.title': 'Notifications', 'features.additional.notifications.desc': 'Stay informed with toast notifications for important updates and actions.',
                'features.cta.title': 'Ready to get started?', 'features.cta.desc': 'Join thousands of educators and learners who are already using our platform to create amazing learning experiences.',
                'features.cta.createAccount': 'Create your account', 'features.cta.browse': 'Browse courses'
            },
            fr: {
                'nav.features': 'Fonctionnalités', 'nav.saved': 'Favoris', 'nav.signin': 'Se connecter', 'nav.signup': 'Créer un compte',
                'nav.browse': 'Parcourir les cours', 'nav.quiz': 'Passer un quiz', 'nav.analytics': 'Voir les analyses',
                'common.backHome': "Retour à l'accueil", 'common.submit': 'Soumettre', 'common.reset': 'Réinitialiser', 'common.apply': 'Postuler',
                'common.save': 'Enregistrer', 'common.preview': 'Aperçu', 'common.close': 'Fermer', 'common.or': 'ou',
                'hero.title': 'Plateforme de formation', 'hero.subtitle': 'Créez, organisez et suivez vos cours avec une interface moderne.',
                'hero.getStarted': 'Commencer', 'hero.createAccount': 'Créer un compte', 'hero.learnMore': 'En savoir plus',
                'quick.signin': 'Se connecter', 'quick.browse': 'Parcourir les cours', 'quick.quiz': 'Passer un quiz', 'quick.analytics': 'Voir les analyses',
                'quick.actions.title': 'Actions rapides',
                'testimonials.heading': 'Ce que disent nos utilisateurs', 'testimonials.subtitle': 'Rejoignez des milliers d\'éducateurs et d\'apprenants qui font confiance à notre plateforme',
                'testimonials.navigation': 'Navigation des témoignages',
                'testimonials.amara.quote': 'La configuration a pris quelques minutes et mes étudiants adorent l\'interface claire. La conception intuitive facilite la tâche aux instructeurs et aux apprenants.',
                'testimonials.amara.name': 'Mme Amara', 'testimonials.amara.role': 'Instructrice',
                'testimonials.luis.quote': 'Les quiz et le suivi des progrès ont rendu notre bootcamp plus fluide. Nous pouvons maintenant facilement identifier les étudiants qui ont besoin de soutien supplémentaire.',
                'testimonials.luis.name': 'M. Virus', 'testimonials.luis.role': 'Responsable de programme',
                'testimonials.zara.quote': 'Enfin, un LMS simple qui a l\'air moderne et fonctionne rapidement. Créer des cours n\'a jamais été aussi agréable !',
                'testimonials.zara.name': 'M. Chinemerem', 'testimonials.zara.role': 'Créateur',
                'faq.heading': 'Foire aux questions', 'faq.subtitle': 'Vous avez d\'autres questions ?', 'faq.viewFull': 'Voir notre FAQ complète', 'faq.viewAll': 'Voir toutes les FAQ',
                'faq.free.question': 'Est-ce gratuit ?', 'faq.free.answer': 'Oui, cette démo est gratuite. Vous pouvez l\'étendre selon vos besoins. Nous proposons un niveau gratuit avec des fonctionnalités de base, et vous pouvez passer à un niveau supérieur pour accéder à des capacités avancées comme des cours illimités, des analyses détaillées et un support prioritaire.',
                'faq.account.question': 'Dois-je créer un compte ?', 'faq.account.answer': 'Créez un compte pour sauvegarder votre progression et accéder aux cours. Votre compte vous permet de suivre votre parcours d\'apprentissage, de sauvegarder vos cours favoris et de recevoir des recommandations personnalisées.',
                'faq.import.question': 'Puis-je importer du contenu existant ?', 'faq.import.answer': 'Vous pouvez ajouter des cours manuellement maintenant ; les outils d\'importation peuvent être ajoutés plus tard. Notre créateur de cours intuitif facilite la création de contenu à partir de zéro, et nous travaillons sur des fonctionnalités d\'importation groupée pour SCORM et autres formats.',
                'home.trusted': 'Fiable par les équipes et les créateurs du monde entier',
                'home.features.title': 'Des fonctionnalités puissantes pour l\'apprentissage moderne', 'home.features.subtitle': 'Tout ce dont vous avez besoin pour créer, gérer et suivre le contenu éducatif en un seul endroit.', 'home.features.viewAll': 'Voir toutes les fonctionnalités',
                'home.feature.course.title': 'Gestion des cours', 'home.feature.course.desc': 'Créez des cours structurés avec des leçons, des vidéos et des évaluations. Organisez le contenu selon un parcours d\'apprentissage logique.',
                'home.feature.assessment.title': 'Évaluations', 'home.feature.assessment.desc': 'Créez des quiz interactifs pour évaluer les progrès et la compréhension. Obtenez des commentaires instantanés et suivez les performances.',
                'home.feature.insights.title': 'Analyses', 'home.feature.insights.desc': 'Suivez l\'engagement et la complétion des apprenants en un coup d\'œil. Identifiez les étudiants à risque et mesurez l\'efficacité des cours.',
                'footer.product': 'Produit', 'footer.company': 'Entreprise', 'footer.resources': 'Ressources', 'footer.docs': 'Documentation',
                'footer.stayUpdated': 'Restez informé', 'footer.stayUpdated.desc': 'Recevez les dernières mises à jour, astuces et ressources dans votre boîte de réception.',
                'footer.email.placeholder': 'Entrez votre e-mail', 'footer.subscribe': 'S\'abonner', 'footer.privacy': 'Nous respectons votre vie privée. Désabonnez-vous à tout moment.',
                'signin.title': 'Connectez-vous à votre compte', 'signin.helper': 'Bon retour. Entrez vos identifiants.',
                'signin.submit': 'Se connecter', 'signin.remember': 'Se souvenir de moi', 'signin.forgot': 'Mot de passe oublié ?',
                'signup.title': 'Créez votre compte', 'signup.helper': "Rejoignez la plateforme dès aujourd'hui.", 'signup.submit': 'Créer un compte',
                'page.features': 'Toutes les fonctionnalités', 'page.courses': 'Parcourir nos cours', 'page.quiz': 'Quiz Développement Web',
                'page.analytics': "Vue d'ensemble des analyses", 'page.saved': 'Cours enregistrés', 'page.about': 'À propos', 'page.careers': 'Rejoignez notre équipe',
                'saved.subtitle': 'Vos cours enregistrés, prêts à poursuivre votre apprentissage.',
                'saved.empty.title': 'Aucun cours enregistré pour le moment', 'saved.empty.desc': 'Commencez à explorer notre catalogue de cours et enregistrez les cours qui vous intéressent pour y accéder facilement plus tard.',
                'saved.continue': 'Continuer'
            },
            es: {
                'nav.features': 'Funciones', 'nav.saved': 'Guardados', 'nav.signin': 'Iniciar sesión', 'nav.signup': 'Crear cuenta',
                'nav.browse': 'Explorar cursos', 'nav.quiz': 'Hacer un quiz', 'nav.analytics': 'Ver analíticas',
                'common.backHome': 'Volver al inicio', 'common.submit': 'Enviar', 'common.reset': 'Restablecer', 'common.apply': 'Aplicar ahora',
                'common.save': 'Guardar', 'common.preview': 'Vista previa', 'common.close': 'Cerrar', 'common.or': 'o',
                'hero.title': 'Plataforma de aprendizaje', 'hero.subtitle': 'Crea, organiza y sigue cursos con una interfaz moderna.',
                'hero.getStarted': 'Empezar', 'hero.createAccount': 'Crear cuenta', 'hero.learnMore': 'Saber más',
                'quick.signin': 'Iniciar sesión', 'quick.browse': 'Explorar cursos', 'quick.quiz': 'Hacer un quiz', 'quick.analytics': 'Ver analíticas',
                'quick.actions.title': 'Acciones rápidas',
                'testimonials.heading': 'Lo que dicen nuestros usuarios', 'testimonials.subtitle': 'Únete a miles de educadores y estudiantes que confían en nuestra plataforma',
                'testimonials.navigation': 'Navegación de testimonios',
                'testimonials.amara.quote': 'La configuración tomó minutos y a mis estudiantes les encanta la interfaz limpia. El diseño intuitivo facilita tanto a instructores como a estudiantes.',
                'testimonials.amara.name': 'Sra. Amara', 'testimonials.amara.role': 'Instructora',
                'testimonials.luis.quote': 'Los cuestionarios y el seguimiento del progreso hicieron nuestro bootcamp más fluido. Ahora podemos identificar fácilmente a los estudiantes que necesitan apoyo adicional.',
                'testimonials.luis.name': 'Sr. Virus', 'testimonials.luis.role': 'Líder de Programa',
                'testimonials.zara.quote': '¡Finalmente, un LMS simple que se ve moderno y funciona rápido. ¡Nunca había sido tan agradable crear cursos!',
                'testimonials.zara.name': 'Sr. Chinemerem', 'testimonials.zara.role': 'Creador',
                'faq.heading': 'Preguntas frecuentes', 'faq.subtitle': '¿Tienes más preguntas?', 'faq.viewFull': 'Ver nuestro FAQ completo', 'faq.viewAll': 'Ver todas las FAQ',
                'faq.free.question': '¿Es gratis?', 'faq.free.answer': 'Sí, esta demo es gratuita. Puedes ampliarla según sea necesario. Ofrecemos un nivel gratuito con funciones básicas, y puedes actualizar para acceder a capacidades avanzadas como cursos ilimitados, análisis detallados y soporte prioritario.',
                'faq.account.question': '¿Necesito crear una cuenta?', 'faq.account.answer': 'Crea una cuenta para guardar tu progreso y acceder a los cursos. Tu cuenta te permite rastrear tu viaje de aprendizaje, guardar cursos favoritos y recibir recomendaciones personalizadas.',
                'faq.import.question': '¿Puedo importar contenido existente?', 'faq.import.answer': 'Puedes agregar cursos manualmente ahora; las herramientas de importación se pueden agregar más tarde. Nuestro creador de cursos intuitivo facilita la creación de contenido desde cero, y estamos trabajando en funciones de importación masiva para SCORM y otros formatos.',
                'home.trusted': 'Confiado por equipos y creadores de todo el mundo',
                'home.features.title': 'Funciones poderosas para el aprendizaje moderno', 'home.features.subtitle': 'Todo lo que necesitas para crear, gestionar y rastrear contenido educativo en un solo lugar.', 'home.features.viewAll': 'Ver todas las funciones',
                'home.feature.course.title': 'Gestión de cursos', 'home.feature.course.desc': 'Crea cursos estructurados con lecciones, videos y evaluaciones. Organiza el contenido en una ruta de aprendizaje lógica.',
                'home.feature.assessment.title': 'Evaluaciones', 'home.feature.assessment.desc': 'Crea cuestionarios interactivos para evaluar el progreso y la comprensión. Obtén retroalimentación instantánea y rastrea el rendimiento.',
                'home.feature.insights.title': 'Información', 'home.feature.insights.desc': 'Rastrea el compromiso y la finalización de los estudiantes de un vistazo. Identifica estudiantes en riesgo y mide la efectividad del curso.',
                'footer.product': 'Producto', 'footer.company': 'Empresa', 'footer.resources': 'Recursos', 'footer.docs': 'Documentación',
                'footer.stayUpdated': 'Mantente actualizado', 'footer.stayUpdated.desc': 'Recibe las últimas actualizaciones, consejos y recursos en tu bandeja de entrada.',
                'footer.email.placeholder': 'Ingresa tu correo', 'footer.subscribe': 'Suscribirse', 'footer.privacy': 'Respetamos tu privacidad. Cancela la suscripción en cualquier momento.',
                'signin.title': 'Inicia sesión en tu cuenta', 'signin.helper': 'Bienvenido de nuevo. Ingresa tus datos.',
                'signin.submit': 'Iniciar sesión', 'signin.remember': 'Recordarme', 'signin.forgot': '¿Olvidaste tu contraseña?',
                'signup.title': 'Crea tu cuenta', 'signup.helper': 'Únete hoy a la plataforma.', 'signup.submit': 'Crear cuenta',
                'page.features': 'Todas las funciones', 'page.courses': 'Explora nuestros cursos', 'page.quiz': 'Quiz de Desarrollo Web',
                'page.analytics': 'Resumen de analíticas', 'page.saved': 'Cursos guardados', 'page.about': 'Sobre nosotros', 'page.careers': 'Únete a nuestro equipo',
                'saved.subtitle': 'Tus cursos guardados, listos para continuar aprendiendo.',
                'saved.empty.title': 'Aún no hay cursos guardados', 'saved.empty.desc': 'Comienza a explorar nuestro catálogo de cursos y guarda los cursos que te interesen para acceder fácilmente más tarde.',
                'saved.continue': 'Continuar'
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
            },
            ru: {
                'nav.features': 'Функции', 'nav.saved': 'Сохранено', 'nav.signin': 'Войти', 'nav.signup': 'Регистрация',
                'nav.browse': 'Просмотр курсов', 'nav.quiz': 'Пройти тест', 'nav.analytics': 'Просмотр аналитики',
                'common.backHome': 'Вернуться на главную', 'common.submit': 'Отправить', 'common.reset': 'Сбросить', 'common.apply': 'Подать заявку',
                'common.save': 'Сохранить', 'common.preview': 'Предпросмотр', 'common.close': 'Закрыть',
                'hero.title': 'Система управления обучением', 'hero.subtitle': 'Создавайте, организуйте и отслеживайте курсы с современным интерфейсом.',
                'hero.getStarted': 'Начать', 'hero.createAccount': 'Создать аккаунт', 'hero.learnMore': 'Узнать больше',
                'quick.signin': 'Войти', 'quick.browse': 'Просмотр курсов', 'quick.quiz': 'Пройти тест', 'quick.analytics': 'Просмотр аналитики',
                'testimonials.heading': 'Что говорят наши пользователи', 'faq.heading': 'Часто задаваемые вопросы',
                'signin.title': 'Войти в аккаунт', 'signin.helper': 'С возвращением. Пожалуйста, введите свои данные.',
                'signin.submit': 'Войти', 'signin.remember': 'Запомнить меня', 'signin.forgot': 'Забыли пароль?',
                'signup.title': 'Создайте аккаунт', 'signup.helper': 'Присоединяйтесь к платформе сегодня.', 'signup.submit': 'Создать аккаунт',
                'page.features': 'Все функции', 'page.courses': 'Просмотр наших курсов', 'page.quiz': 'Тест по веб-разработке',
                'page.analytics': 'Обзор аналитики', 'page.saved': 'Сохраненные курсы', 'page.about': 'О нас', 'page.careers': 'Присоединиться к команде'
            },
            ko: {
                'nav.features': '기능', 'nav.saved': '저장됨', 'nav.signin': '로그인', 'nav.signup': '가입하기',
                'nav.browse': '과정 둘러보기', 'nav.quiz': '퀴즈 풀기', 'nav.analytics': '분석 보기',
                'common.backHome': '홈으로 돌아가기', 'common.submit': '제출', 'common.reset': '재설정', 'common.apply': '지금 지원',
                'common.save': '저장', 'common.preview': '미리보기', 'common.close': '닫기',
                'hero.title': '학습 관리 시스템', 'hero.subtitle': '깔끔하고 현대적인 인터페이스로 과정을 생성, 구성 및 추적하세요.',
                'hero.getStarted': '시작하기', 'hero.createAccount': '계정 만들기', 'hero.learnMore': '자세히 알아보기',
                'quick.signin': '로그인', 'quick.browse': '과정 둘러보기', 'quick.quiz': '퀴즈 풀기', 'quick.analytics': '분석 보기',
                'testimonials.heading': '사용자 후기', 'faq.heading': '자주 묻는 질문',
                'signin.title': '계정에 로그인', 'signin.helper': '돌아오신 것을 환영합니다. 세부 정보를 입력하세요.',
                'signin.submit': '로그인', 'signin.remember': '로그인 상태 유지', 'signin.forgot': '비밀번호를 잊으셨나요?',
                'signup.title': '계정 만들기', 'signup.helper': '오늘 플랫폼에 가입하세요.', 'signup.submit': '계정 만들기',
                'page.features': '모든 기능', 'page.courses': '우리 과정 둘러보기', 'page.quiz': '웹 개발 퀴즈',
                'page.analytics': '분석 개요', 'page.saved': '저장된 과정', 'page.about': '회사 소개', 'page.careers': '팀에 합류하기'
            },
            tr: {
                'nav.features': 'Özellikler', 'nav.saved': 'Kaydedilenler', 'nav.signin': 'Giriş yap', 'nav.signup': 'Kayıt ol',
                'nav.browse': 'Kursları göz at', 'nav.quiz': 'Quiz yap', 'nav.analytics': 'Analizleri görüntüle',
                'common.backHome': 'Ana sayfaya dön', 'common.submit': 'Gönder', 'common.reset': 'Sıfırla', 'common.apply': 'Şimdi başvur',
                'common.save': 'Kaydet', 'common.preview': 'Önizleme', 'common.close': 'Kapat',
                'hero.title': 'Öğrenme Yönetim Sistemi', 'hero.subtitle': 'Modern bir arayüzle kurs oluşturun, düzenleyin ve takip edin.',
                'hero.getStarted': 'Başlayın', 'hero.createAccount': 'Hesap oluştur', 'hero.learnMore': 'Daha fazla bilgi',
                'quick.signin': 'Giriş yap', 'quick.browse': 'Kursları göz at', 'quick.quiz': 'Quiz yap', 'quick.analytics': 'Analizleri görüntüle',
                'testimonials.heading': 'Kullanıcılarımız ne diyor', 'faq.heading': 'Sık sorulan sorular',
                'signin.title': 'Hesabınıza giriş yapın', 'signin.helper': 'Tekrar hoş geldiniz. Lütfen bilgilerinizi girin.',
                'signin.submit': 'Giriş Yap', 'signin.remember': 'Beni hatırla', 'signin.forgot': 'Şifrenizi mi unuttunuz?',
                'signup.title': 'Hesabınızı oluşturun', 'signup.helper': 'Bugün platforma katılın.', 'signup.submit': 'Hesap oluştur',
                'page.features': 'Tüm özellikler', 'page.courses': 'Kurslarımızı göz atın', 'page.quiz': 'Web Geliştirme Quiz\'i',
                'page.analytics': 'Analiz özeti', 'page.saved': 'Kaydedilen kurslar', 'page.about': 'Hakkımızda', 'page.careers': 'Ekibimize katılın'
            },
            nl: {
                'nav.features': 'Functies', 'nav.saved': 'Opgeslagen', 'nav.signin': 'Inloggen', 'nav.signup': 'Registreren',
                'nav.browse': 'Cursussen bekijken', 'nav.quiz': 'Quiz maken', 'nav.analytics': 'Analyses bekijken',
                'common.backHome': 'Terug naar home', 'common.submit': 'Verzenden', 'common.reset': 'Resetten', 'common.apply': 'Nu solliciteren',
                'common.save': 'Opslaan', 'common.preview': 'Voorvertoning', 'common.close': 'Sluiten',
                'hero.title': 'Leerbeheersysteem', 'hero.subtitle': 'Maak, organiseer en volg cursussen met een modern interface.',
                'hero.getStarted': 'Beginnen', 'hero.createAccount': 'Account aanmaken', 'hero.learnMore': 'Meer weten',
                'quick.signin': 'Inloggen', 'quick.browse': 'Cursussen bekijken', 'quick.quiz': 'Quiz maken', 'quick.analytics': 'Analyses bekijken',
                'testimonials.heading': 'Wat onze gebruikers zeggen', 'faq.heading': 'Veelgestelde vragen',
                'signin.title': 'Log in op uw account', 'signin.helper': 'Welkom terug. Voer uw gegevens in.',
                'signin.submit': 'Inloggen', 'signin.remember': 'Onthoud mij', 'signin.forgot': 'Wachtwoord vergeten?',
                'signup.title': 'Maak uw account aan', 'signup.helper': 'Sluit vandaag aan bij het platform.', 'signup.submit': 'Account aanmaken',
                'page.features': 'Alle functies', 'page.courses': 'Bekijk onze cursussen', 'page.quiz': 'Web Development Quiz',
                'page.analytics': 'Analyses overzicht', 'page.saved': 'Opgeslagen cursussen', 'page.about': 'Over ons', 'page.careers': 'Word lid van ons team'
            },
            pl: {
                'nav.features': 'Funkcje', 'nav.saved': 'Zapisane', 'nav.signin': 'Zaloguj się', 'nav.signup': 'Zarejestruj się',
                'nav.browse': 'Przeglądaj kursy', 'nav.quiz': 'Rozwiąż quiz', 'nav.analytics': 'Zobacz analitykę',
                'common.backHome': 'Wróć do strony głównej', 'common.submit': 'Wyślij', 'common.reset': 'Resetuj', 'common.apply': 'Złóż aplikację',
                'common.save': 'Zapisz', 'common.preview': 'Podgląd', 'common.close': 'Zamknij',
                'hero.title': 'System zarządzania nauczaniem', 'hero.subtitle': 'Twórz, organizuj i śledź kursy z nowoczesnym interfejsem.',
                'hero.getStarted': 'Zacznij', 'hero.createAccount': 'Utwórz konto', 'hero.learnMore': 'Dowiedz się więcej',
                'quick.signin': 'Zaloguj się', 'quick.browse': 'Przeglądaj kursy', 'quick.quiz': 'Rozwiąż quiz', 'quick.analytics': 'Zobacz analitykę',
                'testimonials.heading': 'Co mówią nasi użytkownicy', 'faq.heading': 'Najczęściej zadawane pytania',
                'signin.title': 'Zaloguj się na swoje konto', 'signin.helper': 'Witamy z powrotem. Proszę wprowadzić dane.',
                'signin.submit': 'Zaloguj się', 'signin.remember': 'Zapamiętaj mnie', 'signin.forgot': 'Zapomniałeś hasła?',
                'signup.title': 'Utwórz swoje konto', 'signup.helper': 'Dołącz dziś do platformy.', 'signup.submit': 'Utwórz konto',
                'page.features': 'Wszystkie funkcje', 'page.courses': 'Przeglądaj nasze kursy', 'page.quiz': 'Quiz rozwoju web',
                'page.analytics': 'Przegląd analityki', 'page.saved': 'Zapisane kursy', 'page.about': 'O nas', 'page.careers': 'Dołącz do naszego zespołu'
            },
            sv: {
                'nav.features': 'Funktioner', 'nav.saved': 'Sparade', 'nav.signin': 'Logga in', 'nav.signup': 'Registrera dig',
                'nav.browse': 'Bläddra kurser', 'nav.quiz': 'Gör ett quiz', 'nav.analytics': 'Visa analyser',
                'common.backHome': 'Tillbaka till hem', 'common.submit': 'Skicka', 'common.reset': 'Återställ', 'common.apply': 'Ansök nu',
                'common.save': 'Spara', 'common.preview': 'Förhandsgranska', 'common.close': 'Stäng',
                'hero.title': 'Lärplattform', 'hero.subtitle': 'Skapa, organisera och spåra kurser med ett modernt gränssnitt.',
                'hero.getStarted': 'Kom igång', 'hero.createAccount': 'Skapa konto', 'hero.learnMore': 'Läs mer',
                'quick.signin': 'Logga in', 'quick.browse': 'Bläddra kurser', 'quick.quiz': 'Gör ett quiz', 'quick.analytics': 'Visa analyser',
                'testimonials.heading': 'Vad våra användare säger', 'faq.heading': 'Vanliga frågor',
                'signin.title': 'Logga in på ditt konto', 'signin.helper': 'Välkommen tillbaka. Vänligen ange din information.',
                'signin.submit': 'Logga in', 'signin.remember': 'Kom ihåg mig', 'signin.forgot': 'Glömt lösenord?',
                'signup.title': 'Skapa ditt konto', 'signup.helper': 'Gå med i plattformen idag.', 'signup.submit': 'Skapa konto',
                'page.features': 'Alla funktioner', 'page.courses': 'Bläddra våra kurser', 'page.quiz': 'Webbutvecklingsquiz',
                'page.analytics': 'Analysöversikt', 'page.saved': 'Sparade kurser', 'page.about': 'Om oss', 'page.careers': 'Gå med i vårt team'
            },
            no: {
                'nav.features': 'Funksjoner', 'nav.saved': 'Lagret', 'nav.signin': 'Logg inn', 'nav.signup': 'Registrer deg',
                'nav.browse': 'Bla gjennom kurs', 'nav.quiz': 'Ta en quiz', 'nav.analytics': 'Se analyser',
                'common.backHome': 'Tilbake til hjem', 'common.submit': 'Send', 'common.reset': 'Tilbakestill', 'common.apply': 'Søk nå',
                'common.save': 'Lagre', 'common.preview': 'Forhåndsvisning', 'common.close': 'Lukk',
                'hero.title': 'Læringsplattform', 'hero.subtitle': 'Opprett, organiser og spor kurs med et moderne grensesnitt.',
                'hero.getStarted': 'Kom i gang', 'hero.createAccount': 'Opprett konto', 'hero.learnMore': 'Lær mer',
                'quick.signin': 'Logg inn', 'quick.browse': 'Bla gjennom kurs', 'quick.quiz': 'Ta en quiz', 'quick.analytics': 'Se analyser',
                'testimonials.heading': 'Hva brukerne våre sier', 'faq.heading': 'Ofte stilte spørsmål',
                'signin.title': 'Logg inn på kontoen din', 'signin.helper': 'Velkommen tilbake. Vennligst oppgi informasjonen din.',
                'signin.submit': 'Logg inn', 'signin.remember': 'Husk meg', 'signin.forgot': 'Glemt passord?',
                'signup.title': 'Opprett kontoen din', 'signup.helper': 'Bli med på plattformen i dag.', 'signup.submit': 'Opprett konto',
                'page.features': 'Alle funksjoner', 'page.courses': 'Bla gjennom våre kurs', 'page.quiz': 'Webutviklingsquiz',
                'page.analytics': 'Analyseoversikt', 'page.saved': 'Lagrede kurs', 'page.about': 'Om oss', 'page.careers': 'Bli med i teamet vårt'
            },
            fi: {
                'nav.features': 'Ominaisuudet', 'nav.saved': 'Tallennetut', 'nav.signin': 'Kirjaudu sisään', 'nav.signup': 'Rekisteröidy',
                'nav.browse': 'Selaa kursseja', 'nav.quiz': 'Tee tietokilpailu', 'nav.analytics': 'Näytä analytiikka',
                'common.backHome': 'Takaisin etusivulle', 'common.submit': 'Lähetä', 'common.reset': 'Nollaa', 'common.apply': 'Hae nyt',
                'common.save': 'Tallenna', 'common.preview': 'Esikatselu', 'common.close': 'Sulje',
                'hero.title': 'Oppimisjärjestelmä', 'hero.subtitle': 'Luo, järjestä ja seuraa kursseja moderneilla käyttöliittymillä.',
                'hero.getStarted': 'Aloita', 'hero.createAccount': 'Luo tili', 'hero.learnMore': 'Lisätietoja',
                'quick.signin': 'Kirjaudu sisään', 'quick.browse': 'Selaa kursseja', 'quick.quiz': 'Tee tietokilpailu', 'quick.analytics': 'Näytä analytiikka',
                'testimonials.heading': 'Mitä käyttäjämme sanovat', 'faq.heading': 'Usein kysytyt kysymykset',
                'signin.title': 'Kirjaudu tilillesi', 'signin.helper': 'Tervetuloa takaisin. Syötä tietosi.',
                'signin.submit': 'Kirjaudu sisään', 'signin.remember': 'Muista minut', 'signin.forgot': 'Unohtuiko salasana?',
                'signup.title': 'Luo tilisi', 'signup.helper': 'Liity alustaan tänään.', 'signup.submit': 'Luo tili',
                'page.features': 'Kaikki ominaisuudet', 'page.courses': 'Selaa kurssejamme', 'page.quiz': 'Web-kehitys tietokilpailu',
                'page.analytics': 'Analytiikan yleiskuvaus', 'page.saved': 'Tallennetut kurssit', 'page.about': 'Tietoja meistä', 'page.careers': 'Liity joukkoomme'
            },
            vi: {
                'nav.features': 'Tính năng', 'nav.saved': 'Đã lưu', 'nav.signin': 'Đăng nhập', 'nav.signup': 'Đăng ký',
                'nav.browse': 'Duyệt khóa học', 'nav.quiz': 'Làm bài kiểm tra', 'nav.analytics': 'Xem phân tích',
                'common.backHome': 'Về trang chủ', 'common.submit': 'Gửi', 'common.reset': 'Đặt lại', 'common.apply': 'Ứng tuyển ngay',
                'common.save': 'Lưu', 'common.preview': 'Xem trước', 'common.close': 'Đóng',
                'hero.title': 'Hệ thống quản lý học tập', 'hero.subtitle': 'Tạo, tổ chức và theo dõi khóa học với giao diện hiện đại.',
                'hero.getStarted': 'Bắt đầu', 'hero.createAccount': 'Tạo tài khoản', 'hero.learnMore': 'Tìm hiểu thêm',
                'quick.signin': 'Đăng nhập', 'quick.browse': 'Duyệt khóa học', 'quick.quiz': 'Làm bài kiểm tra', 'quick.analytics': 'Xem phân tích',
                'testimonials.heading': 'Người dùng nói gì', 'faq.heading': 'Câu hỏi thường gặp',
                'signin.title': 'Đăng nhập vào tài khoản', 'signin.helper': 'Chào mừng trở lại. Vui lòng nhập thông tin của bạn.',
                'signin.submit': 'Đăng Nhập', 'signin.remember': 'Ghi nhớ đăng nhập', 'signin.forgot': 'Quên mật khẩu?',
                'signup.title': 'Tạo tài khoản của bạn', 'signup.helper': 'Tham gia nền tảng ngay hôm nay.', 'signup.submit': 'Tạo tài khoản',
                'page.features': 'Tất cả tính năng', 'page.courses': 'Duyệt khóa học của chúng tôi', 'page.quiz': 'Bài kiểm tra Phát triển Web',
                'page.analytics': 'Tổng quan phân tích', 'page.saved': 'Khóa học đã lưu', 'page.about': 'Về chúng tôi', 'page.careers': 'Tham gia đội ngũ'
            },
            th: {
                'nav.features': 'คุณสมบัติ', 'nav.saved': 'บันทึกไว้', 'nav.signin': 'เข้าสู่ระบบ', 'nav.signup': 'สมัครสมาชิก',
                'nav.browse': 'เรียกดูหลักสูตร', 'nav.quiz': 'ทำแบบทดสอบ', 'nav.analytics': 'ดูการวิเคราะห์',
                'common.backHome': 'กลับหน้าหลัก', 'common.submit': 'ส่ง', 'common.reset': 'รีเซ็ต', 'common.apply': 'สมัครเลย',
                'common.save': 'บันทึก', 'common.preview': 'ตัวอย่าง', 'common.close': 'ปิด',
                'hero.title': 'ระบบจัดการเรียนรู้', 'hero.subtitle': 'สร้าง จัดระเบียบ และติดตามหลักสูตรด้วยอินเทอร์เฟซที่ทันสมัย',
                'hero.getStarted': 'เริ่มต้น', 'hero.createAccount': 'สร้างบัญชี', 'hero.learnMore': 'เรียนรู้เพิ่มเติม',
                'quick.signin': 'เข้าสู่ระบบ', 'quick.browse': 'เรียกดูหลักสูตร', 'quick.quiz': 'ทำแบบทดสอบ', 'quick.analytics': 'ดูการวิเคราะห์',
                'testimonials.heading': 'สิ่งที่ผู้ใช้ของเราพูด', 'faq.heading': 'คำถามที่พบบ่อย',
                'signin.title': 'เข้าสู่ระบบบัญชีของคุณ', 'signin.helper': 'ยินดีต้อนรับกลับ กรุณากรอกข้อมูลของคุณ',
                'signin.submit': 'เข้าสู่ระบบ', 'signin.remember': 'จดจำฉัน', 'signin.forgot': 'ลืมรหัสผ่าน?',
                'signup.title': 'สร้างบัญชีของคุณ', 'signup.helper': 'เข้าร่วมแพลตฟอร์มวันนี้', 'signup.submit': 'สร้างบัญชี',
                'page.features': 'คุณสมบัติทั้งหมด', 'page.courses': 'เรียกดูหลักสูตรของเรา', 'page.quiz': 'แบบทดสอบการพัฒนาเว็บ',
                'page.analytics': 'ภาพรวมการวิเคราะห์', 'page.saved': 'หลักสูตรที่บันทึกไว้', 'page.about': 'เกี่ยวกับเรา', 'page.careers': 'เข้าร่วมทีมของเรา'
            }
        };
        function applyTranslations(lang) {
            const t = dict[lang] || dict.en;
            // Update text content for elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key && t[key]) {
                    // Check if element has nested span/text node or icon
                    const span = el.querySelector('span');
                    const icon = el.querySelector('i[data-lucide]');
                    if (span && !icon) {
                        // If it's like <a>Text <span>...</span></a>, update only the span content
                        span.textContent = t[key];
                    } else if (icon && span) {
                        // If it's like <a><span>Text</span> <i>...</i></a>, update only the span
                        span.textContent = t[key];
                    } else {
                        // Replace all text content but preserve icons and other elements
                        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim());
                        if (textNodes.length > 0) {
                            // Update first text node if exists
                            textNodes[0].textContent = t[key];
                            // Remove other text nodes
                            textNodes.slice(1).forEach(n => n.remove());
                        } else {
                            // No text nodes, replace all content but preserve non-text children
                            const children = Array.from(el.children);
                            el.textContent = t[key];
                            // Re-add non-text children (icons, etc.)
                            children.forEach(child => el.appendChild(child));
                        }
                    }
                }
            });
            // Update placeholder attributes
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (key && t[key]) el.placeholder = t[key];
            });
            // Update title attributes
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                if (key && t[key]) el.title = t[key];
            });
            // Update page title
            const pageTitleKey = document.documentElement.getAttribute('data-i18n-title-key');
            if (pageTitleKey && t[pageTitleKey]) {
                document.title = t[pageTitleKey] + ' • Learning Management System';
            }
        }
        // Expose translation function globally for dynamic content
        window.applyTranslations = applyTranslations;

        // Initialize icons after selectors are created
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            setTimeout(() => lucide.createIcons(), 100);
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
