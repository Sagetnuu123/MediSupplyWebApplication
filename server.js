const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Twilio credentials (replace these with your actual credentials)
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER';

const client = new twilio(accountSid, authToken);

app.use(bodyParser.json());

// OTP generation function
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

// Endpoint to send OTP
app.post('/send-otp', (req, res) => {
    const { phoneNumber } = req.body; // The phone number to which OTP should be sent
    const otp = generateOTP(); // Generate OTP

    client.messages.create({
        body: `Your OTP code is: ${otp}`,
        from: twilioPhoneNumber,
        to: phoneNumber,
    })
    .then(message => {
        // Store OTP in memory or database for later validation (usually in a real-world app)
        console.log('OTP sent: ', otp);
        res.status(200).send({ message: 'OTP sent successfully!' });
    })
    .catch(error => {
        console.error('Error sending OTP: ', error);
        res.status(500).send({ message: 'Error sending OTP' });
    });
});

// Endpoint to verify OTP (to be used later)
app.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;
    // Verify the OTP (This is just a placeholder. You should implement actual OTP validation logic)
    // In real implementation, you would verify the OTP against the one saved in the database or in-memory cache.
    if (otp === '123456') {  // Replace with your actual OTP check logic
        res.status(200).send({ message: 'OTP verified successfully!' });
    } else {
        res.status(400).send({ message: 'Invalid OTP' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
