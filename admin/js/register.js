function togglePassword(inputId, iconId) {
    var passwordField = document.getElementById(inputId);
    var eyeIcon = document.getElementById(iconId);

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

// Initialize Notyf
const notyf = new Notyf({
    duration: 3000, // Default duration for success/error alerts
    position: { x: "right", y: "top" }, // Position of alerts
    dismissible: true, // Allow user to close alerts
    ripple: true // Adds a ripple effect
});

document.getElementById("signup-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Get user input
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const submitBtn = document.querySelector(".submit");
    const spinner = document.querySelector(".spinner");
    const btnText = document.querySelector(".btn-text");

    // Special character validation
    const emailRegex = /^[a-zA-Z0-9@.]+$/;
    const passwordRegex = /[^a-zA-Z0-9]/;

    // Validate email
    if (!emailRegex.test(email)) {
        notyf.error("Email must contain only letters, numbers, @, and .");
        return;
    }

    // Validate password
    if (passwordRegex.test(password)) {
        notyf.error("Password must not contain special characters.");
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        notyf.error("Passwords do not match.");
        return;
    }

    // Show spinner and disable button
    spinner.style.display = "inline-block";
    btnText.textContent = "Registering...";
    submitBtn.disabled = true;

    try {
        // Check if email already exists
        const snapshot = await db.collection("admin_login").where("email", "==", email).get();

        if (!snapshot.empty) {
            notyf.error("Email already exists. Use a different one.");
            resetButton();
            return;
        }

        // Save new admin to Firestore
        await db.collection("admin_login").add({
            firstname: firstName,
            lastname: lastName,
            email: email,
            password: password // Consider hashing before storing
        });

        // Show success notification
        notyf.success("Registration successful!");

        // Wait for the success message to disappear, then show the warning
        setTimeout(() => {
            notyf.open({
                type: "warning",
                message: "Please remember your password. You will need it to log in.",
                duration: 5000, // Stay visible for 5 seconds
                position: { x: "right", y: "top" }, // Same position
                background: "orange", // Improved visibility
                dismissible: true
            });

            // Redirect after the warning message disappears
            setTimeout(() => {
                window.location.href = "login.html";
            }, 5000); // Redirect after 5 seconds
        }, 3100); // Ensure it appears only after the success alert disappears

    } catch (error) {
        console.error("Error saving data:", error);
        notyf.error("An error occurred. Please try again later.");
        resetButton();
    }

    function resetButton() {
        spinner.style.display = "none";
        btnText.textContent = "Register Admin";
        submitBtn.disabled = false;
    }
});

// Prevent special characters in input fields
document.querySelectorAll(".input").forEach(input => {
    input.addEventListener("input", function () {
        if ((input.id === "first-name" || input.id === "last-name") && /[^a-zA-Z\s]/.test(this.value)) {
            notyf.error("Only letters and spaces are allowed in names.");
            this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
        }
        
        if ((input.id === "password" || input.id === "confirm-password") && /[^a-zA-Z0-9]/.test(this.value)) {
            notyf.error("Special characters are not allowed in passwords.");
            this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
        }

        if (input.id === "email" && /[^a-zA-Z0-9@.]/.test(this.value)) {
            notyf.error("Email can only contain letters, numbers, @, and .");
            this.value = this.value.replace(/[^a-zA-Z0-9@.]/g, '');
        }
    });
});
