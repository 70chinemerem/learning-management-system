// App state and sample data
// Keep state minimal; in real apps, replace with a store and API calls
const state = {
    theme: 'light', // 'light' | 'dark'
    textSize: 'text-base', // Tailwind text size class applied to <body>
};

const sampleCourses = [
    { id: 'c1', title: 'Intro to HTML & CSS', status: 'completed', lessons: 24, category: 'Web', tags: ['html', 'css'] },
    { id: 'c2', title: 'JavaScript Fundamentals', status: 'active', lessons: 36, category: 'Web', tags: ['javascript', 'basics'] },
    { id: 'c3', title: 'Responsive Web Design', status: 'active', lessons: 18, category: 'Design', tags: ['responsive', 'layout'] },
    { id: 'c4', title: 'Git & GitHub Essentials', status: 'completed', lessons: 12, category: 'Tools', tags: ['git', 'github'] },
    { id: 'c5', title: 'Tailwind CSS for Beginners', status: 'active', lessons: 14, category: 'Web', tags: ['tailwind', 'css'] },
];

const sampleBadges = [
    { id: 'b1', label: 'Streak 7d' },
    { id: 'b2', label: 'Quiz Ace' },
];

const sampleNotifications = [
    { id: 'n1', text: 'Live session starts in 1 hour', href: '#community' },
    { id: 'n2', text: 'New assignment posted in JavaScript Fundamentals', href: '#assignments' },
];

// Assignments and community sample data
const sampleAssignments = [
    { id: 'a1', courseId: 'c2', title: 'JS Variables Quiz', due: '2025-11-10', status: 'pending' },
    { id: 'a2', courseId: 'c2', title: 'Functions Exercise', due: '2025-11-15', status: 'pending' },
    { id: 'a3', courseId: 'c1', title: 'Responsive Layout', due: '2025-10-20', status: 'completed' },
];

const sampleThreads = [
    { id: 't1', title: 'How do I center a div?', author: 'Ada', replies: 5 },
    { id: 't2', title: 'Best resources for async JS', author: 'Linus', replies: 3 },
];

const sampleUsers = [
    { id: 'u1', name: 'Ada Lovelace', role: 'student' },
    { id: 'u2', name: 'Alan Turing', role: 'instructor' },
];

