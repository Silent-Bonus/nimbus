/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// Expo 54 reads the platform through expo-modules-core. Setting EXPO_OS lets
// the Expo Jest preset resolve the platform without mocking React Native's
// internal Platform module.
process.env.EXPO_OS = 'ios';

// React 19 requires test-renderer updates to be performed inside `act`.
// Keep the existing renderer-based tests compatible while they are migrated
// to a testing-library based API.
jest.mock('react-test-renderer', () => {
  const actual = jest.requireActual('react-test-renderer');

  return {
    ...actual,
    create: (...args) => {
      let tree;
      actual.act(() => {
        tree = actual.create(...args);
      });
      return tree;
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const MockIcon = ({ name, ...props }) =>
    React.createElement(Text, props, name ?? "icon");

  return {
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
  };
});

jest.mock('@expo/vector-icons/FontAwesome', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const MockIcon = ({ name, ...props }) =>
    React.createElement(Text, props, name ?? "icon");

  return MockIcon;
});

// Mock expo-device
jest.mock('expo-device', () => ({
  osName: 'iOS',
  osVersion: '17.0',
  modelName: 'iPhone 15',
  deviceName: 'Simulator',
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));
