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
    let bgColor = 'bg-gray-900 text-white';
    if (type === 'error') bgColor = 'bg-red-600 text-white';
    else if (type === 'success') bgColor = 'bg-green-600 text-white';
    div.className = `px-3 py-2 rounded shadow text-sm ${bgColor}`;
    div.textContent = message;
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    root.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Validation helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Authentication functions
// Make authenticateUser globally accessible for demo login button
window.authenticateUser = function authenticateUser(email, password) {
    try {
        // Get all registered users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('Attempting to authenticate:', email);
        console.log('Total users in storage:', users.length);

        // Find user by email
        const user = users.find(u => u.email === email);

        if (!user) {
            console.log('User not found:', email);
            toast('Invalid email or password', 'error');
            return false;
        }

        // In a real app, passwords would be hashed. For demo, we check plain text.
        if (user.password !== password) {
            console.log('Password mismatch for user:', email);
            toast('Invalid email or password', 'error');
            return false;
        }

        // Set authentication session
        const authData = {
            email: user.email,
            name: user.name,
            role: user.role || 'student',
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        console.log('Authentication successful:', authData);

        toast('Signed in successfully', 'success');

        // Redirect based on role
        setTimeout(() => {
            if (authData.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 500);

        return true;
    } catch (error) {
        console.error('Authentication error:', error);
        toast('An error occurred. Please try again.', 'error');
        return false;
    }
};

function registerUser(name, email, password) {
    try {
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            toast('An account with this email already exists', 'error');
            return false;
        }

        // Create new user (in production, password should be hashed)
        const newUser = {
            id: 'user-' + Date.now(),
            name: name,
            email: email,
            password: password, // In production, hash this!
            role: 'student', // Default role
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        toast('Account created successfully', 'success');

        // Auto-login after registration
        const authData = {
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('auth', JSON.stringify(authData));

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);

        return true;
    } catch (error) {
        toast('An error occurred. Please try again.', 'error');
        return false;
    }
}

function bindSignin() {
    const form = getEl('signinForm');
    if (!form) {
        console.log('Signin form not found');
        return;
    }
    console.log('Signin form found, binding events...');

    const email = getEl('email');
    const emailError = getEl('emailError');
    const password = getEl('password');
    const passwordError = getEl('passwordError');
    const toggle = getEl('togglePassword');
    const remember = getEl('rememberMe');
    const submit = getEl('signinSubmit');

    if (!email || !password || !submit) {
        console.error('Required form elements not found');
        return;
    }

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
        console.log('Form submitted');

        let ok = true;
        if (!emailRegex.test(email.value)) {
            emailError.classList.remove('hidden');
            ok = false;
        } else {
            emailError.classList.add('hidden');
        }

        if (!password.value) {
            passwordError.classList.remove('hidden');
            ok = false;
        } else {
            passwordError.classList.add('hidden');
        }

        if (!ok) {
            toast('Please fix the errors', 'error');
            return;
        }

        submit.disabled = true;
        submit.classList.add('opacity-60');

        try {
            remember.checked ? localStorage.setItem('auth.rememberEmail', email.value) : localStorage.removeItem('auth.rememberEmail');
        } catch { }

        // Authenticate user
        const success = authenticateUser(email.value, password.value);
        if (!success) {
            submit.disabled = false;
            submit.classList.remove('opacity-60');
        }
    });

    console.log('Signin form events bound successfully');
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

        // Register user
        const success = registerUser(name.value.trim(), email.value, password.value);
        if (!success) {
            submit.disabled = false;
            submit.classList.remove('opacity-60');
        }
    });
}

// Initialize default admin user if none exists
function initDefaultAdmin() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const adminExists = users.find(u => u.role === 'admin' && u.email === 'admin@lms.com');

        if (!adminExists) {
            const defaultAdmin = {
                id: 'admin-1',
                name: 'Admin User',
                email: 'admin@lms.com',
                password: 'admin123', // In production, this should be hashed!
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            users.push(defaultAdmin);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Default admin user created:', defaultAdmin.email);
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error initializing default admin:', error);
    }
}

