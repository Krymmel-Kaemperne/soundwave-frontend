// scripts/checkout.js

const CheckoutView = {
    render: (eventId) => { // Parameter 'eventId'
        const checkoutFormContainer = document.getElementById("checkout-form-container");
        if (!checkoutFormContainer) {
            console.error("Fejl: #checkout-form-container div'en blev ikke fundet i CheckoutView.render().");
            return;
        }
        checkoutFormContainer.innerHTML = `
            <h2>Gennemfør Køb for Event: ${eventId}</h2>
            <p>Her kommer betalingsformularen.</p>
            <form style="background-color:#f9f9f9; padding: 20px; border-radius: 8px;">
                <label>Navn: <input type="text" placeholder="Dit navn"></label><br><br>
                <label>Kortnummer: <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX"></label><br><br>
                <button type="submit" class="action-button">Bekræft Køb (Mock)</button>
            </form>
            <p style="margin-top: 15px; color: green;">Køb bekræftet (mock)!</p>
        `;
    },
    afterRender: (eventId) => { // Parameter 'eventId'
        const backButton = document.getElementById('checkout-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                showPage('seat-selection-page');
                SeatSelectionView.render(eventId); // Brug 'eventId'
                SeatSelectionView.afterRender(eventId); // Brug 'eventId'
            });
        } else {
            console.error("Fejl: #checkout-back-button blev ikke fundet i CheckoutView.afterRender().");
        }
        
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Checkout-formular sendt (mock)!');
            });
        }
    }
};