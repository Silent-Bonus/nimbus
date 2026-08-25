import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { router } from "expo-router";

import ProtocolTemplateCard from "@/components/common/ProtocolTemplateCard";
import { ScreenView } from "@/components/ui/Themed";
import PillFilters from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import {
  CURATED_MANIFESTS,
  MANIFEST_FILTERS,
  type CuratedManifest,
  type ManifestDosha,
} from "@/features/tools/data/curatedManifests";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const CuratedManifestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | ManifestDosha>(
    "all"
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const filteredManifests = useMemo(() => {
    const normalizedQuery = normalize(query);

    return CURATED_MANIFESTS.filter((item) => {
      const matchesFilter =
        selectedFilter === "all" || item.dosha === selectedFilter;

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      const searchBlob = normalize(
        [
          item.title,
          item.description,
          item.context,
          item.category,
          item.level,
          item.tags.join(" "),
          item.benefits.join(" "),
          item.protocols.map((protocol) => protocol.title).join(" "),
        ].join(" ")
      );

      return searchBlob.includes(normalizedQuery);
    });
  }, [query, selectedFilter]);

  const handleCardPress = (item: CuratedManifest) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_CURATED_MANIFEST_DETAIL,
      params: { id: item.id },
    });
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <ScreenHeader
        title="Compendium Archive"
        subtitle="Scientifically curated biological blueprints"
        onBack={() => navigation.goBack()}
        rightActions={[
          {
            icon: "search-outline",
            accessibilityLabel: "Focus search",
            onPress: () => searchInputRef.current?.focus(),
          },
          {
            icon: "person-circle",
            accessibilityLabel: "Profile",
            onPress: () => console.log("[CuratedManifests] profile tapped"),
          },
        ]}
        containerStyle={styles.headerContainer}
      />

      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={svaColors.text.secondary}
        />
        <TextInput
          ref={searchInputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search templates, rituals, tags"
          placeholderTextColor={svaColors.text.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {!!query && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={svaColors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <PillFilters
        options={MANIFEST_FILTERS}
        selectedValue={selectedFilter}
        onChange={setSelectedFilter}
        contentContainerStyle={styles.filtersRow}
      />
    </View>
  );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <FlatList
        data={filteredManifests}
        keyExtractor={(item) => item.id}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={styles.listHeaderComponent}
        ListEmptyComponent={
          <EmptyState
            title="No manifests found."
            subtitle="Try a different keyword or switch categories."
            color={svaColors.text.secondary}
          />
        }
        renderItem={({ item }) => (
          <ProtocolTemplateCard
            item={item}
            style={styles.cardCell}
            onPress={() => handleCardPress(item)}
          />
        )}
      />
    </ScreenView>
  );
};

const styling = (colors: any, spacing: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === "ios" ? 120 : 140,
    },
    listHeaderComponent: {
      marginBottom: spacing.md,
    },
    headerBlock: {},
    headerContainer: {
      marginBottom: spacing.md,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 18,
      height: 54,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      fontSize: 15,
      fontFamily: "Outfit_400Regular",
    },
    clearButton: {
      marginLeft: spacing.xs,
    },
    filtersRow: {
      paddingBottom: spacing.xs,
    },
    columnWrapper: {
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    cardCell: {
      width: "48%",
    },
  });

export default CuratedManifestsScreen;
