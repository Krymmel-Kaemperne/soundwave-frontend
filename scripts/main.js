// scripts/main.js - Din enkleste hovedcontroller

// *** Applikationens Startpunkt ***
document.addEventListener("DOMContentLoaded", () => {
    
  
  //logo er link til event overview
    document.getElementById("nav-home")?.addEventListener("click", (e) => {
    e.preventDefault();
    showPage("event-overview-page");
    EventOverviewView.render();
    EventOverviewView.afterRender();
  });
    
  document.getElementById("nav-show-admin")?.addEventListener("click", (e) => {
  e.preventDefault();
  showPage("admin-panel-page");
  AdminPanelView.render();
  AdminPanelView.afterRender();
});

document.getElementById("back-to-overview")?.addEventListener("click", (e) => {
  e.preventDefault();
  showPage("event-overview-page");
  EventOverviewView.render();
  EventOverviewView.afterRender();
});

document.getElementById('nav-show-about').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('about-soundwave-page');
        AboutView.render();
        AboutView.afterRender();
    });

    // Start applikationen ved at vise Event Oversigt som standard
    showPage('event-overview-page');
    EventOverviewView.render(); 
    EventOverviewView.afterRender();
});



