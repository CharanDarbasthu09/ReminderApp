import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. PINPOINT PUZZLES
const PINPOINT_PUZZLES = [
  { category: 'COFFEE DRINKS', clues: ['Espresso', 'Latte', 'Cappuccino', 'Americano'] },
  { category: 'ISLAND NATIONS', clues: ['Japan', 'Madagascar', 'Iceland', 'New Zealand'] },
  { category: 'TYPES OF WAVES', clues: ['Sound', 'Radio', 'Tsunami', 'Microwave'] },
  { category: 'PLANETS IN SOLAR SYSTEM', clues: ['Mercury', 'Jupiter', 'Neptune', 'Saturn'] },
  { category: 'PROGRAMMING LANGUAGES', clues: ['Python', 'JavaScript', 'Swift', 'Kotlin'] },
  { category: 'SUPERHEROES', clues: ['Batman', 'Iron Man', 'Spider-Man', 'Wonder Woman'] },
];

// 2. EMOJI RIDDLE PUZZLES
const EMOJI_PUZZLES = [
  { emoji: '🦁 👑', answer: 'LION KING', hint: 'Disney classic' },
  { emoji: '🕷️ 👨', answer: 'SPIDERMAN', hint: 'Marvel hero with web' },
  { emoji: '🚀 🌕', answer: 'TO THE MOON', hint: 'Space mission or crypto phrase' },
  { emoji: '🍿 🎬', answer: 'MOVIE NIGHT', hint: 'Popcorn and cinema' },
  { emoji: '🍕 🤤', answer: 'PIZZA LOVER', hint: 'Cheesy Italian food' },
  { emoji: '👻 🔫', answer: 'GHOSTBUSTERS', hint: 'Who you gonna call?' },
  { emoji: '🧊 🧊 👶', answer: 'ICE ICE BABY', hint: 'Famous 90s song' },
];

