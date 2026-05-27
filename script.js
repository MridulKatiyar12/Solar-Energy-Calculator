// ===============================
// GREEN SPARK ENERGY - SCRIPT.JS
// ===============================


// -------------------------------
// 1. INIT LEAFLET MAP
// -------------------------------
let map;
let marker;

function initMap() {
    // Check if map div exists
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
        console.error("Map container not found!");
        return;
    }

    // Initialize map
    map = L.map('map').setView([28.6139, 77.2090], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Default marker
    marker = L.marker([28.6139, 77.2090]).addTo(map)
        .bindPopup("Select Your Rooftop Location")
        .openPopup();

    // Click event to move marker
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;

        if (marker) {
            marker.setLatLng([lat, lng]);
        }

        marker.bindPopup(`Selected Location<br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`).openPopup();
    });
}


// -------------------------------
// 2. GEOCODE ADDRESS (Basic API - Nominatim)
// -------------------------------
async function geocodeAddress() {
    const address = document.getElementById("address").value;

    if (!address) {
        alert("Please enter an address");
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
        );

        const data = await response.json();

        if (data.length === 0) {
            alert("Location not found!");
            return;
        }

        const lat = data[0].lat;
        const lon = data[0].lon;

        map.setView([lat, lon], 16);

        if (marker) {
            marker.setLatLng([lat, lon]);
        } else {
            marker = L.marker([lat, lon]).addTo(map);
        }

        marker.bindPopup("Address Location").openPopup();

    } catch (error) {
        console.error(error);
        alert("Error finding location");
    }
}


// -------------------------------
// 3. SOLAR CALCULATION
// -------------------------------
function calculateSolar() {

    const name = document.getElementById('name')?.value || "";
    const email = document.getElementById('email')?.value || "";
    const phone = document.getElementById('phone')?.value || "";
    const country = document.getElementById('country')?.value || "";
    const address = document.getElementById('address')?.value || "";
    const area = parseFloat(document.getElementById('area')?.value || 0);

    if (!area || area <= 0) {
        alert("Please enter valid roof area");
        return;
    }

    // -------------------------------
    // FORMULA (you can upgrade later)
    // 1 sq.m = 0.15 kW
    // cost = ₹50,000 per kW
    // -------------------------------
    const estimatedPower = area * 0.15;
    const estimatedCost = estimatedPower * 50000;

    // Send to backend (optional)
    fetch('http://localhost:3000/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            email,
            phone,
            country,
            address,
            area,
            estimatedPower,
            estimatedCost
        })
    }).catch(err => console.warn("Backend not connected:", err));

    // Show results
    document.getElementById('results').innerHTML = `
        <h3>☀️ Solar Calculation Result</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Country:</b> ${country}</p>
        <p><b>Address:</b> ${address}</p>
        <p><b>Roof Area:</b> ${area} sq.m</p>
        <hr>
        <p><b>Estimated Power:</b> ${estimatedPower.toFixed(2)} kW</p>
        <p><b>Estimated Cost:</b> ₹${estimatedCost.toLocaleString()}</p>
    `;
}


// -------------------------------
// 4. QUOTE FORM REDIRECT FIX
// -------------------------------
function handleQuoteSubmit(event) {
    event.preventDefault();
    window.location.href = "plans.html";
}


// -------------------------------
// 5. INITIALIZE WHEN PAGE LOADS
// -------------------------------
window.onload = function () {
    initMap();
};
