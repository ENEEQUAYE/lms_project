// public/js/register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date_of_birth: document.getElementById('date_of_birth').value,
        academic_year: document.getElementById('academic_year').value,
        role: document.getElementById('role').value,
        password: document.getElementById('password').value
    };

    const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (response.ok) {
        alert('User registered successfully');
    } else {
        alert(`Error: ${data.message}`);
    }
});
