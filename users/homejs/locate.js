const notyf = new Notyf({
    duration: 4000,
    position: {
        x: 'left',
        y: 'top',
    },
    types: [
        {
            type: 'success',
            background: '#4BB543',
            icon: {
                className: 'fas fa-check',
                tagName: 'i',
                color: 'white'
            }
        },
        {
            type: 'error',
            background: '#e74c3c',
            icon: {
                className: 'fas fa-times',
                tagName: 'i',
                color: 'white'
            }
        }
    ]
});


let allMedicines = [];
let userLatitude = null;
let userLongitude = null;
let lastSearchedMedicine = null;

async function fetchUniqueMedicines() {
    const snapshot = await db.collection("medicine_storage").get();
    const rawMedicines = snapshot.docs.map(doc => doc.data());

    const uniqueMap = {};
    rawMedicines.forEach(med => {
        const key = med.brandName.toLowerCase();
        if (!uniqueMap[key]) uniqueMap[key] = [];
        uniqueMap[key].push(med);
    });

    // Get a random sample from each group
    allMedicines = Object.values(uniqueMap).map(group => {
        return group[Math.floor(Math.random() * group.length)];
    });

    populateFilterOptions(allMedicines);
    renderMedicines(allMedicines);
}

function renderMedicines(data) {
    const container = document.getElementById("medicineCardsContainer");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p style='grid-column: span 5; text-align:center; margin-top:200px;font-family: 'Montserrat', sans-serif;  font-weight: 600;'>No medicines found.</p>";
        return;
    }

    data.forEach(med => {
        const card = document.createElement("div");
        card.classList.add("medicine-card");

        card.innerHTML = `
            <div class="medicine-image-wrapper">
                <img src="${med.medicineImageBase64}" alt="${med.brandName}" class="medicine-image">
            </div>
            <div class="medicine-details">
                <h3 class="medicine-name">${med.brandName}</h3>
                <div class="medicine-info-line"><label>Category:</label><span>${med.medicineCategory}</span></div>
                <div class="medicine-info-line"><label>Dosage Frequency:</label><span>${med.dosageFrequency}</span></div>
                <div class="medicine-info-line"><label>Dosage Strength:</label><span>${med.dosageStrength}</span></div>
                <div class="medicine-info-line"><label>Formulation:</label><span>${med.formulationType}</span></div>
                <button class="find-pharmacy-btn" data-medicine="${med.brandName}">
                <i class='bx bx-search-alt-2'></i> Find Pharmacy
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    document.querySelectorAll('.find-pharmacy-btn').forEach(button => {
        button.addEventListener('click', () => {
          const medicineName = button.getAttribute('data-medicine');
          fetchPharmacies(medicineName);
        });
      });
}

function populateFilterOptions(medicines) {
    const categories = new Set();
    const formulations = new Set();

    medicines.forEach(med => {
        if (med.medicineCategory) categories.add(med.medicineCategory);
        if (med.formulationType) formulations.add(med.formulationType);
    });

    const filterCategory = document.getElementById("filterCategory");
    const filterFormulation = document.getElementById("filterFormulation");

    [...categories].sort().forEach(cat => {
        filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    [...formulations].sort().forEach(form => {
        filterFormulation.innerHTML += `<option value="${form}">${form}</option>`;
    });
}

function applyFilters() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("filterCategory").value;
    const formulation = document.getElementById("filterFormulation").value;

    const filtered = allMedicines.filter(med => {
        const matchesSearch = med.brandName.toLowerCase().includes(search);
        const matchesCategory = category ? med.medicineCategory === category : true;
        const matchesFormulation = formulation ? med.formulationType === formulation : true;

        return matchesSearch && matchesCategory && matchesFormulation;
    });

    renderMedicines(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchUniqueMedicines();

    const searchInput = document.getElementById("searchInput");
    const clearSearchIcon = document.getElementById("clearSearchIcon");

    // Toggle visibility of the "x" icon
    searchInput.addEventListener("input", () => {
        clearSearchIcon.style.display = searchInput.value ? "block" : "none";
        applyFilters();
    });

    // Clear the input when clicking the icon
    clearSearchIcon.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchIcon.style.display = "none";
        applyFilters();
    });

    document.getElementById("filterCategory").addEventListener("change", applyFilters);
    document.getElementById("filterFormulation").addEventListener("change", applyFilters);
});

async function fetchPharmacies(medicineName) {
    const pharmacies = [];
    lastSearchedMedicine = medicineName;
  
    // Query medicine_storage to find pharmacies that stock the medicine
    const medicineSnapshot = await db.collection("medicine_storage")
      .where("brandName", "==", medicineName)
      .get();

    const pharmacyMap = new Map();
  
    medicineSnapshot.forEach(doc => {
      const pharmacyEmail = doc.data().pharmacyEmail;
      if (pharmacyEmail && !pharmacies.some(p => p.email === pharmacyEmail)) {
        pharmacies.push({ email: pharmacyEmail });
      }
    });

    for (const doc of medicineSnapshot.docs) {
        const med = doc.data();
        const email = med.pharmacyEmail;

        // Save the medicine stock info to map by email
        if (!pharmacyMap.has(email)) {
            pharmacyMap.set(email, {
                email: email,
                stockQuantity: med.stockQuantity || "N/A",
                sellingPrice: med.sellingPrice || "N/A",
                discountPrice: med.discountPrice || null,
                medicineImageBase64: med.medicineImageBase64 || null,
                qrCodeDataUrl: med.qrCodeDataUrl || null,

                brandName: med.brandName || "N/A",
                medicineCategory: med.medicineCategory || "N/A",
                dosageFrequency: med.dosageFrequency || "N/A",
                dosageStrength: med.dosageStrength || "N/A",
                formulationType: med.formulationType || "N/A",
                prescriptionRequired: med.prescriptionRequired || false,
            });
        }
    }
  
    // Fetch detailed information from register_pharmacy for each pharmacy
    const pharmacyDetails = [];
    // Get complete pharmacy details using emails
    for (const [email, medInfo] of pharmacyMap.entries()) {
        const snapshot = await db.collection("register_pharmacy")
            .where("email", "==", email)
            .get();

        snapshot.forEach(doc => {
            const pharmacy = doc.data();
            pharmacy.stockQuantity = medInfo.stockQuantity;
            pharmacy.sellingPrice = medInfo.sellingPrice;
            pharmacy.discountPrice = medInfo.discountPrice;
            pharmacy.medicineImageBase64 = medInfo.medicineImageBase64;
            pharmacy.qrCodeDataUrl = medInfo.qrCodeDataUrl;
            pharmacy.brandName = medInfo.brandName;
            pharmacy.medicineCategory = medInfo.medicineCategory;
            pharmacy.dosageFrequency = medInfo.dosageFrequency;
            pharmacy.dosageStrength = medInfo.dosageStrength;
            pharmacy.formulationType = medInfo.formulationType;
            pharmacy.prescriptionRequired = medInfo.prescriptionRequired;
            pharmacyDetails.push(pharmacy);
        });
    }
  
    displayPharmacies(pharmacyDetails);
    const modal = document.getElementById("pharmacyModal");
    modal.style.display = "block";

    // Smooth slide-in
    setTimeout(() => {
    modal.classList.add("show");
    }, 1);

  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

  function displayPharmacies(pharmacies) {
    const modal = document.getElementById("pharmacyModal");
    const pharmacyList = document.getElementById("pharmacyList");
    pharmacyList.classList.add("pharmacy-list");  
    pharmacyList.innerHTML = "";

    if (pharmacies.length === 0) {
        pharmacyList.innerHTML = "<p>No pharmacies found for this medicine.</p>";
    } else {
        pharmacies.forEach(pharmacy => {
            const card = document.createElement("div");
            card.classList.add("pharmacy-card");
            card.setAttribute("data-pharmacy-email", pharmacy.email);

            let distanceText = "Enable location to see distance.";
            if (userLatitude !== null && userLongitude !== null && pharmacy.latitude && pharmacy.longitude) {
                const distance = calculateDistance(userLatitude, userLongitude, pharmacy.latitude, pharmacy.longitude);
                distanceText = `Approximately ${distance.toFixed(2)} km away`;
            }

            card.innerHTML = `
                <img src="${pharmacy.med_picture || 'images/default_pharmacy.png'}" alt="${pharmacy.pharmacy_name}" class="pharmacy-image">
                <div class="pharmacy-header">
                    <span>${pharmacy.pharmacy_name}</span>
                    <small class="distance-info">${distanceText}</small>
                </div>

                <div class="pharmacy-info-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" onclick="switchTab(event, 'pharmacy-${pharmacy.email}', 'pharmacy')">Pharmacy Info</button>
                        <button class="tab-btn" onclick="switchTab(event, 'pharmacy-${pharmacy.email}', 'medicine')">Medicine Info</button>
                        <button class="tab-btn" onclick="switchTab(event, 'pharmacy-${pharmacy.email}', 'qr')">Scan QR Code</button>
                    </div>
                    <div class="reserve-tab-wrapper">
                        <button class="tab-btn reserve-btn" onclick="switchTab(event, 'pharmacy-${pharmacy.email}', 'reserve')">Reserve Medicine</button>
                    </div>
                    <div class="tab-content active" id="pharmacy-${pharmacy.email}-pharmacy">
                        <div class="info-row"><label>Email:</label><span>${pharmacy.email}</span></div>
                        <div class="info-row"><label>Contact:</label><span>${pharmacy.contact_num}</span></div>
                        <div class="info-row"><label>Address:</label><span>${pharmacy.street}, ${pharmacy.barangay}, ${pharmacy.municipality}, ${pharmacy.province} - ${pharmacy.zipcode}</span></div>
                        <div class="info-row"><label>Open Days:</label><span>${pharmacy.days_open_from} to ${pharmacy.days_open_to}</span></div>
                        <div class="info-row"><label>Hours:</label><span>${pharmacy.start} - ${pharmacy.close}</span></div>
                    </div>
                    <div class="tab-content" id="pharmacy-${pharmacy.email}-medicine">
                        <div class="medicine-info-header">
                            <img src="${pharmacy.medicineImageBase64 || 'images/default_medicine.png'}" alt="Medicine Image" class="medicine-image">
                            <h3>${pharmacy.brandName}</h3>
                        </div>
                        
                        <div class="medicine-row"><label>Category:</label><span>${pharmacy.medicineCategory}</span></div>
                        <div class="medicine-row"><label>Dosage Strength:</label><span>${pharmacy.dosageStrength}</span></div>
                        <div class="medicine-row"><label>Dosage Frequency:</label><span>${pharmacy.dosageFrequency}</span></div>
                        <div class="medicine-row"><label>Formulation Type:</label><span>${pharmacy.formulationType}</span></div>
                        <div class="medicine-row"><label>Stock Quantity:</label><span>${pharmacy.stockQuantity}</span></div>
                        <div class="medicine-row"><label>Price:</label><span>₱${pharmacy.discountPrice || pharmacy.sellingPrice}</span></div>
                        <div class="medicine-row"><label>Prescription Required:</label><span>${pharmacy.prescriptionRequired}</span></div>
                    </div>

                    <div class="tab-content" id="pharmacy-${pharmacy.email}-qr">
                        <div class="qr-code-wrapper">
                            <label class="qr-label">Scan QR Code for More Info on Medicine:</label><br>
                            <img src="${pharmacy.qrCodeDataUrl}" alt="QR Code" class="qr-code-img">
                        </div>
                    </div>

                    <div class="tab-content" id="pharmacy-${pharmacy.email}-reserve">
                    <form class="reserve-form" data-prescription="${pharmacy.prescriptionRequired}">
                    <!-- Step 1: Personal Info -->
                    <div class="form-step step-1 active">
                        <h4>Personal Information</h4>
                        <div class="form-row"><label>First Name:</label><input type="text" name="firstName" required></div>
                        <div class="form-row"><label>Last Name:</label><input type="text" name="lastName" required></div>
                        <div class="form-row"><label>Home Address:</label><input type="text" name="Home Address" required></div>
                        <div class="form-row"><label>Age:</label><input type="number" name="age" required></div>
                        <div class="form-row"><label>Gender:</label>
                            <select name="gender" required>
                                <option value="" disabled selected>Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-row"><label>Contact Number:</label><input type="tel" name="contactNumber" required
                        pattern="^09[0-9]{9}$"
                        maxlength="11"
                        inputmode="numeric"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                        placeholder="09XXXXXXXXX"></div>

                        <div class="form-row">
                            <button type="button" class="reserve-next-btn">Next</button>
                        </div>
                    </div>

                    <!-- Step 2: Reservation Details -->
                    <div class="form-step step-2">
                        <h4>Reservation Details</h4>
                        <div class="form-row"><label>Medicine Quantity:</label><input type="number" name="quantity" required></div>

                        <!-- Prescription Upload (conditionally shown via JS) -->
                        <div class="form-row prescription-upload" style="display: none;">
                            <label>Upload Prescription:</label>
                            <input type="file" name="prescriptionImage" accept="image/*">
                             <span class="file-name-display" style="margin-top: 5px; display: block; font-size: 12px; color: #555;"></span>
                        </div>

                        <div class="form-row">
                            <button type="submit" class="reserve-submit-btn">Submit Reservation</button>
                        </div>
                    </div>
                </form>
                </div>
                </div>
            `;
            pharmacyList.appendChild(card);
        });
    }

    modal.style.display = "block";

    // Smooth slide-in
    setTimeout(() => {
    modal.classList.add("show");
    }, 1);

    // Prevent page scrolling when modal is open
    modal.addEventListener("transitionend", () => {
        if (modal.classList.contains("show")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });

    window.addEventListener("click", function(event) {
        const modal = document.getElementById("pharmacyModal");
        if (event.target === modal) {
            closeModal();
        }
    });    
}

const pharmacyCloseBtn = document.querySelector(".pharmacy-close-btn");
const findPharmacyBtns = document.querySelectorAll(".find-pharmacy-btn");

findPharmacyBtns.forEach(button => {
    button.addEventListener("click", () => {
        modal.classList.add("show");
    });
});

function closeModal() {
    const modal = document.getElementById("pharmacyModal");
    modal.classList.remove("show");

    // Reset overflow
    document.body.style.overflow = "";

    // Use a timeout to let the transition complete before hiding
    setTimeout(() => {
        modal.style.display = "none";
    }, 500); // Match your CSS transition duration
}

function switchTab(event, baseId, tabType) {
    const tabBtns = event.target.parentElement.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        if (!btn.classList.contains("reserve-btn")) {
            btn.classList.remove("active");
        }
    });

    const contents = event.target.closest(".pharmacy-info-tabs").querySelectorAll(".tab-content");
    contents.forEach(tab => tab.classList.remove("active"));

    document.getElementById(`${baseId}-${tabType}`).classList.add("active");

    if (!event.target.classList.contains("reserve-btn")) {
        event.target.classList.add("active");
    }
}


document.addEventListener("click", function (e) {
    if (e.target.classList.contains("reserve-next-btn")) {
        const form = e.target.closest(".reserve-form");
        const step1 = form.querySelector(".step-1");
        const step2 = form.querySelector(".step-2");

        const inputs = step1.querySelectorAll("input, select");
        let allValid = true;

        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                allValid = false;
                break;
            }
        }

        if (!allValid) return;

        // Proceed to Step 2
        step1.classList.remove("active");
        step2.classList.add("active");

        if (form.dataset.prescription === "Yes") {
            const prescriptionSection = step2.querySelector(".prescription-upload");
            prescriptionSection.style.display = "flex";
            prescriptionSection.querySelector("input").setAttribute("required", "required");
        }

        step2.scrollIntoView({ behavior: "smooth" });
    }
});

let isSubmitting = false;

document.addEventListener("submit", async function (e) {
    if (e.target.classList.contains("reserve-form")) {
        e.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;

        const form = e.target;
        const pharmacyCard = form.closest('.pharmacy-card');
        const pharmacyEmail = pharmacyCard.getAttribute('data-pharmacy-email');
        const pharmacyName = pharmacyCard.querySelector('.pharmacy-header span').innerText;
        const medicineName = pharmacyCard.querySelector('.medicine-info-header h3').innerText;
        const quantity = form.querySelector("input[name='quantity']").value;

        const userData = {
            firstName: form.querySelector("input[name='firstName']").value,
            lastName: form.querySelector("input[name='lastName']").value,
            homeAddress: form.querySelector("input[name='Home Address']").value,
            age: form.querySelector("input[name='age']").value,
            gender: form.querySelector("select[name='gender']").value,
            contactNumber: form.querySelector("input[name='contactNumber']").value
        };

        const prescriptionRequired = form.dataset.prescription === "Yes";
        let base64Prescription = null;

        if (prescriptionRequired) {
            const prescriptionFileInput = form.querySelector("input[name='prescriptionImage']");
            const file = prescriptionFileInput.files[0];

            if (!file) {
                notyf.error("Prescription image is required.");
                isSubmitting = false;
                return;
            }

            try {
                base64Prescription = await readFileAsBase64(file);
            } catch (error) {
                console.error("Error reading file:", error);
                notyf.error("Failed to read prescription image.");
                isSubmitting = false;
                return;
            }
        }

        // ✅ Get the medicine image (base64) from the DOM
        const medicineImageElement = pharmacyCard.querySelector(".medicine-image");
        const medicineImageBase64 = medicineImageElement ? medicineImageElement.src : null;

        const reservationData = {
            userData: userData,
            pharmacyEmail: pharmacyEmail,
            pharmacyName: pharmacyName,
            medicineName: medicineName,
            quantity: quantity,
            prescriptionRequired: prescriptionRequired,
            prescriptionImageBase64: base64Prescription,
            medicineImageBase64: medicineImageBase64, // ✅ include this
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection("reservations").add(reservationData)
            .then(() => {
                notyf.success("Reservation submitted successfully!");
                closeModal();
            })
            .catch((error) => {
                console.error("Error adding reservation: ", error);
                notyf.error("Error submitting reservation.");
            })
            .finally(() => {
                isSubmitting = false;
            });
    }
});

// Helper function to convert file to base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

document.addEventListener("change", function (e) {
    if (e.target.name === "prescriptionImage") {
        const fileInput = e.target;
        const fileNameSpan = fileInput.nextElementSibling;

        if (fileInput.files.length > 0) {
            fileNameSpan.textContent = `Selected file: ${fileInput.files[0].name}`;
        } else {
            fileNameSpan.textContent = "";
        }
    }
});

