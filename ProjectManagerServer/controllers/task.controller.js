import express from 'express';
import Task from '../data_models/task.js';

const taskController = express.Router();

/**
 * GET /tasks
 * - List tasks
 * - Optional query params:
 *    projectId = filter by project
 *    parentId  = filter by parent task (subtasks)
 *    searchKey = search by title
 *    sortKey   = sort by any field (default asc)
 */
taskController.get('/', async (req, res) => {
    try {
        const { projectId, parentId, searchKey, sortKey } = req.query;
        const query = Task.find();

        if (projectId) query.where('Project').equals(projectId);
        if (parentId) query.where('Parent').equals(parentId);
        if (searchKey) query.where('Title', new RegExp(searchKey, 'i'));

        if (sortKey) {
            query.sort({ [sortKey]: 1 });
        }

        const tasks = await query
            .populate('Project')
            .populate('User')
            .populate('Parent')
            .exec();

        res.json({ Success: true, Data: tasks });
    } catch (err) {
        res.status(500).json({
            Success: false,
            Message: 'Error while fetching tasks',
            Error: err.message,
        });
    }
});

/**
 * POST /tasks/add
 * - Create a new task (or subtask if Parent is provided)
 */
taskController.post('/add', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json({ Success: true, Data: task });
    } catch (err) {
        res.status(400).json({
            Success: false,
            Message: 'Error while creating task',
            Error: err.message,
        });
    }
});

/**
 * GET /tasks/:id
 * - Get a single task by _id
 */
taskController.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('Project')
            .populate('User')
            .populate('Parent');

        if (!task) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        res.json({ Success: true, Data: task });
    } catch (err) {
        res.status(500).json({
            Success: false,
            Message: 'Error while fetching task',
            Error: err.message,
        });
    }
});

/**
 * PUT /tasks/:id
 * - Update a task by _id
 */
taskController.put('/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        res.json({ Success: true, Data: updatedTask });
    } catch (err) {
        res.status(400).json({
            Success: false,
            Message: 'Error while updating task',
            Error: err.message,
        });
    }
});

/**
 * DELETE /tasks/:id
 * - Delete a task by _id
 */
taskController.delete('/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ Success: false, Message: 'Task not found' });
        }

        res.json({ Success: true, Message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({
            Success: false,
            Message: 'Error while deleting task',
            Error: err.message,
        });
    }
});

export default taskController;
