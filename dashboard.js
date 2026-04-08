// ============================================================
// File: frontend/js/dashboard.js
// All dashboard module logic: crops, fertilizers,
// customers, orders, sales, charts
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

    // -----------------------------------------------
    // 1. Auth guard
    // -----------------------------------------------
    const user = requireAuth();
    document.getElementById('userNameDisplay').textContent = user.name;
    document.getElementById('userAvatarDisplay').textContent = user.name.charAt(0).toUpperCase();

    // -----------------------------------------------
    // 2. Navigation
    // -----------------------------------------------
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pages    = document.querySelectorAll('.page-section');

    function showPage(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));

        const target = document.getElementById('page-' + pageId);
        const navEl  = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (target) target.classList.add('active');
        if (navEl)  navEl.classList.add('active');

        // Update topbar title
        const titles = {
            dashboard:   ['🌿 Dashboard', 'Welcome back! Here\'s your farm overview.'],
            crops:       ['🌾 Crop Management', 'Manage your organic crop inventory.'],
            fertilizers: ['🧪 Fertilizers', 'Track organic fertilizer usage.'],
            customers:   ['👥 Customers', 'Manage your customer relationships.'],
            orders:      ['📦 Orders', 'Create and track product orders.'],
            sales:       ['📊 Sales & Reports', 'Monthly sales analytics and reports.']
        };
        const t = titles[pageId] || ['FarmOrgano', ''];
        document.getElementById('topbarTitle').textContent = t[0];
        document.getElementById('topbarSubtitle').textContent = t[1];

        // Lazy load data
        loaders[pageId]?.();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            showPage(item.dataset.page);
            // Close sidebar on mobile
            document.querySelector('.sidebar').classList.remove('open');
        });
    });

    // Mobile hamburger
    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });

    // -----------------------------------------------
    // 3. Logout
    // -----------------------------------------------
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await apiCall(`${API_BASE}/auth/logout.php`, 'GET');
        clearSession();
        window.location.href = 'login.html';
    });

    // -----------------------------------------------
    // 4. Dashboard Stats & Charts
    // -----------------------------------------------
    let salesChartInstance = null;
    let cropChartInstance  = null;

    async function loadDashboard() {
        const res = await apiCall(`${API_BASE}/dashboard/index.php`);
        if (!res.success) return;

        const s = res.stats;
        document.getElementById('stat-crops').textContent       = s.crops;
        document.getElementById('stat-fertilizers').textContent = s.fertilizers;
        document.getElementById('stat-customers').textContent   = s.customers;
        document.getElementById('stat-orders').textContent      = s.orders;
        document.getElementById('stat-sales').textContent       = formatCurrency(s.total_sales);

        // Monthly Sales Bar Chart
        const ctx1 = document.getElementById('salesChart')?.getContext('2d');
        if (ctx1) {
            if (salesChartInstance) salesChartInstance.destroy();
            salesChartInstance = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: res.chart.labels,
                    datasets: [{
                        label: 'Sales (₹)',
                        data: res.chart.values,
                        backgroundColor: 'rgba(93,184,93,0.7)',
                        borderColor: '#2d6a2d',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => formatCurrency(ctx.raw)
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: val => '₹' + val.toLocaleString('en-IN')
                            },
                            grid: { color: 'rgba(45,106,45,0.06)' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Donut chart placeholder (modules count)
        const ctx2 = document.getElementById('moduleChart')?.getContext('2d');
        if (ctx2) {
            if (cropChartInstance) cropChartInstance.destroy();
            cropChartInstance = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Crops', 'Fertilizers', 'Customers', 'Orders'],
                    datasets: [{
                        data: [s.crops, s.fertilizers, s.customers, s.orders],
                        backgroundColor: ['#2d6a2d','#5cb85c','#76c442','#a8d5a2'],
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 16, font: { size: 12 } }
                        }
                    }
                }
            });
        }

        // Recent orders table
        const tbody = document.getElementById('recentOrdersBody');
        if (tbody) {
            if (res.recent_orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:20px">No recent orders.</td></tr>';
            } else {
                tbody.innerHTML = res.recent_orders.map(o => `
                    <tr>
                        <td>${o.customer_name || '—'}</td>
                        <td>${o.product_name}</td>
                        <td>${o.quantity}</td>
                        <td>${formatCurrency(o.price)}</td>
                        <td>${formatDate(o.date)}</td>
                    </tr>
                `).join('');
            }
        }
    }

    // -----------------------------------------------
    // 5. CROPS MODULE
    // -----------------------------------------------
    let cropsData = [];

    async function loadCrops() {
        showLoader('cropsTableContainer');
        const res = await apiCall(`${API_BASE}/crops/index.php`);
        if (!res.success) { showEmptyState('cropsTableContainer', 'Failed to load crops.'); return; }

        cropsData = res.data;
        renderCropsTable(cropsData);
    }

    function renderCropsTable(data) {
        const container = document.getElementById('cropsTableContainer');
        if (!data || data.length === 0) {
            showEmptyState('cropsTableContainer', 'No crops found. Add your first crop!', '🌾');
            return;
        }
        container.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th><th>Crop Name</th><th>Category</th>
                            <th>Season</th><th>Soil Type</th>
                            <th>Duration</th><th>Yield Info</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((c, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${c.name}</strong></td>
                                <td><span class="badge badge-green">${c.category || '—'}</span></td>
                                <td>${c.season || '—'}</td>
                                <td>${c.soil_type || '—'}</td>
                                <td>${c.duration || '—'}</td>
                                <td class="text-sm text-muted">${c.yield_info || '—'}</td>
                                <td>
                                    <div class="d-flex gap-12">
                                        <button class="btn btn-warning btn-sm" onclick="editCrop(${c.id})">✏️ Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteCrop(${c.id})">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Add crop
    document.getElementById('addCropForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const body = {
            name:       form.name.value.trim(),
            category:   form.category.value.trim(),
            season:     form.season.value.trim(),
            soil_type:  form.soil_type.value.trim(),
            duration:   form.duration.value.trim(),
            yield_info: form.yield_info.value.trim()
        };
        const res = await apiCall(`${API_BASE}/crops/index.php`, 'POST', body);
        if (res.success) {
            showToast(res.message + ' 🌾');
            closeModal('addCropModal');
            loadCrops();
        } else {
            showToast(res.message, 'error');
        }
    });

    // Edit crop — populate modal
    window.editCrop = function(id) {
        const crop = cropsData.find(c => c.id == id);
        if (!crop) return;
        const form = document.getElementById('editCropForm');
        form.id.value         = crop.id;
        form.name.value       = crop.name;
        form.category.value   = crop.category;
        form.season.value     = crop.season;
        form.soil_type.value  = crop.soil_type;
        form.duration.value   = crop.duration;
        form.yield_info.value = crop.yield_info;
        openModal('editCropModal');
    };

    document.getElementById('editCropForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const body = {
            id:         form.id.value,
            name:       form.name.value.trim(),
            category:   form.category.value.trim(),
            season:     form.season.value.trim(),
            soil_type:  form.soil_type.value.trim(),
            duration:   form.duration.value.trim(),
            yield_info: form.yield_info.value.trim()
        };
        const res = await apiCall(`${API_BASE}/crops/index.php`, 'PUT', body);
        if (res.success) {
            showToast(res.message + ' ✅');
            closeModal('editCropModal');
            loadCrops();
        } else {
            showToast(res.message, 'error');
        }
    });

    window.deleteCrop = async function(id) {
        if (!confirmDelete('Delete this crop record?')) return;
        const res = await apiCall(`${API_BASE}/crops/index.php`, 'DELETE', { id });
        if (res.success) { showToast(res.message); loadCrops(); }
        else showToast(res.message, 'error');
    };

    // -----------------------------------------------
    // 6. FERTILIZERS MODULE
    // -----------------------------------------------
    async function loadFertilizers() {
        showLoader('fertilizersTableContainer');
        const res = await apiCall(`${API_BASE}/fertilizers/index.php`);
        if (!res.success) { showEmptyState('fertilizersTableContainer', 'Failed to load data.'); return; }

        const data = res.data;
        const container = document.getElementById('fertilizersTableContainer');
        if (!data.length) {
            showEmptyState('fertilizersTableContainer', 'No fertilizers added yet.', '🧪');
            return;
        }
        container.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>#</th><th>Fertilizer Name</th><th>Type</th><th>Usage Instructions</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${data.map((f, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${f.name}</strong></td>
                                <td><span class="badge badge-earth">${f.type || '—'}</span></td>
                                <td class="text-sm text-muted">${f.usage || '—'}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteFertilizer(${f.id})">🗑️ Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    document.getElementById('addFertilizerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const body = {
            name:  form.name.value.trim(),
            type:  form.type.value.trim(),
            usage: form.usage.value.trim()
        };
        const res = await apiCall(`${API_BASE}/fertilizers/index.php`, 'POST', body);
        if (res.success) {
            showToast(res.message + ' 🧪');
            closeModal('addFertilizerModal');
            loadFertilizers();
        } else {
            showToast(res.message, 'error');
        }
    });

    window.deleteFertilizer = async function(id) {
        if (!confirmDelete('Delete this fertilizer?')) return;
        const res = await apiCall(`${API_BASE}/fertilizers/index.php`, 'DELETE', { id });
        if (res.success) { showToast(res.message); loadFertilizers(); }
        else showToast(res.message, 'error');
    };

    // -----------------------------------------------
    // 7. CUSTOMERS MODULE
    // -----------------------------------------------
    async function loadCustomers() {
        showLoader('customersTableContainer');
        const res = await apiCall(`${API_BASE}/customers/index.php`);
        if (!res.success) { showEmptyState('customersTableContainer', 'Failed to load data.'); return; }

        const data = res.data;
        const container = document.getElementById('customersTableContainer');
        if (!data.length) {
            showEmptyState('customersTableContainer', 'No customers added yet.', '👥');
            return;
        }
        container.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>#</th><th>Customer Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${data.map((c, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${c.name}</strong></td>
                                <td>${c.contact || '—'}</td>
                                <td class="text-sm text-muted">${c.address || '—'}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id})">🗑️ Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    document.getElementById('addCustomerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const body = {
            name:    form.name.value.trim(),
            contact: form.contact.value.trim(),
            address: form.address.value.trim()
        };
        const res = await apiCall(`${API_BASE}/customers/index.php`, 'POST', body);
        if (res.success) {
            showToast(res.message + ' 👥');
            closeModal('addCustomerModal');
            loadCustomers();
        } else {
            showToast(res.message, 'error');
        }
    });

    window.deleteCustomer = async function(id) {
        if (!confirmDelete('Delete this customer?')) return;
        const res = await apiCall(`${API_BASE}/customers/index.php`, 'DELETE', { id });
        if (res.success) { showToast(res.message); loadCustomers(); }
        else showToast(res.message, 'error');
    };

    // -----------------------------------------------
    // 8. ORDERS MODULE
    // -----------------------------------------------
    async function loadOrders() {
        showLoader('ordersTableContainer');
        const res = await apiCall(`${API_BASE}/orders/index.php`);
        if (!res.success) { showEmptyState('ordersTableContainer', 'Failed to load orders.'); return; }

        const data = res.data;
        const container = document.getElementById('ordersTableContainer');
        if (!data.length) {
            showEmptyState('ordersTableContainer', 'No orders yet. Create your first order!', '📦');
            return;
        }
        container.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>#</th><th>Customer</th><th>Product</th><th>Qty</th><th>Price/Unit</th><th>Total</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${data.map((o, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${o.customer_name || '—'}</strong></td>
                                <td>${o.product_name}</td>
                                <td>${o.quantity}</td>
                                <td>${formatCurrency(o.price)}</td>
                                <td><strong class="text-green">${formatCurrency(o.quantity * o.price)}</strong></td>
                                <td>${formatDate(o.date)}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteOrder(${o.id})">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Populate customers dropdown in order modal
    async function populateCustomerSelect() {
        const res = await apiCall(`${API_BASE}/customers/index.php`);
        const select = document.getElementById('orderCustomerSelect');
        if (!select) return;
        select.innerHTML = '<option value="">-- Select Customer --</option>';
        if (res.success && res.data.length) {
            res.data.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        }
    }

    document.getElementById('openAddOrderBtn')?.addEventListener('click', async () => {
        await populateCustomerSelect();
        openModal('addOrderModal');
    });

    document.getElementById('addOrderForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const body = {
            customer_id:  form.customer_id.value,
            product_name: form.product_name.value.trim(),
            quantity:     form.quantity.value,
            price:        form.price.value,
            date:         form.date.value
        };
        const res = await apiCall(`${API_BASE}/orders/index.php`, 'POST', body);
        if (res.success) {
            showToast(res.message + ' 📦');
            closeModal('addOrderModal');
            loadOrders();
        } else {
            showToast(res.message, 'error');
        }
    });

    window.deleteOrder = async function(id) {
        if (!confirmDelete('Delete this order?')) return;
        const res = await apiCall(`${API_BASE}/orders/index.php`, 'DELETE', { id });
        if (res.success) { showToast(res.message); loadOrders(); }
        else showToast(res.message, 'error');
    };

    // -----------------------------------------------
    // 9. SALES MODULE
    // -----------------------------------------------
    let salesLineChart = null;

    async function loadSales() {
        showLoader('salesTableContainer');

        const [allRes, monthlyRes] = await Promise.all([
            apiCall(`${API_BASE}/sales/index.php`),
            apiCall(`${API_BASE}/sales/index.php?report=monthly`)
        ]);

        // Monthly chart
        const ctx = document.getElementById('salesLineChart')?.getContext('2d');
        if (ctx && monthlyRes.success) {
            if (salesLineChart) salesLineChart.destroy();
            salesLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthlyRes.data.map(m => m.month_name),
                    datasets: [{
                        label: 'Monthly Revenue (₹)',
                        data: monthlyRes.data.map(m => parseFloat(m.total)),
                        borderColor: '#2d6a2d',
                        backgroundColor: 'rgba(45,106,45,0.08)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#5cb85c',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => formatCurrency(ctx.raw) } }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: v => '₹' + v.toLocaleString('en-IN') },
                            grid: { color: 'rgba(45,106,45,0.06)' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Monthly summary cards
        if (monthlyRes.success) {
            const container = document.getElementById('monthlySummary');
            if (container) {
                container.innerHTML = monthlyRes.data.slice().reverse().slice(0, 4).map(m => `
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-value">${formatCurrency(m.total)}</div>
                        <div class="stat-label">${m.month_name}</div>
                    </div>
                `).join('');
            }
        }

        // All sales table
        const container = document.getElementById('salesTableContainer');
        if (!allRes.success || !allRes.data.length) {
            showEmptyState('salesTableContainer', 'No sales records found.', '📊');
            return;
        }
        container.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>#</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Month</th><th>Year</th></tr>
                    </thead>
                    <tbody>
                        ${allRes.data.map((s, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${s.customer_name || '—'}</td>
                                <td>${s.product_name || '—'}</td>
                                <td>${s.quantity || '—'}</td>
                                <td><strong class="text-green">${formatCurrency(s.total_amount)}</strong></td>
                                <td>${s.month}</td>
                                <td>${s.year}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // -----------------------------------------------
    // 10. Lazy loaders map
    // -----------------------------------------------
    const loaders = {
        dashboard:   loadDashboard,
        crops:       loadCrops,
        fertilizers: loadFertilizers,
        customers:   loadCustomers,
        orders:      loadOrders,
        sales:       loadSales
    };

    // -----------------------------------------------
    // 11. Default page
    // -----------------------------------------------
    showPage('dashboard');
});
