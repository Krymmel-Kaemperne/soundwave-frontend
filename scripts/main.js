// scripts/main.js - Din enkleste hovedcontroller

// *** Applikationens Startpunkt ***
document.addEventListener("DOMContentLoaded", () => {
    // Navigationslinks i headeren
    document.getElementById('nav-show-events').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('event-overview-page');
        EventOverviewView.render(); // Kald render for event-oversigt
        EventOverviewView.afterRender(); // Og kald afterRender for at sætte listeners
    });

    
  document.getElementById('nav-show-admin').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('admin-panel-page');
    AdminPanelView.render();
    AdminPanelView.afterRender();
  });

    // Start applikationen ved at vise Event Oversigt som standard
    showPage('event-overview-page');
    EventOverviewView.render(); 
    EventOverviewView.afterRender();
});