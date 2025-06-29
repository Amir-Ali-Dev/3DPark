document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
            
            // Add animation
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // Floating labels
    document.querySelectorAll('.input-group input').forEach(input => {
        // Add placeholder space if empty
        if (input.value === '') input.placeholder = ' ';
        
        input.addEventListener('focus', function() {
            this.closest('.input-group').classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.input-group').classList.remove('focused');
        });
    });

    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const container = this.closest('.form-group').querySelector('.password-strength');
            const password = this.value;
            let strength = 0;
            
            // Reset
            container.className = 'password-strength';
            
            if (password.length === 0) return;
            
            // Length check
            if (password.length > 7) strength += 1;
            
            // Contains numbers
            if (/\d/.test(password)) strength += 1;
            
            // Contains special chars
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
            
            // Update UI
            if (strength === 1) {
                container.classList.add('weak');
            } else if (strength === 2) {
                container.classList.add('medium');
            } else if (strength >= 3) {
                container.classList.add('strong');
            }
        });
    }

    // Form validation
    function validateInput(input) {
        const inputGroup = input.closest('.input-group');
        const validationType = inputGroup.getAttribute('data-validation');
        let isValid = true;
        let message = '';
        
        if (input.value.trim() === '') {
            isValid = false;
            message = 'This field is required';
        } else {
            switch(validationType) {
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                        isValid = false;
                        message = 'Please enter a valid email';
                    }
                    break;
                case 'password':
                    if (input.value.length < 8) {
                        isValid = false;
                        message = 'Password must be at least 8 characters';
                    }
                    break;
                case 'phone':
                    if (!/^[\d\s\-()+]{10,}$/.test(input.value)) {
                        isValid = false;
                        message = 'Please enter a valid phone number';
                    }
                    break;
            }
        }
        
        // Update UI
        inputGroup.classList.remove('valid', 'invalid');
        const feedback = inputGroup.querySelector('.validation-feedback');
        
        if (input.value.trim() === '') {
            feedback.textContent = '';
            feedback.style.opacity = '0';
        } else {
            if (isValid) {
                inputGroup.classList.add('valid');
            } else {
                inputGroup.classList.add('invalid');
                feedback.textContent = message;
                feedback.style.opacity = '1';
            }
        }
        
        return isValid;
    }

    // Validate on blur
    document.querySelectorAll('[data-validation] input').forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });

    // Form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm(this, '/api/login');
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate password match
            const password = document.getElementById('register-password');
            const confirmPassword = document.getElementById('register-confirm-password');
            const inputGroup = confirmPassword.closest('.input-group');
            const feedback = inputGroup.querySelector('.validation-feedback');
            
            if (password.value !== confirmPassword.value) {
                inputGroup.classList.add('invalid');
                feedback.textContent = 'Passwords do not match';
                feedback.style.opacity = '1';
                return;
            } else {
                inputGroup.classList.remove('invalid');
                feedback.style.opacity = '0';
            }
            
            submitForm(this, '/api/register');
        });
    }

    function submitForm(form, url) {
        // Validate all fields
        let isValid = true;
        form.querySelectorAll('[data-validation] input').forEach(input => {
            if (!validateInput(input)) isValid = false;
        });
        
        if (!isValid) return;
        
        // Show loading state
        const btn = form.querySelector('.auth-btn');
        btn.classList.add('loading');
        
        // Simulate API call
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.classList.add('success');
            
            const btnText = btn.querySelector('.btn-text');
            btnText.textContent = form.id === 'login-form' ? 'Login Successful!' : 'Registration Successful!';
            
            setTimeout(() => {
                if (form.id === 'login-form') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'login.html';
                }
            }, 1000);
        }, 2000);
    }

    // Social buttons animation
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
});