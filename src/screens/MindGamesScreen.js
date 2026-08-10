import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Animated,
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

// 3. TODDLER BALLOON PALETTE
const BALLOON_ITEMS = [
  { id: 1, color: '#EF4444', emoji: '🐶', label: 'Doggy' },
  { id: 2, color: '#3B82F6', emoji: '🐱', label: 'Kitty' },
  { id: 3, color: '#10B981', emoji: '🐰', label: 'Bunny' },
  { id: 4, color: '#F59E0B', emoji: '🐻', label: 'Teddy' },
  { id: 5, color: '#8B5CF6', emoji: '🐼', label: 'Panda' },
  { id: 6, color: '#EC4899', emoji: '🦁', label: 'Lion' },
  { id: 7, color: '#06B6D4', emoji: '🐸', label: 'Froggy' },
  { id: 8, color: '#F97316', emoji: '🦄', label: 'Unicorn' },
];

// 4. 4-YEAR-OLD KIDS QUEST PUZZLES
const KIDS_QUESTS = [
  {
    target: { emoji: '🐶', name: 'Doggy' },
    options: [
      { emoji: '🐱', name: 'Kitty', color: '#3B82F6' },
      { emoji: '🐶', name: 'Doggy', color: '#EF4444', isCorrect: true },
      { emoji: '🐰', name: 'Bunny', color: '#10B981' },
      { emoji: '🐻', name: 'Teddy', color: '#F59E0B' },
    ],
  },
  {
    target: { emoji: '🍎', name: 'Red Apple' },
    options: [
      { emoji: '🍌', name: 'Banana', color: '#F59E0B' },
      { emoji: '🍎', name: 'Red Apple', color: '#EF4444', isCorrect: true },
      { emoji: '🍇', name: 'Grapes', color: '#8B5CF6' },
      { emoji: '🍉', name: 'Watermelon', color: '#10B981' },
    ],
  },
  {
    target: { emoji: '🦁', name: 'King Lion' },
    options: [
      { emoji: '🐼', name: 'Panda', color: '#64748B' },
      { emoji: '🐘', name: 'Elephant', color: '#3B82F6' },
      { emoji: '🦁', name: 'King Lion', color: '#F97316', isCorrect: true },
      { emoji: '🐵', name: 'Monkey', color: '#F59E0B' },
    ],
  },
  {
    target: { emoji: '🦄', name: 'Magical Unicorn' },
    options: [
      { emoji: '🦄', name: 'Magical Unicorn', color: '#EC4899', isCorrect: true },
      { emoji: '🐸', name: 'Froggy', color: '#10B981' },
      { emoji: '🐶', name: 'Doggy', color: '#EF4444' },
      { emoji: '🐱', name: 'Kitty', color: '#3B82F6' },
    ],
  },
  {
    target: { emoji: '🚀', name: 'Space Rocket' },
    options: [
      { emoji: '🚗', name: 'Car', color: '#EF4444' },
      { emoji: '⛵', name: 'Boat', color: '#06B6D4' },
      { emoji: '🚀', name: 'Space Rocket', color: '#8B5CF6', isCorrect: true },
      { emoji: '✈️', name: 'Airplane', color: '#3B82F6' },
    ],
  },
];

