import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// LinkedIn Pinpoint Style Word Category Puzzles
const PINPOINT_PUZZLES = [
  {
    category: 'COFFEE DRINKS',
    clues: ['Espresso', 'Latte', 'Cappuccino', 'Americano'],
  },
  {
    category: 'ISLAND NATIONS',
    clues: ['Japan', 'Madagascar', 'Iceland', 'New Zealand'],
  },
  {
    category: 'TYPES OF WAVES',
    clues: ['Sound', 'Radio', 'Tsunami', 'Microwave'],
  },
  {
    category: 'PLETS IN SOLAR SYSTEM',
    clues: ['Mercury', 'Jupiter', 'Neptune', 'Saturn'],
  },
  {
    category: 'PROGRAMMING LANGUAGES',
    clues: ['Python', 'JavaScript', 'Swift', 'Kotlin'],
  },
];

export default function MindGamesScreen({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState('pinpoint'); // 'pinpoint' | 'memory'

  // Pinpoint Game State
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);
  const [userGuess, setUserGuess] = useState('');
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Memory Matrix Game State
  const [matrixSize] = useState(4); // 4x4 grid
  const [targetPattern, setTargetPattern] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [memoryScore, setMemoryScore] = useState(0);

  const currentPuzzle = PINPOINT_PUZZLES[puzzleIndex % PINPOINT_PUZZLES.length];

  // Colors
  const colors = {
    bg: isDarkMode ? '#111318' : '#F0F4F9',
    cardBg: isDarkMode ? '#1E2025' : '#FFFFFF',
    textPrimary: isDarkMode ? '#E2E2E9' : '#1F1F1F',
    textSecondary: isDarkMode ? '#8C9099' : '#44474E',
    googleBlue: '#0B57D0',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E1E3EA',
    clueBg: isDarkMode ? 'rgba(11, 87, 208, 0.2)' : '#E8F0FE',
    clueText: isDarkMode ? '#D3E3FD' : '#0B57D0',
    correctBg: '#10B981',
  };

  // --- PINPOINT GAME HANDLERS ---
  const handleRevealClue = () => {
    if (revealedCount < currentPuzzle.clues.length) {
      setRevealedCount(revealedCount + 1);
    }
  };

  const handleGuessSubmit = () => {
    if (!userGuess.trim()) return;

    const normalizedGuess = userGuess.trim().toUpperCase();
    const normalizedCategory = currentPuzzle.category.toUpperCase();

    if (normalizedGuess === normalizedCategory || normalizedCategory.includes(normalizedGuess)) {
      setSolved(true);
      const points = (5 - revealedCount) * 10;
      setScore(score + points);
      setStreak(streak + 1);
      Alert.alert('Brilliant! 🎯', `Correct! It was [${currentPuzzle.category}]. You earned +${points} pts!`);
    } else {
      Alert.alert('Not Quite 🙈', 'Try revealing another clue or guess again!');
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex(puzzleIndex + 1);
    setRevealedCount(1);
    setUserGuess('');
    setSolved(false);
  };

  // --- MEMORY MATRIX GAME HANDLERS ---
  const startMemoryGame = (level = memoryLevel) => {
    setSelectedTiles([]);
    setIsMemorizing(true);

    const tileCount = Math.min(level + 2, 8);
    const indices = [];
    while (indices.length < tileCount) {
      const rand = Math.floor(Math.random() * (matrixSize * matrixSize));
      if (!indices.includes(rand)) indices.push(rand);
    }
    setTargetPattern(indices);

    setTimeout(() => {
      setIsMemorizing(false);
    }, 1800);
  };

  const handleTilePress = (index) => {
    if (isMemorizing) return;

    let newSelected = [];
    if (selectedTiles.includes(index)) {
      newSelected = selectedTiles.filter((i) => i !== index);
    } else {
      newSelected = [...selectedTiles, index];
    }
    setSelectedTiles(newSelected);

    // Check if target match
    if (newSelected.length === targetPattern.length) {
      const isCorrect = targetPattern.every((t) => newSelected.includes(t));
      if (isCorrect) {
        setMemoryScore(memoryScore + memoryLevel * 20);
        const nextLevel = memoryLevel + 1;
        setMemoryLevel(nextLevel);
        Alert.alert('Memory Master! 🧠', `Level ${memoryLevel} Complete! Next Level starting...`, [
          { text: 'Continue', onPress: () => startMemoryGame(nextLevel) },
        ]);
      } else {
        Alert.alert('Oops! ❌', 'Incorrect pattern. Try again!', [
          { text: 'Retry Level', onPress: () => startMemoryGame(memoryLevel) },
        ]);
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Game Selector Tabs */}
      <View style={[styles.tabBarRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pinpoint' && { backgroundColor: colors.googleBlue }]}
          onPress={() => setActiveTab('pinpoint')}
        >
          <Ionicons name="sparkles-outline" size={18} color={activeTab === 'pinpoint' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.tabBtnText, { color: activeTab === 'pinpoint' ? '#FFFFFF' : colors.textSecondary }]}>
            LinkedIn Pinpoint
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'memory' && { backgroundColor: colors.googleBlue }]}
          onPress={() => {
            setActiveTab('memory');
            if (targetPattern.length === 0) startMemoryGame(1);
          }}
        >
          <Ionicons name="grid-outline" size={18} color={activeTab === 'memory' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.tabBtnText, { color: activeTab === 'memory' ? '#FFFFFF' : colors.textSecondary }]}>
            Memory Matrix
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- GAME 1: LINKEDIN PINPOINT --- */}
      {activeTab === 'pinpoint' && (
        <View style={styles.gameContainer}>
          {/* Header Metrics */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="trophy" size={18} color="#F59E0B" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{score} Pts</Text>
            </View>

            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="flame" size={18} color="#EF4444" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{streak} Streak</Text>
            </View>
          </View>

          {/* Puzzle Card */}
          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              Guess the common category connecting these clues:
            </Text>

            {/* Clues */}
            <View style={styles.cluesContainer}>
              {currentPuzzle.clues.map((clue, idx) => {
                const isRevealed = idx < revealedCount;
                return (
                  <View
                    key={clue}
                    style={[
                      styles.cluePill,
                      {
                        backgroundColor: isRevealed ? colors.clueBg : colors.bg,
                        borderColor: isRevealed ? colors.googleBlue : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.clueText, { color: isRevealed ? colors.clueText : colors.textSecondary }]}>
                      {isRevealed ? clue : `Clue #${idx + 1} (Locked)`}
                    </Text>
                    {isRevealed && <Ionicons name="checkmark-circle" size={16} color={colors.googleBlue} />}
                  </View>
                );
              })}
            </View>

            {/* Reveal More Clues Button */}
            {!solved && revealedCount < currentPuzzle.clues.length && (
              <TouchableOpacity style={styles.revealBtn} onPress={handleRevealClue}>
                <Ionicons name="eye-outline" size={18} color={colors.googleBlue} />
                <Text style={styles.revealBtnText}>Reveal Next Clue ({currentPuzzle.clues.length - revealedCount} Left)</Text>
              </TouchableOpacity>
            )}

            {/* Category Guess Input */}
            {!solved ? (
              <View style={styles.guessBox}>
                <TextInput
                  style={[styles.guessInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.textPrimary }]}
                  value={userGuess}
                  onChangeText={setUserGuess}
                  placeholder="Type your category guess..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.submitGuessBtn} onPress={handleGuessSubmit}>
                  <Text style={styles.submitGuessText}>Guess</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.solvedBox}>
                <Ionicons name="checkmark-circle" size={44} color="#10B981" />
                <Text style={styles.solvedTitle}>Category: {currentPuzzle.category}</Text>
                <TouchableOpacity style={styles.nextPuzzleBtn} onPress={handleNextPuzzle}>
                  <Text style={styles.nextPuzzleText}>Next Mind Puzzle 🚀</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* --- GAME 2: MEMORY MATRIX --- */}
      {activeTab === 'memory' && (
        <View style={styles.gameContainer}>
          {/* Level Header */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>Level {memoryLevel}</Text>
            </View>

            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="sparkles" size={18} color="#0B57D0" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{memoryScore} Pts</Text>
            </View>
          </View>

          {/* Matrix Card */}
          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              {isMemorizing ? '🧠 Memorize the blue tiles...' : 'Tap the tiles you remembered!'}
            </Text>

            {/* 4x4 Tile Grid */}
            <View style={styles.gridContainer}>
              {Array.from({ length: matrixSize * matrixSize }).map((_, idx) => {
                const isTarget = isMemorizing && targetPattern.includes(idx);
                const isSelected = !isMemorizing && selectedTiles.includes(idx);

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    style={[
                      styles.gridTile,
                      {
                        backgroundColor: isTarget
                          ? '#0B57D0'
                          : isSelected
                          ? '#10B981'
                          : colors.bg,
                        borderColor: isTarget || isSelected ? '#0B57D0' : colors.border,
                      },
                    ]}
                    onPress={() => handleTilePress(idx)}
                  />
                );
              })}
            </View>

            <TouchableOpacity style={styles.nextPuzzleBtn} onPress={() => startMemoryGame(memoryLevel)}>
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.nextPuzzleText}>Restart Level</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  tabBarRow: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: { fontWeight: '700', fontSize: 13, marginLeft: 6, fontFamily },
  gameContainer: {},
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  scoreText: { fontWeight: '800', fontSize: 14, marginLeft: 8, fontFamily },
  puzzleCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  puzzleInstruction: { fontSize: 14, fontWeight: '600', marginBottom: 16, textAlign: 'center', fontFamily },
  cluesContainer: { width: '100%', marginBottom: 16 },
  cluePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  clueText: { fontSize: 15, fontWeight: '700', fontFamily },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  revealBtnText: { color: '#0B57D0', fontWeight: '700', fontSize: 13, marginLeft: 6, fontFamily },
  guessBox: { flexDirection: 'row', width: '100%', marginTop: 8 },
  guessInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    fontFamily,
  },
  submitGuessBtn: {
    backgroundColor: '#0B57D0',
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitGuessText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, fontFamily },
  solvedBox: { alignItems: 'center', marginTop: 12 },
  solvedTitle: { fontSize: 18, fontWeight: '800', color: '#10B981', marginVertical: 8, fontFamily },
  nextPuzzleBtn: {
    flexDirection: 'row',
    backgroundColor: '#0B57D0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  nextPuzzleText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginLeft: 6, fontFamily },
  gridContainer: {
    width: 240,
    height: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    marginVertical: 16,
  },
  gridTile: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
  },
});
