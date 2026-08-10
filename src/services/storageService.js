import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleReminderNotifications,
  cancelReminderNotifications,
} from './notificationService';

const REMINDERS_KEY = '@checkin_checkout_reminders_v3';
const HISTORY_KEY = '@checkin_checkout_history_v3';
const CATEGORY_STYLES_KEY = '@checkin_category_styles_v1';
const STICKY_NOTES_KEY = '@checkin_sticky_notes_v1';

export const DEFAULT_CATEGORY_STYLES = {
  'Check-In': { color: '#10B981', icon: 'log-in-outline' },
  'Check-Out': { color: '#F59E0B', icon: 'log-out-outline' },
  'Meeting': { color: '#0B57D0', icon: 'people-outline' },
  'Task': { color: '#7C4DFF', icon: 'checkbox-outline' },
  'Habit': { color: '#EC4899', icon: 'star-outline' },
  'Medication': { color: '#EF4444', icon: 'medkit-outline' },
  'Gym': { color: '#0085DC', icon: 'fitness-outline' },
  'Break': { color: '#14B8A6', icon: 'cafe-outline' },
};

const DEFAULT_REMINDERS = [
  {
    id: 'default_checkin',
    title: 'Morning Work Check-In',
    label: 'Work',
    type: 'Check-In',
    color: '#10B981',
    icon: 'log-in-outline',
    hour: 9,
    minute: 0,
    days: [2, 3, 4, 5, 6], // Mon-Fri
    isEnabled: true,
    note: 'Submit attendance portal check-in',
    notificationIds: [],
  },
  {
    id: 'default_checkout',
    title: 'Evening Work Check-Out',
    label: 'Work',
    type: 'Check-Out',
    color: '#F59E0B',
    icon: 'log-out-outline',
    hour: 17,
    minute: 30,
    days: [2, 3, 4, 5, 6],
    isEnabled: true,
    note: 'Complete daily log before leaving',
    notificationIds: [],
  },
  {
    id: 'default_standup',
    title: 'Team Daily Standup',
    label: 'Meeting',
    type: 'Meeting',
    color: '#0B57D0',
    icon: 'people-outline',
    hour: 10,
    minute: 0,
    days: [2, 3, 4, 5, 6],
    isEnabled: true,
    note: 'Join Zoom standup link',
    notificationIds: [],
  },
];

const DEFAULT_STICKY_NOTES = [
  {
    id: 'note_1',
    title: '💡 Quick Idea',
    content: 'Review sprint deliverables and update the check-in reminder app!',
    color: '#FEF08A', // Yellow
    isPinned: true,
    tag: 'Work',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'note_2',
    title: '🛒 Shopping List',
    content: '• Coffee beans\n• Almond milk\n• Fresh fruit',
    color: '#BAF7D0', // Mint
    isPinned: false,
    tag: 'Personal',
    createdAt: new Date().toISOString(),
  },
];

export const getStoredCategoryStyles = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORY_STYLES_KEY);
    if (jsonValue != null) {
      return { ...DEFAULT_CATEGORY_STYLES, ...JSON.parse(jsonValue) };
    }
    return DEFAULT_CATEGORY_STYLES;
  } catch (e) {
    return DEFAULT_CATEGORY_STYLES;
  }
};

export const saveCategoryStyleGlobal = async (categoryName, styleObj) => {
  try {
    const currentStyles = await getStoredCategoryStyles();
    const updatedStyles = {
      ...currentStyles,
      [categoryName]: styleObj,
    };
    await AsyncStorage.setItem(CATEGORY_STYLES_KEY, JSON.stringify(updatedStyles));
    return updatedStyles;
  } catch (e) {
    console.error('Error saving category style global', e);
    return DEFAULT_CATEGORY_STYLES;
  }
};

export const getStoredReminders = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(REMINDERS_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));
    return DEFAULT_REMINDERS;
  } catch (e) {
    return DEFAULT_REMINDERS;
  }
};

export const saveRemindersList = async (reminders) => {
  try {
    const updatedReminders = [];
    for (let r of reminders) {
      if (r.isEnabled) {
        const notifIds = await scheduleReminderNotifications(r);
        updatedReminders.push({ ...r, notificationIds: notifIds });
      } else {
        await cancelReminderNotifications(r.notificationIds || []);
        updatedReminders.push({ ...r, notificationIds: [] });
      }
    }
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    return updatedReminders;
  } catch (e) {
    console.error('Error saving reminders', e);
    return reminders;
  }
};

export const getStoredHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};

export const logCheckActivity = async (reminder) => {
  try {
    const history = await getStoredHistory();
    const newEntry = {
      id: Date.now().toString(),
      reminderId: reminder.id,
      title: reminder.title,
      label: reminder.label,
      type: reminder.type,
      color: reminder.color || '#0B57D0',
      icon: reminder.icon || 'alarm-outline',
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newEntry, ...history];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (e) {
    console.error('Error logging activity', e);
    return [];
  }
};

export const getStoredStickyNotes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STICKY_NOTES_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    await AsyncStorage.setItem(STICKY_NOTES_KEY, JSON.stringify(DEFAULT_STICKY_NOTES));
    return DEFAULT_STICKY_NOTES;
  } catch (e) {
    return DEFAULT_STICKY_NOTES;
  }
};

export const saveStickyNotesList = async (notes) => {
  try {
    await AsyncStorage.setItem(STICKY_NOTES_KEY, JSON.stringify(notes));
    return notes;
  } catch (e) {
    console.error('Error saving sticky notes', e);
    return notes;
  }
};
