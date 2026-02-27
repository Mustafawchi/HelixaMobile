import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  type ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { COLORS } from "../../types/colors";

interface CustomScrollbarProps {
  scrollViewRef: React.RefObject<ScrollView | null>;
  /** Call this from ScrollView's onScroll */
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Call this from ScrollView's onContentSizeChange */
  onContentSizeChange: (w: number, h: number) => void;
  /** Call this from ScrollView's onLayout (for the visible area height) */
  onLayout: (e: { nativeEvent: { layout: { height: number } } }) => void;
}

const TRACK_WIDTH = 20;
const THUMB_MIN_HEIGHT = 30;
const THUMB_WIDTH = 4;

export function useCustomScrollbar(scrollViewRef: React.RefObject<ScrollView | null>) {
  const scrollOffset = useRef(0);
  const contentHeight = useRef(1);
  const layoutHeight = useRef(1);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const thumbHeight = useRef(new Animated.Value(THUMB_MIN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);
  const isDragging = useRef(false);
  const SHOW_THRESHOLD = 100;

  const updateThumb = () => {
    const ratio = layoutHeight.current / contentHeight.current;
    const newThumbHeight = Math.max(THUMB_MIN_HEIGHT, ratio * layoutHeight.current * 0.6);
    const maxTravel = layoutHeight.current - newThumbHeight;
    const scrollRatio =
      contentHeight.current - layoutHeight.current > 0
        ? scrollOffset.current / (contentHeight.current - layoutHeight.current)
        : 0;
    const newPosition = scrollRatio * maxTravel;

    thumbHeight.setValue(newThumbHeight);
    thumbPosition.setValue(newPosition);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y;
    updateThumb();

    if (!isDragging.current) {
      const shouldShow = scrollOffset.current > SHOW_THRESHOLD;
      if (shouldShow !== isVisible.current) {
        isVisible.current = shouldShow;
        Animated.timing(opacity, {
          toValue: shouldShow ? 0.5 : 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const onContentSizeChange = (_w: number, h: number) => {
    contentHeight.current = h;
    updateThumb();
  };

  const onLayout = (e: { nativeEvent: { layout: { height: number } } }) => {
    layoutHeight.current = e.nativeEvent.layout.height;
    updateThumb();
  };

  const grantOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
        grantOffset.current = scrollOffset.current;
        opacity.setValue(1);
      },
      onPanResponderMove: (_e, gestureState) => {
        const ratio = layoutHeight.current / contentHeight.current;
        const currentThumbHeight = Math.max(THUMB_MIN_HEIGHT, ratio * layoutHeight.current * 0.6);
        const maxTravel = layoutHeight.current - currentThumbHeight;
        if (maxTravel <= 0) return;

        const maxScroll = contentHeight.current - layoutHeight.current;
        const scrollDelta = (gestureState.dy / maxTravel) * maxScroll;
        const newOffset = Math.max(0, Math.min(maxScroll, grantOffset.current + scrollDelta));

        scrollViewRef.current?.scrollTo({ y: newOffset, animated: false });
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        const shouldShow = scrollOffset.current > SHOW_THRESHOLD;
        isVisible.current = shouldShow;
        Animated.timing(opacity, {
          toValue: shouldShow ? 0.5 : 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return { thumbPosition, thumbHeight, opacity, panResponder, onScroll, onContentSizeChange, onLayout };
}

export default function CustomScrollbar({
  thumbPosition,
  thumbHeight,
  opacity,
  panResponder,
}: {
  thumbPosition: Animated.Value;
  thumbHeight: Animated.Value;
  opacity: Animated.Value;
  panResponder: ReturnType<typeof PanResponder.create>;
}) {
  return (
    <Animated.View style={[styles.track, { opacity }]} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.thumb,
          {
            height: thumbHeight,
            transform: [{ translateY: thumbPosition }],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: "absolute",
    right: 0,
    top: 8,
    bottom: 8,
    width: TRACK_WIDTH,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 10,
  },
  thumb: {
    width: THUMB_WIDTH,
    borderRadius: THUMB_WIDTH / 2,
    backgroundColor: COLORS.textMuted,
  },
});