// UI components (string templates)
function CourseCard(course) {
    return `
        <article class="rounded-lg border bg-white p-4 shadow-sm">
            <h3 class="font-semibold">${course.title}</h3>
            <p class="mt-1 text-sm text-gray-600 capitalize">Status: ${course.status}</p>
            <p class="mt-1 text-sm text-gray-600">Lessons: ${course.lessons}</p>
            <p class="mt-1 text-xs text-gray-500">Category: ${course.category || 'General'}</p>
            ${Array.isArray(course.tags) && course.tags.length ? `<div class=\"mt-2 flex flex-wrap gap-1\">${course.tags.map(t => `<span class=\"rounded-full bg-gray-100 border px-2 py-0.5 text-[11px]\">${t}</span>`).join('')}</div>` : ''}
            <div class="mt-4 flex gap-2">
                <a href="#courses" class="rounded-md bg-indigo-600 px-3 py-1.5 text-white text-sm hover:bg-indigo-500">Continue</a>
                <button class="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100" data-modal-open data-id="${course.id}">Details</button>
            </div>
        </article>
    `;
}

function Badge(badge) {
    return `<span class="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 border border-indigo-200">${badge.label}</span>`;
}

function Modal(contentHtml) {
    // Minimal modal wrapper; real app would manage focus traps and escape handling
    return `
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" data-modal-close></div>
      <div class="relative z-10 max-w-lg w-full rounded-lg bg-white p-6 shadow-xl">
        ${contentHtml}
        <div class="mt-4 text-right">
          <button class="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100" data-modal-close>Close</button>
        </div>
      </div>
    </div>`;
}

// Pages
function renderHome() {
    const featured = sampleCourses.filter(c => c.status === 'active').slice(0, 3);
    const notif = sampleNotifications.map(n => `<a href="${n.href}" class="block hover:underline">${n.text}</a>`).join('');
    const badges = sampleBadges.map(Badge).join(' ');
    return `
      <section class="text-center">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">Welcome to your Learning Management System</h1>
        <p class="mt-3 text-gray-600">Create courses, track progress, and assess learning outcomes.</p>
        <div class="mt-6 flex items-center justify-center gap-3">
          <a href="#courses" class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Browse Courses</a>
          <a href="#community" class="inline-flex items-center rounded-md border px-4 py-2 hover:bg-gray-100">Join Community</a>
        </div>
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div class="rounded-lg border bg-white p-4">
            <h2 class="font-semibold">Notifications</h2>
            <div class="mt-2 text-sm text-gray-700">${notif || 'No new notifications'}</div>
          </div>
          <div class="rounded-lg border bg-white p-4">
            <h2 class="font-semibold">Badges</h2>
            <div class="mt-2 flex gap-2 flex-wrap">${badges}</div>
          </div>
          <div class="rounded-lg border bg-white p-4">
            <h2 class="font-semibold">Overview</h2>
            <p class="mt-2 text-sm text-gray-600">Active courses: ${sampleCourses.filter(c => c.status === 'active').length}</p>
          </div>
        </div>
        <div class="mt-12 text-left">
          <h2 class="text-xl font-semibold">Featured Courses</h2>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${featured.map(CourseCard).join('')}
          </div>
        </div>
        <div class="mt-12 text-left">
          <h2 class="text-xl font-semibold">Testimonials</h2>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <blockquote class="rounded-lg border bg-white p-4 text-left">
              <p class="text-gray-700">“This LMS made it easy for me to learn at my pace.”</p>
              <footer class="mt-2 text-sm text-gray-500">— Alex</footer>
            </blockquote>
            <blockquote class="rounded-lg border bg-white p-4 text-left">
              <p class="text-gray-700">“Clean UI and solid analytics—highly recommended.”</p>
              <footer class="mt-2 text-sm text-gray-500">— Sam</footer>
            </blockquote>
          </div>
        </div>
        <div class="mt-12 text-left">
          <h2 class="text-xl font-semibold">FAQ</h2>
          <div class="mt-4 divide-y rounded-lg border bg-white">
            <details class="p-4" open>
              <summary class="font-medium cursor-pointer">How do I enroll in a course?</summary>
              <p class="mt-2 text-sm text-gray-600">Open a course and click “Enroll” or “Continue”.</p>
            </details>
            <details class="p-4">
              <summary class="font-medium cursor-pointer">Can I learn on mobile?</summary>
              <p class="mt-2 text-sm text-gray-600">Yes, the UI is responsive and mobile-friendly.</p>
            </details>
          </div>
        </div>
      </section>
    `;
}

function renderCourses() {
    // Controls + list; filtering handled after inject via listeners
    return `
      <section>
        <div class="flex items-end justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">All Courses</h2>
            <p class="mt-1 text-sm text-gray-600">Browse and filter available courses</p>
          </div>
          <div class="flex gap-2">
            <input id="course-search" type="search" placeholder="Search courses" class="w-56 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select id="course-status" class="rounded-md border px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div id="course-list" class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </section>
    `;
}

function renderAssignments() {
    return `
      <section>
        <div class="flex items-end justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">Assignments</h2>
            <p class="mt-1 text-sm text-gray-600">Track pending and completed work</p>
          </div>
          <div class="flex gap-2">
            <select id="assignment-status" class="rounded-md border px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <input id="assignment-due" type="date" class="rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>
        <div id="assignment-list" class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </section>
    `;
}

function renderCommunity() {
    const trending = sampleThreads.slice(0, 3).map(t => `<li><a class=\"hover:underline\" href=\"#\">${t.title}</a></li>`).join('');
    return `
      <section>
        <h2 class="text-xl font-semibold">Community</h2>
        <p class="mt-2 text-gray-600">Discuss lessons, ask questions, and collaborate.</p>
        <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <form id="thread-form" class="flex gap-2">
              <input id="thread-title" type="text" placeholder="Start a new thread" class="flex-1 rounded-md border px-3 py-2 text-sm" required />
              <button class="rounded-md bg-indigo-600 px-3 py-2 text-white text-sm hover:bg-indigo-500">Post</button>
            </form>
            <div id="thread-list" class="mt-6 space-y-3"></div>
          </div>
          <aside class="rounded-lg border bg-white p-4">
            <h3 class="font-semibold">Trending</h3>
            <ul class="mt-2 list-disc list-inside text-sm">${trending}</ul>
          </aside>
        </div>
      </section>
    `;
}

