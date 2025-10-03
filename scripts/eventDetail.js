// scripts/eventDetail.js

const EventDetailView = {
  render: async (eventId) => {
    const container = document.getElementById("event-detail-content");
    if (!container) {
          console.error("Fejl: #event-detail-content div'en blev ikke fundet.");
          return;
    }
    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Kunne ikke hente event detaljer.");
      }

       const event = await response.json();

      // Kontroller om eventet er solgt ud
      const isSoldOut = event.status === 'Sold Out';
      const buttonHtml = isSoldOut 
        ? `<p class="sold-out-text">Udsolgt!</p>`
        : `<button id="buy-tickets-btn" class="action-button">Køb Billet</button>`;

      container.innerHTML = `
        <div style="display: flex; gap: 32px; align-items: flex-start; padding: 20px;">
            <div style="flex: 1;">
                <button id="detail-back-button" class="action-button" style="margin-bottom: 16px;">&larr; Tilbage til oversigt</button>
                <h1>${event.title}</h1>
                <p><strong>Dato:</strong> ${new Date(event.eventDate).toLocaleString('da-DK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Hal:</strong> ${event.hall ? event.hall.name : 'Ukendt Hal'}</p>
                <p><strong>Beskrivelse:</strong> ${event.description}</p>
                <p><strong>Status:</strong> ${event.status}</p>
                <p><strong>Pris fra:</strong> ${event.basePrice} DKK</p>
                ${buttonHtml} <!-- Knap eller udsolgt-tekst -->
            </div>
            <div style="flex: 2; display: flex; justify-content: flex-end;">
                ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" class="event-image" style="max-width: 100%; height: auto; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>` : ""}
            </div>
        </div>
      `;
      // Efter at have genereret HTML, kalder vi afterRender
      EventDetailView.afterRender(eventId);

    } catch (err) {
      console.error("Fejl i EventDetailView.render:", err);
      container.innerHTML = `
        <div style="padding: 20px;">
            <p style="color:red;">Fejl ved indlæsning af event detaljer.</p>
            <button id="detail-back-button" class="action-button">Tilbage til oversigt</button>
        </div>
      `;
      // Kald afterRender selv ved fejl for at sikre tilbage-knappen virker
      EventDetailView.afterRender(eventId);
    }
  },

  afterRender: (eventId) => {
    // Tilbage-knap
    const backBtn = document.getElementById("detail-back-button");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        showPage("event-overview-page");
        EventOverviewView.render();
        EventOverviewView.afterRender();
      });
    }

    // Køb Billet-knap
    const buyTicketsButton = document.getElementById("buy-tickets-btn");
    if (buyTicketsButton) { // Denne knap vil nu eksistere, hvis eventet ikke er udsolgt
      buyTicketsButton.addEventListener("click", () => {
        showPage("seat-selection-page");
        SeatSelectionView.render(eventId);
        SeatSelectionView.afterRender(eventId);
      });
    }
  },
};