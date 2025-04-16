// Initialize Notyf
const notyf = new Notyf({
    duration: 5000,  // Duration for notifications
    position: { x: 'right', y: 'top' }, // Position of the notification
    dismissible: true // Allows notifications to be dismissed manually
});

function goBack() {
    window.location.href = 'home.html';
}

document.getElementById('toggle-password').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        this.textContent = 'Hide';
    } else {
        passwordField.type = 'password';
        this.textContent = 'Show';
    }
});


// Firebase configuration and initialization (already included)

document.querySelector('#login-btn').addEventListener('click', login);

async function login() {
    const loginBtn = document.getElementById('login-btn');
    const spinner = document.getElementById('login-spinner');
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Show spinner and disable button
    loginBtn.disabled = true;
    spinner.style.display = "inline-block"; // Show the spinner

    // Allow UI to update before validation starts
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!email || !password) {
        notyf.error('Please enter both email and password.');
        resetLoginButton();
        return;
    }

    try {
        const querySnapshot = await db.collection('register_pharmacy').where('email', '==', email).get();

        if (querySnapshot.empty) {
            notyf.error('Invalid email or password. Please try again.');
            resetLoginButton();
            return;
        }

        let foundAccount = false;
        let correctPassword = false;
        let accountStatus = null;
        let pharmacyName = '';

        querySnapshot.forEach(doc => {
            const data = doc.data();
            foundAccount = true;
            accountStatus = data.status;
            pharmacyName = data.pharmacy_name;
            latitude = data.latitude;
            longitude = data.longitude; 
            if (data.password === password) {
                correctPassword = true;
            }
        });

        if (!foundAccount) {
            notyf.error('Invalid email or password. Please try again.');
            resetLoginButton();
            return;
        }

        if (!correctPassword) {
            notyf.error('Invalid email or password. Please try again.');
            resetLoginButton();
            return;
        }

        sessionStorage.setItem('pharmacyEmail', email);
        sessionStorage.setItem('pharmacyName', pharmacyName);
        sessionStorage.setItem('latitude', latitude);  // Store latitude
        sessionStorage.setItem('longitude', longitude); // Store longitude

        // Process account status
        handleStatus(accountStatus);

    } catch (error) {
        console.error('Error during login:', error);
        notyf.error('Your registration is still pending approval. Please wait for confirmation.');
        resetLoginButton();
    }
}

// Reset button state after validation
function resetLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    const spinner = document.getElementById('login-spinner');

    spinner.style.display = "none"; // Hide spinner
    loginBtn.disabled = false;
}

function handleStatus(status) {
    switch (status) {
        case 'Pending':
            notyf.warning('Your registration is still pending approval. Please wait for confirmation.');
            resetLoginButton();
            break;
        case 'Inactive':
            notyf.warning('Your account is currently inactive. Please contact support for assistance.');
            resetLoginButton();
            break;
        case 'Registered':
            notyf.success('Login successful!');
            setTimeout(() => {
                window.location.href = 'pharmacy_acc.html';
            }, 1500); // Delay to allow user to see success message
            break;
        default:
            notyf.error('Unknown account status. Please contact support.');
            resetLoginButton();
    }
}
