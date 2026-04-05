import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
// 1. Importando o nosso Cérebro Global
import { AppProvider } from '../GlobalContext';

export default function TabLayout() {
  return (
    // 2. Abraçando todas as abas com o AppProvider
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#004643',
          tabBarInactiveTintColor: '#CCCCCC',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.label,
          tabBarIconStyle: { display: 'none' }, // Mantém sem ícones para o texto brilhar
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

        <Tabs.Screen
          name="create"
          options={{
            href: null, // Mantém oculto para usar apenas o botão verde
          }}
        />
        <Tabs.Screen
          name="details"
          options={{
            href: null, 
          }}
        />
      </Tabs>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 95 : 80, 
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 35 : 20, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: {
    fontSize: 13, 
    fontWeight: '900',
    letterSpacing: 1.2, 
    textTransform: 'uppercase',
  },
});