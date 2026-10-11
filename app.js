/**
 * TRIP MATE - MAIN APPLICATION CLIENT SCRIPT
 * Full-stack Client communicating with Spring Boot REST Backend
 */

const API_BASE_URL = 'http://localhost:8081/api';

class TripMateApp {
    constructor() {
        this.token = localStorage.getItem('tm_token') || null;
        this.currentUser = JSON.parse(localStorage.getItem('tm_user') || 'null');
        this.destinations = [];
        this.places = [];
        this.myTrips = [];
        this.selectedTripFilter = 'ALL';
        this.selectedPlaceCategory = 'ALL';
        this.selectedPlaceDestination = 'ALL';
        
        this.init();
    }

    async init() {
        this.updateAuthUI();
        await this.loadDestinations();
        await this.loadPlaces();
        
        if (this.isAuthenticated()) {
            this.loadUserTrips();
        }

        // Setup destination select dropdowns
        this.populateDestinationDropdowns();

        // Default travel date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateInput = document.getElementById('trip-date');
        if (dateInput) {
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }

        // Recalculate preview on startup
        this.recalculateTripBudgetPreview();
    }

    /* ================= AUTHENTICATION & SESSION ================= */
    isAuthenticated() {
        return !!this.token;
    }

    updateAuthUI() {
        const guestNav = document.getElementById('guest-nav-actions');
        const userNav = document.getElementById('user-nav-actions');
        const authLinks = document.querySelectorAll('.auth-required');
        const navName = document.getElementById('nav-user-name');
        const navInitials = document.getElementById('nav-user-initials');

        if (this.isAuthenticated() && this.currentUser) {
            if (guestNav) guestNav.style.display = 'none';
            if (userNav) userNav.style.display = 'flex';
            authLinks.forEach(el => el.style.display = 'flex');

            if (navName) navName.textContent = this.currentUser.name || 'User';
            if (navInitials) navInitials.textContent = (this.currentUser.name || 'U').charAt(0).toUpperCase();

            // Profile info
            const pName = document.getElementById('profile-name-display');
            const pEmail = document.getElementById('profile-email-display');
            const pInputName = document.getElementById('profile-name');
            const dashGreeting = document.getElementById('dash-greeting');

            if (pName) pName.textContent = this.currentUser.name;
            if (pEmail) pEmail.textContent = this.currentUser.email;
            if (pInputName) pInputName.value = this.currentUser.name;
            if (dashGreeting) dashGreeting.textContent = `Welcome back, ${this.currentUser.name}! 👋`;
        } else {
            if (guestNav) guestNav.style.display = 'flex';
            if (userNav) userNav.style.display = 'none';
            authLinks.forEach(el => el.style.display = 'none');
        }
    }

    openAuthModal(tab = 'login') {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('show');
            this.switchAuthTab(tab);
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('show');
    }

