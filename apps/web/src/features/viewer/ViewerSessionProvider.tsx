import { createContext, useContext, useState, useCallback } from 'react';
import type { ViewerContext } from './viewerTypes';
import { anonymousViewer } from './viewerTypes';
import type { FrontierWalletSnapshot } from '@/features/frontier/dappKit/frontierWalletTypes';
import { connectFrontierWallet } from './connectFrontierWallet';
import type { FrontierCharacterSnapshot } from '@/features/frontier/character/frontierCharacterTypes';
import { resolveFrontierCharacter } from './resolveFrontierCharacter';

export type AuthErrorCode =
  | 'AUTH_CODE_EXPIRED'
  | 'AUTH_CODE_CONSUMED'
  | 'AUTH_CODE_INVALID'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_WALLET_UNAVAILABLE'
  | 'AUTH_CHARACTER_NOT_FOUND';

export interface MockAuthResult {
  success: boolean;
  viewer?: ViewerContext;
  error?: { code: AuthErrorCode; message: string };
}

interface ViewerSessionActions {
  consumeAccessCode: (code: string) => MockAuthResult;
  connectWallet: () => MockAuthResult;
  connectWalletFromFrontier: (snapshot: FrontierWalletSnapshot) => MockAuthResult;
  resolveCharacter: (name: string, tribeId?: string, roles?: string[]) => MockAuthResult;
  resolveCharacterFromFrontier: (snapshot: FrontierCharacterSnapshot) => MockAuthResult;
  disconnect: () => void;
}

const MockViewerSession = createContext<{
  viewer: ViewerContext;
  actions: ViewerSessionActions;
}>({
  viewer: anonymousViewer(),
  actions: {
    consumeAccessCode: () => ({ success: false, error: { code: 'AUTH_CODE_INVALID', message: 'Invalid code' } }),
    connectWallet: () => ({ success: false, error: { code: 'AUTH_WALLET_UNAVAILABLE', message: 'Wallet unavailable' } }),
    connectWalletFromFrontier: () => ({ success: false, error: { code: 'AUTH_WALLET_UNAVAILABLE', message: 'Wallet unavailable' } }),
    resolveCharacter: () => ({ success: false, error: { code: 'AUTH_CHARACTER_NOT_FOUND', message: 'Character not found' } }),
    resolveCharacterFromFrontier: () => ({ success: false, error: { code: 'AUTH_CHARACTER_NOT_FOUND', message: 'Character not found' } }),
    disconnect: () => {},
  },
});

export function useViewerSession() {
  return useContext(MockViewerSession);
}

// Mock valid access codes for development
const MOCK_CODES: Record<string, ViewerContext> = {
  'SCOUT-001': {
    state: 'character_resolved',
    walletAddress: '0xabc123',
    characterId: 'char-scout-001',
    characterName: 'Scout Alpha',
    roles: ['scout'],
  },
  'OFFICER-001': {
    state: 'character_resolved',
    walletAddress: '0xdef456',
    characterId: 'char-officer-001',
    characterName: 'Officer Beta',
    tribeId: 'tribe-001',
    tribeName: 'Clonebank 86',
    roles: ['officer', 'scout'],
  },
  'PILOT-001': {
    state: 'character_resolved',
    walletAddress: '0x789ghi',
    characterId: 'char-pilot-001',
    characterName: 'Pilot Gamma',
    tribeId: 'tribe-002',
    tribeName: 'Red Market',
    roles: [],
  },
};

const EXPIRED_CODES = new Set(['USED-001', 'USED-002']);

export function ViewerSessionProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<ViewerContext>(anonymousViewer());

  const consumeAccessCode = useCallback((code: string): MockAuthResult => {
    if (EXPIRED_CODES.has(code)) {
      return {
        success: false,
        error: { code: 'AUTH_CODE_CONSUMED', message: 'Code already used. Generate a new one.' },
      };
    }

    const matched = MOCK_CODES[code];
    if (!matched) {
      return {
        success: false,
        error: { code: 'AUTH_CODE_INVALID', message: 'Invalid access code.' },
      };
    }

    setViewer(matched);
    return { success: true, viewer: matched };
  }, []);

  const connectWallet = useCallback((): MockAuthResult => {
    const walletViewer: ViewerContext = {
      state: 'wallet_connected',
      walletAddress: '0xmock-wallet',
      roles: [],
    };
    setViewer(walletViewer);
    return { success: true, viewer: walletViewer };
  }, []);

  const connectWalletFromFrontier = useCallback((snapshot: FrontierWalletSnapshot): MockAuthResult => {
    if (snapshot.status !== 'connected') {
      return { success: false, error: { code: 'AUTH_WALLET_UNAVAILABLE', message: 'Wallet unavailable' } };
    }
    const next = connectFrontierWallet(viewer, snapshot);
    setViewer(next);
    return { success: true, viewer: next };
  }, [viewer]);

  const resolveCharacterFromFrontier = useCallback((snapshot: FrontierCharacterSnapshot): MockAuthResult => {
    const next = resolveFrontierCharacter(viewer, snapshot);
    if (next === viewer) {
      return { success: false, error: { code: 'AUTH_CHARACTER_NOT_FOUND', message: 'Cannot resolve character' } };
    }
    setViewer(next);
    return { success: true, viewer: next };
  }, [viewer]);

  const resolveCharacter = useCallback(
    (name: string, tribeId?: string, roles?: string[]): MockAuthResult => {
      if (viewer.state === 'anonymous') {
        return {
          success: false,
          error: { code: 'AUTH_WALLET_UNAVAILABLE', message: 'Connect wallet first.' },
        };
      }

      const resolved: ViewerContext = {
        ...viewer,
        state: 'character_resolved',
        characterId: 'char-mock',
        characterName: name,
        tribeId,
        tribeName: tribeId ? 'Mock Tribe' : undefined,
        roles: roles ?? viewer.roles,
      };
      setViewer(resolved);
      return { success: true, viewer: resolved };
    },
    [viewer],
  );

  const disconnect = useCallback(() => {
    setViewer(anonymousViewer());
  }, []);

  return (
    <MockViewerSession.Provider value={{ viewer, actions: { consumeAccessCode, connectWallet, connectWalletFromFrontier, resolveCharacter, resolveCharacterFromFrontier, disconnect } }}>
      {children}
    </MockViewerSession.Provider>
  );
}