export default function MindGamesScreen({ isDarkMode }) {
  // Choosable Game Tabs: 'pinpoint' | 'memory' | 'reflex' | 'emoji'
  const [activeTab, setActiveTab] = useState('pinpoint');

  // --- 1. PINPOINT STATE ---
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);
  const [userGuess, setUserGuess] = useState('');
  const [pinpointSolved, setPinpointSolved] = useState(false);
  const [pinpointScore, setPinpointScore] = useState(0);
  const [pinpointStreak, setPinpointStreak] = useState(0);

  // --- 2. MEMORY MATRIX STATE ---
  const [matrixSize] = useState(4);
  const [targetPattern, setTargetPattern] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [memoryScore, setMemoryScore] = useState(0);

  // --- 3. REFLEX TAP CHALLENGE STATE ---
  // 'idle' | 'waiting' | 'ready' | 'finished'
  const [reflexState, setReflexState] = useState('idle');
  const [reflexTime, setReflexTime] = useState(null);
  const [reflexRating, setReflexRating] = useState('');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // --- 4. EMOJI RIDDLE STATE ---
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [emojiGuess, setEmojiGuess] = useState('');
  const [emojiSolved, setEmojiSolved] = useState(false);
  const [emojiScore, setEmojiScore] = useState(0);

  const currentPinpoint = PINPOINT_PUZZLES[puzzleIndex % PINPOINT_PUZZLES.length];
  const currentEmoji = EMOJI_PUZZLES[emojiIndex % EMOJI_PUZZLES.length];

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
  };

  // --- PINPOINT HANDLERS ---
  const handleRevealClue = () => {
    if (revealedCount < currentPinpoint.clues.length) {
      setRevealedCount(revealedCount + 1);
    }
  };

  const handlePinpointSubmit = () => {
    if (!userGuess.trim()) return;
    const guessUpper = userGuess.trim().toUpperCase();
    const catUpper = currentPinpoint.category.toUpperCase();

    if (guessUpper === catUpper || catUpper.includes(guessUpper)) {
      setPinpointSolved(true);
      const points = (5 - revealedCount) * 10;
      setPinpointScore((prev) => prev + points);
      setPinpointStreak((prev) => prev + 1);
      Alert.alert('Brilliant! 🎯', `Correct! It was [${currentPinpoint.category}]. +${points} pts!`);
    } else {
      Alert.alert('Not Quite 🙈', 'Try revealing another clue or guess again!');
    }
  };

  const handleNextPinpoint = () => {
    setPuzzleIndex((prev) => prev + 1);
    setRevealedCount(1);
    setUserGuess('');
    setPinpointSolved(false);
  };

  // --- MEMORY MATRIX HANDLERS ---
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

    if (newSelected.length === targetPattern.length) {
      const isCorrect = targetPattern.every((t) => newSelected.includes(t));
      if (isCorrect) {
        setMemoryScore((prev) => prev + memoryLevel * 20);
        const nextLevel = memoryLevel + 1;
        setMemoryLevel(nextLevel);
        Alert.alert('Memory Master! 🧠', `Level ${memoryLevel} Complete! Starting Level ${nextLevel}...`, [
          { text: 'Continue', onPress: () => startMemoryGame(nextLevel) },
        ]);
      } else {
        Alert.alert('Oops! ❌', 'Incorrect pattern. Try again!', [
          { text: 'Retry Level', onPress: () => startMemoryGame(memoryLevel) },
        ]);
      }
    }
  };

  // --- REFLEX TAP HANDLERS ---
  const startReflexTest = () => {
    setReflexState('waiting');
    setReflexTime(null);
    setReflexRating('');

    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    timerRef.current = setTimeout(() => {
      setReflexState('ready');
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleReflexTap = () => {
    if (reflexState === 'waiting') {
      clearTimeout(timerRef.current);
      setReflexState('idle');
      Alert.alert('Too Early! 🤪', 'You tapped before the screen turned GREEN! Tap Start to retry.');
    } else if (reflexState === 'ready') {
      const elapsed = Date.now() - startTimeRef.current;
      setReflexTime(elapsed);
      setReflexState('finished');

      let rating = '';
      if (elapsed < 200) rating = '⚡ Lightning Reflexes! (Superhero speed)';
      else if (elapsed < 300) rating = '🚀 Super Fast! (Pro gamer level)';
      else if (elapsed < 450) rating = '👍 Good Average Human speed!';
      else rating = '🐢 Turtle Mode! Need more coffee!';
      setReflexRating(rating);
    }
  };

  // --- EMOJI RIDDLE HANDLERS ---
  const handleEmojiSubmit = () => {
    if (!emojiGuess.trim()) return;
    const guessUpper = emojiGuess.trim().replaceAll(' ', '').toUpperCase();
    const ansUpper = currentEmoji.answer.replaceAll(' ', '').toUpperCase();

    if (guessUpper === ansUpper || ansUpper.includes(guessUpper)) {
      setEmojiSolved(true);
      setEmojiScore((prev) => prev + 50);
      Alert.alert('You Got It! 🎉', `Correct! "${currentEmoji.answer}". +50 pts!`);
    } else {
      Alert.alert('Wrong Answer 😜', `Hint: ${currentEmoji.hint}`);
    }
  };

  const handleNextEmoji = () => {
    setEmojiIndex((prev) => prev + 1);
    setEmojiGuess('');
    setEmojiSolved(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Choosable Funny Games Header Bar */}
      <Text style={[styles.gameSectionTitle, { color: colors.textPrimary }]}>Choose A Funny Game 🎮</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollRow} contentContainerStyle={styles.tabScrollContent}>
        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'pinpoint' ? { backgroundColor: colors.googleBlue } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setActiveTab('pinpoint')}
        >
          <Ionicons name="sparkles-outline" size={16} color={activeTab === 'pinpoint' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'pinpoint' ? '#FFFFFF' : colors.textSecondary }]}>
            🎯 Pinpoint
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'memory' ? { backgroundColor: colors.googleBlue } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => {
            setActiveTab('memory');
            if (targetPattern.length === 0) startMemoryGame(1);
          }}
        >
          <Ionicons name="grid-outline" size={16} color={activeTab === 'memory' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'memory' ? '#FFFFFF' : colors.textSecondary }]}>
            🧠 Memory Grid
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'reflex' ? { backgroundColor: colors.googleBlue } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setActiveTab('reflex')}
        >
          <Ionicons name="flash-outline" size={16} color={activeTab === 'reflex' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'reflex' ? '#FFFFFF' : colors.textSecondary }]}>
            ⚡ Reflex Tap
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'emoji' ? { backgroundColor: colors.googleBlue } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setActiveTab('emoji')}
        >
          <Ionicons name="happy-outline" size={16} color={activeTab === 'emoji' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'emoji' ? '#FFFFFF' : colors.textSecondary }]}>
            🧩 Emoji Riddles
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- GAME 1: PINPOINT PUZZLE --- */}
      {activeTab === 'pinpoint' && (
        <View style={styles.gameContainer}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="trophy" size={18} color="#F59E0B" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{pinpointScore} Pts</Text>
            </View>

            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="flame" size={18} color="#EF4444" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{pinpointStreak} Streak</Text>
            </View>
          </View>

          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              Guess the common category connecting these clues:
            </Text>

            <View style={styles.cluesContainer}>
              {currentPinpoint.clues.map((clue, idx) => {
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

            {!pinpointSolved && revealedCount < currentPinpoint.clues.length && (
              <TouchableOpacity style={styles.revealBtn} onPress={handleRevealClue}>
                <Ionicons name="eye-outline" size={18} color={colors.googleBlue} />
                <Text style={styles.revealBtnText}>Reveal Next Clue ({currentPinpoint.clues.length - revealedCount} Left)</Text>
              </TouchableOpacity>
            )}

            {!pinpointSolved ? (
              <View style={styles.guessBox}>
                <TextInput
                  style={[styles.guessInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.textPrimary }]}
                  value={userGuess}
                  onChangeText={setUserGuess}
                  placeholder="Type your category guess..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.submitGuessBtn} onPress={handlePinpointSubmit}>
                  <Text style={styles.submitGuessText}>Guess</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.solvedBox}>
                <Ionicons name="checkmark-circle" size={44} color="#10B981" />
                <Text style={styles.solvedTitle}>Category: {currentPinpoint.category}</Text>
                <TouchableOpacity style={styles.nextPuzzleBtn} onPress={handleNextPinpoint}>
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

          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              {isMemorizing ? '🧠 Memorize the blue tiles...' : 'Tap the tiles you remembered!'}
            </Text>

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

      {/* --- GAME 3: REFLEX TAP CHALLENGE --- */}
      {activeTab === 'reflex' && (
        <View style={styles.gameContainer}>
          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.reflexHeader, { color: colors.textPrimary }]}>⚡ Reflex Speed Test</Text>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              Tap "Start Test" and wait for the box to turn **GREEN**, then TAP AS FAST AS YOU CAN!
            </Text>

            {reflexState === 'idle' && (
              <TouchableOpacity style={styles.reflexStartBtn} onPress={startReflexTest}>
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.reflexStartText}>Start Reflex Test</Text>
              </TouchableOpacity>
            )}

            {(reflexState === 'waiting' || reflexState === 'ready') && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.reflexBox,
                  { backgroundColor: reflexState === 'ready' ? '#10B981' : '#EF4444' },
                ]}
                onPress={handleReflexTap}
              >
                <Text style={styles.reflexBoxText}>
                  {reflexState === 'ready' ? 'TAP NOW! 💥' : 'WAIT FOR GREEN... 🛑'}
                </Text>
              </TouchableOpacity>
            )}

            {reflexState === 'finished' && (
              <View style={styles.reflexResultBox}>
                <Text style={styles.reflexTimeValue}>{reflexTime} ms</Text>
                <Text style={[styles.reflexRatingText, { color: colors.textPrimary }]}>{reflexRating}</Text>

                <TouchableOpacity style={styles.reflexStartBtn} onPress={startReflexTest}>
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.reflexStartText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* --- GAME 4: EMOJI RIDDLE QUIZ --- */}
      {activeTab === 'emoji' && (
        <View style={styles.gameContainer}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="trophy" size={18} color="#F59E0B" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{emojiScore} Pts</Text>
            </View>

            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>Puzzle #{emojiIndex + 1}</Text>
            </View>
          </View>

          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              Guess the movie or phrase represented by these emojis:
            </Text>

            <View style={styles.emojiDisplayBox}>
              <Text style={styles.emojiText}>{currentEmoji.emoji}</Text>
            </View>

            <Text style={[styles.emojiHintText, { color: colors.textSecondary }]}>
              💡 Hint: {currentEmoji.hint}
            </Text>

            {!emojiSolved ? (
              <View style={styles.guessBox}>
                <TextInput
                  style={[styles.guessInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.textPrimary }]}
                  value={emojiGuess}
                  onChangeText={setEmojiGuess}
                  placeholder="e.g. LION KING..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.submitGuessBtn} onPress={handleEmojiSubmit}>
                  <Text style={styles.submitGuessText}>Guess</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.solvedBox}>
                <Ionicons name="happy" size={44} color="#10B981" />
                <Text style={styles.solvedTitle}>{currentEmoji.answer}</Text>
                <TouchableOpacity style={styles.nextPuzzleBtn} onPress={handleNextEmoji}>
                  <Text style={styles.nextPuzzleText}>Next Emoji Riddle 🚀</Text>
                </TouchableOpacity>
              </View>
            )}
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
  gameSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily,
  },
  tabScrollRow: {
    marginBottom: 20,
  },
  tabScrollContent: {
    gap: 8,
  },
  gameTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  gameTabText: {
    fontWeight: '700',
    fontSize: 13,
    fontFamily,
  },
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
  reflexHeader: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily,
  },
  reflexStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B57D0',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  reflexStartText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  reflexBox: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  reflexBoxText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  reflexResultBox: {
    alignItems: 'center',
    marginTop: 16,
  },
  reflexTimeValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0B57D0',
  },
  reflexRatingText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  emojiDisplayBox: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: 12,
  },
  emojiText: {
    fontSize: 54,
  },
  emojiHintText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
});