    switchAuthTab(tab) {
        const loginBtn = document.getElementById('tab-login-btn');
        const regBtn = document.getElementById('tab-register-btn');
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');

        if (tab === 'login') {
            loginBtn.classList.add('active');
            regBtn.classList.remove('active');
            loginForm.classList.add('active');
            regForm.classList.remove('active');
        } else {
            regBtn.classList.add('active');
            loginBtn.classList.remove('active');
            regForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.token = data.token;
            this.currentUser = { id: data.id, name: data.name, email: data.email };
            localStorage.setItem('tm_token', this.token);
            localStorage.setItem('tm_user', JSON.stringify(this.currentUser));

            this.closeAuthModal();
            this.updateAuthUI();
            this.showToast('Login successful! Welcome to Trip Mate.', 'success');
            await this.loadUserTrips();
            this.showSection('dashboard');
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            this.token = data.token;
            this.currentUser = { id: data.id, name: data.name, email: data.email };
            localStorage.setItem('tm_token', this.token);
            localStorage.setItem('tm_user', JSON.stringify(this.currentUser));

            this.closeAuthModal();
            this.updateAuthUI();
            this.showToast('Account created successfully!', 'success');
            await this.loadUserTrips();
            this.showSection('dashboard');
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('tm_token');
        localStorage.removeItem('tm_user');
        this.updateAuthUI();
        this.showToast('You have been logged out.', 'info');
        this.showSection('home');
    }

    toggleUserDropdown() {
        const menu = document.getElementById('user-dropdown-menu');
        if (menu) menu.classList.toggle('show');
    }

    /* ================= SECTION NAVIGATION ================= */
    showSection(sectionId) {
        // Guard authenticated views
        if (['dashboard', 'my-trips', 'profile'].includes(sectionId) && !this.isAuthenticated()) {
            this.openAuthModal('login');
            this.showToast('Please login to access this section.', 'warning');
            return;
        }

        // Hide user dropdown
        const menu = document.getElementById('user-dropdown-menu');
        if (menu) menu.classList.remove('show');

        // Toggle section visibility
        document.querySelectorAll('.app-section').forEach(sec => {
            sec.classList.remove('active');
        });
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Update nav links active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === sectionId) {
                link.classList.add('active');
            }
        });

        // Trigger section specific refreshes
        if (sectionId === 'dashboard') {
            this.renderDashboard();
        } else if (sectionId === 'my-trips') {
            this.loadUserTrips();
        } else if (sectionId === 'create-trip') {
            this.recalculateTripBudgetPreview();
        }
    }

    toggleMobileMenu() {
        const nav = document.querySelector('.nav-links');
        if (nav) {
            nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
        }
    }

    /* ================= DESTINATIONS ================= */
    async loadDestinations() {
        try {
            const res = await fetch(`${API_BASE_URL}/destinations`);
            if (!res.ok) throw new Error('Failed to load destinations');
            this.destinations = await res.json();
            this.renderDestinations(this.destinations);
            this.renderHomeDestinations(this.destinations.slice(0, 3));
            this.populateDestinationDropdowns();
        } catch (err) {
            console.error(err);
        }
    }

    populateDestinationDropdowns() {
        const selects = ['quick-dest-select', 'trip-destination', 'rec-destination', 'places-filter-dest'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            const currentVal = select.value;
            select.innerHTML = (id === 'places-filter-dest') ? '<option value="ALL">All Destinations</option>' : '<option value="">Select Destination</option>';
            this.destinations.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = `${d.name}, ${d.country}`;
                select.appendChild(opt);
            });
            if (currentVal) select.value = currentVal;
        });
    }

    renderHomeDestinations(destList) {
        const grid = document.getElementById('home-destinations-grid');
        if (!grid) return;
        grid.innerHTML = destList.map(d => this.createDestinationCardHtml(d)).join('');
    }

    renderDestinations(destList) {
        const grid = document.getElementById('destinations-grid');
        if (!grid) return;
        if (destList.length === 0) {
            grid.innerHTML = `<p class="text-muted text-center" style="grid-column: 1/-1;">No destinations found.</p>`;
            return;
        }
        grid.innerHTML = destList.map(d => this.createDestinationCardHtml(d)).join('');
    }

    createDestinationCardHtml(d) {
        return `
            <div class="destination-card">
                <div class="card-image-wrap">
                    <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" alt="${d.name}" loading="lazy">
                    <span class="card-badge"><i class="fa-solid fa-location-dot"></i> ${d.name}</span>
                </div>
                <div class="card-body">
                    <div class="card-title-row">
                        <h3>${d.name}</h3>
                        <span class="country-tag">${d.country}</span>
                    </div>
                    <p class="card-description">${d.description || 'Explore scenic landscapes and vibrant culture.'}</p>
                    <div class="card-meta-row">
                        <div class="budget-estimate-label">
                            <small>Avg Budget</small>
                            <strong>₹${d.averageBudget ? d.averageBudget.toLocaleString() : '15,000'}</strong>
                        </div>
                        <div class="card-actions-group">
                            <button class="btn btn-sm btn-outline" onclick="app.viewDestinationDetails(${d.id})">Details</button>
                            <button class="btn btn-sm btn-primary" onclick="app.startTripWithDestination(${d.id})">Plan Trip</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    filterDestinations(query) {
        if (!query) {
            this.renderDestinations(this.destinations);
            return;
        }
        const filtered = this.destinations.filter(d => 
            d.name.toLowerCase().includes(query.toLowerCase()) || 
            d.country.toLowerCase().includes(query.toLowerCase())
        );
        this.renderDestinations(filtered);
    }

    async viewDestinationDetails(id) {
        const d = this.destinations.find(item => item.id === id);
        if (!d) return;

        // Fetch places for this destination
        let placesHtml = '<p class="text-muted">Loading places...</p>';
        try {
            const res = await fetch(`${API_BASE_URL}/places/destination/${id}`);
            const places = await res.json();
            placesHtml = places.map(p => `
                <div class="compact-trip-card" style="margin-bottom: 8px;">
                    <div class="compact-trip-left">
                        <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" class="compact-trip-thumb">
                        <div>
                            <strong>${p.name}</strong>
                            <small class="text-muted" style="display: block;">${p.category} • ${p.location}</small>
                        </div>
                    </div>
                    <div>
                        <strong class="text-primary">₹${p.estimatedCost}</strong>
                    </div>
                </div>
            `).join('') || '<p class="text-muted">No specific tourist places listed yet.</p>';
        } catch(e) {
            console.error(e);
        }

        const modal = document.getElementById('destination-modal');
        const container = document.getElementById('destination-modal-content');
        if (container) {
            container.innerHTML = `
                <div style="border-radius: var(--radius-lg); overflow: hidden; height: 260px; margin-bottom: 20px;">
                    <img src="${d.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h2>${d.name}, ${d.country}</h2>
                <p class="text-muted" style="margin: 10px 0 20px;">${d.description}</p>
                <div style="display: flex; gap: 20px; margin-bottom: 24px;">
                    <div class="stat-card" style="flex: 1; padding: 14px;">
                        <span class="stat-label">Estimated Avg Budget</span>
                        <h3>₹${d.averageBudget ? d.averageBudget.toLocaleString() : '15,000'}</h3>
                    </div>
                </div>
                <h4 style="margin-bottom: 12px;"><i class="fa-solid fa-monument text-primary"></i> Popular Tourist Places</h4>
                <div style="max-height: 250px; overflow-y: auto; margin-bottom: 24px;">
                    ${placesHtml}
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-outline" onclick="app.closeDestinationModal()">Close</button>
                    <button class="btn btn-primary" onclick="app.closeDestinationModal(); app.startTripWithDestination(${d.id})">
                        <i class="fa-solid fa-route"></i> Plan Trip to ${d.name}
                    </button>
                </div>
            `;
        }
        if (modal) modal.classList.add('show');
    }

    closeDestinationModal() {
        const modal = document.getElementById('destination-modal');
        if (modal) modal.classList.remove('show');
    }

    startTripWithDestination(destId) {
        this.showSection('create-trip');
        const destSelect = document.getElementById('trip-destination');
        if (destSelect) {
            destSelect.value = destId;
            this.onTripDestinationChange();
        }
    }

    /* ================= PLACES ================= */
    async loadPlaces() {
        try {
            const res = await fetch(`${API_BASE_URL}/places`);
            if (!res.ok) throw new Error('Failed to load places');
            this.places = await res.json();
            this.renderPlaces(this.places);
        } catch (err) {
            console.error(err);
        }
    }

    renderPlaces(placesList) {
        const grid = document.getElementById('places-grid');
        if (!grid) return;
        if (placesList.length === 0) {
            grid.innerHTML = `<p class="text-muted text-center" style="grid-column: 1/-1;">No places found for selected criteria.</p>`;
            return;
        }

        grid.innerHTML = placesList.map(p => `
            <div class="place-card">
                <div class="card-image-wrap">
                    <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" alt="${p.name}">
                    <span class="place-category-badge">${p.category}</span>
                </div>
                <div class="card-body">
                    <div class="card-title-row">
                        <h3>${p.name}</h3>
                    </div>
                    <div class="place-location-tag"><i class="fa-solid fa-map-pin"></i> ${p.location} • ${p.destination ? p.destination.name : ''}</div>
                    <p class="card-description">${p.description || 'A scenic sightseeing attraction.'}</p>
                    <div class="card-meta-row">
                        <div class="budget-estimate-label">
                            <small>Ticket / Entry Cost</small>
                            <strong>₹${p.estimatedCost ? p.estimatedCost.toLocaleString() : '0'}</strong>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="app.quickAddPlaceModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-plus"></i> Add to Trip
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setPlaceCategoryFilter(category, btnElement) {
        this.selectedPlaceCategory = category;
        document.querySelectorAll('#places-category-pills .cat-pill').forEach(b => b.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');
        this.filterPlaces();
    }

    filterPlaces() {
        const destSelect = document.getElementById('places-filter-dest');
        const destVal = destSelect ? destSelect.value : 'ALL';
        
        let filtered = this.places;
        if (destVal !== 'ALL') {
            filtered = filtered.filter(p => p.destination && p.destination.id == destVal);
        }
        if (this.selectedPlaceCategory !== 'ALL') {
            filtered = filtered.filter(p => p.category.toLowerCase() === this.selectedPlaceCategory.toLowerCase());
        }
        this.renderPlaces(filtered);
    }

    /* ================= TRIP PLANNING & BUDGET ================= */
    quickStartTrip() {
        const destId = document.getElementById('quick-dest-select').value;
        const budget = document.getElementById('quick-budget').value;
        const days = document.getElementById('quick-days').value;

        if (destId) {
            this.showSection('recommendations');
            document.getElementById('rec-destination').value = destId;
            document.getElementById('rec-budget').value = budget || 20000;
            document.getElementById('rec-days').value = days || 4;
            this.fetchRecommendations();
        } else {
            this.showSection('destinations');
        }
    }

    onTripDestinationChange() {
        const destId = document.getElementById('trip-destination').value;
        const container = document.getElementById('trip-places-picker-grid');
        if (!container) return;

        if (!destId) {
            container.innerHTML = `<p class="text-muted">Select a destination above to view available tourist places.</p>`;
            this.recalculateTripBudgetPreview();
            return;
        }

        const destPlaces = this.places.filter(p => p.destination && p.destination.id == destId);
        if (destPlaces.length === 0) {
            container.innerHTML = `<p class="text-muted">No places found for this destination.</p>`;
        } else {
            container.innerHTML = destPlaces.map(p => `
                <label class="place-picker-item">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" name="selected-trip-places" value="${p.id}" onchange="app.recalculateTripBudgetPreview()">
                        <span><strong>${p.name}</strong> <small class="text-muted">(${p.category} • ${p.location})</small></span>
                    </div>
                    <span class="text-primary font-weight-bold">₹${p.estimatedCost}</span>
                </label>
            `).join('');
        }

        this.recalculateTripBudgetPreview();
    }

    onTripInterestsChange() {
        this.recalculateTripBudgetPreview();
    }

    recalculateTripBudgetPreview() {
        const previewContainer = document.getElementById('trip-budget-preview-content');
        if (!previewContainer) return;

        const budget = parseFloat(document.getElementById('trip-budget')?.value) || 20000;
        const days = parseInt(document.getElementById('trip-days')?.value) || 4;
        const travelers = parseInt(document.getElementById('trip-travelers')?.value) || 2;
        const destId = document.getElementById('trip-destination')?.value;

        const dest = this.destinations.find(d => d.id == destId);
        const baseDaily = (dest && dest.averageBudget) ? (dest.averageBudget / 3.0) : 2500;

        const rooms = Math.ceil(travelers / 2);
        const stayCost = Math.round(Math.max(1200, baseDaily * 0.38) * rooms * days);
        const foodCost = Math.round(700 * travelers * days);
        const transportCost = Math.round((600 + (travelers > 2 ? (travelers - 2) * 150 : 0)) * days);
        
        // Count selected places
        let placesCost = 0;
        const checkedPlaces = document.querySelectorAll('input[name="selected-trip-places"]:checked');
        if (checkedPlaces.length > 0) {
            checkedPlaces.forEach(cb => {
                const place = this.places.find(p => p.id == cb.value);
                if (place) placesCost += (place.estimatedCost * travelers);
            });
        } else {
            placesCost = Math.round(350 * travelers * days);
        }

        const activitiesCost = Math.round(500 * travelers * Math.max(1, days - 1));
        const otherCost = Math.round(250 * travelers * days);
        const totalEstimated = stayCost + foodCost + transportCost + placesCost + activitiesCost + otherCost;
        const surplus = budget - totalEstimated;
        const isWithin = surplus >= 0;

        previewContainer.innerHTML = `
            <div class="budget-metric-row"><span>🏨 Accommodation (${rooms} room/s)</span><strong>₹${stayCost.toLocaleString()}</strong></div>
            <div class="budget-metric-row"><span>🍲 Food & Dining</span><strong>₹${foodCost.toLocaleString()}</strong></div>
            <div class="budget-metric-row"><span>🚕 Local Transport</span><strong>₹${transportCost.toLocaleString()}</strong></div>
            <div class="budget-metric-row"><span>🎟️ Tourist Attractions</span><strong>₹${placesCost.toLocaleString()}</strong></div>
            <div class="budget-metric-row"><span>🧗 Activities & Guides</span><strong>₹${activitiesCost.toLocaleString()}</strong></div>
            <div class="budget-metric-row"><span>🛍️ Miscellaneous / Buffer</span><strong>₹${otherCost.toLocaleString()}</strong></div>
            
            <div class="budget-total-box">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>Total Estimated Cost:</span>
                    <strong style="font-size: 1.15rem; color: #fff;">₹${totalEstimated.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Allocated Budget:</span>
                    <strong>₹${budget.toLocaleString()}</strong>
                </div>
                <div class="budget-status-pill ${isWithin ? 'budget-status-within' : 'budget-status-over'}">
                    <i class="fa-solid ${isWithin ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> 
                    ${isWithin ? `WITHIN BUDGET (₹${surplus.toLocaleString()} remaining)` : `OVER BUDGET (Exceeds by ₹${Math.abs(surplus).toLocaleString()})`}
                </div>
            </div>
        `;
    }

    async handleCreateTrip(event) {
        event.preventDefault();
        if (!this.isAuthenticated()) {
            this.openAuthModal('login');
            this.showToast('Please login to save your trip!', 'warning');
            return;
        }

        const destinationId = parseInt(document.getElementById('trip-destination').value);
        const travelDate = document.getElementById('trip-date').value;
        const numberOfDays = parseInt(document.getElementById('trip-days').value);
        const numberOfTravelers = parseInt(document.getElementById('trip-travelers').value);
        const budget = parseFloat(document.getElementById('trip-budget').value);

        const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
        const interests = Array.from(interestCheckboxes).map(cb => cb.value).join(', ');

        const placesChecked = document.querySelectorAll('input[name="selected-trip-places"]:checked');
        const places = Array.from(placesChecked).map((cb, idx) => ({
            placeId: parseInt(cb.value),
            visitDay: (idx % numberOfDays) + 1,
            notes: 'Planned visit'
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    destinationId,
                    travelDate,
                    numberOfDays,
                    numberOfTravelers,
                    budget,
                    interests,
                    places
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create trip');

            this.showToast('Trip created and saved successfully!', 'success');
            await this.loadUserTrips();
            this.showSection('my-trips');
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    /* ================= MY TRIPS & DASHBOARD ================= */
    async loadUserTrips() {
        if (!this.isAuthenticated()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/trips`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to load trips');
            this.myTrips = await res.json();
            this.renderMyTrips();
            this.renderDashboard();
        } catch (err) {
            console.error(err);
        }
    }

    renderMyTrips() {
        const grid = document.getElementById('my-trips-grid');
        if (!grid) return;

        // Update counts
        const allCount = this.myTrips.length;
        const plannedCount = this.myTrips.filter(t => t.status === 'PLANNED').length;
        const ongoingCount = this.myTrips.filter(t => t.status === 'ONGOING').length;
        const compCount = this.myTrips.filter(t => t.status === 'COMPLETED').length;

        const elAll = document.getElementById('count-all-trips');
        const elPlanned = document.getElementById('count-planned-trips');
        const elOngoing = document.getElementById('count-ongoing-trips');
        const elComp = document.getElementById('count-completed-trips');

        if (elAll) elAll.textContent = allCount;
        if (elPlanned) elPlanned.textContent = plannedCount;
        if (elOngoing) elOngoing.textContent = ongoingCount;
        if (elComp) elComp.textContent = compCount;

        let filtered = this.myTrips;
        if (this.selectedTripFilter !== 'ALL') {
            filtered = filtered.filter(t => t.status === this.selectedTripFilter);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fa-solid fa-suitcase-rolling" style="font-size: 3rem; color: var(--text-subtle); margin-bottom: 16px;"></i>
                    <h3>No trips found</h3>
                    <p class="text-muted">You haven't planned any trips in this category yet.</p>
                    <button class="btn btn-primary mt-4" onclick="app.showSection('create-trip')"><i class="fa-solid fa-plus"></i> Create Your First Trip</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(t => {
            const dest = t.destination || {};
            const isWithin = t.isWithinBudget;
            return `
                <div class="trip-card">
                    <div class="card-image-wrap">
                        <img src="${dest.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" alt="${dest.name}">
                        <span class="trip-badge-status badge-${(t.status || 'PLANNED').toLowerCase()}">${t.status}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-title-row">
                            <h3>${dest.name || 'Trip'}</h3>
                            <span class="text-muted"><i class="fa-regular fa-calendar"></i> ${t.travelDate}</span>
                        </div>
                        <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 12px;">
                            ${t.numberOfDays} Days • ${t.numberOfTravelers} Traveler(s) • ${t.interests || 'General'}
                        </p>
                        
                        <div style="background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
                                <span>Budget: <strong>₹${t.budget?.toLocaleString()}</strong></span>
                                <span>Est. Cost: <strong class="${isWithin ? 'text-success' : 'text-danger'}">₹${t.estimatedCost?.toLocaleString()}</strong></span>
                            </div>
                            <div style="font-size: 0.8rem; font-weight: 700; color: ${isWithin ? '#10b981' : '#ef4444'};">
                                <i class="fa-solid ${isWithin ? 'fa-check' : 'fa-exclamation-triangle'}"></i> ${isWithin ? 'Within Budget' : 'Exceeds Budget'}
                            </div>
                        </div>

                        <div class="card-actions-group" style="margin-top: auto; justify-content: space-between;">
                            <button class="btn btn-sm btn-outline" onclick="app.viewTripDetails(${t.id})"><i class="fa-solid fa-eye"></i> Details</button>
                            <button class="btn btn-sm btn-ai" onclick="app.generateAiForTrip(${t.id})"><i class="fa-solid fa-brain"></i> AI Plan</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="app.deleteTrip(${t.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterMyTrips(filter, btn) {
        this.selectedTripFilter = filter;
        document.querySelectorAll('.trips-tab-bar .trip-tab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.renderMyTrips();
    }

    renderDashboard() {
        const totalTripsEl = document.getElementById('stat-total-trips');
        const totalBudgetEl = document.getElementById('stat-total-budget');
        const totalCostEl = document.getElementById('stat-total-cost');
        const netSavingsEl = document.getElementById('stat-net-savings');

        let totalBudget = 0;
        let totalCost = 0;

        this.myTrips.forEach(t => {
            totalBudget += (t.budget || 0);
            totalCost += (t.estimatedCost || 0);
        });

        const netSavings = totalBudget - totalCost;

        if (totalTripsEl) totalTripsEl.textContent = this.myTrips.length;
        if (totalBudgetEl) totalBudgetEl.textContent = `₹${totalBudget.toLocaleString()}`;
        if (totalCostEl) totalCostEl.textContent = `₹${totalCost.toLocaleString()}`;
        if (netSavingsEl) netSavingsEl.textContent = `₹${netSavings.toLocaleString()}`;

        // Render Recent Trips in Dashboard
        const dashTripsList = document.getElementById('dash-trips-list');
        if (dashTripsList) {
            if (this.myTrips.length === 0) {
                dashTripsList.innerHTML = `<p class="text-muted">No trips planned yet. Click "New Trip" to start!</p>`;
            } else {
                dashTripsList.innerHTML = this.myTrips.slice(0, 4).map(t => `
                    <div class="compact-trip-card">
                        <div class="compact-trip-left">
                            <img src="${t.destination?.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" class="compact-trip-thumb">
                            <div>
                                <strong>${t.destination?.name || 'Trip'} (${t.numberOfDays} Days)</strong>
                                <small class="text-muted" style="display: block;">Date: ${t.travelDate} • ₹${t.budget?.toLocaleString()}</small>
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline" onclick="app.viewTripDetails(${t.id})">View</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Recommended Destinations on Dashboard
        const dashRecDest = document.getElementById('dash-recommended-destinations');
        if (dashRecDest) {
            dashRecDest.innerHTML = this.destinations.slice(0, 3).map(d => `
                <div class="compact-trip-card">
                    <div class="compact-trip-left">
                        <img src="${d.imageUrl}" class="compact-trip-thumb">
                        <div>
                            <strong>${d.name}</strong>
                            <small class="text-muted" style="display: block;">Avg: ₹${d.averageBudget?.toLocaleString()}</small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary" onclick="app.startTripWithDestination(${d.id})">Plan</button>
                    </div>
                </div>
            `).join('');
        }
    }

    async viewTripDetails(tripId) {
        try {
            const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch trip details');
            const trip = await res.json();
            this.showTripDetailsModal(trip);
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    showTripDetailsModal(trip) {
        const modal = document.getElementById('trip-modal');
        const container = document.getElementById('trip-modal-content');
        if (!container) return;

        const dest = trip.destination || {};
        const isWithin = trip.isWithinBudget;
        const breakdown = trip.budgetBreakdown || {};

        // Group places by visit day
        const placesByDay = {};
        (trip.places || []).forEach(p => {
            const day = p.visitDay || 1;
            if (!placesByDay[day]) placesByDay[day] = [];
            placesByDay[day].push(p);
        });

        let itineraryHtml = '';
        for (let d = 1; d <= trip.numberOfDays; d++) {
            const dayPlaces = placesByDay[d] || [];
            itineraryHtml += `
                <div class="itinerary-day-box">
                    <div class="day-header">
                        <h4><i class="fa-solid fa-calendar-day text-primary"></i> Day ${d}</h4>
                        <button class="btn btn-sm btn-outline" onclick="app.openAddPlaceForTrip(${trip.id}, ${d})"><i class="fa-solid fa-plus"></i> Add Place</button>
                    </div>
                    <div class="timeline-events-list">
                        ${dayPlaces.length === 0 ? '<p class="text-muted">No tourist places scheduled for Day ' + d + '. Click "+ Add Place" to add sightseeing.</p>' : 
                        dayPlaces.map(p => `
                            <div class="timeline-event-card" style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${p.placeName} (${p.category})</strong>
                                    <small class="text-muted">${p.location} • Ticket: ₹${p.estimatedCost}</small>
                                    ${p.notes ? `<p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;"><i class="fa-solid fa-pen-nib"></i> ${p.notes}</p>` : ''}
                                </div>
                                <button class="btn btn-sm btn-outline-danger" onclick="app.removePlaceFromTrip(${trip.id}, ${p.id})"><i class="fa-solid fa-times"></i></button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div style="border-radius: var(--radius-lg); overflow: hidden; height: 200px; margin-bottom: 20px;">
                <img src="${dest.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div>
                    <h2>${dest.name}, ${dest.country}</h2>
                    <p class="text-muted">Travel Date: ${trip.travelDate} • ${trip.numberOfDays} Days • ${trip.numberOfTravelers} Travelers</p>
                </div>
                <span class="trip-badge-status badge-${(trip.status || 'PLANNED').toLowerCase()}" style="position: static;">${trip.status}</span>
            </div>

            <!-- Financial Breakdown Grid -->
            <div class="stats-grid" style="margin-bottom: 24px;">
                <div class="stat-card" style="padding: 16px;">
                    <span class="stat-label">Allocated Budget</span>
                    <h3>₹${trip.budget?.toLocaleString()}</h3>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <span class="stat-label">Estimated Expenses</span>
                    <h3 class="${isWithin ? 'text-success' : 'text-danger'}">₹${trip.estimatedCost?.toLocaleString()}</h3>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <span class="stat-label">Financial Status</span>
                    <h4 style="color: ${isWithin ? '#10b981' : '#ef4444'};">${isWithin ? 'WITHIN BUDGET' : 'OVER BUDGET'}</h4>
                </div>
            </div>

            <!-- Detailed Expense Matrix -->
            <div style="background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-md); padding: 18px; margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px;"><i class="fa-solid fa-receipt text-primary"></i> Estimated Expense Breakdown</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 0.9rem;">
                    <div>Stays: <strong>₹${breakdown.accommodationCost?.toLocaleString()}</strong></div>
                    <div>Food: <strong>₹${breakdown.foodCost?.toLocaleString()}</strong></div>
                    <div>Transport: <strong>₹${breakdown.transportationCost?.toLocaleString()}</strong></div>
                    <div>Attractions: <strong>₹${breakdown.touristPlacesCost?.toLocaleString()}</strong></div>
                    <div>Activities: <strong>₹${breakdown.activitiesCost?.toLocaleString()}</strong></div>
                    <div>Other / Buffer: <strong>₹${breakdown.otherExpenses?.toLocaleString()}</strong></div>
                </div>
            </div>

            <!-- Day-Wise Itinerary -->
            <h3 style="margin-bottom: 16px;"><i class="fa-solid fa-timeline text-primary"></i> Day-by-Day Sightseeing Itinerary</h3>
            ${itineraryHtml}

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                <button class="btn btn-outline" onclick="app.closeTripModal()">Close</button>
                <button class="btn btn-ai" onclick="app.closeTripModal(); app.generateAiForTrip(${trip.id})"><i class="fa-solid fa-brain"></i> Generate AI Itinerary</button>
            </div>
        `;

        if (modal) modal.classList.add('show');
    }

    closeTripModal() {
        const modal = document.getElementById('trip-modal');
        if (modal) modal.classList.remove('show');
    }

    async deleteTrip(tripId) {
        if (!confirm('Are you sure you want to delete this trip plan?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to delete trip');
            this.showToast('Trip deleted successfully', 'info');
            await this.loadUserTrips();
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    /* ================= ADD / REMOVE PLACES FROM TRIP ================= */
    quickAddPlaceModal(placeId, placeName) {
        if (!this.isAuthenticated()) {
            this.openAuthModal('login');
            this.showToast('Please login to add places to your trips', 'warning');
            return;
        }

        if (this.myTrips.length === 0) {
            this.showToast('You do not have any trips yet. Please create a trip first!', 'warning');
            this.showSection('create-trip');
            return;
        }

        const modal = document.getElementById('add-place-modal');
        document.getElementById('add-place-id').value = placeId;
        document.getElementById('add-place-name-display').value = placeName;
        
        // Select trip or prompt
        const firstTripId = this.myTrips[0].id;
        document.getElementById('add-place-trip-id').value = firstTripId;

        if (modal) modal.classList.add('show');
    }

    openAddPlaceForTrip(tripId, visitDay) {
        const trip = this.myTrips.find(t => t.id === tripId);
        const destPlaces = this.places.filter(p => p.destination && trip && p.destination.id === trip.destination.id);

        if (destPlaces.length === 0) {
            this.showToast('No places available for this destination', 'warning');
            return;
        }

        const modal = document.getElementById('add-place-modal');
        document.getElementById('add-place-trip-id').value = tripId;
        document.getElementById('add-place-visit-day').value = visitDay || 1;
        document.getElementById('add-place-id').value = destPlaces[0].id;
        document.getElementById('add-place-name-display').value = destPlaces[0].name;

        if (modal) modal.classList.add('show');
    }

    closeAddPlaceModal() {
        const modal = document.getElementById('add-place-modal');
        if (modal) modal.classList.remove('show');
    }

    async handleAddPlaceToTripSubmit(event) {
        event.preventDefault();
        const tripId = document.getElementById('add-place-trip-id').value;
        const placeId = document.getElementById('add-place-id').value;
        const visitDay = parseInt(document.getElementById('add-place-visit-day').value);
        const notes = document.getElementById('add-place-notes').value;

        try {
            const res = await fetch(`${API_BASE_URL}/trips/${tripId}/places`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ placeId: parseInt(placeId), visitDay, notes })
            });

            if (!res.ok) throw new Error('Failed to add place to trip');
            this.closeAddPlaceModal();
            this.showToast('Place added to trip itinerary!', 'success');
            await this.loadUserTrips();
            this.viewTripDetails(tripId);
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    async removePlaceFromTrip(tripId, tripPlaceId) {
        try {
            const res = await fetch(`${API_BASE_URL}/trips/${tripId}/places/${tripPlaceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to remove place');
            this.showToast('Place removed from trip', 'info');
            await this.loadUserTrips();
            this.viewTripDetails(tripId);
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    /* ================= RECOMMENDATIONS ================= */
    async fetchRecommendations() {
        const destId = document.getElementById('rec-destination').value;
        const budget = parseFloat(document.getElementById('rec-budget').value) || 20000;
        const days = parseInt(document.getElementById('rec-days').value) || 4;
        const travelers = parseInt(document.getElementById('rec-travelers').value) || 2;

        if (!destId) {
            this.showToast('Please select a destination', 'warning');
            return;
        }

        const interestBoxes = document.querySelectorAll('input[name="rec-interests"]:checked');
        const interests = Array.from(interestBoxes).map(cb => cb.value);

        const resultsContainer = document.getElementById('recommendation-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `<div class="text-center" style="padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i><p class="mt-4 text-muted">Running Recommendation Engine...</p></div>`;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinationId: parseInt(destId),
                    budget,
                    numberOfDays: days,
                    numberOfTravelers: travelers,
                    interests
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch recommendations');
            this.renderRecommendationResults(data);
        } catch (err) {
            if (resultsContainer) {
                resultsContainer.innerHTML = `<p class="text-danger text-center">${err.message}</p>`;
            }
        }
    }

    renderRecommendationResults(data) {
        const container = document.getElementById('recommendation-results');
        if (!container) return;

        const dest = data.destination || {};
        const places = data.recommendedPlaces || [];
        const breakdown = data.budgetBreakdown || {};
        const isWithin = breakdown.isWithinBudget;

        container.innerHTML = `
            <div class="plan-form-card" style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <span class="sub-badge">Recommendation Engine Output</span>
                        <h2>Curated Plan for ${dest.name}, ${dest.country}</h2>
                    </div>
                    <button class="btn btn-primary" onclick="app.startTripWithDestination(${dest.id})"><i class="fa-solid fa-plus"></i> Save as My Trip</button>
                </div>

                <!-- Budget Breakdown Pill -->
                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card">
                        <span class="stat-label">Budget</span>
                        <h3>₹${breakdown.totalBudget?.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Est. Cost</span>
                        <h3 class="${isWithin ? 'text-success' : 'text-danger'}">₹${breakdown.totalEstimatedCost?.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Feasibility</span>
                        <h4 style="color: ${isWithin ? '#10b981' : '#ef4444'};">${isWithin ? 'WITHIN BUDGET' : 'OVER BUDGET'}</h4>
                    </div>
                </div>

                <!-- Recommended Places Grid -->
                <h3 style="margin-bottom: 16px;"><i class="fa-solid fa-location-dot text-primary"></i> Recommended Tourist Places (${places.length})</h3>
                <div class="cards-grid" style="margin-bottom: 30px;">
                    ${places.map(p => `
                        <div class="place-card">
                            <div class="card-image-wrap" style="height: 160px;">
                                <img src="${p.imageUrl}">
                                <span class="place-category-badge">${p.category}</span>
                            </div>
                            <div class="card-body">
                                <h4>${p.name}</h4>
                                <small class="text-muted">${p.location}</small>
                                <div class="card-meta-row" style="margin-top: 10px;">
                                    <strong>₹${p.estimatedCost}</strong>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Curated Stays, Foods, Activities, Tips -->
                <div class="curated-tags-grid">
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-utensils"></i> Food Recommendations</h4>
                        <ul>${(data.recommendedFoods || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}</ul>
                    </div>
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-person-hiking"></i> Activities & Tours</h4>
                        <ul>${(data.recommendedActivities || []).map(a => `<li><i class="fa-solid fa-check"></i> ${a}</li>`).join('')}</ul>
                    </div>
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-hotel"></i> Stay Suggestions</h4>
                        <ul>${(data.accommodationSuggestions || []).map(s => `<li><i class="fa-solid fa-check"></i> ${s}</li>`).join('')}</ul>
                    </div>
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-lightbulb"></i> Travel Tips</h4>
                        <ul>${(data.travelTips || []).map(t => `<li><i class="fa-solid fa-check"></i> ${t}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= AI TRAVEL PLANNER ================= */
    async generateAiPlan() {
        const dest = document.getElementById('ai-destination').value.trim();
        const days = parseInt(document.getElementById('ai-days').value) || 4;
        const budget = parseFloat(document.getElementById('ai-budget').value) || 20000;
        const travelers = parseInt(document.getElementById('ai-travelers').value) || 2;
        const style = document.getElementById('ai-travel-style').value;
        const rawInterests = document.getElementById('ai-interests').value;
        const interests = rawInterests.split(',').map(s => s.trim()).filter(Boolean);

        if (!dest) {
            this.showToast('Please enter a destination', 'warning');
            return;
        }

        const btn = document.getElementById('ai-generate-btn');
        const resultsContainer = document.getElementById('ai-planner-results');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating AI Itinerary...`;
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `<div class="text-center" style="padding: 50px;"><i class="fa-solid fa-brain fa-fade fa-3x text-primary"></i><h3 class="mt-4">Trip Mate AI is crafting your personalized itinerary...</h3><p class="text-muted">Optimizing morning, afternoon, evening activities and financial allocations.</p></div>`;

        try {
            const res = await fetch(`${API_BASE_URL}/ai/travel-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: dest,
                    numberOfDays: days,
                    budget,
                    numberOfTravelers: travelers,
                    travelStyle: style,
                    interests
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'AI generation failed');
            this.renderAiPlanResults(data);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="text-danger text-center">${err.message}</p>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Travel Plan`;
        }
    }

    generateAiForTrip(tripId) {
        const trip = this.myTrips.find(t => t.id === tripId);
        if (!trip) return;

        this.showSection('ai-planner');
        document.getElementById('ai-destination').value = trip.destination?.name || 'Goa';
        document.getElementById('ai-days').value = trip.numberOfDays || 4;
        document.getElementById('ai-budget').value = trip.budget || 20000;
        document.getElementById('ai-travelers').value = trip.numberOfTravelers || 2;
        document.getElementById('ai-interests').value = trip.interests || 'Beaches, Food';

        this.generateAiPlan();
    }

    renderAiPlanResults(data) {
        const container = document.getElementById('ai-planner-results');
        if (!container) return;

        const breakdown = data.estimatedExpenses || {};
        const isWithin = breakdown.isWithinBudget;

        let daysHtml = (data.itinerary || []).map(day => `
            <div class="itinerary-day-box">
                <div class="day-header">
                    <div>
                        <h4><i class="fa-solid fa-calendar-day text-primary"></i> ${day.title}</h4>
                        <small class="text-muted">${day.theme}</small>
                    </div>
                    <span class="badge badge-primary">Est. Day Cost: ₹${day.estimatedDayCost?.toLocaleString()}</span>
                </div>
                <div class="timeline-events-list">
                    <div class="timeline-event-card">
                        <strong>🌅 Morning Schedule</strong>
                        <ul>${(day.morningActivities || []).map(a => `<li style="list-style: none; margin: 4px 0;"><i class="fa-regular fa-clock text-primary"></i> ${a}</li>`).join('')}</ul>
                    </div>
                    <div class="timeline-event-card">
                        <strong>☀️ Afternoon Sightseeing & Dining</strong>
                        <ul>${(day.afternoonActivities || []).map(a => `<li style="list-style: none; margin: 4px 0;"><i class="fa-regular fa-clock text-warning"></i> ${a}</li>`).join('')}</ul>
                    </div>
                    <div class="timeline-event-card">
                        <strong>🌙 Evening Sunset & Leisure</strong>
                        <ul>${(day.eveningActivities || []).map(a => `<li style="list-style: none; margin: 4px 0;"><i class="fa-regular fa-clock text-purple"></i> ${a}</li>`).join('')}</ul>
                    </div>
                    <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.08); border-radius: var(--radius-sm); font-size: 0.88rem;">
                        <strong>🍽️ Recommended Meals:</strong> ${day.recommendedMeals}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="plan-form-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <div class="ai-pill"><i class="fa-solid fa-robot"></i> ${data.aiModelUsed || 'AI Travel Engine'}</div>
                        <h2>${data.destination} Personalized Travel Blueprint</h2>
                        <p class="text-muted">${data.summary}</p>
                    </div>
                    <button class="btn btn-outline" onclick="window.print()"><i class="fa-solid fa-print"></i> Print / Export Itinerary</button>
                </div>

                <!-- Financial Feasibility Matrix -->
                <div class="stats-grid" style="margin-bottom: 28px;">
                    <div class="stat-card">
                        <span class="stat-label">User Budget</span>
                        <h3>₹${data.totalBudget?.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Total Estimated Cost</span>
                        <h3 class="${isWithin ? 'text-success' : 'text-danger'}">₹${data.estimatedTotalCost?.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Budget Status</span>
                        <h4 style="color: ${isWithin ? '#10b981' : '#ef4444'};">${isWithin ? 'WITHIN BUDGET' : 'OVER BUDGET'}</h4>
                    </div>
                </div>

                <!-- Day-by-Day Itinerary -->
                <h3 style="margin-bottom: 18px;"><i class="fa-solid fa-timeline text-primary"></i> Day-by-Day Comprehensive Itinerary</h3>
                ${daysHtml}

                <!-- Food, Activities, Accommodation, Tips Grid -->
                <div class="curated-tags-grid">
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-utensils"></i> Signature Foods to Taste</h4>
                        <ul>${(data.foodRecommendations || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}</ul>
                    </div>
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-person-hiking"></i> Key Activities & Experiences</h4>
                        <ul>${(data.activityRecommendations || []).map(a => `<li><i class="fa-solid fa-check"></i> ${a}</li>`).join('')}</ul>
                    </div>
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-hotel"></i> Recommended Accommodations</h4>
                        <ul>${(data.accommodationSuggestions || []).map(s => `<li><i class="fa-solid fa-check"></i> ${s}</li>`).join('')}</ul>
                    </div>
                    <div class="curated-card">
                        <h4><i class="fa-solid fa-lightbulb"></i> Practical Travel Tips</h4>
                        <ul>${(data.travelTips || []).map(t => `<li><i class="fa-solid fa-check"></i> ${t}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================= PROFILE MANAGEMENT ================= */
    async handleUpdateProfile(event) {
        event.preventDefault();
        const name = document.getElementById('profile-name').value.trim();
        const password = document.getElementById('profile-new-password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            this.currentUser.name = data.name;
            localStorage.setItem('tm_user', JSON.stringify(this.currentUser));
            this.updateAuthUI();
            this.showToast('Profile updated successfully!', 'success');
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    async handleDeleteAccount() {
        if (!confirm('Are you sure you want to permanently delete your Trip Mate account? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${this.currentUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to delete account');
            this.showToast('Account deleted', 'info');
            this.logout();
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    /* ================= TOAST NOTIFICATIONS ================= */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-circle-xmark';
        if (type === 'warning') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Global Application Instance
const app = new TripMateApp();
