let medicineImageBase64 = "";
let medicineImageName = "";

function handleImageUpload() {
    const fileInput = document.getElementById("medicine-image");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];  // Define 'file' as the selected file
        const reader = new FileReader();

        reader.onloadend = function () {
            medicineImageBase64 = reader.result; // Store Base64 string

            let container = document.getElementById("image-preview-container");
            container.innerHTML = ""; // Clear previous preview

            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";

            let imgPreview = document.createElement("img");
            imgPreview.id = "medicine-image-preview";
            imgPreview.style.maxWidth = "100px";
            imgPreview.style.maxHeight = "100px";
            imgPreview.src = medicineImageBase64; // Set Base64 as image source

            let removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "&times;";
            removeBtn.onclick = function () {
                container.innerHTML = "";
                fileInput.value = "";
                medicineImageBase64 = ""; // Reset Base64 string
            };

            wrapper.appendChild(imgPreview);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        };

        reader.readAsDataURL(file); // Convert image to Base64
    }
}



function validateForm() {
    let isValid = true;

    const requiredFields = [
        { id: 'brand-name', errorId: 'brand-name-error', message: 'This field is required' },
        { id: 'medicine-image', errorId: 'medicine-image-error', message: 'This field is required' },
        { id: 'medicine-category', errorId: 'medicine-category-error', message: 'This field is required' },
        { id: 'dosage-strength-dropdown', errorId: 'dosage-strength-error', message: 'This field is required' },
        { id: 'prescription-required', errorId: 'prescription-required-error', message: 'This field is required' },
        { id: 'formulation-type', errorId: 'formulation-type-error', message: 'This field is required' },
        { id: 'dosage-frequency', errorId: 'dosage-frequency-error', message: 'This field is required' },
        { id: 'batch-number', errorId: 'batch-number-error', message: 'This field is required and must be a positive number' },
        { id: 'description-usage', errorId: 'description-usage-error', message: 'This field is required' },
        { id: 'expiration-date', errorId: 'expiration-date-error', message: 'This field is required' },
        { id: 'stock-quantity', errorId: 'stock-quantity-error', message: 'This field is required and must be greater than 0' },
        { id: 'reorder-level', errorId: 'reorder-level-error', message: 'This field is required and must be greater than 0' },
        { id: 'purchase-price', errorId: 'purchase-price-error', message: 'This field is required and must be greater than 0' },
        { id: 'selling-price', errorId: 'selling-price-error', message: 'This field is required and must be greater than 0' },
        { id: 'discount-price', errorId: 'discount-price-error', message: 'This field is required and must not be negative' },
    ];

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorMessage = document.getElementById(field.errorId);

        if (!input || !errorMessage) return;

        if (input.tagName === "INPUT" && (input.type === "text" || input.type === "number")) {
            const value = input.value.trim();

            if (!value) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isValid = false;
            } else if (
                ['stock-quantity', 'reorder-level', 'purchase-price', 'selling-price'].includes(field.id) &&
                (isNaN(value) || Number(value) <= 0)
            ) {
                errorMessage.textContent = 'Value must be greater than 0';
                errorMessage.style.display = 'block';
                isValid = false;
            } else if (
                field.id === 'batch-number' &&
                (isNaN(value) || Number(value) <= 0)
            ) {
                errorMessage.textContent = 'Batch number must be a positive number';
                errorMessage.style.display = 'block';
                isValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        else if (input.type === "file") {
            if (input.files.length === 0) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        else if (input.classList.contains('custom-dropdown')) {
            const selectedOption = input.querySelector('.selected-option');
            if (!selectedOption || selectedOption.textContent.trim().startsWith("Choose")) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        else if (input.tagName === "TEXTAREA") {
            if (!input.value.trim()) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }
    });

    // ✅ QR code validation
    let qrCodeImg = document.getElementById("qr-code-img");
    let qrErrorMsg = document.getElementById("qr-code-error");

    if (!qrCodeImg || !qrCodeImg.src || qrCodeImg.src === "" || qrCodeImg.src.startsWith("file:///") || !qrCodeImg.src.startsWith("data:image/png;base64")) {
        qrErrorMsg.textContent = "Please generate the QR Code before saving.";
        qrErrorMsg.style.display = "block";
        qrErrorMsg.style.color = "red";
        isValid = false;
    } else {
        qrErrorMsg.style.display = "none";
    }

    if (!isValid) {
        notyf.error("Please correct the highlighted errors before saving.");
    }

    return isValid;
}




document.addEventListener("DOMContentLoaded", function () {
    const contraindicationsDropdown = document.getElementById("contraindications");
    const selectedOption = contraindicationsDropdown.querySelector(".selected-option");
    const dropdownOptions = contraindicationsDropdown.querySelector(".dropdown-options");
    const checkboxes = dropdownOptions.querySelectorAll("input[type='checkbox']");

    // Toggle dropdown visibility
    contraindicationsDropdown.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdownOptions.style.display = dropdownOptions.style.display === "block" ? "none" : "block";
    });

    // Prevent closing when clicking inside the dropdown
    dropdownOptions.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // Update the selected option text when checkboxes change
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            updateSelectedContraindications();
        });
    });

    function updateSelectedContraindications() {
        const selectedValues = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        selectedOption.textContent = selectedValues.length ? selectedValues.join(", ") : "Choose Contraindications";
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function () {
        dropdownOptions.style.display = "none";
    });
});

