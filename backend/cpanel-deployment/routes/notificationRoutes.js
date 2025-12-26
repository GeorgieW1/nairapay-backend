import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { saveFCMToken, removeFCMToken } from '../services/pushNotificationService.js';

const router = express.Router();

/**
 * POST /api/notifications/register-token
 * Save FCM token for push notifications
 */
router.post('/register-token', verifyToken, async (req, res) => {
  try {
    const { fcmToken, deviceType } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'FCM token is required'
      });
    }

    const result = await saveFCMToken(
      req.user.id,
      fcmToken,
      deviceType || 'android'
    );

    if (result) {
      return res.json({
        success: true,
        message: 'FCM token registered successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to save FCM token'
      });
    }
  } catch (error) {
    console.error('Register token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * DELETE /api/notifications/unregister-token
 * Remove FCM token (on logout)
 */
router.delete('/unregister-token', verifyToken, async (req, res) => {
  try {
    await removeFCMToken(req.user.id);
    
    return res.json({
      success: true,
      message: 'FCM token removed successfully'
    });
  } catch (error) {
    console.error('Unregister token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
