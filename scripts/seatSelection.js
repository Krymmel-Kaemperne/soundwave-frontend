// scripts/seatSelection.js

const SeatSelectionView = {
    selectedSeats: {}, // Gem valgte sæder her: { id: { row, seatNum, price, type, areaId, count?, areaName? } }
    totalPrice: 0,
    mockData: {}, // Til at gemme mock-data, når den er hentet

    render: async (eventId) => {
        const pageContainer = document.getElementById("seat-selection-page");
        if (!pageContainer) {
            console.error("Fejl: #seat-selection-page div'en blev ikke fundet.");
            return;
        }

        pageContainer.innerHTML = `<p style="text-align: center;">Indlæser sædevalg for event ${eventId}...</p>`;
        SeatSelectionView.selectedSeats = {}; // Nulstil valgte sæder ved hver render
        SeatSelectionView.totalPrice = 0;


        try {
            const response = await fetch('/data/mock-seats.json'); // Henter mock-data
            if (!response.ok) {
                throw new Error(`HTTP fejl! Status: ${response.status}`);
            }
            SeatSelectionView.mockData = await response.json(); // Gem data globalt i view'et

            let fullPageHtml = `
                <div class="seat-selection-wrapper"> <!-- Ny wrapper for bedre flex-layout -->
                    <div class="seat-selection-header">
                        <button id="seat-selection-back-button" class="action-button">&larr; Tilbage til oversigt</button>
                        <h2 style="text-align: center;">Vælg Sæder til ${SeatSelectionView.mockData.eventName}</h2>
                    </div>

                    <div class="seat-map-and-summary-container">
                        <!-- Hovedområdet for sædeplanen -->
                        <div id="seat-map-container" class="seat-map-main-area">
                            <p style="margin-bottom: 30px; font-size: 1.1rem; color: #555;">Vælg dine pladser i ${SeatSelectionView.mockData.hallName}.</p>
            `;

            // Byg sædeplanen inden i #seat-map-container
            SeatSelectionView.mockData.areas.forEach(area => {
                fullPageHtml += `
                    <div class="area-container" data-area-id="${area.areaId}">
                        <h3 class="area-name">${area.areaName}</h3>
                `;

                if (area.type === 'seating') {
                    // ** Tegn et visuelt sæde-grid **
                    const rows = {};
                    area.seats.forEach(seat => {
                        if (!rows[seat.rowNumber]) rows[seat.rowNumber] = [];
                        rows[seat.rowNumber].push(seat);
                    });

                    for (const rowNum in rows) {
                        fullPageHtml += `<div class="seat-row"><span>Række ${rowNum}:</span>`;
                        rows[rowNum].sort((a, b) => a.seatNumber - b.seatNumber).forEach(seat => {
                            const seatClass = seat.status === 'booked' ? 'seat booked' : 'seat available';
                            fullPageHtml += `<div class="${seatClass}" data-seat-id="${seat.seatId}" data-row="${seat.rowNumber}" data-seat="${seat.seatNumber}" data-price="${seat.price}" title="Række ${seat.rowNumber}, Plads ${seat.seatNumber}: ${seat.price} DKK">
                                                ${seat.seatNumber}
                                            </div>`;
                        });
                        fullPageHtml += `</div>`;
                    }

                } else if (area.type === 'standing') {
                    const availableTickets = area.capacity - area.bookedCount;
                        const currentStandingCount = SeatSelectionView.selectedSeats[area.areaId]?.count || 0; // Hent nuværende valg

                        fullPageHtml += `
                            <div class="standing-area-box ${availableTickets <= 0 ? 'sold-out' : ''}" 
                                data-area-id="${area.areaId}" 
                                data-price="${area.price}" 
                                data-area-name="${area.areaName}"
                                data-type="standing">
                                <div class="standing-info">
                                    <h3>${area.areaName}</h3>
                                    <p>${availableTickets} ${availableTickets === 1 ? 'ståplads' : 'ståpladser'} tilbage</p>
                                    <p>Pris: ${area.price} DKK per billet</p>
                                </div>
                                ${availableTickets <= 0 ? '<p class="sold-out-text">Udsolgt!</p>' : ''}
                                <div class="standing-input-control">
                                    <label for="standing-tickets-${area.areaId}">Antal:</label>
                                    <input type="number" id="standing-tickets-${area.areaId}" name="standing-tickets" 
                                        min="0" max="${availableTickets}" value="${currentStandingCount}" 
                                        data-area-id="${area.areaId}" data-price="${area.price}" 
                                        data-area-name="${area.areaName}" ${availableTickets <= 0 ? 'disabled' : ''}>
                                    <button class="action-button update-standing-btn" 
                                            data-area-id="${area.areaId}" 
                                            ${availableTickets <= 0 ? 'disabled' : ''}>Opdater</button>
                                </div>
                            </div>
                        `;
                    }
                fullPageHtml += `</div>`; // Luk area-container
            });

            fullPageHtml += `
                        </div> <!-- Luk #seat-map-container -->

                        <!-- Området for ordre-opsummering -->
                        <div id="order-summary" class="order-summary-area">
                            <h3>Din bestilling</h3>
                            <ul id="selected-seats-list" style="list-style-type: none; padding: 0;">
                                <li>Ingen sæder valgt endnu.</li>
                            </ul>
                            <p style="font-size: 1.2rem; font-weight: bold; margin-top: 20px;">Total: <span id="total-price">0</span> DKK</p>
                            <button id="proceed-to-checkout-button" class="action-button" style="width: 100%; margin-top: 10px;">Gå til betaling</button>
                        </div>
                    </div> <!-- Luk seat-map-and-summary-container -->
                </div> <!-- Luk seat-selection-wrapper -->
            `;

            pageContainer.innerHTML = fullPageHtml; // Indsæt al HTML i DOM'en
            SeatSelectionView.afterRender(eventId); // Kald afterRender for at tilføje lyttere

        } catch (error) {
            console.error("Fejl i SeatSelectionView.render:", error);
            pageContainer.innerHTML = `<p style="color:red; text-align: center; padding: 20px;">Kunne ikke indlæse sædeplanen. Fejl: ${error.message}</p>`;
        }
    },

    updateOrderSummary: () => {
        // Hent elementer EFTER de er indsat i DOM'en af render()
        const orderList = document.getElementById("selected-seats-list");
        const totalPriceSpan = document.getElementById("total-price");
        const proceedButton = document.getElementById("proceed-to-checkout-button");

        // Tjek for null, i tilfælde af fejl i render() eller race condition
        if (!orderList || !totalPriceSpan || !proceedButton) {
            console.error("Fejl: Kunne ikke finde ordre-opsummeringselementer i DOM'en.");
            return;
        }

        orderList.innerHTML = ''; // Ryd listen
        SeatSelectionView.totalPrice = 0;
        let hasSelections = false;

        for (const key in SeatSelectionView.selectedSeats) {
            const item = SeatSelectionView.selectedSeats[key];
            if (item.type === 'seating') {
                const listItem = document.createElement('li');
                listItem.textContent = `Række ${item.row}, Plads ${item.seat} (${item.price} DKK)`;
                orderList.appendChild(listItem);
                SeatSelectionView.totalPrice += item.price;
                hasSelections = true;
            } else if (item.type === 'standing' && item.count > 0) {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.count} ståpladser i ${item.areaName} (${item.count * item.price} DKK)`;
                orderList.appendChild(listItem);
                SeatSelectionView.totalPrice += (item.count * item.price);
                hasSelections = true;
            }
        }

        if (!hasSelections) {
            orderList.innerHTML = '<li>Ingen sæder valgt endnu.</li>';
            proceedButton.disabled = true; // Deaktiver knappen, hvis intet er valgt
        } else {
            proceedButton.disabled = false;
        }

        totalPriceSpan.textContent = SeatSelectionView.totalPrice;
    },

    afterRender: (eventId) => {
        // --- Tilbage-knap ---
        const backButton = document.getElementById('seat-selection-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                showPage('event-detail-page');
                EventDetailView.render(eventId);
                EventDetailView.afterRender(eventId);
            });
        }

        // --- Håndtering af siddepladser ---
        document.querySelectorAll('.seat.available').forEach(seatElement => {
            seatElement.addEventListener('click', () => {
                const seatId = seatElement.dataset.seatId;
                const row = seatElement.dataset.row;
                const seatNum = seatElement.dataset.seat;
                const price = parseFloat(seatElement.dataset.price);

                if (SeatSelectionView.selectedSeats[seatId]) {
                    delete SeatSelectionView.selectedSeats[seatId];
                    seatElement.classList.remove('selected');
                } else {
                    SeatSelectionView.selectedSeats[seatId] = {
                        id: seatId,
                        row: row,
                        seat: seatNum,
                        price: price,
                        type: 'seating',
                        // Find areaName dynamisk fra det genererede HTML eller mockData
                        areaName: seatElement.closest('.area-container').querySelector('.area-name')?.textContent.replace(/\(Siddepladser\)/, '').trim() || 'Ukendt Siddepladsområde'
                    };
                    seatElement.classList.add('selected');
                }
                SeatSelectionView.updateOrderSummary();
            });
        });

        // --- Håndtering af ståpladser ---
        document.querySelectorAll('.standing-area-box:not(.sold-out)').forEach(standingAreaElement => {
            standingAreaElement.addEventListener('click', () => {
                const areaId = standingAreaElement.dataset.areaId;
                const price = parseFloat(standingAreaElement.dataset.price);
                const areaName = standingAreaElement.dataset.areaName;

                // Vi antager, at man vælger ÉN ståplads ad gangen ved klik,
                // da der ikke er et inputfelt til antal.
                // Hvis der skal være et inputfelt senere, skal denne logik tilpasses.
                const currentSelection = SeatSelectionView.selectedSeats[areaId];

                if (currentSelection && currentSelection.count > 0) {
                    // Hvis allerede valgt, fravælg
                    delete SeatSelectionView.selectedSeats[areaId];
                    standingAreaElement.classList.remove('selected');
                } else {
                    // Vælg (eller forøg antallet - her vælger vi bare 1 som default)
                    SeatSelectionView.selectedSeats[areaId] = {
                        id: areaId,
                        areaName: areaName,
                        price: price,
                        count: 1, // Vælg 1 billet som standard
                        type: 'standing'
                    };
                    standingAreaElement.classList.add('selected');
                }
                SeatSelectionView.updateOrderSummary();
            });
        });

        // --- Gå til betaling-knap ---
        const proceedButton = document.getElementById('proceed-to-checkout-button');
        if (proceedButton) {
            proceedButton.addEventListener('click', () => {
                if (SeatSelectionView.totalPrice > 0) {
                    showPage('checkout-page');
                    CheckoutView.render(eventId);
                    CheckoutView.afterRender(eventId);
                } else {
                    alert('Vælg venligst mindst én billet før du fortsætter.');
                }
            });
        }

        // Initial opdatering af opsummering
        SeatSelectionView.updateOrderSummary();
    }
};