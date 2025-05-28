import { Request, Response } from 'express';
import Comment, { IComment } from '../models/Comment';
import { checkTokenHoldings } from '../utils/token.utils';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    const { isHoldersOnly } = req.query;

    const query: any = { tokenAddress };
    if (isHoldersOnly === 'true') {
      query.isHoldersOnly = true;
    }

    const comments = await Comment.find(query)
      .sort({ timestamp: -1 })
      .lean();

    return res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

export const postComment = async (req: Request, res: Response) => {
  try {
    const { tokenAddress, content, userWallet, parentId, images, files, isHoldersOnly } = req.body;

    // Check token holdings for holders-only threads
    if (isHoldersOnly) {
      const holdings = await checkTokenHoldings(tokenAddress, userWallet);
      if (holdings < 0.1) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient token holdings to post in holders-only thread'
        });
      }
    }

    const comment = new Comment({
      content,
      tokenAddress,
      createdBy: userWallet,
      parentId,
      images,
      files,
      isHoldersOnly: !!isHoldersOnly,
      timestamp: Date.now()
    });

    await comment.save();

    return res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post comment'
    });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userWallet } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const isLiked = comment.likedBy.includes(userWallet);
    if (isLiked) {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedBy = comment.likedBy.filter(wallet => wallet !== userWallet);
    } else {
      comment.likes += 1;
      comment.likedBy.push(userWallet);
    }

    await comment.save();

    return res.json({
      success: true,
      data: {
        likes: comment.likes,
        isLiked: !isLiked
      }
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to like comment'
    });
  }
};

export const getTokenHoldings = async (req: Request, res: Response) => {
  try {
    const { tokenAddress, userWallet } = req.params;
    
    const holdings = await checkTokenHoldings(tokenAddress, userWallet);
    
    return res.json({
      success: true,
      data: {
        holdingPercentage: holdings
      }
    });
  } catch (error) {
    console.error('Error fetching token holdings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch token holdings'
    });
  }
}; 