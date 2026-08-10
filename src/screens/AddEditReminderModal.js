import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DesignerCalendar from '../components/DesignerCalendar';
import {
  saveRemindersList,
  getStoredCategoryStyles,
  saveCategoryStyleGlobal,
} from '../services/storageService';
import { scheduleTestNotification } from '../services/notificationService';

const PRESET_TYPES = ['Check-In', 'Check-Out', 'Meeting', 'Task', 'Habit', 'Medication', 'Gym', 'Break'];
const PRESET_LABELS = ['Work', 'Personal', 'Office', 'Health', 'Study', 'Finance'];
const SNOOZE_OPTIONS = [5, 10, 15, 20];

const COLOR_PALETTE = [
  '#0B57D0', // Google Blue Primary
  '#34A853', // Google Green
  '#EA4335', // Google Red
  '#FBBC05', // Google Yellow
  '#7C4DFF', // Google Purple
  '#0085DC', // Sky Blue
  '#F2994A', // Orange
  '#14B8A6', // Teal
];

const ICON_PALETTE = [
  'log-in-outline',
  'log-out-outline',
  'people-outline',
  'checkbox-outline',
  'fitness-outline',
  'medkit-outline',
  'alarm-outline',
  'cafe-outline',
  'book-outline',
  'call-outline',
  'star-outline',
  'flame-outline',
];

const DAYS_LIST = [
  { id: 2, label: 'Mon' },
  { id: 3, label: 'Tue' },
  { id: 4, label: 'Wed' },
  { id: 5, label: 'Thu' },
  { id: 6, label: 'Fri' },
  { id: 7, label: 'Sat' },
  { id: 1, label: 'Sun' },
];

