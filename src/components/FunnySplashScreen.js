import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function FunnySplashScreen({ onFinish, isDarkMode }) {
  // Stage: 0 = Typing, 1 = Amnesia/Zzz, 2 = EPIC BONK!, 3 = Lightbulb/Relax, 4 = Final Glow
  const [stage, setStage] = useState(0);

  // Animations
  const boyScale = useRef(new Animated.Value(1)).current;
  const boySquishY = useRef(new Animated.Value(1)).current;
  const headShake = useRef(new Animated.Value(0)).current;
  const clockDropY = useRef(new Animated.Value(-180)).current;
  const clockRotate = useRef(new Animated.Value(0)).current;
  const bonkScale = useRef(new Animated.Value(0)).current;
  const zzzY = useRef(new Animated.Value(0)).current;
  const zzzOpacity = useRef(new Animated.Value(0)).current;
  const bulbScale = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const progressBar = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 0. Initial Speech Bubble Fade
    Animated.timing(bubbleOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 1. Stage 1: Amnesia / Zzz (after 800ms)
    const t1 = setTimeout(() => {
      setStage(1);
      Animated.loop(
        Animated.parallel([
          Animated.timing(zzzY, { toValue: -20, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(zzzOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(zzzOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, 800);

    // 2. Stage 2: THE EPIC BONK! 💥🔔 (after 1800ms)
    const t2 = setTimeout(() => {
      setStage(2);

      Animated.spring(clockDropY, {
        toValue: 0,
        friction: 4,
        tension: 70,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(clockRotate, { toValue: -15, duration: 80, useNativeDriver: true }),
          Animated.timing(clockRotate, { toValue: 15, duration: 80, useNativeDriver: true }),
          Animated.timing(clockRotate, { toValue: 0, duration: 80, useNativeDriver: true }),
        ])
      ).start();

      Animated.spring(bonkScale, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.timing(boySquishY, { toValue: 0.8, duration: 80, useNativeDriver: true }),
        Animated.timing(boySquishY, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(boySquishY, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();

      Animated.sequence([
        Animated.timing(headShake, { toValue: -18, duration: 60, useNativeDriver: true }),
        Animated.timing(headShake, { toValue: 18, duration: 60, useNativeDriver: true }),
        Animated.timing(headShake, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(headShake, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(headShake, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }, 1800);

    // 3. Stage 3: Lightbulb & Relaxed! 💡😌 (after 2800ms)
    const t3 = setTimeout(() => {
      setStage(3);

      Animated.spring(bulbScale, {
        toValue: 1.15,
        friction: 4,
        useNativeDriver: true,
      }).start();

      Animated.spring(boyScale, {
        toValue: 1.1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(progressBar, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      ]).start();
    }, 2800);

    // 4. Smooth Transition Out to Main App (after 4300ms)
    const t4 = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 4300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const clockSpin = clockRotate.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  const headShakeDeg = headShake.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const progressWidth = progressBar.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Pure White Theme matching application
  const theme = {
    bg: isDarkMode ? '#090D16' : '#F0F4F9',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    cardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#E1E9F5',
    titleText: isDarkMode ? '#FFFFFF' : '#1F2937',
    subText: isDarkMode ? '#93C5FD' : '#0B57D0',
    clockBg: isDarkMode ? '#0F172A' : '#E8F0FE',
    laptopBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    progressBg: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.bg, opacity: containerOpacity }]}>
      {/* Main White Cartoon Card */}
      <View style={[styles.glassCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        {/* Floating Zzz Animated Graphic */}
        {stage === 1 && (
          <Animated.View
            style={[
              styles.zzzContainer,
              {
                opacity: zzzOpacity,
                transform: [{ translateY: zzzY }],
              },
            ]}
          >
            <Text style={styles.zzzText}>Zzz... 😴❓</Text>
          </Animated.View>
        )}

        {/* Animated Dropping Alarm Clock (Sits neatly at top of card) */}
        {(stage === 2 || stage === 3) && (
          <Animated.View
            style={[
              styles.alarmDropper,
              {
                transform: [{ translateY: clockDropY }, { rotate: clockSpin }],
              },
            ]}
          >
            <View style={[styles.clockIconCircle, { backgroundColor: theme.clockBg }]}>
              <Ionicons name="alarm" size={38} color="#0B57D0" />
            </View>
          </Animated.View>
        )}

        {/* Comic "BONK! 💥" Action Callout Badge */}
        {stage === 2 && (
          <Animated.View
            style={[
              styles.bonkBadge,
              {
                transform: [{ scale: bonkScale }],
              },
            ]}
          >
            <Text style={styles.bonkBadgeText}>💥 BONK! 💥</Text>
          </Animated.View>
        )}

        {/* Top Speech Bubble */}
        <Animated.View style={[styles.speechBubbleCard, { opacity: bubbleOpacity }]}>
          {stage === 0 && <Text style={styles.speechText}>Grinding on tasks... 💻⚡</Text>}
          {stage === 1 && <Text style={styles.speechText}>Wait... what did I forget to do?! 😵‍💫❓</Text>}
          {stage === 2 && <Text style={[styles.speechText, { color: '#EF4444', fontWeight: '900' }]}>Ouch! Time to check in! ⏰💥</Text>}
          {stage === 3 && <Text style={[styles.speechText, { color: '#059669', fontWeight: '900' }]}>Aha! We are here to remind, you can relax! 💡😌</Text>}
          <View style={styles.speechTriangle} />
        </Animated.View>

        {/* Character Avatar with Lightbulb */}
        <View style={styles.characterContainer}>
          {stage === 3 && (
            <Animated.View
              style={[
                styles.lightbulbWrapper,
                {
                  transform: [{ scale: bulbScale }],
                },
              ]}
            >
              <Ionicons name="bulb" size={32} color="#F59E0B" />
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.boyCharacterWrapper,
              {
                transform: [
                  { scale: boyScale },
                  { scaleY: boySquishY },
                  { rotate: headShakeDeg },
                ],
              },
            ]}
          >
            {stage === 0 && <Text style={styles.characterEmoji}>👨‍💻</Text>}
            {stage === 1 && <Text style={styles.characterEmoji}>😵‍💫❓</Text>}
            {stage === 2 && <Text style={styles.characterEmoji}>🤯💥</Text>}
            {stage === 3 && <Text style={styles.characterEmoji}>😌✨</Text>}
          </Animated.View>
        </View>

        {/* Workspace Desk */}
        <View style={styles.workspaceDesk}>
          <View style={[styles.laptopDisplay, { backgroundColor: theme.laptopBg }]}>
            <View style={styles.laptopHeaderDot} />
            <Text style={styles.laptopCodeText}>
              {stage === 2 ? '🚨 ALARM ALERT!' : '/// REMINDER SYSTEM'}
            </Text>
          </View>
          <Text style={styles.deskProps}>☕ 📑 🖊️</Text>
        </View>
      </View>

      {/* App Title & Tagline Branding */}
      <Animated.View style={[styles.brandingContainer, { opacity: titleFade }]}>
        <Text style={[styles.brandTitle, { color: theme.titleText }]}>We Are Here To Remind ⏰</Text>
        <Text style={[styles.brandSub, { color: theme.subText }]}>You can relax! 😌✨</Text>

        {/* Animated Progress Bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.progressBg }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif-medium' });

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  glassCard: {
    width: width * 0.86,
    height: 330,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
    position: 'relative',
    shadowColor: '#0B57D0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  zzzContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 15,
  },
  zzzText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B57D0',
  },
  alarmDropper: {
    position: 'absolute',
    top: -50,
    zIndex: 30,
  },
  clockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#0B57D0',
    elevation: 8,
    shadowColor: '#0B57D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bonkBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
    zIndex: 15,
    elevation: 6,
  },
  bonkBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
    fontFamily,
  },
  speechBubbleCard: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginTop: 10,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#F59E0B',
    elevation: 4,
  },
  speechText: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily,
  },
  speechTriangle: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FEF08A',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  lightbulbWrapper: {
    position: 'absolute',
    top: -24,
    zIndex: 15,
  },
  boyCharacterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterEmoji: {
    fontSize: 78,
  },
  workspaceDesk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 12,
  },
  laptopDisplay: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0B57D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  laptopHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  laptopCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B57D0',
    fontFamily,
  },
  deskProps: {
    fontSize: 18,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily,
  },
  brandSub: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    fontFamily,
  },
  progressTrack: {
    width: 180,
    height: 6,
    borderRadius: 3,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0B57D0',
    borderRadius: 3,
  },
});