const notyf = new Notyf({
    position: { x: 'center', y: 'top' }, 
    duration: 3000,
    ripple: true, 
    dismissible: true 
});

// Event listener for saving the medicine data
document.querySelector('.save-btn').addEventListener('click', saveMedicineData);

let isSaving = false; // Prevents multiple submissions

async function saveMedicineData(event) {
    event.preventDefault(); // Prevent default form submission

    if (isSaving) return; // Prevent multiple submissions
    isSaving = true; // Set flag to prevent duplicates

    const saveButton = document.querySelector('.save-btn');
    saveButton.disabled = true; // Disable the button

    if (!validateForm()) {
        isSaving = false; // Allow submission again
        saveButton.disabled = false;
        return;
    }

    // Get the logged-in user's email and pharmacy name
    const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
    const pharmacyName = sessionStorage.getItem('pharmacyName');
    const latitude = sessionStorage.getItem('latitude');  // Get latitude from sessionStorage
    const longitude = sessionStorage.getItem('longitude'); // Get longitude from sessionStorage

    if (!pharmacyEmail) {
        notyf.error('You need to be logged in to add medicine.');
        isSaving = false;
        saveButton.disabled = false;
        return;
    }

    // Collect form data
    let brandName = document.getElementById("brand-name").value.trim();
    let genericName = document.getElementById("generic-name").value.trim();
    let medicineCategory = document.querySelector("#medicine-category .selected-option").textContent.trim();
    let dosageStrength = document.querySelector("#dosage-strength-dropdown .selected-option").textContent.trim();
    let formulationType = document.querySelector("#formulation-type .selected-option").textContent.trim();
    let dosageFrequency = document.querySelector("#dosage-frequency .selected-option").textContent.trim();
    let descriptionUsage = document.getElementById("description-usage").value.trim();
    let batchNumber = document.getElementById("batch-number").value.trim();
    let expirationDate = document.getElementById("expiration-date").value.trim();
    let supplier = document.getElementById("supplier").value.trim();
    let stockQuantity = document.getElementById("stock-quantity").value.trim();
    let reorderLevel = document.getElementById("reorder-level").value.trim();
    let purchasePrice = document.getElementById("purchase-price").value.trim();
    let sellingPrice = document.getElementById("selling-price").value.trim();
    let discountPrice = document.getElementById("discount-price").value.trim();
    let prescriptionRequired = document.querySelector("#prescription-required .selected-option").textContent.trim();
    let contraindications = Array.from(document.querySelectorAll('#contraindications .dropdown-options input[type="checkbox"]:checked'))
        .map(input => input.value);
    let storageConditions = document.getElementById("storage-conditions").value.trim();
    let sideEffects = document.getElementById("side-effects").value.trim();
    let qrCodeDataUrl = document.getElementById("qr-code-img").src.trim();

    // Ensure all required fields are filled
    if (!brandName || !medicineCategory || !dosageStrength || !formulationType || !dosageFrequency || !batchNumber || !expirationDate || !stockQuantity || !reorderLevel || !purchasePrice || !sellingPrice || !qrCodeDataUrl) {
        notyf.error("Please fill all required fields before saving.");
        isSaving = false;
        saveButton.disabled = false;
        return;
    }

    if (!medicineImageBase64) {
        notyf.error('Please upload an image.');
        isSaving = false;
        saveButton.disabled = false;
        return;
    }

    medicineImageName = document.getElementById("medicine-image").files[0]?.name || "";

    try {
        // 🔹 **Check if the medicine already exists before adding**
        const querySnapshot = await db.collection('medicine_storage')
            .where('brandName', '==', brandName)
            .where('pharmacyEmail', '==', pharmacyEmail)
            .get();

        if (!querySnapshot.empty) {
            notyf.error('This medicine already exists in the database.');
            isSaving = false;
            saveButton.disabled = false;
            return;
        }

        // 🔹 **Prepare the medicine data object**
        const medicineData = {
            brandName,
            genericName,
            medicineCategory,
            dosageStrength,
            formulationType,
            dosageFrequency,
            descriptionUsage,
            batchNumber,
            expirationDate,
            supplier,
            stockQuantity,
            reorderLevel,
            purchasePrice,
            sellingPrice,
            prescriptionRequired,
            contraindications,
            storageConditions,
            sideEffects,
            discountPrice,
            medicineImageBase64,
            medicineImageName,
            qrCodeDataUrl,
            pharmacyName,
            pharmacyEmail,
            latitude, // Save latitude
            longitude, // Save longitude
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // 🔹 **Save to Firestore**
        await db.collection('medicine_storage').add(medicineData);

        // 🔹 **Notify the user**
        notyf.success('Medicine saved successfully!');

        clearFormFields();

        // 🔹 **Reset the form**
        document.querySelector('.product-form').reset();
        document.getElementById("qr-code-img").src = "";
        document.getElementById("image-preview-container").innerHTML = "";
        medicineImageBase64 = ""; 

        const imagePreviewContainer = document.getElementById("image-preview-container");
        imagePreviewContainer.innerHTML = "";
        imagePreviewContainer.style.display = "none";

        const removeBtn = document.querySelector(".remove-btn");
        if (removeBtn) {
            removeBtn.style.display = "none";
        }

        // Optionally, reset focus to the first input field
        document.getElementById("brand-name").focus();

    } catch (error) {
        console.error("Error adding document: ", error);
        notyf.error('An error occurred while saving the medicine.');
    }

    // 🔹 **Re-enable the button after processing**
    isSaving = false;
    saveButton.disabled = false;
}



document.querySelectorAll('.product-form input, .product-form select, .product-form textarea, .product-form .custom-dropdown').forEach(field => {
    field.addEventListener('input', hideAllErrors);
    field.addEventListener('click', hideAllErrors);
});

// ✅ Fix: Hide all error messages when selecting a dropdown option
document.querySelectorAll('.custom-dropdown .dropdown-options li').forEach(option => {
    option.addEventListener('click', function () {
        hideAllErrors(); // Hide all errors when selecting an option
        const dropdown = this.closest('.custom-dropdown');
        const selectedOption = dropdown.querySelector('.selected-option');
        selectedOption.textContent = this.textContent; // Update selected option text
    });
});

// ✅ Function to hide all error messages at once
function hideAllErrors() {
    document.querySelectorAll('.error-input-message').forEach(errorMessage => {
        errorMessage.style.display = 'none';
    });
}

// Function to clear all fields
function clearFormFields() {
    document.getElementById("brand-name").value = "";
    document.getElementById("generic-name").value = "";

    // Manually set default labels for dropdowns
    document.querySelector("#medicine-category .selected-option").textContent = "Choose Medicine Category";
    document.querySelector("#dosage-strength-dropdown .selected-option").textContent = "Choose Dosage/Strength";
    document.querySelector("#formulation-type .selected-option").textContent = "Choose Formulation/Type";
    document.querySelector("#dosage-frequency .selected-option").textContent = "Choose Dosage Frequency";
    document.querySelector("#prescription-required .selected-option").textContent = "Choose Yes or No"; // Reset the Prescription Required dropdown
    
    // Reset the Contraindications dropdown selections
    const contraindicationCheckboxes = document.querySelectorAll("#contraindications .dropdown-options input[type='checkbox']");
    contraindicationCheckboxes.forEach(checkbox => checkbox.checked = false);
    document.querySelector("#contraindications .selected-option").textContent = "Choose Contraindications";

    // Other form fields to reset
    document.getElementById("description-usage").value = "";
    document.getElementById("batch-number").value = "";
    document.getElementById("expiration-date").value = "";
    document.getElementById("supplier").value = "";
    document.getElementById("stock-quantity").value = "";
    document.getElementById("reorder-level").value = "";
    document.getElementById("purchase-price").value = "";
    document.getElementById("selling-price").value = "";
    document.getElementById("discount-price").value = "";

    // Reset any custom dropdowns to the default option
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dropdown => {
        const id = dropdown.getAttribute('id');
        if (id === "medicine-category") {
            dropdown.querySelector('.selected-option').textContent = "Choose Medicine Category";
        } else if (id === "dosage-strength-dropdown") {
            dropdown.querySelector('.selected-option').textContent = "Choose Dosage/Strength";
        } else if (id === "formulation-type") {
            dropdown.querySelector('.selected-option').textContent = "Choose Formulation/Type";
        } else if (id === "dosage-frequency") {
            dropdown.querySelector('.selected-option').textContent = "Choose Dosage Frequency";
        } else if (id === "prescription-required") {
            dropdown.querySelector('.selected-option').textContent = "Choose Yes or No";
        } else if (id === "contadictions") {
            dropdown.querySelector('.selected-option').textContent = "Choose Contraindications";
        }
    });

    // Clear any uploaded file (if needed)
    document.getElementById("medicine-image").value = "";

    // Reset the QR code image
    document.getElementById("qr-code-img").src = "";
}