export default function AddEditReminderModal({ visible, onClose, reminder, reminders, setReminders, isDarkMode }) {
  const isEditing = !!reminder && !!reminder.id;

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [type, setType] = useState('Check-In');
  const [title, setTitle] = useState('');
  const [label, setLabel] = useState('Work');
  const [color, setColor] = useState('#0B57D0');
  const [icon, setIcon] = useState('alarm-outline');
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [hour12, setHour12] = useState(3);
  const [minute, setMinute] = useState(10);
  const [hourText, setHourText] = useState('3');
  const [minuteText, setMinuteText] = useState('10');
  const [isPm, setIsPm] = useState(true);

  // Alarm Schedule Mode: 'weekly' (Recurring Days) vs 'date' (Specific Date)
  const [repeatType, setRepeatType] = useState('weekly');
  const [targetDate, setTargetDate] = useState(getTodayStr());
  const [selectedDays, setSelectedDays] = useState([2, 3, 4, 5, 6]);
  const [note, setNote] = useState('');

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadCategoryDefaults();
  }, [reminder, visible]);

  const loadCategoryDefaults = async () => {
    const globalStyles = await getStoredCategoryStyles();

    if (reminder) {
      const cat = reminder.type || 'Check-In';
      setType(cat);
      setTitle(reminder.title || '');
      setLabel(reminder.label || 'Work');

      const style = globalStyles[cat] || { color: reminder.color || '#0B57D0', icon: reminder.icon || 'alarm-outline' };
      setColor(style.color);
      setIcon(style.icon);

      setSnoozeMinutes(reminder.snoozeMinutes || 5);
      const h24 = reminder.hour ?? 9;
      const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
      const m = reminder.minute ?? 0;
      setHour12(h12);
      setHourText(h12.toString());
      setIsPm(h24 >= 12);
      setMinute(m);
      setMinuteText(m.toString().padStart(2, '0'));

      setRepeatType(reminder.repeatType || (reminder.targetDate ? 'date' : 'weekly'));
      setTargetDate(reminder.targetDate || getTodayStr());
      setSelectedDays(reminder.days || [2, 3, 4, 5, 6]);
      setNote(reminder.note || '');
      setIsExpanded(false);
    } else {
      const cat = 'Check-In';
      const style = globalStyles[cat] || { color: '#10B981', icon: 'log-in-outline' };
      setType(cat);
      setTitle('Work Check-In');
      setLabel('Work');
      setColor(style.color);
      setIcon(style.icon);
      setSnoozeMinutes(5);
      const now = new Date();
      const h24 = now.getHours();
      const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
      const m = now.getMinutes();
      setHour12(h12);
      setHourText(h12.toString());
      setIsPm(h24 >= 12);
      setMinute(m);
      setMinuteText(m.toString().padStart(2, '0'));

      setRepeatType('weekly');
      setTargetDate(getTodayStr());
      setSelectedDays([2, 3, 4, 5, 6]);
      setNote('');
      setIsExpanded(false);
    }
  };

  const handleCategorySelect = async (selectedCat) => {
    setType(selectedCat);
    const globalStyles = await getStoredCategoryStyles();
    if (globalStyles[selectedCat]) {
      setColor(globalStyles[selectedCat].color);
      setIcon(globalStyles[selectedCat].icon);
    }
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const get24Hour = () => {
    if (isPm) {
      return hour12 === 12 ? 12 : hour12 + 12;
    } else {
      return hour12 === 12 ? 0 : hour12;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (repeatType === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for weekly recurring alarm');
      return;
    }
    if (repeatType === 'date' && !targetDate) {
      Alert.alert('Error', 'Please select a target date from the calendar');
      return;
    }

    const calculatedHour = get24Hour();
    const finalType = type.trim() || 'Custom';

    await saveCategoryStyleGlobal(finalType, { color, icon });

    const newReminder = {
      id: reminder && reminder.id ? reminder.id : Date.now().toString(),
      title: title.trim(),
      label: label.trim() || 'General',
      type: finalType,
      color,
      icon,
      snoozeMinutes,
      hour: calculatedHour,
      minute,
      repeatType,
      targetDate: repeatType === 'date' ? targetDate : null,
      days: selectedDays,
      isEnabled: reminder ? reminder.isEnabled : true,
      note: note.trim() || null,
      notificationIds: reminder ? reminder.notificationIds || [] : [],
    };

    let updatedList = [];
    if (isEditing) {
      updatedList = reminders.map((r) => {
        if (r.id === newReminder.id) return newReminder;
        if (r.type === finalType) return { ...r, color, icon };
        return r;
      });
    } else {
      const formattedList = reminders.map((r) => (r.type === finalType ? { ...r, color, icon } : r));
      updatedList = [...formattedList, newReminder];
    }

    const saved = await saveRemindersList(updatedList);
    setReminders(saved);

    // Time remaining text calculation
    const now = new Date();
    let target = new Date();

    if (repeatType === 'date' && targetDate) {
      const [y, m, d] = targetDate.split('-').map(Number);
      target = new Date(y, m - 1, d, calculatedHour, minute, 0);
    } else {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), calculatedHour, minute, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
    }

    const diffMs = target.getTime() - now.getTime();
    let timeRemainingText = '';

    if (diffMs <= 0) {
      timeRemainingText = 'immediately';
    } else {
      const totalMinutes = Math.round(diffMs / (1000 * 60));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const mins = totalMinutes % 60;

      if (days > 0) {
        timeRemainingText = `${days} day${days > 1 ? 's' : ''} and ${hours} hr${hours > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        timeRemainingText = `${hours} hr${hours > 1 ? 's' : ''} and ${mins} min${mins > 1 ? 's' : ''}`;
      } else {
        timeRemainingText = `${mins} min${mins > 1 ? 's' : ''}`;
      }
    }

    onClose();

    Alert.alert(
      'Alarm Set! ⏰',
      repeatType === 'date'
        ? `Alarm scheduled for ${targetDate} (${timeRemainingText} from now).`
        : `Alarm will ring in ${timeRemainingText} from now.`
    );
  };

  const handleDelete = async () => {
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedList = reminders.filter((r) => r.id !== reminder.id);
          const saved = await saveRemindersList(updatedList);
          setReminders(saved);
          onClose();
        },
      },
    ]);
  };

  const handleTestNotification = async () => {
    await scheduleTestNotification(label, type);
    Alert.alert(
      'Test Alarm Set ⏰',
      'Lock your iPhone screen now. Long-press the test notification banner to see the Snooze button.'
    );
  };

  const formatTimeDisplay = () => {
    const period = isPm ? 'PM' : 'AM';
    const m = minute.toString().padStart(2, '0');
    return `${hour12}:${m} ${period}`;
  };

  const colors = {
    bg: isDarkMode ? '#111318' : '#FFFFFF',
    headerBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    titleText: isDarkMode ? '#E2E2E9' : '#0B57D0',
    subText: isDarkMode ? '#8C9099' : '#44474E',
    inputBg: isDarkMode ? '#1E2025' : '#F0F4F9',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#E1E3EA',
    inputText: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    chipBg: isDarkMode ? '#282A2F' : '#E9EEF6',
    chipText: isDarkMode ? '#C4C6D0' : '#44474E',
    timeCardBg: isDarkMode ? '#1E2025' : '#F0F4F9',
    accordionBg: isDarkMode ? '#1E2025' : '#F0F4F9',
    accordionBoxBg: isDarkMode ? '#1A1C20' : '#F8FAFF',
    dayBg: isDarkMode ? '#282A2F' : '#E9EEF6',
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderColor: colors.headerBorder }]}>
          <Text style={[styles.headerTitle, { color: colors.titleText }]}>{isEditing ? 'Edit Alarm' : 'New Alarm'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close-circle-outline" size={28} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Time Picker Display */}
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>TIME</Text>
          <View style={[styles.timeCard, { backgroundColor: colors.timeCardBg, borderColor: color + '50' }]}>
            <Text style={[styles.timeDisplay, { color }]}>{formatTimeDisplay()}</Text>

            <View style={styles.timeAdjusters}>
              {/* Hour Controls */}
              <View style={styles.adjustCol}>
                <Text style={[styles.adjustLabel, { color: colors.subText }]}>HOUR</Text>
                <View style={styles.adjustBtns}>
                  <TouchableOpacity
                    style={[styles.adjBtn, { backgroundColor: color + '20' }]}
                    onPress={() => {
                      const next = hour12 === 1 ? 12 : hour12 - 1;
                      setHour12(next);
                      setHourText(next.toString());
                    }}
                  >
                    <Ionicons name="remove" size={16} color={color} />
                  </TouchableOpacity>

                  <TextInput
                    style={[
                      styles.adjValInput,
                      { backgroundColor: colors.inputBg, borderColor: color + '50', color: colors.titleText },
                    ]}
                    value={hourText}
                    onChangeText={(val) => {
                      setHourText(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 1 && num <= 12) {
                        setHour12(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                  />

                  <TouchableOpacity
                    style={[styles.adjBtn, { backgroundColor: color + '20' }]}
                    onPress={() => {
                      const next = hour12 === 12 ? 1 : hour12 + 1;
                      setHour12(next);
                      setHourText(next.toString());
                    }}
                  >
                    <Ionicons name="add" size={16} color={color} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Minute Controls */}
              <View style={styles.adjustCol}>
                <Text style={[styles.adjustLabel, { color: colors.subText }]}>MINUTE</Text>
                <View style={styles.adjustBtns}>
                  <TouchableOpacity
                    style={[styles.adjBtn, { backgroundColor: color + '20' }]}
                    onPress={() => {
                      const next = minute === 0 ? 59 : minute - 1;
                      setMinute(next);
                      setMinuteText(next.toString().padStart(2, '0'));
                    }}
                  >
                    <Ionicons name="remove" size={16} color={color} />
                  </TouchableOpacity>

                  <TextInput
                    style={[
                      styles.adjValInput,
                      { backgroundColor: colors.inputBg, borderColor: color + '50', color: colors.titleText },
                    ]}
                    value={minuteText}
                    onChangeText={(val) => {
                      setMinuteText(val);
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0 && num <= 59) {
                        setMinute(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                  />

                  <TouchableOpacity
                    style={[styles.adjBtn, { backgroundColor: color + '20' }]}
                    onPress={() => {
                      const next = minute >= 59 ? 0 : minute + 1;
                      setMinute(next);
                      setMinuteText(next.toString().padStart(2, '0'));
                    }}
                  >
                    <Ionicons name="add" size={16} color={color} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* AM / PM Toggle */}
              <View style={styles.adjustCol}>
                <Text style={[styles.adjustLabel, { color: colors.subText }]}>PERIOD</Text>
                <View style={styles.amPmContainer}>
                  <TouchableOpacity
                    style={[styles.amPmBtn, !isPm && { backgroundColor: color }]}
                    onPress={() => setIsPm(false)}
                  >
                    <Text style={[styles.amPmText, { color: !isPm ? '#FFFFFF' : colors.chipText }]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.amPmBtn, isPm && { backgroundColor: color }]}
                    onPress={() => setIsPm(true)}
                  >
                    <Text style={[styles.amPmText, { color: isPm ? '#FFFFFF' : colors.chipText }]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Alarm Repeat Mode Selector: Recurring vs Specific Date */}
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>SCHEDULE TYPE</Text>
          <View style={styles.scheduleTypeRow}>
            <TouchableOpacity
              style={[
                styles.scheduleTypeBtn,
                repeatType === 'weekly' ? { backgroundColor: color } : { backgroundColor: colors.chipBg },
              ]}
              onPress={() => setRepeatType('weekly')}
            >
              <Ionicons
                name="repeat-outline"
                size={16}
                color={repeatType === 'weekly' ? '#FFFFFF' : colors.chipText}
              />
              <Text
                style={[
                  styles.scheduleTypeText,
                  { color: repeatType === 'weekly' ? '#FFFFFF' : colors.chipText },
                ]}
              >
                Weekly Recurring
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.scheduleTypeBtn,
                repeatType === 'date' ? { backgroundColor: color } : { backgroundColor: colors.chipBg },
              ]}
              onPress={() => setRepeatType('date')}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={repeatType === 'date' ? '#FFFFFF' : colors.chipText}
              />
              <Text
                style={[
                  styles.scheduleTypeText,
                  { color: repeatType === 'date' ? '#FFFFFF' : colors.chipText },
                ]}
              >
                Specific Date
              </Text>
            </TouchableOpacity>
          </View>

          {/* Render Designer Calendar if Specific Date, else Weekly Day circles */}
          {repeatType === 'date' ? (
            <View style={styles.calendarSection}>
              <Text style={[styles.sectionLabel, { color: colors.subText }]}>TARGET DATE</Text>
              <DesignerCalendar
                selectedDateStr={targetDate}
                onSelectDate={setTargetDate}
                accentColor={color}
                isDarkMode={isDarkMode}
                compact
              />
            </View>
          ) : (
            <View style={styles.weeklyDaysSection}>
              <Text style={[styles.sectionLabel, { color: colors.subText }]}>REPEAT DAYS</Text>
              <View style={styles.daysContainer}>
                {DAYS_LIST.map((item) => {
                  const isSelected = selectedDays.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.dayCircle, { backgroundColor: isSelected ? color : colors.dayBg }]}
                      onPress={() => toggleDay(item.id)}
                    >
                      <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : colors.chipText }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Alarm Name */}
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>ALARM NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.subText}
            placeholder="e.g. Doctor Appointment, Check-In"
          />

          {/* Category */}
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>CATEGORY</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={type}
            onChangeText={handleCategorySelect}
            placeholderTextColor={colors.subText}
            placeholder="e.g. Check-In, Meeting, Gym"
          />
          <View style={styles.presetsRow}>
            {PRESET_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.presetChip, { backgroundColor: type === t ? color : colors.chipBg }]}
                onPress={() => handleCategorySelect(t)}
              >
                <Text style={[styles.presetText, { color: type === t ? '#FFFFFF' : colors.chipText }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Collapsible Accordion Toggle */}
          <TouchableOpacity
            style={[styles.accordionHeader, { backgroundColor: colors.accordionBg, borderColor: colors.headerBorder }]}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <View style={styles.accordionLeft}>
              <Ionicons name="options-outline" size={18} color={colors.subText} />
              <Text style={[styles.accordionTitle, { color: colors.titleText }]}>
                {isExpanded ? 'Hide Extra Options' : 'More Options (Color, Snooze, Label, Notes)'}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color={colors.subText}
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={[styles.collapsibleBox, { backgroundColor: colors.accordionBoxBg, borderColor: colors.headerBorder }]}>
              <Text style={[styles.sectionLabel, { color: colors.subText }]}>LABEL TAG</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
                value={label}
                onChangeText={setLabel}
                placeholderTextColor={colors.subText}
                placeholder="e.g. Work, Health, Personal"
              />
              <View style={styles.presetsRow}>
                {PRESET_LABELS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.presetChip, { backgroundColor: label === p ? color : colors.chipBg }]}
                    onPress={() => setLabel(p)}
                  >
                    <Text style={[styles.presetText, { color: label === p ? '#FFFFFF' : colors.chipText }]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.subText }]}>SNOOZE DURATION</Text>
              <View style={styles.presetsRow}>
                {SNOOZE_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.presetChip, { backgroundColor: snoozeMinutes === m ? color : colors.chipBg }]}
                    onPress={() => setSnoozeMinutes(m)}
                  >
                    <Text style={[styles.presetText, { color: snoozeMinutes === m ? '#FFFFFF' : colors.chipText }]}>
                      {m} mins
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.subText }]}>CATEGORY GLOBAL COLOR</Text>
              <View style={styles.colorRow}>
                {COLOR_PALETTE.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      color === c && styles.colorCircleActive,
                    ]}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.subText }]}>CATEGORY GLOBAL ICON</Text>
              <View style={styles.iconRow}>
                {ICON_PALETTE.map((ic) => (
                  <TouchableOpacity
                    key={ic}
                    style={[
                      styles.iconBox,
                      { backgroundColor: colors.chipBg, borderColor: icon === ic ? color : 'transparent' },
                    ]}
                    onPress={() => setIcon(ic)}
                  >
                    <Ionicons name={ic} size={20} color={icon === ic ? color : colors.subText} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.subText }]}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText, height: 60 }]}
                value={note}
                onChangeText={setNote}
                placeholderTextColor={colors.subText}
                multiline
                placeholder="e.g. Join Zoom link or room instructions"
              />
            </View>
          )}

          <TouchableOpacity style={[styles.testBtn, { borderColor: color }]} onPress={handleTestNotification}>
            <Ionicons name="notifications-outline" size={18} color={color} />
            <Text style={[styles.testBtnText, { color }]}>Test Alarm & Lock Screen Snooze</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Alarm</Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete Alarm</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  timeCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
  },
  timeAdjusters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 2,
  },
  adjustCol: {
    alignItems: 'center',
  },
  adjustLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  adjustBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  adjBtn: {
    width: 26,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjValInput: {
    width: 36,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    paddingHorizontal: 0,
  },
  amPmContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  amPmBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  amPmText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  scheduleTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  scheduleTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarSection: {
    marginTop: 4,
  },
  weeklyDaysSection: {
    marginTop: 4,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 18,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  collapsibleBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 20,
    gap: 8,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 10,
    gap: 6,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
