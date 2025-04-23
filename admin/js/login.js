function togglePassword() {
    var passwordField = document.getElementById("password");
    var eyeIcon = document.getElementById("eye-icon");

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
    duration: 4000, // Duration in milliseconds
    position: {
        x: 'right', // Position on the right
        y: 'top', // Position at the top
    },
    ripple: true, // Enable ripple effect
    dismissible: true // Allow dismissing notifications
});

document.getElementById("signup-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Get user input
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const submitBtn = document.querySelector(".submit");
    const spinner = document.querySelector(".spinner");
    const btnText = document.querySelector(".btn-text");

    // Special character validation (Only letters, numbers, @, and . allowed for email)
    const emailRegex = /^[a-zA-Z0-9@.]+$/;
    const passwordRegex = /[^a-zA-Z0-9]/;

    // Validate email
    if (!emailRegex.test(email)) {
        showNotification("Email address must only contain letters, numbers, @, and .", "error");
        return;
    }

    // Validate password
    if (passwordRegex.test(password)) {
        showNotification("Password must not contain special characters.", "error");
        return;
    }

    // Show spinner and disable button
    spinner.style.display = "inline-block";
    btnText.textContent = "Logging in...";
    submitBtn.disabled = true;

    try {
        const snapshot = await db.collection("admin_login")
            .where("email", "==", email)
            .where("password", "==", password)
            .get();

        if (!snapshot.empty) {
            // Get user data
            const userData = snapshot.docs[0].data();
            const firstName = userData.firstname;
            const lastName = userData.lastname;
            const fullName = `${firstName} ${lastName}`;
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

            localStorage.setItem("userFullName", fullName);
            localStorage.setItem("userInitials", initials);
            localStorage.setItem("userFirstName", firstName);
            localStorage.setItem("userLastName", lastName);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userPassword", password);


            // Redirect to dashboard
            showNotification("Login Successful", "success");
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 1500);
        } else {
            // Login failed
            showNotification("Invalid email or password. Please try again.", "error");
            resetButton();
        }
    } catch (error) {
        console.error("Error checking credentials:", error);
        showNotification("An error occurred. Please try again later.", "error");
        resetButton();
    }

    function resetButton() {
        spinner.style.display = "none";
        btnText.textContent = "Login";
        submitBtn.disabled = false;
    }
});



// Function to show notifications
function showNotification(message, type) {
    if (type === "success") {
        notyf.success(message); // Success notification
    } else {
        notyf.error(message); // Error notification
    }
}

// Prevent special characters from being entered in inputs
document.querySelectorAll(".input").forEach(input => {
    input.addEventListener("input", function () {
        // Allow letters, numbers, @, and . in email only
        if (input.id === "email" && /[^a-zA-Z0-9@.]/.test(this.value)) {
            showNotification("Email can only contain letters, numbers, @, and .", "error");
            this.value = this.value.replace(/[^a-zA-Z0-9@.]/g, ''); // Remove disallowed characters for email
        }
        // For password, allow only letters and numbers
        if (input.id === "password" && /[^a-zA-Z0-9]/.test(this.value)) {
            showNotification("Special characters are not allowed in the password!", "error");
            this.value = this.value.replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters
        }
    });
});
