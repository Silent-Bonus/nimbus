import React, {
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import ThemeContext from "@/contexts/ThemeContext";

export type NimbusDropdownOption<T = any> = {
  label: string;
  value: T;
};

type Props<T = any> = {
  label: string;
  placeholder?: string;
  open: boolean;
  //   setOpen: (open: boolean) => void;
  value: T | null;
  //   setValue: (val: T | null) => void;
  items: NimbusDropdownOption<T>[];

  /** To control stacking when multiple dropdowns are on one screen */
  zIndex?: number;
  zIndexInverse?: number;

  containerStyle?: ViewStyle;

  // ✅ React-style setters
  setOpen: Dispatch<SetStateAction<boolean>>;
  setValue: Dispatch<SetStateAction<T | null>>;
  setItems: Dispatch<SetStateAction<{ label: string; value: T }[]>>;
};

function NimbusDropdown<T = any>({
  label,
  placeholder = "Select an item",
  open,
  setOpen,
  value,
  setValue,
  items,
  zIndex = 2000,
  zIndexInverse = 1000,
  setItems,
  containerStyle,
}: Props<T>) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  // Keep items internal; parent usually doesn't need to mutate them
  const [internalItems, setInternalItems] = useState<ItemType<T>[]>(items);

  useEffect(() => {
    setInternalItems(items);
  }, [items]);

  return (
    <View style={[styles.wrapper, { zIndex }, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      <DropDownPicker
        open={open}
        value={value as any}
        items={internalItems}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        // setValue={(callback) => {
        //   // DropDownPicker passes either value or (curr) => newVal
        //   if (typeof callback === "function") {
        //     setValue(callback(value) as T | null);
        //   } else {
        //     setValue(callback as T | null);
        //   }
        // }}
        // setItems={setInternalItems}
        placeholder={placeholder}
        style={styles.dropDown}
        dropDownContainerStyle={styles.dropDownContainer}
        textStyle={styles.itemText}
        placeholderStyle={styles.placeholder}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
      />
    </View>
  );
}

export default NimbusDropdown;

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: spacing.md,
    },
    label: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      marginBottom: spacing.xs,
    },
    dropDown: {
      backgroundColor: newTheme.surface, // matches StyledInput card
      borderColor: newTheme.divider,
      borderWidth: 1,
      borderRadius: 14,
      minHeight: 52,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,

      shadowColor: newTheme.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    dropDownContainer: {
      backgroundColor: newTheme.surfaceElevated ?? newTheme.surface,
      borderColor: newTheme.divider,
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 6,
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    itemText: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
    },
    placeholder: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      opacity: 0.7,
    },
    arrow: {
      tintColor: newTheme.textSecondary,
    },
  });
