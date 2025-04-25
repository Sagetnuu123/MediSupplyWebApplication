document.addEventListener("DOMContentLoaded", async () => {
    const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");

    if (!pharmacyEmail) {
        console.error("Pharmacy email not found in session.");
        return;
    }

    const prescribedContainer = document.getElementById("prescribed-meds");
    const nonPrescribedContainer = document.getElementById("non-prescribed-meds");

    db.collection("reservations")
        .where("pharmacyEmail", "==", pharmacyEmail)
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            prescribedContainer.innerHTML = "";
            nonPrescribedContainer.innerHTML = "";

            if (snapshot.empty) {
                prescribedContainer.innerHTML = "<p>No prescribed medicine reservations yet.</p>";
                nonPrescribedContainer.innerHTML = "<p>No non-prescribed medicine reservations yet.</p>";
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const {
                    medicineName,
                    quantity,
                    prescriptionRequired,
                    prescriptionImageBase64,
                    userData,
                    status,
                    paid
                } = data;

                const medicineItem = document.createElement("div");
                medicineItem.classList.add("medicine-item");

                medicineItem.innerHTML = `
                    <div class="medicine-content">
                        <div class="medicine-image-wrapper">
                            <img src="${data.medicineImageBase64 || 'images/default_medicine.png'}" alt="Medicine">
                        </div>
                        <div class="medicine-info">
                            <h4>${medicineName}</h4>
                            <p>Quantity: ${quantity}</p>
                            <p>Selling Price:</strong> ₱${data.sellingPrice?.toFixed(2) || "0.00"}</p>
                            <span class="badge ${prescriptionRequired ? "prescribed-badge" : "non-prescribed-badge"}">
                                ${prescriptionRequired ? "Prescription" : "OTC"}
                            </span>
                        </div>
                    </div>

                    <div class="user-info">
                        <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
                        <p><strong>Age:</strong> ${userData.age}</p>
                        <p><strong>Gender:</strong> ${userData.gender}</p>
                        <p><strong>Contact:</strong> ${userData.contactNumber}</p>
                        <p><strong>Address:</strong> ${userData.homeAddress}</p>
                    </div>

                    ${prescriptionRequired && prescriptionImageBase64 ? `
                        <div class="prescription-image">
                            <h2>Prescription:<h2>
                            <img src="${prescriptionImageBase64}" alt="Prescription Image">
                        </div>
                    ` : ""}

                    <div class="payment-details">
                    <p><strong>Total Payment:</strong> ₱${data.totalPayment?.toFixed(2) || "0.00"}</p>
                    </div>

                    <div class="reservation-note">
                        <em><i class='bx bx-info-circle'></i>${status === "accepted" && !paid ? "Ensure payment has been received before marking as paid." :
                            status !== "accepted" ? "Please review the reservation details carefully before accepting." : ""}</em>
                    </div>

                    <div class="reservation-actions">
                        ${status === "cancelled" ? `<span class="badge" style="background: #d32f2f;">Cancelled</span>` :
                        status === "accepted" ? `
                            <button class="paid-btn" data-id="${doc.id}" ${paid ? "disabled" : ""}>
                                ${paid ? "Already Paid" : "Mark as Paid"}
                            </button>` :
                        `<button class="accept-btn" data-id="${doc.id}">Accept</button>
                        <button class="cancel-btn" data-id="${doc.id}">Cancel</button>`}
                    </div>
                `;

                if (prescriptionRequired) {
                    prescribedContainer.appendChild(medicineItem);
                } else {
                    nonPrescribedContainer.appendChild(medicineItem);
                }
                setTimeout(() => {
                    medicineItem.style.animationDelay = `${Math.random() * 0.3}s`;
                }, 0);                
            });
        }, error => {
            console.error("Error listening for reservation changes:", error);
            prescribedContainer.innerHTML = "<p>Error loading reservations.</p>";
            nonPrescribedContainer.innerHTML = "<p>Error loading reservations.</p>";
        });
});


document.addEventListener("click", async function (e) {
    const id = e.target.dataset.id;
    if (!id) return;

    const card = e.target.closest(".medicine-item");

    // ACCEPT
    if (e.target.classList.contains("accept-btn")) {
        Swal.fire({
            title: 'Accept Reservation?',
            text: "Are you sure you want to accept this reservation?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, accept it',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'custom-z-index-popup',
                container: 'custom-z-index-container',
                title: 'custom-swal-title',
                confirmButton: 'custom-confirm-btn',
                cancelButton: 'custom-cancel-btn'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await db.collection("reservations").doc(id).update({
                        status: "accepted"
                    });

                    notyf.success("Reservation accepted.");
                    updateReservationCard(card, { status: "accepted", paid: false }, id);
                } catch (err) {
                    console.error(err);
                    notyf.error("Error accepting reservation.");
                }
            }
        });
    }

    // CANCEL
    if (e.target.classList.contains("cancel-btn")) {
        Swal.fire({
            title: 'Cancel Reservation?',
            text: "Are you sure you want to cancel this reservation?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No',
            customClass: {
                popup: 'custom-z-index-popup',
                container: 'custom-z-index-container',
                title: 'custom-swal-title',
                confirmButton: 'custom-confirm-btn danger',
                cancelButton: 'custom-cancel-btn'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await db.collection("reservations").doc(id).update({
                    status: "cancelled"
                });

                notyf.error("Reservation cancelled.");
                updateReservationCard(card, { status: "cancelled" }, id);
            }
        });
    }

    // PAID
    if (e.target.classList.contains("paid-btn")) {
        Swal.fire({
            title: 'Mark as Paid?',
            text: "Once marked, you can't revert this.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, mark as paid',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'custom-z-index-popup',
                container: 'custom-z-index-container',
                title: 'custom-swal-title',
                confirmButton: 'custom-confirm-btn',
                cancelButton: 'custom-cancel-btn'
              }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await db.collection("reservations").doc(id).update({
                    paid: true
                });

                notyf.success("Reservation marked as paid.");
                updateReservationCard(card, { paid: true, status: "accepted" }, id);
            }
        });
    }
});

function updateReservationCard(card, { status, paid }, id) {
    const actionsDiv = card.querySelector(".reservation-actions");
    if (!actionsDiv) return;

    // Clear existing buttons
    actionsDiv.innerHTML = "";

    if (status === "cancelled") {
        actionsDiv.innerHTML = `<span class="badge" style="background: #d32f2f;">Cancelled</span>`;
    } else if (status === "accepted") {
        if (paid) {
            actionsDiv.innerHTML = `<button class="paid-btn" disabled>Already Paid</button>`;
        } else {
            actionsDiv.innerHTML = `<button class="paid-btn" data-id="${id}">Mark as Paid</button>`;
        }
    }
}


document.addEventListener("click", function (e) {
    // Handle zoom on prescription image
    if (e.target.matches(".prescription-image img")) {
        const zoomModal = document.getElementById("zoom-modal");
        const zoomImg = document.getElementById("zoom-img");
        zoomImg.src = e.target.src;
        zoomModal.classList.add("show");
    }

    // Close modal when clicking close button or outside image
    if (e.target.matches(".zoom-close") || e.target.id === "zoom-modal") {
        document.getElementById("zoom-modal").classList.remove("show");
    }
});

