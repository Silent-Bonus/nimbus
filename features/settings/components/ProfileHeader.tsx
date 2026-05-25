import React, { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet } from "@/theme/types";

type Props = {
  username?: string;
  displayName?: string;
  emailOrTagline?: string;
  statusLine?: string;
  planLabel?: string;
  badgeLabel?: string;
  avatarUrl?: string | null;
  onPressEditProfile?: () => void;
  onPressManagePlan?: () => void;
  onPressBadge?: () => void;
};

function isSvgUrl(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".svg") || clean.includes(".svg/");
}

const ProfileHeader: React.FC<Props> = ({
  username,
  displayName,
  emailOrTagline,
  statusLine,
  planLabel,
  badgeLabel,
  avatarUrl,
  onPressEditProfile,
  onPressManagePlan,
  onPressBadge,
}) => {
  const { newTheme, svaTypography, typography } = useContext(ThemeContext);

  const styles = useMemo(
    () =>
      styling(
        newTheme,
        svaTypography?.textStyle.authTitle.fontFamily ??
          "CormorantGaramond_500Medium",
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
          "SpaceMono-Regular",
        typography.bodyStrong.fontFamily ?? "Outfit_600SemiBold"
      ),
    [newTheme, svaTypography, typography.bodyStrong.fontFamily]
  );

  const resolvedName = displayName ?? username ?? "Nimbus Member";
  const resolvedSubtitle =
    emailOrTagline ?? statusLine ?? `#${username ?? "321be4"} glow active`;
  const resolvedBadge = badgeLabel ?? planLabel ?? "PREMIUM MEMBER";

  const initials = useMemo(() => {
    return (
      resolvedName
        ?.trim()
        .split(/\s+/)
        .map((part) => part[0]?.toUpperCase())
        .slice(0, 2)
        .join("") || "NM"
    );
  }, [resolvedName]);

  const [imgFailed, setImgFailed] = useState(false);
  const [svgFailed, setSvgFailed] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const shouldShowAvatar = !!avatarUrl && !imgFailed && !svgFailed;

  return (
    <View style={styles.wrapper}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.avatarStage}>
        <Pressable
          onPress={onPressEditProfile}
          hitSlop={10}
          style={({ pressed }) => [
            styles.avatarPressable,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.avatarHalo} />
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              {shouldShowAvatar ? (
                isSvgUrl(avatarUrl!) ? (
                  <SvgUri
                    uri={avatarUrl!}
                    width="100%"
                    height="100%"
                    // @ts-ignore
                    onError={() => setSvgFailed(true)}
                  />
                ) : (
                  <>
                    {imgLoading ? (
                      <ActivityIndicator color={newTheme.textPrimary} />
                    ) : null}
                    <Image
                      source={{ uri: avatarUrl! }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onLoadStart={() => setImgLoading(true)}
                      onLoadEnd={() => setImgLoading(false)}
                      onError={() => {
                        setImgLoading(false);
                        setImgFailed(true);
                      }}
                    />
                  </>
                )
              ) : (
                <Text style={styles.initials}>{initials}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </View>

      <Text numberOfLines={1} style={styles.name}>
        {resolvedName}
      </Text>

      <Pressable
        onPress={onPressBadge ?? onPressManagePlan}
        hitSlop={8}
        style={({ pressed }) => [
          styles.badge,
          pressed && (onPressBadge || onPressManagePlan) ? styles.badgePressed : null,
        ]}
      >
        <Ionicons
          name="sparkles-outline"
          size={11}
          color={newTheme.textPrimary}
          style={styles.badgeIcon}
        />
        <Text style={styles.badgeText}>{resolvedBadge}</Text>
      </Pressable>

      <Text numberOfLines={1} style={styles.subtitle}>
        {resolvedSubtitle}
      </Text>
    </View>
  );
};

export default ProfileHeader;

const styling = (
  theme: ColorSet,
  serifFamily: string,
  monoFamily: string,
  bodyFamily: string
) =>
  StyleSheet.create({
    wrapper: {
      paddingTop: 14,
      paddingBottom: 4,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    glowOne: {
      position: "absolute",
      top: 6,
      left: "50%",
      width: 182,
      height: 182,
      marginLeft: -91,
      borderRadius: 91,
      backgroundColor: theme.selected,
      opacity: 0.72,
    },
    glowTwo: {
      position: "absolute",
      top: 34,
      left: "50%",
      width: 108,
      height: 108,
      marginLeft: -54,
      borderRadius: 54,
      backgroundColor: theme.hovered,
      opacity: 0.9,
    },
    avatarStage: {
      paddingTop: 6,
      paddingBottom: 14,
    },
    avatarPressable: {
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.92,
    },
    avatarHalo: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.selected,
    },
    avatarRing: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: "rgba(255,255,255,0.03)",
      padding: 2,
      borderWidth: 1,
      borderColor: theme.accent,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    avatarInner: {
      flex: 1,
      borderRadius: 39,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    initials: {
      fontSize: 21,
      letterSpacing: 0.5,
      color: theme.textPrimary,
      fontFamily: bodyFamily,
      fontWeight: "700",
    },
    name: {
      fontSize: 32,
      lineHeight: 35,
      color: theme.textPrimary,
      textAlign: "center",
      fontFamily: serifFamily,
      marginTop: 2,
      letterSpacing: -0.4,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginTop: 10,
      paddingHorizontal: 12,
      height: 24,
      borderRadius: 999,
      backgroundColor: theme.selected,
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    badgePressed: {
      opacity: 0.9,
    },
    badgeIcon: {
      marginRight: 5,
    },
    badgeText: {
      color: theme.textPrimary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      fontFamily: bodyFamily,
      fontWeight: "700",
    },
    subtitle: {
      marginTop: 10,
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.25,
      fontFamily: monoFamily,
      opacity: 0.95,
    },
  });
