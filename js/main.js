document.addEventListener('DOMContentLoaded', () => {

    // --- DASHBOARD LOGIC ---
    const dashBtns = document.querySelectorAll('.dash-btn');
    const dashContents = document.querySelectorAll('.dash-content');

    function switchTab(targetId) {
        // Desactiva todos
        dashBtns.forEach(b => b.classList.remove('active'));
        dashContents.forEach(c => {
            c.classList.remove('active');
            setTimeout(() => {
                if (!c.classList.contains('active')) {
                    c.style.display = 'none';
                }
            }, 500); // match CSS transition
        });

        // Activa el correcto
        const targetBtn = document.querySelector(`.dash-btn[data-target="${targetId}"]`);
        const targetContent = document.getElementById(targetId);

        if (targetBtn && targetContent) {
            targetBtn.classList.add('active');
            targetContent.style.display = 'block';
            // Pequeño retardo para dar tiempo a display:block antes de subir opacidad
            setTimeout(() => {
                targetContent.classList.add('active');
            }, 50);
        }
    }

    dashBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-target'));
        });
    });

    // Menú o links externos apuntando a un tab
    const dashLinks = document.querySelectorAll('.dash-link');
    dashLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // El navegador hará scroll hacia #dashboard-soluciones automáticamente, solo cambiamos tab
            const targetTab = link.getAttribute('data-tab');
            if (targetTab) {
                switchTab(targetTab);
            }
        });
    });
    // -----------------------

    // 1. Configuración del Intersection Observer para un scroll dinámico
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Al menos el 15% del elemento en pantalla
    };

    const observer = new IntersectionObserver((entries, observer) => {
        let cardDelay = 0; // Utilizado para la cascada de las service-cards

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // A. Si es una tarjeta de servicio, aplicar retraso escalonado (cascada)
                if (entry.target.classList.contains('service-card')) {
                    setTimeout(() => {
                        entry.target.classList.add('show');

                        // Retiramos clase hidden post-animación y prevenimos conflictos con las transiciones "hover"
                        setTimeout(() => entry.target.classList.remove('hidden'), 600);
                    }, cardDelay * 200);
                    cardDelay++;
                }
                // B. Otros elementos (ej. H1 o subtítulo del hero), mostrar de inmediato
                else {
                    entry.target.classList.add('show');
                    setTimeout(() => entry.target.classList.remove('hidden'), 600);
                }

                // Evitar re-animar si el usuario saca el scroll y vuelve arriba
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 2. Localizamos y empezamos a observar los elementos ocultos
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    // 3. Animación Canvas de Red Eléctrica (Hero)
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const mouse = { x: null, y: null, radius: 100 };

        function resizeParams() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        }

        window.addEventListener('resize', resizeParams);
        resizeParams();

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 2 + 1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
                ctx.fill();
            }

            update() {
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;

                this.x += this.vx;
                this.y += this.vy;

                // Repulsión ratón interactiva
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= forceDirectionX * force * 3;
                        this.y -= forceDirectionY * force * 3;
                    }
                }

                this.draw();
            }
        }

        function initParticles() {
            particles = [];
            let particleCount = (width * height) / 12000; // Densidad "Nivel 7"
            if (particleCount > 110) particleCount = 110;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateCanvas() {
            requestAnimationFrame(animateCanvas);
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 140) { // Mayor radio para formas
                        ctx.beginPath();
                        // Opacidad sutilmente aumentada (Nivel 7)
                        const opacity = (1 - distance / 140) * 0.55;
                        ctx.strokeStyle = `rgba(150, 150, 150, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        initParticles();
        animateCanvas();
    }
});
