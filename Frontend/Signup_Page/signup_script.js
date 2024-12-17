document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    const usernameError = document.getElementById('username_error');
    const emailError = document.getElementById('email_error');
    const passwordError = document.getElementById('password_error');
    const confirmPasswordError = document.getElementById('confirmPassword_error');

    function showError(errorElement) {
        errorElement.style.display = 'block';
    }

    function hideError(errorElement) {
        errorElement.style.display = 'none';
    }

    function validateUsername() {
        const usernameValue = username.value.trim();
        const isValid = usernameValue.length >= 3 && /^[a-zA-Z0-9_]+$/.test(usernameValue);
        
        if (!isValid) {
            showError(usernameError);
        } else {
            hideError(usernameError);
        }
        return isValid;
    }

    function validateEmail() {
        const emailValue = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(emailValue);
        
        if (!isValid) {
            showError(emailError);
        } else {
            hideError(emailError);
        }
        return isValid;
    }

    function validatePassword() {
        const passwordValue = password.value;
        const isValid = passwordValue.length >= 8 && 
            /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(passwordValue);
        
        if (!isValid) {
            showError(passwordError);
        } else {
            hideError(passwordError);
        }
        return isValid;
    }

    function validateConfirmPassword() {
        const isValid = password.value === confirmPassword.value && confirmPassword.value !== '';
        
        if (!isValid) {
            showError(confirmPasswordError);
        } else {
            hideError(confirmPasswordError);
        }
        return isValid;
    }

    // Real-time validation
    username.addEventListener('input', validateUsername);
    email.addEventListener('input', validateEmail);
    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
            // Form is valid, you can submit to server or perform further actions
            alert('Signup Successful');
            // Typically, you would send data to server here
            // form.submit();
        }
    });
});
