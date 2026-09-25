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
import { SVATypography } from "@/theme/typography";
import type { ColorSet } from "@/theme/types";
import { useCachedAvatarUri } from "../services/avatarCacheService";

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
  const { newTheme, svaTypography } = useContext(ThemeContext);

  const styles = useMemo(
    () =>
      styling(
        newTheme,
        svaTypography.fontFamily.display,
        svaTypography.fontFamily.mono,
        svaTypography.textStyle.bodyMedium.fontFamily ?? SVATypography.fontFamily.bodyStrong
      ),
    [newTheme, svaTypography.textStyle.bodyMedium.fontFamily]
  );

  const resolvedName = displayName ?? username ?? "Nimbus Member";
  const resolvedSubtitle = emailOrTagline ?? statusLine;
  const resolvedBadge = badgeLabel ?? planLabel ?? "PREMIUM MEMBER";
  const cachedAvatarUrl = useCachedAvatarUri(avatarUrl);
  const renderedAvatarUrl = cachedAvatarUrl ?? avatarUrl;

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

  const shouldShowAvatar =
    !!renderedAvatarUrl && !imgFailed && !svgFailed;

  return (
    <View style={styles.wrapper}>
      <View style={styles.avatarStage}>
        <Pressable
          onPress={onPressEditProfile}
          hitSlop={10}
          style={({ pressed }) => [
            styles.avatarPressable,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              {shouldShowAvatar ? (
                isSvgUrl(renderedAvatarUrl!) ? (
                  <SvgUri
                    uri={renderedAvatarUrl!}
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
                      source={{ uri: renderedAvatarUrl! }}
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

      {resolvedSubtitle ? (
        <Text numberOfLines={1} style={styles.subtitle}>
          {resolvedSubtitle}
        </Text>
      ) : null}
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
    avatarRing: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: theme.card,
      overflow: "hidden",
    },
    avatarInner: {
      flex: 1,
      borderRadius: 41,
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
