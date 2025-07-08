import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class NetworkStateManager {
  private static listeners: ((state: NetworkState) => void)[] = [];
  private static currentState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
  };

  static async initialize(): Promise<void> {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.currentState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
    };

    // Set up listener for network changes
    NetInfo.addEventListener(state => {
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };

      const previousState = this.currentState;
      this.currentState = newState;

      // Notify all listeners
      this.listeners.forEach(listener => listener(newState));

      // Log network state changes
      if (previousState.isConnected !== newState.isConnected) {
        console.log(`Network state changed: ${newState.isConnected ? 'Connected' : 'Disconnected'}`);
      }
    });
  }

  static getCurrentState(): NetworkState {
    return this.currentState;
  }

  static isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  static addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  static removeAllListeners(): void {
    this.listeners = [];
  }
}

// React hook for network state
export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>(
    NetworkStateManager.getCurrentState()
  );

  useEffect(() => {
    const unsubscribe = NetworkStateManager.addListener(setNetworkState);
    return unsubscribe;
  }, []);

  return {
    ...networkState,
    isOnline: NetworkStateManager.isOnline(),
  };
};

// React hook for online status
export const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(NetworkStateManager.isOnline());

  useEffect(() => {
    const unsubscribe = NetworkStateManager.addListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return unsubscribe;
  }, []);

  return isOnline;
};
