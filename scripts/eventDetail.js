// scripts/eventDetail.js

const EventDetailView = {
    render: (eventId) => {
        const container = document.getElementById("event-detail-content");
        container.innerHTML = `
            <h2>Detaljer for: ${eventId}</h2>
            <p>Dette er en placeholder for detaljer om eventet.</p>
            <button id="buy-tickets-btn" class="action-button">Køb Billet</button>
        `;
    },
    afterRender: (eventId) => { // Parameter 'eventId'
        document.getElementById('detail-back-button').addEventListener('click', () => {
            showPage('event-overview-page');
            EventOverviewView.render();
            EventOverviewView.afterRender();
        });

        const buyTicketsButton = document.getElementById('buy-tickets-btn');
        if (buyTicketsButton) {
            buyTicketsButton.addEventListener('click', () => {
                showPage('seat-selection-page');
                SeatSelectionView.render(eventId); // Brug 'eventId'
                SeatSelectionView.afterRender(eventId); // Brug 'eventId'
            });
        } else {
            console.error("Fejl: #buy-tickets-btn blev ikke fundet på EventDetailView.");
        }
    }
};