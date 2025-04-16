let editMedicineImageBase64 = "";

function handleeditImageUpload() {
    const fileInput = document.getElementById("edit-medicine-image");
    const file = fileInput.files[0];

    const imageErrorMessage = document.getElementById("edit-medicine-image-error");
    if (imageErrorMessage) {
        imageErrorMessage.style.display = 'none'; // Hide the error message
    }

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            editMedicineImageBase64 = reader.result; // Store Base64 string

            let container = document.getElementById("edit-image-preview-container");
            container.innerHTML = ""; // Clear previous preview

            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";

            let imgPreview = document.createElement("img");
            imgPreview.id = "edit-medicine-image-preview";
            imgPreview.style.maxWidth = "100px";
            imgPreview.style.maxHeight = "100px";
            imgPreview.src = editMedicineImageBase64; // Set new image

            let removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "&times;";
            removeBtn.onclick = function () {
                resetEditForm();
            };

            wrapper.appendChild(imgPreview);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        };

        reader.readAsDataURL(file); // Convert to Base64
    }
}

let selectedMedicineId = null; // Stores the selected medicine ID

// Function to open the edit modal and populate fields
async function openEditModal(button) {
    const row = button.closest("tr"); // Get the row where the button was clicked
    selectedMedicineId = row.dataset.id; // Get the medicine ID from the row
    if (!selectedMedicineId) {
        console.error("No medicine ID found.");
        return;
    }

    console.log("Fetching medicine with ID:", selectedMedicineId);
    try {
        // Fetch medicine data from Firestore
        const doc = await db.collection("medicine_storage").doc(selectedMedicineId).get();
        if (!doc.exists) {
            console.error("No medicine found with this ID.");
            return;
        }

        const medicine = doc.data(); // Get medicine details
        console.log("Fetched document:", doc.data());

        // Populate the edit modal fields with the fetched data
        document.getElementById("edit-brand-name").value = medicine.brandName || "";
        document.getElementById("edit-generic-name").value = medicine.genericName || "";
        document.getElementById("edit-medicine-category").value = medicine.medicineCategory || "";
       
        document.querySelector("#edit-medicine-category .selected-option").textContent = medicine.medicineCategory || "Choose Medicine Category";
        document.querySelector("#edit-dosage-strength-dropdown .selected-option").textContent = medicine.dosageStrength || "Choose Dosage/Strength";
        document.querySelector("#edit-prescription-required .selected-option").textContent = medicine.prescriptionRequired || "Choose Yes or No";
        document.querySelector("#edit-formulation-type .selected-option").textContent = medicine.formulationType || "Choose Formulation/Type";
        document.querySelector("#edit-dosage-frequency .selected-option").textContent = medicine.dosageFrequency || "Choose Dosage Frequency";

        const contraindicationCheckboxes = document.querySelectorAll("#edit-contraindications .dropdown-options input[type='checkbox']");
        let selectedContraindications = [];

        contraindicationCheckboxes.forEach(checkbox => {
            if (medicine.contraindications.includes(checkbox.value)) {
                checkbox.checked = true;
                selectedContraindications.push(checkbox.value);
            } else {
                checkbox.checked = false;
            }
        });

        // Update the dropdown display text
        document.querySelector("#edit-contraindications .selected-option").textContent = 
            selectedContraindications.length ? selectedContraindications.join(", ") : "Choose Contraindications";


        document.getElementById("edit-description-usage").value = medicine.descriptionUsage || "";
        document.getElementById("edit-storage-conditions").value = medicine.storageConditions || "";
        document.getElementById("edit-side-effects").value = medicine.sideEffects || "";
        document.getElementById("edit-stock-quantity").value = medicine.stockQuantity || "";
        document.getElementById("edit-reorder-level").value = medicine.reorderLevel || "";
        document.getElementById("edit-expiration-date").value = medicine.expirationDate || "";
        document.getElementById("edit-batch-number").value = medicine.batchNumber || "";
        document.getElementById("edit-supplier").value = medicine.supplier || "";
        document.getElementById("edit-purchase-price").value = medicine.purchasePrice || "";
        document.getElementById("edit-selling-price").value = medicine.sellingPrice || "";
        document.getElementById("edit-discount-price").value = medicine.discountPrice || "";

        let editImagePreviewContainer = document.getElementById("edit-image-preview-container");
        editImagePreviewContainer.innerHTML = ""; // Clear previous image
        if (medicine.medicineImageBase64) {
            let container = document.getElementById("edit-image-preview-container");
            container.innerHTML = ""; // Clear previous preview
        
            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper"; // Ensure it follows the same design
        
            let imgPreview = document.createElement("img");
            imgPreview.id = "edit-medicine-image-preview";
            imgPreview.style.maxWidth = "100px";
            imgPreview.style.maxHeight = "100px";
            imgPreview.src = medicine.medicineImageBase64; // Populate with base64 image
        
            let removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "&times;";
            removeBtn.onclick = function () {
                container.innerHTML = "";
                document.getElementById("edit-medicine-image").value = ""; // Reset file input
                editMedicineImageBase64 = ""; // Clear the base64 string
            };
        
            wrapper.appendChild(imgPreview);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);

            editMedicineImageBase64 = medicine.medicineImageBase64; 
        } else {
            editMedicineImageBase64 = ""; // If no image exists, keep it empty
        }

        document.getElementById("edit-qr-code-img").src = "";

        // Show the modal
        document.getElementById("edit-medicine-modal").style.display = "block";

    } catch (error) {
        console.error("Error fetching medicine details: ", error);
    }
}

