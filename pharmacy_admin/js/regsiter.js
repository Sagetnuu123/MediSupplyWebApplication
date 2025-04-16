
// Toggle Password Visibility Function
function togglePassword(fieldId, eyeIcon) {
    var passwordField = document.getElementById(fieldId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    } else {
        passwordField.type = "password";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    }
}

// Validation for Add Pharmacy Password
function validatePassword() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var errorMessage = document.getElementById("password-error");

    if (confirmPassword.length > 0) { 
        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match!";
            errorMessage.style.display = "block";
            return false; // Return false if passwords don't match
        } else {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
            return true; // Return true if passwords match
        }
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return false;
    }
}

// Get today's date in YYYY-MM-DD format
let today = new Date().toISOString().split('T')[0];

// Set min attribute to prevent selecting past dates
document.getElementById("license-expiry").setAttribute("min", today);
document.getElementById("date-of-registration").setAttribute("min", today);

// Check Password Strength for Add Pharmacy
function checkPasswordStrength() {
    var password = document.getElementById("password").value;
    var strengthMessage = document.getElementById("password-strength");

    var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length === 0) {
        strengthMessage.textContent = "";
        strengthMessage.style.display = "none";
    } else if (!strongRegex.test(password)) {
        strengthMessage.textContent = "Weak password! Use at least 8 characters, one uppercase, one lowercase, one number, and one special character.";
        strengthMessage.style.color = "red";
        strengthMessage.style.display = "block";
    } else {
        strengthMessage.textContent = "✅ Strong password!";
        strengthMessage.style.color = "green";
        strengthMessage.style.display = "block";

        setTimeout(() => {
            strengthMessage.style.display = "none";
        }, 2000);
    }
}

// Function to validate input fields for special characters
function validateInputField(inputId, errorId) {
    var input = document.getElementById(inputId);
    var errorMessage = document.getElementById(errorId);

    // Custom rules for specific fields
    let specialCharRegex;
    
    if (inputId === "owners-address") {
        specialCharRegex = /[^a-zA-Z0-9\s,]/; // Allows letters, numbers, spaces, and commas
    } else if (inputId === "email") {
        specialCharRegex = /[^a-zA-Z0-9@.]/; // Allows standard email characters
    } else if (inputId === "contact-number" || inputId === "zipcode") {
        specialCharRegex = /[^0-9]/; // **Ensures only numbers are allowed**
    } else if (inputId === "tax-id" || inputId === "cert-number" || inputId === "license-number") {
        specialCharRegex = /[^a-zA-Z0-9-]/; // **Allows numbers and dashes (-) only**
    } else if (inputId === "barangay") {
        specialCharRegex = /[^a-zA-Z0-9\s().-]/; // Allows letters, numbers, spaces, parentheses (), dots ., and dashes -
    } else {
        specialCharRegex = /[^a-zA-Z0-9\s]/; // Default: letters, numbers, spaces only
    }

    if (specialCharRegex.test(input.value)) {
        errorMessage.textContent = "Invalid character detected!";
        errorMessage.style.display = "block";
        return false;
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return true;
    }
}

// Attach validation to input fields on keyup
document.getElementById("pharmacy-name").addEventListener("keyup", function() {
    validateInputField("pharmacy-name", "pharmacy-error");
});

document.getElementById("owner-name").addEventListener("keyup", function() {
    validateInputField("owner-name", "owners-error");
});

document.getElementById("contact-number").addEventListener("keyup", function() {
    validateInputField("contact-number", "contact-error");
});

document.getElementById("owners-address").addEventListener("keyup", function() {
    validateInputField("owners-address", "owners-address-error");
});

document.getElementById("email").addEventListener("keyup", function() {
    validateInputField("email", "pharmacy-email-error");
});

document.getElementById("street").addEventListener("keyup", function() {
    validateInputField("street", "street-error");
});

document.getElementById("barangay").addEventListener("keyup", function() {
    validateInputField("barangay", "barangay-error");
});

document.getElementById("municipality").addEventListener("keyup", function() {
    validateInputField("municipality", "municipality-error");
});

document.getElementById("province").addEventListener("keyup", function() {
    validateInputField("province", "province-error");
});

document.getElementById("zipcode").addEventListener("keyup", function() {
    validateInputField("zipcode", "zipcode-error");
});

document.getElementById("tax-id").addEventListener("keyup", function() {
    validateInputField("tax-id", "tax-error");
});

