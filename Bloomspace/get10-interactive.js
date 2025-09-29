// 🎯 Interactive Multi-Step Signup JavaScript

class InteractiveSignup {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4; // welcome, basic, account, preferences, success
        this.steps = ['step-welcome', 'step-basic', 'step-account', 'step-preferences', 'step-success'];
        this.formData = {};
        this.init();
    }

    init() {
        this.initializeParticleSystem();
        this.initializeFormValidation();
        this.initializePasswordToggles();
        this.initializeAdvancedAnimations();
        this.setupKeyboardNavigation();
    }

    // 🎯 Step Navigation
    startSignup() {
        this.goToStep(1);
        this.playTransitionSound();
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
                this.playTransitionSound();
                this.celebrateProgress();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1);
            this.playTransitionSound();
        }
    }

    goToStep(stepIndex) {
        const currentStepEl = document.getElementById(this.steps[this.currentStep]);
        const nextStepEl = document.getElementById(this.steps[stepIndex]);

        if (!nextStepEl) return;

        // Add transition classes
        currentStepEl.classList.add('prev');
        currentStepEl.classList.remove('active');

        setTimeout(() => {
            nextStepEl.classList.add('active');
            currentStepEl.classList.remove('prev');
            this.currentStep = stepIndex;
            this.updateProgress();
            this.updateStepIndicators();
            this.focusFirstInput();
        }, 300);
    }

    // 🎯 Progress & Indicators
    updateProgress() {
        const progressBars = document.querySelectorAll('.progress-fill');
        const progressTexts = document.querySelectorAll('.progress-text');
        
        let percentage = 0;
        let text = '';

        switch (this.currentStep) {
            case 1:
                percentage = 33;
                text = 'Progress: 33%';
                break;
            case 2:
                percentage = 66;
                text = 'Progress: 66%';
                break;
            case 3:
                percentage = 100;
                text = 'Almost Done!';
                break;
            case 4:
                percentage = 100;
                text = 'Completed!';
                break;
        }

        progressBars.forEach(bar => {
            bar.style.width = percentage + '%';
        });

        progressTexts.forEach(text_el => {
            text_el.textContent = text;
        });
    }

    updateStepIndicators() {
        const dots = document.querySelectorAll('.dot');
        
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            
            if (index < this.currentStep - 1) {
                dot.classList.add('completed');
            } else if (index === this.currentStep - 1) {
                dot.classList.add('active');
            }
        });
    }

    // 🎯 Form Validation
    validateCurrentStep() {
        const currentStepEl = document.getElementById(this.steps[this.currentStep]);
        const form = currentStepEl?.querySelector('form');
        
        if (!form) return true;

        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        // Special validation for password confirmation
        if (this.currentStep === 2) {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                this.showValidationMessage(confirmPassword, 'Passwords do not match', false);
                isValid = false;
            }
        }

        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let message = '';

        // Required field check
        if (input.hasAttribute('required') && !value) {
            message = 'This field is required';
            isValid = false;
        }
        // Full Name validation (no numbers or special characters except spaces)
        else if (input.id === 'firstName' || input.id === 'lastName') {
            if (value) {
                const nameRegex = /^[a-zA-Z\s]+$/;
                if (!nameRegex.test(value)) {
                    message = 'Name can only contain letters and spaces';
                    isValid = false;
                }
            }
        }
        // Email validation (xxx@xxx.xx format)
        else if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                message = 'Please enter a valid email address (xxx@xxx.xx format)';
                isValid = false;
            } else {
                // Check for database uniqueness (simulated)
                this.checkEmailUniqueness(value).then(isUnique => {
                    if (!isUnique) {
                        this.showValidationMessage(input, 'This email is already registered', false);
                    }
                });
            }
        }
        // Username validation (3-15 characters, letters, numbers, underscores only)
        else if (input.id === 'username' && value) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
            if (!usernameRegex.test(value)) {
                message = 'Username must be 3-15 characters, letters, numbers, and underscores only';
                isValid = false;
                this.hideUsernameAvailability();
            } else {
                // Show checking indicator
                this.showUsernameChecking();
                // Check for database uniqueness (simulated)
                this.checkUsernameUniqueness(value).then(isUnique => {
                    if (!isUnique) {
                        this.showValidationMessage(input, 'This username is already taken', false);
                        this.showUsernameTaken();
                    } else {
                        this.showUsernameAvailable();
                    }
                });
            }
        }
        // Password validation (8+ chars, uppercase, lowercase, number, special char)
        else if (input.id === 'password' && value) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(value)) {
                message = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
                isValid = false;
            }
            this.updatePasswordStrength(input);
        }
        // Confirm Password validation
        else if (input.id === 'confirmPassword' && value) {
            const password = document.getElementById('password');
            if (password && password.value !== value) {
                message = 'Passwords do not match';
                isValid = false;
            }
        }
        // Phone validation (if provided)
        else if (input.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                message = 'Please enter a valid phone number';
                isValid = false;
            }
        }

        this.showValidationMessage(input, message, isValid);
        return isValid;
    }

    showValidationMessage(input, message, isValid) {
        const messageEl = input.parentNode.querySelector('.validation-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `validation-message ${isValid ? 'success' : ''} ${message ? 'show' : ''}`;
        }

        // Add visual feedback to input
        input.classList.remove('valid', 'invalid');
        if (message) {
            input.classList.add(isValid ? 'valid' : 'invalid');
        }
    }

    // 🎯 Password Strength
    updatePasswordStrength(passwordInput) {
        const password = passwordInput.value;
        const strengthEl = passwordInput.parentNode.querySelector('.password-strength');
        
        if (!strengthEl) return;

        let strength = 0;
        let strengthClass = '';

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        if (strength <= 2) {
            strengthClass = 'weak';
        } else if (strength <= 4) {
            strengthClass = 'medium';
        } else {
            strengthClass = 'strong';
        }

        strengthEl.className = `password-strength ${strengthClass}`;
    }

    // 🎯 Database Uniqueness Checks (Simulated)
    async checkEmailUniqueness(email) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate some existing emails
        const existingEmails = ['test@example.com', 'admin@bloomspace.com', 'user@test.com'];
        return !existingEmails.includes(email.toLowerCase());
    }

    async checkUsernameUniqueness(username) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate some existing usernames
        const existingUsernames = ['admin', 'testuser', 'bloomspace', 'plantlover'];
        return !existingUsernames.includes(username.toLowerCase());
    }

    // Username availability UI helpers
    showUsernameChecking() {
        const availabilityEl = document.getElementById('username-availability');
        if (availabilityEl) {
            availabilityEl.className = 'username-availability username-checking';
            availabilityEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Checking availability...</span>';
        }
    }

    showUsernameAvailable() {
        const availabilityEl = document.getElementById('username-availability');
        if (availabilityEl) {
            availabilityEl.className = 'username-availability username-available';
            availabilityEl.innerHTML = '<i class="fas fa-check-circle"></i><span>Username available!</span>';
        }
    }

    showUsernameTaken() {
        const availabilityEl = document.getElementById('username-availability');
        if (availabilityEl) {
            availabilityEl.className = 'username-availability username-taken';
            availabilityEl.innerHTML = '<i class="fas fa-times-circle"></i><span>Username taken</span>';
        }
    }

    hideUsernameAvailability() {
        const availabilityEl = document.getElementById('username-availability');
        if (availabilityEl) {
            availabilityEl.className = 'username-availability username-availability-hidden';
        }
    }

    // 🎯 Data Management
    saveCurrentStepData() {
        const currentStepEl = document.getElementById(this.steps[this.currentStep]);
        const form = currentStepEl?.querySelector('form');
        
        if (!form) return;

        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }

        // Save checkboxes separately
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            if (cb.name === 'interests') {
                if (!this.formData.interests) this.formData.interests = [];
                this.formData.interests.push(cb.value);
            } else {
                this.formData[cb.name] = true;
            }
        });
    }

    // 🎯 Complete Registration
    completeSignup() {
        if (!this.validateCurrentStep()) return;

        this.saveCurrentStepData();
        
        // Simulate API call
        this.showLoadingState();
        
        setTimeout(() => {
            this.goToStep(4); // Success step
            this.generateVoucherCode();
            this.triggerConfetti();
            this.hideLoadingState();
        }, 2000);
    }

    generateVoucherCode() {
        const codes = ['WELCOME10', 'BLOOM10', 'GREEN10', 'PLANT10'];
        const randomCode = codes[Math.floor(Math.random() * codes.length)];
        
        const codeEl = document.querySelector('.voucher-code');
        if (codeEl) {
            codeEl.textContent = randomCode;
        }
    }

    // 🎯 Interactive Effects
    celebrateProgress() {
        const currentStepEl = document.getElementById(this.steps[this.currentStep]);
        currentStepEl.style.animation = 'celebrateEntry 0.6s ease-out';
        
        setTimeout(() => {
            currentStepEl.style.animation = '';
        }, 600);
    }

    triggerConfetti() {
        // Create confetti particles
        for (let i = 0; i < 50; i++) {
            this.createConfettiParticle();
        }
    }

    createConfettiParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${this.getRandomColor()};
            top: -10px;
            left: ${Math.random() * window.innerWidth}px;
            z-index: 10000;
            pointer-events: none;
            border-radius: 50%;
        `;
        
        document.body.appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`, opacity: 0 }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => particle.remove();
    }

    getRandomColor() {
        const colors = ['#ff6b35', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    playTransitionSound() {
        // Create subtle transition sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // 🎯 Utility Functions
    focusFirstInput() {
        setTimeout(() => {
            const currentStepEl = document.getElementById(this.steps[this.currentStep]);
            const firstInput = currentStepEl?.querySelector('input:not([type="hidden"]):not([type="checkbox"])');
            if (firstInput) {
                firstInput.focus();
            }
        }, 400);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
                if (this.currentStep < this.totalSteps - 1) {
                    this.nextStep();
                }
            }
        });
    }

    showLoadingState() {
        const btn = document.querySelector('.complete-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `
                <span class="btn-content">
                    <span class="btn-text">Processing...</span>
                    <i class="btn-icon fas fa-spinner fa-spin"></i>
                </span>
                <div class="btn-shine"></div>
            `;
        }
    }

    hideLoadingState() {
        const btn = document.querySelector('.complete-btn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <span class="btn-content">
                    <span class="btn-text">Complete Registration</span>
                    <i class="btn-icon fas fa-check"></i>
                </span>
                <div class="btn-shine"></div>
            `;
        }
    }

    // 🎯 Real-time Form Validation
    initializeFormValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.validateInput(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.validateInput(e.target);
            }
        }, true);
    }

    // 🎯 Password Toggle Functionality
    initializePasswordToggles() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-password')) {
                const btn = e.target.closest('.toggle-password');
                const input = btn.parentNode.querySelector('input');
                const icon = btn.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            }
        });
    }

    // 🎯 Particle System
    initializeParticleSystem() {
        const canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const particles = [];
        const particleCount = 50;

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
                this.fadeDelay = Math.random() * 600;
                this.fadeStart = Date.now() + this.fadeDelay;
                this.fadingIn = true;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.opacity = 0;
                this.hue = Math.random() * 60 + 20; // Orange to yellow range
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Fade in effect
                if (this.fadingIn) {
                    const now = Date.now();
                    if (now > this.fadeStart) {
                        this.opacity = Math.min(this.opacity + 0.005, 0.6);
                        if (this.opacity >= 0.6) {
                            this.fadingIn = false;
                        }
                    }
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
                ctx.fill();
                ctx.restore();
            }
        }

        const createParticles = () => {
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            this.connectParticles();
            animationId = requestAnimationFrame(animate);
        };

        this.connectParticles = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.save();
                        ctx.globalAlpha = (100 - distance) / 100 * 0.2;
                        ctx.strokeStyle = '#ff6b35';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        };

        resizeCanvas();
        createParticles();
        animate();

        window.addEventListener('resize', resizeCanvas);
    }

    // 🎯 Advanced Scroll Animations
    initializeAdvancedAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        document.querySelectorAll('.preview-step, .trust-item, .checkbox-item').forEach(el => {
            observer.observe(el);
        });

        // Typing effect for hero title
        this.typeWriter();
    }

    typeWriter() {
        const titleEl = document.querySelector('.hero-text h1');
        if (!titleEl) return;

        const text = titleEl.innerHTML;
        titleEl.innerHTML = '';
        titleEl.style.borderRight = '2px solid #ff6b35';

        let i = 0;
        const speed = 50;

        const typeInterval = setInterval(() => {
            if (i < text.length) {
                titleEl.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                titleEl.style.borderRight = 'none';
            }
        }, speed);
    }
}

// 🎯 Utility Functions (Global)
function startSignup() {
    window.signupInstance.startSignup();
}

function nextStep() {
    window.signupInstance.nextStep();
}

function prevStep() {
    window.signupInstance.prevStep();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const btn = input.parentNode.querySelector('.toggle-password');
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function completeSignup() {
    window.signupInstance.completeSignup();
}

function copyVoucher() {
    const voucherCode = document.querySelector('.voucher-code');
    if (voucherCode) {
        navigator.clipboard.writeText(voucherCode.textContent).then(() => {
            const copyBtn = document.querySelector('.copy-btn');
            const originalHTML = copyBtn.innerHTML;
            
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.background = '#ff6b35';
            }, 1500);
        });
    }
}

function goToLogin() {
    // Redirect to login page (you can customize this URL)
    window.location.href = 'login.html';
}

// 🎯 Additional CSS Animations (injected via JS)
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrateEntry {
        0% { transform: scale(0.9) rotate(-1deg); }
        50% { transform: scale(1.05) rotate(1deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
    
    @keyframes slideInUp {
        0% {
            opacity: 0;
            transform: translateY(30px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 🎯 Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.signupInstance = new InteractiveSignup();
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add loading animation for the page
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

