import React from "react";
import { ViewStyle } from "react-native";

import StyledButton from "@/components/ui/theme-components/StyledButton";

type WorkoutPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  isDanger?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const WorkoutPrimaryButton: React.FC<WorkoutPrimaryButtonProps> = ({
  label,
  onPress,
  isDanger = false,
  isLoading = false,
  disabled = false,
  style,
}) => {
  return (
    <StyledButton
      label={label}
      onPress={onPress}
      variant={isDanger ? "destructive" : "primary"}
      size="large"
      fullWidth
      loading={isLoading}
      disabled={disabled}
      style={style}
    />
  );
};

export default WorkoutPrimaryButton;
