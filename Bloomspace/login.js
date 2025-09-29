// Login Page JavaScript

// Validation patterns
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,15}$/;

// DOM Elements (will be initialized after DOM loads)
let loginForm, emailUsernameInput, passwordInput, rememberMeCheckbox, loginBtn;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements after page loads
    loginForm = document.getElementById('loginForm');
    emailUsernameInput = document.getElementById('emailUsername');
    passwordInput = document.getElementById('password');
    rememberMeCheckbox = document.getElementById('rememberMe');
    loginBtn = document.querySelector('.login-btn');
    
    // Initialize form
    initializeLoginForm();
});

function initializeLoginForm() {
    console.log('🔧 Initializing login form...');
    console.log('📋 Form elements:', {
        loginForm: !!loginForm,
        emailUsernameInput: !!emailUsernameInput,
        passwordInput: !!passwordInput,
        rememberMeCheckbox: !!rememberMeCheckbox,
        loginBtn: !!loginBtn
    });
    
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    // Add event listeners
    emailUsernameInput.addEventListener('input', validateEmailUsername);
    emailUsernameInput.addEventListener('blur', validateEmailUsername);
    passwordInput.addEventListener('input', validatePassword);
    passwordInput.addEventListener('blur', validatePassword);
    loginForm.addEventListener('submit', handleLogin);
    
    // Disable autofill
    disableAutofill();
    
    // Check for saved credentials
    loadSavedCredentials();
    
    console.log('✅ Login form initialized successfully');
}
function updateLoginButtonState() {
    const isEmailUsernameValid = validateEmailUsername();
    const isPasswordValid = validatePassword();
    loginBtn.disabled = !(isEmailUsernameValid && isPasswordValid);
}

// Email/Username validation
function validateEmailUsername() {
    const value = emailUsernameInput.value.trim();
    const validationMessage = emailUsernameInput.parentNode.querySelector('.validation-message');
    
    if (!value) {
        showValidationMessage(emailUsernameInput, validationMessage, 'Email or Username is required', 'error');
        return false;
    }
    
    // Check if it's an email or username
    if (value.includes('@')) {
        // Email validation
        if (!emailPattern.test(value)) {
            showValidationMessage(emailUsernameInput, validationMessage, 'Please enter a valid email address', 'error');
            return false;
        }
    } else {
        // Username validation
        if (!usernamePattern.test(value)) {
            showValidationMessage(emailUsernameInput, validationMessage, 'Username must be 3-15 characters (letters, numbers, underscores only)', 'error');
            return false;
        }
    }
    
    showValidationMessage(emailUsernameInput, validationMessage, 'Looks good!', 'success');
    return true;
}

// Password validation
function validatePassword() {
    const value = passwordInput.value;
    const validationMessage = passwordInput.parentNode.querySelector('.validation-message');
    
    if (!value) {
        showValidationMessage(passwordInput, validationMessage, 'Password is required', 'error');
        return false;
    }
    
    if (value.length < 6) {
        showValidationMessage(passwordInput, validationMessage, 'Password must be at least 6 characters', 'error');
        return false;
    }
    
    if (value.length > 20) {
        showValidationMessage(passwordInput, validationMessage, 'Password must be no more than 20 characters', 'error');
        return false;
    }
    
    showValidationMessage(passwordInput, validationMessage, 'Looks good!', 'success');
    return true;
}

