// scripts/eventOverview.js

const EventOverviewView = {
    render: async () => {
        const heroSection = document.getElementById("hero-section");
        const contentContainer = document.getElementById("overview-content-container");

        if (!heroSection || !contentContainer) {
            console.error("Fejl: #hero-section eller #overview-content-container blev ikke fundet.");
            return;
        }

        contentContainer.innerHTML = `<p style="text-align: center;">Henter events...</p>`;

        try {
            const response = await fetch('http://localhost:8080/events');
            if (!response.ok) {
                throw new Error(`HTTP fejl! Status: ${response.status}`);
            }
            const events = await response.json();
            events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
            
            // 1. Vælg de første 3 events til slideren (eller færre, hvis der ikke er 3)
            const sliderEvents = events.slice(0, 4);

            let slidesHtml = '';
            if (sliderEvents.length > 0) {
                // 2. Byg HTML for hver "slide"
                sliderEvents.forEach(event => {
                    const slideImage = event.imageUrl ? (event.imageUrl.startsWith('/') ? event.imageUrl : '/images/' + event.imageUrl) : '/images/placeholder.png';
                    slidesHtml += `
                        <div class="slide" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${slideImage}')">
                            <div class="slide-content">
                                <h2>${event.title}</h2>
                                <p>${new Date(event.eventDate).toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>`;
                });

                // 3. Byg den komplette slider-struktur
                heroSection.innerHTML = `
                    <div class="slider-wrapper">${slidesHtml}</div>
                    <button class="slider-btn prev-btn">&lt;</button>
                    <button class="slider-btn next-btn">&gt;</button>
                    <h1 class="hero-title">SoundWave</h1>
                `;
            } else {
                // Fallback hvis der slet ingen events er
                heroSection.innerHTML = `
                    <div class="slide" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/placeholder.png')"></div>
                    <h1 class="hero-title">SoundWave</h1>
                `;
            }

            // Byg HTML for event-grid (uændret)
            let eventsGridHtml = '';
            if (events.length > 0) {
                events.forEach(event => {
                    // ... (din eksisterende forEach-løkke til event-kort er uændret) ...
                    const eventDateTime = new Date(event.eventDate);
                    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                    const timeOptions = { hour: '2-digit', minute: '2-digit' };
                    const formattedDate = eventDateTime.toLocaleDateString('da-DK', dateOptions);
                    const formattedTime = eventDateTime.toLocaleTimeString('da-DK', timeOptions);
                    const isSoldOut = event.status === 'Sold Out';
                    const soldOutClass = isSoldOut ? 'sold-out' : '';
                    const clickAction = isSoldOut ? '' : `data-event-id="${event.eventId}"`;
                    const cursorStyle = isSoldOut ? 'cursor: not-allowed;' : '';

                    eventsGridHtml += `
                        <div class="event-card ${soldOutClass}" ${clickAction} style="${cursorStyle}">
                            <img src="${event.imageUrl ? (event.imageUrl.startsWith('/') ? event.imageUrl : '/images/' + event.imageUrl) : '/images/placeholder.jpg'}" alt="${event.title}" class="event-card-image">
                            <div class="event-card-info">
                                <h3>${event.title}</h3>
                                <p><strong>Dato:</strong> ${formattedDate} kl. ${formattedTime}</p>
                                <p><strong>Hal:</strong> ${event.hall ? event.hall.name : 'Ukendt Hal'}</p>
                                <p><strong>Pris fra:</strong> ${event.basePrice ? event.basePrice + ' DKK' : 'Ukendt'}</p>
                                ${isSoldOut ? '<p class="sold-out-text">Udsolgt!</p>' : ''}
                            </div>
                        </div>`;
                });
            }

            contentContainer.innerHTML = `
                <div class="section-title-container">
                    <h2 class="section-title">Kommende Events</h2>
                </div>
                <div class="event-grid">
                    ${events.length > 0 ? eventsGridHtml : '<p style="text-align: center;">Ingen kommende events fundet.</p>'}
                </div>
            `;

            EventOverviewView.afterRender();

        } catch (error) {
            console.error("Fejl ved hentning af events:", error);
            
            // 1. Opdater hero-sektionen til at vise "website is down"-GIF'en
            heroSection.innerHTML = `
                <div class="slide" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/the-website-is-down.gif')">
                    <div class="slide-content">
                        <h2>Oh no!</h2>
                        <p>Noget gik galt</p>
                    </div>
                </div>
                <h1 class="hero-title">SoundWave</h1>
            `;

            // 2. Vis den velkendte fejlbesked i content-containeren nedenunder
            contentContainer.innerHTML = `
                <div class="section-title-container">
                    <h2 class="section-title">Kommende Events</h2>
                </div>
                <p style="text-align: center; color: red;">Kunne ikke hente events fra serveren. Prøv venligst igen senere.</p>
            `;
        }
    },

    afterRender: () => {
        // Håndter klik på event-kort 
        document.querySelectorAll('.event-card:not(.sold-out)').forEach(card => {
            card.addEventListener('click', (e) => {
                const eventId = card.dataset.eventId;
                if (eventId) {
                    showPage('event-detail-page');
                    EventDetailView.render(eventId);
                    EventDetailView.afterRender(eventId);
                }
            });
        });

        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const sliderWrapper = document.querySelector('.slider-wrapper');
        const slides = document.querySelectorAll('.slide');

        if (!prevBtn || !nextBtn || !sliderWrapper || slides.length === 0) {
            return;
        }

        let currentSlideIndex = 0;
        const totalSlides = slides.length;

        function showSlide(index) {
            sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
        }

        nextBtn.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
            showSlide(currentSlideIndex);
        });

        prevBtn.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentSlideIndex);
        });
    }
};