import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Define ALARM notification category with SNOOZE and DISMISS lock-screen action buttons
export const setupNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync('alarm_category', [
    {
      identifier: 'SNOOZE_ACTION',
      buttonTitle: '💤 Snooze 5 Mins',
      options: {
        opensAppInForeground: false,
      },
    },
    {
      identifier: 'DISMISS_ACTION',
      buttonTitle: '🛑 Dismiss Alarm',
      options: {
        isDestructive: true,
      },
    },
    {
      identifier: 'LOG_NOW_ACTION',
      buttonTitle: '✅ Log Activity',
      options: {
        opensAppInForeground: true,
      },
    },
  ]);
};

// Set presentation handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return false;
  }

  await setupNotificationCategories();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm_channel', {
      name: 'Full Alarm Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 1000, 500, 1000, 500],
      lightColor: '#EF4444',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
    });
  }

  return true;
};

export const scheduleReminderNotifications = async (reminder) => {
  if (!reminder.isEnabled || !reminder.days || reminder.days.length === 0) return [];

  await cancelReminderNotifications(reminder.notificationIds || []);

  const scheduledIds = [];
  const typeLabel = reminder.type || 'ALARM';

  for (const dayOfWeek of reminder.days) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ALARM: ${reminder.title}`,
          body: reminder.note
            ? `[${typeLabel} • ${reminder.label}] ${reminder.note}`
            : `${typeLabel} Alarm for [${reminder.label}]! Tap or press Snooze.`,
          data: {
            reminderId: reminder.id,
            title: reminder.title,
            type: reminder.type,
            label: reminder.label,
            color: reminder.color || '#EF4444',
            note: reminder.note,
            snoozeMinutes: reminder.snoozeMinutes || 5,
          },
          sound: 'default',
          categoryIdentifier: 'alarm_category', // Enables Lock-Screen Snooze & Dismiss Action Buttons!
          interruptionLevel: 'timeSensitive',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          hour: reminder.hour,
          minute: reminder.minute,
          weekday: dayOfWeek,
          channelId: 'alarm_channel',
        },
      });
      scheduledIds.push(id);
    } catch (e) {
      console.warn('Failed to schedule alarm for day', dayOfWeek, e);
    }
  }

  return scheduledIds;
};

export const scheduleSnoozeNotification = async (alarmData, minutes = 5) => {
  await requestNotificationPermissions();
  const seconds = minutes * 60;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `💤 SNOOZED ALARM (${minutes}m): ${alarmData.title || 'Alarm'}`,
      body: `Snoozed alarm for [${alarmData.label || 'Reminder'}] is ringing now!`,
      data: {
        ...alarmData,
        title: alarmData.title,
        isSnoozed: true,
      },
      sound: 'default',
      categoryIdentifier: 'alarm_category',
      interruptionLevel: 'timeSensitive',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds,
      repeats: false,
      channelId: 'alarm_channel',
    },
  });
};

export const scheduleTestNotification = async (label = 'Test Task', type = 'ALARM') => {
  await requestNotificationPermissions();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 TEST ALARM RINGING!',
      body: `[${type} - ${label}] Press and hold notification for SNOOZE button!`,
      data: {
        title: `Test ${type} Alarm`,
        label: label,
        type: type,
        color: '#EF4444',
        note: 'Test alarm triggered in 5 seconds',
        snoozeMinutes: 5,
      },
      sound: 'default',
      categoryIdentifier: 'alarm_category',
      interruptionLevel: 'timeSensitive',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
      channelId: 'alarm_channel',
    },
  });
};

export const cancelReminderNotifications = async (notificationIds = []) => {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      // Ignore if already canceled
    }
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
