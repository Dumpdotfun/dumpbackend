import { Router, Request, Response } from 'express';
import {
  getComments,
  postComment,
  likeComment,
  getTokenHoldings
} from '../controller/comment.controller';

const router = Router();

// Get comments for a token
router.get('/:tokenAddress', getComments);

// Get holders-only comments for a token
router.get('/:tokenAddress/holders', (req: Request, res: Response) => {
  req.query.isHoldersOnly = 'true';
  return getComments(req, res);
});

// Post a new comment
router.post('/', postComment);

// Like/unlike a comment
router.post('/:commentId/like', likeComment);

// Get token holdings for a user
router.get('/token/:tokenAddress/holdings/:userWallet', getTokenHoldings);

export default router; 