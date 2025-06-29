import { makeReservation, getAvailableSlots } from './api.js';

export async function initReservationSystem() {
    const panel = document.getElementById('reservation-panel');
    
    // Render skeleton first
    panel.innerHTML = `
        <div class="reservation-card">
            <div class="skeleton-loading" style="height: 30px; width: 60%; margin-bottom: 20px;"></div>
            
            <form id="reservation-form">
                <div class="form-group">
                    <div class="skeleton-loading" style="height: 20px; width: 30%; margin-bottom: 8px;"></div>
                    <div class="skeleton-loading" style="height: 40px; width: 100%;"></div>
                </div>
                
                <div class="form-group">
                    <div class="skeleton-loading" style="height: 20px; width: 30%; margin-bottom: 8px;"></div>
                    <div class="skeleton-loading" style="height: 40px; width: 100%;"></div>
                </div>
                
                <div class="form-group">
                    <div class="skeleton-loading" style="height: 20px; width: 30%; margin-bottom: 8px;"></div>
                    <div class="skeleton-loading" style="height: 40px; width: 100%;"></div>
                </div>
                
                <div class="skeleton-loading" style="height: 50px; width: 100%; margin-top: 20px;"></div>
            </form>
        </div>
    `;
    
    try {
        // Load data
        const slots = await getAvailableSlots();
        
        // Render actual content
        panel.innerHTML = `
            <div class="reservation-card slide-up">
                <h2><i class="fas fa-calendar-check"></i> Reserve Your Spot</h2>
                
                <form id="reservation-form">
                    <div class="form-group">
                        <label for="reservation-date"><i class="far fa-calendar-alt"></i> Date</label>
                        <input type="date" id="reservation-date" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reservation-time"><i class="far fa-clock"></i> Time Slot</label>
                        <select id="reservation-time" required>
                            <option value="">Select a time</option>
                            ${slots.map(slot => `
                                <option value="${slot.time}" ${slot.available ? '' : 'disabled'}>
                                    ${slot.time} ${slot.available ? '✅' : '❌'}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="vehicle-type"><i class="fas fa-car"></i> Vehicle Type</label>
                        <select id="vehicle-type" required>
                            <option value="standard">Standard</option>
                            <option value="large">Large</option>
                            <option value="electric">Electric (with charging)</option>
                            <option value="disabled">Accessible Parking</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <span class="btn-content">Reserve Now</span>
                        <span class="btn-loader hidden">
                            <i class="fas fa-spinner fa-spin"></i>
                        </span>
                    </button>
                </form>
            </div>
        `;
        
        // Add form submission handler
        document.getElementById('reservation-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleReservation();
        });
        
    } catch (error) {
        panel.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load reservation system</h3>
                <p>${error.message}</p>
                <button id="retry-loading" class="btn-secondary">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>
        `;
        
        document.getElementById('retry-loading').addEventListener('click', initReservationSystem);
    }
}

async function handleReservation() {
    const form = document.getElementById('reservation-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnContent = submitBtn.querySelector('.btn-content');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    btnContent.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    submitBtn.disabled = true;
    
    const formData = {
        date: form.querySelector('#reservation-date').value,
        time: form.querySelector('#reservation-time').value,
        vehicleType: form.querySelector('#vehicle-type').value
    };
    
    try {
        const result = await makeReservation(formData);
        showConfirmation(result);
    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button
        btnContent.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

function showConfirmation(reservation) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
        <div class="confirmation-content">
            <div class="confetti-container"></div>
            <div class="checkmark">
                <svg class="checkmark__circle" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" fill="none"></circle>
                </svg>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"></path>
            </div>
            <h3>Reservation Confirmed!</h3>
            <p>Your parking spot #${reservation.spotNumber} is ready for ${reservation.date} at ${reservation.time}</p>
            <div class="reservation-details">
                <p><strong>Confirmation Code:</strong> ${reservation.confirmationCode}</p>
                <p><strong>Vehicle Type:</strong> ${reservation.vehicleType}</p>
            </div>
            <button class="btn-primary" id="close-confirmation">Done</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add confetti
    generateConfetti(modal.querySelector('.confetti-container'));
    
    // Close button
    modal.querySelector('#close-confirmation').addEventListener('click', () => {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
    });
}

function generateConfetti(container) {
    const colors = ['#4361ee', '#3f37c9', '#4cc9f0', '#4ad66d', '#f8961e'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${Math.random() * 8 + 4}px`;
        confetti.style.height = `${Math.random() * 8 + 4}px`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confetti);
    }
}