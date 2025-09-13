import express from 'express';
import Task from '../data_models/task.js';
import Project from '../data_models/project.js';

const taskController = express.Router();

// List tasks of a specific project
taskController.get('/', async (req, res) => {
    try {
        const { projectId, sortKey } = req.query;
        const taskQuery = Task.find();

        if (projectId) {
            const project = await Project.findOne({ Project_ID: projectId });

            if (project) {
                taskQuery.or([{ Project: project._id }]);

                if (sortKey) {
                    const sortDirection = sortKey === "Status" ? -1 : 1;
                    taskQuery.sort([[sortKey, sortDirection]]);
                }

                const tasks = await taskQuery
                    .populate('Project')
                    .populate('User')
                    .populate('Parent')
                    .exec();

                return res.json({ Success: true, Data: tasks });
            } else {
                return res.status(404).json({ Success: false, Message: 'Project not found' });
            }
        } else {
            return res.status(400).json({ Success: false, Message: 'Project ID is required' });
        }
    } catch (err) {
        return res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

// Add new task
taskController.post('/add', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        return res.status(200).json({ Success: true });
    } catch (err) {
        return res.status(400).json({ Success: false, Message: err.message });
    }
});

// Get single task
taskController.get('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ Task_ID: taskId })
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

// Update task
taskController.post('/edit', async (req, res) => {
    try {
        const updateTask = req.body;
        const task = await Task.findOne({ Task_ID: updateTask.Task_ID });

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        Object.assign(task, updateTask);
        await task.save();
        return res.status(200).json({ Success: true });
    } catch (err) {
        return res.status(400).json({ Success: false, Message: 'Error occurred while updating task', Error: err.message });
    }
});

// End task
taskController.delete('/delete/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ Task_ID: taskId });

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        task.Status = 1; // Mark as completed
        await task.save();
        return res.status(200).json({ Success: true });
    } catch (err) {
        return res.status(400).json({ Success: false, Message: 'Error occurred while updating task', Error: err.message });
    }
});

export default taskController;