import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveRemindersList, logCheckActivity } from '../services/storageService';
import { fetchQuoteOfTheDay } from '../services/quoteService';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PASTEL_PALETTE = [
  { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' }, // Sky Blue
  { bg: '#E6F4EA', text: '#16A34A', border: '#BBF7D0' }, // Mint Green
  { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }, // Amber
  { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' }, // Rose Pink
  { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' }, // Purple
  { bg: '#E0F2FE', text: '#0891B2', border: '#A5F3FC' }, // Cyan
];

export default function HomeScreen({
  reminders,
  setReminders,
  onOpenAddEdit,
  onRefreshHistory,
  isDarkMode,
  themeMode,
  onCycleTheme,
}) {
  const [filter, setFilter] = useState('All');
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  // Animations: Continuous Scroll (Marquee) + Blinking Sparkle Icon
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const blinkAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    loadQuote();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (quote) {
      startMarqueeAnimation();
    }
  }, [quote]);

  const startMarqueeAnimation = (targetWidth = 1400) => {
    translateX.setValue(SCREEN_WIDTH - 20);
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -targetWidth,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const loadQuote = async () => {
    setLoadingQuote(true);
    const q = await fetchQuoteOfTheDay();
    setQuote(q);
    setLoadingQuote(false);
  };

  const uniqueCategories = ['All', ...new Set(reminders.map((r) => r.type || 'Alarm'))];

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'All') return true;
    return r.type === filter;
  });

  const activeReminders = reminders.filter((r) => r.isEnabled);
  const activeCount = activeReminders.length;

  const handleLogNow = async (reminder) => {
    await logCheckActivity(reminder);
    onRefreshHistory();
    Alert.alert('Activity Completed! ✨', `Recorded [${reminder.title}] as done.`);
  };

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const m = minute.toString().padStart(2, '0');
    return `${h12}:${m} ${period}`;
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return 'laptop-outline';
    if (themeMode === 'dark') return 'moon';
    return 'sunny';
  };

  const colors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    textPrimary: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    textSecondary: isDarkMode ? '#8C9099' : '#44474E',
    googleBlue: '#0B57D0',
    quoteBg: isDarkMode ? '#1E2025' : '#F0F4F9',
    quoteBorder: isDarkMode ? 'rgba(11, 87, 208, 0.25)' : '#E1E9F5',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View style={styles.headerGreetingRow}>
          <View>
            <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>Hi 😊</Text>
            <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>Your Daily Schedule</Text>
          </View>

          <TouchableOpacity style={styles.themeIconBtn} onPress={onCycleTheme}>
            <Ionicons name={getThemeIcon()} size={22} color={colors.googleBlue} />
          </TouchableOpacity>
        </View>

        {/* Dual Colorful Metric Cards */}
        <View style={styles.dualCardsRow}>
          {/* Vibrant Royal Blue Card */}
          <TouchableOpacity style={styles.blueMetricCard} onPress={() => setFilter('All')}>
            <View style={styles.metricIconBox}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.metricTextCol}>
              <Text style={styles.metricTitle}>Active Alarms</Text>
              <Text style={styles.metricCount}>{activeCount} Active</Text>
            </View>
          </TouchableOpacity>

          {/* Vibrant Teal Cyan Card */}
          <TouchableOpacity style={styles.cyanMetricCard} onPress={() => onOpenAddEdit(null)}>
            <View style={styles.cyanHeaderRow}>
              <View style={styles.cyanIconBox}>
                <Ionicons name="alarm" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.cyanBadge}>
                <Text style={styles.cyanBadgeText}>{reminders.length}</Text>
              </View>
            </View>
            <Text style={styles.cyanCardTitle}>Total Alarms</Text>
          </TouchableOpacity>
        </View>

        {/* Marquee Quote Card */}
        <View style={[styles.quoteCard, { backgroundColor: colors.quoteBg, borderColor: colors.quoteBorder }]}>
          <View style={styles.quoteHeaderRow}>
            <View style={styles.quoteTagRow}>
              <Animated.View style={{ opacity: blinkAnim }}>
                <Ionicons name="sparkles" size={16} color={colors.googleBlue} />
              </Animated.View>
              <Animated.Text style={[styles.quoteTagText, { color: colors.googleBlue, opacity: blinkAnim }]}>
                • QUOTE OF THE DAY •
              </Animated.Text>
            </View>
            <TouchableOpacity onPress={loadQuote} style={styles.refreshQuoteBtn}>
              <Ionicons name="refresh-outline" size={16} color={colors.googleBlue} />
            </TouchableOpacity>
          </View>

          {loadingQuote ? (
            <ActivityIndicator size="small" color={colors.googleBlue} style={{ marginVertical: 8 }} />
          ) : (
            <View style={styles.marqueeContainer}>
              <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX }] }]}>
                <Text
                  numberOfLines={1}
                  style={[styles.quoteText, { color: colors.textPrimary }]}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    if (w > 0) {
                      startMarqueeAnimation(w + 100);
                    }
                  }}
                >
                  "{quote?.text}" <Text style={{ color: colors.googleBlue, fontWeight: '700' }}>— {quote?.author}</Text>
                </Text>
              </Animated.View>
            </View>
          )}
        </View>

        {/* Section Header: Categories */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Categories</Text>
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {uniqueCategories.map((item, index) => {
            const isSelected = filter === item;
            const pastelText = item === 'All'
              ? '#0B57D0'
              : PASTEL_PALETTE[(index - 1) % PASTEL_PALETTE.length].text;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected ? pastelText : isDarkMode ? 'rgba(255,255,255,0.12)' : pastelText + '60',
                    borderWidth: isSelected ? 2 : 1.5,
                  },
                ]}
                onPress={() => setFilter(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: pastelText, fontWeight: isSelected ? '800' : '600' },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header: Alarms List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Your Schedules</Text>
          <TouchableOpacity onPress={() => setFilter('All')}>
            <Text style={[styles.seeAllText, { color: colors.googleBlue }]}>All</Text>
          </TouchableOpacity>
        </View>

        {/* Alarms List */}
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alarm-outline" size={56} color={colors.googleBlue} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Schedules Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Tap + below to create a schedule.</Text>
          </View>
        ) : (
          filteredReminders.map((reminder) => {
            const cardColor = reminder.color || colors.googleBlue;
            const cardIcon = reminder.icon || 'alarm-outline';

            return (
              <TouchableOpacity
                key={reminder.id}
                activeOpacity={0.85}
                style={[
                  styles.listCard,
                  {
                    backgroundColor: isDarkMode ? cardColor + '15' : cardColor + '08',
                    borderColor: cardColor + '40',
                  },
                ]}
                onPress={() => onOpenAddEdit(reminder)}
              >
                <View style={styles.listCardLeft}>
                  <View style={[styles.docIconBox, { backgroundColor: cardColor }]}>
                    <Ionicons name={cardIcon} size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.listTextCol}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.listTimeSub, { color: cardColor }]}>
                        {formatTime(reminder.hour, reminder.minute)} • {reminder.label}
                      </Text>
                      {reminder.repeatType === 'date' && reminder.targetDate ? (
                        <View style={[styles.dateBadge, { backgroundColor: cardColor + '18' }]}>
                          <Ionicons name="calendar-outline" size={10} color={cardColor} />
                          <Text style={[styles.dateBadgeText, { color: cardColor }]}>{reminder.targetDate}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.listTitle, { color: colors.textPrimary }]}>{reminder.title}</Text>
                    {!!reminder.note && (
                      <View style={styles.noteRow}>
                        <Ionicons name="document-text-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.noteText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {reminder.note}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.listCardRight}>
                  <TouchableOpacity
                    style={[styles.doneIconBtn, { backgroundColor: cardColor }]}
                    onPress={() => handleLogNow(reminder)}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button (#0B57D0) */}
      <TouchableOpacity style={styles.fabCircle} onPress={() => onOpenAddEdit(null)}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greetingTitle: { fontSize: 28, fontWeight: '800', fontFamily },
  greetingSub: { fontSize: 13, marginTop: 2, fontFamily },
  themeIconBtn: { padding: 8 },
  dualCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  blueMetricCard: {
    flex: 1.1,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 16,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTextCol: { marginLeft: 10, flex: 1 },
  metricTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', fontFamily },
  metricCount: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 11, marginTop: 2, fontWeight: '600', fontFamily },
  cyanMetricCard: {
    flex: 0.9,
    backgroundColor: '#0891B2',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#0891B2',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  cyanHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cyanIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cyanBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  cyanBadgeText: { color: '#0891B2', fontSize: 12, fontWeight: '800', fontFamily },
  cyanCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 12, fontFamily },
  quoteCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  quoteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quoteTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 6,
    fontFamily,
  },
  refreshQuoteBtn: {
    padding: 4,
  },
  marqueeContainer: {
    height: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    marginTop: 2,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 4000,
  },
  quoteText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    fontFamily,
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', fontFamily, letterSpacing: 0.5 },
  seeAllText: { fontSize: 13, fontWeight: '700', fontFamily },
  filterRow: { flexDirection: 'row', marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: { fontSize: 13, fontFamily },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, fontFamily },
  emptySubtitle: { fontSize: 13, marginTop: 4, fontFamily },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  listCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  docIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTextCol: { flex: 1 },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    paddingRight: 8,
  },
  listTimeSub: { fontSize: 12, fontWeight: '700', fontFamily },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  listTitle: { fontSize: 16, fontWeight: '700', fontFamily, marginTop: 1 },
  noteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  noteText: { fontSize: 12, fontFamily, flex: 1 },
  listCardRight: { marginLeft: 10 },
  doneIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabCircle: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0B57D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B57D0',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
