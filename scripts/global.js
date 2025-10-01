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