function renderProfile() {
    const saved = JSON.parse(localStorage.getItem('profile') || '{}');
    return `
      <section>
        <h2 class="text-xl font-semibold">Profile</h2>
        <p class="mt-2 text-gray-600">Manage your account and preferences.</p>
        <form id="profile-form" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <label class="text-sm">Name
            <input id="profile-name" type="text" value="${saved.name || ''}" class="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label class="text-sm">Email
            <input id="profile-email" type="email" value="${saved.email || ''}" class="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label class="text-sm">Role
            <select id="profile-role" class="mt-1 w-full rounded-md border px-3 py-2 text-sm">
              <option value="student" ${saved.role === 'student' ? 'selected' : ''}>Student</option>
              <option value="instructor" ${saved.role === 'instructor' ? 'selected' : ''}>Instructor</option>
            </select>
          </label>
          <div class="col-span-full">
            <button class="rounded-md bg-indigo-600 px-4 py-2 text-white text-sm hover:bg-indigo-500">Save</button>
          </div>
        </form>
      </section>
    `;
}

function renderAdmin() {
    return `
      <section>
        <h2 class="text-xl font-semibold">Admin</h2>
        <p class="mt-2 text-gray-600">Create courses, manage users, view reports.</p>
        <div class="mt-4 flex gap-2">
          <button class="admin-tab rounded-md border px-3 py-1.5 text-sm" data-tab="courses">Courses</button>
          <button class="admin-tab rounded-md border px-3 py-1.5 text-sm" data-tab="users">Users</button>
          <button class="admin-tab rounded-md border px-3 py-1.5 text-sm" data-tab="reports">Reports</button>
        </div>
        <div id="admin-content" class="mt-6"></div>
      </section>
    `;
}

// Filtering and interactions for Courses page
function hydrateCoursesInteractions() {
    const listEl = document.getElementById('course-list');
    const searchEl = document.getElementById('course-search');
    const statusEl = document.getElementById('course-status');
    if (!listEl || !searchEl || !statusEl) return;

    function renderList() {
        const query = searchEl.value.trim().toLowerCase();
        const status = statusEl.value;
        const filtered = sampleCourses.filter((course) => {
            const matchesQuery = query === '' || course.title.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || course.status === status;
            return matchesQuery && matchesStatus;
        });
        listEl.innerHTML = filtered.map(CourseCard).join('');

        // Wire modal open/close buttons
        document.querySelectorAll('[data-modal-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const course = sampleCourses.find(c => c.id === id);
                if (!course) return;
                const modalHtml = Modal(`<h3 class=\"text-lg font-semibold\">${course.title}</h3><p class=\"mt-2 text-sm text-gray-600\">${course.lessons} lessons</p>`);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = modalHtml;
                document.body.appendChild(wrapper.firstElementChild);
                document.querySelectorAll('[data-modal-close]').forEach(close => {
                    close.addEventListener('click', () => document.querySelector('.fixed.inset-0.z-50')?.remove());
                });
            });
        });
    }

    searchEl.addEventListener('input', renderList);
    statusEl.addEventListener('change', renderList);
    renderList();
}

// Hydrate Assignments: filtering by status and due date
function hydrateAssignmentsInteractions() {
    const listEl = document.getElementById('assignment-list');
    const statusEl = document.getElementById('assignment-status');
    const dueEl = document.getElementById('assignment-due');
    if (!listEl || !statusEl || !dueEl) return;

    function renderList() {
        const status = statusEl.value;
        const due = dueEl.value; // YYYY-MM-DD or ''
        const filtered = sampleAssignments.filter(a => {
            const matchStatus = status === 'all' || a.status === status;
            const matchDue = !due || a.due <= due;
            return matchStatus && matchDue;
        });
        if (filtered.length === 0) {
            listEl.innerHTML = `
              <div class="col-span-full rounded-lg border bg-white p-6 text-center">
                <p class="text-gray-700">No assignments match your filters.</p>
                <p class="mt-1 text-sm text-gray-600">Tip: clear the date filter or switch to “All”.</p>
              </div>
            `;
            return;
        }
        listEl.innerHTML = filtered.map(a => `
          <article class="rounded-lg border bg-white p-4 shadow-sm">
            <h3 class="font-semibold">${a.title}</h3>
            <p class="mt-1 text-sm text-gray-600">Course: ${sampleCourses.find(c => c.id === a.courseId)?.title || 'Unknown'}</p>
            <p class="mt-1 text-sm text-gray-600">Due: ${a.due}</p>
            <span class="mt-2 inline-block rounded-full ${a.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'} px-2 py-0.5 text-xs capitalize">${a.status}</span>
          </article>
        `).join('');
    }

    statusEl.addEventListener('change', renderList);
    dueEl.addEventListener('change', renderList);
    renderList();
}

