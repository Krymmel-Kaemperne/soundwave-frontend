const AboutView = {
    render: () => {
        const pageContainer = document.getElementById("about-soundwave-content");
        if(!pageContainer) {
            console.error("FEJL: #about-soundwave-content ikke fundet i DOM.");
            return;
        }
    pageContainer.innerHTML = `
            <div class="about-us-container">
                <div class="about-us-header">
                    <h2>Om Soundwave Arena</h2>
                    <p>Din ultimative destination for liveoplevelser</p>
                </div>

                <div class="about-us-section mission">
                    <h3>Vores Mission</h3>
                    <p>Hos Soundwave Arena stræber vi efter at skabe uforglemmelige øjeblikke gennem en bred vifte af livearrangementer. Fra hjertebankende koncerter og inspirerende foredrag til latterfyldte comedy-shows og medrivende sportsbegivenheder, er vores mål at tilbyde en platform, hvor fællesskaber opstår og minderne skabes. Vi er dedikerede til at levere en førsteklasses oplevelse for både artister, talere og vores gæster.</p>
                </div>

                <div class="about-us-section">
                    <h3 class="centered-heading">Vores Sale</h3>
                </div>

                <div class="halls-info">
                    <div class="hall-card">
                        <img src="/images/koncert_arena_ai.webp" alt="Koncert Arena" class="hall-image">
                        <div class="hall-details">
                            <h4>Koncert Arena</h4>
                            <p>Vores store Koncert Arena er hjertet af Soundwave, designet til at give op til 1130 gæster en enestående liveoplevelse. Med avanceret lydteknologi, imponerende lysshows og fleksible opsætninger er arenaen det perfekte sted for internationale superbands, spektakulære musicals og store begivenheder, der kræver en storslået ramme. Her garanterer vi, at hver en tone og hvert et øjeblik rammer dig med fuld kraft.</p>
                            <p><strong>Kapacitet:</strong> Op til 1130 personer</p>
                        </div>
                    </div>
                    <div class="hall-card">
                        <img src="/images/konference_sal_ai.webp" alt="Konference Sal" class="hall-image">
                        <div class="hall-details">
                            <h4>Konference Sal</h4>
                            <p>Konference Salen tilbyder en mere intim og alsidig ramme, ideel til foredrag, comedy-shows, mindre koncerter og firmaarrangementer. Med en kapacitet på op til 1500 gæster og state-of-the-art præsentationsudstyr sikrer vi, at hvert budskab bliver leveret klart og tydeligt, og at enhver optræden får den opmærksomhed, den fortjener. Perfekt til arrangementer, der søger en tættere forbindelse mellem performer og publikum.</p>
                            <p><strong>Kapacitet:</strong> Op til 1500 personer</p>
                        </div>
                    </div>
                </div>

                <div class="about-us-section values">
                    <h3>Vores Værdier</h3>
                    <ul>
                        <li><strong>Passion:</strong> Vi brænder for liveoplevelser.</li>
                        <li><strong>Kvalitet:</strong> Vi leverer kun det bedste inden for lyd, lys og service.</li>
                        <li><strong>Fællesskab:</strong> Vi skaber rum for møder og mindeværdige øjeblikke.</li>
                        <li><strong>Innovation:</strong> Vi søger konstant nye måder at forbedre oplevelsen på.</li>
                    </ul>
                </div>
            </div>
        `;
    },

    afterRender: () => {
    }
};