import express from 'express';
import Task from '../data_models/task.js';
import Project from '../data_models/project.js';
import ParentTask from '../data_models/parenttask.js';

const taskController = express.Router();

// List tasks (and parent tasks) for a specific project
taskController.get('/', async (req, res) => {
    try {
        const { projectId, sortKey } = req.query;

        if (!projectId) {
            return res.status(400).json({ Success: false, Message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ Success: false, Message: 'Project not found' });
        }

        // Find all tasks linked to the project
        const taskQuery = Task.find({ Project: project._id })
            .populate('Project')
            .populate('User')
            .populate('Parent');

        if (sortKey) {
            const sortDirection = sortKey === 'Status' ? -1 : 1;
            taskQuery.sort([[sortKey, sortDirection]]);
        }

        const tasks = await taskQuery.exec();

        // Find parent tasks for this project
        const parentTasks = await ParentTask.find({ Project_ID: project._id });

        return res.json({
            Success: true,
            Data: {
                Tasks: tasks,
                ParentTasks: parentTasks
            }
        });
    } catch (err) {
        return res.status(500).json({
            Success: false,
            Message: 'An error occurred',
            Error: err.message
        });
    }
});

// Add new task
taskController.post('/add', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        return res.status(201).json({ Success: true, Data: newTask });
    } catch (err) {
        return res.status(400).json({ Success: false, Message: err.message });
    }
});

// Get single task by _id
taskController.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('Project')
            .populate('User')
            .populate('Parent');

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        return res.json({ Success: true, Data: task });
    } catch (err) {
        return res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

// Update task by _id
taskController.put('/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        return res.status(200).json({ Success: true, Data: updatedTask });
    } catch (err) {
        return res.status(400).json({ Success: false, Message: 'Error occurred while updating task', Error: err.message });
    }
});

// End task (mark complete)
taskController.delete('/delete/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        task.Status = 1; // Mark as completed
        await task.save();

        return res.status(200).json({ Success: true, Message: 'Task marked as completed' });
    } catch (err) {
        return res.status(400).json({ Success: false, Message: 'Error occurred while updating task', Error: err.message });
    }
});

export default taskController;