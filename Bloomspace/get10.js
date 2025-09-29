// ===== GET RM10 SIGNUP PAGE JAVASCRIPT =====

// 🎯 Interactive Multi-Step Signup Class
class InteractiveSignup {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4; // welcome, basic, account, preferences, success
        this.steps = ['step-welcome', 'step-basic', 'step-account', 'step-preferences', 'step-success'];
        this.formData = {};
    }

    // 🎯 Step Navigation
    startSignup() {
        this.goToStep(1);
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
                this.celebrateProgress();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1);
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

    // 🎯 Data Management
    saveCurrentStepData() {
        const currentStepEl = document.getElementById(this.steps[this.currentStep]);
        const form = currentStepEl?.querySelector('form');
        
        if (!form) return;

        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
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
}

// Global instance
window.signupInstance = new InteractiveSignup();

// 🎯 Global Functions for HTML onclick
function startSignup() {
    window.signupInstance.startSignup();
}

function nextStep() {
    window.signupInstance.nextStep();
}

function prevStep() {
    window.signupInstance.prevStep();
}

async function completeSignup() {
    // Get form data
    const formData = window.signupInstance.formData;
    
    // Update button to show processing
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
    
    try {
        // Call the real registration API
        const response = await fetch('api/auth/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.email, // Use email as username
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Registration successful
            console.log('✅ User registration successful:', data);
            
            // Mark user as registered
            localStorage.setItem('bloomspaceUserRegistered', 'true');
            localStorage.setItem('bloomspaceUserEmail', formData.email || '');
            localStorage.setItem('bloomspaceUserData', JSON.stringify(formData));
            
            // Also set login status for profile page compatibility
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', formData.email || '');
            localStorage.setItem('authToken', 'demo_token_' + Date.now());
            localStorage.setItem('firstName', formData.firstName || '');
            localStorage.setItem('lastName', formData.lastName || '');
            localStorage.setItem('phone', formData.phone || '');
            localStorage.setItem('dateOfBirth', formData.dateOfBirth || '');
            localStorage.setItem('gender', formData.gender || '');
            
            console.log('✅ User registration completed, voucher will be available in cart');
            
            // Go to success step
            window.signupInstance.goToStep(4);
            triggerConfetti();
        } else {
            // Registration failed
            console.error('❌ Registration failed:', data.message);
            alert('Registration failed: ' + (data.message || 'Unknown error'));
            
            // Reset button
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `
                    <span class="btn-content">
                        <span class="btn-text">Complete Registration</span>
                        <i class="btn-icon fas fa-arrow-right"></i>
                    </span>
                    <div class="btn-shine"></div>
                `;
            }
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        alert('Registration failed: ' + error.message);
        
        // Reset button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <span class="btn-content">
                    <span class="btn-text">Complete Registration</span>
                    <i class="btn-icon fas fa-arrow-right"></i>
                </span>
                <div class="btn-shine"></div>
            `;
        }
    }
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
                copyBtn.style.background = '#10b981';
            }, 1500);
        });
    }
}

function triggerConfetti() {
    // Create confetti particles
    for (let i = 0; i < 50; i++) {
        createConfettiParticle();
    }
}

function createConfettiParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${getRandomColor()};
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

function getRandomColor() {
    const colors = ['#10b981', '#059669', '#34d399', '#3b82f6', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add celebration animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrateEntry {
        0% { transform: scale(0.9) rotate(-1deg); }
        50% { transform: scale(1.05) rotate(1deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
`;
document.head.appendChild(style);

// Particle System
function initializeParticleSystem() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = `rgba(255, 255, 255, ${this.opacity})`;
            this.life = Math.random() * 200 + 100;
            this.maxLife = this.life;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            
            // Fade out as particle ages
            this.opacity = (this.life / this.maxLife) * 0.5;
            this.color = `rgba(255, 255, 255, ${this.opacity})`;
            
            // Boundary check
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life <= 0) {
                this.reset();
            }
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.life = Math.random() * 200 + 100;
            this.maxLife = this.life;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Create particles
    function createParticles() {
        const particleCount = Math.min(100, Math.floor(canvas.width * canvas.height / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Connect nearby particles
        connectParticles();
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Connect particles with lines
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
    
    createParticles();
    animate();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
}



// Form Progress System
function initializeFormProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const formInputs = document.querySelectorAll('#signupForm input[required]');
    
    let currentStep = 1;
    const totalSteps = 3;
    
    function updateProgress() {
        const filledInputs = Array.from(formInputs).filter(input => input.value.trim() !== '');
        const progressPercentage = (filledInputs.length / formInputs.length) * 100;
        
        // Determine current step
        if (progressPercentage < 33) {
            currentStep = 1;
        } else if (progressPercentage < 66) {
            currentStep = 2;
        } else {
            currentStep = 3;
        }
        
        progressFill.style.width = Math.max(33, progressPercentage) + '%';
        progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
        
        // Add completion effect
        if (progressPercentage === 100) {
            progressFill.style.background = 'linear-gradient(90deg, #10b981, #059669, #10b981)';
            progressText.textContent = 'Ready to Submit! 🎉';
            progressText.style.color = '#10b981';
        }
    }
    
    formInputs.forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateY(-2px)';
            input.parentElement.style.boxShadow = '0 8px 25px rgba(74, 124, 89, 0.15)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateY(0)';
            input.parentElement.style.boxShadow = 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all signup page functionality
    initializeParticleSystem();
    initializeFormValidation();
    initializePasswordToggle();
    initializePasswordStrength();
    initializeFormSubmission();
    initializeAdvancedAnimations();
    initializeFormProgress();

});

// Form validation
function initializeFormValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Email validation
    emailInput.addEventListener('input', function() {
        validateEmail(this.value);
    });
    
    emailInput.addEventListener('blur', function() {
        validateEmail(this.value);
    });
    
    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    confirmPasswordInput.addEventListener('blur', function() {
        validatePasswordMatch();
    });
    
    // Real-time validation feedback
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validation = document.getElementById('emailValidation');
        
        if (!email) {
            validation.textContent = '';
            validation.className = 'validation-message';
            return false;
        }
        
        if (emailRegex.test(email)) {
            validation.textContent = '✓ Valid email address';
            validation.className = 'validation-message success';
            return true;
        } else {
            validation.textContent = '✗ Please enter a valid email address';
            validation.className = 'validation-message error';
            return false;
        }
    }
    
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const validation = document.getElementById('confirmPasswordValidation');
        
        if (!confirmPassword) {
            validation.textContent = '';
            validation.className = 'validation-message';
            return false;
        }
        
        if (password === confirmPassword) {
            validation.textContent = '✓ Passwords match';
            validation.className = 'validation-message success';
            return true;
        } else {
            validation.textContent = '✗ Passwords do not match';
            validation.className = 'validation-message error';
            return false;
        }
    }
}

