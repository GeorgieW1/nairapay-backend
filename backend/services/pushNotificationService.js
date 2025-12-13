import { admin, firebaseInitialized } from '../config/firebase.js';
import User from '../models/User.js';

// Initialization is now handled in config/firebase.js


/**
 * Save FCM token for a user
 */
export const saveFCMToken = async (userId, fcmToken, deviceType = 'android') => {
  try {
    await User.findByIdAndUpdate(userId, {
      fcmToken,
      deviceType,
      fcmTokenUpdatedAt: new Date()
    });
    console.log(`✅ FCM token saved for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving FCM token:', error.message);
    return false;
  }
};

/**
 * Remove FCM token (on logout)
 */
export const removeFCMToken = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $unset: { fcmToken: 1, deviceType: 1, fcmTokenUpdatedAt: 1 }
    });
    console.log(`✅ FCM token removed for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error removing FCM token:', error.message);
    return false;
  }
};

/**
 * Send push notification to a single user
 */
export const sendPushNotification = async (userId, title, body, data = {}) => {
  if (!firebaseInitialized) {
    console.log('⚠️  Push notification skipped - Firebase not configured');
    return false;
  }

  try {
    const user = await User.findById(userId);

    if (!user || !user.fcmToken) {
      console.log(`⚠️  No FCM token for user ${userId}`);
      return false;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      token: user.fcmToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'nairapay_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Push notification sent to user ${userId}:`, response);
    return true;
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);

    // If token is invalid, remove it
    if (error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered') {
      await removeFCMToken(userId);
    }
    return false;
  }
};

/**
 * Send notification for successful transaction
 */
export const sendTransactionNotification = async (userId, type, amount, status) => {
  const titles = {
    'airtime': '📱 Airtime Purchase',
    'data': '📶 Data Purchase',
    'electricity': '💡 Electricity Payment',
    'tv': '📺 TV Subscription',
    'epin': '🎓 E-pin Purchase',
    'wallet_funding': '💰 Wallet Funded',
    'transfer': '💸 Transfer',
  };

  const statusEmoji = status === 'completed' ? '✅' : '❌';
  const statusText = status === 'completed' ? 'Successful' : 'Failed';

  const title = titles[type] || '💳 Transaction';
  const body = `${statusEmoji} ₦${amount.toLocaleString()} ${type} ${statusText}`;

  return sendPushNotification(userId, title, body, {
    type: 'transaction',
    transactionType: type,
    amount: amount.toString(),
    status,
  });
};

/**
 * Send notification for wallet funding
 */
export const sendWalletFundingNotification = async (userId, amount) => {
  return sendPushNotification(
    userId,
    '💰 Wallet Funded!',
    `Your wallet has been credited with ₦${amount.toLocaleString()}`,
    {
      type: 'wallet_funding',
      amount: amount.toString(),
    }
  );
};

/**
 * Send notification for low balance warning
 */
export const sendLowBalanceNotification = async (userId, balance) => {
  return sendPushNotification(
    userId,
    '⚠️ Low Balance Alert',
    `Your wallet balance is low (₦${balance.toLocaleString()}). Top up now!`,
    {
      type: 'low_balance',
      balance: balance.toString(),
    }
  );
};

/**
 * Send promotional notification to all users
 */
export const sendBroadcastNotification = async (title, body, data = {}) => {
  if (!firebaseInitialized) {
    console.log('⚠️  Broadcast skipped - Firebase not configured');
    return { success: 0, failed: 0 };
  }

  try {
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });

    let success = 0;
    let failed = 0;

    for (const user of users) {
      const result = await sendPushNotification(user._id, title, body, data);
      if (result) success++;
      else failed++;
    }

    console.log(`📢 Broadcast sent: ${success} success, ${failed} failed`);
    return { success, failed };
  } catch (error) {
    console.error('❌ Broadcast error:', error.message);
    return { success: 0, failed: 0 };
  }
};

export default {
  saveFCMToken,
  removeFCMToken,
  sendPushNotification,
  sendTransactionNotification,
  sendWalletFundingNotification,
  sendLowBalanceNotification,
  sendBroadcastNotification,
};
