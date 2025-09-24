import React, { useState } from 'react';
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ChecklistScreen from './src/ChecklistScreen';
import HomeScreen from './src/HomeScreen';
import JSONViewerScreen from './src/JSONViewerScreen';

export default function App() {
  const top = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const [screen, setScreen] = useState('home');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { paddingTop: top }]}> 
        {screen === 'home' ? (
          <HomeScreen onOpenList={() => setScreen('checklist')} onOpenJsonViewer={() => setScreen('jsonViewer')} />
        ) : screen === 'checklist' ? (
          <ChecklistScreen onBack={() => setScreen('home')} />
        ) : (
          <JSONViewerScreen onBack={() => setScreen('home')} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});