// Password toggle functionality
function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    const button = input.parentNode.querySelector('.toggle-password');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function initializePasswordToggle() {
    // Password toggle buttons are handled by onclick in HTML
    // This function can be expanded for additional toggle features
}

// Password strength indicator
function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updateStrengthIndicator(strength);
    });
    
    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        // Return strength level
        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    }
    
    function updateStrengthIndicator(strength) {
        strengthIndicator.className = `password-strength ${strength}`;
    }
}

// Form submission
function initializeFormSubmission() {
    const form = document.getElementById('signupForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        if (validateForm()) {
            // Show success animation
            showSuccessMessage();
            
            // Here you would typically send the data to your server
            // For demo purposes, we'll just show a success message
            setTimeout(() => {
                // Redirect to homepage or dashboard
                // window.location.href = 'index.html';
            }, 2000);
        }
    });
    
    function validateForm() {
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
        let isValid = true;
        
        // Check all required fields
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '#10b981';
            }
        });
        
        // Check email format
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('email').style.borderColor = '#ef4444';
            isValid = false;
        }
        
        // Check password match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').style.borderColor = '#ef4444';
            isValid = false;
        }
        
        // Check terms agreement
        const terms = document.getElementById('terms');
        if (!terms.checked) {
            terms.parentNode.style.color = '#ef4444';
            isValid = false;
        }
        
        return isValid;
    }
    
    function showSuccessMessage() {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(74, 124, 89, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                animation: slideIn 0.5s ease;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: white;
                    font-size: 32px;
                ">
                    <i class="fas fa-check"></i>
                </div>
                <h3 style="color: #2d5a27; margin-bottom: 16px; font-size: 1.5rem;">Welcome to Bloomspace!</h3>
                <p style="color: #666; margin-bottom: 20px;">Your account has been created successfully.</p>
                <div style="
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    padding: 16px;
                    border-radius: 12px;
                    font-weight: 600;
                    color: #2d5a27;
                    font-size: 1.1rem;
                ">
                    🎉 RM10 Discount Applied!
                </div>
                <p style="color: #999; margin-top: 16px; font-size: 0.9rem;">Redirecting you to start shopping...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add animations via CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Advanced Animations System
function initializeAdvancedAnimations() {
    // Enhanced Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animation || 'slideInUp';
                const delay = element.dataset.delay || '0';
                
                setTimeout(() => {
                    element.classList.add('animate-in');
                    element.style.animation = `${animationType} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
                }, parseInt(delay));
            }
        });
    }, observerOptions);
    
    // Set up elements for animation
    document.querySelectorAll('.benefit-card, .testimonial, .benefit-item, .hero-text, .signup-form-container').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.dataset.delay = index * 100; // Stagger animations
        observer.observe(el);
    });
    
    // Advanced animation keyframes
    const advancedAnimations = `
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px) rotate(-5deg);
            }
            to {
                opacity: 1;
                transform: translateX(0) rotate(0deg);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px) rotate(5deg);
            }
            to {
                opacity: 1;
                transform: translateX(0) rotate(0deg);
            }
        }
        
        @keyframes zoomIn {
            from {
                opacity: 0;
                transform: scale(0.5) rotate(180deg);
            }
            to {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
        }
        
        @keyframes flipIn {
            from {
                opacity: 0;
                transform: perspective(400px) rotateY(90deg);
            }
            to {
                opacity: 1;
                transform: perspective(400px) rotateY(0deg);
            }
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        /* Typing Effect */
        .typing-effect {
            overflow: hidden;
            border-right: 3px solid #4a7c59;
            white-space: nowrap;
            animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
        }
        
        @keyframes typing {
            from { width: 0 }
            to { width: 100% }
        }
        
        @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: #4a7c59 }
        }
        
        /* Floating Animation */
        .float-animation {
            animation: gentle-float 6s ease-in-out infinite;
        }
        
        @keyframes gentle-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        /* Pulse Glow */
        .pulse-glow {
            animation: pulse-glow-effect 2s ease-in-out infinite alternate;
        }
        
        @keyframes pulse-glow-effect {
            from {
                box-shadow: 0 0 20px rgba(74, 124, 89, 0.3);
            }
            to {
                box-shadow: 0 0 40px rgba(74, 124, 89, 0.6);
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = advancedAnimations;
    document.head.appendChild(style);
    
    // Apply special animations to specific elements
    setTimeout(() => {
        const heroText = document.querySelector('.hero-text h1');
        if (heroText) {
            heroText.classList.add('typing-effect');
        }
        
        const formContainer = document.querySelector('.signup-form-container');
        if (formContainer) {
            formContainer.classList.add('float-animation');
        }
        
        const offerBadge = document.querySelector('.offer-badge');
        if (offerBadge) {
            offerBadge.classList.add('pulse-glow');
        }
    }, 1000);
    
    // Interactive hover effects for benefit cards
    document.querySelectorAll('.benefit-card').forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) rotateX(10deg) rotateY(5deg)';
            card.style.boxShadow = '0 25px 50px rgba(74, 124, 89, 0.2)';
            
            // Add sparkle effect
            createSparkles(card);
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
            card.style.boxShadow = '';
        });
    });
}

