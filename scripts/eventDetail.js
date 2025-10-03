const EventDetailView = {
  render: async (eventId) => {
    const container = document.getElementById("event-detail-content");

    try {
      const response = await fetch("http://localhost:8080/events");
      if (!response.ok) {
        throw new Error("Kunne ikke hente event detaljer.");
      }

      const events = await response.json();
      const event = events[eventId]; // match by eventId

      if (!event) {
        throw new Error("Event ikke fundet.");
      }

    container.innerHTML = `
        <div style="display: flex; gap: 32px; align-items: flex-start;">
            <div style="flex: 1; margin: 2rem;">
                <button id="detail-back-button" class="action-button" style="margin-bottom: 16px;">&larr; Tilbage til oversigt</button>
                <h1>${event.title}</h1>
                <p><strong>Dato:</strong> ${new Date(event.event_date).toLocaleString()}</p>
                <p><strong>Beskrivelse:</strong> ${event.description}</p>
              <!--  <p><strong>Status:</strong> ${event.status}</p> -->
                <p><strong>Pris fra:</strong> ${event.base_price} kr.</p>
                <button id="buy-tickets-btn" class="action-button">Køb Billet</button>
            </div>
            <div style="flex: 2; display: flex; justify-content: flex-end;">
                ${
                    event.image_base64
                        ? `<img src="data:image/jpeg;base64,${event.image_base64}" 
                                    alt="${event.title}" class="event-image" style="max-width: 100%; width: 100%; object-fit: contain;"/>`
                        : ""
                }
            </div>
        </div>
    `;
    EventDetailView.afterRender(eventId);
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <p style="color:red;">Fejl ved indlæsning af event detaljer.</p>
        <button id="detail-back-button" class="action-button">Tilbage</button>
      `;
    }
  },

  afterRender: (eventId) => {
    const backBtn = document.getElementById("detail-back-button");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        showPage("event-overview-page");
        EventOverviewView.render();
        EventOverviewView.afterRender();
      });
    }

    const buyTicketsButton = document.getElementById("buy-tickets-btn");
    if (buyTicketsButton) {
      buyTicketsButton.addEventListener("click", () => {
        showPage("seat-selection-page");
        SeatSelectionView.render(eventId);
        SeatSelectionView.afterRender(eventId);
      });
    }
  },
};