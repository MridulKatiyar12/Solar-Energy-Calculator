
// =====================
// GREEN SPARK ENERGY SAFE JS
// =====================

let map = null;
let marker = null;


// ---------------------
// INIT MAP SAFELY
// ---------------------
function initMap() {

    const mapContainer = document.getElementById("map");

    if (!mapContainer) {
        console.warn("Map not found, skipping map init");
        return;
    }

    // If Leaflet not loaded
    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded!");
        return;
    }

    setTimeout(() => {

        map = L.map('map').setView([28.6139, 77.2090], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        marker = L.marker([28.6139, 77.2090]).addTo(map)
            .bindPopup("Green Spark Energy")
            .openPopup();

        setTimeout(() => {
            map.invalidateSize();
        }, 500);

    }, 300);
}


// ---------------------
// GEOCODE ADDRESS
// ---------------------
async function geocodeAddress() {

    try {

        const address = document.getElementById("address").value;
        if (!address) return alert("Enter address");

        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        const data = await res.json();

        if (!data.length) return alert("Location not found");

        const lat = data[0].lat;
        const lon = data[0].lon;

        map.setView([lat, lon], 16);

        if (marker) {
            marker.setLatLng([lat, lon]);
        } else {
            marker = L.marker([lat, lon]).addTo(map);
        }

        marker.bindPopup("Selected Location").openPopup();

    } catch (err) {
        console.error(err);
        alert("Geocode error");
    }
}


// ---------------------
// SOLAR CALCULATOR
// ---------------------
function calculateSolar() {

    const areaInput = document.getElementById("area");

    if (!areaInput) return alert("Area input missing");

    const area = parseFloat(areaInput.value);

    if (!area || area <= 0) {
        return alert("Enter valid roof area");
    }

    const power = area * 0.15;
    const cost = power * 50000;

    document.getElementById("results").innerHTML = `
        <h3>Solar Result</h3>
        <p>Power: ${power.toFixed(2)} kW</p>
        <p>Cost: ₹${cost.toLocaleString()}</p>
    `;
}


// ---------------------
// QUOTE FORM
// ---------------------
function handleQuoteSubmit(e) {
    e.preventDefault();
    window.location.href = "plans.html";
}


// ---------------------
// INIT AFTER PAGE LOAD
// ---------------------
window.addEventListener("load", () => {
    initMap();
});
