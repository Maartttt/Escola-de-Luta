import React from 'react';
import { Image } from 'react-native';

export default function Logo() {
  return (
    <Image
      source={{ uri: 'https://i.imgur.com/eHTiq9v.jpeg' }}
      style={{
        width: 150,
        height: 50,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 20,
      }}
    />
  );
}
