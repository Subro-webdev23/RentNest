// src/modules/category/category.routes.ts
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { CategoryController } from './category.controller';

const router = Router();

router.post('/', auth('ADMIN'), CategoryController.createCategory);

router.get('/', CategoryController.getAllCategories);

router.get('/:id', CategoryController.getSingleCategory);

router.patch('/:id', auth('ADMIN'), CategoryController.updateCategory);

router.delete('/:id', auth('ADMIN'), CategoryController.deleteCategory);

export const CategoryRoutes = router;