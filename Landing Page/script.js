// Advanced Particle System
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.setup();
    }

    setup() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    createParticles() {
        this.particles = [];
        const particleCount = window.innerWidth / 8;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: `rgba(165, 138, 199, ${Math.random() * 0.3})`,
                opacity: Math.random(),
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.opacity += p.pulseSpeed;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Pulsing opacity
            if (p.opacity > 1 || p.opacity < 0) {
                p.pulseSpeed = -p.pulseSpeed;
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(165, 138, 199, ${p.opacity * 0.3})`;
            this.ctx.fill();
        });
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }
}

// Scroll Reveal Animations
function revealOnScroll() {
    const sections = document.querySelectorAll('.section');
    const options = {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '0px 0px -100px 0px' // Slightly offset to create a staggered effect
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Particle System
    const particleCanvas = document.getElementById('particle-canvas');
    new ParticleSystem(particleCanvas);

    // Scroll Reveal
    revealOnScroll();

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Contact Form Submission
    document.getElementById('contact-form').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset(); // Reset the form after submission
    });

    // Back to Top Button
    setupBackToTopButton();
});

// Back to Top Button
function setupBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > window.innerHeight * 0.5) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // // Scroll to top when clicked
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
}

//slider
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const slider = document.querySelector('.team-slider');
let currentIndex = 0;
const teamMembers = document.querySelectorAll('.team-member');
const totalMembers = teamMembers.length;
let autoSlideInterval;

// Function to show the current slide
function showSlide(index) {
    const newTransformValue = -(index * 100) + '%';
    slider.style.transform = `translateX(${newTransformValue})`;
}

// Function to go to the next slide
function nextSlide() {
    currentIndex = (currentIndex === totalMembers - 1) ? 0 : currentIndex + 1;
    showSlide(currentIndex);
}

// Function to go to the previous slide
function prevSlide() {
    currentIndex = (currentIndex === 0) ? totalMembers - 1 : currentIndex - 1;
    showSlide(currentIndex);
}

// Event listeners for arrows
prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();
});

nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();
});

// Function to start automatic sliding
function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
}

// Function to reset the automatic sliding timer
function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Start the automatic sliding when the page loads
startAutoSlide();