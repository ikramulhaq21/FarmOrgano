// ============================================================
// File: frontend/js/auth.js
// Handles login and registration form submissions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------
    // LOGIN FORM
    // -----------------------------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {

        // Redirect if already logged in
        if (getSession()) {
            window.location.href = 'dashboard.html';
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.textContent = 'Signing in...';
            btn.disabled = true;

            const email    = loginForm.email.value.trim();
            const password = loginForm.password.value;

            const res = await apiCall(`${API_BASE}/auth/login.php`, 'POST', { email, password });

            if (res.success) {
                setSession(res.user);
                showToast('Welcome back, ' + res.user.name + '! 🌱');
                setTimeout(() => window.location.href = 'dashboard.html', 800);
            } else {
                showToast(res.message || 'Login failed.', 'error');
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    }

    // -----------------------------------------------
    // REGISTER FORM
    // -----------------------------------------------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            const name     = registerForm.fullname.value.trim();
            const email    = registerForm.email.value.trim();
            const password = registerForm.password.value;
            const confirm  = registerForm.confirm.value;

            if (password !== confirm) {
                showToast('Passwords do not match.', 'error');
                btn.textContent = 'Create Account';
                btn.disabled = false;
                return;
            }

            const res = await apiCall(`${API_BASE}/auth/register.php`, 'POST', { name, email, password });

            if (res.success) {
                showToast('Account created! Redirecting to login... 🌿');
                setTimeout(() => window.location.href = 'login.html', 1200);
            } else {
                showToast(res.message || 'Registration failed.', 'error');
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
    }
});
