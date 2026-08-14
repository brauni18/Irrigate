import { Router } from 'express';
import { createLine, deleteLine, listLines, updateLine } from '../controllers/irrigationLines.controller.js';

// Mounted at /gardens/:gardenId/lines
export const irrigationLinesRouter = Router({ mergeParams: true });

irrigationLinesRouter.post('/', createLine);
irrigationLinesRouter.get('/', listLines);
irrigationLinesRouter.patch('/:lineId', updateLine);
irrigationLinesRouter.delete('/:lineId', deleteLine);
