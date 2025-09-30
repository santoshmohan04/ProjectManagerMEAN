import express from "express";
import Task from "../data_models/task.js";

const taskController = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks
 *     tags: [Tasks]
 *     description: |
 *       Retrieves a list of tasks with optional filters.
 *       - `projectId` = filter by project
 *       - `parentId` = filter by parent task (subtasks)
 *       - `searchKey` = search by title (case-insensitive)
 *       - `sortKey` = sort by any field (default ascending)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter tasks by parent task ID
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search tasks by title
 *       - in: query
 *         name: sortKey
 *         schema:
 *           type: string
 *         description: Sort by a specific field (default ascending)
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
taskController.get("/", async (req, res) => {
  try {
    const { projectId, parentId, searchKey, sortKey } = req.query;
    const query = Task.find();

    if (projectId) query.where("Project").equals(projectId);
    if (parentId) query.where("Parent").equals(parentId);
    if (searchKey) query.where("Title", new RegExp(searchKey, "i"));

    if (sortKey) {
      query.sort({ [sortKey]: 1 });
    }

    const tasks = await query
      .populate("Project")
      .populate("User")
      .populate("Parent")
      .exec();

    res.json({ Success: true, Data: tasks });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: "Error while fetching tasks",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /tasks/add:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     description: Creates a new task. If `Parent` is provided, it will be created as a subtask.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid request
 */
taskController.post("/add", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ Success: true, Data: task });
  } catch (err) {
    res.status(400).json({
      Success: false,
      Message: "Error while creating task",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
taskController.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("Project")
      .populate("User")
      .populate("Parent");

    if (!task) {
      return res
        .status(404)
        .json({ Success: false, Message: "Task not found" });
    }

    res.json({ Success: true, Data: task });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: "Error while fetching task",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Task not found
 */
taskController.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedTask) {
      return res
        .status(404)
        .json({ Success: false, Message: "Task not found" });
    }

    res.json({ Success: true, Data: updatedTask });
  } catch (err) {
    res.status(400).json({
      Success: false,
      Message: "Error while updating task",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
taskController.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res
        .status(404)
        .json({ Success: false, Message: "Task not found" });
    }

    res.json({ Success: true, Message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: "Error while deleting task",
      Error: err.message,
    });
  }
});

export default taskController;