// Hydrate Community: thread list and composer
function hydrateCommunityInteractions() {
    const listEl = document.getElementById('thread-list');
    const form = document.getElementById('thread-form');
    const input = document.getElementById('thread-title');
    if (!listEl || !form || !input) return;

    function renderThreads() {
        listEl.innerHTML = sampleThreads.map(t => `
          <div class="rounded-lg border bg-white p-4">
            <a class="font-semibold hover:underline" href="#">${t.title}</a>
            <p class="mt-1 text-sm text-gray-600">by ${t.author} • ${t.replies} replies</p>
          </div>
        `).join('');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = input.value.trim();
        if (!title) return;
        sampleThreads.unshift({ id: `t${Date.now()}`, title, author: 'You', replies: 0 });
        input.value = '';
        renderThreads();
    });

    renderThreads();
}

// Hydrate Profile: save to localStorage
function hydrateProfileInteractions() {
    const form = document.getElementById('profile-form');
    const name = document.getElementById('profile-name');
    const email = document.getElementById('profile-email');
    const role = document.getElementById('profile-role');
    if (!form || !name || !email || !role) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const profile = {
            name: name.value.trim(),
            email: email.value.trim(),
            role: role.value,
        };
        localStorage.setItem('profile', JSON.stringify(profile));
        alert('Profile saved');
    });
}

