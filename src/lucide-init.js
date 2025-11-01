// Initialize Lucide icons on page load
(function initLucide() {
    function createIcons() {
        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (e) {
                console.warn('Lucide icons not ready:', e);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createIcons);
    } else {
        // DOM already loaded
        setTimeout(createIcons, 100);
    }

    // Re-initialize after dynamic content is added
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                try {
                    lucide.createIcons();
                } catch (e) {
                    // Silently fail
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }, 200);
})();

