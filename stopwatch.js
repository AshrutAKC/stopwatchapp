import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';

export default function App() {
  // State Management
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
 
  // Refs for accurate timing and interval management
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const previousTimeRef = useRef(0);

  // --- Core Logic ---

  // 1. Start
  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      previousTimeRef.current = time; // Resume from where we left off
     
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        // Calculate precise time difference to avoid drift
        const timePassed = now - startTimeRef.current + previousTimeRef.current;
        setTime(timePassed);
      }, 10); // Update every 10ms
     
      setIsRunning(true);
    }
  };

  // 2. Pause
  const handlePause = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  };

  // 3. Stop (Reset)
  const handleStop = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
    previousTimeRef.current = 0;
  };

  // 4. Lap
  const handleLap = () => {
    // Determine lap time (difference between current time and last lap, or start)
    // For simplicity in this UI, we just snapshot the total time,
    // but you can calculate split times if preferred.
    const newLap = {
      id: Date.now().toString(), // Unique ID
      time: time,
      lapNumber: laps.length + 1,
    };
    // Add to beginning of array so newest is top
    setLaps([newLap, ...laps]);
  };

  // 5. Clear All Laps
  const handleClearLaps = () => {
    setLaps([]);
  };

  // 6. Remove Individual Lap (The "Extra Impressed" Feature)
  const handleRemoveLap = (idToRemove) => {
    setLaps((currentLaps) => currentLaps.filter(lap => lap.id !== idToRemove));
  };

  // --- Helper: Format Time (MM:SS:ms) ---
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const minStr = minutes < 10 ? `0${minutes}` : minutes;
    const secStr = seconds < 10 ? `0${seconds}` : seconds;
    const centiStr = centiseconds < 10 ? `0${centiseconds}` : centiseconds;

    return `${minStr}:${secStr}.${centiStr}`;
  };

  // --- Render Components ---

  const renderLapItem = ({ item }) => (
    <View style={styles.lapItem}>
      <Text style={styles.lapText}>Lap {item.lapNumber}</Text>
      <Text style={styles.lapTime}>{formatTime(item.time)}</Text>
     
      {/* Individual Delete Button */}
      <TouchableOpacity
        onPress={() => handleRemoveLap(item.id)}
        style={styles.deleteLapBtn}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      >
        <Text style={styles.deleteLapText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
     
      <View style={styles.header}>
        <Text style={styles.title}>Stopwatch</Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Row 1: Start / Pause */}
        <View style={styles.buttonRow}>
          {!isRunning ? (
            <TouchableOpacity style={[styles.controlBtn, styles.startBtn]} onPress={handleStart}>
              <Text style={styles.btnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={handlePause}>
              <Text style={styles.btnText}>Pause</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Row 2: Lap / Stop */}
        <View style={styles.buttonRow}>
           <TouchableOpacity
            style={[styles.controlBtn, styles.lapBtn]}
            onPress={handleLap}
            disabled={!isRunning && time === 0} // Disable if reset
          >
            <Text style={styles.btnText}>Lap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={handleStop}>
            <Text style={styles.btnText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Laps Section */}
      <View style={styles.lapsContainer}>
        <View style={styles.lapsHeader}>
          <Text style={styles.lapsTitle}>Laps</Text>
          {laps.length > 0 && (
            <TouchableOpacity onPress={handleClearLaps}>
              <Text style={styles.clearLapsText}>Clear Laps</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={laps}
          renderItem={renderLapItem}
          keyExtractor={(item) => item.id}
          style={styles.lapsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No laps recorded</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D', // Dark mode background
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Timer Styles
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  timerText: {
    fontSize: 76,
    fontWeight: '200',
    color: '#ffffff',
    fontVariant: ['tabular-nums'], // Ensures numbers don't wiggle when changing
  },
  // Control Buttons
  controlsContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  controlBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  // Button Colors
  startBtn: { backgroundColor: '#34C759' }, // Green
  pauseBtn: { backgroundColor: '#FF9500' }, // Orange
  stopBtn:  { backgroundColor: '#FF3B30' }, // Red
  lapBtn:   { backgroundColor: '#3A3A3C' }, // Dark Gray

  // Laps Styles
  lapsContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  lapsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  lapsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearLapsText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  lapsList: {
    flex: 1,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  lapText: {
    color: '#8E8E93',
    fontSize: 16,
    width: 60,
  },
  lapTime: {
    color: '#fff',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'center',
  },
  deleteLapBtn: {
    padding: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLapText: {
    color: '#FF453A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
  },
});
