const API_BASE_URL = 'https://api.yourparkingsystem.com/v1';

export async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        return null;
    }
}

export async function getAvailableSlots(date = new Date()) {
    const response = await fetch(`${API_BASE_URL}/slots?date=${date.toISOString()}`);
    return await response.json();
}

export async function makeReservation(reservationData) {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
    });
    return await response.json();
}