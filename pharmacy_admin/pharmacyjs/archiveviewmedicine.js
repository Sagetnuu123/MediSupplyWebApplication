function openViewArchiveModal(button) {
    let archiverow = button.closest("tr");
    let archivemedicineId = archiverow.getAttribute("data-id");

    db.collection("archive_medicine").doc(archivemedicineId).get().then(doc => {
        if (doc.exists) {
            let data = doc.data();
            document.getElementById("view-archive-brand-name").textContent = data.brandName || "N/A";
            document.getElementById("batch-archive-value").textContent = data.batchNumber || "N/A";
            document.getElementById("view-archive-generic-name").textContent = data.genericName || "N/A";
            document.getElementById("view-archive-dosage").textContent = data.dosageStrength || "N/A";
            document.getElementById("view-archive-dosagefrequency").textContent = data.dosageFrequency || "N/A";
            document.getElementById("view-archive-medicine-category").textContent = data.medicineCategory || "N/A";
            document.getElementById("view-archive-formulation").textContent = data.formulationType || "N/A";
            document.getElementById("view-archive-prescription").textContent = data.prescriptionRequired || "N/A";
            document.getElementById("view-archive-description").textContent = data.descriptionUsage || "N/A";
            document.getElementById("view-archive-storage-conditions").textContent = data.storageConditions || "No information";
            document.getElementById("view-archive-contraindications").textContent = 
            (Array.isArray(data.contraindications) && data.contraindications.length > 0) 
            ? data.contraindications.join(", ") 
            : "No information";        
            document.getElementById("view-archive-sideeffects").textContent = data.sideEffects || "No information";
            document.getElementById("view-archive-medicine-image").src = data.medicineImageBase64 || "";

            document.getElementById("view-archive-stock-quantity").textContent = data.stockQuantity || "N/A";
            document.getElementById("view-archive-reorder-level").textContent = data.reorderLevel || "N/A";
            document.getElementById("view-archive-supplier").textContent = data.supplier || "N/A";
            document.getElementById("view-archive-expiry-date").textContent = data.expirationDate || "N/A";
            
            function formatPrice(price) {
                return `₱${parseFloat(price).toFixed(2)}`;
            }
            
            document.getElementById("view-archive-purchase-price").textContent = data.purchasePrice 
                ? formatPrice(data.purchasePrice) 
                : "N/A";
            
            document.getElementById("view-archive-selling-price").textContent = data.sellingPrice 
                ? formatPrice(data.sellingPrice) 
                : "N/A";
            
            document.getElementById("view-archive-discounted-price").textContent = data.discountPrice 
                ? formatPrice(data.discountPrice) 
                : "No information";
            

            document.getElementById("view-medicine-archive-modal").style.display = "flex";
        } else {
            console.error("No such document!");
        }
    }).catch(error => {
        console.error("Error fetching document: ", error);
    });
}

function closeViewArchiveModal() {
    document.getElementById("view-medicine-archive-modal").style.display = "none";
}

document.addEventListener("click", function (event) {
    if (event.target.closest(".archive-view-btn")) {
        openViewArchiveModal(event.target.closest(".archive-view-btn"));
    }
});