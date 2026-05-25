(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            }
        }
    });


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });
    
})(jQuery);


//leaflet map

let map;
let drawnLayer;
let drawControl;
let polygonArea = 0;
//map API key
function initMap() {
  map = L.map('map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=pNVuAgOV36x8IV8GxZvE', {
    attribution: '&copy; MapTiler & OpenStreetMap contributors',
    maxZoom: 22
  }).addTo(map);

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  drawControl = new L.Control.Draw({
    draw: {
      polygon: true,
      marker: false,
      circle: false,
      rectangle: false,
      polyline: false,
      circlemarker: false
    },
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    drawnItems.clearLayers();
    const layer = e.layer;
    drawnItems.addLayer(layer);
    drawnLayer = layer;
    polygonArea = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) / 1e6 * 10000;
    document.getElementById('area').value = polygonArea.toFixed(2);
  });
}

function geocodeAddress() {
  const address = document.getElementById('address').value;
  if (!address) return alert("Please enter an address");

  fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return alert("Location not found.");
      const place = data[0];
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      map.setView([lat, lon], 21);
      L.marker([lat, lon]).addTo(map).bindPopup(place.display_name).openPopup();
    })
    .catch(() => alert("Failed to fetch location. Try a different address."));
}

function getCurrencySymbol(country) {
  switch (country) {
    case 'USA': return '$';
    case 'UK': return '£';
    case 'Australia': return 'A$';
    case 'Canada': return 'C$';
    default: return '₹';
  }
}

function calculateSolar() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const country = document.getElementById('country').value;
  const manualArea = parseFloat(document.getElementById('area').value);
  const area = polygonArea > 0 ? polygonArea : (isNaN(manualArea) ? 0 : manualArea);
  const currency = getCurrencySymbol(country);

  if (!name || !email || !phone || !country || area <= 0) {
    alert('Please fill all fields and provide a valid area.');
    return;
  }

  const kw = area / 10;
  const cost = kw * 50000;
  const dailyGen = kw * 4;
  const annualGen = dailyGen * 365;
  const moneySaved = annualGen * 7;
  const co2Saved = annualGen * 0.92;
  const roi = cost / moneySaved;

  const resultHTML = `
    <h3>Solar Report for ${name}</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Country:</strong> ${country}</p>
    <p><strong>Roof Area:</strong> ${area.toFixed(2)} sq.m</p>
    <p><strong>System Size:</strong> ${kw.toFixed(2)} kW</p>
    <p><strong>Installation Cost:</strong> ${currency}${cost.toLocaleString()}</p>
    <p><strong>Daily Power Generation:</strong> ${dailyGen.toFixed(2)} units</p>
    +
    <p><strong>Annual Power Generation:</strong> ${annualGen.toFixed(0)} units</p>
    <p><strong>Estimated Money Saved/Year:</strong> ${currency}${moneySaved.toLocaleString()}</p>
    <p><strong>CO₂ Saved/Year:</strong> ${co2Saved.toFixed(0)} kg</p>
    <p><strong>ROI:</strong> ${roi.toFixed(1)} years</p>
  `;

  document.getElementById('results').innerHTML = resultHTML;
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const resultText = document.getElementById('results').innerText;
  doc.text(resultText, 10, 10);
  doc.save("Solar_Report.pdf");
}

window.onload = initMap;



function submitQuoteForm() {
  const data = {
    name: document.getElementById('quoteName').value,
    email: document.getElementById('quoteEmail').value,
    mobile: document.getElementById('quoteMobile').value,
    service: document.getElementById('quoteService').value,
    note: document.getElementById('quoteNote').value,
  };

  fetch('http://localhost:3000/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(alert);
}
