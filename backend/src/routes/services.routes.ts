import { Router } from 'express';
import { getServices, getServiceById, getCraftsmenForService } from '../controllers/services.controller';

const router = Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/:id/craftsmen', getCraftsmenForService);

export default router;
