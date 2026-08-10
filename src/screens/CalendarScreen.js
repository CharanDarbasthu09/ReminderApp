import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DesignerCalendar from '../components/DesignerCalendar';
import { saveRemindersList, logCheckActivity } from '../services/storageService';

export default function CalendarScreen({
  reminders,
  setReminders,
  onOpenAddEdit,
  onRefreshHistory,
  isDarkMode,
}) {
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState(getTodayStr());

  // Build a comprehensive map of dates -> array of alarm colors for ALL active alarms (Weekly + Specific Date)
  const alarmDatesMap = useMemo(() => {
    const map = {};
    const today = new Date();

    // Generate dates for current, previous, and next month range (~90 days)
    for (let offset = -35; offset <= 65; offset++) {
      const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, '0');
      const d = String(target.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      // Convert day of week: 0=Sun -> 1, 1=Mon -> 2 ... 6=Sat -> 7
      const dayOfWeek = target.getDay() === 0 ? 1 : target.getDay() + 1;

      reminders.forEach((r) => {
        if (!r.isEnabled) return;

        let isMatch = false;
        if (r.repeatType === 'date') {
          if (r.targetDate === dateStr) isMatch = true;
        } else {
          // Weekly recurring
          const days = r.days || [2, 3, 4, 5, 6];
          if (days.includes(dayOfWeek)) isMatch = true;
        }

        if (isMatch) {
          if (!map[dateStr]) map[dateStr] = [];
          map[dateStr].push(r.color || '#0B57D0');
        }
      });
    }

    return map;
  }, [reminders]);

  // Filter alarms matching the selected date (Specific date OR weekly recurring day)
  const selectedDayOfWeek = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.getDay() === 0 ? 1 : dateObj.getDay() + 1;
  }, [selectedDateStr]);

  const selectedDateAlarms = useMemo(() => {
    return reminders.filter((r) => {
      if (r.repeatType === 'date') {
        return r.targetDate === selectedDateStr;
      } else {
        const days = r.days || [2, 3, 4, 5, 6];
        return days.includes(selectedDayOfWeek);
      }
    });
  }, [reminders, selectedDateStr, selectedDayOfWeek]);

  const handleToggleAlarm = async (reminderItem) => {
    const updated = reminders.map((r) => {
      if (r.id === reminderItem.id) {
        return { ...r, isEnabled: !r.isEnabled };
      }
      return r;
    });
    const saved = await saveRemindersList(updated);
    setReminders(saved);
  };

  const handleLogNow = async (reminderItem) => {
    await logCheckActivity(reminderItem);
    onRefreshHistory();
    Alert.alert('Activity Completed! ✨', `Recorded [${reminderItem.title}] as done for ${selectedDateStr}.`);
  };

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const m = minute.toString().padStart(2, '0');
    return `${h12}:${m} ${period}`;
  };

  const formattedDateTitle = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDateStr]);

  const colors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    text: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    subText: isDarkMode ? '#8C9099' : '#44474E',
    cardBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    cardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    chipBg: isDarkMode ? '#282A2F' : '#E9EEF6',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Designer Calendar View */}
        <DesignerCalendar
          selectedDateStr={selectedDateStr}
          onSelectDate={setSelectedDateStr}
          alarmDatesMap={alarmDatesMap}
          accentColor="#0B57D0"
          isDarkMode={isDarkMode}
        />

        {/* Selected Date Summary Header */}
        <View style={styles.dateHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateTitle, { color: colors.text }]}>{formattedDateTitle}</Text>
            <Text style={[styles.dateSub, { color: colors.subText }]}>
              {selectedDateAlarms.length} alarm{selectedDateAlarms.length === 1 ? '' : 's'} scheduled for this day
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addForDateBtn, { backgroundColor: '#0B57D0' }]}
            onPress={() => onOpenAddEdit({ targetDate: selectedDateStr, repeatType: 'date' })}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addForDateText}>Add Alarm</Text>
          </TouchableOpacity>
        </View>

        {/* Alarms Scheduled for Selected Date */}
        {selectedDateAlarms.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="calendar-outline" size={42} color={colors.subText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Alarms Scheduled</Text>
            <Text style={[styles.emptySub, { color: colors.subText }]}>
              Tap "Add Alarm" above to schedule a reminder on {formattedDateTitle}.
            </Text>
          </View>
        ) : (
          <View style={styles.alarmsList}>
            {selectedDateAlarms.map((item) => {
              const itemColor = item.color || '#0B57D0';
              const itemIcon = item.icon || 'alarm-outline';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.alarmCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                    !item.isEnabled && { opacity: 0.5 },
                  ]}
                  onPress={() => onOpenAddEdit(item)}
                  activeOpacity={0.7}
                >
                  {/* Left accent color bar */}
                  <View style={[styles.colorBar, { backgroundColor: itemColor }]} />

                  <View style={styles.cardMain}>
                    <View style={styles.topRow}>
                      <View style={styles.titleArea}>
                        <View style={[styles.iconBadge, { backgroundColor: itemColor + '20' }]}>
                          <Ionicons name={itemIcon} size={18} color={itemColor} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={[styles.alarmTitle, { color: colors.text }]}>{item.title}</Text>
                          <View style={styles.badgeRow}>
                            <View style={[styles.typeChip, { backgroundColor: itemColor + '18' }]}>
                              <Text style={[styles.typeChipText, { color: itemColor }]}>{item.type || 'Alarm'}</Text>
                            </View>
                            {item.repeatType === 'date' ? (
                              <View style={[styles.dateChip, { backgroundColor: colors.chipBg }]}>
                                <Ionicons name="calendar-outline" size={11} color={colors.subText} />
                                <Text style={[styles.dateChipText, { color: colors.subText }]}>Specific Date</Text>
                              </View>
                            ) : (
                              <View style={[styles.dateChip, { backgroundColor: colors.chipBg }]}>
                                <Ionicons name="repeat-outline" size={11} color={colors.subText} />
                                <Text style={[styles.dateChipText, { color: colors.subText }]}>Weekly Recurring</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      <Switch
                        value={item.isEnabled}
                        onValueChange={() => handleToggleAlarm(item)}
                        trackColor={{ false: colors.chipBg, true: itemColor + '80' }}
                        thumbColor={item.isEnabled ? itemColor : '#9CA3AF'}
                      />
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={[styles.timeText, { color: itemColor }]}>
                        {formatTime(item.hour, item.minute)}
                      </Text>

                      <TouchableOpacity
                        style={[styles.logBtn, { backgroundColor: itemColor + '18', borderColor: itemColor }]}
                        onPress={() => handleLogNow(item)}
                      >
                        <Ionicons name="checkmark-done-outline" size={16} color={itemColor} />
                        <Text style={[styles.logBtnText, { color: itemColor }]}>Log Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 14,
    gap: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateSub: {
    fontSize: 13,
    marginTop: 2,
  },
  addForDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addForDateText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  alarmsList: {
    gap: 12,
  },
  alarmCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  colorBar: {
    width: 6,
  },
  cardMain: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  logBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
