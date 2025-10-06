// scripts/adminPanel.js

const AdminPanelView = {
  // Standard admin panel med knapper
  render: () => {
    const pageContainer = document.getElementById("admin-panel-page");
    if (!pageContainer) {
      console.error("Fejl: admin-panel-page ikke fundet i DOM");
      return;
    }

    pageContainer.innerHTML = `
      <div class="admin-panel">
        <h2>Admin Panel</h2>
        <p>Her kan Sebastian administrere events.</p>

        <div class="admin-actions">
          <button id="create-event-btn" class="action-button">Opret Event</button>
          <button id="view-all-events-btn" class="action-button">Se Alle Events</button>
          <button id="admin-back-button" class="action-button">Tilbage til oversigt</button>
        </div>
      </div>
    `;
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

    // Se alle events
    const viewAllEventsBtn = document.getElementById("view-all-events-btn");
    if (viewAllEventsBtn) {
      viewAllEventsBtn.addEventListener("click", () => {
        // Skifter til oversigt
        showPage("event-overview-page");
        EventOverviewView.render();
        EventOverviewView.afterRender();
      });
    }
  },

  // Viser create form (hele panelet erstattes)
  showCreateForm: () => {
    const pageContainer = document.getElementById("admin-panel-page");
    pageContainer.innerHTML = `
      <div class="admin-panel">
        <h2>Opret Event</h2>
        <div id="form-errors" class="error-box"></div>

        <form id="create-event-form" class="event-form">
          <label for="event-title">Titel</label>
          <input type="text" id="event-title" required>

          <label for="event-description">Beskrivelse</label>
          <textarea id="event-description" rows="3" required></textarea>

          <label for="event-status">Status</label>
          <select id="event-status" required>
            <option value="">-- Vælg status --</option>
            <option value="PLANNED">Planlagt</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="CANCELLED">Aflyst</option>
          </select>

          <label for="event-date">Dato og tid</label>
          <input type="datetime-local" id="event-date" required>

          <label for="event-price">Basispris (DKK)</label>
          <input type="number" id="event-price" min="0" step="0.01" required>

          <label for="event-hall">Sal</label>
          <select id="event-hall" required>
            <option value="">-- Vælg Sal --</option>
            <option value="1">Arena</option>
            <option value="2">Konference</option>
          </select>

          <label for="event-image">Billede</label>
          <input type="file" id="event-image" accept="image/*">

          <div class="form-actions">
            <button type="submit" class="action-button">Gem Event</button>
            <button type="button" id="cancel-create-event" class="action-button">Annuller</button>
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

};