// Update navigation based on authentication status
function updateNavigation() {
    try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const isAuthenticated = auth.email && auth.role;

        if (!isAuthenticated) return;

        const userName = auth.name || auth.email.split('@')[0];
        const dashboardUrl = auth.role === 'admin' ? 'admin.html' : 'dashboard.html';
        const dashboardText = auth.role === 'admin' ? 'Admin Dashboard' : 'Dashboard';

        // Handle simple headers (signin, signup, forgot pages)
        const simpleHeader = document.querySelector('header:not(#mainHeader)');
        if (simpleHeader) {
            // Check if header has language selector
            const langWrapper = simpleHeader.querySelector('#langSelectorWrapper');
            const headerContent = simpleHeader.querySelector('.max-w-6xl, .max-w-7xl');

            if (langWrapper && headerContent) {
                // Check if nav already added
                if (!headerContent.querySelector('[data-auth-nav]')) {
                    // Check if there's an existing nav element
                    const existingNav = headerContent.querySelector('nav');
                    let navContainer = existingNav;

                    if (!existingNav) {
                        // Create new nav container
                        navContainer = document.createElement('nav');
                        navContainer.className = 'hidden md:flex items-center gap-2';
                        navContainer.setAttribute('data-auth-nav', 'true');
                    } else {
                        // Use existing nav and mark it
                        existingNav.setAttribute('data-auth-nav', 'true');
                    }

                    // Check if user info already added
                    if (!navContainer.querySelector('[data-auth-user-info]')) {
                        const userInfo = document.createElement('span');
                        userInfo.className = 'text-sm text-gray-600';
                        userInfo.textContent = userName;
                        userInfo.setAttribute('data-auth-user-info', 'true');

                        const dashboardLink = document.createElement('a');
                        dashboardLink.href = dashboardUrl;
                        dashboardLink.className = 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all';
                        dashboardLink.textContent = dashboardText;

                        const separator = document.createElement('div');
                        separator.className = 'h-6 w-px bg-gray-300 mx-2';

                        const logoutBtn = document.createElement('button');
                        logoutBtn.className = 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all';
                        logoutBtn.innerHTML = '<i data-lucide="log-out" class="w-4 h-4 inline mr-1"></i><span>Logout</span>';
                        logoutBtn.addEventListener('click', () => {
                            localStorage.removeItem('auth');
                            window.location.href = 'index.html';
                        });

                        navContainer.appendChild(userInfo);
                        navContainer.appendChild(dashboardLink);
                        navContainer.appendChild(separator);
                        navContainer.appendChild(logoutBtn);

                        // Insert nav if it's new
                        if (!existingNav && langWrapper && langWrapper.parentElement) {
                            langWrapper.parentElement.insertBefore(navContainer, langWrapper);
                        } else if (!existingNav) {
                            headerContent.appendChild(navContainer);
                        }

                        setTimeout(() => {
                            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                                lucide.createIcons();
                            }
                        }, 100);
                    }
                }
            }
        }

        // Update desktop navigation sign-in links (full headers)
        const desktopSignInLinks = document.querySelectorAll('a[href="signin.html"]');
        desktopSignInLinks.forEach(link => {
            // Skip mobile menu links
            if (link.closest('#mobileMenu')) return;
            // Create a container for user info and logout
            const parent = link.parentElement;
            const nav = link.closest('nav');

            // Check if already updated
            if (link.hasAttribute('data-auth-updated')) return;
            link.setAttribute('data-auth-updated', 'true');

            // Remove the sign-in link
            link.remove();

            // Create user info container
            const userContainer = document.createElement('div');
            userContainer.className = 'flex items-center gap-2';

            // User email/name display
            const userInfo = document.createElement('span');
            userInfo.className = 'text-sm text-gray-600 hidden lg:block';
            userInfo.textContent = userName;
            userInfo.id = 'navUserEmail';

            // Dashboard link
            const dashboardLink = document.createElement('a');
            dashboardLink.href = dashboardUrl;
            dashboardLink.className = 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all';
            dashboardLink.textContent = dashboardText;

            // Separator
            const separator = document.createElement('div');
            separator.className = 'h-6 w-px bg-gray-300';

            // Logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all';
            logoutBtn.innerHTML = '<i data-lucide="log-out" class="w-4 h-4 inline mr-1"></i><span>Logout</span>';
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('auth');
                window.location.href = 'index.html';
            });

            userContainer.appendChild(userInfo);
            userContainer.appendChild(dashboardLink);
            userContainer.appendChild(separator);
            userContainer.appendChild(logoutBtn);

            // Insert before language selector or at the end of nav
            const langWrapper = nav?.querySelector('#langSelectorWrapper');
            if (langWrapper && langWrapper.parentElement) {
                // Insert before the separator or language wrapper
                const separator = langWrapper.previousElementSibling;
                if (separator && separator.classList.contains('h-6')) {
                    langWrapper.parentElement.insertBefore(userContainer, separator);
                } else {
                    langWrapper.parentElement.insertBefore(userContainer, langWrapper);
                }
            } else if (parent) {
                parent.appendChild(userContainer);
            }

            // Initialize icons
            setTimeout(() => {
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                }
            }, 100);
        });

        // Update mobile navigation
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            // Find mobile sign-in link
            const mobileSignInLink = mobileMenu.querySelector('a[href="signin.html"]');
            const mobileSignUpLink = mobileMenu.querySelector('a[href="signup.html"]');

            // Check if already updated
            if (mobileMenu.querySelector('[data-auth-mobile-updated]')) return;

            if (mobileSignInLink || mobileSignUpLink) {
                mobileMenu.setAttribute('data-auth-mobile-updated', 'true');

                // Get the parent container (usually a div with border-t or the last item)
                let parentContainer = null;
                if (mobileSignInLink) {
                    parentContainer = mobileSignInLink.closest('div.pt-2, div.border-t, div.mt-2');
                } else if (mobileSignUpLink) {
                    parentContainer = mobileSignUpLink.closest('div.pt-2, div.border-t, div.mt-2');
                }

                // Remove old sign-in and sign-up links
                if (mobileSignInLink) mobileSignInLink.remove();
                if (mobileSignUpLink) mobileSignUpLink.remove();

                // Create new user section
                const userSection = document.createElement('div');
                userSection.className = 'pt-2 mt-2 border-t border-gray-200';

                // User email display
                const mobileUserEmail = document.createElement('div');
                mobileUserEmail.className = 'px-4 py-2 text-sm text-gray-600';
                mobileUserEmail.textContent = auth.email;
                mobileUserEmail.id = 'mobileNavUserEmail';

                // Dashboard link
                const mobileDashboardLink = document.createElement('a');
                mobileDashboardLink.href = dashboardUrl;
                mobileDashboardLink.className = 'block w-full px-4 py-2.5 text-sm font-medium text-center text-violet-700 hover:bg-violet-50 rounded-lg transition-all mb-2';
                mobileDashboardLink.textContent = dashboardText;

                // Logout button
                const mobileLogoutBtn = document.createElement('button');
                mobileLogoutBtn.className = 'block w-full px-4 py-2.5 text-sm font-medium text-center text-red-600 hover:bg-red-50 rounded-lg transition-all';
                mobileLogoutBtn.innerHTML = '<i data-lucide="log-out" class="w-4 h-4 inline mr-1"></i><span>Logout</span>';
                mobileLogoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('auth');
                    window.location.href = 'index.html';
                });

                userSection.appendChild(mobileUserEmail);
                userSection.appendChild(mobileDashboardLink);
                userSection.appendChild(mobileLogoutBtn);

                // Insert into mobile menu
                if (parentContainer && parentContainer.parentElement) {
                    parentContainer.parentElement.insertBefore(userSection, parentContainer);
                    // Remove empty parent container if it has no other children
                    if (parentContainer.children.length === 0) {
                        parentContainer.remove();
                    }
                } else {
                    // Append to mobile menu nav
                    const nav = mobileMenu.querySelector('nav');
                    if (nav) {
                        nav.appendChild(userSection);
                    } else {
                        mobileMenu.appendChild(userSection);
                    }
                }

                // Initialize icons
                setTimeout(() => {
                    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                        lucide.createIcons();
                    }
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error updating navigation:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initDefaultAdmin(); // Initialize default admin user
    bindSignin();
    bindSignup();
    // Update navigation after a short delay to ensure language selector is initialized
    setTimeout(() => {
        updateNavigation(); // Update navigation based on auth status
    }, 200);
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
                'nav.browse': 'Browse courses', 'nav.quiz': 'Take a quiz', 'nav.analytics': 'View analytics', 'nav.users': 'Users', 'nav.courses': 'Courses',
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
                'features.cta.createAccount': 'Create your account', 'features.cta.browse': 'Browse courses',
                'start.badge': 'Start Your Learning Journey Today', 'start.hero.title1': 'Transform Your Future', 'start.hero.title2': 'Through Learning',
                'start.hero.subtitle': 'Join thousands of learners and educators. Access courses, track progress, earn achievements, and build your skills with our modern learning platform.',
                'start.hero.getStarted': 'Get Started Free', 'start.hero.signIn': 'Sign In', 'start.trust.learners': 'Active Learners', 'start.trust.courses': 'Courses',
                'start.trust.rating': 'Rating', 'start.features.title': 'Everything You Need to', 'start.features.title2': 'Succeed',
                'start.features.subtitle': 'Powerful features designed to enhance your learning experience',
                'start.feature.courses.title': 'Interactive Courses', 'start.feature.courses.desc': 'Access hundreds of courses across multiple categories. Learn at your own pace with progress tracking and completion certificates.',
                'start.feature.progress.title': 'Track Your Progress', 'start.feature.progress.desc': 'Set learning goals, track your study time, build streaks, and earn achievements as you progress through your courses.',
                'start.feature.achievements.title': 'Earn Achievements', 'start.feature.achievements.desc': 'Unlock badges and certificates as you complete courses and reach milestones. Showcase your learning journey.',
                'start.feature.quizzes.title': 'Take Quizzes', 'start.feature.quizzes.desc': 'Test your knowledge with interactive quizzes. Get instant feedback and track your scores over time.',
                'start.feature.streaks.title': 'Build Streaks', 'start.feature.streaks.desc': 'Maintain your learning momentum with daily study streaks. Stay motivated and build consistent learning habits.',
                'start.feature.analytics.title': 'Analytics Dashboard', 'start.feature.analytics.desc': 'View detailed analytics of your learning progress, time spent, courses completed, and performance metrics.',
                'start.how.title': 'Get Started in', 'start.how.title2': '3 Simple Steps', 'start.how.subtitle': 'Start learning in minutes, not hours',
                'start.how.step1.title': 'Create Account', 'start.how.step1.desc': 'Sign up for free in less than a minute. No credit card required. Get instant access to all features.',
                'start.how.step2.title': 'Browse Courses', 'start.how.step2.desc': 'Explore our extensive course library. Filter by category, level, or search for specific topics.',
                'start.how.step3.title': 'Start Learning', 'start.how.step3.desc': 'Enroll in courses, track your progress, earn achievements, and build your skills at your own pace.',
                'start.cta.badge': 'Ready to Transform Your Learning?', 'start.cta.title': 'Start Your Journey Today',
                'start.cta.desc': 'Join thousands of learners who are already building their skills and achieving their goals.',
                'start.cta.getStarted': 'Get Started Free', 'start.cta.signIn': 'Sign In', 'start.cta.free': '100% Free to Start',
                'start.cta.noCard': 'No Credit Card Required', 'start.cta.instant': 'Instant Access',
                'error404.title': 'Page not found', 'error404.message': 'The page you are looking for doesn\'t exist or has been moved.',
                'error404.goHome': 'Go home',
                'admin.welcome': 'Welcome back, Admin', 'admin.subtitle': 'Manage courses, users, and platform analytics from one central dashboard.',
                'admin.overview': 'Overview', 'admin.addCourse': 'Add New Course', 'admin.stats.totalCourses': 'Total Courses',
                'admin.stats.totalUsers': 'Total Users', 'admin.stats.totalEnrollments': 'Total Enrollments', 'admin.stats.activeUsers': 'Active Users',
                'admin.quickActions.title': 'Quick Actions', 'admin.quickActions.addCourse': 'Add New Course', 'admin.quickActions.manageUsers': 'Manage Users',
                'admin.quickActions.viewAnalytics': 'View Analytics', 'admin.quickActions.exportData': 'Export Data',
                'admin.courses.title': 'Course Management', 'admin.courses.search': 'Search courses...', 'admin.courses.filter': 'Filter',
                'admin.courses.addCourse': 'Add Course', 'admin.courses.actions': 'Actions', 'admin.courses.edit': 'Edit', 'admin.courses.delete': 'Delete',
                'admin.users.title': 'User Management', 'admin.users.search': 'Search users...', 'admin.users.view': 'View', 'admin.users.delete': 'Delete',
                'admin.analytics.title': 'Analytics', 'admin.analytics.coursePerformance': 'Course Performance', 'admin.analytics.enrollmentTrends': 'Enrollment Trends',
                'admin.analytics.recentActivity': 'Recent Activity', 'admin.exportCourses': 'Export Courses', 'admin.exportUsers': 'Export Users',
                'common.logout': 'Logout',
                'chat.title': 'Live Chat', 'chat.subtitle': 'Students & Community', 'chat.noMessages': 'No messages yet. Start the conversation!',
                'chat.inputPlaceholder': 'Type your message...', 'chat.info': 'Everyone can see your messages. Be respectful!',
                'chat.clearMessages': 'Clear all messages', 'chat.confirmClear': 'Are you sure you want to clear all messages?',
                'chat.clear': 'Clear'
            },
            fr: {
                'nav.features': 'Fonctionnalités', 'nav.saved': 'Favoris', 'nav.signin': 'Se connecter', 'nav.signup': 'Créer un compte',
                'nav.browse': 'Parcourir les cours', 'nav.quiz': 'Passer un quiz', 'nav.analytics': 'Voir les analyses',
                'common.backHome': "Retour à l'accueil", 'common.submit': 'Soumettre', 'common.reset': 'Réinitialiser', 'common.apply': 'Postuler',
                'common.save': 'Enregistrer', 'common.preview': 'Aperçu', 'common.close': 'Fermer', 'common.or': 'ou', 'common.logout': 'Déconnexion',
                'error404.title': 'Page introuvable', 'error404.message': 'La page que vous recherchez n\'existe pas ou a été déplacée.',
                'error404.goHome': 'Retour à l\'accueil',
                'admin.welcome': 'Bon retour, Admin', 'admin.subtitle': 'Gérez les cours, les utilisateurs et les analyses de la plateforme depuis un tableau de bord central.',
                'admin.overview': 'Vue d\'ensemble', 'admin.addCourse': 'Ajouter un nouveau cours', 'admin.stats.totalCourses': 'Total des cours',
                'admin.stats.totalUsers': 'Total des utilisateurs', 'admin.stats.totalEnrollments': 'Total des inscriptions', 'admin.stats.activeUsers': 'Utilisateurs actifs',
                'admin.quickActions.title': 'Actions rapides', 'admin.quickActions.addCourse': 'Ajouter un nouveau cours', 'admin.quickActions.manageUsers': 'Gérer les utilisateurs',
                'admin.quickActions.viewAnalytics': 'Voir les analyses', 'admin.quickActions.exportData': 'Exporter les données',
                'admin.courses.title': 'Gestion des cours', 'admin.courses.search': 'Rechercher des cours...', 'admin.courses.filter': 'Filtrer',
                'admin.courses.addCourse': 'Ajouter un cours', 'admin.courses.actions': 'Actions', 'admin.courses.edit': 'Modifier', 'admin.courses.delete': 'Supprimer',
                'admin.users.title': 'Gestion des utilisateurs', 'admin.users.search': 'Rechercher des utilisateurs...', 'admin.users.view': 'Voir', 'admin.users.delete': 'Supprimer',
                'admin.analytics.title': 'Analyses', 'admin.analytics.coursePerformance': 'Performance des cours', 'admin.analytics.enrollmentTrends': 'Tendances d\'inscription',
                'admin.analytics.recentActivity': 'Activité récente', 'admin.exportCourses': 'Exporter les cours', 'admin.exportUsers': 'Exporter les utilisateurs',
                'chat.title': 'Chat en direct', 'chat.subtitle': 'Étudiants et communauté', 'chat.noMessages': 'Aucun message pour le moment. Commencez la conversation !',
                'chat.inputPlaceholder': 'Tapez votre message...', 'chat.info': 'Tout le monde peut voir vos messages. Soyez respectueux !',
                'chat.clearMessages': 'Effacer tous les messages', 'chat.confirmClear': 'Êtes-vous sûr de vouloir effacer tous les messages ?',
                'chat.clear': 'Effacer',
                'dashboard.welcome': 'Bon retour', 'dashboard.continue': 'Continuez votre parcours d\'apprentissage',
                'dashboard.browseCourses': 'Parcourir les cours', 'dashboard.takeQuiz': 'Passer un quiz',
                'dashboard.myCourses': 'Mes cours', 'dashboard.viewAll': 'Voir tout', 'dashboard.recentActivity': 'Activité récente',
                'dashboard.noActivity': 'Aucune activité récente', 'dashboard.learningGoals': 'Objectifs d\'apprentissage',
                'dashboard.addGoal': 'Ajouter un objectif', 'dashboard.noGoals': 'Aucun objectif défini',
                'dashboard.achievements': 'Réalisations', 'dashboard.badges': 'badges', 'dashboard.noAchievements': 'Aucune réalisation pour le moment',
                'dashboard.studyStreak': 'Série d\'étude', 'dashboard.daysInRow': 'jours consécutifs',
                'dashboard.keepLearning': 'Continuez à apprendre pour construire votre série !', 'dashboard.studyTimer': 'Minuteur d\'étude',
                'dashboard.start': 'Démarrer', 'dashboard.stop': 'Arrêter', 'dashboard.reset': 'Réinitialiser',
                'dashboard.totalStudyTime': 'Temps d\'étude total aujourd\'hui', 'dashboard.recommended': 'Recommandé pour vous',
                'dashboard.viewCourse': 'Voir le cours', 'dashboard.noRecommendations': 'Aucune recommandation pour le moment',
                'dashboard.enrolled': 'Inscrits', 'dashboard.completed': 'Terminés', 'dashboard.quizScore': 'Score du quiz',
                'dashboard.studyTime': 'Temps d\'étude',
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
                'saved.continue': 'Continuer',
                'start.badge': 'Commencez votre parcours d\'apprentissage aujourd\'hui', 'start.hero.title1': 'Transformez votre avenir', 'start.hero.title2': 'Grâce à l\'apprentissage',
                'start.hero.subtitle': 'Rejoignez des milliers d\'apprenants et d\'éducateurs. Accédez aux cours, suivez vos progrès, gagnez des réalisations et développez vos compétences avec notre plateforme d\'apprentissage moderne.',
                'start.hero.getStarted': 'Commencer gratuitement', 'start.hero.signIn': 'Se connecter', 'start.trust.learners': 'Apprenants actifs', 'start.trust.courses': 'Cours',
                'start.trust.rating': 'Note', 'start.features.title': 'Tout ce dont vous avez besoin pour', 'start.features.title2': 'Réussir',
                'start.features.subtitle': 'Des fonctionnalités puissantes conçues pour améliorer votre expérience d\'apprentissage',
                'start.feature.courses.title': 'Cours interactifs', 'start.feature.courses.desc': 'Accédez à des centaines de cours dans plusieurs catégories. Apprenez à votre rythme avec suivi des progrès et certificats de complétion.',
                'start.feature.progress.title': 'Suivez vos progrès', 'start.feature.progress.desc': 'Définissez des objectifs d\'apprentissage, suivez votre temps d\'étude, créez des séries et gagnez des réalisations au fur et à mesure de vos cours.',
                'start.feature.achievements.title': 'Gagnez des réalisations', 'start.feature.achievements.desc': 'Débloquez des badges et certificats en complétant des cours et en atteignant des jalons. Présentez votre parcours d\'apprentissage.',
                'start.feature.quizzes.title': 'Passez des quiz', 'start.feature.quizzes.desc': 'Testez vos connaissances avec des quiz interactifs. Obtenez des commentaires instantanés et suivez vos scores au fil du temps.',
                'start.feature.streaks.title': 'Créez des séries', 'start.feature.streaks.desc': 'Maintenez votre élan d\'apprentissage avec des séries d\'étude quotidiennes. Restez motivé et développez des habitudes d\'apprentissage cohérentes.',
                'start.feature.analytics.title': 'Tableau de bord analytique', 'start.feature.analytics.desc': 'Consultez des analyses détaillées de vos progrès d\'apprentissage, temps passé, cours complétés et métriques de performance.',
                'start.how.title': 'Commencez en', 'start.how.title2': '3 étapes simples', 'start.how.subtitle': 'Commencez à apprendre en minutes, pas en heures',
                'start.how.step1.title': 'Créer un compte', 'start.how.step1.desc': 'Inscrivez-vous gratuitement en moins d\'une minute. Aucune carte de crédit requise. Accédez instantanément à toutes les fonctionnalités.',
                'start.how.step2.title': 'Parcourir les cours', 'start.how.step2.desc': 'Explorez notre vaste bibliothèque de cours. Filtrez par catégorie, niveau ou recherchez des sujets spécifiques.',
                'start.how.step3.title': 'Commencer à apprendre', 'start.how.step3.desc': 'Inscrivez-vous aux cours, suivez vos progrès, gagnez des réalisations et développez vos compétences à votre rythme.',
                'start.cta.badge': 'Prêt à transformer votre apprentissage ?', 'start.cta.title': 'Commencez votre parcours aujourd\'hui',
                'start.cta.desc': 'Rejoignez des milliers d\'apprenants qui développent déjà leurs compétences et atteignent leurs objectifs.',
                'start.cta.getStarted': 'Commencer gratuitement', 'start.cta.signIn': 'Se connecter', 'start.cta.free': '100% gratuit pour commencer',
                'start.cta.noCard': 'Aucune carte de crédit requise', 'start.cta.instant': 'Accès instantané'
            },
            es: {
                'nav.features': 'Funciones', 'nav.saved': 'Guardados', 'nav.signin': 'Iniciar sesión', 'nav.signup': 'Crear cuenta',
                'nav.browse': 'Explorar cursos', 'nav.quiz': 'Hacer un quiz', 'nav.analytics': 'Ver analíticas',
                'common.backHome': 'Volver al inicio', 'common.submit': 'Enviar', 'common.reset': 'Restablecer', 'common.apply': 'Aplicar ahora',
                'common.save': 'Guardar', 'common.preview': 'Vista previa', 'common.close': 'Cerrar', 'common.or': 'o', 'common.logout': 'Cerrar sesión',
                'error404.title': 'Página no encontrada', 'error404.message': 'La página que buscas no existe o ha sido movida.',
                'error404.goHome': 'Ir al inicio',
                'admin.welcome': 'Bienvenido de nuevo, Admin', 'admin.subtitle': 'Administra cursos, usuarios y análisis de la plataforma desde un panel central.',
                'admin.overview': 'Resumen', 'admin.addCourse': 'Agregar nuevo curso', 'admin.stats.totalCourses': 'Total de cursos',
                'admin.stats.totalUsers': 'Total de usuarios', 'admin.stats.totalEnrollments': 'Total de inscripciones', 'admin.stats.activeUsers': 'Usuarios activos',
                'admin.quickActions.title': 'Acciones rápidas', 'admin.quickActions.addCourse': 'Agregar nuevo curso', 'admin.quickActions.manageUsers': 'Gestionar usuarios',
                'admin.quickActions.viewAnalytics': 'Ver analíticas', 'admin.quickActions.exportData': 'Exportar datos',
                'admin.courses.title': 'Gestión de cursos', 'admin.courses.search': 'Buscar cursos...', 'admin.courses.filter': 'Filtrar',
                'admin.courses.addCourse': 'Agregar curso', 'admin.courses.actions': 'Acciones', 'admin.courses.edit': 'Editar', 'admin.courses.delete': 'Eliminar',
                'admin.users.title': 'Gestión de usuarios', 'admin.users.search': 'Buscar usuarios...', 'admin.users.view': 'Ver', 'admin.users.delete': 'Eliminar',
                'admin.analytics.title': 'Analíticas', 'admin.analytics.coursePerformance': 'Rendimiento del curso', 'admin.analytics.enrollmentTrends': 'Tendencias de inscripción',
                'admin.analytics.recentActivity': 'Actividad reciente', 'admin.exportCourses': 'Exportar cursos', 'admin.exportUsers': 'Exportar usuarios',
                'chat.title': 'Chat en vivo', 'chat.subtitle': 'Estudiantes y comunidad', 'chat.noMessages': 'Aún no hay mensajes. ¡Inicia la conversación!',
                'chat.inputPlaceholder': 'Escribe tu mensaje...', 'chat.info': 'Todos pueden ver tus mensajes. ¡Sé respetuoso!',
                'chat.clearMessages': 'Borrar todos los mensajes', 'chat.confirmClear': '¿Estás seguro de que quieres borrar todos los mensajes?',
                'chat.clear': 'Borrar',
                'dashboard.welcome': 'Bienvenido de nuevo', 'dashboard.continue': 'Continúa tu viaje de aprendizaje',
                'dashboard.browseCourses': 'Explorar cursos', 'dashboard.takeQuiz': 'Hacer un quiz',
                'dashboard.myCourses': 'Mis cursos', 'dashboard.viewAll': 'Ver todo', 'dashboard.recentActivity': 'Actividad reciente',
                'dashboard.noActivity': 'Sin actividad reciente', 'dashboard.learningGoals': 'Objetivos de aprendizaje',
                'dashboard.addGoal': 'Agregar objetivo', 'dashboard.noGoals': 'No se han establecido objetivos',
                'dashboard.achievements': 'Logros', 'dashboard.badges': 'insignias', 'dashboard.noAchievements': 'Aún no hay logros',
                'dashboard.studyStreak': 'Racha de estudio', 'dashboard.daysInRow': 'días seguidos',
                'dashboard.keepLearning': '¡Sigue aprendiendo para construir tu racha!', 'dashboard.studyTimer': 'Temporizador de estudio',
                'dashboard.start': 'Iniciar', 'dashboard.stop': 'Detener', 'dashboard.reset': 'Restablecer',
                'dashboard.totalStudyTime': 'Tiempo total de estudio hoy', 'dashboard.recommended': 'Recomendado para ti',
                'dashboard.viewCourse': 'Ver curso', 'dashboard.noRecommendations': 'Aún no hay recomendaciones',
                'dashboard.enrolled': 'Inscritos', 'dashboard.completed': 'Completados', 'dashboard.quizScore': 'Puntuación del quiz',
                'dashboard.studyTime': 'Tiempo de estudio',
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
                'common.save': 'Speichern', 'common.preview': 'Vorschau', 'common.close': 'Schließen', 'common.logout': 'Abmelden',
                'dashboard.welcome': 'Willkommen zurück', 'dashboard.continue': 'Setzen Sie Ihre Lernreise fort',
                'dashboard.browseCourses': 'Kurse durchsuchen', 'dashboard.takeQuiz': 'Quiz machen',
                'dashboard.myCourses': 'Meine Kurse', 'dashboard.viewAll': 'Alle anzeigen', 'dashboard.recentActivity': 'Letzte Aktivität',
                'dashboard.noActivity': 'Keine aktuelle Aktivität', 'dashboard.learningGoals': 'Lernziele',
                'dashboard.addGoal': 'Ziel hinzufügen', 'dashboard.noGoals': 'Noch keine Ziele gesetzt',
                'dashboard.achievements': 'Erfolge', 'dashboard.badges': 'Abzeichen', 'dashboard.noAchievements': 'Noch keine Erfolge',
                'dashboard.studyStreak': 'Lernserie', 'dashboard.daysInRow': 'Tage in Folge',
                'dashboard.keepLearning': 'Lernen Sie weiter, um Ihre Serie aufzubauen!', 'dashboard.studyTimer': 'Lerntimer',
                'dashboard.start': 'Starten', 'dashboard.stop': 'Stoppen', 'dashboard.reset': 'Zurücksetzen',
                'dashboard.totalStudyTime': 'Gesamte Lernzeit heute', 'dashboard.recommended': 'Empfohlen für Sie',
                'dashboard.viewCourse': 'Kurs anzeigen', 'dashboard.noRecommendations': 'Noch keine Empfehlungen',
                'dashboard.enrolled': 'Eingeschrieben', 'dashboard.completed': 'Abgeschlossen', 'dashboard.quizScore': 'Quiz-Punktzahl',
                'dashboard.studyTime': 'Lernzeit',
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
                'common.save': 'Salvar', 'common.preview': 'Visualizar', 'common.close': 'Fechar', 'common.logout': 'Sair',
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
                'common.save': 'Salva', 'common.preview': 'Anteprima', 'common.close': 'Chiudi', 'common.logout': 'Esci',
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
                'common.save': 'حفظ', 'common.preview': 'معاينة', 'common.close': 'إغلاق', 'common.logout': 'تسجيل الخروج',
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
                'common.save': '保存', 'common.preview': '预览', 'common.close': '关闭', 'common.logout': '登出',
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
                'common.save': 'सहेजें', 'common.preview': 'पूर्वावलोकन', 'common.close': 'बंद करें', 'common.logout': 'लॉगआउट',
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
                'common.save': '保存', 'common.preview': 'プレビュー', 'common.close': '閉じる', 'common.logout': 'ログアウト',
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
                'common.save': 'Сохранить', 'common.preview': 'Предпросмотр', 'common.close': 'Закрыть', 'common.logout': 'Выйти',
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
                'common.save': '저장', 'common.preview': '미리보기', 'common.close': '닫기', 'common.logout': '로그아웃',
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
                'common.save': 'Kaydet', 'common.preview': 'Önizleme', 'common.close': 'Kapat', 'common.logout': 'Çıkış yap',
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
                'common.save': 'Opslaan', 'common.preview': 'Voorvertoning', 'common.close': 'Sluiten', 'common.logout': 'Uitloggen',
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
                'common.save': 'Zapisz', 'common.preview': 'Podgląd', 'common.close': 'Zamknij', 'common.logout': 'Wyloguj',
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
                'common.save': 'Spara', 'common.preview': 'Förhandsgranska', 'common.close': 'Stäng', 'common.logout': 'Logga ut',
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

    // Live Chat Feature (dashboard and admin pages)
    (function initLiveChat() {
        // Only initialize chat on dashboard or admin pages
        const currentPage = window.location.pathname.split('/').pop() || window.location.href;
        const isDashboard = currentPage === 'dashboard.html' || currentPage.includes('dashboard.html');
        const isAdmin = currentPage === 'admin.html' || currentPage.includes('admin.html');

        if (!isDashboard && !isAdmin) {
            return; // Don't initialize chat on other pages
        }

        // Check if user is admin
        function isAdminUser() {
            try {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                return auth.role === 'admin';
            } catch {
                return false;
            }
        }

        const isAdminMode = isAdminUser();

        // Chat storage key
        const CHAT_STORAGE_KEY = 'lms.chat.messages';
        const MAX_MESSAGES = 100; // Limit stored messages

        // Get current user info
        function getCurrentUser() {
            try {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                return {
                    name: auth.name || 'Guest',
                    email: auth.email || 'guest@example.com',
                    role: auth.role || 'guest'
                };
            } catch {
                return { name: 'Guest', email: 'guest@example.com', role: 'guest' };
            }
        }

        // Get messages from storage
        function getMessages() {
            try {
                return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
            } catch {
                return [];
            }
        }

        // Save messages to storage
        function saveMessages(messages) {
            try {
                // Keep only last MAX_MESSAGES messages
                const limited = messages.slice(-MAX_MESSAGES);
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(limited));
            } catch (error) {
                console.error('Failed to save chat messages:', error);
            }
        }

        // Add a new message
        function addMessage(text) {
            if (!text || !text.trim()) return;

            const user = getCurrentUser();
            const messages = getMessages();
            const newMessage = {
                id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                text: text.trim(),
                user: user.name,
                email: user.email,
                role: user.role,
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };

            messages.push(newMessage);
            saveMessages(messages);
            return newMessage;
        }

        // Get unique users from messages
        function getUniqueUsers() {
            const messages = getMessages();
            const userMap = new Map();
            messages.forEach(msg => {
                if (!userMap.has(msg.email)) {
                    userMap.set(msg.email, {
                        name: msg.user,
                        email: msg.email,
                        role: msg.role,
                        messageCount: 0
                    });
                }
                userMap.get(msg.email).messageCount++;
            });
            return Array.from(userMap.values());
        }

        // Get chat statistics
        function getChatStats() {
            const messages = getMessages();
            const users = getUniqueUsers();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayMessages = messages.filter(msg => new Date(msg.timestamp) >= today);

            return {
                totalMessages: messages.length,
                totalUsers: users.length,
                todayMessages: todayMessages.length,
                adminMessages: messages.filter(m => m.role === 'admin').length,
                studentMessages: messages.filter(m => m.role === 'student').length
            };
        }

        // Create chat UI as a page section
        function createChatUI() {
            // Check if chat already exists
            if (document.getElementById('liveChatSection')) return;

            // Find the main content area or create a section
            const main = document.querySelector('main');
            if (!main) {
                console.warn('Main element not found, chat section will be added to body');
            }

            const chatSection = document.createElement('section');
            chatSection.id = 'liveChatSection';
            chatSection.className = 'mb-8 mt-12';

            // Admin mode: Advanced chat interface
            if (isAdminMode) {
                chatSection.innerHTML = `
                    <!-- Advanced Admin Chat Container -->
                    <div class="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                        <!-- Admin Chat Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-red-600 via-red-600 to-orange-600 text-white">
                            <div class="flex items-center gap-3">
                                <div class="relative">
                                    <div class="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <div class="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <div>
                                    <h2 class="font-semibold text-xl flex items-center gap-2">
                                        <span>Admin Chat Control</span>
                                        <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">ADMIN</span>
                                    </h2>
                                    <p class="text-sm text-red-100/90 font-medium">Moderation & Analytics Dashboard</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button id="chatStatsBtn" class="text-white/90 hover:text-white transition-all p-2 rounded-lg hover:bg-white/15 active:bg-white/20 flex items-center gap-2" 
                                    aria-label="View statistics" title="View chat statistics">
                                    <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
                                </button>
                                <button id="chatExportBtn" class="text-white/90 hover:text-white transition-all p-2 rounded-lg hover:bg-white/15 active:bg-white/20 flex items-center gap-2" 
                                    aria-label="Export messages" title="Export all messages">
                                    <i data-lucide="download" class="w-4 h-4"></i>
                                </button>
                                <button id="chatClearBtn" class="text-white/90 hover:text-white transition-all p-2 rounded-lg hover:bg-white/15 active:bg-white/20 flex items-center gap-2" 
                                    aria-label="Clear messages" title="Clear all messages">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    <span class="text-sm font-medium">Clear</span>
                                </button>
                            </div>
                        </div>

                        <!-- Admin Controls Bar -->
                        <div class="px-6 py-3 border-b border-gray-200/60 bg-gray-50 flex flex-wrap items-center gap-3">
                            <div class="flex-1 min-w-[200px]">
                                <input type="text" 
                                    id="chatSearchInput" 
                                    placeholder="Search messages..."
                                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-white">
                            </div>
                            <select id="chatFilterRole" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-white">
                                <option value="all">All Roles</option>
                                <option value="admin">Admin Only</option>
                                <option value="student">Students Only</option>
                            </select>
                            <select id="chatFilterUser" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-white">
                                <option value="all">All Users</option>
                            </select>
                            <button id="chatToggleUsers" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-all bg-white flex items-center gap-2">
                                <i data-lucide="users" class="w-4 h-4"></i>
                                <span>Users</span>
                            </button>
                        </div>

                        <div class="flex">
                            <!-- User List Sidebar (Admin Only) -->
                            <div id="chatUsersSidebar" class="hidden w-64 border-r border-gray-200/60 bg-gray-50 flex flex-col">
                                <div class="px-4 py-3 border-b border-gray-200/60 bg-white">
                                    <h3 class="font-semibold text-sm text-gray-700">Active Users</h3>
                                    <p class="text-xs text-gray-500 mt-1" id="chatUsersCount">0 users</p>
                                </div>
                                <div id="chatUsersList" class="flex-1 overflow-y-auto p-2">
                                    <!-- User list will be populated here -->
                                </div>
                            </div>

                            <!-- Main Chat Area -->
                            <div class="flex-1 flex flex-col">
                                <!-- Messages Container -->
                                <div id="chatMessages" class="h-[500px] overflow-y-auto px-6 py-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth" style="scrollbar-width: thin; scrollbar-color: rgba(156, 163, 175, 0.5) transparent;">
                                    <style>
                                        #chatMessages::-webkit-scrollbar {
                                            width: 6px;
                                        }
                                        #chatMessages::-webkit-scrollbar-track {
                                            background: transparent;
                                        }
                                        #chatMessages::-webkit-scrollbar-thumb {
                                            background-color: rgba(156, 163, 175, 0.5);
                                            border-radius: 3px;
                                        }
                                        #chatMessages::-webkit-scrollbar-thumb:hover {
                                            background-color: rgba(156, 163, 175, 0.7);
                                        }
                                    </style>
                                    <div class="text-center text-sm text-gray-500 py-8" data-i18n="chat.noMessages">No messages yet. Start the conversation!</div>
                                </div>

                                <!-- Chat Input -->
                                <div class="px-6 py-4 border-t border-gray-200/60 bg-white">
                                    <div class="flex gap-2.5 items-end">
                                        <div class="flex-1 relative">
                                            <input type="text" 
                                                id="chatInput" 
                                                placeholder="Type your message or announcement..."
                                                data-i18n-placeholder="chat.inputPlaceholder"
                                                class="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-gray-50 focus:bg-white text-sm"
                                                maxlength="500">
                                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" id="charCount">0/500</span>
                                        </div>
                                        <button id="chatSendBtn" 
                                            class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[44px]"
                                            aria-label="Send message">
                                            <i data-lucide="send" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2.5 flex items-center gap-1.5">
                                        <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                                        <span>Admin mode: You can moderate messages and view analytics</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Modal -->
                    <div id="chatStatsModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-orange-600 text-white">
                                <h3 class="font-semibold text-lg">Chat Statistics</h3>
                                <button id="chatStatsClose" class="text-white/90 hover:text-white transition-all p-1 rounded-lg hover:bg-white/15">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <div id="chatStatsContent" class="p-6">
                                <!-- Stats will be populated here -->
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Regular user mode: Simple chat interface
                chatSection.innerHTML = `
                    <!-- Chat Section Container -->
                    <div class="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                        <!-- Chat Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-violet-600 via-violet-600 to-purple-600 text-white">
                            <div class="flex items-center gap-3">
                                <div class="relative">
                                    <div class="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <div class="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <div>
                                    <h2 class="font-semibold text-xl" data-i18n="chat.title">Live Chat</h2>
                                    <p class="text-sm text-violet-100/90 font-medium" data-i18n="chat.subtitle">Students & Community</p>
                                </div>
                            </div>
                            <button id="chatClearBtn" class="text-white/90 hover:text-white transition-all p-2 rounded-lg hover:bg-white/15 active:bg-white/20 flex items-center gap-2" 
                                aria-label="Clear messages" title="Clear all messages">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                <span class="text-sm font-medium" data-i18n="chat.clear">Clear</span>
                            </button>
                        </div>

                        <!-- Messages Container -->
                        <div id="chatMessages" class="h-[500px] overflow-y-auto px-6 py-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth" style="scrollbar-width: thin; scrollbar-color: rgba(156, 163, 175, 0.5) transparent;">
                            <style>
                                #chatMessages::-webkit-scrollbar {
                                    width: 6px;
                                }
                                #chatMessages::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                #chatMessages::-webkit-scrollbar-thumb {
                                    background-color: rgba(156, 163, 175, 0.5);
                                    border-radius: 3px;
                                }
                                #chatMessages::-webkit-scrollbar-thumb:hover {
                                    background-color: rgba(156, 163, 175, 0.7);
                                }
                            </style>
                            <div class="text-center text-sm text-gray-500 py-8" data-i18n="chat.noMessages">No messages yet. Start the conversation!</div>
                        </div>

                        <!-- Chat Input -->
                        <div class="px-6 py-4 border-t border-gray-200/60 bg-white">
                            <div class="flex gap-2.5 items-end">
                                <div class="flex-1 relative">
                                    <input type="text" 
                                        id="chatInput" 
                                        placeholder="Type your message..."
                                        data-i18n-placeholder="chat.inputPlaceholder"
                                        class="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all bg-gray-50 focus:bg-white text-sm"
                                        maxlength="500">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" id="charCount">0/500</span>
                                </div>
                                <button id="chatSendBtn" 
                                    class="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[44px]"
                                    aria-label="Send message">
                                    <i data-lucide="send" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-2.5 flex items-center gap-1.5" data-i18n="chat.info">
                                <i data-lucide="info" class="w-3.5 h-3.5"></i>
                                <span>Everyone can see your messages. Be respectful!</span>
                            </p>
                        </div>
                    </div>
                `;
            }

            // Insert chat section into main content or body
            if (main) {
                main.appendChild(chatSection);
            } else {
                document.body.appendChild(chatSection);
            }

            // Initialize Lucide icons for chat
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                setTimeout(() => {
                    const chatIcons = chatSection.querySelectorAll('[data-lucide]');
                    lucide.createIcons({ icons: chatIcons });
                }, 100);
            }

            // Chat functionality
            const clearBtn = document.getElementById('chatClearBtn');
            const chatInput = document.getElementById('chatInput');
            const chatSendBtn = document.getElementById('chatSendBtn');
            const chatMessages = document.getElementById('chatMessages');
            const charCount = document.getElementById('charCount');

            // Throttled character count update
            let charCountTimeout = null;
            function updateCharCount() {
                if (!charCount) return;

                // Debounce to avoid excessive updates
                if (charCountTimeout) {
                    clearTimeout(charCountTimeout);
                }

                charCountTimeout = setTimeout(() => {
                    const count = chatInput.value.length;
                    charCount.textContent = `${count}/500`;
                    if (count > 450) {
                        charCount.classList.add('text-orange-500');
                        charCount.classList.remove('text-gray-400');
                    } else {
                        charCount.classList.remove('text-orange-500');
                        charCount.classList.add('text-gray-400');
                    }
                }, 100);
            }

            // Focus input when section is visible
            function focusChatInput() {
                if (chatInput && document.getElementById('liveChatSection')) {
                    const rect = chatSection.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    if (isVisible) {
                        chatInput.focus();
                    }
                }
            }

            // Optimized message loading with document fragment
            let lastRenderedMessages = null;

            function loadMessages() {
                const messages = getMessages();

                // Skip re-render if messages haven't changed
                const messagesKey = JSON.stringify(messages.map(m => m.id));
                if (lastRenderedMessages === messagesKey && chatMessages.children.length > 0) {
                    return;
                }
                lastRenderedMessages = messagesKey;

                // Use document fragment for batch DOM updates
                const fragment = document.createDocumentFragment();
                chatMessages.innerHTML = '';

                if (messages.length === 0) {
                    const emptyMsg = document.createElement('div');
                    emptyMsg.className = 'text-center text-sm text-gray-500 py-4';
                    emptyMsg.setAttribute('data-i18n', 'chat.noMessages');
                    emptyMsg.textContent = 'No messages yet. Start the conversation!';
                    fragment.appendChild(emptyMsg);
                    chatMessages.appendChild(fragment);
                    return;
                }

                // Group messages by date
                let currentDate = '';
                messages.forEach((msg, index) => {
                    const msgDate = new Date(msg.timestamp);
                    const dateStr = msgDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    // Add date separator if date changed
                    if (dateStr !== currentDate) {
                        currentDate = dateStr;
                        const dateDivider = document.createElement('div');
                        dateDivider.className = 'flex items-center gap-3 my-5';
                        const line = document.createElement('div');
                        line.className = 'flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent';
                        const dateLabel = document.createElement('div');
                        dateLabel.className = 'text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded-full font-medium';
                        dateLabel.textContent = dateStr;
                        const line2 = document.createElement('div');
                        line2.className = 'flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent';
                        dateDivider.appendChild(line);
                        dateDivider.appendChild(dateLabel);
                        dateDivider.appendChild(line2);
                        fragment.appendChild(dateDivider);
                    }

                    const messageEl = createMessageElement(msg, index);
                    fragment.appendChild(messageEl);
                });

                // Batch DOM update
                chatMessages.appendChild(fragment);

                // Smooth scroll to bottom using requestAnimationFrame
                requestAnimationFrame(() => {
                    chatMessages.scrollTo({
                        top: chatMessages.scrollHeight,
                        behavior: 'smooth'
                    });
                });
            }

            // Create message element
            function createMessageElement(msg, index) {
                const user = getCurrentUser();
                const isOwnMessage = msg.email === user.email;
                const prevMsg = index > 0 ? getMessages()[index - 1] : null;
                const showAvatar = !prevMsg || prevMsg.email !== msg.email ||
                    (new Date(msg.timestamp) - new Date(prevMsg.timestamp)) > 300000; // 5 minutes

                const messageDiv = document.createElement('div');
                messageDiv.className = `flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2 group`;

                // Avatar (only for others' messages and when needed)
                if (!isOwnMessage && showAvatar) {
                    const avatar = document.createElement('div');
                    avatar.className = 'w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-md ring-2 ring-white';
                    avatar.textContent = msg.user.charAt(0).toUpperCase();
                    messageDiv.appendChild(avatar);
                } else if (!isOwnMessage) {
                    const spacer = document.createElement('div');
                    spacer.className = 'w-9 flex-shrink-0';
                    messageDiv.appendChild(spacer);
                }

                const messageWrapper = document.createElement('div');
                messageWrapper.className = `flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[78%]`;

                // User name (only show if new message from different user or time gap)
                if (showAvatar || isOwnMessage) {
                    const userName = document.createElement('div');
                    userName.className = `text-xs font-semibold mb-1.5 px-1.5 ${isOwnMessage ? 'text-violet-600' : 'text-gray-700'}`;
                    userName.textContent = msg.user + (msg.role === 'admin' ? ' 👑' : msg.role === 'student' ? ' 🎓' : '');
                    messageWrapper.appendChild(userName);
                }

                const messageContent = document.createElement('div');
                messageContent.className = `${isOwnMessage ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md' : isAdminMode && msg.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md' : 'bg-white border border-gray-200/80 shadow-sm'} rounded-2xl ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'} px-4 py-2.5 hover:shadow-md transition-all relative group`;

                const messageText = document.createElement('div');
                messageText.className = `text-sm leading-relaxed ${isOwnMessage || (isAdminMode && msg.role === 'admin') ? 'text-white' : 'text-gray-800'} break-words whitespace-pre-wrap`;
                messageText.textContent = msg.text;

                const messageTime = document.createElement('div');
                messageTime.className = `text-xs mt-2 flex items-center gap-1 ${isOwnMessage || (isAdminMode && msg.role === 'admin') ? 'text-white/90' : 'text-gray-500'}`;
                messageTime.innerHTML = `<span>${msg.time}</span>`;
                if (isOwnMessage) {
                    const checkIcon = document.createElement('i');
                    checkIcon.setAttribute('data-lucide', 'check');
                    checkIcon.className = 'w-3 h-3';
                    messageTime.appendChild(checkIcon);
                }

                // Admin delete button
                if (isAdminMode) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600';
                    deleteBtn.setAttribute('data-message-id', msg.id);
                    deleteBtn.setAttribute('aria-label', 'Delete message');
                    deleteBtn.innerHTML = '<i data-lucide="x" class="w-3 h-3"></i>';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Delete this message?')) {
                            deleteMessage(msg.id);
                        }
                    });
                    messageContent.appendChild(deleteBtn);
                }

                messageContent.appendChild(messageText);
                messageContent.appendChild(messageTime);
                messageWrapper.appendChild(messageContent);
                messageDiv.appendChild(messageWrapper);

                // Optimized animation using will-change and requestAnimationFrame
                messageDiv.style.willChange = 'opacity, transform';
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(10px)';
                requestAnimationFrame(() => {
                    messageDiv.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                    messageDiv.style.opacity = '1';
                    messageDiv.style.transform = 'translateY(0)';
                    // Remove will-change after animation
                    setTimeout(() => {
                        messageDiv.style.willChange = 'auto';
                    }, 200);
                });

                return messageDiv;
            }

            // Optimized send message
            function sendMessage() {
                const text = chatInput.value.trim();
                if (!text) return;

                // Disable send button to prevent double-sends
                chatSendBtn.disabled = true;

                const newMessage = addMessage(text);
                if (newMessage) {
                    chatInput.value = '';
                    updateCharCount();

                    // Use requestAnimationFrame for smooth updates
                    requestAnimationFrame(() => {
                        loadMessages();
                        if (isAdminMode) {
                            updateUsersList();
                            updateUserFilter();
                        }
                        chatSendBtn.disabled = false;
                    });
                } else {
                    chatSendBtn.disabled = false;
                }
            }

            // Badge update removed - no longer needed for section-based chat

            // Clear only current user's messages
            function clearMessages() {
                // Get translation for confirm dialog
                const savedLang = localStorage.getItem('ui.lang') || 'en';
                const translations = {
                    en: 'Are you sure you want to clear your messages? This will only delete your own messages, not messages from others.',
                    fr: 'Êtes-vous sûr de vouloir effacer vos messages ? Cela supprimera uniquement vos propres messages, pas ceux des autres.',
                    es: '¿Estás seguro de que quieres borrar tus mensajes? Esto solo eliminará tus propios mensajes, no los de otros.'
                };
                const confirmText = translations[savedLang] || translations.en;

                if (confirm(confirmText)) {
                    try {
                        const user = getCurrentUser();
                        const allMessages = getMessages();

                        // Filter out only the current user's messages
                        const otherUsersMessages = allMessages.filter(msg => msg.email !== user.email);

                        // Save only other users' messages
                        saveMessages(otherUsersMessages);

                        loadMessages();

                        const successMessages = {
                            en: 'Your messages have been cleared',
                            fr: 'Vos messages ont été effacés',
                            es: 'Tus mensajes han sido borrados'
                        };
                        toast(successMessages[savedLang] || successMessages.en, 'success');
                    } catch (error) {
                        toast('Failed to clear messages', 'error');
                    }
                }
            }

            // Optimized auto-refresh with throttling
            let lastMessageCount = 0;
            let refreshInterval = null;

            function optimizedRefresh() {
                const messages = getMessages();
                // Only reload if message count changed
                if (messages.length !== lastMessageCount) {
                    lastMessageCount = messages.length;
                    loadMessages();
                }
            }

            // Use requestAnimationFrame for smooth updates
            function startRefreshLoop() {
                if (refreshInterval) clearInterval(refreshInterval);
                refreshInterval = setInterval(() => {
                    requestAnimationFrame(optimizedRefresh);
                }, 3000); // Check every 3 seconds
            }

            // Admin-specific functions
            function deleteMessage(messageId) {
                const messages = getMessages();
                const filtered = messages.filter(m => m.id !== messageId);
                saveMessages(filtered);
                loadMessages();
                updateUsersList();
                toast('Message deleted', 'success');
            }

            function updateUsersList() {
                if (!isAdminMode) return;
                const usersList = document.getElementById('chatUsersList');
                const usersCount = document.getElementById('chatUsersCount');
                if (!usersList) return;

                const users = getUniqueUsers();
                if (usersCount) {
                    usersCount.textContent = `${users.length} ${users.length === 1 ? 'user' : 'users'}`;
                }

                usersList.innerHTML = '';
                users.forEach(user => {
                    const userEl = document.createElement('div');
                    userEl.className = 'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer';
                    userEl.innerHTML = `
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-700 truncate">${user.name}</div>
                            <div class="text-xs text-gray-500 flex items-center gap-1">
                                <span>${user.messageCount} ${user.messageCount === 1 ? 'msg' : 'msgs'}</span>
                                <span>•</span>
                                <span class="text-xs px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">${user.role}</span>
                            </div>
                        </div>
                    `;
                    userEl.addEventListener('click', () => {
                        const filterUser = document.getElementById('chatFilterUser');
                        if (filterUser) {
                            filterUser.value = user.email;
                            filterUser.dispatchEvent(new Event('change'));
                        }
                    });
                    usersList.appendChild(userEl);
                });
            }

            function updateUserFilter() {
                if (!isAdminMode) return;
                const filterUser = document.getElementById('chatFilterUser');
                if (!filterUser) return;

                const users = getUniqueUsers();
                const currentValue = filterUser.value;
                filterUser.innerHTML = '<option value="all">All Users</option>';
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.email;
                    option.textContent = `${user.name} (${user.messageCount} msgs)`;
                    filterUser.appendChild(option);
                });
                filterUser.value = currentValue;
            }

            function applyFilters() {
                const searchInput = document.getElementById('chatSearchInput');
                const filterRole = document.getElementById('chatFilterRole');
                const filterUser = document.getElementById('chatFilterUser');

                if (!isAdminMode) {
                    loadMessages();
                    return;
                }

                const messages = getMessages();
                let filtered = messages;

                // Search filter
                if (searchInput && searchInput.value.trim()) {
                    const searchTerm = searchInput.value.toLowerCase();
                    filtered = filtered.filter(msg =>
                        msg.text.toLowerCase().includes(searchTerm) ||
                        msg.user.toLowerCase().includes(searchTerm) ||
                        msg.email.toLowerCase().includes(searchTerm)
                    );
                }

                // Role filter
                if (filterRole && filterRole.value !== 'all') {
                    filtered = filtered.filter(msg => msg.role === filterRole.value);
                }

                // User filter
                if (filterUser && filterUser.value !== 'all') {
                    filtered = filtered.filter(msg => msg.email === filterUser.value);
                }

                // Render filtered messages
                renderFilteredMessages(filtered);
            }

            function renderFilteredMessages(messages) {
                const fragment = document.createDocumentFragment();
                chatMessages.innerHTML = '';

                if (messages.length === 0) {
                    const emptyMsg = document.createElement('div');
                    emptyMsg.className = 'text-center text-sm text-gray-500 py-8';
                    emptyMsg.textContent = 'No messages match your filters.';
                    fragment.appendChild(emptyMsg);
                    chatMessages.appendChild(fragment);
                    return;
                }

                let currentDate = '';
                messages.forEach((msg, index) => {
                    const msgDate = new Date(msg.timestamp);
                    const dateStr = msgDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    if (dateStr !== currentDate) {
                        currentDate = dateStr;
                        const dateDivider = document.createElement('div');
                        dateDivider.className = 'flex items-center gap-3 my-5';
                        const line = document.createElement('div');
                        line.className = 'flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent';
                        const dateLabel = document.createElement('div');
                        dateLabel.className = 'text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded-full font-medium';
                        dateLabel.textContent = dateStr;
                        const line2 = document.createElement('div');
                        line2.className = 'flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent';
                        dateDivider.appendChild(line);
                        dateDivider.appendChild(dateLabel);
                        dateDivider.appendChild(line2);
                        fragment.appendChild(dateDivider);
                    }

                    const messageEl = createMessageElement(msg, index);
                    fragment.appendChild(messageEl);
                });

                chatMessages.appendChild(fragment);
                requestAnimationFrame(() => {
                    chatMessages.scrollTo({
                        top: chatMessages.scrollHeight,
                        behavior: 'smooth'
                    });
                });
            }

            function showStats() {
                if (!isAdminMode) return;
                const modal = document.getElementById('chatStatsModal');
                const content = document.getElementById('chatStatsContent');
                if (!modal || !content) return;

                const stats = getChatStats();
                const users = getUniqueUsers();

                content.innerHTML = `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <div class="text-2xl font-bold text-blue-700">${stats.totalMessages}</div>
                            <div class="text-sm text-blue-600 mt-1">Total Messages</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <div class="text-2xl font-bold text-green-700">${stats.totalUsers}</div>
                            <div class="text-sm text-green-600 mt-1">Active Users</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                            <div class="text-2xl font-bold text-purple-700">${stats.todayMessages}</div>
                            <div class="text-sm text-purple-600 mt-1">Today's Messages</div>
                        </div>
                        <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                            <div class="text-2xl font-bold text-orange-700">${stats.adminMessages}</div>
                            <div class="text-sm text-orange-600 mt-1">Admin Messages</div>
                        </div>
                    </div>
                    <div class="border-t pt-4">
                        <h4 class="font-semibold text-gray-700 mb-3">Top Users</h4>
                        <div class="space-y-2">
                            ${users.sort((a, b) => b.messageCount - a.messageCount).slice(0, 5).map((user, idx) => `
                                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-medium text-gray-500">#${idx + 1}</span>
                                        <span class="text-sm font-medium text-gray-700">${user.name}</span>
                                        <span class="text-xs px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">${user.role}</span>
                                    </div>
                                    <span class="text-sm text-gray-600 font-semibold">${user.messageCount}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    setTimeout(() => lucide.createIcons(), 100);
                }
            }

            function exportMessages() {
                if (!isAdminMode) return;
                const messages = getMessages();
                const dataStr = JSON.stringify(messages, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `chat-messages-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                toast('Messages exported successfully', 'success');
            }

            // Event listeners with optimized handlers
            clearBtn?.addEventListener('click', clearMessages, { passive: true });
            chatSendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            chatInput.addEventListener('input', updateCharCount, { passive: true });

            // Admin-specific event listeners
            if (isAdminMode) {
                const searchInput = document.getElementById('chatSearchInput');
                const filterRole = document.getElementById('chatFilterRole');
                const filterUser = document.getElementById('chatFilterUser');
                const toggleUsers = document.getElementById('chatToggleUsers');
                const usersSidebar = document.getElementById('chatUsersSidebar');
                const statsBtn = document.getElementById('chatStatsBtn');
                const statsClose = document.getElementById('chatStatsClose');
                const statsModal = document.getElementById('chatStatsModal');
                const exportBtn = document.getElementById('chatExportBtn');

                if (searchInput) {
                    searchInput.addEventListener('input', () => {
                        applyFilters();
                    });
                }

                if (filterRole) {
                    filterRole.addEventListener('change', () => {
                        applyFilters();
                    });
                }

                if (filterUser) {
                    filterUser.addEventListener('change', () => {
                        applyFilters();
                    });
                }

                if (toggleUsers && usersSidebar) {
                    toggleUsers.addEventListener('click', () => {
                        usersSidebar.classList.toggle('hidden');
                        updateUsersList();
                    });
                }

                if (statsBtn) {
                    statsBtn.addEventListener('click', showStats);
                }

                if (statsClose && statsModal) {
                    statsClose.addEventListener('click', () => {
                        statsModal.classList.add('hidden');
                    });
                    statsModal.addEventListener('click', (e) => {
                        if (e.target === statsModal) {
                            statsModal.classList.add('hidden');
                        }
                    });
                }

                if (exportBtn) {
                    exportBtn.addEventListener('click', exportMessages);
                }

                // Initialize admin features
                updateUserFilter();
                updateUsersList();
            }

            // Initialize character count
            updateCharCount();

            // Load messages on init
            loadMessages();
            lastMessageCount = getMessages().length;

            // Start refresh loop
            startRefreshLoop();

            // Focus input when section comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => focusChatInput(), 300);
                    }
                });
            }, { threshold: 0.1 });

            if (chatSection) {
                observer.observe(chatSection);
            }

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                if (refreshInterval) clearInterval(refreshInterval);
                if (charCountTimeout) clearTimeout(charCountTimeout);
            });

            // Re-apply translations when language changes
            if (window.applyTranslations) {
                const originalApplyTranslations = window.applyTranslations;
                window.applyTranslations = function (lang) {
                    originalApplyTranslations(lang);
                    // Re-apply translations to chat elements
                    if (chatSection && chatSection.parentElement) {
                        setTimeout(() => {
                            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                                const chatIcons = chatSection.querySelectorAll('[data-lucide]');
                                lucide.createIcons({ icons: chatIcons });
                            }
                        }, 100);
                    }
                };
            }
        }

        // Initialize chat when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createChatUI);
        } else {
            createChatUI();
        }
    })();

    // AI Live Chat Feature - Answers questions about the platform (only for logged-in users)
    (function initAIChat() {
        // Check if user is logged in
        function isUserLoggedIn() {
            try {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                return !!(auth.email && auth.role);
            } catch {
                return false;
            }
        }

        // Don't initialize if user is not logged in
        if (!isUserLoggedIn()) {
            return;
        }

        // AI Chat storage key
        const AI_CHAT_STORAGE_KEY = 'lms.ai.chat.messages';
        const MAX_AI_MESSAGES = 50;

        // Knowledge base about the LMS platform
        const knowledgeBase = {
            features: {
                keywords: ['feature', 'features', 'what can', 'what does', 'capabilities', 'functionality', 'what offer'],
                response: `Our Learning Management System offers powerful features including:

📚 **Course Management** - Create and organize courses with lessons, videos, and assessments
📝 **Quizzes & Assessments** - Interactive quizzes with instant scoring and feedback
📊 **Analytics & Reporting** - Track engagement, completion rates, and learner progress
👥 **User Management** - Role-based access for students, instructors, and admins
💾 **Save Courses** - Bookmark your favorite courses for easy access
🌍 **Multi-language Support** - Available in 20+ languages with RTL support
📱 **Mobile Responsive** - Works seamlessly on all devices
🎯 **Learning Goals** - Set and track your learning objectives
🏆 **Achievements** - Earn badges and certificates as you progress
📈 **Study Streaks** - Build daily learning habits
⏱️ **Study Timer** - Track your study time

Would you like to know more about any specific feature?`
            },
            signup: {
                keywords: ['sign up', 'signup', 'register', 'create account', 'account', 'join', 'get started'],
                response: `To create an account:

1. Click on "Sign up" or "Get Started" in the navigation
2. Fill in your full name, email, and password
3. Confirm your password
4. Agree to the terms and privacy policy
5. Click "Create account"

**Benefits of creating an account:**
✅ Save your progress across courses
✅ Track your learning journey
✅ Save favorite courses
✅ Set learning goals
✅ Earn achievements and badges
✅ Build study streaks
✅ Access personalized recommendations

It's completely free to start - no credit card required!`
            },
            courses: {
                keywords: ['course', 'courses', 'browse', 'enroll', 'enrollment', 'learn', 'learning'],
                response: `Our course catalog includes courses across multiple categories:

**How to browse courses:**
1. Click "Browse courses" in the navigation
2. Use filters to find courses by category, level, or search by title
3. Sort by newest, most popular, highest rated, or title
4. Click on a course to see details and enroll

**Course Features:**
• Progress tracking
• Interactive content
• Quizzes and assessments
• Completion certificates
• Save courses for later

You can also view saved courses in the "Saved" section. Would you like help finding a specific course?`
            },
            pricing: {
                keywords: ['price', 'pricing', 'cost', 'free', 'paid', 'subscription', 'money', 'payment'],
                response: `Our platform is **100% free to start**! 🎉

**Free Tier Includes:**
✅ Full access to all courses
✅ Progress tracking
✅ Quizzes and assessments
✅ Learning goals and achievements
✅ Study streaks and timer
✅ Analytics dashboard
✅ Multi-language support
✅ Mobile access

**No credit card required** - you can start learning immediately!

We may offer premium features in the future, but the core learning experience will always remain free.`
            },
            help: {
                keywords: ['help', 'support', 'assistance', 'how', 'guide', 'tutorial'],
                response: `I'm here to help! I can answer questions about:

• **Features** - What the platform offers
• **Signing up** - How to create an account
• **Courses** - How to browse and enroll
• **Pricing** - Cost and free features
• **Navigation** - How to use the platform
• **Account** - Managing your profile
• **Quizzes** - Taking assessments
• **Analytics** - Viewing your progress

Just ask me anything about the platform! You can also:
- Visit the FAQ page for common questions
- Check the Features page for detailed information
- Contact support if you need additional help`
            },
            navigation: {
                keywords: ['navigate', 'navigation', 'menu', 'where', 'find', 'location'],
                response: `Here's how to navigate the platform:

**Main Navigation:**
• **Features** - See all platform features
• **Saved** - View your bookmarked courses
• **Courses** - Browse the course catalog
• **Quiz** - Take interactive quizzes
• **Analytics** - View your learning progress

**User Actions:**
• **Sign in** - Access your account
• **Sign up** - Create a new account
• **Dashboard** - Your personal learning hub (after sign in)
• **Admin Dashboard** - For administrators

**Quick Tips:**
- Use the search bar on the courses page to find specific content
- Filter courses by category and level
- Save courses you're interested in for later
- Check your dashboard for personalized recommendations

Need help finding something specific?`
            },
            account: {
                keywords: ['account', 'profile', 'settings', 'manage', 'my account', 'dashboard'],
                response: `Your account gives you access to:

**Dashboard Features:**
📊 Learning statistics and progress
🎯 Learning goals you've set
🏆 Achievements and badges earned
🔥 Study streak counter
⏱️ Study timer
📚 Your enrolled courses
💡 Personalized course recommendations

**Account Management:**
- View your learning progress
- Set and track learning goals
- See your achievements
- Manage saved courses
- Track study time and streaks

**To access your dashboard:**
1. Sign in to your account
2. Click "Dashboard" in the navigation
3. Explore all your learning data

Your progress is automatically saved as you learn!`
            },
            quiz: {
                keywords: ['quiz', 'quizzes', 'test', 'assessment', 'exam', 'question'],
                response: `Our quiz system offers:

**Features:**
✅ Interactive quizzes with multiple question types
✅ Instant feedback on answers
✅ Auto-grading
✅ Performance tracking over time
✅ Score history

**How to take a quiz:**
1. Click "Quiz" in the navigation
2. Select a quiz to take
3. Answer the questions
4. Submit to see your results
5. Review your score and feedback

**Quiz Benefits:**
• Test your knowledge
• Track improvement over time
• Identify areas for improvement
• Earn achievements for high scores

Quizzes are integrated into courses and can also be taken independently. Ready to test your knowledge?`
            },
            analytics: {
                keywords: ['analytics', 'stats', 'statistics', 'progress', 'report', 'data', 'metrics'],
                response: `Our analytics dashboard provides:

**Key Metrics:**
📈 Active learners count
✅ Course completion rates
⚠️ At-risk students identification
⏱️ Average session time
📊 Quiz pass rates
📚 Enrollment trends

**What You Can Track:**
• Your learning progress
• Time spent studying
• Courses completed
• Quiz scores
• Study streaks
• Goals achieved

**To view analytics:**
1. Sign in to your account
2. Click "Analytics" in the navigation
3. View detailed reports and charts

Analytics help you understand your learning patterns and improve your study habits!`
            },
            default: {
                response: `I'm the AI assistant for this Learning Management System. I can help you with:

• Platform features and capabilities
• How to sign up or create an account
• Browsing and enrolling in courses
• Using quizzes and assessments
• Understanding analytics and progress
• Navigation and finding content
• Account management

Try asking me:
- "What features do you offer?"
- "How do I sign up?"
- "How do I browse courses?"
- "Is this free?"
- "What can I do on my dashboard?"

What would you like to know?`
            }
        };

        // AI Response Generator
        function generateAIResponse(userMessage) {
            const message = userMessage.toLowerCase().trim();

            // Check each knowledge base category
            for (const [category, data] of Object.entries(knowledgeBase)) {
                if (category === 'default') continue;

                // Check if any keyword matches
                const matches = data.keywords.some(keyword =>
                    message.includes(keyword)
                );

                if (matches) {
                    return data.response;
                }
            }

            // Check for greeting
            const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
            if (greetings.some(g => message.startsWith(g))) {
                return `Hello! 👋 I'm your AI assistant for the Learning Management System. I can answer questions about:

• Platform features
• Signing up
• Courses and enrollment
• Quizzes and assessments
• Analytics and progress
• Navigation

What would you like to know?`;
            }

            // Check for thank you
            if (message.includes('thank') || message.includes('thanks')) {
                return `You're welcome! 😊 

Is there anything else you'd like to know about the platform? I'm here to help!`;
            }

            // Default response
            return knowledgeBase.default.response;
        }

        // Get AI chat messages
        function getAIMessages() {
            try {
                return JSON.parse(localStorage.getItem(AI_CHAT_STORAGE_KEY) || '[]');
            } catch {
                return [];
            }
        }

        // Save AI chat messages
        function saveAIMessages(messages) {
            try {
                const limited = messages.slice(-MAX_AI_MESSAGES);
                localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(limited));
            } catch (error) {
                console.error('Failed to save AI chat messages:', error);
            }
        }

        // Create AI Chat UI
        function createAIChatUI() {
            // Check if AI chat already exists
            if (document.getElementById('aiChatWidget')) return;

            const aiChatContainer = document.createElement('div');
            aiChatContainer.id = 'aiChatWidget';
            aiChatContainer.innerHTML = `
                <!-- AI Chat Toggle Button -->
                <button id="aiChatToggleBtn" 
                    class="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group backdrop-blur-sm"
                    aria-label="Open AI chat">
                    <i data-lucide="bot" class="w-6 h-6"></i>
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </button>

                <!-- AI Chat Window -->
                <div id="aiChatWindow" 
                    class="fixed bottom-24 left-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[640px] max-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-2xl border border-gray-200/50 flex flex-col hidden transform transition-all duration-300 ease-out backdrop-blur-sm"
                    style="box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                    <!-- AI Chat Header -->
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-t-xl">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <i data-lucide="bot" class="w-6 h-6"></i>
                                </div>
                                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h3 class="font-semibold text-base">AI Assistant</h3>
                                <p class="text-xs text-blue-100/90 font-medium">Ask me anything about the platform</p>
                            </div>
                        </div>
                        <button id="aiChatCloseBtn" class="text-white/90 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/15 active:bg-white/20" aria-label="Close AI chat">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <!-- AI Messages Container -->
                    <div id="aiChatMessages" class="flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth" style="scrollbar-width: thin; scrollbar-color: rgba(156, 163, 175, 0.5) transparent;">
                        <style>
                            #aiChatMessages::-webkit-scrollbar {
                                width: 6px;
                            }
                            #aiChatMessages::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            #aiChatMessages::-webkit-scrollbar-thumb {
                                background-color: rgba(156, 163, 175, 0.5);
                                border-radius: 3px;
                            }
                            #aiChatMessages::-webkit-scrollbar-thumb:hover {
                                background-color: rgba(156, 163, 175, 0.7);
                            }
                        </style>
                        <div class="text-center text-sm text-gray-500 py-8">
                            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <i data-lucide="bot" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <p class="font-semibold text-gray-700 mb-2">Hello! I'm your AI assistant</p>
                            <p class="text-gray-600">Ask me anything about the platform, features, courses, or how to get started!</p>
                        </div>
                    </div>

                    <!-- AI Chat Input -->
                    <div class="px-5 py-4 border-t border-gray-200/60 bg-white rounded-b-xl">
                        <div class="flex gap-2.5 items-end">
                            <div class="flex-1 relative">
                                <input type="text" 
                                    id="aiChatInput" 
                                    placeholder="Ask me anything about the platform..."
                                    class="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm"
                                    maxlength="500">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" id="aiCharCount">0/500</span>
                            </div>
                            <button id="aiChatSendBtn" 
                                class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[44px]"
                                aria-label="Send message">
                                <i data-lucide="send" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-2.5 flex items-center gap-1.5">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                            <span>Powered by AI • Ask about features, courses, signup, and more</span>
                        </p>
                    </div>
                </div>
            `;

            document.body.appendChild(aiChatContainer);

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                setTimeout(() => {
                    const aiIcons = aiChatContainer.querySelectorAll('[data-lucide]');
                    lucide.createIcons({ icons: aiIcons });
                }, 100);
            }

            // AI Chat functionality
            const aiToggleBtn = document.getElementById('aiChatToggleBtn');
            const aiCloseBtn = document.getElementById('aiChatCloseBtn');
            const aiChatWindow = document.getElementById('aiChatWindow');
            const aiChatInput = document.getElementById('aiChatInput');
            const aiChatSendBtn = document.getElementById('aiChatSendBtn');
            const aiChatMessages = document.getElementById('aiChatMessages');
            const aiCharCount = document.getElementById('aiCharCount');

            let aiIsOpen = false;

            // Toggle AI chat
            function toggleAIChat() {
                aiIsOpen = !aiIsOpen;
                if (aiIsOpen) {
                    aiChatWindow.classList.remove('hidden');
                    aiChatWindow.style.willChange = 'opacity, transform';
                    aiChatWindow.style.opacity = '0';
                    aiChatWindow.style.transform = 'translateY(20px) scale(0.95)';
                    requestAnimationFrame(() => {
                        aiChatWindow.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                        aiChatWindow.style.opacity = '1';
                        aiChatWindow.style.transform = 'translateY(0) scale(1)';
                        setTimeout(() => {
                            aiChatWindow.style.willChange = 'auto';
                        }, 250);
                    });
                    requestAnimationFrame(() => {
                        aiChatInput.focus();
                        loadAIMessages();
                    });
                } else {
                    aiChatWindow.style.willChange = 'opacity, transform';
                    aiChatWindow.style.transition = 'opacity 0.2s ease-in, transform 0.2s ease-in';
                    aiChatWindow.style.opacity = '0';
                    aiChatWindow.style.transform = 'translateY(20px) scale(0.95)';
                    setTimeout(() => {
                        aiChatWindow.classList.add('hidden');
                        aiChatWindow.style.willChange = 'auto';
                    }, 200);
                }
            }

            // Load AI messages
            function loadAIMessages() {
                const messages = getAIMessages();
                aiChatMessages.innerHTML = '';

                if (messages.length === 0) {
                    const welcomeMsg = document.createElement('div');
                    welcomeMsg.className = 'text-center text-sm text-gray-500 py-8';
                    welcomeMsg.innerHTML = `
                        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <i data-lucide="bot" class="w-8 h-8 text-blue-600"></i>
                        </div>
                        <p class="font-semibold text-gray-700 mb-2">Hello! I'm your AI assistant</p>
                        <p class="text-gray-600">Ask me anything about the platform, features, courses, or how to get started!</p>
                    `;
                    aiChatMessages.appendChild(welcomeMsg);
                    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                        lucide.createIcons();
                    }
                    return;
                }

                const fragment = document.createDocumentFragment();
                messages.forEach((msg) => {
                    const messageEl = createAIMessageElement(msg);
                    fragment.appendChild(messageEl);
                });
                aiChatMessages.appendChild(fragment);

                requestAnimationFrame(() => {
                    aiChatMessages.scrollTo({
                        top: aiChatMessages.scrollHeight,
                        behavior: 'smooth'
                    });
                });
            }

            // Create AI message element
            function createAIMessageElement(msg) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 group`;

                const messageWrapper = document.createElement('div');
                messageWrapper.className = `flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`;

                if (msg.type === 'ai') {
                    // AI avatar
                    const avatar = document.createElement('div');
                    avatar.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-md ring-2 ring-white mb-1';
                    avatar.innerHTML = '<i data-lucide="bot" class="w-4 h-4"></i>';
                    messageWrapper.appendChild(avatar);
                }

                const messageContent = document.createElement('div');
                messageContent.className = `${msg.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200/80 shadow-sm'} rounded-2xl ${msg.type === 'user' ? 'rounded-br-md' : 'rounded-bl-md'} px-4 py-3 hover:shadow-md transition-all`;

                const messageText = document.createElement('div');
                messageText.className = `text-sm leading-relaxed ${msg.type === 'user' ? 'text-white' : 'text-gray-800'} break-words whitespace-pre-wrap`;
                messageText.textContent = msg.text;

                const messageTime = document.createElement('div');
                messageTime.className = `text-xs mt-2 flex items-center gap-1 ${msg.type === 'user' ? 'text-blue-100/90' : 'text-gray-500'}`;
                messageTime.innerHTML = `<span>${msg.time}</span>`;

                messageContent.appendChild(messageText);
                messageContent.appendChild(messageTime);
                messageWrapper.appendChild(messageContent);
                messageDiv.appendChild(messageWrapper);

                // Animation
                messageDiv.style.willChange = 'opacity, transform';
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(10px)';
                requestAnimationFrame(() => {
                    messageDiv.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                    messageDiv.style.opacity = '1';
                    messageDiv.style.transform = 'translateY(0)';
                    setTimeout(() => {
                        messageDiv.style.willChange = 'auto';
                    }, 200);
                });

                // Initialize icons for AI messages
                if (msg.type === 'ai' && typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    setTimeout(() => lucide.createIcons(), 50);
                }

                return messageDiv;
            }

            // Send message to AI
            function sendAIMessage() {
                const text = aiChatInput.value.trim();
                if (!text) return;

                aiChatSendBtn.disabled = true;

                // Add user message
                const userMessage = {
                    id: 'ai-msg-' + Date.now() + '-user',
                    text: text,
                    type: 'user',
                    timestamp: new Date().toISOString(),
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                };

                const messages = getAIMessages();
                messages.push(userMessage);
                saveAIMessages(messages);
                loadAIMessages();

                // Show typing indicator
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'flex gap-3 justify-start mb-4';
                typingIndicator.innerHTML = `
                    <div class="flex flex-col items-start">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md ring-2 ring-white mb-1">
                            <i data-lucide="bot" class="w-4 h-4"></i>
                        </div>
                        <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div class="flex gap-1">
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                            </div>
                        </div>
                    </div>
                `;
                aiChatMessages.appendChild(typingIndicator);
                aiChatMessages.scrollTo({ top: aiChatMessages.scrollHeight, behavior: 'smooth' });

                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                }

                // Generate AI response (simulate thinking time)
                setTimeout(() => {
                    typingIndicator.remove();
                    const aiResponse = generateAIResponse(text);

                    const aiMessage = {
                        id: 'ai-msg-' + Date.now() + '-ai',
                        text: aiResponse,
                        type: 'ai',
                        timestamp: new Date().toISOString(),
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    };

                    messages.push(aiMessage);
                    saveAIMessages(messages);
                    loadAIMessages();
                    aiChatInput.value = '';
                    updateAICharCount();
                    aiChatSendBtn.disabled = false;
                }, 800 + Math.random() * 400); // 800-1200ms delay
            }

            // Update character count
            let aiCharCountTimeout = null;
            function updateAICharCount() {
                if (!aiCharCount) return;
                if (aiCharCountTimeout) clearTimeout(aiCharCountTimeout);
                aiCharCountTimeout = setTimeout(() => {
                    const count = aiChatInput.value.length;
                    aiCharCount.textContent = `${count}/500`;
                    if (count > 450) {
                        aiCharCount.classList.add('text-orange-500');
                        aiCharCount.classList.remove('text-gray-400');
                    } else {
                        aiCharCount.classList.remove('text-orange-500');
                        aiCharCount.classList.add('text-gray-400');
                    }
                }, 100);
            }

            // Event listeners
            aiToggleBtn.addEventListener('click', toggleAIChat, { passive: true });
            aiCloseBtn.addEventListener('click', toggleAIChat, { passive: true });
            aiChatSendBtn.addEventListener('click', sendAIMessage);
            aiChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendAIMessage();
                }
            });
            aiChatInput.addEventListener('input', updateAICharCount, { passive: true });

            // Initialize
            updateAICharCount();
            loadAIMessages();
        }

        // Initialize AI chat when DOM is ready
        function initializeAIChat() {
            // Check authentication again before creating UI
            if (isUserLoggedIn()) {
                createAIChatUI();
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAIChat);
        } else {
            initializeAIChat();
        }

        // Monitor authentication changes (e.g., after login/logout)
        // Check periodically if chat should be shown/hidden
        let lastAuthState = isUserLoggedIn();
        setInterval(() => {
            const currentAuthState = isUserLoggedIn();
            const aiChatWidget = document.getElementById('aiChatWidget');

            if (currentAuthState !== lastAuthState) {
                lastAuthState = currentAuthState;

                if (currentAuthState && !aiChatWidget) {
                    // User just logged in - create chat
                    createAIChatUI();
                } else if (!currentAuthState && aiChatWidget) {
                    // User just logged out - remove chat
                    aiChatWidget.remove();
                }
            }
        }, 1000); // Check every second
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
