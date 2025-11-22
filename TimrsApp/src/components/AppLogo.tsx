import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({size = 48}) => {
  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Text style={[styles.emoji, {fontSize: size * 0.7}]}>🏆</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 100,
  },
  emoji: {
    textAlign: 'center',
  },
});


