import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DesignerCalendar({
  selectedDateStr, // 'YYYY-MM-DD'
  onSelectDate,    // (dateStr: 'YYYY-MM-DD') => void
  alarmDatesMap = {}, // { 'YYYY-MM-DD': ['#0B57D0', '#34A853'] }
  accentColor = '#0B57D0',
  isDarkMode = false,
  compact = false,
}) {
  const parseDateStr = (str) => {
    if (!str) return new Date();
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const initialDate = parseDateStr(selectedDateStr);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  useEffect(() => {
    if (selectedDateStr) {
      const d = parseDateStr(selectedDateStr);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    }
  }, [selectedDateStr]);

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Build grid days for month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const gridCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({ dayNum, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete row grid (multiple of 7)
  const remaining = 7 - (gridCells.length % 7);
  if (remaining < 7) {
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      gridCells.push({ dayNum, dateStr, isCurrentMonth: false });
    }
  }

  // Presets: Today, Tomorrow, This Weekend, Next Week
  const handlePresetSelect = (type) => {
    const now = new Date();
    let target = new Date();

    if (type === 'today') {
      target = now;
    } else if (type === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (type === 'weekend') {
      // Find upcoming Saturday
      const day = now.getDay();
      const diff = day === 6 ? 7 : (6 - day);
      target.setDate(now.getDate() + diff);
    } else if (type === 'nextWeek') {
      // Find upcoming Monday
      const day = now.getDay();
      const diff = day === 0 ? 1 : (8 - day);
      target.setDate(now.getDate() + diff);
    }

    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    setCurrentYear(target.getFullYear());
    setCurrentMonth(target.getMonth());
    onSelectDate(dateStr);
  };

  const colors = {
    cardBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    headerText: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    weekdayText: isDarkMode ? '#8C9099' : '#5F6368',
    dayText: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    dimDayText: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : '#BDC1C6',
    chipBg: isDarkMode ? '#282A2F' : '#F0F4F9',
    chipText: isDarkMode ? '#C4C6D0' : '#44474E',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }, compact && styles.compactContainer]}>
      {/* Quick Date Presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow} contentContainerStyle={styles.presetsContent}>
        <TouchableOpacity style={[styles.presetChip, { backgroundColor: colors.chipBg }]} onPress={() => handlePresetSelect('today')}>
          <Ionicons name="today-outline" size={14} color={accentColor} />
          <Text style={[styles.presetText, { color: colors.chipText }]}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.presetChip, { backgroundColor: colors.chipBg }]} onPress={() => handlePresetSelect('tomorrow')}>
          <Ionicons name="time-outline" size={14} color={accentColor} />
          <Text style={[styles.presetText, { color: colors.chipText }]}>Tomorrow</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.presetChip, { backgroundColor: colors.chipBg }]} onPress={() => handlePresetSelect('weekend')}>
          <Ionicons name="sunny-outline" size={14} color={accentColor} />
          <Text style={[styles.presetText, { color: colors.chipText }]}>Weekend</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.presetChip, { backgroundColor: colors.chipBg }]} onPress={() => handlePresetSelect('nextWeek')}>
          <Ionicons name="calendar-outline" size={14} color={accentColor} />
          <Text style={[styles.presetText, { color: colors.chipText }]}>Next Mon</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Month Navigator Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={20} color={colors.headerText} />
        </TouchableOpacity>

        <View style={styles.monthTitleBox}>
          <Text style={[styles.monthText, { color: colors.headerText }]}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={20} color={colors.headerText} />
        </TouchableOpacity>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, idx) => (
          <View key={idx} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: colors.weekdayText }]}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {gridCells.map((cell, idx) => {
          const isSelected = cell.dateStr === selectedDateStr;
          const isToday = cell.dateStr === todayStr;
          const colorsList = alarmDatesMap[cell.dateStr] || [];
          const hasAlarms = colorsList.length > 0;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayCell,
                isSelected && [styles.selectedCell, { backgroundColor: accentColor }],
                isToday && !isSelected && [styles.todayCell, { borderColor: accentColor }],
              ]}
              onPress={() => onSelectDate(cell.dateStr)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumText,
                  { color: cell.isCurrentMonth ? colors.dayText : colors.dimDayText },
                  isSelected && styles.selectedDayNumText,
                  isToday && !isSelected && { color: accentColor, fontWeight: '700' },
                ]}
              >
                {cell.dayNum}
              </Text>

              {/* Alarm indicator dots */}
              {hasAlarms && (
                <View style={styles.dotsRow}>
                  {colorsList.slice(0, 3).map((c, dotIdx) => (
                    <View
                      key={dotIdx}
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? '#FFFFFF' : c },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  compactContainer: {
    padding: 10,
    borderRadius: 16,
  },
  presetsRow: {
    marginBottom: 12,
  },
  presetsContent: {
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
    borderRadius: 10,
  },
  monthTitleBox: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 1.5,
  },
  selectedCell: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  dayNumText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayNumText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 3,
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
