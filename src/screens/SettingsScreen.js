import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  requestNotificationPermissions,
  scheduleTestNotification,
  cancelAllNotifications,
} from '../services/notificationService';

export default function SettingsScreen({ isDarkMode, themeMode, onCycleTheme }) {
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
  };

  const handleTestAlert = async () => {
    await scheduleTestNotification('Work', 'Check-In');
    Alert.alert(
      'Test Alarm Set',
      'Lock your iPhone screen now. A test alarm will sound in 5 seconds.'
    );
  };

  const handleClearAll = async () => {
    await cancelAllNotifications();
    Alert.alert('Cleared', 'All scheduled system alarms have been cleared.');
  };

  const getThemeIcon = () => {
    if (themeMode === 'dark') return 'moon';
    if (themeMode === 'light') return 'sunny';
    return 'phone-portrait';
  };

  const colors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    cardBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    borderOff: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    titleText: isDarkMode ? '#E2E2E9' : '#0B57D0',
    subText: isDarkMode ? '#8C9099' : '#44474E',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Theme Mode Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBg, borderColor: '#0B57D0' }]}
        onPress={onCycleTheme}
      >
        <Ionicons name={getThemeIcon()} size={24} color="#0B57D0" />
        <View style={styles.cardTextCol}>
          <Text style={[styles.cardTitle, { color: colors.titleText }]}>App Theme Mode</Text>
          <Text style={[styles.cardSubtitle, { color: colors.subText }]}>
            Current: {themeMode.toUpperCase()} (Tap to cycle System, Dark, Light)
          </Text>
        </View>
        <View style={styles.themePill}>
          <Text style={styles.themePillText}>{themeMode.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>

      {/* Permission Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.cardBg, borderColor: hasPermission ? '#34A853' : '#EA4335' },
        ]}
      >
        <Ionicons
          name={hasPermission ? 'checkmark-circle' : 'warning'}
          size={30}
          color={hasPermission ? '#34A853' : '#EA4335'}
        />
        <View style={styles.cardTextCol}>
          <Text style={[styles.cardTitle, { color: colors.titleText }]}>
            {hasPermission ? 'Notifications Allowed' : 'Permission Needed'}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.subText }]}>
            {hasPermission
              ? 'Background alarms are active on your device.'
              : 'Grant permission for offline alarms.'}
          </Text>
        </View>
        {!hasPermission && (
          <TouchableOpacity style={styles.grantBtn} onPress={checkPermission}>
            <Text style={styles.grantBtnText}>Grant</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Background Guide */}
      <Text style={[styles.sectionHeader, { color: colors.subText }]}>Background Alarm Mechanics</Text>
      <View style={[styles.guideBox, { backgroundColor: colors.cardBg, borderColor: colors.borderOff }]}>
        <View style={styles.guideHeader}>
          <Ionicons name="information-circle-outline" size={20} color="#0B57D0" />
          <Text style={[styles.guideTitle, { color: colors.titleText }]}>How Offline Alarms Work</Text>
        </View>
        <Text style={[styles.guideText, { color: colors.subText }]}>
          • Notifications use native iOS (UNUserNotificationCenter) and Android Notification Manager.{'\n'}
          • Alarms sound on exact scheduled times even when the app is killed or removed from recent apps.{'\n'}
          • Ensure Do Not Disturb or Silent mode on your iPhone allows app alerts.
        </Text>
      </View>

      {/* Action Items */}
      <Text style={[styles.sectionHeader, { color: colors.subText }]}>Diagnostics & Actions</Text>
      <TouchableOpacity style={[styles.actionRow, { backgroundColor: colors.cardBg, borderColor: colors.borderOff }]} onPress={handleTestAlert}>
        <View style={styles.actionLeft}>
          <Ionicons name="notifications-outline" size={22} color="#0B57D0" />
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: colors.titleText }]}>Test Instant Alarm</Text>
            <Text style={[styles.actionSubtitle, { color: colors.subText }]}>Schedule a 5-second test alarm</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionRow, { backgroundColor: colors.cardBg, borderColor: colors.borderOff }]} onPress={handleClearAll}>
        <View style={styles.actionLeft}>
          <Ionicons name="trash-outline" size={22} color="#FBBC05" />
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: colors.titleText }]}>Clear All System Alarms</Text>
            <Text style={[styles.actionSubtitle, { color: colors.subText }]}>Reset all pending notification triggers</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  card: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  cardTextCol: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', fontFamily },
  cardSubtitle: { fontSize: 12, marginTop: 2, fontFamily },
  themePill: { backgroundColor: '#0B57D0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  themePillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', fontFamily },
  grantBtn: { backgroundColor: '#EA4335', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  grantBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily },
  sectionHeader: { fontSize: 13, fontWeight: '700', marginBottom: 10, fontFamily },
  guideBox: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  guideHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  guideTitle: { fontSize: 14, fontWeight: '700', marginLeft: 6, fontFamily },
  guideText: { fontSize: 12, lineHeight: 18, fontFamily },
  actionRow: {
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  actionTextCol: { marginLeft: 12, flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '700', fontFamily },
  actionSubtitle: { fontSize: 12, marginTop: 2, fontFamily },
});
