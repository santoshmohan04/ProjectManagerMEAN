import request from 'supertest';
import app from '../src/app.js';
import { Task } from '../src/models/task.model.js';
import { Project } from '../src/models/project.model.js';
import { User } from '../src/models/user.model.js';

describe('Tasks', () => {
  let testProjectId: string;
  let testUserId: string;
  let testTaskIds: string[] = [];

  beforeAll(async () => {
    // Create a test project
    const project = new Project({
      name: 'Test Project for Tasks',
      description: 'Project for testing task operations',
      priority: 3,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    });
    await project.save();
    testProjectId = (project._id as any).toString();

    // Create a test user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      passwordHash: 'hashedpassword',
      role: 'USER',
      isActive: true
    });
    await user.save();
    testUserId = (user._id as any).toString();

    // Create test tasks
    const tasks = [
      {
        title: 'Task 1',
        description: 'First test task',
        status: 'TODO',
        priority: 1,
        project: testProjectId,
        createdBy: testUserId
      },
      {
        title: 'Task 2',
        description: 'Second test task',
        status: 'IN_PROGRESS',
        priority: 2,
        project: testProjectId,
        assignedTo: testUserId,
        createdBy: testUserId
      },
      {
        title: 'Task 3',
        description: 'Third test task',
        status: 'TODO',
        priority: 3,
        project: testProjectId,
        createdBy: testUserId
      }
    ];

    for (const taskData of tasks) {
      const task = new Task(taskData);
      await task.save();
      testTaskIds.push((task._id as any).toString());
    }
  });

  describe('PUT /tasks/bulk-update', () => {
    it('should bulk update task status successfully', async () => {
      const updateData = {
        uuids: [
          '0192a1b2-3c4d-7e8f-9a0b-1c2d3e4f5g6h', // These will be the actual UUIDs from the created tasks
          '0192a1b2-3c4d-7e8f-9a0b-1c2d3e4f5g7i'
        ],
        updates: {
          status: 'IN_PROGRESS',
          priority: 4
        }
      };

      // Get the actual UUIDs from the created tasks
      const task1 = await Task.findById(testTaskIds[0]);
      const task2 = await Task.findById(testTaskIds[1]);

      updateData.uuids = [task1!.uuid, task2!.uuid];

      const response = await request(app)
        .put('/tasks/bulk-update')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);
      expect(response.body.message).toBe('Tasks updated successfully');

      // Verify the updates
      const updatedTask1 = await Task.findById(testTaskIds[0]);
      const updatedTask2 = await Task.findById(testTaskIds[1]);

      expect(updatedTask1!.status).toBe('IN_PROGRESS');
      expect(updatedTask1!.priority).toBe(4);
      expect(updatedTask2!.status).toBe('IN_PROGRESS');
      expect(updatedTask2!.priority).toBe(4);
    });

    it('should return error for invalid UUID format', async () => {
      const updateData = {
        uuids: ['invalid-uuid-format'],
        updates: {
          status: 'DONE'
        }
      };

      const response = await request(app)
        .put('/tasks/bulk-update')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid UUIDs');
    });

    it('should return error for invalid update fields', async () => {
      const task = await Task.findById(testTaskIds[0]);
      const updateData = {
        uuids: [task!.uuid],
        updates: {
          invalidField: 'invalid value',
          status: 'DONE'
        }
      };

      const response = await request(app)
        .put('/tasks/bulk-update')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid fields for bulk update');
    });

    it('should return error for empty uuids array', async () => {
      const updateData = {
        uuids: [],
        updates: {
          status: 'DONE'
        }
      };

      const response = await request(app)
        .put('/tasks/bulk-update')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('uuids array is required and must not be empty');
    });

    it('should return error for empty updates object', async () => {
      const task = await Task.findById(testTaskIds[0]);
      const updateData = {
        uuids: [task!.uuid],
        updates: {}
      };

      const response = await request(app)
        .put('/tasks/bulk-update')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('updates object is required and must not be empty');
    });
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tasks by project ID', async () => {
      const response = await request(app)
        .get(`/tasks?projectId=${testProjectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned tasks should belong to the test project
      response.body.data.forEach((task: any) => {
        expect(task.Project).toBe(testProjectId);
      });
    });
  });
});