// Show validation message
function showValidationMessage(input, messageElement, message, type) {
    messageElement.textContent = message;
    messageElement.className = `validation-message ${type} show`;
    
    // Update input classes
    input.classList.remove('valid', 'invalid');
    if (type === 'success') {
        input.classList.add('valid');
    } else if (type === 'error') {
        input.classList.add('invalid');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    console.log('🚀 Login form submitted');
    
    // Validate all fields
    const isEmailUsernameValid = validateEmailUsername();
    const isPasswordValid = validatePassword();
    
    console.log('📝 Validation results:', {
        isEmailUsernameValid,
        isPasswordValid
    });
    
    if (!isEmailUsernameValid || !isPasswordValid) {
        console.log('❌ Validation failed, stopping login');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Call the real login API
        const loginData = {
            email: emailUsernameInput.value.trim(),
            password: passwordInput.value,
            remember_me: rememberMeCheckbox.checked
        };
        
        const response = await fetch('api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Login successful
            console.log('✅ Login successful:', data);
            
            // Save credentials if "Remember Me" is checked
            if (rememberMeCheckbox.checked) {
                saveCredentials(loginData.email);
            }
            
            // Set login status in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', data.data.email);
            localStorage.setItem('authToken', data.data.session_token);
            localStorage.setItem('firstName', data.data.first_name);
            localStorage.setItem('lastName', data.data.last_name);
            
            // Show success message
            showSuccessMessage('Login successful! Redirecting to homepage...');
            
            // Redirect to home page after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2500);
        } else {
            // Login failed
            console.error('❌ Login failed:', data.message);
            showErrorMessage(data.message || 'Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('An error occurred. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Simulate login validation
async function validateLogin(loginData) {
    // This is a simulation - in real app, this would be an API call
    const validCredentials = [
        { email: 'admin@bloomspace.com', password: 'admin123' },
        { username: 'testuser', password: 'test123' },
        { email: 'user@example.com', password: 'password123' }
    ];
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const isValid = validCredentials.some(cred => 
                (cred.email === loginData.emailUsername || cred.username === loginData.emailUsername) &&
                cred.password === loginData.password
            );
            resolve(isValid);
        }, 1000);
    });
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Show success message
function showSuccessMessage(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.innerHTML = `
        <div style="margin-left: 30px;">
            ${message}
        </div>
    `;
    
    // Insert before form
    loginForm.parentNode.insertBefore(successDiv, loginForm);
    
    // Add a subtle bounce effect
    setTimeout(() => {
        successDiv.style.transform = 'scale(1.02)';
        setTimeout(() => {
            successDiv.style.transform = 'scale(1)';
        }, 200);
    }, 100);
}

// Show error message
function showErrorMessage(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'success-message show';
    errorDiv.style.background = 'rgba(239, 68, 68, 0.1)';
    errorDiv.style.borderColor = '#ef4444';
    errorDiv.style.color = '#ef4444';
    errorDiv.textContent = message;
    
    // Insert before form
    loginForm.parentNode.insertBefore(errorDiv, loginForm);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Save credentials to localStorage
function saveCredentials(emailUsername) {
    try {
        localStorage.setItem('bloomspace_remembered_user', emailUsername);
    } catch (error) {
        console.error('Failed to save credentials:', error);
    }
}

// Disable autofill
function disableAutofill() {
    // Set random names to confuse autofill
    const randomId = Math.random().toString(36).substring(7);
    emailUsernameInput.setAttribute('name', `email_${randomId}`);
    passwordInput.setAttribute('name', `password_${randomId}`);
    
    // Clear any existing values
    emailUsernameInput.value = '';
    passwordInput.value = '';
    
    // Add readonly attribute temporarily to prevent autofill
    emailUsernameInput.setAttribute('readonly', 'readonly');
    passwordInput.setAttribute('readonly', 'readonly');
    
    // Remove readonly after a short delay
    setTimeout(() => {
        emailUsernameInput.removeAttribute('readonly');
        passwordInput.removeAttribute('readonly');
    }, 100);
}

// Load saved credentials
function loadSavedCredentials() {
    try {
        const savedUser = localStorage.getItem('bloomspace_remembered_user');
        if (savedUser) {
            emailUsernameInput.value = savedUser;
            rememberMeCheckbox.checked = true;
        }
    } catch (error) {
        console.error('Failed to load saved credentials:', error);
    }
}

// Social login handlers
document.addEventListener('DOMContentLoaded', function() {
    // Google login
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showErrorMessage('Google login not implemented yet. Please use email/username login.');
        });
    }
    
    // Facebook login
    const facebookBtn = document.querySelector('.facebook-btn');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            showErrorMessage('Facebook login not implemented yet. Please use email/username login.');
        });
    }
    
    // Forgot password
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showErrorMessage('Password reset not implemented yet. Please contact support.');
        });
    }
});

// Form reset on page load
window.addEventListener('load', function() {
    // Clear any existing validation messages
    const validationMessages = document.querySelectorAll('.validation-message');
    validationMessages.forEach(msg => {
        msg.textContent = '';
        msg.className = 'validation-message';
    });
    
    // Remove any existing success/error messages
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.target === emailUsernameInput || e.target === passwordInput)) {
        e.preventDefault();
        handleLogin(e);
    }
});


// Auto-focus on email/username field
window.addEventListener('load', function() {
    if (emailUsernameInput && !emailUsernameInput.value) {
        emailUsernameInput.focus();
    }
});
