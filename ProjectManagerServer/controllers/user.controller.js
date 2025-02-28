import express from 'express';
import User from '../data_models/user.js';

const userController = express.Router();

// List users
userController.get('/', async (req, res) => {
    try {
        const userQuery = User.find();
        const { searchKey, sortKey } = req.query;

        if (searchKey) {
            userQuery.or([
                { 'First_Name': { $regex: searchKey, $options: 'i' } },
                { 'Last_Name': { $regex: searchKey, $options: 'i' } }
            ]);
        }

        if (sortKey) {
            userQuery.sort([[sortKey, 1]]);
        }

        const users = await userQuery.exec();
        res.json({ Success: true, Data: users });
    } catch (err) {
        res.json({ Success: false });
    }
});

// Add new user
userController.post('/add', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(200).json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false, Message: 'Error occurred while creating new user' });
    }
});

// Update user
userController.post('/edit/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findOne({ User_ID: userId });
        if (!user) return res.status(404).json({ Success: false, Message: 'User  not found' });

        Object.assign(user, req.body);
        await user.save();
        res.json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false });
    }
});

// Delete user
userController.delete('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await User.deleteOne({ User_ID: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ Success: false, Message: 'User  not found' });
        }
        res.json({ Success: true });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'Error occurred while deleting user' });
    }
});

// Get user
userController.get('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findOne({ User_ID: userId });
        if (!user) return res.status(404).json({ Success: false, Message: 'User  not found' });

        res.json({ Success: true, Data: user });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'Error occurred while fetching user' });
    }
});

// Assign project as Manager
userController.post('/assign/project/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findOne({ User_ID: userId });
        if (!user) return res.status(404).json({ Success: false, Message: 'User  not found' });

        user.Project_ID = req.body.Project_ID;
        await user.save();
        res.json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false });
    }
});

// Assign new task
userController.post('/assign/task/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findOne({ User_ID: userId });
        if (!user) return res.status(404).json({ Success: false, Message: 'User  not found' });

        user.Task_ID = req.body.Task_ID;
        await user.save();
        res.json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false });
    }
});

export default userController;