import React from "react";
import type { TextStyle, ViewStyle } from "react-native";

import AppHeader, { HeaderRightAction } from "@/components/layout/AppHeader";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightActions?: HeaderRightAction[];
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
};

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightActions,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  // Keep the legacy ScreenHeader API as a thin wrapper while screens converge on AppHeader.
  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      rightActions={rightActions}
      titleStyle={titleStyle}
      subtitleStyle={subtitleStyle}
      containerStyle={containerStyle}
    />
  );
};

export default ScreenHeader;
