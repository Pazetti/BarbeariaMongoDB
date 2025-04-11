// carousel.js

// Módulo para o Carrossel de Imagens
function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    let autoSlideInterval = null;
    const AUTO_SLIDE_DELAY = 3000; // 3 segundos entre cada slide

    // Função para exibir um slide específico
    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    }

    // Função para avançar para o próximo slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Função para iniciar o movimento automático
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, AUTO_SLIDE_DELAY);
    }

    // Função para pausar o movimento automático
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Pausar o carrossel ao passar o mouse por cima
    const carousel = document.querySelector('.carousel');
    carousel?.addEventListener('mouseenter', pauseAutoSlide);

    // Retomar o carrossel ao tirar o mouse
    carousel?.addEventListener('mouseleave', startAutoSlide);

    // Exibir o primeiro slide e iniciar o movimento automático
    showSlide(currentSlide);
    startAutoSlide();
}

// Módulo para o Carrossel de Depoimentos
function initializeTestimonialsCarousel() {
    const slides = document.querySelectorAll('.testimonials-slide');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    let autoSlideInterval = null;
    const AUTO_SLIDE_DELAY = 3000; // 3 segundos entre cada slide

    // Função para exibir um slide específico e atualizar os indicadores
    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        indicators.forEach((indicator, i) => indicator.classList.toggle('active', i === index));
    }

    // Função para avançar para o próximo slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Função para iniciar o movimento automático
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, AUTO_SLIDE_DELAY);
    }

    // Função para pausar o movimento automático
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Adicionar eventos de clique aos indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            pauseAutoSlide(); // Pausa o movimento automático ao clicar
            currentSlide = index;
            showSlide(currentSlide);
            startAutoSlide(); // Retoma o movimento automático
        });
    });

    // Pausar o carrossel ao passar o mouse por cima
    const carousel = document.querySelector('.testimonials-carousel');
    carousel?.addEventListener('mouseenter', pauseAutoSlide);

    // Retomar o carrossel ao tirar o mouse
    carousel?.addEventListener('mouseleave', startAutoSlide);

    // Exibir o primeiro slide e iniciar o movimento automático
    showSlide(currentSlide);
    startAutoSlide();
}

// Módulo para o Contador Animado
function initializeStatsCounter() {
    // Valores finais dos contadores
    const stats = {
        clients: 1200,    // Quantidade de clientes
        haircuts: 5000,   // Quantidade de cortes de cabelo
        beards: 3500,     // Quantidade de barbas
        combos: 2800      // Quantidade de combos (barba + cabelo)
    };

    // Elementos dos contadores
    const clientsCount = document.getElementById('clientsCount');
    const haircutsCount = document.getElementById('haircutsCount');
    const beardsCount = document.getElementById('beardsCount');
    const combosCount = document.getElementById('combosCount');

    // Função para animar um contador
    function animateCounter(element, targetValue, duration) {
        let startValue = 0;
        const increment = targetValue / (duration / 50); // Incremento por frame (50ms)
        let currentValue = startValue;

        const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(interval);
            }
            element.textContent = Math.floor(currentValue).toLocaleString('pt-BR'); // Formata com separadores de milhar
        }, 50);
    }

    // Iniciar a animação para cada contador (duração de 2 segundos)
    if (clientsCount) animateCounter(clientsCount, stats.clients, 2000);
    if (haircutsCount) animateCounter(haircutsCount, stats.haircuts, 2000);
    if (beardsCount) animateCounter(beardsCount, stats.beards, 2000);
    if (combosCount) animateCounter(combosCount, stats.combos, 2000);
}

// Inicializar os módulos
if (document.querySelector('.carousel')) initializeCarousel();
if (document.querySelector('.testimonials-carousel')) initializeTestimonialsCarousel();
if (document.querySelector('.stats-section')) initializeStatsCounter();