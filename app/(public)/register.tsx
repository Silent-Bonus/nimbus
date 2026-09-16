import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from "react-native";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { getOtp, verifyOtp } from "@/features/auth/services/loginService";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { SvaAuthLayout } from "@/features/auth/components/SvaAuthLayout";
import { SvaAuthInput } from "@/features/auth/components/SvaAuthInput";
import { SvaAuthButton } from "@/features/auth/components/SvaAuthButton";
import { SvaOtpCodeInput } from "@/features/auth/components/SvaOtpCodeInput";
import { SVATypography } from "@/theme/typography";

const TOTAL_STEPS = 4;
type Step = 1 | 2 | 3 | 4;
const DISABLE_OTP_FLOW = false;

const PASSWORD_REQUIREMENTS = [
  "At least 12 characters",
  "Include one number",
  "Include one symbol",
];

function buildUsernameFromEmail(email: string) {
  const localPart = email.trim().split("@")[0] ?? "";
  const sanitized = localPart.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  return sanitized || "sanctuary";
}

function getPasswordStrength(value: string) {
  const hasLength = value.length >= 12;
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  if (hasLength && hasNumber && hasSymbol) {
    return { label: "STRONG", percent: 100 };
  }

  if (value.length >= 10 && (hasNumber || hasSymbol)) {
    return { label: "STABLE", percent: 72 };
  }

  if (value.length >= 6) {
    return { label: "LOW", percent: 38 };
  }

  return { label: "LOW", percent: 18 };
}

function validatePassword(value: string) {
  if (value.length < 12) {
    return "Use at least 12 characters with a number and a symbol.";
  }

  if (!/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "Use at least 12 characters with a number and a symbol.";
  }

  return "";
}

export default function RegistrationScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RegistrationFlowInner />
    </>
  );
}

