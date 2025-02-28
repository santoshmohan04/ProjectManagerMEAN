import express from 'express';
import ParentTask from '../data_models/parenttask.js';

const parentTaskController = express.Router();

// List parent tasks
parentTaskController.get('/', async (req, res) => {
    try {
        const { searchKey } = req.query;
        const parentTaskQuery = ParentTask.find();

        if (searchKey) {
            parentTaskQuery.or([{ Parent_Task: { $regex: searchKey, $options: 'i' } }]);
        }

        const tasks = await parentTaskQuery.exec();
        res.json({ Success: true, Data: tasks });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

// Add new parent task
parentTaskController.post('/add', async (req, res) => {
    try {
        const parentTask = new ParentTask(req.body);
        await parentTask.save();
        res.status(200).json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false, Message: 'Error occurred while creating new task', Error: err.message });
    }
});

// Get single parent task
parentTaskController.get('/:id', async (req, res) => {
    const parentId = req.params.id;

    try {
        const task = await ParentTask.findOne({ Parent_ID: parentId });

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Parent task not found' });
        }

        res.json({ Success: true, Data: task });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

export default parentTaskController;