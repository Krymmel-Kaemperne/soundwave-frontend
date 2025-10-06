// scripts/checkout.js

const CheckoutView = {
  formatName(nameInput) {
    if (!nameInput) return "";

    return nameInput
      .trim() // fjern kun foran/bagved
      .replace(/\s+/g, " ") // lav flere mellemrum til kun ét
      .split(" ") // del ved mellemrum
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" "); // saml igen med ét mellemrum
  },

  render: (eventId) => {
    // Parameter 'eventId'
    const checkoutFormContainer = document.getElementById(
      "checkout-form-container"
    );
    if (!checkoutFormContainer) {
      console.error(
        "Fejl: #checkout-form-container div'en blev ikke fundet i CheckoutView.render()."
      );
      return;
    }
    checkoutFormContainer.innerHTML = `
  <h2>Gennemfør Køb for Event: ${eventId}</h2>
  <p>Indtast dine oplysninger for at gennemføre købet</p>
  <form id="checkout-form">
    <div class="checkout-field">
      <label for="name">Navn:</label>
      <input id="name" type="text" placeholder="Dit navn" required>
    </div> 

    <div class="checkout-field">
      <label for="email">Email:</label>
      <input id="email" type="text" placeholder="email@email.com" required>
    </div> 
    <br>
   <div class="checkout-field">
  <label for="cardNumber">Kortoplysninger:</label>

  <div class="card-icons-row">
    <p class="secure-payment">🔒 Sikker betaling</p>
    <div class="card-icons">
      <img src="images/visa.jpg" alt="Visa" title="Visa">
      <img src="images/mastercard.jpg" alt="Mastercard" title="Mastercard">
      <img src="images/mobile-pay.jpg" alt="Mobile Pay" title="Mobile Pay">
      <img src="images/dankort.jpg" alt="Dankort" title="Dankort">
    </div>
  </div>

  <input id="cardNumber" type="text" placeholder="XXXX‑XXXX‑XXXX‑XXXX" required>

<div class="checkout-field">
  <div class="checkout-field half">
    <label for="expiry">Udløbsdato:</label>
    <input id="expiry" type="text" placeholder="MM/YY" maxlength="5" required>
  </div>

    
  </div>
</div>

</div>

    <button type="submit" class="action-button">Bekræft Køb (Mock)</button>
  </form>
  <p class="checkout-success-message">Køb bekræftet (mock)!</p>
`;
  },
  afterRender: (eventId) => {
    /** ← Tilbage til sæder‑knappen **/
    const backButton = document.getElementById("checkout-back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        showPage("seat-selection-page");
        SeatSelectionView.render(eventId); // Brug 'eventId'
        SeatSelectionView.afterRender(eventId); // Brug 'eventId'
      });
    } else {
      console.error(
        "Fejl: #checkout-back-button blev ikke fundet i CheckoutView.afterRender()."
      );
    }

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        let name = document.getElementById("name").value;
        name = CheckoutView.formatName(name); // <– formatér navnet her
        document.getElementById("name").value = name; // opdater feltet visuelt

        const cardNumber = document.getElementById("cardNumber").value.trim();

        //simpel validering
        if (name === "" || name === " ") {
          alert("Indtast venligst dit navn.");
          return;
        }

        const sanitizedCard = cardNumber.replace(/[-\s]/g, "");
        if (sanitizedCard.length !== 16 || isNaN(sanitizedCard)) {
          alert("Kortnummer skal være 16 cifre.");
          return;
        }

        await CheckoutView.sendReserevation(eventId, name);

        alert("Checkout-formular sendt (mock)!");
      });
    }
  },
};
