import express from "express";
import User from "../data_models/user.js";
import mongoose from "mongoose";

const userController = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search users by first or last name
 *       - in: query
 *         name: sortKey
 *         schema:
 *           type: string
 *         description: Sort by a field (default ascending)
 *     responses:
 *       200:
 *         description: List of users
 */
userController.get("/", async (req, res) => {
  try {
    const userQuery = User.find();
    const { searchKey, sortKey } = req.query;

    if (searchKey) {
      userQuery.or([
        { First_Name: { $regex: searchKey, $options: "i" } },
        { Last_Name: { $regex: searchKey, $options: "i" } },
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

/**
 * @swagger
 * /users/add:
 *   post:
 *     summary: Add a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Error while creating user
 */
userController.post("/add", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(200).json({ Success: true });
  } catch (err) {
    res
      .status(400)
      .json({
        Success: false,
        Message: "Error occurred while creating new user",
      });
  }
});

/**
 * @swagger
 * /users/edit/{id}:
 *   post:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Error while updating user
 */
userController.post("/edit/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (!user)
      return res
        .status(404)
        .json({ Success: false, Message: "User  not found" });

    Object.assign(user, req.body);
    await user.save();
    res.json({ Success: true });
  } catch (err) {
    res.status(400).json({ Success: false });
  }
});

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error while deleting user
 */
userController.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await User.deleteOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ Success: false, Message: "User  not found" });
    }
    res.json({ Success: true });
  } catch (err) {
    res
      .status(500)
      .json({ Success: false, Message: "Error occurred while deleting user" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Error while fetching user
 */
userController.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (!user)
      return res
        .status(404)
        .json({ Success: false, Message: "User  not found" });

    res.json({ Success: true, Data: user });
  } catch (err) {
    res
      .status(500)
      .json({ Success: false, Message: "Error occurred while fetching user" });
  }
});

/**
 * @swagger
 * /users/assign/project/{id}:
 *   post:
 *     summary: Assign a project to a user as Manager
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Project_ID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project assigned successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Error while assigning project
 */
userController.post("/assign/project/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ User_ID: userId });
    if (!user)
      return res
        .status(404)
        .json({ Success: false, Message: "User  not found" });

    user.Project_ID = req.body.Project_ID;
    await user.save();
    res.json({ Success: true });
  } catch (err) {
    res.status(400).json({ Success: false });
  }
});

/**
 * @swagger
 * /users/assign/task/{id}:
 *   post:
 *     summary: Assign a task to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Task_ID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Error while assigning task
 */
userController.post("/assign/task/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ User_ID: userId });
    if (!user)
      return res
        .status(404)
        .json({ Success: false, Message: "User  not found" });

    user.Task_ID = req.body.Task_ID;
    await user.save();
    res.json({ Success: true });
  } catch (err) {
    res.status(400).json({ Success: false });
  }
});

export default userController;
