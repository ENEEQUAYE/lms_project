const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb'); // MongoDB driver with ObjectId
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory

// MongoDB Atlas connection URI
const uri = 'mongodb+srv://emmanuelneequaye294:quEsBsoaStEPNcKC@cluster0.zfy7b.mongodb.net/';
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const database = client.db('lms_db');
        const usersCollection = database.collection('users');
        const paymentsCollection = database.collection('payments');
        const coursesCollection = database.collection('courses');
        const assignmentsCollection = database.collection('assignments'); // Add assignments collection

        // Register new user
        app.post('/api/register', async (req, res) => {
            const { name, email, date_of_birth, registration_date, academic_year, role, password } = req.body;

            // Generate unique ID
            const lastUser = await usersCollection.findOne({}, { sort: { _id: -1 } });
            const userId = lastUser ? `CSTG${String(parseInt(lastUser.userId.substring(4)) + 1).padStart(6, '0')}` : 'CSTG000001';
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = { userId, name, email, date_of_birth, registration_date, academic_year, role, password: hashedPassword };
            await usersCollection.insertOne(newUser);
            res.status(201).json({ message: 'User registered successfully', userId });
        });

        // Login user
        app.post('/api/login', async (req, res) => {
            const { email, password, role } = req.body;
            const user = await usersCollection.findOne({ email });

            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            if (user.role.toLowerCase() !== role.toLowerCase()) {
                return res.status(403).json({ message: 'You do not have permission to access this role' });
            }

            res.status(200).json({ message: 'Login successful', user });
        });

        // Get all users
        app.get('/api/users', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.status(200).json(users);
        });

        // Add new course
        app.post('/api/courses', async (req, res) => {
            const { name, description, schedule, prerequisites } = req.body;
            const newCourse = { name, description, schedule, prerequisites };
            await coursesCollection.insertOne(newCourse);
            res.status(201).json({ message: 'Course added successfully' });
        });

        // Get all courses
        app.get('/api/courses', async (req, res) => {
            const courses = await coursesCollection.find().toArray();
            res.status(200).json(courses);
        });

        // Delete a course
        app.delete('/api/courses/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 1) {
                    res.status(200).json({ message: 'Course deleted successfully' });
                } else {
                    res.status(404).json({ message: 'Course not found' });
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Update a course
        app.put('/api/courses/:id', async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;

            try {
                const result = await coursesCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );

                if (result.modifiedCount === 1) {
                    res.status(200).json({ message: 'Course updated successfully' });
                } else {
                    res.status(404).json({ message: 'Course not found' });
                }
            } catch (error) {
                console.error('Error updating course:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Delete user
        app.delete('/api/users/:id', async (req, res) => {
            const userId = req.params.id;
            try {
                await usersCollection.deleteOne({ userId });
                res.status(200).json({ message: 'User deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting user' });
            }
        });

        // Update user
        app.put('/api/users/:id', async (req, res) => {
            const userId = req.params.id;
            const { name, email, role } = req.body;
            try {
                const result = await usersCollection.updateOne(
                    { userId },
                    { $set: { name, email, role } }
                );

                if (result.modifiedCount === 1) {
                    res.status(200).json({ message: 'User updated successfully' });
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
            } catch (error) {
                res.status(500).json({ message: 'Error updating user' });
            }
        });

        // Reset password
        app.post('/api/users/:id/reset-password', async (req, res) => {
            const userId = req.params.id; // Using custom userId, not MongoDB _id
            const { password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            try {
                const result = await usersCollection.updateOne(
                    { userId }, // Match by userId field, not _id
                    { $set: { password: hashedPassword } }
                );

                if (result.modifiedCount > 0) {
                    res.json({ message: 'Password reset successfully.' });
                } else {
                    res.status(404).json({ message: 'User not found.' });
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                res.status(500).json({ message: 'An error occurred while resetting the password.' });
            }
        });

        // Endpoint to create a new assignment
        app.post('/api/assignments', async (req, res) => {
            const { title, description, dueDate } = req.body;

            // Check for missing fields
            if (!title || !description || !dueDate) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            try {
                // Create a new assignment object
                const newAssignment = {
                    title,
                    description,
                    dueDate,
                };

                // Save the assignment to the database
                const result = await assignmentsCollection.insertOne(newAssignment);

                // Respond with the created assignment and a success message
                res.status(201).json({ message: 'Assignment created successfully', assignment: result.ops[0] });
            } catch (error) {
                console.error('Error creating assignment:', error);
                res.status(500).json({ error: 'Failed to create assignment' });
            }
        });

        // Endpoint to get all classes (You may need to define this in your database)
        app.get('/api/classes', async (req, res) => {
            try {
                const classes = await database.collection('classes').find().toArray(); // Adjust as necessary
                res.status(200).json(classes);
            } catch (error) {
                console.error('Error fetching classes:', error);
                res.status(500).json({ message: 'Failed to fetch classes.' });
            }
        });

        // Endpoint to create a new class
        app.post('/api/classes', async (req, res) => {
            const { className, classDescription } = req.body;

            try {
                const newClass = { className, classDescription };
                await database.collection('classes').insertOne(newClass); // Adjust as necessary
                res.status(201).json({ message: 'Class created successfully!', class: newClass });
            } catch (error) {
                console.error('Error creating class:', error);
                res.status(500).json({ message: 'Failed to create class.' });
            }
        });

        // Endpoint to delete a class
        app.delete('/api/classes/:id', async (req, res) => {
            const classId = req.params.id;

            try {
                await database.collection('classes').deleteOne({ _id: ObjectId(classId) }); // Adjust as necessary
                res.status(200).json({ message: 'Class deleted successfully!' });
            } catch (error) {
                console.error('Error deleting class:', error);
                res.status(500).json({ message: 'Failed to delete class.' });
            }
        });

        // Listen on a specified port
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

run().catch(console.dir);
