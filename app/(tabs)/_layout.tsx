import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useAppContext } from '../../app/_GlobalContext';

export default function TabLayout() {
  const { colors } = useAppContext();
  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtitle,
          tabBarStyle: [{ ...styles.tabBar, backgroundColor: colors.headerBg, borderTopColor: colors.menuButtonBg }],
          tabBarItemStyle: styles.tabBarItem,
          tabBarLabelStyle: styles.label,
          tabBarIconStyle: { display: 'none' },
        }}>
        
        <Tabs.Screen
          name="index"
          options={{
            title: 'INÍCIO',
          }}
        />

        <Tabs.Screen
          name="history" 
          options={{
            title: 'HISTÓRICO',
          }}
        />

        <Tabs.Screen
          name="album"
          options={{
            title: 'ÁLBUM',
          }}
        />

        
      </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FAFBFB',
    height: Platform.OS === 'ios' ? 70 : 60,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 0,
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});