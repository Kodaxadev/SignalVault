import { useState, useCallback, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { parseObjectContext, hasObjectContext, resolveEntity } from '@/features/entities';
import { useEntityResolution } from '@/features/entities/EntityResolutionProvider';
import {
  ViewerBadge,
  useViewerSession,
  ConnectIdentityPanel,
} from '@/features/viewer';
import { ObjectDossier } from '@/features/dossiers';
import {
  InGameModeBanner,
  InGameStatusRail,
  InGameActionPanel,
  InGameEmptyStates,
} from '@/features/ingame';
import type { CharacterResolutionUiState } from '@/features/ingame';
import { useSmartObjectContextAdapter, useFrontierWalletAdapter, useFrontierCharacterAdapter } from '@/features/frontier';
import { useWalletSigningAdapter } from '@/features/frontier/dappKit/useWalletSigningAdapter';
import { WalletSigningProvider } from '@/features/remote/WalletSigningContext';
import { getLocalDbStatus, subscribeLocalDbStatus, type LocalDbStatusType } from '@/features/local/localDbStatus';

export function InGameShell() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { viewer, actions } = useViewerSession();
  const entityMemory = useEntityResolution().getMemory();
  const [showConnect, setShowConnect] = useState(false);
  const [localStatus, setLocalStatus] = useState<LocalDbStatusType>(getLocalDbStatus);
  const [lastSignalMessage, setLastSignalMessage] = useState<string | undefined>();

  const context = parseObjectContext(location.pathname, searchParams);
  const hasContext = hasObjectContext(context);
  const snapshot = useSmartObjectContextAdapter();
  const walletSnapshot = useFrontierWalletAdapter();
  const characterSnapshot = useFrontierCharacterAdapter();
  const signingSnapshot = useWalletSigningAdapter();
  const resolved = resolveEntity(context, { manualMemory: entityMemory, dappKitSnapshot: snapshot });

  useEffect(() => {
    return subscribeLocalDbStatus((s) => setLocalStatus(s.status));
  }, []);

  const handleFrontierWalletConnect = useCallback(() => {
    if (walletSnapshot.status === 'connected') {
      actions.connectWalletFromFrontier(walletSnapshot);
      setShowConnect(false);
    }
  }, [walletSnapshot, actions]);

  const handleResolveCharacter = useCallback(() => {
    if (characterSnapshot.status === 'resolved') {
      actions.resolveCharacterFromFrontier(characterSnapshot);
    }
  }, [characterSnapshot, actions]);

  const characterUi: CharacterResolutionUiState =
    viewer.state !== 'wallet_connected'
      ? { status: 'not_applicable' }
      : characterSnapshot.status === 'resolved'
        ? { status: 'available', label: characterSnapshot.characterName }
        : characterSnapshot.status === 'unavailable'
          ? { status: 'unavailable', reason: characterSnapshot.reason.replace(/_/g, ' ') }
          : { status: 'not_applicable' };

  return (
    <WalletSigningProvider snapshot={signingSnapshot}>
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-3 py-2 space-y-2">
        <h1 className="text-base font-semibold">Signal Vault — In-Game</h1>
        <InGameModeBanner viewer={viewer} />
        <InGameStatusRail viewer={viewer} entity={resolved} localStatus={localStatus} />
        <ViewerBadge viewer={viewer} />
      </header>

      <main className="p-3 space-y-4">
        {showConnect ? (
          <ConnectIdentityPanel
            onDone={() => setShowConnect(false)}
            walletSnapshot={walletSnapshot}
            onConnectWallet={handleFrontierWalletConnect}
          />
        ) : (
          <InGameActionPanel
            viewer={viewer}
            characterResolution={characterUi}
            lastSignalMessage={lastSignalMessage}
            onConnectIdentity={() => setShowConnect(true)}
            onResolveCharacter={handleResolveCharacter}
          />
        )}

        {hasContext ? (
          <ObjectDossier entity={resolved} onSignalCreated={setLastSignalMessage} />
        ) : (
          <InGameEmptyStates.NoObjectContext />
        )}
      </main>
    </div>
    </WalletSigningProvider>
  );
}
