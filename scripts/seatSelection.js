// scripts/seatSelection.js

const SeatSelectionView = {
    selectedSeats: {}, // { id: { row, seatNum, price, type, areaId, count?, areaName? } }
    totalPrice: 0,
    mockData: {},
    currentStandingArea: null, // Holder styr på hvilken ståplads-område modalen viser

    render: async (eventId) => {
        const pageContainer = document.getElementById("seat-selection-page");
        if (!pageContainer) {
            console.error("Fejl: #seat-selection-page div'en blev ikke fundet.");
            return;
        }

        pageContainer.innerHTML = `<p style="text-align: center;">Indlæser sædevalg for event ${eventId}...</p>`;
        SeatSelectionView.selectedSeats = {}; // Nulstil valgte sæder ved rendering af ny side
        SeatSelectionView.totalPrice = 0;    // Nulstil total pris

        try {
            const response = await fetch(`http://localhost:8080/events/${eventId}/seats/map`);
            if (!response.ok) {
                throw new Error(`HTTP fejl! Status: ${response.status}`);
            }
            SeatSelectionView.mockData = await response.json();

            // Bestem om det er Conference Hall baseret på hallName
            const isConferenceHall = SeatSelectionView.mockData.hallName.includes("Club Stage");

            let fullPageHtml = `
                <div class="seat-selection-wrapper">
                    <div class="seat-selection-header">
                        <button id="seat-selection-back-button" class="action-button">&larr; Tilbage til oversigt</button>
                        <h2 style="text-align: center;">Vælg Sæder til ${SeatSelectionView.mockData.eventName}</h2>
                    </div>

                    <div class="seat-map-and-summary-container">
                        <div id="seat-map-container" class="seat-map-main-area">
                            <div class="arena-visual-layout ${isConferenceHall ? "conference-layout" : ""}"> 
                                <p style="margin-bottom: 30px; font-size: 1.1rem; color: #555; text-align: center;"></p>
                                
                                <div class="scene-box">${isConferenceHall ? "PODIUM" : "SCENE"}</div>
            `;

            // --- Logik til at vælge layout baseret på isConferenceHall ---
            if (isConferenceHall) {
                // --- A. CONFERENCE HALL LAYOUT (SIMPELT GRID) ---
                let conferenceHtml = `<div class="conference-seating-area">`;

                SeatSelectionView.mockData.areas.forEach((area) => {
                    if (area.type === "seating") {
                        const rows = {};
                        area.seats.forEach((seat) => {
                            if (!rows[seat.rowNumber]) rows[seat.rowNumber] = [];
                            rows[seat.rowNumber].push(seat);
                        });

                        conferenceHtml += `<div class="seating-area-grid">`;
                        for (const rowNum in rows) {
                            conferenceHtml += `<div class="seat-row-wrapper"><div class="seat-row-grid">`;
                            rows[rowNum]
                                .sort((a, b) => a.seatNumber - b.seatNumber)
                                .forEach((seat) => {
                                    const seatClass =
                                        seat.status === "booked" ? "seat booked" : "seat available";
                                    const isSelectedClass = SeatSelectionView.selectedSeats[seat.seatId]
                                        ? "selected"
                                        : "";
                                    conferenceHtml += `<div class="${seatClass} ${isSelectedClass}" data-seat-id="${seat.seatId}" data-row="${seat.rowNumber}" data-seat="${seat.seatNumber}" data-price="${area.price}" title="Række ${seat.rowNumber}, Plads ${seat.seatNumber}: ${area.price} DKK">
                                            ${seat.seatNumber}
                                        </div>`;
                                });
                            conferenceHtml += `</div></div>`;
                        }
                        conferenceHtml += `</div>`;
                    }
                });
                conferenceHtml += `</div>`;
                fullPageHtml += conferenceHtml;
            } else {
                // --- B. MAIN ARENA LAYOUT (EKSISTERENDE KOMPLEKST GRID) ---
                let standingAreaHtml = "";
                let vipLeftHtml = "";
                let vipRightHtml = "";
                let vipBackHtml = "";

                const sortedAreas = [...SeatSelectionView.mockData.areas].sort((a, b) => {
                    if (a.type === "standing") return -1;
                    if (b.type === "standing") return 1;
                    const order = {
                        "VIP Balkon - Venstre (Siddepladser)": 1,
                        "VIP Balkon - Bag (Siddepladser)": 2,
                        "VIP Balkon - Højre (Siddepladser)": 3,
                    };
                    return (order[a.areaName] || 0) - (order[b.areaName] || 0);
                });

                sortedAreas.forEach((area) => {
                    let areaContentHtml = `<div class="area-container" data-area-id="${area.areaId}">`;
                    if (area.type === "standing") {
                        const availableTickets = area.capacity - area.bookedCount;
                        const isStandingAreaBookedOut = availableTickets <= 0;
                        areaContentHtml += `<div class="standing-area-box ${
                            isStandingAreaBookedOut ? "sold-out" : ""
                        }" data-area-id="${area.areaId}" data-price="${
                            area.price
                        }" data-area-name="${area.areaName}" data-max-tickets="${availableTickets}" ${
                            isStandingAreaBookedOut ? "" : 'role="button" tabindex="0"'
                        }>
                            <div class="standing-info">
                                <h3>${area.areaName}</h3>
                                <p>${availableTickets} ${
                                    availableTickets === 1 ? "ståplads" : "ståpladser"
                                } tilbage</p>
                                <p>Pris: ${area.price} DKK per billet</p>
                            </div>
                            ${isStandingAreaBookedOut ? '<p class="sold-out-text">Udsolgt!</p>' : ""}
                        </div>`;
                        standingAreaHtml = areaContentHtml + `</div>`;
                    } else if (area.type === "seating") {
                        const rows = {};
                        area.seats.forEach((seat) => {
                            if (!rows[seat.rowNumber]) rows[seat.rowNumber] = [];
                            rows[seat.rowNumber].push(seat);
                        });
                        areaContentHtml += `<div class="seating-area-grid">`;
                        for (const rowNum in rows) {
                            areaContentHtml += `<div class="seat-row-wrapper"><div class="seat-row-grid">`;
                            rows[rowNum]
                                .sort((a, b) => a.seatNumber - b.seatNumber)
                                .forEach((seat) => {
                                    const seatClass =
                                        seat.status === "booked" ? "seat booked" : "seat available";
                                    const isSelectedClass = SeatSelectionView.selectedSeats[seat.seatId]
                                        ? "selected"
                                        : "";
                                    areaContentHtml += `<div class="${seatClass} ${isSelectedClass}" data-seat-id="${seat.seatId}" data-row="${seat.rowNumber}" data-seat="${seat.seatNumber}" data-price="${area.price}" title="Række ${seat.rowNumber}, Plads ${seat.seatNumber}: ${area.price} DKK">
                                            ${seat.seatNumber}
                                        </div>`;
                                });
                            areaContentHtml += `</div></div>`;
                        }
                        areaContentHtml += `</div>`;

                        if (area.areaName.includes("Venstre")) {
                            vipLeftHtml = areaContentHtml + `</div>`;
                        } else if (area.areaName.includes("Højre")) {
                            vipRightHtml = areaContentHtml + `</div>`;
                        } else if (area.areaName.includes("Bag")) {
                            vipBackHtml = areaContentHtml + `</div>`;
                        }
                    }
                });

                fullPageHtml += `
                    <div class="arena-grid-layout">
                        <div class="vip-side-left">${vipLeftHtml}</div>
                        <div class="standing-center">${standingAreaHtml}</div>
                        <div class="vip-side-right">${vipRightHtml}</div>
                        <div class="vip-back">${vipBackHtml}</div>
                    </div>`;
            }

            // --- FÆLLES DEL FOR BEGGE LAYOUTS ---
            fullPageHtml += `
                        </div> <!-- Luk .arena-visual-layout -->
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

            // Disse skal kaldes her og KUN her, når siden er klar
            SeatSelectionView.updateOrderSummary();
            SeatSelectionView.updateStandingAreaVisuals();

        } catch (error) {
            console.error("Fejl i SeatSelectionView.render:", error);
            pageContainer.innerHTML = `<p style="color:red; text-align: center; padding: 20px;">Kunne ikke indlæse sædeplanen. Fejl: ${error.message}</p>`;
        }
    },

    updateOrderSummary: () => {
        const orderList = document.getElementById("selected-seats-list");
        const totalPriceSpan = document.getElementById("total-price");
        const proceedButton = document.getElementById("proceed-to-checkout-button");

        if (!orderList || !totalPriceSpan || !proceedButton) {
            console.error("Fejl: Kunne ikke finde ordre-opsummeringselementer i DOM'en under updateOrderSummary.");
            return;
        }

        orderList.innerHTML = '';
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
            proceedButton.disabled = true;
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

        // --- Håndtering af siddepladser (Event Delegation) ---
        // Sætter ÉN listener på den overordnede container, der er garanteret at være i DOM'en
        const seatMapContainer = document.getElementById('seat-map-container');
        if (seatMapContainer) {
            seatMapContainer.addEventListener('click', (event) => {
                const seatElement = event.target.closest('.seat.available'); // Finder nærmeste .seat.available for det klikkede element
                if (!seatElement) {
                    return; // Hvis klikket ikke var på et tilgængeligt sæde, gør intet
                }

                const seatId = seatElement.dataset.seatId;
                const row = seatElement.dataset.row;
                const seatNum = seatElement.dataset.seat;
                const price = parseFloat(seatElement.dataset.price);

                const currentSeatingCount = Object.values(SeatSelectionView.selectedSeats).filter(
                    item => item.type === 'seating'
                ).length;

                if (SeatSelectionView.selectedSeats[seatId]) {
                    delete SeatSelectionView.selectedSeats[seatId];
                    seatElement.classList.remove('selected');
                } else {
                    if (currentSeatingCount >= 10) {
                        alert('Du kan maksimalt vælge 10 siddepladser ad gangen.');
                        return;
                    }
                    SeatSelectionView.selectedSeats[seatId] = {
                        id: seatId,
                        row: row,
                        seat: seatNum,
                        price: price,
                        type: 'seating',
                        areaName: (() => {
                            const areaContainer = seatElement.closest('.area-container');
                            if (areaContainer) {
                                const areaNameElement = areaContainer.querySelector('.area-name');
                                if (areaNameElement) {
                                    return areaNameElement.textContent.replace(/\(Siddepladser\)/, '').trim();
                                }
                            }
                            return 'Ukendt Siddepladsområde'; // Fallback hvis intet findes
                        })()
                    };
                    seatElement.classList.add('selected');
                }
                SeatSelectionView.updateOrderSummary();
            });
        }

        // --- Event Delegation for ståpladsområder ---
        if (seatMapContainer) {
            seatMapContainer.addEventListener('click', (event) => {
                const standingAreaElement = event.target.closest('.standing-area-box:not(.sold-out)');
                if (!standingAreaElement) {
                    return; // Hvis klikket ikke var på et tilgængeligt ståpladsområde
                }

                SeatSelectionView.currentStandingArea = {
                    areaId: standingAreaElement.dataset.areaId,
                    areaName: standingAreaElement.dataset.areaName,
                    price: parseFloat(standingAreaElement.dataset.price),
                    maxTickets: parseInt(standingAreaElement.dataset.maxTickets),
                    currentSelectedCount: SeatSelectionView.selectedSeats[standingAreaElement.dataset.areaId]?.count || 0
                };
                SeatSelectionView.openStandingModal();
            });
        }


        // --- Gå til betaling-knap ---
        const proceedButton = document.getElementById('proceed-to-checkout-button');
        if (proceedButton) {
            proceedButton.addEventListener('click', () => {
                if (Object.keys(SeatSelectionView.selectedSeats).length > 0) { // Tjekker om der er *nogen* valgte sæder
                    showPage('checkout-page');
                    CheckoutView.render(eventId);
                    CheckoutView.afterRender(eventId);
                } else {
                    alert('Vælg venligst mindst én billet før du fortsætter.');
                }
            });
        }
        // updateOrderSummary() og updateStandingAreaVisuals() kaldes nu fra render() metoden.
    },

    // --- NY METODE: opdater visuel status for ståpladsområder ---
    updateStandingAreaVisuals: () => {
        const activeArenaLayout = document.querySelector('.arena-visual-layout');
        if (!activeArenaLayout) return; // TILFØJET DENNE LINJE

        activeArenaLayout.querySelectorAll('.standing-area-box').forEach(standingAreaBox => {
            const areaId = standingAreaBox.dataset.areaId;
            const currentStandingCount = SeatSelectionView.selectedSeats[areaId]?.count || 0;

            if (currentStandingCount > 0) {
                standingAreaBox.classList.add('selected');
                let selectedTextElement = standingAreaBox.querySelector('.standing-selected-text');
                if (!selectedTextElement) {
                    selectedTextElement = document.createElement('p');
                    selectedTextElement.className = 'standing-selected-text';
                    standingAreaBox.querySelector('.standing-info').appendChild(selectedTextElement);
                }
                selectedTextElement.textContent = `${currentStandingCount} valgt`;
            } else {
                standingAreaBox.classList.remove('selected');
                const selectedTextElement = standingAreaBox.querySelector('.standing-selected-text');
                if (selectedTextElement) selectedTextElement.remove();
            }
        });
    },

    // --- NYE METODER TIL MODALEN ---
    openStandingModal: () => {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('standing-selection-modal');
        const area = SeatSelectionView.currentStandingArea;

        if (!modalOverlay || !modalContent || !area) {
            console.error("Modal elementer eller currentStandingArea mangler.");
            return;
        }

        let currentCount = SeatSelectionView.selectedSeats[area.areaId]?.count || 0;

        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Sektion:</h3>
                <h1>STÅPLADSER</h1>
                <p>Denne sektion indeholder unummererede pladser</p>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ticket-type-row">
                    <div class="ticket-indicator" style="background-color: #2196F3;"></div>
                    <div class="ticket-info">
                        <p class="ticket-name">Ståplads</p>
                        <p class="ticket-price">${area.price.toFixed(2)} kr. stk</p>
                    </div>
                    <div class="quantity-control">
                        <button class="quantity-btn minus-btn" data-area-id="${area.areaId}">-</button>
                        <span class="quantity-display">${currentCount}</span>
                        <button class="quantity-btn plus-btn" data-area-id="${area.areaId}">+</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="total-tickets-info">
                    <p><span class="selected-ticket-count">${currentCount}</span> Billet</p>
                    <p><span class="total-ticket-price">${(currentCount * area.price).toFixed(2)}</span> kr.</p>
                </div>
                <button id="add-standing-to-order-btn" class="action-button">Tilføj til ordre</button>
            </div>
        `;

        modalOverlay.classList.add('show'); // Vis modalen
        SeatSelectionView.attachModalListeners(area); // Tilføj listeners
    },

    closeStandingModal: () => {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
        }
        SeatSelectionView.currentStandingArea = null; // Ryd current area
    },

    attachModalListeners: (area) => {
        const closeBtn = document.querySelector('#standing-selection-modal .close-modal-btn');
        if (closeBtn) closeBtn.addEventListener('click', SeatSelectionView.closeStandingModal);

        const minusBtn = document.querySelector('#standing-selection-modal .minus-btn');
        const plusBtn = document.querySelector('#standing-selection-modal .plus-btn');
        const quantityDisplay = document.querySelector('#standing-selection-modal .quantity-display');
        const selectedTicketCount = document.querySelector('#standing-selection-modal .selected-ticket-count');
        const totalTicketPrice = document.querySelector('#standing-selection-modal .total-ticket-price');
        const addStandingToOrderBtn = document.getElementById('add-standing-to-order-btn');

        let currentModalCount = SeatSelectionView.selectedSeats[area.areaId]?.count || 0;
        const initialSelectedCount = SeatSelectionView.selectedSeats[area.areaId]?.count || 0; 


        const updateModalDisplay = () => {
            quantityDisplay.textContent = currentModalCount;
            selectedTicketCount.textContent = currentModalCount;
            totalTicketPrice.textContent = (currentModalCount * area.price).toFixed(2);

            if (plusBtn) plusBtn.disabled = currentModalCount >= Math.min(area.maxTickets, 10);
            if (minusBtn) minusBtn.disabled = currentModalCount <= 0;
            
            if (addStandingToOrderBtn) {
                if (currentModalCount > 0) {
                    addStandingToOrderBtn.disabled = false;
                    addStandingToOrderBtn.textContent = 'Tilføj til ordre';
                } else if (initialSelectedCount > 0 && currentModalCount === 0) {
                    addStandingToOrderBtn.disabled = false;
                    addStandingToOrderBtn.textContent = 'Fjern fra ordre';
                } else {
                    addStandingToOrderBtn.disabled = true;
                    addStandingToOrderBtn.textContent = 'Tilføj til ordre';
                }
            }
        };

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                if (currentModalCount < Math.min(area.maxTickets, 10)) {
                    currentModalCount++;
                    updateModalDisplay();
                }
            });
        }
        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                if (currentModalCount > 0) {
                    currentModalCount--;
                    updateModalDisplay();
                }
            });
        }

        if (addStandingToOrderBtn) {
            addStandingToOrderBtn.addEventListener('click', () => {
                if (currentModalCount > 0) {
                    SeatSelectionView.selectedSeats[area.areaId] = {
                        id: area.areaId,
                        areaName: area.areaName,
                        price: area.price,
                        count: currentModalCount,
                        type: 'standing'
                    };
                } else {
                    delete SeatSelectionView.selectedSeats[area.areaId];
                }
                SeatSelectionView.updateOrderSummary();
                SeatSelectionView.closeStandingModal();
            });
        }
        updateModalDisplay();
    }
};