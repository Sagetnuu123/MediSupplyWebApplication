const colorPalette = [
    "#1976d2", "#388e3c", "#f57c00", "#7b1fa2", "#0097a7", "#c2185b", "#512da8"
];

function getPharmacyColor(pharmacyName) {
    let hash = 0;
    for (let i = 0; i < pharmacyName.length; i++) {
        hash = pharmacyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
}


function loadUserReservations() {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.warn("User not logged in.");
            return;
        }

        const reservationList = document.getElementById("reservationItems");
        reservationList.innerHTML = "<p>Loading your reservations...</p>";

        db.collection("reservations")
            .where("userUid", "==", user.uid)
            .orderBy("timestamp", "desc")
            .onSnapshot((querySnapshot) => {
                reservationList.innerHTML = ""; // Clear the existing content

                if (querySnapshot.empty) {
                    reservationList.innerHTML = "<p>You have no reservations yet.</p>";
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const pharmacyColor = getPharmacyColor(data.pharmacyName);
                    const card = document.createElement("div");
                    card.classList.add("reservation-card");

                    const date = data.timestamp?.toDate().toLocaleString() || "Unknown date";

                    // Check if medicineImageBase64 exists and use it if available
                    const medicineImageSrc = data.medicineImageBase64?.startsWith("data:image")
                        ? data.medicineImageBase64
                        : `data:image/jpeg;base64,${data.medicineImageBase64}`;

                    const medicineImage = data.medicineImageBase64
                        ? `<img src="${medicineImageSrc}" alt="${data.medicineName}" class="medicine-image" />`
                        : "";

                    card.innerHTML = `
                        <div class="reserve-pharmacy-header" style="background-color: ${pharmacyColor}">
                            <h3>${data.pharmacyName}</h3>
                            <p>${data.pharmacyEmail}</p>
                        </div>
                        <div class="medicine-details">
                        ${medicineImage}
                        <h4>${data.medicineName}</h4>
                        <div class="detail-row">
                            <span class="label">Quantity</span>
                            <span class="value">${data.quantity}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Price</span>
                            <span class="value">
                                ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.sellingPrice)}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Reserved On</span>
                            <span class="value">${date}</span>
                        </div>
                        </div>
                        <div class="payment-details modern-box">
                        <span class="label">Total Payment</span>
                        <span class="value">₱${data.totalPayment.toFixed(2)}</span>
                    </div>
                    `;

                    reservationList.appendChild(card);
                });
            }, (error) => {
                console.error("Error loading reservations:", error);
                reservationList.innerHTML = "<p>Failed to load reservations.</p>";
            });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserReservations();
});
