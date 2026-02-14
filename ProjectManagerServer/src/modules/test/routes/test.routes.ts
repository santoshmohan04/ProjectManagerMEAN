import { Router } from 'express';
import { TestController } from '../controllers/test.controller.js';

const router = Router();

// Test routes for error handling
router.get('/zod-error', TestController.testZodError);
router.get('/mongoose-error', TestController.testMongooseError);
router.get('/jwt-error', TestController.testJwtError);
router.get('/generic-error', TestController.testGenericError);
router.get('/success', TestController.testSuccess);

export default router;