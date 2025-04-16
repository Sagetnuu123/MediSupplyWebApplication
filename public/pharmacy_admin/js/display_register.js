function goBack() {
    document.getElementById("confirmBackModal").style.display = "flex";
}

// Function to close the confirmation modal
function closeConfirmModal() {
    document.getElementById("confirmBackModal").style.display = "none";
}

// Redirect to home if user confirms
function redirectToHome() {
    window.location.href = "register_pharmacy.html";
}

let map, marker;

const notyf = new Notyf({
    position: { x: "right", y: "top" }
});

document.getElementById("set-location-btn").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default button behavior
    const mapModal = document.getElementById("map-modal");
    mapModal.style.display = "flex";  // Show modal
    mapModal.style.top = "50%"; 
    mapModal.style.left = "50%";
    mapModal.style.transform = "translate(-50%, -50%)"; // Ensure it stays centered
});

document.getElementById("close-map").addEventListener("click", function () {
    document.getElementById("map-modal").style.display = "none";
});

function initMap() {
    const defaultLocation = { lat: 9.8, lng: 123.9 }; // Default coordinates
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
    });

    google.maps.event.addListener(marker, "dragend", function () {
        document.getElementById("latitude").value = marker.getPosition().lat();
        document.getElementById("longitude").value = marker.getPosition().lng();
    });
}

document.getElementById("save-location").addEventListener("click", () => {
    const saveButton = document.getElementById("save-location");
    const spinner = document.getElementById("save-location-spinner");

    // Show spinner and disable button
    spinner.style.visibility = "visible";
    saveButton.disabled = true;

    setTimeout(() => {
        const lat = marker.getPosition().lat();
        const lng = marker.getPosition().lng();
        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        if (lat && lng) {
            const locationError = document.getElementById("location-error");
            if (locationError) {
                locationError.style.display = "none";
            }
            notyf.success("Location saved successfully!");
            document.getElementById("map-modal").style.display = "none";
        } else {
            notyf.error("Please select a location before saving.");
        }

        // Hide spinner and enable button
        spinner.style.visibility = "hidden";
        saveButton.disabled = false;
    }, 1000); // Simulating processing delay
});



// Update Firestore to store location
async function confirmAndProcessRegistration() {
    const lat = document.getElementById("latitude").value;
    const lng = document.getElementById("longitude").value;
    
    const data = { latitude: lat, longitude: lng };
    await db.collection("register_pharmacy").add(data);
}

document.addEventListener("DOMContentLoaded", async () => {
    const notyf = new Notyf({
        position: { x: "right", y: "top" } 
    });
    const pharmacyId = sessionStorage.getItem("pendingPharmacyId");

    if (!pharmacyId) {
        notyf.error("No registration data found!");
        setTimeout(() => {
            window.location.href = "register_pharmacy.html";
        }, 1500); // Redirect after 1.5s
        return;
    }

    try {
        const doc = await db.collection("temporary_pharmacy_registration").doc(pharmacyId).get();
        if (!doc.exists) {
            notyf.error("No matching registration found!");
            return;
        }

        const data = doc.data();

        // Populate the confirmation page fields
        document.getElementById("med-picture").src = data.med_picture || "images/default_profile.png";
        document.getElementById("pharmacy-name").textContent = data.pharmacy_name;
        document.getElementById("license-number").textContent = data.license_number;
        document.getElementById("owners-name").textContent = data.owners_name;
        document.getElementById("owners-address").textContent = data.owners_address;
        document.getElementById("email").textContent = data.email;
        document.getElementById("pharmacy-type").textContent = data.pharmacy_type;
        document.getElementById("street").textContent = data.street;
        document.getElementById("barangay").textContent = data.barangay;
        document.getElementById("municipality").textContent = data.municipality;
        document.getElementById("province").textContent = data.province;
        document.getElementById("zipcode").textContent = data.zipcode;
        document.getElementById("contact-num").textContent = data.contact_num;
        document.getElementById("start").textContent = data.start;
        document.getElementById("close").textContent = data.close;
        document.getElementById("days-open").textContent = `${data.days_open_from} to ${data.days_open_to}`;
        document.getElementById("TIN").textContent = data.TIN;
        document.getElementById("business-permit").textContent = data.business_permit;
        document.getElementById("expiry-date").textContent = data.expiry_date;
        document.getElementById("date-registration").textContent = data.date_registration;
        document.getElementById("status").textContent = data.status;
    } catch (error) {
        console.error("Error retrieving registration data: ", error);
        notyf.error("Failed to load registration details.");
    }
});


document.getElementById("submit-btn").addEventListener("click", function () {
    document.getElementById("confirmRegistrationBackModal").style.display = "flex"; // Show the modal
});

function closeConfirmRegistrationModal() {
    document.getElementById("confirmRegistrationBackModal").style.display = "none"; // Hide the modal
}


// ✅ Move to `register_pharmacy` upon confirmation
document.getElementById("confirm_pharmacy-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    showConfirmRegistrationModal();
});


   async function confirmAndProcessRegistration() {
    closeConfirmRegistrationModal(); // Hide modal

    const submitBtn = document.getElementById("submit-btn");
    const spinner = document.getElementById("spinner");
    const notyf = new Notyf({
        position: { x: "right", y: "top" }
    });

    // Show spinner and disable button
    submitBtn.disabled = true;
    spinner.style.visibility = "visible";

    requestAnimationFrame(async () => {
        const pharmacyId = sessionStorage.getItem("pendingPharmacyId");
        if (!pharmacyId) {
            notyf.error("No pending registration found!");
            spinner.style.visibility = "hidden";
            submitBtn.disabled = false;
            return;
        }

        const lat = document.getElementById("latitude").value || null;
        const lng = document.getElementById("longitude").value || null;
        const locationError = document.getElementById("location-error");

        if (!lat || !lng) {
            locationError.textContent = "Please select a location before confirming registration.";
            locationError.style.display = "block";
            spinner.style.visibility = "hidden";
            submitBtn.disabled = false;
            return;
        } else {
            locationError.style.display = "none";
        }

        try {
            const docRef = db.collection("temporary_pharmacy_registration").doc(pharmacyId);
            const doc = await docRef.get();

            if (!doc.exists) {
                notyf.error("No matching registration found!");
                spinner.style.visibility = "hidden";
                submitBtn.disabled = false;
                return;
            }

            const data = doc.data();
            const timestamp = new Date();

            const updatedData = {
                ...data,
                latitude: lat,
                longitude: lng,
                timestamp: timestamp
            };

            // Move data to `register_pharmacy`
            await db.collection("register_pharmacy").add(updatedData);

            // Save notification for admin
            await db.collection("admin_notifications").add({
                pharmacy_name: data.pharmacy_name,
                timestamp: timestamp
            });

            // Remove from `temporary_pharmacy_registration`
            await docRef.delete();
            sessionStorage.removeItem("pendingPharmacyId");

            setTimeout(() => {
                notyf.success("Registration confirmed successfully!");
                spinner.style.visibility = "hidden";
                submitBtn.disabled = false;
            }, 1000);

            setTimeout(() => {
                window.location.href = "go_to_login.html";
            }, 2500);
        } catch (error) {
            console.error("Error confirming registration: ", error);
            notyf.error("Error confirming registration.");
            spinner.style.visibility = "hidden";
            submitBtn.disabled = false;
        }
    });
}