// Function to close the edit modal
function closeEditModal() {
    document.getElementById("edit-medicine-modal").style.display = "none";
    selectedMedicineId = null; // Reset the selected medicine ID
}

function validateEditForm() {
    let isEditValid = true;

    // Check each required field
    const requiredFields = [
        { id: 'edit-brand-name', errorId: 'edit-brand-name-error', message: 'This field is required' },
        { id: 'edit-medicine-image', errorId: 'edit-medicine-image-error', message: 'This field is required' },
        { id: 'edit-medicine-category', errorId: 'edit-category-error', message: 'This field is required' },
        { id: 'edit-dosage-strength-dropdown', errorId: 'edit-dosage-strength-error', message: 'This field is required' },
        { id: 'edit-prescription-required', errorId: 'edit-prescription-required-error', message: 'This field is required' },
        { id: 'edit-formulation-type', errorId: 'edit-formulation-type-error', message: 'This field is required' },
        { id: 'edit-dosage-frequency', errorId: 'edit-dosage-frequency-error', message: 'This field is required' },
        { id: 'edit-batch-number', errorId: 'edit-batch-number-error', message: 'This field is required' },
        { id: 'edit-description-usage', errorId: 'edit-description-usage-error', message: 'This field is required' },
        { id: 'edit-expiration-date', errorId: 'edit-expiration-date-error', message: 'This field is required' },
        { id: 'edit-stock-quantity', errorId: 'edit-stock-quantity-error', message: 'This field is required' },
        { id: 'edit-reorder-level', errorId: 'edit-reorder-level-error', message: 'This field is required' },
        { id: 'edit-purchase-price', errorId: 'edit-purchase-price-error', message: 'This field is required' },
        { id: 'edit-selling-price', errorId: 'edit-selling-price-error', message: 'This field is required' },
    ];

    requiredFields.forEach(field => {
        const editinput = document.getElementById(field.id);
        const editerrorMessage = document.getElementById(field.errorId);

        if (!editinput || !editerrorMessage) return; // Skip if the element does not exist

        // Check for text, number, and textarea fields
        if (editinput.tagName === "INPUT" && (editinput.type === "text" || editinput.type === "number")) {
            if (!editinput.value.trim()) {
                editerrorMessage.textContent = field.message;
                editerrorMessage.style.display = 'block';
                isEditValid = false;
            } else {
                editerrorMessage.style.display = 'none';
            }
        }

        // Check for file input
        else if (editinput.type === "file") {
            if (editinput.files.length === 0) {
                editerrorMessage.textContent = field.message;
                editerrorMessage.style.display = 'block';
                isEditValid = false;
            } else {
                editerrorMessage.style.display = 'none';
            }
        }

        // ✅ Fix for dropdowns with class 'custom-dropdown'
        else if (editinput.classList.contains('custom-dropdown')) {
            const selectedOption = editinput.querySelector('.selected-option');
            if (!selectedOption || selectedOption.textContent.trim() === "Choose Formulation/Type" || selectedOption.textContent.trim().startsWith("Choose")) {
                editerrorMessage.textContent = field.message;
                editerrorMessage.style.display = 'block';
                isEditValid = false;
            } else {
                editerrorMessage.style.display = 'none';
            }
        }

        // Check for textarea fields
        else if (editinput.tagName === "TEXTAREA") {
            if (!editinput.value.trim()) {
                editerrorMessage.textContent = field.message;
                editerrorMessage.style.display = 'block';
                isEditValid = false;
            } else {
                editerrorMessage.style.display = 'none';
            }
        }
    });

    // ✅ Fix for QR Code Validation
    let editqrCodeImg = document.getElementById("edit-qr-code-img");
    let editqrErrorMsg = document.getElementById("edit-qr-code-error");

    if (!editqrCodeImg || !editqrCodeImg.src || editqrCodeImg.src === "" || editqrCodeImg.src.startsWith("file:///") || !editqrCodeImg.src.startsWith("data:image/png;base64")) {
        editqrErrorMsg.textContent = "Please generate the QR Code before saving.";
        editqrErrorMsg.style.display = "block";
        editqrErrorMsg.style.color = "red";
        isEditValid = false;
    } else {
        editqrErrorMsg.style.display = "none";
    }

    return isEditValid;
}


