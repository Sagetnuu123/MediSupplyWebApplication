document.addEventListener("DOMContentLoaded", function () {
    if (typeof L === "undefined") {
        console.error("Leaflet library failed to load. Check the script URL or network connection.");
        return;
    }

    const findPharmacyBtn = document.querySelector(".cta-btn");
    const mapSection = document.getElementById("map-section");

    let map;

    if (findPharmacyBtn) {
        findPharmacyBtn.addEventListener("click", function () {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async function (position) {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;

                    

                    console.log("Latitude:", userLat, "Longitude:", userLng);
                    console.log("Accuracy:", accuracy, "meters");

                    mapSection.style.display = "flex";
                    mapSection.style.height = "650px";
                    document.getElementById("pharmacy-info").style.display = "block";

                    let mapContainer = document.getElementById("map");
                    if (!mapContainer) {
                        mapContainer = document.createElement("div");
                        mapContainer.id = "map";
                        mapContainer.style = "width: 100%; height: 100%; margin-top: 20px;";
                        document.body.appendChild(mapContainer);
                    } else {
                        mapContainer.innerHTML = "";
                    }

                    if (map) {
                        map.remove();
                    }

                    // Initialize the map centered on the user's location
                    map = L.map("map").setView([userLat, userLng], 14); // Center map on user

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: "© OpenStreetMap contributors",
                    }).addTo(map);

                    const greenIcon = new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    // Add a marker for the user's location
                    L.marker([userLat, userLng], { icon: greenIcon })
                        .addTo(map)
                        .bindPopup("You're location.")
                        .openPopup();

                    // Fetch and display pharmacies
                    let pharmacies = await fetchPharmacies();
                    if (!pharmacies.length) {
                        alert("No registered pharmacies found nearby.");
                        return;
                    }

                    pharmacies.forEach(pharmacy => {
                        pharmacy.distance = calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
                    });

                    pharmacies.sort((a, b) => a.distance - b.distance);

                    pharmacies.forEach((pharmacy) => {
                        L.marker([pharmacy.latitude, pharmacy.longitude])
                            .addTo(map)
                            .bindPopup(`<strong>${pharmacy.name}</strong><br>${pharmacy.address}<br><strong>Distance:</strong> ${pharmacy.distance.toFixed(2)} km`);
                    });

                    displayPharmacyInfo(pharmacies);
                    mapSection.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                },
                function () {
                    alert("Please enable location services to find nearby pharmacies.");
                }
            );
        });
    }
});


async function fetchPharmacies() {
    const snapshot = await db.collection("register_pharmacy")
        .where("status", "==", "Registered")
        .get();

    return snapshot.docs.map(doc => ({
        name: doc.data().pharmacy_name,
        address: `${doc.data().street}, ${doc.data().municipality}, ${doc.data().province}`,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
        picture: doc.data().med_picture,
        opening_time: doc.data().start,
        closing_time: doc.data().close,
        days_open_from: doc.data().days_open_from,
        days_open_to: doc.data().days_open_to,
        email: doc.data().email
    }));
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Return distance in km
}

let isLoggedIn = false;

function displayPharmacyInfo(pharmacies) {
    const pharmacyCardsContainer = document.getElementById("pharmacy-cards");
    pharmacyCardsContainer.innerHTML = "";

    pharmacies.forEach((pharmacy, index) => {
        const card = document.createElement("div");
        card.classList.add("pharmacy-card");

        card.innerHTML = `
            <div style="display: flex; gap: 15px;">
                <img src="${pharmacy.picture}" alt="Pharmacy Image">
                <div>
                    <h4>${index + 1}. ${pharmacy.name}</h4>
                    <div class="info-label">Open:</div>
                    <div class="info-text">${pharmacy.opening_time} to ${pharmacy.closing_time} | ${pharmacy.days_open_from} to ${pharmacy.days_open_to}</div>
                    <div class="info-label">Location:</div>
                    <div class="info-text">${pharmacy.address}</div>
                    <div class="info-label">Distance:</div>
                    <div class="info-text">${pharmacy.distance.toFixed(2)} km away</div>
                    <button class="see-medicine-btn" data-pharmacy-name="${pharmacy.name}" data-pharmacy-email="${pharmacy.email}" data-pharmacy-picture="${pharmacy.picture}"> <i class='bx bx-store' style="margin-right: 8px;"></i>Go To Shop</button>
                </div>
            </div>
        `;

        pharmacyCardsContainer.appendChild(card);
    });
    const buttons = document.querySelectorAll('.see-medicine-btn');
    buttons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const pharmacyName = event.target.getAttribute('data-pharmacy-name');
            const pharmacyEmail = event.target.getAttribute('data-pharmacy-email');
            const pharmacyPicture = event.target.getAttribute('data-pharmacy-picture');
            await displayMedicines(pharmacyEmail, pharmacyName, pharmacyPicture);
        });
    });
}


