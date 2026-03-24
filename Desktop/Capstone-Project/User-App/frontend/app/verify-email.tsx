import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import {
  COLORS,
  GRADIENTS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
} from '../src/constants/theme';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { firebaseUser, logout, resendVerificationEmail, reloadAndCheckVerified } = useAuth();

  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    try {
      await resendVerificationEmail();
      setResendCooldown(RESEND_COOLDOWN);
      Alert.alert('Email Sent', 'A new verification email has been sent to your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not resend email. Please try again.');
    }
  };

  const handleCheckVerified = async () => {
    setCheckingVerification(true);
    try {
      const verified = await reloadAndCheckVerified();
      if (verified) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Not Yet Verified',
          'Your email has not been verified yet. Please check your inbox (and spam folder) and click the link.',
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not check verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  const email = firebaseUser?.email ?? '';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.navy}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={40} color={COLORS.navy[800]} />
        </View>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>Check your inbox to continue</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.bodyText}>
          We sent a verification link to:
        </Text>
        <View style={styles.emailBadge}>
          <Ionicons name="mail-outline" size={16} color={COLORS.navy[600]} />
          <Text style={styles.emailText}>{email}</Text>
        </View>
        <Text style={styles.instructionText}>
          Open the email and tap the link to verify your account. Once done, come back and tap the button below.
        </Text>
        <Text style={styles.junkTipText}>
          Tip: Acadia Outlook often moves Firebase emails to Junk Mail. Please check your Junk folder if you don't see it in Inbox.
        </Text>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCheckVerified}
          disabled={checkingVerification}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.navy}
            style={styles.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {checkingVerification ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          style={[styles.secondaryButton, resendCooldown > 0 && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={resendCooldown > 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={resendCooldown > 0 ? COLORS.textMuted : COLORS.navy[800]}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              resendCooldown > 0 && styles.buttonDisabledText,
            ]}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend Verification Email'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <Text style={styles.signOutText}>Use a different account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 80,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.navy[100],
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
    gap: SPACING.md,
  },
  bodyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.navy[100],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  emailText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.navy[800],
  },
  instructionText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  junkTipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.buttonNavy,
  },
  primaryGradient: {
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.navy[800],
  },
  secondaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.navy[800],
  },
  buttonDisabled: {
    borderColor: COLORS.gray[300],
  },
  buttonDisabledText: {
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  signOutText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.medium,
  },
});
