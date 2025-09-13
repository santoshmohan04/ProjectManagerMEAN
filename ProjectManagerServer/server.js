import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import DBconfig from "./config/ProjectManagerDB.js";
import userController from "./controllers/user.controller.js";
import projectController from "./controllers/project.controller.js";
import parentTaskController from "./controllers/parentTask.controller.js";
import taskController from "./controllers/task.controller.js";

const app = express();
const port = process.env.PORT || 4300;

app.use(cors());
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose
  .connect(DBconfig.ConnectionString)
  .then(() => {
    console.log("ProjectManager Database is connected");
  })
  .catch((err) => {
    console.error("Cannot connect to the ProjectManager database:", err);
  });

mongoose.set("debug", true);

app.use("/users", userController);
app.use("/projects", projectController);
app.use("/parenttasks", parentTaskController);
app.use("/tasks", taskController);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
