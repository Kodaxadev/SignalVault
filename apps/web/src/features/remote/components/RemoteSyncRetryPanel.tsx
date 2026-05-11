interface Props {
  onRetry: () => void;
  disabled?: boolean;
  lastError?: string;
}

export function RemoteSyncRetryPanel({ onRetry, disabled, lastError }: Props) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs text-red-400 leading-tight">
        Push failed — your Signal is saved locally.
      </span>
      {lastError && (
        <span className="text-xs text-gray-500 max-w-[180px] text-right leading-tight">
          {lastError}
        </span>
      )}
      <button
        onClick={onRetry}
        disabled={disabled}
        className="text-xs text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed"
      >
        Retry push
      </button>
    </div>
  );
}