// Sparkle Effect
function createSparkles(element) {
    const sparkleCount = 8;
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: sparkle-animation 1s ease-out forwards;
        `;
        
        sparkle.style.left = rect.left + Math.random() * rect.width + 'px';
        sparkle.style.top = rect.top + Math.random() * rect.height + 'px';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }
    
    // Add sparkle animation if not already added
    if (!document.querySelector('#sparkle-style')) {
        const style = document.createElement('style');
        style.id = 'sparkle-style';
        style.textContent = `
            @keyframes sparkle-animation {
                0% {
                    opacity: 1;
                    transform: scale(0) rotate(0deg);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.5) rotate(180deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add focus effects to form groups
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input');
        if (input) {
            input.addEventListener('focus', () => {
                group.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                group.classList.remove('focused');
                if (input.value) {
                    group.classList.add('has-value');
                } else {
                    group.classList.remove('has-value');
                }
            });
        }
    });
    
    // Add floating label effect
    const style = document.createElement('style');
    style.textContent = `
        .form-group.focused label,
        .form-group.has-value label {
            transform: translateY(-8px);
            font-size: 0.875rem;
            color: #4a7c59;
        }
        
        .form-group label {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// 🎯 Global Functions
function goToLogin() {
    // Redirect to login page (you can customize this URL)
    window.location.href = 'login.html';
}
