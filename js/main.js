import { initParkingScene } from './parking3d.js';
import { initReservationSystem } from './reservation.js';
import { loadUserData } from './api.js';

class ParkingApp {
    constructor() {
        this.user = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.renderBaseLayout();
        
        try {
            this.user = await loadUserData();
            this.updateUI();
            
            // Initialize modules with loading states
            await Promise.all([
                this.initParkingSceneWithLoader(),
                this.initReservationWithLoader()
            ]);
            
        } catch (error) {
            this.showError(error);
        } finally {
            this.hideLoading();
        }
        
        this.setupEventListeners();
    }

    async renderBaseLayout() {
        // Inject header with loading state
        document.getElementById('header').innerHTML = `
            <div class="header-container">
                <div class="logo ${this.isLoading ? 'skeleton-loading' : ''}">
                    <i class="fas fa-car"></i>
                    <span>3DPark Pro</span>
                </div>
                <nav class="${this.isLoading ? 'skeleton-loading' : ''}">
                    ${this.isLoading ? 
                        '<div style="width:300px; height:40px;"></div>' : 
                        `<ul>
                            <li><a href="#" data-section="home">Home</a></li>
                            <li><a href="#" data-section="reservation">Reserve</a></li>
                            <li><a href="#" data-section="account">My Account</a></li>
                            ${this.user ? 
                                `<li><button id="logout-btn">Logout</button></li>` : 
                                `<li><button id="login-btn">Login</button></li>`
                            }
                        </ul>`
                    }
                </nav>
            </div>
        `;
    }

    async initParkingSceneWithLoader() {
        const container = document.getElementById('parking-visualization');
        container.innerHTML = `
            <div class="scene-loading">
                <div class="loading-spinner"></div>
                <p>Loading 3D environment...</p>
                <div class="loading-bar-container">
                    <div class="loading-bar"></div>
                </div>
            </div>
        `;
        
        // Simulate loading progress
        const progressBar = container.querySelector('.loading-bar');
        const progressInterval = setInterval(() => {
            const width = parseFloat(progressBar.style.width) || 0;
            progressBar.style.width = `${width + 10}%`;
        }, 300);
        
        try {
            await initParkingScene();
            
            // Add entrance animation
            container.querySelector('canvas').classList.add('car-entrance');
        } finally {
            clearInterval(progressInterval);
        }
    }

    async initReservationWithLoader() {
        const panel = document.getElementById('reservation-panel');
        panel.innerHTML = `
            <div class="reservation-loading">
                <div class="loading-spinner"></div>
                <p>Loading reservation system...</p>
            </div>
        `;
        
        await initReservationSystem();
        
        // Add fade-in animation
        panel.querySelector('.reservation-card').style.animation = 'fadeIn 0.8s ease-out';
    }

    showLoading() {
        this.isLoading = true;
        document.body.classList.add('loading');
        
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="fullpage-loader">
                <div class="loader-content">
                    <div class="loading-spinner large"></div>
                    <h3>Loading Parking System</h3>
                    <p>Please wait while we prepare your experience</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        this.isLoading = false;
        document.body.classList.remove('loading');
        
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }

    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-notification';
        errorEl.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button class="close-error"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        document.body.appendChild(errorEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorEl.classList.add('fade-out');
            setTimeout(() => errorEl.remove(), 300);
        }, 5000);
        
        // Manual close
        errorEl.querySelector('.close-error').addEventListener('click', () => {
            errorEl.classList.add('fade-out');
            setTimeout(() => errorEl.remove(), 300);
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new ParkingApp();
});