function RegistrationFlowInner() {
  const { svaColors, svaComponents } = useContext(ThemeContext);
  const { onRegister } = useAuth();
  const toast = useNimbusToast();

  const [step, setStep] = useState<Step>(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [mobile, setMobile] = useState("");

  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCopiedDestination, setOtpCopiedDestination] = useState("");
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const styles = useMemo(
    () => createStyles(svaColors, svaComponents),
    [svaColors, svaComponents]
  );

  const derivedUsername = useMemo(() => {
    return buildUsernameFromEmail(email);
  }, [email]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(password.trim()),
    [password]
  );

  const passwordStrengthColor =
    passwordStrength.label === "STRONG"
      ? svaColors.state.success
      : passwordStrength.label === "STABLE"
        ? svaColors.state.warning
        : svaColors.state.error;

  const otpRecipient = useMemo(() => email.trim(), [email]);

  const next = useCallback(() => {
    setStep((value) => Math.min(TOTAL_STEPS, value + 1) as Step);
  }, []);

  const prev = useCallback(() => {
    setErrMsg("");
    if (step > 1) {
      setStep((value) => Math.max(1, value - 1) as Step);
      return;
    }
    router.replace(ROUTES.PUBLIC.LANDING);
  }, [step]);

  const validateStep1 = () => {
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!trimmedFullName) return "Full name is required.";
    if (!trimmedEmail) return "Email is required.";
    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validateStep2 = () => {
    const trimmedCode = countryCode.trim();
    const trimmedMobile = mobile.trim();

    if (!/^\+[0-9]{1,4}$/.test(trimmedCode)) {
      return "Country code must look like +1.";
    }
    if (!/^[0-9]{10}$/.test(trimmedMobile)) {
      return "Enter a valid 10-digit mobile number.";
    }

    return "";
  };

  const sendOtp = useCallback(async () => {
    if (DISABLE_OTP_FLOW) {
      // Temporarily bypass the OTP request until the backend is stable.
      setErrMsg("");
      setOtpCopiedDestination(email.trim());
      setOtpTimer(0);
      return true;
    }

    const recipient = email.trim();

    if (!recipient) {
      setErrMsg("Email is required.");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(recipient)) {
      setErrMsg("Please enter a valid email address.");
      return false;
    }

    setOtpSending(true);
    setErrMsg("");

    try {
      const res = await getOtp({
        recipient,
        channel: "email",
        name: fullName.trim() || undefined,
      });

      if (res?.success === false) {
        setErrMsg(
          typeof res?.message === "string"
            ? res.message
            : "Failed to send verification code."
        );
        return false;
      }

      toast.show({
        variant: "success",
        title: "Code sent",
        message: "Check your email for the verification code.",
      });

      setOtpCopiedDestination(recipient);
      setOtpTimer(60);
      return true;
    } catch (error: any) {
      setErrMsg(error?.message ?? "Failed to send verification code.");
      return false;
    } finally {
      setOtpSending(false);
    }
  }, [email, fullName, toast]);

  const verifyCode = useCallback(async () => {
    if (DISABLE_OTP_FLOW) {
      // Temporarily bypass OTP verification until the backend is stable.
      next();
      return true;
    }

    const recipient = email.trim();
    const code = otp.trim();

    setErrMsg("");

    if (!recipient) {
      setErrMsg("Email is missing.");
      return false;
    }

    if (code.length !== 6) {
      setErrMsg("Please enter the full 6-digit code.");
      return false;
    }

    setOtpVerifying(true);

    try {
      const res = await verifyOtp({ recipient, otp: code });

      if (res?.success === false) {
        setErrMsg(
          typeof res?.message === "string"
            ? res.message
            : "OTP verification failed."
        );
        return false;
      }

      toast.show({
        variant: "success",
        title: "Identity verified",
        message: "You can now secure your Sanctuary.",
      });

      next();
      return true;
    } catch (error: any) {
      setErrMsg(error?.message ?? "OTP verification failed.");
      return false;
    } finally {
      setOtpVerifying(false);
    }
  }, [email, next, otp, toast]);

  const completeSignup = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    setErrMsg("");

    if (!trimmedPassword) return setErrMsg("Please enter a new password.");
    const passwordValidationError = validatePassword(trimmedPassword);
    if (passwordValidationError) return setErrMsg(passwordValidationError);
    if (!trimmedConfirm) return setErrMsg("Please confirm your password.");
    if (trimmedPassword !== trimmedConfirm) {
      return setErrMsg("Passwords do not match.");
    }

    setLoading(true);

    try {
      const result = await onRegister?.(
        derivedUsername,
        fullName.trim(),
        countryCode.trim(),
        mobile.trim(),
        email.trim(),
        trimmedPassword
      );

      if (result?.success) {
        toast.show({
          variant: "success",
          title: "Account created",
          message: "Registration complete.",
        });
        return;
      }

      const msg =
        typeof result?.message === "string"
          ? result.message
          : JSON.stringify(result?.message ?? "Signup failed");
      setErrMsg(msg);
      toast.show({
        variant: "error",
        title: "Signup failed",
        message: msg,
      });
    } catch (error: any) {
      setErrMsg(error?.message ?? "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setErrMsg("");
  }, [step]);

  useEffect(() => {
    if (step !== 4) {
      setShowPasswordTooltip(false);
    }
  }, [step]);

  const otpAutoSentForRef = useRef<string | null>(null);

  useEffect(() => {
    if (step !== 3) {
      otpAutoSentForRef.current = null;
      setOtpCopiedDestination("");
      return;
    }

    if (!otpRecipient) return;
    if (otpAutoSentForRef.current === otpRecipient) return;

    otpAutoSentForRef.current = otpRecipient;
    setOtp("");
    setOtpTimer(0);
    void sendOtp();
  }, [otpRecipient, sendOtp, step]);

  useEffect(() => {
    if (step !== 3) return;
    if (otpTimer <= 0) return;

    const timerId = setInterval(() => {
      setOtpTimer((value) => value - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [otpTimer, step]);

  const renderStepBadge = (label: string, note?: string) => (
    <View style={styles.stepFooter}>
      <Text style={styles.stepLabel}>{label}</Text>
      {note ? <Text style={styles.stepNote}>{note}</Text> : null}
    </View>
  );

  return (
    <SvaAuthLayout step={step} total={TOTAL_STEPS} onBack={prev}>
      {step === 1 && (
        <View>
          <Text
            style={[
              styles.title,
              {
                color: svaColors.text.primary,
                textShadowColor: "rgba(0,0,0,0.2)",
              },
            ]}
          >
            Welcome Home.
          </Text>

          <Text style={[styles.subtitle, { color: svaColors.text.secondary }]}>
            Let&apos;s begin your journey into the Sanctuary.
          </Text>

          <View style={styles.fieldBlock}>
            <SvaAuthInput
              ref={fullNameRef}
              label="FULL NAME"
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                if (errMsg) setErrMsg("");
              }}
              placeholder="Elena Rose"
              autoCapitalize="words"
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              containerStyle={styles.inputBlock}
            />

            <View style={styles.inputGap} />

            <SvaAuthInput
              ref={emailRef}
              label="EMAIL ADDRESS"
              preset="email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errMsg) setErrMsg("");
              }}
              placeholder="elena@sanctuary.io"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={() => {
                const validationError = validateStep1();
                if (validationError) {
                  setErrMsg(validationError);
                  return;
                }
                next();
              }}
              errorText={errMsg}
              containerStyle={styles.inputBlock}
            />
          </View>

          <View style={styles.buttonGap} />

          <SvaAuthButton
            label="Continue"
            onPress={() => {
              const validationError = validateStep1();
              if (validationError) {
                setErrMsg(validationError);
                return;
              }
              next();
            }}
            style={styles.primaryButton}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  svaComponents?.button.primary.text ?? svaColors.text.inverse
                }
              />
            }
          />

          {renderStepBadge("STEP 1 OF 4")}
        </View>
      )}

      {step === 2 && (
        <View>
          <Text
            style={[
              styles.title,
              {
                color: svaColors.text.primary,
                textShadowColor: "rgba(0,0,0,0.2)",
              },
            ]}
          >
            Almost There.
          </Text>

          <Text style={[styles.subtitle, { color: svaColors.text.secondary }]}>
            Securely link your clinical identity.
          </Text>

          <View style={styles.rowInputs}>
            <View style={styles.codeField}>
              <SvaAuthInput
                ref={codeRef}
                label="CODE"
                value={countryCode}
                onChangeText={(value) => {
                  setCountryCode(value);
                  if (errMsg) setErrMsg("");
                }}
                placeholder="+1"
                keyboardType="phone-pad"
                maxLength={4}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                containerStyle={styles.inputBlock}
              />
            </View>

            <View style={styles.mobileField}>
              <SvaAuthInput
                ref={mobileRef}
                label="VERIFIED MOBILE NUMBER"
                preset="phone"
                value={mobile}
                onChangeText={(value) => {
                  setMobile(value.replace(/[^0-9]/g, ""));
                  if (errMsg) setErrMsg("");
                }}
                placeholder="000 000 0000"
                keyboardType="number-pad"
                maxLength={10}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                containerStyle={styles.inputBlock}
              />
            </View>
          </View>

          {errMsg ? (
            <Text style={[styles.errorText, { color: svaColors.state.error }]}>
              {errMsg}
            </Text>
          ) : null}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={svaColors.brand.primary}
              />
            </View>

            <View style={styles.infoCopy}>
              <Text
                style={[styles.infoTitle, { color: svaColors.text.primary }]}
              >
                Secure Verification
              </Text>
              <Text
                style={[styles.infoBody, { color: svaColors.text.secondary }]}
              >
                Your mobile number helps complete your profile. The
                verification code will be sent to your email.
              </Text>
            </View>
          </View>

          <View style={styles.buttonGap} />

          <SvaAuthButton
            label="Next"
            onPress={() => {
              const validationError = validateStep2();
              if (validationError) {
                setErrMsg(validationError);
                return;
              }
              next();
            }}
            style={styles.primaryButton}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  svaComponents?.button.primary.text ?? svaColors.text.inverse
                }
              />
            }
          />

          {renderStepBadge("STEP 2 OF 4")}
        </View>
      )}

      {step === 3 && (
        <View>
          <Text
            style={[
              styles.title,
              {
                color: svaColors.text.primary,
                textShadowColor: "rgba(0,0,0,0.2)",
              },
            ]}
          >
            Verify Identity.
          </Text>

          <Text style={[styles.subtitle, { color: svaColors.text.secondary }]}>
            Enter the secure code sent to your email.
          </Text>

          <View style={styles.destinationRow}>
            <Text
              style={[
                styles.destinationLabel,
                { color: svaColors.text.secondary },
              ]}
            >
              Sent to
            </Text>
            <Text
              style={[
                styles.destinationValue,
                { color: svaColors.text.primary },
              ]}
            >
              {otpCopiedDestination || otpRecipient || "your email address"}
            </Text>
            <Pressable
              onPress={() => {
                setErrMsg("");
                setStep(1);
              }}
              hitSlop={8}
            >
              <Text
                style={[
                  styles.destinationAction,
                  { color: svaColors.brand.primary },
                ]}
              >
                Edit Email
              </Text>
            </Pressable>
          </View>

          <View style={styles.otpWrap}>
            <SvaOtpCodeInput value={otp} onChange={setOtp} />
          </View>

          {errMsg ? (
            <Text style={[styles.errorText, { color: svaColors.state.error }]}>
              {errMsg}
            </Text>
          ) : null}

          <View style={styles.buttonGap} />

          <SvaAuthButton
            label={otpVerifying ? "Verifying..." : "Verify Code"}
            onPress={() => void verifyCode()}
            loading={otpVerifying}
            style={styles.primaryButton}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  svaComponents?.button.primary.text ?? svaColors.text.inverse
                }
              />
            }
          />

          <View style={styles.resendRow}>
            {otpTimer > 0 ? (
              <Text
                style={[styles.resendText, { color: svaColors.text.disabled }]}
              >
                RESEND CODE IN{" "}
                {String(Math.floor(otpTimer / 60)).padStart(2, "0")}:
                {String(otpTimer % 60).padStart(2, "0")}
              </Text>
            ) : (
              <Pressable
                onPress={() => void sendOtp()}
                disabled={otpSending}
                hitSlop={10}
              >
                <Text
                  style={[
                    styles.resendAction,
                    { color: svaColors.brand.primary },
                  ]}
                >
                  {otpSending ? "SENDING..." : "RESEND CODE"}
                </Text>
              </Pressable>
            )}
          </View>

          {renderStepBadge("STEP 3 OF 4")}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={svaColors.brand.primary}
              />
            </View>

            <View style={styles.infoCopy}>
              <Text
                style={[styles.infoTitle, { color: svaColors.text.primary }]}
              >
                Secure Verification
              </Text>
              <Text
                style={[styles.infoBody, { color: svaColors.text.secondary }]}
              >
                SVA uses military-grade encryption to ensure your health data
                remains private and secure during the onboarding process.
              </Text>
            </View>
          </View>
        </View>
      )}

      {step === 4 && (
        <View>
          <Text
            style={[
              styles.title,
              {
                color: svaColors.text.primary,
                textShadowColor: "rgba(0,0,0,0.2)",
              },
            ]}
          >
            Secure your Sanctuary.
          </Text>

          <Text style={[styles.subtitle, { color: svaColors.text.secondary }]}>
            Use a strong password you can remember.
          </Text>

          <View style={styles.fieldBlock}>
            <SvaAuthInput
              ref={passwordRef}
              label="ACCESS KEY"
              labelAccessory={
                <Pressable
                  onPress={() => setShowPasswordTooltip((value) => !value)}
                  accessibilityRole="button"
                  accessibilityLabel="Password requirements"
                  hitSlop={10}
                  style={styles.passwordHelpIcon}
                >
                  <Ionicons
                    name={
                      showPasswordTooltip
                        ? "information-circle"
                        : "information-circle-outline"
                    }
                    size={18}
                    color={
                      showPasswordTooltip
                        ? svaColors.brand.primary
                        : svaColors.text.secondary
                    }
                  />
                </Pressable>
              }
              preset="password"
              showPasswordToggle
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errMsg) setErrMsg("");
              }}
              placeholder="Enter access key"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              containerStyle={styles.inputBlock}
            />

            {showPasswordTooltip ? (
              <View
                style={[
                  styles.passwordTooltip,
                  {
                    backgroundColor: svaColors.surface.raised,
                    borderColor: svaColors.border.default,
                    shadowColor: svaColors.shadow.default,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.passwordTooltipTitle,
                    { color: svaColors.text.primary },
                  ]}
                >
                  Password requirements
                </Text>

                <View style={styles.passwordTooltipList}>
                  {PASSWORD_REQUIREMENTS.map((item) => (
                    <View key={item} style={styles.passwordTooltipRow}>
                      <View
                        style={[
                          styles.passwordTooltipDot,
                          { backgroundColor: svaColors.brand.primary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.passwordTooltipText,
                          { color: svaColors.text.secondary },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.inputGap} />

            <SvaAuthInput
              ref={confirmRef}
              label="CONFIRM PASSWORD"
              preset="password"
              showPasswordToggle
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (errMsg) setErrMsg("");
              }}
              placeholder="Confirm password"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={() => void completeSignup()}
              containerStyle={styles.inputBlock}
            />

            {errMsg ? (
              <Text
                style={[styles.errorText, { color: svaColors.state.error }]}
              >
                {errMsg}
              </Text>
            ) : null}

            {password.trim().length > 0 ? (
              <View style={styles.strengthFooter}>
                <View style={styles.strengthHeader}>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: svaColors.text.secondary },
                    ]}
                  >
                    STRENGTH
                  </Text>
                  <Text
                    style={[
                    styles.strengthValue,
                      { color: passwordStrengthColor },
                    ]}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>

                <View
                  style={[
                    styles.strengthTrack,
                    {
                      backgroundColor: svaColors.surface.base,
                      borderColor: svaColors.border.muted,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${passwordStrength.percent}%`,
                        backgroundColor: passwordStrengthColor,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.buttonGap} />

          <SvaAuthButton
            label={
              loading ? "Completing Registration..." : "Complete Registration"
            }
            onPress={() => void completeSignup()}
            loading={loading}
            style={styles.primaryButton}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  svaComponents?.button.primary.text ?? svaColors.text.inverse
                }
              />
            }
          />

          {renderStepBadge(
            "STEP 4 OF 4",
            "By completing the registration, you agree to the SVA clinical data protocols and privacy sanctuary terms."
          )}
        </View>
      )}
    </SvaAuthLayout>
  );
}

function createStyles(svaColors: any, svaComponents: any) {
  return StyleSheet.create({
    title: {
      ...SVATypography.textStyle.authTitle,
    },
    subtitle: {
      ...SVATypography.textStyle.authSubtitle,
      marginTop: 10,
      maxWidth: 300,
    },
    fieldBlock: {
      marginTop: 30,
    },
    rowInputs: {
      marginTop: 26,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
    },
    codeField: {
      width: 84,
    },
    mobileField: {
      flex: 1,
    },
    inputBlock: {
      width: "100%",
    },
    inputGap: {
      height: 18,
    },
    buttonGap: {
      height: 18,
    },
    primaryButton: {
      width: "100%",
      minHeight: 56,
      borderRadius: svaComponents?.button?.primary?.borderRadius ?? 16,
    },
    errorText: {
      marginTop: 14,
      ...SVATypography.textStyle.authBody,
    },
    passwordHelpIcon: {
      alignItems: "center",
      justifyContent: "center",
    },
    passwordTooltip: {
      marginTop: 12,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 14,
      paddingVertical: 14,
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 2,
    },
    passwordTooltipTitle: {
      ...SVATypography.textStyle.authLabelStrong,
      textTransform: "uppercase",
    },
    passwordTooltipList: {
      marginTop: 10,
      gap: 8,
    },
    passwordTooltipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    passwordTooltipDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    passwordTooltipText: {
      ...SVATypography.textStyle.authBody,
      flex: 1,
    },
    strengthFooter: {
      marginTop: 16,
    },
    infoCard: {
      marginTop: 20,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: svaColors.border.default,
      backgroundColor: svaColors.surface.raised,
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      gap: 12,
    },
    infoIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: svaColors.surface.base,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: svaColors.border.muted,
    },
    infoCopy: {
      flex: 1,
    },
    infoTitle: {
      ...SVATypography.textStyle.authLabelStrong,
      textTransform: "uppercase",
    },
    infoBody: {
      ...SVATypography.textStyle.authBody,
      marginTop: 6,
    },
    otpWrap: {
      marginTop: 28,
    },
    destinationRow: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
    },
    destinationLabel: {
      ...SVATypography.textStyle.authLabel,
    },
    destinationValue: {
      ...SVATypography.textStyle.authLabel,
    },
    destinationAction: {
      ...SVATypography.textStyle.authLabel,
      textDecorationLine: "underline",
    },
    resendRow: {
      marginTop: 14,
      alignItems: "center",
    },
    resendText: {
      ...SVATypography.textStyle.authTinyLabel,
      textTransform: "uppercase",
    },
    resendAction: {
      ...SVATypography.textStyle.authTinyLabel,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    strengthHeader: {
      marginTop: 10,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    strengthLabel: {
      ...SVATypography.textStyle.authTinyLabel,
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    strengthValue: {
      ...SVATypography.textStyle.authTinyLabel,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    strengthTrack: {
      height: 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 999,
      overflow: "hidden",
    },
    strengthFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: svaColors.brand.primary,
    },
    stepFooter: {
      marginTop: 18,
      alignItems: "center",
      gap: 10,
    },
    stepLabel: {
      ...SVATypography.textStyle.authMonoLabel,
      color: svaColors.text.disabled,
      textTransform: "uppercase",
    },
    stepNote: {
      ...SVATypography.textStyle.authFootnote,
      color: svaColors.text.disabled,
      textAlign: "center",
      maxWidth: 250,
    },
  });
}
