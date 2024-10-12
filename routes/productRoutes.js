import express from 'express';
import { getProductByWebsiteName } from '../controllers/productController.js';

const router = express.Router();

router.post('/', getProductByWebsiteName);

export default router;
