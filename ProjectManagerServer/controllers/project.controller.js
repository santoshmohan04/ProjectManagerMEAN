import express from "express";
import Project from "../data_models/project.js";

const projectController = express.Router();
/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     description: Returns a list of all projects, optionally filtered and sorted.
 *     parameters:
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search term for project name
 *       - in: query
 *         name: sortKey
 *         schema:
 *           type: string
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Success:
 *                   type: boolean
 *                 Data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

projectController.get("/", async (req, res) => {
  try {
    const { searchKey, sortKey } = req.query;

    let filter = {};
    if (searchKey) {
      const safeSearch = escapeRegex(searchKey);
      filter = { $or: [{ Project: { $regex: safeSearch, $options: "i" } }] };
    }

    let query = Project.find(filter);

    const allowedSortKeys = ["Project", "Priority", "Start_Date", "End_Date"];
    if (sortKey && allowedSortKeys.includes(sortKey)) {
      query = query.sort({ [sortKey]: 1 });
    }

    const projects = await query
      .populate("Tasks", ["Task_ID", "Status"])
      .exec();

    res.json({ Success: true, Data: projects });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: "An error occurred",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /projects/add:
 *   post:
 *     summary: Add a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project added successfully
 *       400:
 *         description: Error occurred while creating new project
 */
projectController.post("/add", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(200).json({ Success: true });
  } catch (err) {
    res.status(400).json({
      Success: false,
      Message: "Error occurred while creating new project",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /projects/edit/{id}:
 *   post:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Error occurred while updating project
 *       404:
 *         description: Project not found
 */
projectController.post("/edit/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const project = await Project.findByIdAndUpdate(projectId, req.body, {
      new: true,
    });

    if (!project) {
      return res
        .status(404)
        .json({ Success: false, Message: "Project not found" });
    }

    res.json({ Success: true, Data: project });
  } catch (err) {
    res.status(400).json({
      Success: false,
      Message: "Error occurred while updating project",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /projects/delete/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: An error occurred
 */
projectController.delete("/delete/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const result = await Project.findByIdAndDelete(projectId);

    if (!result) {
      return res
        .status(404)
        .json({ Success: false, Message: "Project not found" });
    }

    res.json({ Success: true });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: "An error occurred",
      Error: err.message,
    });
  }
});

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project found
 *       404:
 *         description: Project not found
 *       500:
 *         description: An error occurred
 */
projectController.get("/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId).populate("Tasks");

    if (!project) {
      return res
        .status(404)
        .json({ Success: false, Message: "Project not found" });
    }

    res.json({ Success: true, Data: project });
  } catch (err) {
    res.status(500).json({
      Success: false,
      Message: "An error occurred",
      Error: err.message,
    });
  }
});

export default projectController;
