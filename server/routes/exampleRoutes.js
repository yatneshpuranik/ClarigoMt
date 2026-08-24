import express from 'express';
import { getExamples, createExample } from '../controllers/exampleController.js';

const router = express.Router();

router.route('/')
  .get(getExamples)
  .post(createExample);

export default router;