document.getElementById("cert-number").addEventListener("keyup", function() {
    validateInputField("cert-number", "certification-error");
});

document.getElementById("license-number").addEventListener("keyup", function() {
    validateInputField("license-number", "license-error");
});


const locations = {
    "Bohol": {
        "Loon": ["Agsoso", "Badbad Occidenta", "Badbad Oriental", "Bagacay Katipunan", "Bagacay Katipunan",
            "Bagacay Saong", "Bahi", "Basac", "Basdacu", "Basdio","Canhangdon Oriental","Cogon Norte", 
            "Canigaan", "Canmanoc", "Cansuagwit", "Cansubayon", "Cantam-is Bago", "Cantam-is Baslay", "Cantaongon",
            "Cantumocad","Catagbacan Handig", "Catagbacan Norte", "Catagbacan Sur", "Cogon Norte (Pob.)", "Cogon Sur",
            "Cuasi", "Genomoan", "Lintuan", "Looc", "Mocpoc Norte", "Mocpoc Sur","Nagtuang", "Napo (Pob.)",
             "Ugpong",],
        "Calape": ["Abucayan Norte", "Abucayan Sur", "Banlasan", "Bentig", "Binogawan", "Bonbon", "Bentig",
             "Cabayugan", "Cabudburan", "Calunasan", "Camias", "Canguha", "Catmonan","Desamparados (Pob.)",
            "Kahayag", "Kinabag-an", "Labuon", "Lawis", "Liboron"," Lo-oc", "Lomboy", "Lucob", "Madangog",
             "Magtongtong", "Mandaug", "Mantatao", "Sampoangon", "San Isidro", "Santa Cruz (Pob.)", "Sohoton",
             "Talisay","Tinibgan", "Tultugan", "Ulbujan",]
    }
};

// Load Cities when "Bohol" is selected
function loadCities() {
    const provinceSelect = document.getElementById("province");
    const municipalitySelect = document.getElementById("municipality");
    municipalitySelect.innerHTML = '<option value="" disabled selected class="disabled-option">Select Municipality</option>';
    municipalitySelect.disabled = false;

    if (provinceSelect.value === "Bohol") {
        Object.keys(locations["Bohol"]).forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            municipalitySelect.appendChild(option);
        });
    }
}

// Load Barangays when a city is selected
function loadBarangays() {
    const municipalitySelect = document.getElementById("municipality");
    const barangaySelect = document.getElementById("barangay");
    barangaySelect.innerHTML = '<option value="" disabled selected class="disabled-option">Select Barangay</option>';
    barangaySelect.disabled = false;

    const selectedMunicipality = municipalitySelect.value;
    if (selectedMunicipality) {
        locations["Bohol"][selectedMunicipality].forEach(barangay => {
            let option = document.createElement("option");
            option.value = barangay;
            option.textContent = barangay;
            barangaySelect.appendChild(option);
        });
    }
}



