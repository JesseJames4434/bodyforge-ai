import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function TabsIndex() {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Image
          source={require('../../assets/avatar/base-body.png')}
          style={styles.image}
        />
        <Image
          source={require('../../assets/avatar/chest.png')}
          style={[styles.image, styles.overlay]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  avatarWrap: {
    width: 300,
    height: 500,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    opacity: 1,
  },
});
