function openViewModal(button) {
    let row = button.closest("tr");
    let medicineId = row.getAttribute("data-id");

    db.collection("medicine_storage").doc(medicineId).get().then(doc => {
        if (doc.exists) {
            let data = doc.data();
            document.getElementById("view-brand-name").textContent = data.brandName || "N/A";
            document.getElementById("batch-value").textContent = data.batchNumber || "N/A";
            document.getElementById("view-generic-name").textContent = data.genericName || "N/A";
            document.getElementById("view-dosage").textContent = data.dosageStrength || "N/A";
            document.getElementById("view-dosagefrequency").textContent = data.dosageFrequency || "N/A";
            document.getElementById("view-medicine-category").textContent = data.medicineCategory || "N/A";
            document.getElementById("view-formulation").textContent = data.formulationType || "N/A";
            document.getElementById("view-prescription").textContent = data.prescriptionRequired || "N/A";
            document.getElementById("view-description").textContent = data.descriptionUsage || "N/A";
            document.getElementById("view-storage-conditions").textContent = data.storageConditions || "No information";
            document.getElementById("view-contraindications").textContent = 
            (Array.isArray(data.contraindications) && data.contraindications.length > 0) 
            ? data.contraindications.join(", ") 
            : "No information";        
            document.getElementById("view-sideeffects").textContent = data.sideEffects || "No information";
            document.getElementById("view-medicine-image").src = data.medicineImageBase64 || "";

            document.getElementById("view-stock-quantity").textContent = data.stockQuantity || "N/A";
            document.getElementById("view-reorder-level").textContent = data.reorderLevel || "N/A";
            document.getElementById("view-supplier").textContent = data.supplier || "N/A";
            document.getElementById("view-expiry-date").textContent = data.expirationDate || "N/A";
            
            function formatPrice(price) {
                return `₱${parseFloat(price).toFixed(2)}`;
            }
            
            document.getElementById("view-purchase-price").textContent = data.purchasePrice 
                ? formatPrice(data.purchasePrice) 
                : "N/A";
            
            document.getElementById("view-selling-price").textContent = data.sellingPrice 
                ? formatPrice(data.sellingPrice) 
                : "N/A";
            
            document.getElementById("view-discounted-price").textContent = data.discountPrice 
                ? formatPrice(data.discountPrice) 
                : "No information";
            

            document.getElementById("view-medicine-modal").style.display = "flex";
        } else {
            console.error("No such document!");
        }
    }).catch(error => {
        console.error("Error fetching document: ", error);
    });
}

function closeViewModal() {
    document.getElementById("view-medicine-modal").style.display = "none";
}

document.addEventListener("click", function (event) {
    if (event.target.closest(".view-btn")) {
        openViewModal(event.target.closest(".view-btn"));
    }
});