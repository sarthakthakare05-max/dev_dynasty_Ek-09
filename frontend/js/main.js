document.addEventListener('DOMContentLoaded', () => {
    
    // DOM Elements
    const modal = document.getElementById('auth-modal');
    const btnLoginNav = document.getElementById('btn-login-nav');
    const btnRegisterNav = document.getElementById('btn-register-nav');
    const btnGetStarted = document.getElementById('btn-get-started');
    const closeModal = document.getElementById('close-modal');
    
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // State
    let isLoginView = true;

    // Functions
    const openModal = (view = 'login') => {
        modal.classList.remove('hidden');
        if (view === 'login') {
            showLogin();
        } else {
            showRegister();
        }
    };

    const closeModalFunc = () => {
        modal.classList.add('hidden');
    };

    const showLogin = () => {
        loginFormContainer.classList.remove('hidden');
        registerFormContainer.classList.add('hidden');
        isLoginView = true;
    };

    const showRegister = () => {
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
        isLoginView = false;
    };

    // Event Listeners
    if (btnLoginNav) btnLoginNav.addEventListener('click', () => openModal('login'));
    if (btnRegisterNav) btnRegisterNav.addEventListener('click', () => openModal('register'));
    if (btnGetStarted) btnGetStarted.addEventListener('click', () => openModal('register'));
    
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    
    // Close modal if clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }

    // Form Submissions (Mock)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (email && password) {
                console.log('Login Attempt:', { email, password });
                alert(`Login Successful! Welcome, ${email}`);
                // Future: Redirect to dashboard
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('register-role').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            if (email && password && role) {
                console.log('Register Attempt:', { role, email, password });
                alert(`Registration Successful as ${role}!`);
                closeModalFunc();
                // Future: Redirect based on role
            }
        });
    }
});
