import request from 'supertest';
import app from '../src/app.js';
import { Project } from '../src/models/project.model.js';

describe('Projects', () => {
  let testProjectId: string;

  describe('POST /projects/add', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project for unit testing',
        priority: 3,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const response = await request(app)
        .post('/projects/add')
        .send(projectData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data.name).toBe(projectData.name);
      expect(response.body.data.description).toBe(projectData.description);
      expect(response.body.data.priority).toBe(projectData.priority);

      // Store the project ID for other tests
      testProjectId = response.body.data._id;
    });

    it('should return error for missing required fields', async () => {
      const incompleteData = {
        description: 'Missing name field'
      };

      const response = await request(app)
        .post('/projects/add')
        .send(incompleteData)
        .expect(500); // This might be a 400 in a real implementation

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /projects', () => {
    it('should return all projects', async () => {
      const response = await request(app)
        .get('/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter projects by search term', async () => {
      const response = await request(app)
        .get('/projects?searchKey=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /projects/:id', () => {
    it('should return a project by ID', async () => {
      const response = await request(app)
        .get(`/projects/${testProjectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testProjectId);
      expect(response.body.data.name).toBe('Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/projects/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });

  describe('POST /projects/edit/:id', () => {
    it('should update a project successfully', async () => {
      const updateData = {
        name: 'Updated Test Project',
        description: 'Updated description',
        priority: 5
      };

      const response = await request(app)
        .post(`/projects/edit/${testProjectId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should return 404 for updating non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Non-existent Project' };

      const response = await request(app)
        .post(`/projects/edit/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });

  describe('DELETE /projects/delete/:id', () => {
    it('should delete a project successfully', async () => {
      const response = await request(app)
        .delete(`/projects/delete/${testProjectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Project deleted successfully');
    });

    it('should return 404 for deleting non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/projects/delete/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });

    it('should not find deleted project in GET request', async () => {
      const response = await request(app)
        .get(`/projects/${testProjectId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
});