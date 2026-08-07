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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const isEditing = !!reminder;

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
      setSelectedDays(reminder.days || [2, 3, 4, 5, 6]);
      setNote(reminder.note || '');
      setIsExpanded(false);
    } else {
      const cat = 'Check-In';
      const style = globalStyles[cat] || { color: '#10B981', icon: 'log-in-outline' };
      setType(cat);
      setTitle('Morning Work Check-In');
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
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    const calculatedHour = get24Hour();
    const finalType = type.trim() || 'Custom';

    // Save global style for this category so ALL alarms of this category share the same color & icon!
    await saveCategoryStyleGlobal(finalType, { color, icon });

    const newReminder = {
      id: reminder ? reminder.id : Date.now().toString(),
      title: title.trim(),
      label: label.trim() || 'General',
      type: finalType,
      color,
      icon,
      snoozeMinutes,
      hour: calculatedHour,
      minute,
      days: selectedDays,
      isEnabled: reminder ? reminder.isEnabled : true,
      note: note.trim() || null,
      notificationIds: reminder ? reminder.notificationIds || [] : [],
    };

    // Update current reminder + apply global category style to all other alarms matching this category!
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

    // Calculate time remaining until alarm triggers
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), calculatedHour, minute, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    const diffMs = target.getTime() - now.getTime();
    const totalMinutes = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let timeRemainingText = '';
    if (hours === 0 && mins === 0) {
      timeRemainingText = 'less than a minute';
    } else if (hours === 0) {
      timeRemainingText = `${mins} minute${mins > 1 ? 's' : ''}`;
    } else if (mins === 0) {
      timeRemainingText = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      timeRemainingText = `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}`;
    }

    onClose();

    Alert.alert(
      'Alarm Set! ⏰',
      `Alarm will ring in ${timeRemainingText} from now.`
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
              {/* Hour Controls: [-] [Input] [+] */}
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
                    onBlur={() => {
                      const num = parseInt(hourText, 10);
                      if (isNaN(num) || num < 1) {
                        setHour12(1);
                        setHourText('1');
                      } else if (num > 12) {
                        setHour12(12);
                        setHourText('12');
                      } else {
                        setHour12(num);
                        setHourText(num.toString());
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

              {/* Minute Controls: [-] [Input] [+] */}
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
                    onBlur={() => {
                      const num = parseInt(minuteText, 10);
                      if (isNaN(num) || num < 0) {
                        setMinute(0);
                        setMinuteText('00');
                      } else if (num > 59) {
                        setMinute(59);
                        setMinuteText('59');
                      } else {
                        setMinute(num);
                        setMinuteText(num.toString().padStart(2, '0'));
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

          {/* Alarm Name */}
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>ALARM NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.subText}
            placeholder="e.g. Work Check-In, Take Medicine"
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
                {isExpanded ? 'Hide Extra Options' : 'More Options (Days, Color, Snooze, Label)'}
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
              <Text style={styles.deleteBtnText}>Delete Alarm</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', fontFamily },
  closeBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 50 },
  sectionLabel: { fontSize: 11, fontWeight: '700', marginTop: 14, marginBottom: 6, letterSpacing: 0.5, fontFamily },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    fontFamily,
  },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  presetChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6, marginBottom: 6 },
  presetText: { fontSize: 12, fontWeight: '500', fontFamily },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 18,
  },
  accordionLeft: { flexDirection: 'row', alignItems: 'center' },
  accordionTitle: { fontSize: 13, fontWeight: '600', marginLeft: 8, fontFamily },
  collapsibleBox: {
    borderRadius: 18,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  colorCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  colorCircleActive: { borderWidth: 2.5, borderColor: '#FFFFFF' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  timeCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  timeDisplay: { fontSize: 32, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5, fontFamily },
  timeAdjusters: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 12 },
  adjustCol: { alignItems: 'center' },
  adjustLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, fontFamily },
  adjustBtns: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  adjBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  adjValInput: {
    width: 46,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 4,
    padding: 0,
    fontFamily,
  },
  amPmContainer: { flexDirection: 'row', marginTop: 4, borderRadius: 8, padding: 2 },
  amPmBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  amPmText: { fontSize: 12, fontWeight: '600', fontFamily },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  dayCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 12, fontWeight: '600', fontFamily },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 18,
  },
  testBtnText: { fontWeight: '600', fontSize: 13, marginLeft: 6, fontFamily },
  saveBtn: { paddingVertical: 16, borderRadius: 20, marginTop: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, fontFamily },
  deleteBtn: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  deleteBtnText: { color: '#EA4335', fontWeight: '600', fontSize: 13, fontFamily },
});
