const ReservationConfirmationView = {
  render: (reservationData) => {
    const container = document.getElementById("reservation-confirmation-page");
    if (!container)
      return console.error("Fejl: #reservation-confirmation-page ikke fundet.");

    container.innerHTML = `
      <div class="reservation-confirmation">
        <h2>Tak for dit køb, ${reservationData.name}!</h2>
        <p>Din ordre er nu bekræftet.</p>
        <div class="reservation-details-box">
          <p><strong>Ordrenummer:</strong> ${reservationData.reservationNumber}</p>
          <p><strong>Email:</strong> ${reservationData.email}</p>
          <p><strong>Event:</strong> ${reservationData.eventName}</p>
          <h3>Valgte billetter:</h3>
          <ul id="confirmed-seats" ></ul>
          <p><strong>Total:</strong> ${reservationData.total} DKK</p>
        </div>
        <button id="back-to-events" class="action-button">Tilbage til events</button>
      </div>
    `;

    //Billetter
    const ul = document.getElementById("confirmed-seats");
    for (const key in reservationData.seats) {
      const item = reservationData.seats[key];
      const li = document.createElement("li");
      li.textContent =
        item.type === "seating"
          ? `Række ${item.row}, Plads ${item.seat} (${item.price} DKK)`
          : `${item.areaName} × ${item.count} (${item.count * item.price} DKK)`;
      ul.appendChild(li);
    }

    ReservationConfirmationView.afterRender();
  },

  afterRender: () => {
    // Tilbage‑knappen skal virke som dine andre
    const backBtn = document.getElementById("back-to-events");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        showPage("event-overview-page");
        EventOverviewView.render();
        EventOverviewView.afterRender();
      });
    }
  },
};
