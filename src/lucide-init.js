// Initialize Lucide icons on page load
// Access lucide from window (loaded via CDN)
const lucide = window.lucide || globalThis.lucide;

export function initLucide() {
    let initAttempts = 0;
    const maxAttempts = 50; // Maximum attempts over 5 seconds

    function createIcons() {
        if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
            try {
                lucide.createIcons();
                return true;
            } catch (e) {
                console.warn('Lucide icons initialization error:', e);
                return false;
            }
        }
        return false;
    }

    function attemptInit() {
        initAttempts++;
        if (createIcons()) {
            // Success - set up MutationObserver for dynamic content
            setupObserver();
        } else if (initAttempts < maxAttempts) {
            // Retry after 100ms
            setTimeout(attemptInit, 100);
        }
    }

    function setupObserver() {
        // Only set up observer if MutationObserver is available and lucide is ready
        if (typeof MutationObserver !== 'undefined' && typeof lucide !== 'undefined' && lucide) {
            try {
                const observer = new MutationObserver(() => {
                    // Debounce icon creation to avoid excessive calls
                    if (observer.debounceTimer) {
                        clearTimeout(observer.debounceTimer);
                    }
                        observer.debounceTimer = setTimeout(() => {
                            try {
                                if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
                                    lucide.createIcons();
                                }
                            } catch (e) {
                                // Silently fail
                            }
                        }, 100);
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            } catch (e) {
                // Silently fail if observer setup fails
            }
        }
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(attemptInit, 50);
        });
    } else {
        // DOM already loaded
        setTimeout(attemptInit, 50);
    }
}

// Auto-initialize when module loads
initLucide();

