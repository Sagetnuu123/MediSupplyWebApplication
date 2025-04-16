async function fetchlocationPharmacies() {
    const snapshot = await db.collection("register_pharmacy")
        .where("status", "==", "Registered")
        .get();

    // Clear any existing cards before rendering new ones
    const container = document.getElementById("pharmacyCardsContainer");
    container.innerHTML = ""; // clear container

    // Loop through each pharmacy document and render it
    snapshot.docs.forEach(doc => {
        const pharmacy = doc.data();

        const fullAddress = `${pharmacy.street}, ${pharmacy.barangay}, ${pharmacy.municipality}, ${pharmacy.province}`;

        const card = document.createElement("div");
        card.classList.add("pharmacy-card");

        card.innerHTML = `
        <img src="${pharmacy.med_picture}" alt="${pharmacy.pharmacy_name}" class="pharmacy-image">
        <div class="pharmacy-details">
            <h3 class="pharmacy-name">${pharmacy.pharmacy_name}</h3>
            <p class="pharmacy-address">${fullAddress}</p>
            <p class="pharmacy-hours">
                Open: ${pharmacy.days_open_from} - ${pharmacy.days_open_to}, ${pharmacy.start} - ${pharmacy.close}
            </p>
            <p class="pharmacy-email">Email: <a href="mailto:${pharmacy.email}">${pharmacy.email}</a></p>
            <div class="pharmacy-buttons">
                <a href="https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}" target="_blank" class="pharmacy-location-button">
                    View on Map
                </a>
                <a href="view-medicines.html?pharmacyId=${doc.id}" class="pharmacy-medicines-button">
                    View Medicines
                </a>
            </div>
        </div>
    `;    


        // Append the card to the container
        container.appendChild(card);
    });
}

// Call the fetchPharmacies function when the page loads
document.addEventListener("DOMContentLoaded", fetchlocationPharmacies);