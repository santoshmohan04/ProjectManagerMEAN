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
        res.status(201).json({ Success: true, Data: parentTask });
    } catch (err) {
        res.status(400).json({ Success: false, Message: 'Error occurred while creating new task', Error: err.message });
    }
});

// Get single parent task by _id
parentTaskController.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const task = await ParentTask.findById(id);

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Parent task not found' });
        }

        res.json({ Success: true, Data: task });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

// Update parent task
parentTaskController.put('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const updatedTask = await ParentTask.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ Success: false, Message: 'Parent task not found' });
        }

        res.json({ Success: true, Data: updatedTask });
    } catch (err) {
        res.status(400).json({ Success: false, Message: 'Error occurred while updating task', Error: err.message });
    }
});

// Delete parent task
parentTaskController.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTask = await ParentTask.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ Success: false, Message: 'Parent task not found' });
        }

        res.json({ Success: true, Message: 'Parent task deleted successfully' });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'Error occurred while deleting task', Error: err.message });
    }
});

export default parentTaskController;