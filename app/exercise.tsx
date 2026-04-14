import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExerciseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Screen</Text>
      <Text style={styles.subtitle}>
        Temporary placeholder while we switch from old SVG assets to the new PNG avatar system.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
