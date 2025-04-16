function openViewArchiveProductModal(button) {
    let archiveproductrow = button.closest("tr");
    let archiveproductId = archiveproductrow.getAttribute("data-id");

    db.collection("archive_essential").doc(archiveproductId).get().then(doc => {
        if (doc.exists) {
            let data = doc.data();
            document.getElementById("view-archive-product-name").textContent = data.productName || "N/A";
            document.getElementById("batch-essential-archive-value").textContent = data.essentialbatchNumber || "N/A";
            document.getElementById("view-archive-essential-brand-name").textContent = data.essentialbrandName || "N/A";
            document.getElementById("view-archive-product-category").textContent = data.category || "N/A";
            document.getElementById("view-archive-size-unit").textContent = data.size || "N/A";
            document.getElementById("view-archive-product-description").textContent = data.essentialdescriptionUsage || "N/A";
            document.getElementById("view-archive-storage-instructions").textContent = data.storageInstructions || "No information";
            document.getElementById("view-archive-product-contraindicatins").textContent = 
            (Array.isArray(data.essentialcontraindications) && data.essentialcontraindications.length > 0) 
            ? data.essentialcontraindications.join(", ") 
            : "No information";        

            document.getElementById("view-archive-product-image").src = data.productImageBase64 || "";

            document.getElementById("view-archive-product-stock-quantity").textContent = data.essentialstockQuantity || "N/A";
            document.getElementById("view-archive-product-reorder-level").textContent = data.essentialreorderLevel || "N/A";
            document.getElementById("view-archive-product-supplier").textContent = data.essentialsupplier || "N/A";
            document.getElementById("view-archive-product-expiry-date").textContent = data.essentialexpirationDate || "N/A";
            
            function formatPrice(price) {
                return `₱${parseFloat(price).toFixed(2)}`;
            }
            
            document.getElementById("view-archive-product-purchase-price").textContent = data.essentialpurchasePrice 
                ? formatPrice(data.essentialpurchasePrice) 
                : "N/A";
            
            document.getElementById("view-archive-product-selling-price").textContent = data.essentialsellingPrice 
                ? formatPrice(data.essentialsellingPrice) 
                : "N/A";
            
            document.getElementById("view-archive-product-discounted-price").textContent = data.essentialdiscountPrice 
                ? formatPrice(data.essentialdiscountPrice) 
                : "No information";
            

            document.getElementById("view-product-archive-modal").style.display = "flex";
        } else {
            console.error("No such document!");
        }
    }).catch(error => {
        console.error("Error fetching document: ", error);
    });
}

function closeViewEssentialArchiveModal() {
    document.getElementById("view-product-archive-modal").style.display = "none";
}

document.addEventListener("click", function (event) {
    if (event.target.closest(".essential-archive-view-btn")) {
        openViewArchiveProductModal(event.target.closest(".essential-archive-view-btn"));
    }
});