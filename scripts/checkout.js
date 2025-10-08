// scripts/checkout.js
const CheckoutView = {
  formatName(nameInput) {
    if (!nameInput) return "";

    return nameInput
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  },

  validateName(name) {
    if (!name) {
      alert("Indtast venligst dit navn.");
      return false;
    }

    const nameParts = name.trim().split(" ");
    if (nameParts.length < 2 || nameParts.some((part) => part.length === 0)) {
      alert("Indtast venligst dit fulde navn (fornavn og efternavn).");
      return false;
    }
    return true;
  },

  validateEmail(email) {
    if (!email || !email.includes("@")) {
      alert("Indtast venligst en gyldig email-adresse med @.");
      return false;
    }
    return true;
  },

  generateReservationNumber: () => {
    const datePart = Date.now().toString().slice(-5);
    const randomPart = Math.floor(Math.random() * 900 + 100);
    return `RES-${datePart}${randomPart}`;
  },

  render: async (eventId) => {
    const checkoutFormContainer = document.getElementById(
      "checkout-form-container"
    );
    if (!checkoutFormContainer) return;

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!response.ok) throw new Error(`HTTP-fejl ${response.status}`);

      const event = await response.json();
      const eventName = event.title || `Event #${eventId}`;

      checkoutFormContainer.innerHTML = `
        <div class="checkout-layout">
          <div class="checkout-box checkout-form-box">
            <h2>Gennemfør køb:</h2>
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

              <div class="checkout-field">
                <label for="cardNumber">Kortoplysninger:</label>
                <div class="card-icons-row">
                  <p class="secure-payment">🔒 Sikker betaling</p>
                  <div class="card-icons">
                    <img src="images/visa.jpg" alt="Visa" title="Visa" />
                    <img src="images/mastercard.jpg" alt="Mastercard" title="Mastercard" />
                    <img src="images/mobile-pay.jpg" alt="Mobile Pay" title="Mobile Pay" />
                    <img src="images/dankort.jpg" alt="Dankort" title="Dankort" />
                  </div>
                </div>
                <input id="cardNumber" type="text" placeholder="XXXX‑XXXX‑XXXX‑XXXX" required>
              </div>

              <div class="checkout-field half">
                <label for="expiry">Udløbsdato:</label>
                <input id="expiry" type="text" placeholder="MM/YY" maxlength="5" required>
              </div>

              <button type="submit" class="action-button">Bekræft Køb</button>
            </form>
          </div>

          <div class="checkout-box checkout-summary-box" id="reservation-summary-checkout">
            <h3>Din bestilling: <span style="font-style: italic">${eventName}</span></h3>
            <ul id="checkout-selected-seats" style="list-style:none; padding:0;"></ul>
            <p class="checkout-total"><strong>Total:</strong> <span id="checkout-total-price">0</span> DKK</p>
          </div>
        </div>
      `;

      CheckoutView.updateReservationSummary();
    } catch (error) {
      checkoutFormContainer.innerHTML = `<p style="color:red;">Kunne ikke hente eventdetaljer. Fejl: ${error.message}</p>`;
    }
  },

  updateReservationSummary: () => {
    const seatList = document.getElementById("checkout-selected-seats");
    const totalPriceSpan = document.getElementById("checkout-total-price");

    if (!seatList || !totalPriceSpan) return;

    seatList.innerHTML = "";
    let total = 0;

    for (const key in SeatSelectionView.selectedSeats) {
      const item = SeatSelectionView.selectedSeats[key];
      let text = "";

      //Seating
      if (item.type === "seating") {
        text = `Række ${item.row}, Plads ${item.seat} (${item.price} DKK)`;
        total += item.price;

        //Standing
      } else if (item.type === "standing" && item.count > 0) {
        text = `${item.areaName} × ${item.count} (${
          item.count * item.price
        } DKK)`;
        total += item.count * item.price;
      }

      const li = document.createElement("li");
      li.innerHTML = text;
      seatList.appendChild(li);
    }

    totalPriceSpan.textContent = total.toFixed(2);
  },

  afterRender: (eventId) => {
    const backButton = document.getElementById("checkout-back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        showPage("seat-selection-page");
        SeatSelectionView.render(eventId);
        SeatSelectionView.afterRender(eventId);
      });
    }

    setTimeout(() => {
      const checkoutForm = document.getElementById("checkout-form");
      if (checkoutForm) {
        checkoutForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const name = CheckoutView.formatName(
            document.getElementById("name").value
          );
          const email = document.getElementById("email").value;
          const cardNumber = document.getElementById("cardNumber").value.trim();

          if (!CheckoutView.validateName(name)) {
            return;
          }

          if (!CheckoutView.validateEmail(email)) {
            return;
          }

          const sanitizedCard = cardNumber.replace(/[-\s]/g, "");
          if (sanitizedCard.length !== 16 || isNaN(sanitizedCard)) {
            alert("Kortnummer skal være 16 cifre.");
            return;
          }

          await CheckoutView.sendReserevation(eventId, name);

          const reservation = {
            reservationNumber: CheckoutView.generateReservationNumber(),
            name: name,
            email: email,
            eventName: document
              .querySelector("#reservation-summary-checkout h3 span")
              .textContent.trim(),
            seats: SeatSelectionView.selectedSeats,
            total: document.getElementById("checkout-total-price").textContent,
          };

          showPage("reservation-confirmation-page");
          ReservationConfirmationView.render(reservation);
          ReservationConfirmationView.afterRender();
        });
      }
    }, 200);
  },

  async sendReserevation(eventId, name) {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
};
