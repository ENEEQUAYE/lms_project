$(document).ready(function () {
    // Load the dashboard content by default
    loadDashboard();

    // Event listeners for navigation links
    $('#dashboardLink').click(loadDashboard);
    $('#addUsersLink').click(addUsers);
    $('#manageUsersLink').click(loadUsers);
    $('#manageCoursesLink').click(loadCourses);
    $('#viewReportsLink').click(loadReports);
    $('#settingsLink').click(loadSettings);
    $('#logoutBtn').click(logout);
});

function loadDashboard() {
    $('.dashboard-content').html(`
        <h3>Welcome, Admin!</h3>
        <p>This is your dashboard where you can manage users, courses, and view reports.</p>
    `);
}


function addUsers() {
    $('.dashboard-content').html(`
        <h3>Manage Users</h3>
        <form id="userForm">
            <div class="form-group">
                <label for="userName">Name</label>
                <input type="text" class="form-control" id="userName" required>
            </div>
            <div class="form-group">
                <label for="userEmail">Email</label>
                <input type="email" class="form-control" id="userEmail" required>
            </div>
            <div class="form-group">
                <label for="userRole">Role</label>
                <select class="form-control" id="userRole" required>
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Student">Student</option>
                </select>
            </div>
            <div class="form-group">
                <label for="userPassword">Password</label>
                <input type="password" class="form-control" id="userPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Add User</button>
        </form>
        <div id="userFeedback" class="mt-3"></div>
    `);

    // Add event listener for the form submission
    $('#userForm').submit(async function (event) {
        event.preventDefault(); // Prevent default form submission
        
        const name = $('#userName').val();
        const email = $('#userEmail').val();
        const role = $('#userRole').val();
        const password = $('#userPassword').val();

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, role, password }), // Include other required fields
            });

            const data = await response.json();

            if (response.ok) {
                $('#userFeedback').html(`<div class="alert alert-success">${data.message}</div>`); // Show success message
                $('#userForm')[0].reset(); // Reset the form
            } else {
                $('#userFeedback').html(`<div class="alert alert-danger">${data.message}</div>`); // Show error message
            }
        } catch (error) {
            console.error('Error adding user:', error);
            $('#userFeedback').html('<div class="alert alert-danger">An error occurred. Please try again.</div>');
        }
    });
}



