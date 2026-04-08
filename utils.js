// ============================================================
// File: frontend/js/utils.js
// Shared utility functions used across all pages
// ============================================================

const API_BASE = '/farmorgano-system/backend/api';
// -----------------------------------------------
// Show a toast notification
// -----------------------------------------------
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// -----------------------------------------------
// Generic API call with Fetch
// -----------------------------------------------
async function apiCall(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('API Error:', err);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// -----------------------------------------------
// Confirm before deleting
// -----------------------------------------------
function confirmDelete(message = 'Are you sure you want to delete this item?') {
    return window.confirm(message);
}

// -----------------------------------------------
// Format currency (INR)
// -----------------------------------------------
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// -----------------------------------------------
// Format date nicely
// -----------------------------------------------
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// -----------------------------------------------
// Show / Hide loading spinner inside container
// -----------------------------------------------
function showLoader(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="spinner"></div>';
}

// -----------------------------------------------
// Show empty state
// -----------------------------------------------
function showEmptyState(containerId, message = 'No data found.', icon = '🌿') {
    const el = document.getElementById(containerId);
    if (el) {
        el.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <p>${message}</p>
            </div>
        `;
    }
}

// -----------------------------------------------
// Open / Close Modal
// -----------------------------------------------
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Reset form inside modal
        const form = modal.querySelector('form');
        if (form) form.reset();
        // Clear hidden id field
        const hiddenId = modal.querySelector('input[name="id"]');
        if (hiddenId) hiddenId.value = '';
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// -----------------------------------------------
// Check login session (store in localStorage)
// -----------------------------------------------
function getSession() {
    const user = localStorage.getItem('farmorgano_user');
    return user ? JSON.parse(user) : null;
}

function setSession(user) {
    localStorage.setItem('farmorgano_user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('farmorgano_user');
}

function requireAuth() {
    const user = getSession();
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}