// VEHICLES GARAGE
const VEHICLE_GARAGE = [
  { id: 'f1', emoji: '🏎️', name: 'F1 Speedster', color: '#EF4444' },
  { id: 'monster', emoji: '🛻', name: 'Monster Truck', color: '#F59E0B' },
  { id: 'police', emoji: '🚓', name: 'Police Cruiser', color: '#3B82F6' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket Car', color: '#8B5CF6' },
];

// RIVAL AI RACERS
const RIVAL_AI_RACERS = [
  { id: 'ai1', name: 'Speedy Blue', emoji: '🏎️', lane: 0 },
  { id: 'ai2', name: 'Bumpy Orange', emoji: '🛻', lane: 2 },
  { id: 'ai3', name: 'Turbo Police', emoji: '🚓', lane: 1 },
];

export default function MindGamesScreen({ isDarkMode }) {
  // Choosable Game Tabs: 'racing' | 'kids_quest' | 'balloon' | 'pinpoint' | 'memory' | 'reflex' | 'emoji'
  const [activeTab, setActiveTab] = useState('racing');

  // --- 1. REAL DRIFT GRAND PRIX STATE ---
  const [carLane, setCarLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [raceScore, setRaceScore] = useState(0); // Distance meters
  const [driftScore, setDriftScore] = useState(0); // Drift score
  const [lapNumber, setLapNumber] = useState(1); // Laps 1, 2, 3
  const [racePosition, setRacePosition] = useState(2); // 1st, 2nd, 3rd, 4th
  const [raceStatus, setRaceStatus] = useState('idle'); // 'idle' | 'racing' | 'crashed' | 'finished'
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_GARAGE[0]);
  const [isDrifting, setIsDrifting] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [raceBanner, setRaceBanner] = useState(null);

  // AI Opponents state (Row positions 0-3 on track)
  const [aiOpponents, setAiOpponents] = useState([
    { ...RIVAL_AI_RACERS[0], row: 0, distance: 80 },
    { ...RIVAL_AI_RACERS[1], row: 1, distance: 40 },
    { ...RIVAL_AI_RACERS[2], row: 2, distance: 10 },
  ]);

  const raceIntervalRef = useRef(null);

  // --- 2. KIDS QUEST (4YRS) STATE ---
  const [questIndex, setQuestIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [questFeedback, setQuestFeedback] = useState(null);
  const [isWinner, setIsWinner] = useState(false);

  // --- 3. TODDLER BALLOON POP STATE ---
  const [popScore, setPopScore] = useState(0);
  const [poppedIds, setPoppedIds] = useState([]);
  const [popBurstEffect, setPopBurstEffect] = useState(null);

  // --- 4. PINPOINT STATE ---
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);
  const [userGuess, setUserGuess] = useState('');
  const [pinpointSolved, setPinpointSolved] = useState(false);
  const [pinpointScore, setPinpointScore] = useState(0);
  const [pinpointStreak, setPinpointStreak] = useState(0);

  // --- 5. MEMORY MATRIX STATE ---
  const [matrixSize] = useState(4);
  const [targetPattern, setTargetPattern] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [memoryScore, setMemoryScore] = useState(0);

  // --- 6. REFLEX TAP CHALLENGE STATE ---
  const [reflexState, setReflexState] = useState('idle');
  const [reflexTime, setReflexTime] = useState(null);
  const [reflexRating, setReflexRating] = useState('');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // --- 7. EMOJI RIDDLE STATE ---
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [emojiGuess, setEmojiGuess] = useState('');
  const [emojiSolved, setEmojiSolved] = useState(false);
  const [emojiScore, setEmojiScore] = useState(0);

  const currentQuest = KIDS_QUESTS[questIndex % KIDS_QUESTS.length];
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

  // --- DRIFT GRAND PRIX GAME ENGINE ---
  useEffect(() => {
    if (raceStatus === 'racing') {
      const intervalSpeed = isNitroActive ? 300 : isDrifting ? 400 : 550;

      raceIntervalRef.current = setInterval(() => {
        // Move AI Opponents along track
        setAiOpponents((prevAi) => {
          return prevAi.map((ai) => {
            const nextRow = (ai.row + 1) % 4;
            const newDist = ai.distance + (Math.random() > 0.4 ? 15 : 5);
            // Change AI lane occasionally
            const newLane = Math.random() > 0.8 ? (ai.lane + 1) % 3 : ai.lane;

            return {
              ...ai,
              row: nextRow,
              distance: newDist,
              lane: newLane,
            };
          });
        });

        // Player Distance & Drift Accumulation
        setRaceScore((prevDist) => {
          const addedDist = isNitroActive ? 30 : isDrifting ? 20 : 15;
          const nextDist = prevDist + addedDist;

          // Lap Progression (Every 300m = 1 Lap)
          const currentLap = Math.min(Math.floor(nextDist / 300) + 1, 3);
          setLapNumber(currentLap);

          if (nextDist >= 900) {
            setRaceStatus('finished');
            clearInterval(raceIntervalRef.current);
          }

          return nextDist;
        });

        if (isDrifting) {
          setDriftScore((prev) => prev + 50);
        }
      }, intervalSpeed);
    } else {
      clearInterval(raceIntervalRef.current);
    }

    return () => clearInterval(raceIntervalRef.current);
  }, [raceStatus, carLane, isDrifting, isNitroActive]);

  // Calculate live position rank (1st to 4th) based on distance
  useEffect(() => {
    if (raceStatus === 'racing') {
      let rank = 1;
      aiOpponents.forEach((ai) => {
        if (ai.distance > raceScore) {
          rank += 1;
        }
      });
      setRacePosition(rank);
    }
  }, [raceScore, aiOpponents, raceStatus]);

  const triggerNitroBoost = () => {
    setIsNitroActive(true);
    showBanner('🚀 NITRO BOOST ACTIVE! 💥');
    setTimeout(() => {
      setIsNitroActive(false);
    }, 3000);
  };

  const startDriftState = () => {
    setIsDrifting(true);
    showBanner('💨 HIGH-SPEED DRIFT! +50 PTS!');
  };

  const stopDriftState = () => {
    setIsDrifting(false);
  };

  const showBanner = (text) => {
    setRaceBanner(text);
    setTimeout(() => setRaceBanner(null), 1200);
  };

  const startRaceGame = () => {
    setCarLane(1);
    setRaceScore(0);
    setDriftScore(0);
    setLapNumber(1);
    setRacePosition(2);
    setIsDrifting(false);
    setIsNitroActive(false);
    setAiOpponents([
      { ...RIVAL_AI_RACERS[0], row: 0, distance: 80 },
      { ...RIVAL_AI_RACERS[1], row: 1, distance: 40 },
      { ...RIVAL_AI_RACERS[2], row: 2, distance: 10 },
    ]);
    setRaceStatus('racing');
  };

  const moveCarLeft = () => {
    if (carLane > 0) setCarLane((prev) => prev - 1);
  };

  const moveCarRight = () => {
    if (carLane < 2) setCarLane((prev) => prev + 1);
  };

  // --- KIDS QUEST HANDLERS ---
  const handleOptionPress = (option) => {
    if (option.isCorrect) {
      const newStars = stars + 1;
      setStars(newStars);
      setQuestFeedback(`🌟 BINGO! Super Job! Found ${option.emoji} ${option.name}! ⭐`);

      if (newStars >= 5) {
        setTimeout(() => setIsWinner(true), 500);
      } else {
        setTimeout(() => {
          setQuestIndex((prev) => prev + 1);
          setQuestFeedback(null);
        }, 1200);
      }
    } else {
      setQuestFeedback(`Oopsie! That's ${option.emoji} ${option.name}! Find ${currentQuest.target.emoji} ${currentQuest.target.name}! 😜`);
    }
  };

  const handleRestartKidsQuest = () => {
    setQuestIndex(0);
    setStars(0);
    setIsWinner(false);
    setQuestFeedback(null);
  };

  // --- TODDLER BALLOON POP HANDLERS ---
  const handlePopBalloon = (item) => {
    if (poppedIds.includes(item.id)) return;
    setPoppedIds((prev) => [...prev, item.id]);
    setPopScore((prev) => prev + 1);
    setPopBurstEffect(`🎉 POP! ${item.emoji} ${item.label}!`);
    setTimeout(() => {
      setPoppedIds((prev) => prev.filter((id) => id !== item.id));
      setPopBurstEffect(null);
    }, 600);
  };

  const handleResetBalloons = () => {
    setPoppedIds([]);
    setPopScore(0);
    setPopBurstEffect('🎈 All Balloons Ready!');
    setTimeout(() => setPopBurstEffect(null), 1000);
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
    setTimeout(() => setIsMemorizing(false), 1800);
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
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
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

  const getRankBadgeText = (pos) => {
    if (pos === 1) return '🥇 1st';
    if (pos === 2) return '🥈 2nd';
    if (pos === 3) return '🥉 3rd';
    return '4th';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Choosable Funny Games Header Bar */}
      <Text style={[styles.gameSectionTitle, { color: colors.textPrimary }]}>Choose A Game 🎮</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollRow} contentContainerStyle={styles.tabScrollContent}>
        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'racing' ? { backgroundColor: '#EF4444' } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setActiveTab('racing')}
        >
          <Ionicons name="car-sport-outline" size={16} color={activeTab === 'racing' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'racing' ? '#FFFFFF' : colors.textSecondary }]}>
            🏎️ Drift Grand Prix
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'kids_quest' ? { backgroundColor: '#F59E0B' } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setActiveTab('kids_quest')}
        >
          <Ionicons name="star" size={16} color={activeTab === 'kids_quest' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'kids_quest' ? '#FFFFFF' : colors.textSecondary }]}>
            🎨 Kids Quest (4Yrs)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameTabChip, activeTab === 'balloon' ? { backgroundColor: '#EC4899' } : { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setActiveTab('balloon')}
        >
          <Ionicons name="balloon-outline" size={16} color={activeTab === 'balloon' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.gameTabText, { color: activeTab === 'balloon' ? '#FFFFFF' : colors.textSecondary }]}>
            🎈 Toddler Pop (2Yrs)
          </Text>
        </TouchableOpacity>

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

      {/* --- GAME 1: REAL DRIFT GRAND PRIX 🏎️💨 --- */}
      {activeTab === 'racing' && (
        <View style={styles.gameContainer}>
          {/* Header Live Metrics: Rank, Lap, Drift Pts */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}>
              <Text style={[styles.scoreText, { color: '#FFFFFF' }]}>{getRankBadgeText(racePosition)} Place</Text>
            </View>

            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={{ fontSize: 16 }}>🏁</Text>
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>Lap {lapNumber}/3</Text>
            </View>

            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={{ fontSize: 16 }}>💨</Text>
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{driftScore} Drift</Text>
            </View>
          </View>

          <View style={[styles.puzzleCard, { backgroundColor: '#1E293B', borderColor: colors.border, padding: 16 }]}>
            {/* Event Toast Banner */}
            {raceBanner && (
              <View style={styles.raceBannerBox}>
                <Text style={styles.raceBannerText}>{raceBanner}</Text>
              </View>
            )}

            {/* START RACE SCREEN */}
            {raceStatus === 'idle' && (
              <View style={styles.raceStartContainer}>
                <Text style={{ fontSize: 60 }}>🏁🏎️💨</Text>
                <Text style={styles.raceStartTitle}>Real Drift Grand Prix!</Text>
                <Text style={styles.raceStartSub}>Race 3 rival AI drivers! Drift turns 💨 & Nitro 🚀 to win 1st Place!</Text>

                <Text style={styles.garageTitle}>SELECT YOUR RACING RIDE:</Text>
                <View style={styles.garageRow}>
                  {VEHICLE_GARAGE.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.garageChip,
                        selectedVehicle.id === v.id ? { backgroundColor: v.color, borderColor: '#FFFFFF', borderWidth: 2 } : { backgroundColor: 'rgba(255,255,255,0.1)' },
                      ]}
                      onPress={() => setSelectedVehicle(v)}
                    >
                      <Text style={{ fontSize: 26 }}>{v.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.startRaceBtn} onPress={startRaceGame}>
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                  <Text style={styles.startRaceBtnText}>Start Grand Prix!</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* RACE FINISHED / WINNER PODIUM */}
            {raceStatus === 'finished' && (
              <View style={styles.raceStartContainer}>
                <Text style={{ fontSize: 64 }}>{racePosition === 1 ? '🏆' : racePosition === 2 ? '🥈' : '🥉'}</Text>
                <Text style={[styles.raceStartTitle, racePosition === 1 && { color: '#F59E0B' }]}>
                  {racePosition === 1 ? 'GRAND PRIX CHAMPION!' : `FINISHED ${getRankBadgeText(racePosition)} PLACE!`}
                </Text>
                <Text style={styles.raceStartSub}>Total Distance: {raceScore}m | Total Drift: {driftScore} Pts! 🏁</Text>

                <TouchableOpacity style={styles.startRaceBtn} onPress={startRaceGame}>
                  <Ionicons name="trophy" size={20} color="#FFFFFF" />
                  <Text style={styles.startRaceBtnText}>Race Again 🏎️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* DYNAMIC CIRCUIT TRACK & AI OPPONENTS */}
            {raceStatus === 'racing' && (
              <View style={styles.raceTrackArea}>
                <View style={[styles.roadTrackGrid, isNitroActive && { borderColor: '#F59E0B', borderWidth: 4 }]}>
                  {[0, 1, 2, 3].map((rowIndex) => (
                    <View key={rowIndex} style={styles.roadRow}>
                      {[0, 1, 2].map((laneIndex) => {
                        // Check if AI Racer is in this grid cell
                        const aiHere = aiOpponents.find((ai) => ai.row === rowIndex && ai.lane === laneIndex);
                        const isPlayerHere = rowIndex === 3 && carLane === laneIndex;

                        return (
                          <TouchableOpacity
                            key={laneIndex}
                            style={[
                              styles.laneCell,
                              laneIndex === 1 && styles.middleLaneBorder,
                            ]}
                            onPress={() => setCarLane(laneIndex)}
                          >
                            {/* Rival AI Racer Emoji */}
                            {aiHere && !isPlayerHere && (
                              <View style={styles.aiCarBadge}>
                                <Text style={styles.trackEmojiItem}>{aiHere.emoji}</Text>
                                <Text style={styles.aiLabelText}>{aiHere.name}</Text>
                              </View>
                            )}

                            {/* Player Car Emoji with Tire Drift Smoke Effect */}
                            {isPlayerHere && (
                              <View style={styles.playerCarContainer}>
                                {isDrifting && <Text style={styles.driftSmokeEmoji}>💨</Text>}
                                <Text style={[styles.playerCarEmoji, isDrifting && { transform: [{ rotate: '-25deg' }] }]}>
                                  {isNitroActive ? '🔥' + selectedVehicle.emoji : selectedVehicle.emoji}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>

                {/* Real Drift Controls Row: Left, DRIFT, NITRO, Right */}
                <View style={styles.steeringControlsRow}>
                  <TouchableOpacity style={styles.steerBtn} onPress={moveCarLeft}>
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    <Text style={styles.steerBtnText}>LEFT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.driftControlBtn, isDrifting && { backgroundColor: '#F59E0B' }]}
                    onPressIn={startDriftState}
                    onPressOut={stopDriftState}
                  >
                    <Text style={styles.driftBtnText}>💨 DRIFT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.nitroBoostBtn, isNitroActive && { backgroundColor: '#F59E0B' }]}
                    onPress={triggerNitroBoost}
                    disabled={isNitroActive}
                  >
                    <Text style={styles.nitroBtnText}>🚀 NITRO</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.steerBtn} onPress={moveCarRight}>
                    <Text style={styles.steerBtnText}>RIGHT</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* --- GAME 2: KIDS SAFARI QUEST (4 YEARS OLD) 🎨 --- */}
      {activeTab === 'kids_quest' && (
        <View style={styles.gameContainer}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{stars} / 5 Stars</Text>
            </View>

            <TouchableOpacity style={[styles.scoreBadge, { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]} onPress={handleRestartKidsQuest}>
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={[styles.scoreText, { color: '#FFFFFF' }]}>Restart Quest</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 24 }]}>
            {!isWinner ? (
              <>
                <View style={styles.questTargetBox}>
                  <Text style={styles.questTargetTitle}>Find the {currentQuest.target.name}! 👇</Text>
                  <Text style={styles.questTargetEmoji}>{currentQuest.target.emoji}</Text>
                </View>

                {questFeedback && (
                  <View style={styles.questFeedbackBox}>
                    <Text style={styles.questFeedbackText}>{questFeedback}</Text>
                  </View>
                )}

                <View style={styles.questOptionsGrid}>
                  {currentQuest.options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      style={[styles.questOptionCard, { backgroundColor: opt.color }]}
                      onPress={() => handleOptionPress(opt)}
                    >
                      <Text style={styles.questOptionEmoji}>{opt.emoji}</Text>
                      <Text style={styles.questOptionName}>{opt.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.winnerContainer}>
                <Text style={{ fontSize: 64 }}>🏆</Text>
                <Text style={styles.winnerTitle}>SUPERSTAR WINNER! 🎉</Text>
                <Text style={styles.winnerSub}>You collected all 5 Stars! ⭐⭐⭐⭐⭐</Text>
                <TouchableOpacity style={styles.playAgainBtn} onPress={handleRestartKidsQuest}>
                  <Ionicons name="trophy" size={20} color="#FFFFFF" />
                  <Text style={styles.playAgainText}>Play Again!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* --- GAME 3: TODDLER BALLOON POP 🎈 --- */}
      {activeTab === 'balloon' && (
        <View style={styles.gameContainer}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={{ fontSize: 20 }}>🎈</Text>
              <Text style={[styles.scoreText, { color: colors.textPrimary }]}>{popScore} Popped!</Text>
            </View>

            <TouchableOpacity style={[styles.scoreBadge, { backgroundColor: '#EC4899', borderColor: '#EC4899' }]} onPress={handleResetBalloons}>
              <Ionicons name="refresh-circle" size={20} color="#FFFFFF" />
              <Text style={[styles.scoreText, { color: '#FFFFFF' }]}>Reset Game</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.puzzleCard, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 24 }]}>
            <Text style={[styles.toddlerHeader, { color: colors.textPrimary }]}>
              🎈 Tap Any Balloon to Pop It! 🎉
            </Text>
            <Text style={[styles.puzzleInstruction, { color: colors.textSecondary }]}>
              Super easy & colorful fun designed for 2-year-olds!
            </Text>

            {popBurstEffect && (
              <View style={styles.popToastBox}>
                <Text style={styles.popToastText}>{popBurstEffect}</Text>
              </View>
            )}

            <View style={styles.balloonGridContainer}>
              {BALLOON_ITEMS.map((b) => {
                const isPopped = poppedIds.includes(b.id);
                return (
                  <TouchableOpacity
                    key={b.id}
                    activeOpacity={0.7}
                    style={[
                      styles.balloonTouchTarget,
                      { backgroundColor: isPopped ? 'rgba(0,0,0,0.04)' : b.color },
                    ]}
                    onPress={() => handlePopBalloon(b)}
                  >
                    {!isPopped ? (
                      <View style={styles.balloonContentCol}>
                        <Text style={styles.balloonEmoji}>{b.emoji}</Text>
                        <Text style={styles.balloonText}>🎈 {b.label}</Text>
                      </View>
                    ) : (
                      <Text style={styles.poppedBurstText}>💥 POP!</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* --- GAME 4: PINPOINT PUZZLE --- */}
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

      {/* --- GAME 5: MEMORY MATRIX --- */}
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

      {/* --- GAME 6: REFLEX TAP CHALLENGE --- */}
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

      {/* --- GAME 7: EMOJI RIDDLE QUIZ --- */}
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
  raceBannerBox: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  raceBannerText: {
    color: '#1F2937',
    fontWeight: '900',
    fontSize: 13,
  },
  raceStartContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  raceStartTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
    fontFamily,
  },
  raceStartSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  garageTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  garageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  garageChip: {
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startRaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 18,
    gap: 8,
    elevation: 4,
  },
  startRaceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  raceTrackArea: {
    width: '100%',
    alignItems: 'center',
  },
  roadTrackGrid: {
    width: '100%',
    height: 270,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  roadRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  laneCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleLaneBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  aiCarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  trackEmojiItem: {
    fontSize: 30,
  },
  playerCarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playerCarEmoji: {
    fontSize: 36,
  },
  driftSmokeEmoji: {
    position: 'absolute',
    left: -18,
    fontSize: 20,
  },
  steeringControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    gap: 6,
  },
  steerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 2,
    elevation: 3,
  },
  steerBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  driftControlBtn: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 4,
  },
  driftBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  nitroBoostBtn: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 4,
  },
  nitroBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  questTargetBox: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#F59E0B',
    width: '100%',
  },
  questTargetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily,
  },
  questTargetEmoji: {
    fontSize: 50,
  },
  questFeedbackBox: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  questFeedbackText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
  },
  questOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  questOptionCard: {
    width: '47%',
    height: 110,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  questOptionEmoji: {
    fontSize: 38,
  },
  questOptionName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  winnerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  winnerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F59E0B',
    marginVertical: 6,
    fontFamily,
  },
  winnerSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 16,
  },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
    gap: 8,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  toddlerHeader: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily,
  },
  popToastBox: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  popToastText: {
    color: '#1F2937',
    fontWeight: '900',
    fontSize: 14,
  },
  balloonGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    width: '100%',
  },
  balloonTouchTarget: {
    width: '47%',
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  balloonContentCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balloonEmoji: {
    fontSize: 34,
  },
  balloonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  poppedBurstText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EF4444',
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