document.addEventListener("DOMContentLoaded", function () {
    const pharmacySearchInput = document.getElementById("pharmacy-search");
    const clearSearchButton = document.getElementById("clear-search");
    const noResultsMessage = document.getElementById("no-results-message");

    // Function to filter pharmacy cards based on the search query
    function filterPharmacies(query) {
        const pharmacyCards = document.querySelectorAll(".pharmacy-card");
        let resultsFound = false;

        pharmacyCards.forEach(card => {
            const pharmacyName = card.querySelector("h4").textContent.toLowerCase();
            if (pharmacyName.includes(query.toLowerCase())) {
                card.style.display = "block";
                resultsFound = true;
            } else {
                card.style.display = "none";
            }
        });

        // Display the "No results found" message if no matches
        if (resultsFound) {
            noResultsMessage.style.display = "none";
        } else {
            noResultsMessage.style.display = "block";
        }
    }

    // Event listener for the search input field
    pharmacySearchInput.addEventListener("input", function () {
        filterPharmacies(pharmacySearchInput.value);
        clearSearchButton.style.display = pharmacySearchInput.value ? "block" : "none";
    });

    // Event listener for the clear button
    clearSearchButton.addEventListener("click", function () {
        pharmacySearchInput.value = "";
        filterPharmacies("");
        clearSearchButton.style.display = "none";
    });
});


function openAuthModal() {
    const authmodal = document.getElementById("authModal");
    authmodal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

// Close modal when clicking the close button
const closeauthModal = document.querySelector(".close-modal");
closeauthModal.onclick = () => {
    const authmodal = document.getElementById("authModal");
    authmodal.style.display = "none";
    document.body.style.overflow = "auto";
};

// Prevent closing the modal when clicking outside of it
const authmodal = document.getElementById("authModal");
authmodal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-overlay")) {
        return; // Do nothing
    }
});



async function displayMedicines(pharmacyEmail, pharmacyName, pharmacyPicture) {
    const snapshot = await db.collection("post_medicine_storage")
        .where("pharmacyEmail", "==", pharmacyEmail)
        .where("pharmacyName", "==", pharmacyName)
        .get();

    const medicines = snapshot.docs.map(doc => doc.data());

    if (medicines.length === 0) {
        showNoMedicinesMessage();
    } else {
        showMedicineModal(medicines, pharmacyName, pharmacyPicture, pharmacyEmail);
    }
}

