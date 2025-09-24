import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import DBconfig from "./config/ProjectManagerDB.js";
import userController from "./controllers/user.controller.js";
import projectController from "./controllers/project.controller.js";
import taskController from "./controllers/task.controller.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = process.env.PORT || 4300;

app.use(cors());
app.use(bodyParser.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Manager API",
      version: "1.0.0",
      description: "API documentation for Project Manager MEAN app",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      schemas: {
        Project: {
          type: "object",
          properties: {
            Project: { type: "string", description: "Name of the project" },
            Priority: {
              type: "number",
              description: "Priority of the project",
            },
            Manager_ID: { type: "string", description: "Assigned manager ID" },
            Start_Date: {
              type: "string",
              format: "date-time",
              description: "Project start date",
            },
            End_Date: {
              type: "string",
              format: "date-time",
              description: "Project end date",
            },
            Tasks: {
              type: "array",
              description: "List of tasks under this project",
              items: {
                type: "object",
                properties: {
                  Task_ID: { type: "string" },
                  Status: { type: "string" },
                },
              },
            },
          },
          required: [
            "Project",
            "Priority",
            "Manager_ID",
            "Start_Date",
            "End_Date",
          ],
        },
        Task: {
          type: "object",
          properties: {
            Title: { type: "string" },
            Description: { type: "string" },
            Project: { type: "string" },
            User: { type: "string" },
            Parent: { type: "string" },
            Status: { type: "string" },
            Priority: { type: "number" },
          },
        },
        User: {
          type: "object",
          properties: {
            First_Name: { type: "string" },
            Last_Name: { type: "string" },
            Employee_ID: { type: "string" },
            User_ID: { type: "string" },
            Project_ID: { type: "string", nullable: true },
            Task_ID: { type: "string", nullable: true },
          },
          required: ["First_Name", "Last_Name", "Employee_ID", "User_ID"],
        },
      },
    },
  },
  apis: ["./controllers/*.js"], // Path to the API docs (adjust as needed)
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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
app.use("/tasks", taskController);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