function loadUsers() {
    $('.dashboard-content').html(`
        <h3>Manage Users</h3>
        <table class="table mt-3" id="usersTable">
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="usersTableBody">
                <!-- User rows will be appended here -->
            </tbody>
        </table>
        <div id="userFeedback" class="mt-3"></div>
    `);

    fetchUsers();

    $('#addUserBtn').click(showUserForm);
}

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:5000/api/users');
        const users = await response.json();
        const usersTableBody = $('#usersTableBody');
        usersTableBody.empty(); // Clear existing rows

        users.forEach(user => {
            usersTableBody.append(`
                <tr>
                    <td>${user.userId}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editUser('${user.userId}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.userId}')">Delete</button>
                         <button class="btn btn-info btn-sm" onclick="resetPassword('${user.userId}')">Reset Password</button>
                    </td>
                </tr>
            `);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function resetPassword(userId) {
    if ($('#resetPasswordModal').length) {
        $('#resetPasswordModal').remove(); // Remove any existing modal
    }

    // Append the modal for password reset
    $('.dashboard-content').append(`
        <div class="modal fade" id="resetPasswordModal" tabindex="-1" role="dialog" aria-labelledby="resetPasswordModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="resetPasswordModalLabel">Reset Password</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="resetPasswordForm">
                            <input type="hidden" id="resetUserId" value="${userId}">
                            <div class="form-group">
                                <label for="newPassword">New Password</label>
                                <input type="password" class="form-control" id="newPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Update Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#resetPasswordModal').modal('show');

    // Handle the form submission for resetting the password
    $('#resetPasswordForm').submit(async function(event) {
        event.preventDefault();
        const newPassword = $('#newPassword').val();

        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (response.ok) {
                $('#resetPasswordModal').modal('hide');
                alert('Password updated successfully!');
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('An error occurred while resetting the password. Please try again.');
        }
    });
}


function showUserForm(user = null) {
    const userId = user ? user.userId : '';
    const name = user ? user.name : '';
    const email = user ? user.email : '';
    const role = user ? user.role : '';

    // Ensure modal structure is added correctly
    if ($('#userFormModal').length) {
        $('#userFormModal').remove(); // Remove any existing modal
    }

    $('.dashboard-content').append(`
        <div class="modal fade" id="userFormModal" tabindex="-1" role="dialog" aria-labelledby="userFormModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="userFormModalLabel">${user ? 'Edit User' : 'Add User'}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="userForm">
                            <input type="hidden" id="userId" value="${userId}">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" class="form-control" id="name" value="${name}" required>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" value="${email}" required>
                            </div>
                            <div class="form-group">
                                <label for="role">Role</label>
                                <select class="form-control" id="role" required>
                                    <option value="">Select Role</option>
                                    <option value="Admin" ${role === 'Admin' ? 'selected' : ''}>Admin</option>
                                    <option value="Staff" ${role === 'Staff' ? 'selected' : ''}>Staff</option>
                                    <option value="Student" ${role === 'Student' ? 'selected' : ''}>Student</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="userPassword">Password</label>
                                <input type="password" class="form-control" id="userPassword" ${user ? '' : 'required'}>
                            </div>
                            <button type="submit" class="btn btn-primary">${user ? 'Update' : 'Add'} User</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#userFormModal').modal('show');

    $('#userForm').on('submit', function(event) {
        event.preventDefault();
        const id = $('#userId').val();
        const userData = {
            name: $('#name').val(),
            email: $('#email').val(),
            role: $('#role').val(),
        };
        
        // Include password only when adding a new user
        if (!user) {
            userData.password = $('#userPassword').val();
        }

        if (user) {
            updateUser(id, userData);
        } else {
            addUser(userData);
        }
    });
}

async function updateUser(userId, userData) {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.ok) {
            $('#userFormModal').modal('hide');
            fetchUsers(); // Refresh user list
            alert('User updated successfully!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user. Please try again.');
    }
}


async function deleteUser(userId) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                alert('User deleted successfully!');
                fetchUsers(); // Refresh user list
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user. Please try again.');
        }
    }
}

async function editUser(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (!response.ok) {
            const errorText = await response.text();  // Capture the error response
            throw new Error(errorText || 'Unknown error occurred');
        }
        const user = await response.json();
        showUserForm(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        alert('An error occurred while fetching user data. Please try again.');
    }
}

