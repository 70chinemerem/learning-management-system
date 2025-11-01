// Initialize Lucide icons on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Re-initialize after dynamic content is added
if (typeof lucide !== 'undefined') {
    const observer = new MutationObserver(() => {
        lucide.createIcons();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

