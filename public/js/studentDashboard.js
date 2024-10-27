$(document).ready(function() {
    // Load initial data when the page loads
    loadOverview();

    // Event listeners for sidebar links
    $('#overviewLink').click(loadOverview);
    $('#myProfileLink').click(loadProfile);
    $('#assignmentsLink').click(loadAssignments);
    $('#testsLink').click(loadTests);
    $('#gradebookLink').click(loadGradebook);
    $('#resourcesLink').click(loadResources);
});

// Function to load overview (enrolled course description)
async function loadOverview() {
    $('#dashboardContent').html('<p>Loading course overview...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/student/course');
        const course = await response.json();
        $('#dashboardContent').html(`
            <h2>Overview</h2>
            <p><strong>Course Name:</strong> ${course.name}</p>
            <p><strong>Description:</strong> ${course.description}</p>
        `);
    } catch (error) {
        console.error('Error loading course overview:', error);
        $('#dashboardContent').html('<div class="alert alert-danger">Failed to load course overview.</div>');
    }
}

// Function to load student's profile information
async function loadProfile() {
    $('#dashboardContent').html('<p>Loading profile...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/student/profile');
        const profile = await response.json();
        $('#dashboardContent').html(`
            <h2>My Profile</h2>
            <img src="${profile.pictureUrl}" alt="Profile Picture" class="profile-pic mb-3">
            <p><strong>Name:</strong> ${profile.name}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>Contact:</strong> ${profile.contact}</p>
            <h4>Fee Payment History</h4>
            <p><strong>Balance:</strong> $${profile.balance}</p>
            <ul>
                ${profile.paymentHistory.map(payment => `<li>${payment.date}: $${payment.amount}</li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error('Error loading profile:', error);
        $('#dashboardContent').html('<div class="alert alert-danger">Failed to load profile.</div>');
    }
}

// Function to load assignments
async function loadAssignments() {
    $('#dashboardContent').html('<p>Loading assignments...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/student/assignments');
        const assignments = await response.json();
        $('#dashboardContent').html(`
            <h2>Assignments</h2>
            <ul class="list-group">
                ${assignments.map(assignment => `
                    <li class="list-group-item">
                        <strong>${assignment.title}</strong> - Due: ${assignment.dueDate}
                    </li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error('Error loading assignments:', error);
        $('#dashboardContent').html('<div class="alert alert-danger">Failed to load assignments.</div>');
    }
}

// Function to load tests and quizzes
async function loadTests() {
    $('#dashboardContent').html('<p>Loading tests and quizzes...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/student/tests');
        const tests = await response.json();
        $('#dashboardContent').html(`
            <h2>Tests and Quizzes</h2>
            <ul class="list-group">
                ${tests.map(test => `
                    <li class="list-group-item">
                        <strong>${test.title}</strong> - Due: ${test.dueDate}
                    </li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error('Error loading tests and quizzes:', error);
        $('#dashboardContent').html('<div class="alert alert-danger">Failed to load tests and quizzes.</div>');
    }
}

// Function to load gradebook
async function loadGradebook() {
    $('#dashboardContent').html('<p>Loading gradebook...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/student/grades');
        const grades = await response.json();
        $('#dashboardContent').html(`
            <h2>Gradebook</h2>
            <ul class="list-group">
                ${grades.map(grade => `
                    <li class="list-group-item">
                        <strong>${grade.assignment}</strong> - Score: ${grade.score}%
                    </li>`).join('')}
            </ul>
            <p><strong>Average Grade:</strong> ${grades.average}%</p>
        `);
    } catch (error) {
        console.error('Error loading gradebook:', error);
        $('#dashboardContent').html('<div class="alert alert-danger">Failed to load gradebook.</div>');
    }
}

// Function to load resources
async function loadResources() {
    $('#dashboardContent').html('<p>Loading resources...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/student/resources');
        const resources = await response.json();
        $('#dashboardContent').html(`
            <h2>Resources</h2>
            <ul class="list-group">
                ${resources.map(resource => `
                    <li class="list-group-item">
                        <a href="${resource.url}" target="_blank">${resource.title}</a>
                    </li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error('Error loading resources:', error);
        $('#dashboardContent').html('<div class="alert alert-danger">Failed to load resources.</div>');
    }
}