function showUserForm(user = null) {
    console.log('Show User Form called', user); // Debug log

    const userId = user ? user.userId : '';
    const name = user ? user.name : '';
    const email = user ? user.email : '';
    const role = user ? user.role : '';

    // Ensure modal structure is added correctly
    if ($('#userFormModal').length) {
        $('#userFormModal').remove(); // Remove any existing modal
    }

    $('.dashboard-content').append(`
        <div class="modal fade" id="userFormModal" tabindex="-1" role="dialog" aria-labelledby="userFormModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="userFormModalLabel">${user ? 'Edit User' : 'Add User'}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="userForm">
                            <input type="hidden" id="userId" value="${userId}">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" class="form-control" id="name" value="${name}" required>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" value="${email}" required>
                            </div>
                            <div class="form-group">
                                <label for="role">Role</label>
                                <select class="form-control" id="role" required>
                                    <option value="">Select Role</option>
                                    <option value="Admin" ${role === 'Admin' ? 'selected' : ''}>Admin</option>
                                    <option value="Staff" ${role === 'Staff' ? 'selected' : ''}>Staff</option>
                                    <option value="Student" ${role === 'Student' ? 'selected' : ''}>Student</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">${user ? 'Update' : 'Add'} User</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#userFormModal').modal('show');

    $('#userForm').on('submit', function(event) {
        event.preventDefault();
        const id = $('#userId').val();
        const userData = {
            name: $('#name').val(),
            email: $('#email').val(),
            role: $('#role').val(),
        };

        if (user) {
            updateUser(id, userData); // Update user if in edit mode
        } else {
            addUser(userData); // Add user if in add mode
        }
    });
}


// Initial load
$(document).ready(loadUsers);


function loadCourses() {
    $('.dashboard-content').html(`
        <h3>Manage Courses</h3>
        <form id="courseForm">
            <div class="form-group">
                <label for="courseName">Course Name</label>
                <input type="text" class="form-control" id="courseName" required>
            </div>
            <div class="form-group">
                <label for="courseDescription">Description</label>
                <textarea class="form-control" id="courseDescription" required></textarea>
            </div>
            <div class="form-group">
                <label for="courseSchedule">Schedule</label>
                <input type="text" class="form-control" id="courseSchedule" required>
            </div>
            <div class="form-group">
                <label for="coursePrerequisites">Prerequisites</label>
                <input type="text" class="form-control" id="coursePrerequisites">
            </div>
            <button type="submit" class="btn btn-primary">Add Course</button>
        </form>
        <hr>
        <h4>Existing Courses</h4>
        <div id="coursesList"></div>
    `);

    // Fetch existing courses
    fetchCourses();

    // Handle form submission
    $('#courseForm').submit(async function (event) {
        event.preventDefault();
        
        const courseData = {
            name: $('#courseName').val(),
            description: $('#courseDescription').val(),
            schedule: $('#courseSchedule').val(),
            prerequisites: $('#coursePrerequisites').val(),
        };
    
        try {
            let response;
            if (currentEditingCourseId) {
                // Update course
                response = await fetch(`http://localhost:5000/api/courses/${currentEditingCourseId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData),
                });
                currentEditingCourseId = null; // Reset after update
            } else {
                // Create new course
                response = await fetch('http://localhost:5000/api/courses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData),
                });
            }
    
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchCourses(); // Refresh the course list
                $('#courseForm')[0].reset(); // Reset form fields
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error adding/updating course:', error);
            alert('An error occurred while processing the course. Please try again.');
        }
    });
}    

async function fetchCourses() {
    try {
        const response = await fetch('http://localhost:5000/api/courses');
        const courses = await response.json();
        
        const coursesList = $('#coursesList');
        coursesList.empty(); // Clear existing list

        courses.forEach(course => {
            coursesList.append(`
                <div>
                    <strong>${course.name}</strong>: ${course.description}
                    <button class="btn btn-danger btn-sm ml-2" onclick="deleteCourse('${course._id}')">Delete</button>
                    <button class="btn btn-info btn-sm ml-2" onclick="editCourse('${course._id}')">Edit</button>
                </div>
            `);
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        alert('An error occurred while fetching courses. Please try again.');
    }
}

async function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchCourses(); // Refresh the course list
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('An error occurred while deleting the course. Please try again.');
        }
    }
}

let currentEditingCourseId = null;

function editCourse(courseId) {
    currentEditingCourseId = courseId;
    const course = courses.find(c => c._id === courseId); // Find the course by ID

    if (course) {
        $('#courseName').val(course.name);
        $('#courseDescription').val(course.description);
        $('#courseSchedule').val(course.schedule);
        $('#coursePrerequisites').val(course.prerequisites);
    }
}



function loadReports() {
    $('.dashboard-content').html(`
        <h3>View Reports</h3>
        <p>Here you can view various reports.</p>
    `);
    // Fetch and display report data here
}

function loadSettings() {
    $('.dashboard-content').html(`
        <h3>Settings</h3>
        <p>Here you can adjust system settings.</p>
    `);
    // Add settings management logic here
}

function logout() {
    // Handle logout logic (e.g., clear session, redirect to login)
    window.location.href = 'index.html'; // Redirect to login page
}
