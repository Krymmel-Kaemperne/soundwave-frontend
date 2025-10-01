// scripts/seatSelection.js

const SeatSelectionView = {
    render: (eventId) => { // Parameter 'eventId'
        const container = document.getElementById("seat-map-container");
        container.innerHTML = `
            <h2>Vælg sæder for Event: ${eventId}</h2>
            <p>Her vil sædeplanen eller antal ståpladser blive vist.</p>
            <div style="background-color:#eee; padding: 20px; border-radius: 8px; text-align: center;">
                <p>Mock sædeplan/antal input</p>
                <input type="number" value="1" min="1" max="5" style="width: 100px; padding: 5px;">
                <p>Mock valg af sæder/antal</p>
            </div>
            <h3>Din Bestilling</h3>
            <ul id="selected-seats-list"><li>Mock Sæde 1</li><li>Mock Sæde 2</li></ul>
            <p>Total: <span>500</span> DKK</p>
        `;
    },
    afterRender: (eventId) => { // Parameter 'eventId'
        const backButton = document.getElementById('seat-selection-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                showPage('event-detail-page');
                EventDetailView.render(eventId); // Brug 'eventId'
                EventDetailView.afterRender(eventId); // Brug 'eventId'
            });
        } else {
            console.error("Fejl: #seat-selection-back-button blev ikke fundet.");
        }
        
        const proceedButton = document.getElementById('proceed-to-checkout-button');
        if (proceedButton) {
            proceedButton.addEventListener('click', () => {
                showPage('checkout-page');
                CheckoutView.render(eventId); // Brug 'eventId'
                CheckoutView.afterRender(eventId); // Brug 'eventId'
            });
        } else {
            console.error("Fejl: #proceed-to-checkout-button blev ikke fundet.");
        }
    }
};