document.querySelector(".clear-btn").addEventListener("click", function () {
    // Select all input fields and clear their values
    document.querySelectorAll(".product-form input").forEach(input => {
        if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false; // Uncheck checkboxes and radio buttons
        } else {
            input.value = ""; // Clear text, number, and date inputs
        }
    });

    // Select all textareas and clear them
    document.querySelectorAll(".product-form textarea").forEach(textarea => {
        textarea.value = "";
    });

    // Reset dropdowns to default
    document.querySelectorAll(".custom-dropdown .selected-option").forEach(dropdown => {
        dropdown.textContent = dropdown.getAttribute("data-default") || "Choose an option";
    });

    // Clear error messages
    document.querySelectorAll(".error-input-message").forEach(error => {
        error.textContent = "";
    });

    // Clear image previews
    document.getElementById("image-preview-container").innerHTML = "";
    document.getElementById("qr-code-img").src = "";

    // Optionally, reset focus to the first input field
    document.getElementById("brand-name").focus();
});



// Add QR code generation functionality if necessary
function generateQR() {
    let brandName = document.getElementById("brand-name").value;
    let genericName = document.getElementById("generic-name").value;
    let medicineCategory = document.querySelector("#medicine-category .selected-option").textContent;
    let dosageStrength = document.querySelector("#dosage-strength-dropdown .selected-option").textContent;
    let formulationType = document.querySelector("#formulation-type .selected-option").textContent;
    let dosageFrequency = document.querySelector("#dosage-frequency .selected-option").textContent;
    let descriptionUsage = document.getElementById("description-usage").value;
    let batchNumber = document.getElementById("batch-number").value;
    let expirationDate = document.getElementById("expiration-date").value;
    let supplier = document.getElementById("supplier").value;

    // Ensure all required fields are filled before generating QR code
    if (!brandName || !medicineCategory || !dosageStrength || !formulationType || !dosageFrequency || !batchNumber || !expirationDate) {
        notyf.error("Please fill all required fields before generating the QR Code.");
        return;
    }

    // Create a structured QR data string
    let qrData = `
Medicine Information:
- Brand Name: ${brandName}
- Generic Name: ${genericName || 'N/A'}
- Medicine Category: ${medicineCategory}
- Dosage/Strength: ${dosageStrength}
- Formulation Type: ${formulationType}
- Dosage Frequency: ${dosageFrequency}
- Description/Usage: ${descriptionUsage || 'N/A'}
- Batch Number: ${batchNumber}
- Expiration Date: ${expirationDate}
- Supplier/Manufacturer: ${supplier || 'N/A'}
`;

    let qrCode = new QRious({
        value: qrData,
        size: 140
    });

    // Get the data URL of the generated QR code
    let qrCodeImg = qrCode.toDataURL();

    // Set the image source to the QR code data URL
    document.getElementById("qr-code-img").src = qrCodeImg;

    let qrErrorMsg = document.getElementById("qr-code-error");
    if (qrErrorMsg) {
        qrErrorMsg.style.display = "none";
    }
}