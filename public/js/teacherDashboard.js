$(document).ready(function() {
    $('#viewClassesBtn').click(loadClasses);
    $('#manageAssignmentsBtn').click(loadAssignments);
    $('#trackProgressBtn').click(loadStudentProgress);
    $('#createAssignmentForm').on('submit', createAssignment);
});

async function loadClasses() {
    $('#dashboardFeedback').html('<p>Loading classes...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/classes');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const classes = await response.json();
        $('#dashboardFeedback').html(`
            <h4>Your Classes</h4>
            <ul class="list-group">
                ${classes.map(cls => `<li class="list-group-item">${cls.className} - ${cls.schedule}</li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error('Error fetching classes:', error);
        $('#dashboardFeedback').html('<div class="alert alert-danger">Failed to load classes. Please try again.</div>');
    }
}

async function loadAssignments() {
    $('#dashboardFeedback').html('<p>Loading assignments...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/assignments');
        if (!response.ok) throw new Error('Network response was not ok');

        const assignments = await response.json();
        $('#dashboardFeedback').html(`
            <h4>Your Assignments</h4>
            <ul class="list-group">
                ${assignments.map(assign => `<li class="list-group-item">${assign.title} - Due: ${new Date(assign.dueDate).toLocaleDateString()}</li>`).join('')}
            </ul>
            <button class="btn btn-success" data-toggle="modal" data-target="#createAssignmentModal">Create Assignment</button>
        `);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        $('#dashboardFeedback').html('<div class="alert alert-danger">Failed to load assignments. Please try again.</div>');
    }
}

async function loadStudentProgress() {
    $('#dashboardFeedback').html('<p>Loading student progress...</p>');
    try {
        const response = await fetch('http://localhost:5000/api/progress');
        if (!response.ok) throw new Error('Network response was not ok');

        const progress = await response.json();
        $('#dashboardFeedback').html(`
            <h4>Student Progress</h4>
            <ul class="list-group">
                ${progress.map(prog => `<li class="list-group-item">${prog.studentName}: ${prog.grade}</li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error('Error fetching student progress:', error);
        $('#dashboardFeedback').html('<div class="alert alert-danger">Failed to load student progress. Please try again.</div>');
    }
}

async function createAssignment(e) {
    e.preventDefault();

    const title = $('#assignmentTitle').val();
    const description = $('#assignmentDescription').val();
    const dueDate = $('#assignmentDueDate').val();

    if (!title || !description || !dueDate) {
        $('#dashboardFeedback').html('<div class="alert alert-warning">All fields are required.</div>');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, dueDate })
        });

        if (response.ok) {
            $('#dashboardFeedback').html('<div class="alert alert-success">Assignment created successfully!</div>');
            $('#createAssignmentModal').modal('hide');
            loadAssignments(); // Refresh the assignments list
        } else {
            const errorData = await response.json();
            $('#dashboardFeedback').html(`<div class="alert alert-danger">${errorData.error || 'Failed to create assignment.'}</div>`);
        }
    } catch (error) {
        console.error('Error creating assignment:', error);
        $('#dashboardFeedback').html('<div class="alert alert-danger">Failed to create assignment. Please try again.</div>');
    }
}
