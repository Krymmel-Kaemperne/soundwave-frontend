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
    const parts = name.trim().split(" ");
    if (parts.length < 2 || parts.some((p) => p.length === 0)) {
      alert("Indtast dit fulde navn (fornavn og efternavn).");
      return false;
    }
    return true;
  },

  validateEmail(email) {
    if (!email || !email.includes("@")) {
      alert("Indtast venligst en gyldig email‑adresse med @.");
      return false;
    }
    return true;
  },

  generateReservationNumber() {
    const datePart = Date.now().toString().slice(-5);
    const randomPart = Math.floor(Math.random() * 900 + 100);
    return `RES-${datePart}${randomPart}`;
  },

  render: async (eventId) => {
    const container = document.getElementById("checkout-form-container");
    if (!container) return;

    // henter event-data (titel mm.)
    try {
      const resp = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!resp.ok) throw new Error(`HTTP-fejl ${resp.status}`);
      const event = await resp.json();
      const eventName = event.title || `Event #${eventId}`;

      container.innerHTML = `
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
                <input id="email" type="email" placeholder="email@email.com" required>
              </div>

              <div class="checkout-field">
                <label for="cardNumber">Kortnummer:</label>
                <input id="cardNumber" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" required>
              </div>

              <div class="checkout-field half">
                <label for="expiry">Udløbsdato:</label>
                <input id="expiry" type="text" placeholder="MM/YY" maxlength="5" required>
              </div>

              <button type="submit" class="action-button">Bekræft køb</button>
            </form>
          </div>

          <div class="checkout-box checkout-summary-box" id="reservation-summary-checkout">
            <h3>Din reservation: <span style="font-style: italic">${eventName}</span></h3>
            <ul id="checkout-selected-seats"></ul>
            <p class="checkout-total">
              <strong>Total:</strong> <span id="checkout-total-price">0</span> DKK
            </p>
          </div>
        </div>
      `;

      CheckoutView.updateReservationSummary();
    } catch (error) {
      container.innerHTML = `<p style="color:red;">
        Kunne ikke hente eventdetaljer: ${error.message}
      </p>`;
    }
  },

  updateReservationSummary() {
    const seatList = document.getElementById("checkout-selected-seats");
    const totalSpan = document.getElementById("checkout-total-price");
    if (!seatList || !totalSpan) return;

    seatList.innerHTML = "";
    let total = 0;

    for (const key in SeatSelectionView.selectedSeats) {
      const item = SeatSelectionView.selectedSeats[key];
      let text = "";
      if (item.type === "seating") {
        text = `Række ${item.row}, Plads ${item.seat} (${item.price} DKK)`;
        total += item.price;
      } else if (item.type === "standing" && item.count > 0) {
        text = `${item.areaName} × ${item.count} (${
          item.count * item.price
        } DKK)`;
        total += item.count * item.price;
      }
      const li = document.createElement("li");
      li.textContent = text;
      seatList.appendChild(li);
    }
    totalSpan.textContent = total.toFixed(2);
  },

  afterRender(eventId) {
    setTimeout(() => {
      const form = document.getElementById("checkout-form");
      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = CheckoutView.formatName(
          document.getElementById("name").value
        );
        const email = document.getElementById("email").value;
        const cardNumber = document.getElementById("cardNumber").value.trim();

        if (!CheckoutView.validateName(name)) return;
        if (!CheckoutView.validateEmail(email)) return;

        const sanitized = cardNumber.replace(/[-\s]/g, "");
        if (sanitized.length !== 16 || isNaN(sanitized)) {
          alert("Kortnummer skal være 16 cifre.");
          return;
        }

        // send til backend
        const confirmation = await CheckoutView.sendReserevation(eventId, name);
        if (!confirmation) {
          alert("Booking mislykkedes, prøv igen.");
          return;
        }

        const reservation = {
          reservationNumber: CheckoutView.generateReservationNumber(),
          name: confirmation.customerName,
          email: confirmation.customerEmail,
          eventName: document
            .querySelector("#reservation-summary-checkout h3 span")
            .textContent.trim(),
          seats: SeatSelectionView.selectedSeats,
          total: confirmation.totalPrice,
          status: confirmation.status,
        };

        showPage("reservation-confirmation-page");
        ReservationConfirmationView.render(reservation);
        ReservationConfirmationView.afterRender();
      });
    }, 200);
  },

  async sendReserevation(eventId, name) {
    try {
      const email = document.getElementById("email").value;
      const totalPrice = parseFloat(
        document.getElementById("checkout-total-price").textContent
      );

     
      const cleanSeatIds = [];
      const standingAreas = [];

      for (const key in SeatSelectionView.selectedSeats) {
        const item = SeatSelectionView.selectedSeats[key];
        if (item.type === "seating" && item.id) {
          cleanSeatIds.push(Number(item.id)); 
        } else if (item.type === "standing" && item.count > 0) {
          standingAreas.push({
            areaId: Number(item.id),
            count: Number(item.count),
          });
        }
      }

      const data = {
        eventId: Number(eventId), 
        customerName: name,
        customerEmail: email,
        seatIds: cleanSeatIds,
        standingAreas: standingAreas,
        totalPrice: totalPrice,
      };

      console.log("📤 Sender booking data:", JSON.stringify(data, null, 2));

      const response = await fetch(
        "http://localhost:8080/checkout/confirm-booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Booking confirmed:", result);
      return result;
    } catch (err) {
      console.error("❌ Fejl ved booking:", err);
      alert("Der opstod en fejl: " + err.message);
      return null;
    }
  },
};
