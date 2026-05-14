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
  TerminalPanel,
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
      <div className="min-h-screen bg-[#050505] bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.08),transparent_28%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px] text-zinc-100">
        <header className="border-b border-zinc-800 bg-black/90 px-3 py-2">
          <div className="mx-auto max-w-[1480px] space-y-3">
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 px-3 py-2">
              <h1 className="font-mono text-sm font-semibold uppercase text-zinc-100">
                Signal Vault // Intel Terminal
              </h1>
              <span className="font-mono text-[11px] uppercase text-orange-500">
                Object Context Link
              </span>
            </div>
            <InGameModeBanner viewer={viewer} />
            <InGameStatusRail viewer={viewer} entity={resolved} localStatus={localStatus} />
            <ViewerBadge viewer={viewer} />
          </div>
        </header>

        <main className="mx-auto grid max-w-[1480px] gap-3 p-3 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <TerminalPanel title="Operator" code="AUTH" headingLevel={3}>
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
            </TerminalPanel>
          </aside>

          <section>
            {hasContext ? (
              <ObjectDossier entity={resolved} onSignalCreated={setLastSignalMessage} />
            ) : (
              <InGameEmptyStates.NoObjectContext />
            )}
          </section>
        </main>
      </div>
    </WalletSigningProvider>
  );
}
