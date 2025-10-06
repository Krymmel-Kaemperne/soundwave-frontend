// scripts/adminPanel.js

const AdminPanelView = {
  // Standard admin panel med events tabel som dashboard
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
        <p>Velkommen.</p>
        <div id="events-table-container">
          <p>Henter events...</p>
        </div>
      </div>
    `;

    // Load events table immediately
    AdminPanelView.loadEventsTable();
  },

  // Binder knapper
  afterRender: () => {
    // Tilbage
    const backButton = document.getElementById("admin-back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        showPage("event-overview-page");
        EventOverviewView.render();
        EventOverviewView.afterRender();
      });
    }

    // Opret event
    const createEventBtn = document.getElementById("create-event-btn");
    if (createEventBtn) {
      createEventBtn.addEventListener("click", () => {
        AdminPanelView.showCreateForm();
      });
    }
  },

  // Viser create form (hele panelet erstattes)
  showCreateForm: () => {
    const pageContainer = document.getElementById("admin-panel-page");
    pageContainer.innerHTML = `
      <div class="admin-panel">
        <div class="admin-header">
          <h2>Opret Event</h2>
          <div class="admin-actions">
            <button type="button" id="cancel-create-event" class="action-button">Tilbage</button>
          </div>
        </div>
        <div id="form-errors" class="error-box"></div>

        <form id="create-event-form" class="event-form">
          <div class="form-group">
            <label for="event-title">Titel</label>
            <input type="text" id="event-title" required>
          </div>

          <div class="form-group">
            <label for="event-status">Status</label>
            <select id="event-status" required>
              <option value="">-- Vælg status --</option>
              <option value="PLANNED">Planlagt</option>
              <option value="Scheduled">Aktiv</option>
              <option value="CANCELLED">Aflyst</option>
            </select>
          </div>

          <div class="form-group">
            <label for="event-description">Beskrivelse</label>
            <textarea id="event-description" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label for="event-date">Dato og tid</label>
            <input type="datetime-local" id="event-date" required>
          </div>

          <div class="form-group">
            <label for="event-price">Basispris (DKK)</label>
            <input type="number" id="event-price" min="0" step="0.01" required>
          </div>

          <div class="form-group">
            <label for="event-hall">Sal</label>
            <select id="event-hall" required>
              <option value="">-- Vælg Sal --</option>
              <option value="1">Arena</option>
              <option value="2">Konference</option>
            </select>
          </div>

          <div class="form-group">
            <label for="event-image">Billede</label>
            <input type="file" id="event-image" accept="image/*">
            <small>Upload et billede til eventet (valgfrit)</small>
          </div>

          <div class="form-actions">
            <button type="submit" class="action-button">Gem Event</button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById("create-event-form");
    const errorBox = document.getElementById("form-errors");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("event-title").value.trim();
      const description = document.getElementById("event-description").value.trim();
      const status = document.getElementById("event-status").value;
      const eventDate = document.getElementById("event-date").value;
      const basePrice = document.getElementById("event-price").value;
      const hallId = document.getElementById("event-hall").value;
      const fileInput = document.getElementById("event-image");

      let errors = [];
      if (!title) errors.push("Titel skal udfyldes.");
      if (!description) errors.push("Beskrivelse skal udfyldes.");
      if (!status) errors.push("Status skal vælges.");
      if (!eventDate) errors.push("Dato og tid skal vælges.");
      if (!basePrice || parseFloat(basePrice) <= 0) errors.push("Basispris skal være større end 0.");
      if (!hallId) errors.push("Sal skal vælges.");

      if (errors.length > 0) {
        errorBox.innerHTML = errors.join("<br>");
        return;
      }
      errorBox.innerHTML = "";

      // Hvis der er billede → upload først
      if (fileInput.files.length > 0) {
        console.log("DEBUG: Starting image upload...");
        console.log("DEBUG: File details:", {
          name: fileInput.files[0].name,
          size: fileInput.files[0].size,
          type: fileInput.files[0].type
        });
        
        // Check file size (limit to 10MB to match backend configuration)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (fileInput.files[0].size > maxSize) {
          alert("Filen er for stor. Vælg venligst et billede under 10MB.");
          return;
        }
        
        const fData = new FormData();
        fData.append("file", fileInput.files[0]);
        
        console.log("DEBUG: FormData created, sending request...");

        fetch("http://localhost:8080/upload/image", { // backend upload endpoint
          method: "POST",
          mode: 'cors', // Explicitly set CORS mode
          body: fData
        })
          .then(res => {
            console.log("DEBUG: Upload response received:", {
              status: res.status,
              statusText: res.statusText,
              ok: res.ok,
              headers: Object.fromEntries(res.headers.entries())
            });
            
            if (!res.ok) {
              console.error("DEBUG: Response not OK:", res.status, res.statusText);
              if (res.status === 413) {
                throw new Error("Filen er for stor. Vælg venligst et billede under 10MB.");
              } else if (res.status === 0) {
                throw new Error("CORS fejl: Backend er ikke konfigureret til at tillade anmodninger fra denne oprindelse.");
              } else {
                throw new Error(`Billed-upload fejlede med status: ${res.status} ${res.statusText}`);
              }
            }
            return res.text();
          })
          .then(fileName => {
            console.log("DEBUG: Upload successful, filename:", fileName);
            sendEvent(fileName);
          })
          .catch(err => {
            console.error("DEBUG: Upload error:", err);
            
            // Provide more user-friendly error messages
            if (err.message.includes("CORS")) {
              alert("CORS fejl: Kunne ikke uploade billede due til browser sikkerhedsindstillinger. Prøv at bruge en mindre fil eller kontakt systemadministratoren.");
            } else if (err.message.includes("fetch")) {
              alert("Netværksfejl: Kunne ikke oprette forbindelse til serveren. Tjek at backend kører på http://localhost:8080");
            } else {
              alert("Fejl: kunne ikke uploade billede. " + err.message);
            }
          });
      } else {
        console.log("DEBUG: No file selected, proceeding without image");
        sendEvent(null);
      }

      function sendEvent(imageUrl) {
        const newEvent = {
          title,
          description,
          status,
          eventDate,
          basePrice: parseFloat(basePrice),
          hall: { hallId: parseInt(hallId) },
          imageUrl // her gemmer vi filnavnet fra backend
        };

        fetch("http://localhost:8080/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent)
        })
          .then(res => {
            if (!res.ok) throw new Error("Kunne ikke oprette event");
            return res.json();
          })
          .then(savedEvent => {
            alert("Event oprettet: " + savedEvent.title);
            AdminPanelView.render();
            AdminPanelView.afterRender();
          })
          .catch(err => {
            console.error(err);
            alert("Fejl: kunne ikke gemme event.");
          });
      }
    });

    // Cancel → tilbage til knapper
    const cancelBtn = document.getElementById("cancel-create-event");
    cancelBtn.addEventListener("click", () => {
      AdminPanelView.render();
      AdminPanelView.afterRender();
    });
  },

  // Indlæser events tabel til dashboard
  loadEventsTable: async () => {
    const eventsTableContainer = document.getElementById("events-table-container");
    
    try {
      const response = await fetch("http://localhost:8080/events");
      if (!response.ok) throw new Error("Kunne ikke hente events");
      
      const events = await response.json();
      
      if (events.length === 0) {
        eventsTableContainer.innerHTML = "<p>Ingen events fundet.</p>";
        return;
      }

      let tableHtml = `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">ID</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Titel</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Dato</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Hal</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Pris</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Handlinger</th>
              </tr>
            </thead>
            <tbody>
      `;

      events.forEach(event => {
        const eventDate = new Date(event.eventDate).toLocaleDateString('da-DK');
        const statusColor = event.status === 'Sold Out' ? 'color: red;' :
                           event.status === 'Scheduled' ? 'color: green;' :
                           'color: orange;';
        
        tableHtml += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${event.eventId}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${event.title}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${eventDate}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; ${statusColor}">${event.status}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${event.hall ? event.hall.name : 'Ukendt'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${event.basePrice ? event.basePrice + ' DKK' : 'Ukendt'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">
              <button class="action-button view-event-btn" data-event-id="${event.eventId}" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">Vis</button>
              <button class="action-button edit-event-btn" data-event-id="${event.eventId}" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">Rediger</button>
              <button class="action-button cancel-event-btn" data-event-id="${event.eventId}" data-event-title="${event.title}" style="padding: 5px 10px; font-size: 12px; background-color: #f44336;">Aflys</button>
            </td>
          </tr>
        `;
      });

      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
      
      eventsTableContainer.innerHTML = tableHtml;

      // Tilføj event listeners til knapperne
      document.querySelectorAll('.view-event-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.target.dataset.eventId;
          showPage('event-detail-page');
          EventDetailView.render(eventId);
          EventDetailView.afterRender(eventId);
        });
      });

      document.querySelectorAll('.edit-event-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.target.dataset.eventId;
          AdminPanelView.showEditForm(eventId);
        });
      });

      document.querySelectorAll('.cancel-event-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.target.dataset.eventId;
          const eventTitle = e.target.dataset.eventTitle;
          
          if (confirm(`Er du sikker på, at du vil aflyse "${eventTitle}"? Dette vil ændre status til "CANCELLED".`)) {
            AdminPanelView.cancelEvent(eventId, eventTitle);
          }
        });
      });

    } catch (error) {
      eventsTableContainer.innerHTML =
        `<p style="color: red;">Fejl ved hentning af events: ${error.message}</p>`;
    }
  },

  // Viser form til at redigere et event
  showEditForm: async (eventId) => {
    const pageContainer = document.getElementById("admin-panel-page");
    
    pageContainer.innerHTML = `
      <div class="admin-panel">
        <h2>Rediger Event</h2>
        <div id="form-errors" class="error-box"></div>
        <p>Henter event data...</p>
        <div class="form-actions">
          <button type="button" id="cancel-edit-event" class="action-button">Annuller</button>
        </div>
      </div>
    `;

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!response.ok) throw new Error("Kunne ikke hente event");
      
      const event = await response.json();
      
      pageContainer.innerHTML = `
        <div class="admin-panel">
          <div class="admin-header">
            <h2>Rediger Event</h2>
            <div class="admin-actions">
              <button type="button" id="cancel-edit-event" class="action-button">Tilbage</button>
            </div>
          </div>
          <div id="form-errors" class="error-box"></div>

          <form id="edit-event-form" class="event-form">
            <div class="form-group">
              <label for="edit-title">Titel</label>
              <input type="text" id="edit-title" value="${event.title}" required>
            </div>

            <div class="form-group">
              <label for="edit-status">Status</label>
              <select id="edit-status" required>
                <option value="PLANNED" ${event.status === 'PLANNED' ? 'selected' : ''}>Planlagt</option>
                <option value="Scheduled" ${event.status === 'Scheduled' ? 'selected' : ''}>Aktiv</option>
                <option value="Sold Out" ${event.status === 'Sold Out' ? 'selected' : ''}>Udsolgt</option>
                <option value="CANCELLED" ${event.status === 'CANCELLED' ? 'selected' : ''}>Aflyst</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-description">Beskrivelse</label>
              <textarea id="edit-description" rows="4" required>${event.description}</textarea>
            </div>

            <div class="form-group">
              <label for="edit-event-date">Event dato</label>
              <input type="datetime-local" id="edit-event-date" value="${event.eventDate.slice(0, 16)}" required>
            </div>

            <div class="form-group">
              <label for="edit-base-price">Basispris (DKK)</label>
              <input type="number" id="edit-base-price" value="${event.basePrice}" min="0" step="0.01" required>
            </div>

            <div class="form-group">
              <label for="edit-hall">Sal</label>
              <select id="edit-hall" required>
                <option value="1" ${event.hall && event.hall.hallId === 1 ? 'selected' : ''}>Arena</option>
                <option value="2" ${event.hall && event.hall.hallId === 2 ? 'selected' : ''}>Konference</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-image">Billede</label>
              <input type="file" id="edit-image" accept="image/*">
              <small>Upload et nyt billede for at erstatte det eksisterende (valgfrit)</small>
              ${event.imageUrl ? `<div style="margin-top: 10px;"><small>Nuværende billede: ${event.imageUrl}</small></div>` : ''}
            </div>

            <div class="form-actions">
              <button type="submit" class="action-button">Gem Ændringer</button>
            </div>
          </form>
        </div>
      `;

      // Form submit handler
      const editForm = document.getElementById("edit-event-form");
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        AdminPanelView.updateEvent(eventId);
      });

    } catch (error) {
      document.getElementById("form-errors").innerHTML = `Fejl: ${error.message}`;
    }

    // Cancel knap
    const cancelBtn = document.getElementById("cancel-edit-event");
    cancelBtn.addEventListener("click", () => {
      AdminPanelView.render();
      AdminPanelView.afterRender();
    });
  },

  // Opdaterer et event
  updateEvent: async (eventId) => {
    const errorBox = document.getElementById("form-errors");
    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-description").value;
    const status = document.getElementById("edit-status").value;
    const eventDate = document.getElementById("edit-event-date").value;
    const basePrice = document.getElementById("edit-base-price").value;
    const hallId = document.getElementById("edit-hall").value;
    const fileInput = document.getElementById("edit-image");

    // Først hent den nuværende event data for at bevare imageUrl og hall
    const getResponse = await fetch(`http://localhost:8080/events/${eventId}`);
    if (!getResponse.ok) {
      throw new Error("Kunne ikke hente event data");
    }
    
    const eventData = await getResponse.json();

    // Håndter billede upload hvis der er valgt et nyt billede
    if (fileInput.files.length > 0) {
      console.log("DEBUG: Starting image upload for edit...");
      
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileInput.files[0].size > maxSize) {
        alert("Filen er for stor. Vælg venligst et billede under 10MB.");
        return;
      }
      
      const fData = new FormData();
      fData.append("file", fileInput.files[0]);

      try {
        const uploadResponse = await fetch("http://localhost:8080/upload/image", {
          method: "POST",
          mode: 'cors',
          body: fData
        });

        if (!uploadResponse.ok) {
          throw new Error("Billed-upload fejlede");
        }

        const fileName = await uploadResponse.text();
        console.log("DEBUG: Upload successful, filename:", fileName);
        
        // Opdater event med nyt billede
        await updateEventWithImage(fileName);
      } catch (err) {
        console.error("DEBUG: Upload error:", err);
        alert("Fejl: kunne ikke uploade billede. " + err.message);
      }
    } else {
      // Opdater event uden nyt billede
      await updateEventWithImage(eventData.imageUrl);
    }

    async function updateEventWithImage(imageUrl) {
      try {
        const response = await fetch(`http://localhost:8080/events/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            status,
            eventDate,
            basePrice: parseFloat(basePrice),
            hall: { hallId: parseInt(hallId) },
            imageUrl // Bevar det eksisterende eller nye billede
          })
        });

        if (!response.ok) {
          throw new Error("Kunne ikke opdatere event");
        }

        alert("Event opdateret succesfuldt!");
        AdminPanelView.render();
        AdminPanelView.afterRender();
        
      } catch (error) {
        errorBox.innerHTML = `Fejl: ${error.message}`;
      }
    }
  },

  // Aflyser et event (ændrer status til CANCELLED)
  cancelEvent: async (eventId, eventTitle) => {
    console.log(`DEBUG: Forsøger at aflyse event ${eventId} (${eventTitle})`);
    
    try {
      // Først hent den nuværende event data
      const getResponse = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!getResponse.ok) {
        throw new Error("Kunne ikke hente event data");
      }
      
      const eventData = await getResponse.json();
      console.log(`DEBUG: Hentet event data:`, eventData);
      
      // Opdater kun status feltet, bevar alle andre data
      const updatedEvent = {
        ...eventData,
        status: "CANCELLED"
      };
      
      console.log(`DEBUG: Sender opdateret event:`, updatedEvent);
      
      const response = await fetch(`http://localhost:8080/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent)
      });

      console.log(`DEBUG: Cancel response status: ${response.status} ${response.statusText}`);
      console.log(`DEBUG: Cancel response ok: ${response.ok}`);

      if (!response.ok) {
        // Get more detailed error information
        let errorMessage = `Kunne ikke aflyse event`;
        
        if (response.status === 404) {
          errorMessage = `Event "${eventTitle}" blev ikke fundet.`;
        } else if (response.status === 403) {
          errorMessage = `Du har ikke tilladelse til at aflyse dette event.`;
        } else {
          errorMessage += ` (status: ${response.status})`;
          try {
            const errorText = await response.text();
            console.log(`DEBUG: Error response body: ${errorText}`);
            if (errorText) errorMessage += `: ${errorText}`;
          } catch (e) {
            console.log(`DEBUG: Kunne ikke læse error body: ${e.message}`);
          }
        }
        
        throw new Error(errorMessage);
      }

      console.log(`DEBUG: Event ${eventId} aflyst succesfuldt`);
      alert(`Event "${eventTitle}" aflyst succesfuldt!`);
      AdminPanelView.render();
      AdminPanelView.afterRender();
      
    } catch (error) {
      console.error(`DEBUG: Fejl ved aflysning af event:`, error);
      alert(`Fejl ved aflysning af event: ${error.message}`);
    }
  }
};