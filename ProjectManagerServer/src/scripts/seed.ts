import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/user.model.js';
import { Project, ProjectStatus } from '../models/project.model.js';
import { Task, TaskStatus } from '../models/task.model.js';
import { config } from '../config/env.js';

// Sample data
const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 
                     'William', 'Sophia', 'Richard', 'Isabella', 'Thomas', 'Mia', 'Charles', 'Charlotte', 'Daniel', 'Amelia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const PROJECT_NAMES = [
  'E-Commerce Platform Redesign',
  'Mobile App Development',
  'Cloud Migration Initiative',
  'Customer Portal Enhancement',
  'API Gateway Implementation',
  'Data Analytics Dashboard',
  'Security Audit & Compliance',
  'Marketing Automation System',
  'Inventory Management System',
  'Employee Performance Portal',
  'Payment Gateway Integration',
  'Social Media Integration',
  'Real-time Chat Feature',
  'Video Conferencing Module',
  'Document Management System',
  'Reporting & Analytics Tool',
  'CRM System Upgrade',
  'Supply Chain Optimization',
  'AI-Powered Recommendation Engine',
  'Blockchain Integration POC'
];

const TASK_TITLES = [
  'Design database schema',
  'Implement user authentication',
  'Create REST API endpoints',
  'Build frontend UI components',
  'Write unit tests',
  'Configure CI/CD pipeline',
  'Deploy to production',
  'Code review and refactoring',
  'Performance optimization',
  'Security vulnerability assessment',
  'Update documentation',
  'Integrate third-party service',
  'Bug fixing and troubleshooting',
  'Data migration',
  'User acceptance testing',
  'Create backup strategy',
  'Implement caching layer',
  'Setup monitoring and alerts',
  'API rate limiting',
  'Accessibility compliance'
];

const TASK_DESCRIPTIONS = [
  'Review and implement the requirements specified in the technical documentation',
  'Ensure all edge cases are handled properly with comprehensive error handling',
  'Follow coding standards and best practices outlined in the style guide',
  'Coordinate with team members to ensure smooth integration',
  'Test thoroughly in development environment before moving to staging',
  'Document all changes and update the project wiki',
  'Review security implications and follow OWASP guidelines',
  'Optimize for performance and scalability',
  'Conduct code review with at least two team members',
  'Update automated test suite to cover new functionality'
];

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  console.log('✅ Database cleared');
}

async function createUsers() {
  console.log('👥 Creating users...');
  const users = [];
  const password = await bcrypt.hash('password123', 12);

  // Create 1 Admin
  users.push({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@projectmanager.com',
    employeeId: 'EMP001',
    passwordHash: password,
    role: UserRole.ADMIN,
    isActive: true,
  });

  // Create 5 Managers
  for (let i = 0; i < 5; i++) {
    users.push({
      firstName: FIRST_NAMES[i],
      lastName: LAST_NAMES[i],
      email: `manager${i + 1}@projectmanager.com`,
      employeeId: `EMP${String(i + 2).padStart(3, '0')}`,
      passwordHash: password,
      role: UserRole.MANAGER,
      isActive: true,
    });
  }

  // Create 15 Regular Users
  for (let i = 0; i < 15; i++) {
    users.push({
      firstName: FIRST_NAMES[(i + 5) % FIRST_NAMES.length],
      lastName: LAST_NAMES[(i + 5) % LAST_NAMES.length],
      email: `user${i + 1}@projectmanager.com`,
      employeeId: `EMP${String(i + 7).padStart(3, '0')}`,
      passwordHash: password,
      role: UserRole.USER,
      isActive: i < 12, // Some inactive users
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function createProjects(users: any[]) {
  console.log('📁 Creating projects...');
  const projects = [];
  const admin = users.find(u => u.role === UserRole.ADMIN);
  const managers = users.filter(u => u.role === UserRole.MANAGER);

  const statuses = [
    ProjectStatus.PLANNING,
    ProjectStatus.ACTIVE,
    ProjectStatus.ACTIVE,
    ProjectStatus.ACTIVE,
    ProjectStatus.COMPLETED,
    ProjectStatus.ARCHIVED,
  ];

  for (let i = 0; i < PROJECT_NAMES.length; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 30);

    const status = statuses[i % statuses.length];
    
    projects.push({
      name: PROJECT_NAMES[i],
      description: `${PROJECT_NAMES[i]} - A comprehensive project to enhance our platform capabilities and deliver value to stakeholders.`,
      priority: Math.floor(Math.random() * 10) + 1,
      status: status,
      startDate: startDate,
      endDate: endDate,
      manager: managers[i % managers.length]._id,
      isArchived: status === ProjectStatus.ARCHIVED,
      createdBy: admin._id,
    });
  }

  const createdProjects = await Project.insertMany(projects);
  console.log(`✅ Created ${createdProjects.length} projects`);
  return createdProjects;
}

async function createTasks(users: any[], projects: any[]) {
  console.log('📝 Creating tasks...');
  const tasks = [];
  const regularUsers = users.filter(u => u.role === UserRole.USER && u.isActive);
  const admin = users.find(u => u.role === UserRole.ADMIN);

  const statuses = [
    TaskStatus.OPEN,
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.BLOCKED,
  ];

  // Create 3-5 tasks per project
  for (const project of projects) {
    const numTasks = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numTasks; i++) {
      const dueDate = new Date(project.startDate as Date);
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 40) + 10);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const assignedUser = regularUsers[Math.floor(Math.random() * regularUsers.length)];

      tasks.push({
        title: TASK_TITLES[Math.floor(Math.random() * TASK_TITLES.length)],
        description: TASK_DESCRIPTIONS[Math.floor(Math.random() * TASK_DESCRIPTIONS.length)],
        priority: Math.floor(Math.random() * 10) + 1,
        status: status,
        project: project._id,
        assignedTo: assignedUser._id,
        dueDate: dueDate,
        estimatedHours: Math.floor(Math.random() * 40) + 8,
        actualHours: status === TaskStatus.COMPLETED ? Math.floor(Math.random() * 40) + 8 : undefined,
        createdBy: admin._id,
      });
    }
  }

  const createdTasks = await Task.insertMany(tasks);
  console.log(`✅ Created ${createdTasks.length} tasks`);
  return createdTasks;
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    await connectDatabase();
    await clearDatabase();
    
    const users = await createUsers();
    const projects = await createProjects(users);
    const tasks = await createTasks(users, projects);

    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length} (1 Admin, 5 Managers, 15 Users)`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Tasks: ${tasks.length}\n`);
    console.log('🔐 Login credentials:');
    console.log('   - Admin: admin@projectmanager.com / password123');
    console.log('   - Manager: manager1@projectmanager.com / password123');
    console.log('   - User: user1@projectmanager.com / password123\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed
seed();
