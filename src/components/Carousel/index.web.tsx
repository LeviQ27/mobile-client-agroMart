import React, { useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import Img1 from '../../assets/carrousel1.png';
import Img2 from '../../assets/carrousel2.png';
import Img3 from '../../assets/carrousel3.png';
import { colors } from '../../styles';

const images = [Img1, Img2, Img3];

const CustomCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const windowWidth = Dimensions.get('window').width;

  const itemWidth = useMemo(() => Math.min(windowWidth, 460), [windowWidth]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width: itemWidth }}
        onScroll={event => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const nextIndex = Math.round(offsetX / itemWidth);
          if (nextIndex !== activeIndex) {
            setActiveIndex(nextIndex);
          }
        }}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <View key={String(index)} style={[styles.slide, { width: itemWidth }]}> 
            <Image source={image} style={styles.image} resizeMode="contain" />
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={String(index)}
            accessibilityLabel={`Ir para imagem ${index + 1}`}
            style={[
              styles.dot,
              index === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => setActiveIndex(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  image: {
    width: '100%',
    height: 120,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.white,
  },
  activeDot: {
    backgroundColor: colors.white,
    opacity: 1,
  },
  inactiveDot: {
    backgroundColor: colors.border,
    opacity: 0.7,
  },
});

export default CustomCarousel;
