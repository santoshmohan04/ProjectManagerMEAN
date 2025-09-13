import express from 'express';
import Project from '../data_models/project.js';

const projectController = express.Router();

// List projects
projectController.get('/', async (req, res) => {
    try {
        const { searchKey, sortKey } = req.query;
        const projectQuery = Project.find();

        if (searchKey) {
            projectQuery.or([{ Project: { $regex: searchKey, $options: 'i' } }]);
        }

        if (sortKey) {
            projectQuery.sort([[sortKey, 1]]);
        }

        const projects = await projectQuery.populate('Tasks', ['Task_ID', 'Status']).exec();
        res.json({ Success: true, Data: projects });
        console.log(projects);
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

// Add new project
projectController.post('/add', async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(200).json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false, Message: 'Error occurred while creating new project', Error: err.message });
    }
});

// Update project
projectController.post('/edit/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await Project.findOne({ Project_ID: projectId });

        if (!project) {
            return res.status(404).json({ Success: false, Message: 'Project not found' });
        }

        Object.assign(project, req.body);
        await project.save();
        res.json({ Success: true });
    } catch (err) {
        res.status(400).json({ Success: false, Message: 'Error occurred while updating project', Error: err.message });
    }
});

// Delete project
projectController.delete('/delete/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        const result = await Project.deleteOne({ Project_ID: projectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ Success: false, Message: 'Project not found' });
        }

        res.json({ Success: true });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

// Get project
projectController.get('/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await Project.findOne({ Project_ID: projectId });

        if (!project) {
            return res.status(404).json({ Success: false, Message: 'Project not found' });
        }

        res.json({ Success: true, Data: project });
    } catch (err) {
        res.status(500).json({ Success: false, Message: 'An error occurred', Error: err.message });
    }
});

export default projectController;