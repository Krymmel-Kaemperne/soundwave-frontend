const OrderConfirmationView = {
  render: (orderData) => {
    const container = document.getElementById("order-confirmation-page");
    if (!container)
      return console.error("Fejl: #order-confirmation-page ikke fundet.");

    container.innerHTML = `
      <div class="order-confirmation">
        <h2>Tak for dit køb, ${orderData.name}!</h2>
        <p>Din ordre er nu bekræftet.</p>
        <div class="order-details-box">
          <p><strong>Ordrenummer:</strong> ${orderData.orderNumber}</p>
          <p><strong>Email:</strong> ${orderData.email}</p>
          <p><strong>Event:</strong> ${orderData.eventName}</p>
          <h3>Valgte billetter:</h3>
          <ul id="confirmed-seats" ></ul>
          <p><strong>Total:</strong> ${orderData.total} DKK</p>
        </div>
        <button id="back-to-events" class="action-button">Tilbage til events</button>
      </div>
    `;

    // Fyld billetterne ind:
    const ul = document.getElementById("confirmed-seats");
    for (const key in orderData.seats) {
      const item = orderData.seats[key];
      const li = document.createElement("li");
      li.textContent =
        item.type === "seating"
          ? `Række ${item.row}, Plads ${item.seat} (${item.price} DKK)`
          : `${item.areaName} × ${item.count} (${item.count * item.price} DKK)`;
      ul.appendChild(li);
    }

    // 🟢 Efter HTML’en er sat ind, kaldes afterRender
    OrderConfirmationView.afterRender();
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