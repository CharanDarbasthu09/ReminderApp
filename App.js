// Polyfill global document & window.location safely for React Native & Web
if (typeof global !== 'undefined') {
  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: () => ({ style: {} }),
      getElementsByTagName: () => [],
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      title: 'Yaadgar',
      body: { style: {} },
      documentElement: { style: {} },
      location: { protocol: 'http:', href: 'http://localhost:8081/' },
    };
  }
  if (typeof global.window !== 'undefined') {
    if (!global.window.document) {
      global.window.document = global.document;
    }
    if (!global.window.location || typeof global.window.location.protocol === 'undefined') {
      try {
        global.window.location = {
          protocol: 'http:',
          host: 'localhost:8081',
          hostname: 'localhost',
          port: '8081',
          pathname: '/',
          search: '',
          hash: '',
          href: 'http://localhost:8081/',
          origin: 'http://localhost:8081',
          assign: () => {},
          reload: () => {},
          replace: () => {},
        };
      } catch (e) {}
    }
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NotesScreen from './src/screens/NotesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddEditReminderModal from './src/screens/AddEditReminderModal';
import RingingAlarmModal from './src/components/RingingAlarmModal';
import FunnySplashScreen from './src/components/FunnySplashScreen';

import { getStoredReminders, getStoredHistory, logCheckActivity } from './src/services/storageService';
import { requestNotificationPermissions, scheduleSnoozeNotification } from './src/services/notificationService';

const Tab = createBottomTabNavigator();
const THEME_MODE_KEY = '@checkin_theme_mode_v2';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [themeMode, setThemeMode] = useState('system');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const [activeRingingAlarm, setActiveRingingAlarm] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    initData();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data && data.title) {
        setActiveRingingAlarm(data);
      } else {
        setActiveRingingAlarm({
          title: notification.request.content.title || 'Alarm Ringing!',
          label: 'Reminder',
          type: 'Alarm',
          color: '#0B57D0',
        });
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data || {};

      if (actionId === 'SNOOZE_ACTION') {
        const minutes = data.snoozeMinutes || 5;
        await scheduleSnoozeNotification(data, minutes);
        Alert.alert('Alarm Snoozed 💤', `Alarm set to trigger again in ${minutes} minutes.`);
      } else if (actionId === 'LOG_NOW_ACTION' || actionId === 'DISMISS_ACTION') {
        if (data.title) {
          await logCheckActivity(data);
          handleRefreshHistory();
          Alert.alert('Activity Logged! ✅', `Recorded [${data.title}]`);
        }
        setActiveRingingAlarm(null);
      } else {
        if (data && data.title) {
          setActiveRingingAlarm(data);
        } else {
          setActiveRingingAlarm({
            title: response.notification.request.content.title || 'Alarm Ringing!',
            label: 'Reminder',
            type: 'Alarm',
            color: '#0B57D0',
          });
        }
      }
    });

    return () => {
      if (notificationListener.current && typeof notificationListener.current.remove === 'function') {
        notificationListener.current.remove();
      }
      if (responseListener.current && typeof responseListener.current.remove === 'function') {
        responseListener.current.remove();
      }
    };
  }, []);

  const initData = async () => {
    setLoading(true);
    await requestNotificationPermissions();
    const storedReminders = await getStoredReminders();
    const storedHistory = await getStoredHistory();

    const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
    if (savedMode !== null) {
      setThemeMode(savedMode);
    } else {
      setThemeMode('system');
    }

    setReminders(storedReminders);
    setHistory(storedHistory);
    setLoading(false);
  };

  const cycleThemeMode = async () => {
    let nextMode = 'system';
    if (themeMode === 'system') nextMode = 'dark';
    else if (themeMode === 'dark') nextMode = 'light';
    else nextMode = 'system';

    setThemeMode(nextMode);
    await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
  };

  const isDarkMode =
    themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const handleRefreshHistory = async () => {
    const updatedHistory = await getStoredHistory();
    setHistory(updatedHistory);
  };

  const handleOpenAddEdit = (reminderItem) => {
    setEditingReminder(reminderItem);
    setModalVisible(true);
  };

  const [showSplash, setShowSplash] = useState(true);

  if (loading || showSplash) {
    return (
      <FunnySplashScreen
        onFinish={() => setShowSplash(false)}
        isDarkMode={isDarkMode}
      />
    );
  }

  const themeColors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    headerBg: isDarkMode ? '#111318' : '#F0F4F9',
    text: isDarkMode ? '#E2E2E9' : '#0B57D0',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    tabBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    tabActive: isDarkMode ? '#D3E3FD' : '#0B57D0',
    tabInactive: isDarkMode ? '#8C9099' : '#44474E',
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.bg }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={themeColors.bg}
        />
        <NavigationContainer
          linking={{ enabled: false }}
          documentTitle={{ enabled: false }}
        >
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerStyle: {
                backgroundColor: themeColors.headerBg,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: themeColors.border,
              },
              headerTitleStyle: { fontWeight: '700', fontSize: 18, color: themeColors.text },
              tabBarActiveTintColor: themeColors.tabActive,
              tabBarInactiveTintColor: themeColors.tabInactive,
              tabBarStyle: {
                backgroundColor: themeColors.tabBg,
                borderTopWidth: 1,
                borderTopColor: themeColors.border,
                height: 60,
                paddingBottom: 8,
                paddingTop: 4,
              },
              tabBarIcon: ({ color, size, focused }) => {
                let iconName;
                if (route.name === 'Alarms') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Calendar') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Notes') {
                  iconName = focused ? 'create' : 'create-outline';
                } else if (route.name === 'History') {
                  iconName = focused ? 'document-text' : 'document-text-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen
              name="Alarms"
              options={{ title: 'Home', headerShown: false }}
            >
              {() => (
                <HomeScreen
                  reminders={reminders}
                  setReminders={setReminders}
                  onOpenAddEdit={handleOpenAddEdit}
                  onRefreshHistory={handleRefreshHistory}
                  isDarkMode={isDarkMode}
                  themeMode={themeMode}
                  onCycleTheme={cycleThemeMode}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Calendar"
              options={{ title: 'Calendar 📅' }}
            >
              {() => (
                <CalendarScreen
                  reminders={reminders}
                  setReminders={setReminders}
                  onOpenAddEdit={handleOpenAddEdit}
                  onRefreshHistory={handleRefreshHistory}
                  isDarkMode={isDarkMode}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Notes"
              options={{ title: 'Notes 📝' }}
            >
              {() => <NotesScreen isDarkMode={isDarkMode} />}
            </Tab.Screen>

            <Tab.Screen
              name="History"
              options={{ title: 'Activity Log' }}
            >
              {() => <HistoryScreen history={history} isDarkMode={isDarkMode} />}
            </Tab.Screen>

            <Tab.Screen
              name="Settings"
              options={{ title: 'Settings' }}
            >
              {() => (
                <SettingsScreen
                  isDarkMode={isDarkMode}
                  themeMode={themeMode}
                  onCycleTheme={cycleThemeMode}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>

        <AddEditReminderModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          reminder={editingReminder}
          reminders={reminders}
          setReminders={setReminders}
          isDarkMode={isDarkMode}
        />

        <RingingAlarmModal
          visible={!!activeRingingAlarm}
          alarmData={activeRingingAlarm}
          onDismiss={() => setActiveRingingAlarm(null)}
          onRefreshHistory={handleRefreshHistory}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
