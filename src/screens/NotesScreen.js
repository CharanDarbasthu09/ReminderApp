import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStoredStickyNotes, saveStickyNotesList } from '../services/storageService';
import { pinStickyNoteNotification } from '../services/notificationService';

const STICKY_COLORS = [
  { id: 'yellow', hex: '#FEF08A', darkText: true, label: 'Yellow 💛' },
  { id: 'mint', hex: '#BAF7D0', darkText: true, label: 'Mint 💚' },
  { id: 'pink', hex: '#FBCFE8', darkText: true, label: 'Pink 🩷' },
  { id: 'blue', hex: '#BAE6FD', darkText: true, label: 'Blue 💙' },
  { id: 'orange', hex: '#FED7AA', darkText: true, label: 'Orange 🧡' },
  { id: 'lavender', hex: '#E9D5FF', darkText: true, label: 'Purple 💜' },
  { id: 'dark', hex: '#1E293B', darkText: false, label: 'Dark 🖤' },
];

const PRESET_TAGS = ['Work', 'Personal', 'Idea', 'Todo', 'Shopping'];

export default function NotesScreen({ isDarkMode }) {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FEF08A');
  const [isPinned, setIsPinned] = useState(false);
  const [tag, setTag] = useState('Work');
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large'

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const stored = await getStoredStickyNotes();
    setNotes(stored);
  };

  const handleOpenAddEdit = (noteItem = null) => {
    if (noteItem) {
      setEditingNote(noteItem);
      setTitle(noteItem.title || '');
      setContent(noteItem.content || '');
      setColor(noteItem.color || '#FEF08A');
      setIsPinned(noteItem.isPinned || false);
      setTag(noteItem.tag || 'Work');
      setFontSize(noteItem.fontSize || 'normal');
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setColor('#FEF08A');
      setIsPinned(false);
      setTag('Work');
      setFontSize('normal');
    }
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Note', 'Please enter a title or note content.');
      return;
    }

    const newNote = {
      id: editingNote ? editingNote.id : Date.now().toString(),
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      color,
      isPinned,
      tag,
      fontSize,
      updatedAt: new Date().toISOString(),
    };

    let updatedList = [];
    if (editingNote) {
      updatedList = notes.map((n) => (n.id === newNote.id ? newNote : n));
    } else {
      updatedList = [newNote, ...notes];
    }

    const saved = await saveStickyNotesList(updatedList);
    setNotes(saved);
    setModalVisible(false);
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert('Delete Sticky Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = notes.filter((n) => n.id !== noteId);
          const saved = await saveStickyNotesList(updated);
          setNotes(saved);
        },
      },
    ]);
  };

  const handleTogglePin = async (noteItem) => {
    const updated = notes.map((n) => {
      if (n.id === noteItem.id) {
        return { ...n, isPinned: !n.isPinned };
      }
      return n;
    });
    const saved = await saveStickyNotesList(updated);
    setNotes(saved);
  };

  const handlePinToPhoneBanner = async (noteItem) => {
    await pinStickyNoteNotification(noteItem);
    Alert.alert(
      'Sticky Note Pinned! 📌📱',
      `"${noteItem.title}" has been pinned as a persistent banner on your phone screen.`
    );
  };

  // Sort notes: Pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  const filteredNotes = sortedNotes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || n.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const colors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    textPrimary: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    textSecondary: isDarkMode ? '#8C9099' : '#44474E',
    inputBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#E1E3EA',
    cardBg: isDarkMode ? '#1E2025' : '#FFFFFF',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Sticky Notes 📝</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {notes.length} note{notes.length === 1 ? '' : 's'} saved
            </Text>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenAddEdit(null)}>
            <Ionicons name="add-circle" size={44} color="#0B57D0" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search notes..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tag Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow} contentContainerStyle={styles.tagsContent}>
          {['All', ...PRESET_TAGS].map((t) => {
            const isSel = selectedTag === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tagChip,
                  isSel ? { backgroundColor: '#0B57D0' } : { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderWidth: 1 },
                ]}
                onPress={() => setSelectedTag(t)}
              >
                <Text style={[styles.tagText, { color: isSel ? '#FFFFFF' : colors.textSecondary }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sticky Notes Grid */}
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Sticky Notes</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Tap the + button to create a customizable sticky note!
            </Text>
          </View>
        ) : (
          <View style={styles.notesGrid}>
            {filteredNotes.map((item) => {
              const colorConfig = STICKY_COLORS.find((c) => c.hex === item.color) || STICKY_COLORS[0];
              const isDarkNote = item.color === '#1E293B';
              const textColor = isDarkNote ? '#FFFFFF' : '#1F2937';
              const subTextColor = isDarkNote ? '#9CA3AF' : '#4B5563';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.stickyCard,
                    { backgroundColor: item.color || '#FEF08A' },
                  ]}
                  onPress={() => handleOpenAddEdit(item)}
                  activeOpacity={0.9}
                >
                  {/* Top Tape / Pin Accent */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.pinBadge}>
                      {item.isPinned && <Text style={styles.pinIcon}>📌</Text>}
                      {!!item.tag && (
                        <View style={[styles.noteTagBadge, { backgroundColor: isDarkNote ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]}>
                          <Text style={[styles.noteTagText, { color: textColor }]}>{item.tag}</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity onPress={() => handleTogglePin(item)}>
                      <Ionicons
                        name={item.isPinned ? 'pin' : 'pin-outline'}
                        size={18}
                        color={textColor}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Title & Body */}
                  <Text style={[styles.noteTitle, { color: textColor }]}>{item.title}</Text>
                  <Text
                    style={[
                      styles.noteContent,
                      { color: subTextColor },
                      item.fontSize === 'large' && { fontSize: 16, lineHeight: 22 },
                    ]}
                    numberOfLines={6}
                  >
                    {item.content}
                  </Text>

                  {/* Action Bar Footer */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={[styles.phoneBannerBtn, { backgroundColor: isDarkNote ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)' }]}
                      onPress={() => handlePinToPhoneBanner(item)}
                    >
                      <Ionicons name="phone-portrait-outline" size={13} color={textColor} />
                      <Text style={[styles.phoneBannerText, { color: textColor }]}>Pin to Phone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                      <Ionicons name="trash-outline" size={16} color={isDarkNote ? '#F87171' : '#EF4444'} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Sticky Note Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeader, { borderColor: colors.inputBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editingNote ? 'Edit Sticky Note' : 'New Sticky Note'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Color Palette Selection */}
            <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>STICKY COLOR</Text>
            <View style={styles.colorPaletteRow}>
              {STICKY_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c.hex },
                    color === c.hex && styles.colorCircleActive,
                  ]}
                  onPress={() => setColor(c.hex)}
                >
                  {color === c.hex && (
                    <Ionicons name="checkmark" size={16} color={c.darkText ? '#1F2937' : '#FFFFFF'} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Note Title */}
            <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>NOTE TITLE</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Grocery List, Meeting Notes"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Note Content */}
            <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>NOTE CONTENT</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
            />

            {/* Tag Selection */}
            <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>TAG</Text>
            <View style={styles.tagsRow}>
              {PRESET_TAGS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.tagChip,
                    tag === t ? { backgroundColor: '#0B57D0' } : { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderWidth: 1 },
                  ]}
                  onPress={() => setTag(t)}
                >
                  <Text style={[styles.tagText, { color: tag === t ? '#FFFFFF' : colors.textSecondary }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Font Size & Pin Options */}
            <View style={styles.optionsRow}>
              <View style={styles.optionCol}>
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>TEXT SIZE</Text>
                <View style={styles.sizeToggleRow}>
                  <TouchableOpacity
                    style={[styles.sizeBtn, fontSize === 'normal' && { backgroundColor: '#0B57D0' }]}
                    onPress={() => setFontSize('normal')}
                  >
                    <Text style={[styles.sizeBtnText, { color: fontSize === 'normal' ? '#FFFFFF' : colors.textSecondary }]}>Normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sizeBtn, fontSize === 'large' && { backgroundColor: '#0B57D0' }]}
                    onPress={() => setFontSize('large')}
                  >
                    <Text style={[styles.sizeBtnText, { color: fontSize === 'large' ? '#FFFFFF' : colors.textSecondary }]}>Large</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.pinToggleBtn, isPinned && { backgroundColor: '#0B57D0' }]}
                onPress={() => setIsPinned(!isPinned)}
              >
                <Ionicons name="pin" size={16} color={isPinned ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.pinToggleText, { color: isPinned ? '#FFFFFF' : colors.textSecondary }]}>
                  {isPinned ? 'Pinned to Top' : 'Pin to Top'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Save Note Button */}
            <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveNoteBtnText}>Save Sticky Note</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', fontFamily },
  headerSub: { fontSize: 13, marginTop: 2, fontFamily },
  addBtn: { padding: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  tagsRow: { marginBottom: 16 },
  tagsContent: { gap: 8 },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, fontFamily },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 4, fontFamily },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  stickyCard: {
    width: '48%',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinIcon: { fontSize: 12 },
  noteTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noteTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily,
  },
  noteContent: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 12,
    fontFamily,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  phoneBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  phoneBannerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', fontFamily },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  colorPaletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  colorCircleActive: {
    borderWidth: 2.5,
    borderColor: '#0B57D0',
  },
  modalInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  optionCol: {},
  sizeToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sizeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 6,
    marginTop: 18,
  },
  pinToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B57D0',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
    elevation: 3,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
