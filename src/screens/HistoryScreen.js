import React from 'react';
import { StyleSheet, Text, View, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen({ history = [], isDarkMode }) {
  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return isoString;
    }
  };

  const colors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    cardBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    borderOff: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    titleText: isDarkMode ? '#E2E2E9' : '#0B57D0',
    subText: isDarkMode ? '#8C9099' : '#44474E',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={56} color="#0B57D0" />
          <Text style={[styles.emptyTitle, { color: colors.titleText }]}>No Activity Logs Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
            Tap "Done" on any alarm card to record your completed events.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const color = item.color || '#0B57D0';
            const iconName = item.icon || 'checkmark-circle-outline';

            return (
              <View style={[styles.historyCard, { backgroundColor: colors.cardBg, borderColor: color + '40' }]}>
                <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
                  <Ionicons name={iconName} size={20} color={color} />
                </View>

                <View style={styles.infoCol}>
                  <Text style={[styles.dateText, { color: colors.subText }]}>
                    {formatDate(item.timestamp)}
                  </Text>
                  <Text style={[styles.titleText, { color: colors.titleText }]}>{item.title}</Text>
                </View>

                <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.badgeText, { color }]}>
                    {item.type || 'Custom'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, fontFamily },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, fontFamily },
  historyCard: {
    borderRadius: 24,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  infoCol: { flex: 1, marginLeft: 12, marginRight: 8 },
  titleText: { fontSize: 15, fontWeight: '700', marginTop: 2, fontFamily },
  dateText: { fontSize: 11, fontWeight: '500', fontFamily },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700', fontFamily },
});