document.querySelector(".edit-save-btn").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent default form submission

    if (!validateEditForm()) {
        return; // If validation fails, stop the function execution
    }
    
    if (!selectedMedicineId) {
        console.error("No medicine ID selected for update.");
        return;
    }
    
    const saveButton = document.querySelector(".edit-save-btn");
    saveButton.disabled = true;
    saveButton.textContent = "Saving..."; 

    
    // Get updated data from input fields
    const updatedMedicine = {
        brandName: document.getElementById("edit-brand-name").value,
        genericName: document.getElementById("edit-generic-name").value,
        medicineCategory: document.querySelector("#edit-medicine-category .selected-option").textContent,
        dosageStrength: document.querySelector("#edit-dosage-strength-dropdown .selected-option").textContent,
        prescriptionRequired: document.querySelector("#edit-prescription-required .selected-option").textContent,
        formulationType: document.querySelector("#edit-formulation-type .selected-option").textContent,
        dosageFrequency: document.querySelector("#edit-dosage-frequency .selected-option").textContent,
        contraindications: Array.from(document.querySelectorAll("#edit-contraindications .dropdown-options input[type='checkbox']:checked"))
            .map(checkbox => checkbox.value),
        descriptionUsage: document.getElementById("edit-description-usage").value,
        storageConditions: document.getElementById("edit-storage-conditions").value,
        sideEffects: document.getElementById("edit-side-effects").value,
        stockQuantity: document.getElementById("edit-stock-quantity").value,
        reorderLevel: document.getElementById("edit-reorder-level").value,
        expirationDate: document.getElementById("edit-expiration-date").value,
        batchNumber: document.getElementById("edit-batch-number").value,
        supplier: document.getElementById("edit-supplier").value,
        purchasePrice: document.getElementById("edit-purchase-price").value,
        sellingPrice: document.getElementById("edit-selling-price").value,
        discountPrice: document.getElementById("edit-discount-price").value,
        medicineImageBase64: editMedicineImageBase64, // Updated image if changed
        qrCodeDataUrl: generateeditQR()
    };

    
    try {
        // Update the document in Firestore
        await db.collection("medicine_storage").doc(selectedMedicineId).update(updatedMedicine);
        console.log("Medicine Updated Successfully!");
        
        // Close the modal after successful update
        closeEditModal();
        
        // Optionally, refresh the table or update UI
        notyf.success("Medicine Updated Successfully!"); // Replace with a success message modal if needed
    } catch (error) {
        console.error("Error updating medicine: ", error);
        alert("Failed to update medicine details.");
    }finally {
        // Re-enable the save button after the operation completes
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes"; // Reset text back to original
    }
});

document.querySelectorAll('.edit-medicine-form input, .edit-medicine-form select, .edit-medicine-form textarea, .edit-medicine-form .custom-dropdown').forEach(field => {
    field.addEventListener('input', hideAllEditErrors);
    field.addEventListener('click', hideAllEditErrors);
});

// ✅ Fix: Hide all error messages when selecting a dropdown option
document.querySelectorAll('.custom-dropdown .dropdown-options li').forEach(option => {
    option.addEventListener('click', function () {
        hideAllEditErrors(); // Hide all errors when selecting an option
        const dropdown = this.closest('.custom-dropdown');
        const selectedOption = dropdown.querySelector('.selected-option');
        selectedOption.textContent = this.textContent; // Update selected option text
    });
});

// ✅ Function to hide all error messages at once
function hideAllEditErrors() {
    document.querySelectorAll('.error-input-message').forEach(editerrorMessage => {
        editerrorMessage.style.display = 'none';
    });
}

