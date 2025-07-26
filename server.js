const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: './backend/.env' });

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json()); 

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465,              
    secure: true,          
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API endpoint for sending email
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: process.env.RECIPIENT_EMAIL, 
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <p>You have a new contact message from your portfolio website:</p>
                <h3>Contact Details:</h3>
                <ul>
                    <li>Name: ${name}</li>
                    <li>Email: ${email}</li>
                </ul>
                <h3>Message:</h3>
                <p>${message}</p>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        res.status(200).json({ msg: 'Message sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ msg: 'Failed to send message.', error: error.message });
    }
});

// API endpoint to view/serve the resume as a PDF
app.get('/view-resume', (req, res) => {
    
    const resumePdfFileName = 'Pooja_Bansode_Resume.pdf'; 
    const resumePath = path.join(__dirname, 'files', resumePdfFileName);

    console.log(`Attempting to serve PDF from: ${resumePath}`);

    fs.access(resumePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`ERROR: Resume PDF file not found at: ${resumePath}`);
            return res.status(404).json({ msg: 'Resume PDF file not found on the server.' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + resumePdfFileName + '"');

        // Send the file
        res.sendFile(resumePath, (err) => {
            if (err) {
                console.error('ERROR: Error sending resume PDF file:', err);
                res.status(500).json({ msg: 'Could not retrieve resume PDF due to server error.' });
            } else {
                console.log('Resume PDF file sent successfully.');
            }
        });
    });
});

app.get('/', (req, res) => {
    res.send('Portfolio Backend is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access backend at: http://localhost:${port}`); 
});
