import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MindGamesScreen from './src/screens/MindGamesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddEditReminderModal from './src/screens/AddEditReminderModal';
import RingingAlarmModal from './src/components/RingingAlarmModal';

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

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#111318' : '#F0F4F9' }]}>
        <ActivityIndicator size="large" color="#0B57D0" />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#8C9099' : '#44474E' }]}>
          Loading Alarms...
        </Text>
      </View>
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
        <NavigationContainer>
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
                } else if (route.name === 'History') {
                  iconName = focused ? 'document-text' : 'document-text-outline';
                } else if (route.name === 'Mind Games') {
                  iconName = focused ? 'game-controller' : 'game-controller-outline';
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
              name="History"
              options={{ title: 'Activity Log' }}
            >
              {() => <HistoryScreen history={history} isDarkMode={isDarkMode} />}
            </Tab.Screen>

            <Tab.Screen
              name="Mind Games"
              options={{ title: 'Mind Games 🧠' }}
            >
              {() => <MindGamesScreen isDarkMode={isDarkMode} />}
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
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
});
