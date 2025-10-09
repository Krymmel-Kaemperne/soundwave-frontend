// scripts/adminPanel.js

// === KONFIGURATION ===
const API_URL = "http://localhost:8080";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const AdminPanelView = {
  // === DASHBOARD RENDERING ===
  // Viser hovedoversigten med event-tabel
  render: () => {
    const pageContainer = document.getElementById("admin-panel-page");
    if (!pageContainer) {
      console.error("Fejl: admin-panel-page ikke fundet i DOM");
      return;
    }

    pageContainer.innerHTML = `
      <div class="admin-panel">
        <div class="admin-header">
          <h2>Event Manager Dashboard</h2>
          <div class="admin-actions">
            <button id="create-event-btn" class="action-button">Opret Event</button>
            <button id="admin-back-button" class="action-button">Tilbage til oversigt</button>
          </div>
        </div>
      
        <div id="events-table-container">
          <p>Henter events...</p>
        </div>
      </div>
    `;

    AdminPanelView.loadEventsTable();
  },

  // Tilføjer event listeners til dashboard-knapper
  afterRender: () => {
    const backButton = document.getElementById("admin-back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        showPage("event-overview-page");
        EventOverviewView.render();
        EventOverviewView.afterRender();
      });
    }

    const createEventBtn = document.getElementById("create-event-btn");
    if (createEventBtn) {
      createEventBtn.addEventListener("click", () => {
        AdminPanelView.showEventForm();
      });
    }
  },

  // === EVENT FORMULAR ===
  // Viser formular til oprettelse eller redigering af event
  showEventForm: (event = null) => {
    const isEdit = event !== null;
    const pageContainer = document.getElementById("admin-panel-page");
    
    pageContainer.innerHTML = `
      <div class="admin-panel">
        <div class="admin-header">
          <h2>${isEdit ? 'Rediger' : 'Opret'} Event</h2>
          <div class="admin-actions">
            <button type="button" id="cancel-form" class="action-button">Tilbage</button>
          </div>
        </div>
        <div id="form-errors" class="error-box"></div>

        <form id="event-form" class="event-form">
          <div class="form-group">
            <label for="event-title">Titel</label>
            <input type="text" id="event-title" value="${event?.title || ''}" required>
          </div>

          <div class="form-group">
            <label for="event-status">Status</label>
            <select id="event-status" required>
              ${!isEdit ? '<option value="">-- Vælg status --</option>' : ''}
              <option value="PLANNED" ${event?.status === 'PLANNED' ? 'selected' : ''}>Planlagt</option>
              <option value="Scheduled" ${event?.status === 'Scheduled' ? 'selected' : ''}>Aktiv</option>
              ${isEdit ? `<option value="Sold Out" ${event?.status === 'Sold Out' ? 'selected' : ''}>Udsolgt</option>` : ''}
              <option value="CANCELLED" ${event?.status === 'CANCELLED' ? 'selected' : ''}>Aflyst</option>
            </select>
          </div>

          <div class="form-group">
            <label for="event-description">Beskrivelse</label>
            <textarea id="event-description" rows="3" required>${event?.description || ''}</textarea>
          </div>

          <div class="form-group">
            <label for="event-date">Dato og tid</label>
            <input type="datetime-local" id="event-date" value="${event ? event.eventDate.slice(0, 16) : ''}" required>
          </div>

          <div class="form-group">
            <label for="event-price">Basispris (DKK)</label>
            <input type="number" id="event-price" value="${event?.basePrice || ''}" min="0" step="0.01" required>
          </div>

          <div class="form-group">
            <label for="event-hall">Sal</label>
            <select id="event-hall" required>
              ${!isEdit ? '<option value="">-- Vælg Sal --</option>' : ''}
              <option value="1" ${event?.hall?.hallId === 1 ? 'selected' : ''}>Arena</option>
              <option value="2" ${event?.hall?.hallId === 2 ? 'selected' : ''}>Konference</option>
            </select>
          </div>

          <div class="form-group">
            <label for="event-image">Billede</label>
            <input type="file" id="event-image" accept="image/*">
            <small>Upload et ${isEdit ? 'nyt ' : ''}billede${isEdit ? ' for at erstatte det eksisterende' : ' til eventet'} (valgfrit)</small>
            ${event?.imageUrl ? `<div style="margin-top: 10px;"><small>Nuværende billede: ${event.imageUrl}</small></div>` : ''}
          </div>
       
          <div class="form-actions">
            <button type="submit" class="action-button">${isEdit ? 'Gem Ændringer' : 'Gem Event'}</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("event-form").addEventListener("submit", (e) => {
      e.preventDefault();
      AdminPanelView.saveEvent(event?.eventId);
    });

    document.getElementById("cancel-form").addEventListener("click", () => {
      AdminPanelView.navigateToDashboard();
    });
  },

  // Henter event-data og viser redigeringsformular
  showEditForm: async (eventId) => {
    try {
      const event = await AdminPanelView.fetchEvent(eventId);
      AdminPanelView.showEventForm(event);
    } catch (error) {
      alert(`Fejl: ${error.message}`);
    }
  },

  // === GEMME EVENT ===
  // Opretter eller opdaterer et event
  saveEvent: async (eventId) => {
    const formData = AdminPanelView.getFormData();
    const errors = AdminPanelView.validateForm(formData);
    
    if (errors.length > 0) {
      document.getElementById("form-errors").innerHTML = errors.join("<br>");
      return;
    }
    
    document.getElementById("form-errors").innerHTML = "";

    try {
      let imageUrl = eventId ? (await AdminPanelView.fetchEvent(eventId)).imageUrl : null;
      
      if (formData.fileInput.files.length > 0) {
        imageUrl = await AdminPanelView.uploadImage(formData.fileInput.files[0]);
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        eventDate: formData.eventDate,
        basePrice: parseFloat(formData.basePrice),
        hall: { hallId: parseInt(formData.hallId) },
        imageUrl,
        isVisible: formData.isVisible
      };

      const url = eventId ? `${API_URL}/events/${eventId}` : `${API_URL}/events`;
      const method = eventId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error("Kunne ikke gemme event");

      AdminPanelView.navigateToDashboard();
    } catch (error) {
      alert(`Fejl: ${error.message}`);
    }
  },

  // === FORMULAR HJÆLPEFUNKTIONER ===
  // Henter værdier fra formularen
  getFormData: () => ({
    title: document.getElementById("event-title").value.trim(),
    description: document.getElementById("event-description").value.trim(),
    status: document.getElementById("event-status").value,
    eventDate: document.getElementById("event-date").value,
    basePrice: document.getElementById("event-price").value,
    hallId: document.getElementById("event-hall").value,
    fileInput: document.getElementById("event-image"),
  }),

  // Validerer formulardata
  validateForm: (data) => {
    const errors = [];
    if (!data.title) errors.push("Titel skal udfyldes.");
    if (!data.description) errors.push("Beskrivelse skal udfyldes.");
    if (!data.status) errors.push("Status skal vælges.");
    if (!data.eventDate) errors.push("Dato og tid skal vælges.");
    if (!data.basePrice || parseFloat(data.basePrice) <= 0) errors.push("Basispris skal være større end 0.");
    if (!data.hallId) errors.push("Sal skal vælges.");
    return errors;
  },

  // === BILLEDE UPLOAD ===
  // Uploader billede til serveren
  uploadImage: async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Filen er for stor. Vælg venligst et billede under 10MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      mode: 'cors',
      body: formData
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error("Filen er for stor. Vælg venligst et billede under 10MB.");
      }
      throw new Error("Billed-upload fejlede");
    }

    return await response.text();
  },

  // === EVENTS TABEL ===
  // Indlæser og viser tabel med alle events
  loadEventsTable: async () => {
    const eventsTableContainer = document.getElementById("events-table-container");
    
    try {
      const events = await AdminPanelView.fetchEvents();
      
      if (events.length === 0) {
        eventsTableContainer.innerHTML = "<p>Ingen events fundet.</p>";
        return;
      }

      let tableHtml = `
        <table class="admin-events-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titel</th>
              <th>Dato</th>
              <th>Status</th>
              <th>Hal</th>
              <th>Pris</th>
              <th>Handlinger</th>
            </tr>
          </thead>
          <tbody>
      `;

      events.forEach(event => {
        const eventDate = new Date(event.eventDate).toLocaleDateString('da-DK');
        const isVisible = event.isVisible !== undefined ? event.isVisible : true;
        const statusClass = event.status === 'Sold Out' ? 'status-sold-out' :
                           event.status === 'Scheduled' ? 'status-scheduled' : 'status-other';
        
        tableHtml += `
          <tr class="${isVisible ? '' : 'event-hidden'}">
            <td>${event.eventId}</td>
            <td>${event.title}</td>
            <td>${eventDate}</td>
            <td class="${statusClass}">${event.status}</td>
            <td>${event.hall?.name || 'Ukendt'}</td>
            <td>${event.basePrice ? event.basePrice + ' DKK' : 'Ukendt'}</td>
            <td>
              <button class="btn-action btn-view" data-event-id="${event.eventId}">Vis</button>
              <button class="btn-action btn-edit" data-event-id="${event.eventId}">Rediger</button>
              <button class="btn-action btn-toggle" data-event-id="${event.eventId}" data-is-visible="${isVisible}">${isVisible ? 'Skjul' : 'Vis'}</button>
              <button class="btn-action btn-cancel" data-event-id="${event.eventId}">Aflys</button>
            </td>
          </tr>
        `;
      });

      tableHtml += `</tbody></table>`;
      eventsTableContainer.innerHTML = tableHtml;

      // Event delegation - håndterer alle knap-klik i tabellen
      eventsTableContainer.addEventListener('click', (e) => {
        const eventId = e.target.dataset.eventId;
        if (!eventId) return;

        if (e.target.classList.contains('btn-view')) {
          showPage('event-detail-page');
          EventDetailView.render(eventId);
          EventDetailView.afterRender(eventId);
        } else if (e.target.classList.contains('btn-edit')) {
          AdminPanelView.showEditForm(eventId);
        } else if (e.target.classList.contains('btn-toggle')) {
          AdminPanelView.toggleEventVisibility(eventId);
        } else if (e.target.classList.contains('btn-cancel')) {
          AdminPanelView.cancelEvent(eventId);
        }
      });

    } catch (error) {
      eventsTableContainer.innerHTML = `<p style="color: red;">Fejl ved hentning af events: ${error.message}</p>`;
    }
  },

  // === API FUNKTIONER ===
  // Henter alle events fra serveren
  fetchEvents: async () => {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) throw new Error("Kunne ikke hente events");
    return await response.json();
  },

  // Henter et enkelt event fra serveren
  fetchEvent: async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    if (!response.ok) throw new Error("Kunne ikke hente event");
    return await response.json();
  },

  // Opdaterer specifikke felter på et event
  updateEventField: async (eventId, updates) => {
    try {
      const eventData = await AdminPanelView.fetchEvent(eventId);
      const updatedEvent = { ...eventData, ...updates };
      
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent)
      });

      if (!response.ok) throw new Error("Kunne ikke opdatere event");
      
      AdminPanelView.navigateToDashboard();
    } catch (error) {
      alert(`Fejl: ${error.message}`);
    }
  },

  // === EVENT HANDLINGER ===
  // Aflyser et event (sætter status til CANCELLED)
  cancelEvent: async (eventId) => {
    // Vis bekræftelsesdialog før aflysning
    const isConfirmed = confirm("Er du sikker på, at du vil aflyse dette event? Denne handling kan ikke fortrydes.");
    
    if (isConfirmed) {
      await AdminPanelView.updateEventField(eventId, { status: "CANCELLED" });
    }
  },

  // Skifter synlighed for et event
  toggleEventVisibility: async (eventId) => {
    try {
      const event = await AdminPanelView.fetchEvent(eventId);
      const currentVisibility = event.isVisible !== undefined ? event.isVisible : true;
      await AdminPanelView.updateEventField(eventId, { isVisible: !currentVisibility });
    } catch (error) {
      alert(`Fejl: ${error.message}`);
    }
  },

  // === NAVIGATION ===
  // Navigerer tilbage til dashboard
  navigateToDashboard: () => {
    AdminPanelView.render();
    AdminPanelView.afterRender();
  }
};
