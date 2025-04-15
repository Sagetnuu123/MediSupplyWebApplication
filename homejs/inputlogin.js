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
        // Password validation
        const password = document.getElementById('password').value;
        const passwordError = document.getElementById('passwordError');
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/; // Password must be at least 8 characters, contain at least one letter and one number

        if (!passwordRegex.test(password)) {
            passwordError.innerText = 'Password must be at least 8 characters, include at least one letter and one number.';
            return;
        } else {
            passwordError.innerText = ''; // Clear any previous error
        }

        // Collect the data from the form
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('signupEmail').value,
            phone: document.getElementById('phone').value,
            postcode: document.getElementById('postcode').value,
            gender: document.getElementById('gender').value,
            ageRange: document.getElementById('ageRange').value,
            password: password // Add the password to the user data
        };

        // Save the data to Firebase
        saveToFirebase(userData);
    }
});

// Function to save the user data to Firebase
function saveToFirebase(userData) {
    const db = firebase.firestore(); // Assuming Firebase is initialized

    // You can create a "sign_up_user" collection and save the data
    db.collection('sign_up_user').add(userData)
        .then(function(docRef) {
            notyf.success('Sign up successful!');
            console.log("Document written with ID: ", docRef.id);
            // Optionally, you could close the modal or clear the form here

            clearForm();
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
            alert('An error occurred while signing up.');
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



document.getElementById('loginBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    // Collect input data
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Clear previous error messages
    document.getElementById('emailError').innerHTML = '';
    document.getElementById('passwordloginError').innerHTML = '';

    // Validate Email
    const userSnapshot = await db.collection('sign_up_user').where("email", "==", email).get();

    if (userSnapshot.empty) {
        // If no user with this email exists
        document.getElementById('emailError').innerHTML = 'Invalid email address.';
    } else {
        // If email exists, validate the password
        let userFound = false;
        userSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.password === password) {
                // Password matches
                userFound = true;
                // Proceed with login
                localStorage.setItem('userData', JSON.stringify(userData));
                notyf.success('Login successful!');
                window.location.href = 'accountuser.html';                
            }
        });

        if (!userFound) {
            // If password does not match
            document.getElementById('passwordloginError').innerHTML = 'Incorrect password.';
        }
    }
});