// scripts/eventDetail.js

const EventDetailView = {
  render: async (eventId) => {
    const container = document.getElementById("event-detail-content");

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Kunne ikke hente event detaljer.");
      }

      const event = await response.json();

      // 👇 reuse "choose image" logic here
      const eventImage =
        event.imageUrl ||
        (event.image_base64
          ? `data:image/jpeg;base64,${event.image_base64}`
          : "/images/placeholder.jpg");

      container.innerHTML = `
        <h2>${event.title}</h2>
        <img src="${eventImage}" alt="${event.title}" class="event-image"/>
        <p><strong>Dato:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
        <p><strong>Beskrivelse:</strong> ${event.description}</p>
        <p><strong>Status:</strong> ${event.status}</p>
        <p><strong>Pris fra:</strong> ${event.basePrice} kr.</p>

        <button id="buy-tickets-btn" class="action-button">Køb Billet</button>
      `;
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