// Hydrate Admin: simple tabs
function hydrateAdminInteractions() {
    const container = document.getElementById('admin-content');
    const tabs = document.querySelectorAll('.admin-tab');
    if (!container || !tabs.length) return;

    function renderTab(tab) {
        if (tab === 'courses') {
            container.innerHTML = `
              <div class="rounded-lg border bg-white p-4">
                <h3 class="font-semibold">Courses</h3>
                <ul class="mt-2 list-disc list-inside text-sm">
                  ${sampleCourses.map(c => `<li>${c.title} • <span class=\"capitalize\">${c.status}</span></li>`).join('')}
                </ul>
              </div>
            `;
        } else if (tab === 'users') {
            container.innerHTML = `
              <div class="rounded-lg border bg-white p-4">
                <h3 class="font-semibold">Users</h3>
                <ul class="mt-2 list-disc list-inside text-sm">
                  ${sampleUsers.map(u => `<li>${u.name} • ${u.role}</li>`).join('')}
                </ul>
              </div>
            `;
        } else {
            container.innerHTML = `
              <div class="rounded-lg border bg-white p-4">
                <h3 class="font-semibold">Reports</h3>
                <p class="mt-2 text-sm text-gray-600">Coming soon: completion, difficulty, and time-on-task analytics.</p>
              </div>
            `;
        }
    }

    tabs.forEach(btn => btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('bg-gray-100'));
        btn.classList.add('bg-gray-100');
        renderTab(btn.getAttribute('data-tab'));
    }));

    // Default tab
    renderTab('courses');
}

// Router
function renderRoute(route) {
    const app = document.getElementById('app');
    if (!app) return;
    switch (route) {
        case '#courses':
            app.innerHTML = renderCourses();
            hydrateCoursesInteractions();
            break;
        case '#assignments':
            app.innerHTML = renderAssignments();
            hydrateAssignmentsInteractions();
            break;
        case '#community':
            app.innerHTML = renderCommunity();
            hydrateCommunityInteractions();
            break;
        case '#profile':
            app.innerHTML = renderProfile();
            hydrateProfileInteractions();
            break;
        case '#admin':
            app.innerHTML = renderAdmin();
            hydrateAdminInteractions();
            break;
        case '#home':
        default:
            app.innerHTML = renderHome();
            break;
    }
}

function navigate() {
    const route = (location.hash || '#home').toLowerCase();
    // Update active nav link via aria-current
    document.querySelectorAll('nav a[data-link]').forEach(a => {
        if (a.getAttribute('href')?.toLowerCase() === route) {
            a.setAttribute('aria-current', 'page');
        } else {
            a.removeAttribute('aria-current');
        }
    });
    renderRoute(route);
}

// Accessibility controls
function applyTextSize() {
    const body = document.body;
    body.classList.remove('text-base', 'text-lg', 'text-xl');
    body.classList.add(state.textSize);
}

function applyTheme() {
    const root = document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
}

function wireGlobalControls() {
    const toggleDark = document.getElementById('toggle-dark');
    const textSize = document.getElementById('text-size');
    toggleDark?.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
    });
    textSize?.addEventListener('change', (e) => {
        state.textSize = e.target.value;
        applyTextSize();
    });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyTextSize();
    wireGlobalControls();
    // Footer year
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    navigate();
    window.addEventListener('hashchange', navigate);
});

// Simple in-memory sample data to demonstrate rendering and filtering
// In a real app, fetch from an API and persist filters to URL or storage
const sampleCourses = [
    { id: 'c1', title: 'Intro to HTML & CSS', status: 'completed', lessons: 24 },
    { id: 'c2', title: 'JavaScript Fundamentals', status: 'active', lessons: 36 },
    { id: 'c3', title: 'Responsive Web Design', status: 'active', lessons: 18 },
    { id: 'c4', title: 'Git & GitHub Essentials', status: 'completed', lessons: 12 },
    { id: 'c5', title: 'Tailwind CSS for Beginners', status: 'active', lessons: 14 },
];

/**
 * Render a subset of featured courses onto the homepage.
 * Keeps it simple: pick the first 3 active courses.
 */
function renderFeaturedCourses() {
    const container = document.getElementById('featured-list');
    if (!container) return;
    const featured = sampleCourses.filter(c => c.status === 'active').slice(0, 3);
    container.innerHTML = featured.map((course) => `
        <article class="rounded-lg border bg-white p-4 shadow-sm">
            <h3 class="font-semibold">${course.title}</h3>
            <p class="mt-1 text-sm text-gray-600">Lessons: ${course.lessons}</p>
            <a href="#courses" data-link class="mt-3 inline-block text-indigo-600 hover:text-indigo-500 text-sm">View course</a>
        </article>
    `).join('');
}

/**
 * Render a list of courses into the `#course-list` container.
 * Applies simple search and status filtering based on current control values.
 */
function renderCourses() {
    const listEl = document.getElementById('course-list');
    if (!listEl) return;

    const searchEl = document.getElementById('course-search');
    const statusEl = document.getElementById('course-status');

    const query = (searchEl?.value || '').trim().toLowerCase();
    const status = statusEl?.value || 'all';

    const filtered = sampleCourses.filter((course) => {
        const matchesQuery = query === '' || course.title.toLowerCase().includes(query);
        const matchesStatus = status === 'all' || course.status === status;
        return matchesQuery && matchesStatus;
    });

    // Build minimal card markup with Tailwind utility classes
    listEl.innerHTML = filtered.map((course) => `
        <article class="rounded-lg border bg-white p-4 shadow-sm">
            <h3 class="font-semibold">${course.title}</h3>
            <p class="mt-1 text-sm text-gray-600 capitalize">Status: ${course.status}</p>
            <p class="mt-1 text-sm text-gray-600">Lessons: ${course.lessons}</p>
            <div class="mt-4 flex gap-2">
                <button class="rounded-md bg-indigo-600 px-3 py-1.5 text-white text-sm hover:bg-indigo-500">Continue</button>
                <button class="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100">Details</button>
            </div>
        </article>
    `).join('');
}

/**
 * Wire up input listeners for live filtering and perform initial render.
 */
function bootstrapCourses() {
    const searchEl = document.getElementById('course-search');
    const statusEl = document.getElementById('course-status');

    searchEl?.addEventListener('input', renderCourses);
    statusEl?.addEventListener('change', renderCourses);

    renderCourses();
}

/**
 * Tiny hash-based router for toggling between sections without a framework.
 * Supports #home and #courses.
 */
function navigate() {
    const route = (location.hash || '#home').toLowerCase();
    const home = document.getElementById('home');
    const courses = document.getElementById('courses');
    const links = document.querySelectorAll('nav a[data-link]');

    // Update active link styles via aria-current
    links.forEach(a => {
        if (a.getAttribute('href') === route) {
            a.setAttribute('aria-current', 'page');
        } else {
            a.removeAttribute('aria-current');
        }
    });

    if (route === '#courses') {
        home?.classList.add('hidden');
        courses?.classList.remove('hidden');
        // Ensure course list is rendered when navigating
        renderCourses();
    } else {
        // Default to home
        home?.classList.remove('hidden');
        courses?.classList.add('hidden');
        renderFeaturedCourses();
    }
}

// Initialize on DOMContentLoaded to ensure elements are present
document.addEventListener('DOMContentLoaded', () => {
    // Initial renders
    renderFeaturedCourses();
    bootstrapCourses();

    // Route now and on hash change
    navigate();
    window.addEventListener('hashchange', navigate);

    // If user clicks a header link, ensure hash navigation runs
    document.querySelectorAll('a[data-link]').forEach((a) => {
        a.addEventListener('click', () => {
            // Allow default anchor hashing, navigate will run via hashchange
        });
    });
});


