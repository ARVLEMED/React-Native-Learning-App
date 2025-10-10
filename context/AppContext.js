//AppContext.js
import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cycles, setCycles] = useState([]);
  const [fpLogs, setFpLogs] = useState([]);
  const [sexLogs, setSexLogs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const savedCycles = await AsyncStorage.getItem('cycles');
      const savedFpLogs = await AsyncStorage.getItem('fpLogs');
      const savedSexLogs = await AsyncStorage.getItem('sexLogs');
      if (savedCycles) setCycles(JSON.parse(savedCycles));
      if (savedFpLogs) setFpLogs(JSON.parse(savedFpLogs));
      if (savedSexLogs) setSexLogs(JSON.parse(savedSexLogs));
    };
    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ cycles, setCycles, fpLogs, setFpLogs, sexLogs, setSexLogs }}>
      {children}
    </AppContext.Provider>
  );
};