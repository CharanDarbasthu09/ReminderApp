import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleSnoozeNotification } from '../services/notificationService';
import { logCheckActivity } from '../services/storageService';

export default function RingingAlarmModal({ visible, alarmData, onDismiss, onRefreshHistory }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      Vibration.vibrate([500, 500, 500, 500], true);

      return () => {
        loop.stop();
        Vibration.cancel();
      };
    }
  }, [visible]);

  if (!visible || !alarmData) return null;

  const color = alarmData.color || '#EF4444';
  const snoozeMins = alarmData.snoozeMinutes || 5;

  const handleSnooze = async () => {
    Vibration.cancel();
    // DO NOT log to history when snoozed!
    await scheduleSnoozeNotification(alarmData, snoozeMins);
    onDismiss();
  };

  const handleDismiss = async () => {
    Vibration.cancel();
    // ALWAYS log activity on stop/dismiss!
    if (alarmData) {
      await logCheckActivity(alarmData);
      if (onRefreshHistory) onRefreshHistory();
    }
    onDismiss();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: color }]}>
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons name="alarm-outline" size={100} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.alarmBadge}>
          {alarmData.type ? alarmData.type.toUpperCase() : 'ALARM'} RINGING
        </Text>

        <Text style={styles.titleText}>{alarmData.title || 'Alarm Triggered'}</Text>
        <Text style={styles.labelSub}>[{alarmData.label || 'General'}]</Text>

        {alarmData.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{alarmData.note}</Text>
          </View>
        ) : null}

        <View style={styles.btnCol}>
          <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
            <Ionicons name="stop-circle-outline" size={24} color={color} />
            <Text style={[styles.dismissBtnText, { color }]}>Stop & Log Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze}>
            <Ionicons name="time-outline" size={22} color="#FFFFFF" />
            <Text style={styles.snoozeBtnText}>Snooze ({snoozeMins}m)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  alarmBadge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
    opacity: 0.9,
    fontFamily,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily,
  },
  labelSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily,
  },
  noteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 30,
    maxWidth: '90%',
  },
  noteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily,
  },
  btnCol: {
    width: '100%',
    marginTop: 20,
  },
  dismissBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  dismissBtnText: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    fontFamily,
  },
  snoozeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  snoozeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily,
  },
});