// Add QR code generation functionality if necessary
function generateeditQR() {
    let editbrandName = document.getElementById("edit-brand-name").value;
    let editgenericName = document.getElementById("edit-generic-name").value;
    let editmedicineCategory = document.querySelector("#edit-medicine-category .selected-option").textContent;
    let editdosageStrength = document.querySelector("#edit-dosage-strength-dropdown .selected-option").textContent;
    let editformulationType = document.querySelector("#edit-formulation-type .selected-option").textContent;
    let editdosageFrequency = document.querySelector("#edit-dosage-frequency .selected-option").textContent;
    let editdescriptionUsage = document.getElementById("edit-description-usage").value;
    let editbatchNumber = document.getElementById("edit-batch-number").value;
    let editexpirationDate = document.getElementById("edit-expiration-date").value;
    let editsupplier = document.getElementById("edit-supplier").value;

    // Ensure all required fields are filled before generating QR code
    if (!editbrandName || !editmedicineCategory || !editdosageStrength || !editformulationType || !editdosageFrequency  || !editdescriptionUsage || !editbatchNumber || !editexpirationDate) {
        notyf.error("Please fill all required fields before generating the QR Code.");
        return;
    }

    // Create a structured QR data string
    let qrData = `
Medicine Information:
- Brand Name: ${editbrandName}
- Generic Name: ${editgenericName || 'N/A'}
- Medicine Category: ${editmedicineCategory}
- Dosage/Strength: ${editdosageStrength}
- Formulation Type: ${editformulationType}
- Dosage Frequency: ${editdosageFrequency}
- Description/Usage: ${editdescriptionUsage || 'N/A'}
- Batch Number: ${editbatchNumber}
- Expiration Date: ${editexpirationDate}
- Supplier/Manufacturer: ${editsupplier || 'N/A'}
`;

    let qrCode = new QRious({
        value: qrData,
        size: 140
    });

    // Get the data URL of the generated QR code
    let editqrCodeImg = qrCode.toDataURL();

    // Set the image source to the QR code data URL
    document.getElementById("edit-qr-code-img").src = editqrCodeImg;

    let editqrErrorMsg = document.getElementById("edit-qr-code-error");
    if (editqrErrorMsg) {
        editqrErrorMsg.style.display = "none";
    }

    return editqrCodeImg;
}

function resetEditForm() {
    // Reset all text inputs
    const textInputs = document.querySelectorAll("#edit-medicine-modal input[type='text'], #edit-medicine-modal input[type='number'], #edit-medicine-modal textarea");
    textInputs.forEach(input => input.value = "");

    // Reset file input
    const fileInput = document.getElementById("edit-medicine-image");
    fileInput.value = "";

    // Reset dropdowns
    const dropdowns = document.querySelectorAll("#edit-medicine-modal .custom-dropdown .selected-option");
    dropdowns.forEach(dropdown => {
        dropdown.textContent = "Choose Option";
    });

    // Reset checkboxes (contraindications)
    const checkboxes = document.querySelectorAll("#edit-contraindications .dropdown-options input[type='checkbox']");
    checkboxes.forEach(checkbox => checkbox.checked = false);

    // Reset image preview
    const imagePreviewContainer = document.getElementById("edit-image-preview-container");
    imagePreviewContainer.innerHTML = "";

    // Reset the Base64 string
    editMedicineImageBase64 = "";

    // Reset QR code image
    const qrCodeImage = document.getElementById("edit-qr-code-img");
    qrCodeImage.src = "";

    // Reset all error messages
    const editerrorMessages = document.querySelectorAll("#edit-medicine-modal .error-input-message");
    editerrorMessages.forEach(error => error.style.display = "none");

    // Reset validation state for required fields
    const requiredFields = [
        'edit-brand-name', 'edit-medicine-image', 'edit-medicine-category', 'edit-dosage-strength-dropdown', 
        'edit-prescription-required', 'edit-formulation-type', 'edit-dosage-frequency', 'edit-batch-number', 
        'edit-description-usage', 'edit-expiration-date', 'edit-stock-quantity', 'edit-reorder-level', 
        'edit-purchase-price', 'edit-selling-price'
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorMessage = document.getElementById(`${fieldId}-error`);
        if (errorMessage) {
            errorMessage.style.display = 'none';  // Ensure error messages are hidden
        }

        // Reset validation class if any field has it
        if (field && field.classList.contains('invalid')) {
            field.classList.remove('invalid');  // Remove invalid class
        }
    });

    // Reset QR code error message (if any)
    const editqrErrorMsg = document.getElementById("edit-qr-code-error");
    if (editqrErrorMsg) {
        editqrErrorMsg.style.display = 'none';
    }
}

