// scripts/eventOverview.js

const EventOverviewView = {
    render: () => {
        const container = document.getElementById("event-list");
        container.innerHTML = `
            <h2>Kommende Events</h2>
            <div class="event-grid">
                <div class="event-card" data-event-id="mock-event-1">
                    <h3>Mock Event 1</h3>
                    <p>Dato: 01-11-2025</p>
                    <p>Klik for detaljer</p>
                </div>
                <div class="event-card sold-out" data-event-id="mock-event-2">
                    <h3>Mock Event 2 (Udsolgt)</h3>
                    <p>Dato: 15-11-2025</p>
                </div>
            </div>
        `;
    },
    afterRender: () => {
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const eventId = card.dataset.eventId || "mock-event-id"; 
                showPage('event-detail-page');
                EventDetailView.render(eventId); 
                EventDetailView.afterRender(eventId); 
            });
        });
    }
};