function showMedicineModal(medicines, pharmacyName, pharmacyPicture, pharmacyEmail) {
    const modal = document.getElementById("medicine-modal");
    const modalContent = document.getElementById("modal-content");

    modalContent.innerHTML = `
            <div class="pharmacy-header-bar">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${pharmacyPicture}" alt="Pharmacy Image" style="width: 35px; height: 35px; object-fit: cover; border-radius: 8px;">
                    <h3 class="pharmacy-name-display">${pharmacyName} - Medicine Products</h3>
                </div>
                <button class="see-info-btn">
                <i class='bx bx-info-circle' style="margin-right: 6px;"></i>
                See More Pharmacy Info
                </button>
            </div>
            <div class="medicine-modal-header">
                <div class="search-bar-wrapper">
                    <input type="text" id="searchInput" class="search-bar" placeholder="Search for a medicine...">
                    <span id="clearSearchBtn" class="clear-search-btn" title="Clear">×</span>
                </div>
                <select id="filterCategory" class="filter-dropdown">
                    <option value="all">All Categories</option>
                </select>
            </div>
            <div class="medicine-cards-container"></div>
    `;

    const cardsContainer = modalContent.querySelector(".medicine-cards-container");

    // Populate category filter dropdown dynamically
    const categorySet = new Set(medicines.map(med => med.medicineCategory));
    const filterSelect = document.getElementById("filterCategory");
    categorySet.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });

    function renderCards(filteredMedicines) {
        cardsContainer.innerHTML = "";

        if (filteredMedicines.length === 0) {
            cardsContainer.innerHTML = `<div class="no-medicines-message"><p>No matching medicines found.</p></div>`;
            return;
        }

        filteredMedicines.forEach(medicine => {
            const medicineCard = document.createElement("div");
            medicineCard.classList.add("medicine-card");

            const prescriptionTag = medicine.prescriptionRequired === 'Yes'
                ? `<span class="prescription-required">PRESCRIPTION REQUIRED</span>`
                : '';

            medicineCard.innerHTML = `
                ${prescriptionTag}
                <img src="${medicine.medicineImageBase64}" alt="${medicine.brandName}" class="medicine-img">
                <div class="medicine-info">
                    <div class="medicine-header">
                        <h5 class="brand-name">${medicine.brandName}</h5>
                        <span class="price">₱${medicine.sellingPrice}</span>
                    </div>
                    <p><strong>Item Category:</strong> ${medicine.medicineCategory}</p>
                    <p><strong>Usage:</strong> ${medicine.descriptionUsage}</p>
                    <p><strong>Dosage:</strong> ${medicine.dosageFrequency} - ${medicine.dosageStrength}</p>
                    <div class="reserve-container">
                        <button class="reserve-btn" data-pharmacy-name="${medicine.name}" data-pharmacy-email="${medicine.email}">
                            Reserve Here
                        </button>
                    </div>
                </div>
            `;

            cardsContainer.appendChild(medicineCard);
        });

        // Reattach reserve event listeners
        document.querySelectorAll('.reserve-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const pharmacyName = event.target.getAttribute('data-pharmacy-name');
                const pharmacyEmail = event.target.getAttribute('data-pharmacy-email');

                if (!isLoggedIn) {
                    openAuthModal();
                } else {
                    alert(`Reserving medicine at ${pharmacyName}`);
                }
            });
        });
    }

    renderCards(medicines);

    const infoBtn = modalContent.querySelector('.see-info-btn');
    infoBtn.addEventListener('click', () => {
        const url = `pharmacy_info.html?name=${encodeURIComponent(pharmacyName)}&email=${encodeURIComponent(pharmacyEmail)}`;
    window.open(url, '_blank');
    });


    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");

    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = filterSelect.value;

        // Show or hide clear icon
        clearSearchBtn.style.display = searchInput.value ? "block" : "none";

        const filtered = medicines.filter(med =>
            (selectedCategory === "all" || med.medicineCategory === selectedCategory) &&
            med.brandName.toLowerCase().includes(searchTerm)
        );
        renderCards(filtered);
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        const selectedCategory = filterSelect.value;

        const filtered = medicines.filter(med =>
            selectedCategory === "all" || med.medicineCategory === selectedCategory
        );
        renderCards(filtered);
    });

    filterSelect.addEventListener("change", () => {
        const searchTerm = document.getElementById("searchInput").value.toLowerCase();
        const selectedCategory = filterSelect.value;

        const filtered = medicines.filter(med =>
            (selectedCategory === "all" || med.medicineCategory === selectedCategory) &&
            med.brandName.toLowerCase().includes(searchTerm)
        );
        renderCards(filtered);
    });

    modal.classList.add("modal-visible");
    document.body.style.overflow = "hidden";
}

function showNoMedicinesMessage() {
    const modal = document.getElementById("medicine-modal");
    const modalContent = document.getElementById("modal-content");

    modalContent.innerHTML = `
        <div class="no-medicines-message">
            <p>No medicines available at this pharmacy.</p>
        </div>
    `;

    modal.classList.add("modal-visible");
    document.body.style.overflow = "hidden";
}

function closeMedicineModal() {
    const modal = document.getElementById("medicine-modal");
    modal.classList.remove("modal-visible"); // Hide the modal with slide-up animation
    document.body.style.overflow = "auto"; // Restore scrolling
}

document.getElementById("close-modal-btn").addEventListener('click', closeMedicineModal);
