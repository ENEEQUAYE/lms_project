document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form submission
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value; // Assuming you have a select for role

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message); // Success message
            // Redirect based on role
            if (role.toLowerCase() === 'admin') {
                window.location.href = 'admin-dashboard.html'; // Redirect to admin dashboard
            } else if (role.toLowerCase() === 'staff') {
                window.location.href = 'teacher-dashboard.html'; // Redirect to staff dashboard
            } else if (role.toLowerCase() === 'student') {
                window.location.href = 'student-dashboard.html'; // Redirect to student dashboard
            }
        } else {
            alert(data.message); // Display error message
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});

