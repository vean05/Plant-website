// Fixed Login JavaScript - Simple and Working
console.log('🔧 Loading FIXED login script...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 DOM loaded, initializing FIXED login...');
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailUsername');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    console.log('📋 Elements found:', {
        loginForm: !!loginForm,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput,
        rememberMeCheckbox: !!rememberMeCheckbox
    });
    
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    // Add form submit listener
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🚀 Form submitted!');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
        
        console.log('📝 Form data:', { email, password, rememberMe });
        
        if (!email || !password) {
            console.log('❌ Email or password is empty');
            showErrorMessage('Please enter both email and password.');
            return;
        }
        
        // Show loading
        const submitBtn = loginForm.querySelector('.login-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Logging in...</span>';
        submitBtn.disabled = true;
        
        // Make API call
        fetch('api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                remember_me: rememberMe
            })
        })
        .then(response => {
            console.log(`Response status: ${response.status}`);
            console.log(`Response ok: ${response.ok}`);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            
            if (data.success) {
                // Login successful
                console.log('✅ Login successful:', data);
                
                // Save credentials if "Remember Me" is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                }
                
                // Set login status in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', data.data.email);
                localStorage.setItem('authToken', data.data.session_token);
                localStorage.setItem('firstName', data.data.first_name);
                localStorage.setItem('lastName', data.data.last_name);
                
                // Show success message
                showSuccessMessage('Login successful! Redirecting to homepage...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // Login failed
                console.error('❌ Login failed:', data.message || data.error);
                showErrorMessage(data.message || data.error || 'Invalid email or password. Please try again.');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showErrorMessage('An error occurred. Please try again.');
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
    
    console.log('✅ FIXED Login form initialized successfully');
});

// Success message function
function showSuccessMessage(message) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 15px;
        border-radius: 6px;
        margin: 20px 0;
        border: 1px solid #c3e6cb;
        text-align: center;
    `;
    successDiv.textContent = message;
    
    // Insert success message before the form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.parentNode.insertBefore(successDiv, loginForm);
    }
}

// Error message function
function showErrorMessage(message) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 6px;
        margin: 20px 0;
        border: 1px solid #f5c6cb;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    // Insert error message before the form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.parentNode.insertBefore(errorDiv, loginForm);
    }
}