document.getElementById('add_pharmacy-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = document.getElementById('submit-btn');
    const spinner = document.getElementById('spinner');
    const checkbox = document.getElementById('acknowledge-checkbox');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('pharmacy-email-error');

    // **Check if checkbox is checked before allowing submission**
    if (!checkbox.checked) {
        alert("Please acknowledge that the email and password will be used for login.");
        return;
    }

    submitButton.disabled = true;
    spinner.style.visibility = "visible"; // Show spinner

    const notyf = new Notyf({
        duration: 3000,
        position: { x: 'right', y: 'top' },
        dismissible: true
    });

    // **Check password validation before proceeding**
    if (!validatePassword()) {
        setTimeout(() => {
            spinner.style.visibility = "hidden"; 
            submitButton.disabled = false;
        }, 800);
        return;
    }

    // **Validate all fields for special characters before submission**
    const fieldsToValidate = [
        { id: "pharmacy-name", errorId: "pharmacy-error" },
        { id: "owner-name", errorId: "owners-error" },
        { id: "contact-number", errorId: "contact-error" },
        { id: "owners-address", errorId: "owners-address-error" },
        { id: "email", errorId: "pharmacy-email-error" },
        { id: "street", errorId: "street-error" },
        { id: "barangay", errorId: "barangay-error" },
        { id: "municipality", errorId: "municipality-error" },
        { id: "province", errorId: "province-error" },
        { id: "zipcode", errorId: "zipcode-error" },
        { id: "tax-id", errorId: "tax-error" },
        { id: "cert-number", errorId: "certification-error" },
        { id: "license-number", errorId: "license-error" }
    ];

    let isValid = true;
    fieldsToValidate.forEach(({ id, errorId }) => {
        if (!validateInputField(id, errorId)) {
            isValid = false;
        }
    });

    // **If validation fails, stop form submission**
    if (!isValid) {
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        notyf.error("Invalid input detected. Remove special characters.");
        return;
    }

    // **Check if email already exists in register_pharmacy collection**
    try {
        const email = emailInput.value.trim().toLowerCase();
        const querySnapshot = await db.collection('register_pharmacy')
            .where('email', '==', email)
            .get();

        if (!querySnapshot.empty) {
            emailError.textContent = "This email is already exist. Please use a different one.";
            emailError.style.display = "block";
            notyf.error("Email is already in use. Please choose a different one.");
            spinner.style.visibility = "hidden";
            submitButton.disabled = false;
            return;
        } else {
            emailError.textContent = "";
            emailError.style.display = "none";
        }
    } catch (error) {
        console.error("Error checking email existence: ", error);
        notyf.error("Error verifying email. Please try again.");
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        return;
    }

    // **Continue saving if everything is valid**
    const pharmacyData = {
        pharmacy_name: document.getElementById('pharmacy-name').value,
        license_number: document.getElementById('license-number').value,
        owners_name: document.getElementById('owner-name').value,
        owners_address: document.getElementById('owners-address').value,
        email: document.getElementById('email').value,
        pharmacy_type: document.getElementById('pharmacy-type').value,
        street: document.getElementById('street').value,
        barangay: document.getElementById('barangay').value,
        municipality: document.getElementById('municipality').value,
        province: document.getElementById('province').value,
        zipcode: document.getElementById('zipcode').value,
        contact_num: document.getElementById('contact-number').value,
        start: convertTo12HourFormat(document.getElementById('start').value),
        close: convertTo12HourFormat(document.getElementById('close').value),
        days_open_from: document.getElementById('daysfrom').value,
        days_open_to: document.getElementById('daysto').value,
        TIN: document.getElementById('tax-id').value,
        business_permit: document.getElementById('cert-number').value,
        expiry_date: document.getElementById('license-expiry').value,
        date_registration: document.getElementById('date-of-registration').value,
        password: document.getElementById('password').value,
        status: "Pending",
    };

    // ✅ **Check if a medicine picture is uploaded**
    const pictureFile = document.getElementById('medicine-picture').files[0];
    if (pictureFile) {
        const reader = new FileReader();
        reader.readAsDataURL(pictureFile); // Convert image to Base64

        reader.onload = async function () {
            pharmacyData.med_picture = reader.result; // Store Base64 string
            await savePharmacyData(pharmacyData);
        };
    } else {
        pharmacyData.med_picture = ""; // No image uploaded
        await savePharmacyData(pharmacyData);
    }

    async function savePharmacyData(pharmacyData) {
        try {
            const docRef = await db.collection("temporary_pharmacy_registration").add(pharmacyData);

            // ✅ Store the document ID in sessionStorage
            sessionStorage.setItem("pendingPharmacyId", docRef.id);

            setTimeout(() => {
                window.location.href = "display_register.html";
            }, 1000);

        } catch (error) {
            console.error("Error saving data: ", error);
            notyf.error("Registration failed. Please try again.");
        } finally {
            spinner.style.visibility = "hidden";
            submitButton.disabled = false;
        }
    }
});

// ✅ **Convert 24-hour format to 12-hour format**
function convertTo12HourFormat(time) {
    if (!time) return "";
    let [hours, minutes] = time.split(":");
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}



function toggleSubmitButton() {
    var checkbox = document.getElementById("acknowledge-checkbox");
    var submitButton = document.getElementById("submit-btn");

    if (checkbox.checked) {
        submitButton.disabled = false;
        submitButton.classList.add("enabled");
    } else {
        submitButton.disabled = true;
        submitButton.classList.remove("enabled");
    }
}


function goBack() {
    document.getElementById("confirmBackModal").style.display = "flex";
}

// Function to close the confirmation modal
function closeConfirmModal() {
    document.getElementById("confirmBackModal").style.display = "none";
}

// Redirect to home if user confirms
function redirectToHome() {
    window.location.href = "notes.html";
}





