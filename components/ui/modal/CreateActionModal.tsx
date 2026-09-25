import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";

interface CreateActionModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateActionModal: React.FC<CreateActionModalProps> = ({
  visible,
  onClose,
}) => {
  const { spacing, svaTypography, svaColors } =
    React.useContext(ThemeContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, visible]);

  const handleAction = (route: any) => {
    onClose();
    setTimeout(() => {
      router.push(route);
    }, 100);
  };

  const styles = styling(spacing, svaTypography, svaColors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalView,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.dragHandle} />
          
          <Pressable onPress={onClose} style={styles.closeButton}>
            <View style={styles.closeIconBg}>
              <Ionicons name="close" size={20} color={svaColors.text.secondary} />
            </View>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Initiate Ritual</Text>
            <Text style={styles.subtitle}>CHOOSE A PATH TO ALIGN YOUR FREQUENCY</Text>
          </View>

          <View style={styles.optionsContainer}>
            <ActionOption
              icon={<Ionicons name="flash" size={24} color={svaColors.brand.primary} />}
              iconBg="rgba(163, 190, 140, 0.15)"
              title="Craft Unique Formula"
              description="Design a ritual tailored to your specific neural architecture."
              onPress={() => handleAction(ROUTES.AUTH.CREATE_PROTOCOL)}
              svaTypography={svaTypography}
              styles={styles}
            />

            <ActionOption
              icon={<Ionicons name="book-outline" size={24} color={svaColors.text.secondary} />}
              iconBg="rgba(255, 255, 255, 0.05)"
              title="Protocol Templates"
              description="Adopt expertly designed biological rhythms."
              onPress={() => handleAction(ROUTES.AUTH.TOOLS_PROTOCOL_TEMPLATES)}
              svaTypography={svaTypography}
              styles={styles}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface ActionOptionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  onPress: () => void;
  svaTypography: any;
  styles: any;
}

const ActionOption: React.FC<ActionOptionProps> = ({
  icon,
  iconBg,
  title,
  description,
  onPress,
  svaTypography,
  styles,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionPressable,
        {
          backgroundColor: pressed
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.02)",
          borderColor: pressed
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.05)",
        },
      ]}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, svaTypography.textStyle.bodyMedium]}>
          {title}
        </Text>
        <Text style={[styles.optionDescription, svaTypography.textStyle.caption]}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
};

const styling = (spacing: any, svaTypography: any, svaColors: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: svaColors.overlay.strong,
    },
    centeredView: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingBottom: 120,
    },
    modalView: {
      width: "100%",
      backgroundColor: svaColors.bg.base,
      borderRadius: 32,
      padding: spacing.lg,
      paddingTop: spacing.md,
      shadowColor: svaColors.shadow.default,
      shadowOffset: {
        width: 0,
        height: -10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
      borderWidth: 1,
      borderColor: svaColors.border.subtle,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: svaColors.border.default,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: spacing.sm,
    },
    closeButton: {
      position: "absolute",
      top: spacing.md,
      right: spacing.md,
      zIndex: 10,
    },
    closeIconBg: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: svaColors.surface.raised,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xl,
      marginTop: spacing.md,
    },
    title: {
      ...svaTypography.textStyle.authTitle,
      color: svaColors.text.primary,
      fontSize: 28,
      textAlign: "center",
    },
    subtitle: {
      ...svaTypography.textStyle.authTinyLabel,
      color: svaColors.text.secondary,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    optionsContainer: {
      gap: spacing.md,
    },
    optionPressable: {
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      borderWidth: 1,
    },
    optionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    optionTitle: {
      color: svaColors.text.primary,
      fontSize: 18,
      marginBottom: 4,
    },
    optionDescription: {
      color: svaColors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
    },
  });

export default CreateActionModal;
