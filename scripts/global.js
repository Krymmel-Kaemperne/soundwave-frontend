// scripts/global.js

// Funktion til at skifte, hvilken 'side' der er synlig
function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(page => {
        page.classList.remove('active');
    });
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    } else {
        console.error(`Page with ID "${pageId}" not found.`);
    }
}

// Polyfill for crypto.randomUUID if not available
function generateUUID() {
    // Check if crypto.randomUUID is available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

if (!localStorage.getItem('userSessionId')) {
    localStorage.setItem('userSessionId', generateUUID());
    console.log("Ny userSessionId genereret:", localStorage.getItem('userSessionId'));
} else {
    console.log("Eksisterende userSessionId:", localStorage.getItem('userSessionId'));
}