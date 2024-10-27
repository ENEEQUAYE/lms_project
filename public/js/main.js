// main.js

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const role = document.getElementById('role').value;
    const userID = document.getElementById('userID').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message); // Success message

            // Redirect user based on their role
            if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (role === 'staff') {
                window.location.href = 'staff-dashboard.html';
            } else if (role === 'student') {
                window.location.href = 'student-dashboard.html';
            }
        } else {
            alert(data.message); // Display error message if login fails
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login.');
    }
});
