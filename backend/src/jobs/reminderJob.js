const cron = require('node-cron');
const { pool } = require('../config/database');
let admin;

try {
  admin = require('../config/firebase');
} catch (e) {
  console.log('⚠️  Firebase not configured. Reminders will log only.');
}

const sendPushNotification = async (fcmToken, title, body) => {
  if (!admin || !fcmToken) return;
  try {
    const message = {
      notification: { title, body },
      token: fcmToken,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    await admin.messaging().send(message);
    console.log(`✅ Push sent: ${title}`);
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
};

const checkReminders = async () => {
  try {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 16).replace('T', ' ');

    const [reminders] = await pool.execute(
      `SELECT r.*, u.fcm_token, u.name as user_name 
       FROM reminders r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.sent = 0 AND r.remind_at <= ? 
       ORDER BY r.remind_at ASC 
       LIMIT 20`,
      [nowStr]
    );

    for (const reminder of reminders) {
      console.log(`🔔 Reminder due: ${reminder.title} for ${reminder.user_name}`);

      await sendPushNotification(
        reminder.fcm_token,
        `⏰ ${reminder.title}`,
        reminder.message || 'You have a pending task!'
      );

      await pool.execute(
        'UPDATE reminders SET sent = 1, sent_at = NOW() WHERE id = ?',
        [reminder.id]
      );

      if (reminder.task_id) {
        await pool.execute(
          'UPDATE tasks SET reminder_sent = 1 WHERE id = ?',
          [reminder.task_id]
        );
      }
    }

    if (reminders.length > 0) {
      console.log(`✅ Processed ${reminders.length} reminder(s)`);
    }
  } catch (error) {
    console.error('Reminder job error:', error.message);
  }
};

const startReminderJob = () => {
  // Run every minute
  cron.schedule('* * * * *', checkReminders, {
    timezone: 'Asia/Kolkata',
  });
  console.log('⏰ Reminder cron job started (running every minute)');
};

module.exports = { startReminderJob };
