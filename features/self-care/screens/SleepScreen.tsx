import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import HorizontalListCardScroll from "@/components/layout/HorizontalListCardScroll";

import { router } from "expo-router";
import { getSoundscapeList } from "@/features/tools/services/toolService";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { ROUTES } from "@/constants/routes";

export const SleepScreen = ({ visible, onClose }: any) => {
  const [libraryTracks, setLibraryTracks] = useState<any>([]);
  const toast = useNimbusToast();

  const onModalClose = () => {
    console.log("modal cloe clicked");
    onClose?.();
  };

  const { newTheme } = useContext(ThemeContext);

  const styles = styling(newTheme);

  const onClickOfAll = () => {
    router.push(ROUTES.AUTH.SELF_CARE_SOUNDSCAPE);
  };

  const getSoundscapeListData = async () => {
    try {
      const result: any = await getSoundscapeList();
      const tracks = result?.data || (Array.isArray(result) ? result : []);

      if (Array.isArray(tracks) && tracks.length > 0) {
        const processedArticles = tracks.map((track: any) => {
          return {
            ...track,
            uri: track.image,
          };
        });
        setLibraryTracks(processedArticles);
      } else {
        console.error("API response data is empty or not an array:", result);
      }
    } catch (error: any) {
      console.log(error, "API Error Response");
      toast.show({
        variant: "error",
        title: "Load Error",
        message: "Unable to load soundscapes. Please try again.",
      });
    }
  };

  useEffect(() => {
    getSoundscapeListData();
  }, []);

  const content = (
    <View style={styles.modalContainer}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onModalClose}>
        <Ionicons name="arrow-back" size={24} color={newTheme.textSecondary} />
      </TouchableOpacity>

      <View style={styles.modalContent}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.header}>Better Sleep</Text>
          <Text style={styles.subHeader}>Good Sleep is your super power</Text>

          {/* Start Tracking Button */}
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>START</Text>
            <Text style={styles.startButtonSubText}>Tracking</Text>
          </TouchableOpacity>

          {/* Sleep Report */}
          <View style={styles.reportPanel}>
            <Text style={styles.reportTitle}>SLEEP REPORT</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daysRow}
            >
              {["30", "31", "1", "2", "3", "4", "5"].map((day, index) => (
                <TouchableOpacity key={index} style={styles.dayCircle}>
                  <Text style={styles.dayText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.demoButton}>
              <Text style={styles.demoButtonText}>View Demo Report</Text>
            </TouchableOpacity>
          </View>

          {/* Sleep Aids */}
          <View style={styles.sleepAidSection}>
            <Text style={styles.reportTitle}>SLEEP AIDSs</Text>
          </View>

          <HorizontalListCardScroll
            title="Soundscape"
            description="The sound of nature gives you better sleep."
            backgroundColor="#fbfcb3"
            itemList={libraryTracks}
            onClickOfAll={onClickOfAll}
          />

        </ScrollView>
      </View>
    </View>
  );

  // If visible is undefined, it's being used as a regular screen route
  if (visible === undefined) {
    return content;
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={visible}
    >
      {content}
    </Modal>
  );
};

const styling = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      paddingVertical: 46,
      backgroundColor: theme.background,
    },
    subHeader: {
      fontSize: 14,
      color: theme.textSecondary,
      paddingHorizontal: 15,
      marginBottom: 20,
    },
    header: {
      paddingHorizontal: 15,
      fontSize: 26,
      fontWeight: "bold",
      color: theme.textPrimary,
    },
    backButton: {
      position: "absolute",
      top: 90,
      left: 20,
      zIndex: 999,
    },
    modalContent: {
      marginTop: 50,
    },
    scrollView: {
      marginTop: 30,
      paddingHorizontal: 16,
    },
    startButton: {
      alignSelf: "center",
      marginVertical: 30,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.accent,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
    },
    startButtonText: {
      color: theme.backgroundColor,
      fontSize: 24,
      fontWeight: "bold",
    },
    startButtonSubText: {
      color: theme.surface,
      fontSize: 14,
      marginTop: 5,
    },
    reportPanel: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
    },
    reportTitle: {
      color: theme.textSecondary,
      fontSize: 12,
      marginBottom: 10,
    },
    daysRow: {
      flexDirection: "row",
      marginBottom: 20,
    },
    dayCircle: {
      width: 45,
      height: 45,
      borderRadius: 25,
      backgroundColor: theme.accentPressed,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    dayText: {
      color: theme.background,
      fontSize: 16,
    },
    demoButton: {
      backgroundColor: "#7A4DF3",
      borderRadius: 20,
      paddingVertical: 15,
      alignItems: "center",
    },
    demoButtonText: {
      color: "white",
      fontSize: 16,
    },
    sleepAidSection: {
      marginTop: 30,
    },
  });
