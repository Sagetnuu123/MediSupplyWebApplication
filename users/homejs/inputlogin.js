const notyf = new Notyf();

document.getElementById('nextBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    let errorMessages = [];

    // Reset error display
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.classList.remove('show');
    errorDisplay.innerHTML = '';

    // Validate first and last names
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    if (!/^[a-zA-Z\s]+$/.test(firstName)) {
        errorMessages.push("First name should contain only letters.");
    }
    if (!/^[a-zA-Z\s]+$/.test(lastName)) {
        errorMessages.push("Last name should contain only letters.");
    }

    // Validate email format
    const email = document.getElementById('signupEmail').value;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errorMessages.push("Please enter a valid email address.");
    }

    // Validate phone number (only numbers, 11 digits)
    const phone = document.getElementById('phone').value;
    if (!/^\d{11}$/.test(phone)) {
        errorMessages.push("Phone number should be exactly 11 digits.");
    }

    // Validate postcode (only numbers, 4 digits)
    const postcode = document.getElementById('postcode').value;
    if (!/^\d{4}$/.test(postcode)) {
        errorMessages.push("Postcode should be exactly 4 digits.");
    }

    // If there are error messages, show them
    if (errorMessages.length > 0) {
        errorDisplay.classList.add('show');
        errorDisplay.innerHTML = errorMessages.join("<br>");

        // Hide the error display after 4 seconds
        setTimeout(() => {
            errorDisplay.classList.remove('show');
            errorDisplay.innerHTML = '';
        }, 4000);  // Hide after 4 seconds
        return; // Stop further execution
    }

    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('nextBtn').innerText = 'Sign Up';

    errorDisplay.classList.remove('show');

});

// Restrict input to only numbers for phone and postcode and enforce max length
document.getElementById('phone').addEventListener('input', function(event) {
    // Allow only numeric input, removing any non-digit characters
    this.value = this.value.replace(/\D/g, '');

    // Limit the length to 11 digits
    if (this.value.length > 11) {
        this.value = this.value.slice(0, 11);
    }
});

document.getElementById('postcode').addEventListener('input', function(event) {
    // Allow only numeric input, removing any non-digit characters
    this.value = this.value.replace(/\D/g, '');

    // Limit the length to 4 digits
    if (this.value.length > 4) {
        this.value = this.value.slice(0, 4);
    }
});


document.getElementById('nextBtn').addEventListener('click', function(event) {
    if (this.innerText === 'Sign Up') {
        const password = document.getElementById('password').value;
        const passwordError = document.getElementById('passwordError');
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    
        if (!passwordRegex.test(password)) {
            passwordError.innerText = 'Password must be at least 8 characters, include at least one letter and one number.';
            return;
        } else {
            passwordError.innerText = '';
        }
    
        const email = document.getElementById('signupEmail').value;
    
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
    
                // Send email verification
                user.sendEmailVerification().then(() => {
                    notyf.success('Verification email sent! Please check your inbox.');
    
                    // Now save the user info in Firestore
                    const userData = {
                        uid: user.uid,
                        firstName: document.getElementById('firstName').value,
                        lastName: document.getElementById('lastName').value,
                        email: email,
                        phone: document.getElementById('phone').value,
                        postcode: document.getElementById('postcode').value,
                        gender: document.getElementById('gender').value,
                        ageRange: document.getElementById('ageRange').value
                    };
    
                    saveToFirebase(userData);
                }).catch((error) => {
                    console.error("Error sending verification email:", error);
                    notyf.error("Failed to send verification email.");
                });
            })
            .catch((error) => {
                console.error("Sign-up error:", error);
                notyf.error(error.message);
            });
    }    
});

// Function to save the user data to Firebase
function saveToFirebase(userData) {
    console.log("Saving user data with UID:", userData.uid);
    db.collection('sign_up_user').doc(userData.uid).set(userData)
        .then(() => {
            console.log("User data saved to Firestore");
            clearForm();
        })
        .catch((error) => {
            console.error("Error saving to Firestore:", error);
        });
}

function clearForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('postcode').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('ageRange').value = '';
    document.getElementById('password').value = '';
    document.getElementById('passwordField').style.display = 'none'; // Hide password field
    document.getElementById('nextBtn').innerText = 'Next'; // Reset button text
}


document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
});

document.getElementById('toggleLoginPassword').addEventListener('click', function() {
    const loginPasswordField = document.getElementById('loginPassword');
    const type = loginPasswordField.type === 'password' ? 'text' : 'password';
    loginPasswordField.type = type;
});



document.getElementById('loginBtn').addEventListener('click', function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordloginError');

    emailError.innerText = '';
    passwordError.innerText = '';

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (!user.emailVerified) {
                notyf.error("Please verify your email before logging in.");
                firebase.auth().signOut(); // Sign them out
                return;
            }

            notyf.success("Login successful!");

            // Clear login form fields
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';

            // Now you can fetch user data from Firestore
            db.collection("sign_up_user").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    console.log("User Profile:", userData);
            
                    // ✅ Store userData in localStorage
                    localStorage.setItem('userData', JSON.stringify(userData));
            
                    // Redirect after storing data
                    setTimeout(() => {
                        window.location.href = 'accountuser.html';
                    }, 1000);
            
                } else {
                    console.log("No user data found.");
                    notyf.error("No profile data found.");
                }
            });
        })
        .catch((error) => {
            console.error("Login failed:", error); // This can stay for debugging
        
            const errorCode = error.code || error.message;
        
            switch (errorCode) {
                case 'auth/user-not-found':
                    emailError.innerText = "No account found with this email.";
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-credential': // Catch Firebase's newer error
                case 'INVALID_LOGIN_CREDENTIALS': // Extra safety
                    passwordError.innerText = "Incorrect password. Please try again.";
                    break;
                case 'auth/too-many-requests':
                    passwordError.innerText = "Too many failed attempts. Please try again later.";
                    break;
                case 'auth/invalid-email':
                    emailError.innerText = "Invalid email format.";
                    break;
                default:
                    passwordError.innerText = "Login failed. Please check your email and password.";
                    break;
            }
        });        
});


document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const emailError = document.getElementById('emailError');

    emailError.innerText = ''; // Reset any previous error

    if (!email) {
        emailError.innerText = "Please enter your email first to reset password.";
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            notyf.success("Password reset email sent! Please check your inbox.");
        })
        .catch((error) => {
            console.error("Error sending reset email:", error);
            if (error.code === 'auth/user-not-found') {
                emailError.innerText = "No account found with this email.";
            } else if (error.code === 'auth/invalid-email') {
                emailError.innerText = "Invalid email address.";
            } else {
                emailError.innerText = error.message;
            }
        });
});
