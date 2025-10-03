// scripts/adminPanel.js

const AdminPanelView = {
    render: () => {
        const pageContainer = document.getElementById("admin-panel-page"); 
        if (!pageContainer) {
            console.error("Fejl: #admin-panel-page div'en blev ikke fundet.");
            return; 
        }
        pageContainer.innerHTML = `
            <h2>Admin Panel</h2>
            <p>Her kan Sebastian administrere events.</p>
            <button id="create-event-btn" class="action-button">Opret Event</button>
            <button id="view-all-events-btn" class="action-button">Se Alle Events</button>
            <br><br> 
            <button id="admin-back-button" class="action-button">Tilbage til oversigt</button> 
        `;
    },
    afterRender: () => {
        const backButton = document.getElementById('admin-back-button');
        if (backButton) { 
            backButton.addEventListener('click', () => {
                showPage('event-overview-page');
                EventOverviewView.render(); 
                EventOverviewView.afterRender();
            });
        }

        const createEventBtn = document.getElementById('create-event-btn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                alert('Opret Event-formular kommer snart!'); 
            });
        }

        const viewAllEventsBtn = document.getElementById('view-all-events-btn');
        if (viewAllEventsBtn) {
            viewAllEventsBtn.addEventListener('click', () => {
                alert('Vis alle events-liste kommer snart!'); 
            });
        }
    }
};