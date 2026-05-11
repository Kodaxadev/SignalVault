interface Props {
  devAuthActive?: boolean;
}

export function RemoteSyncAlphaWarning({ devAuthActive }: Props) {
  if (devAuthActive) {
    return (
      <span className="text-xs text-yellow-600 leading-tight">
        Alpha · Dev auth · Manual only
      </span>
    );
  }
  return (
    <span className="text-xs text-gray-600 leading-tight">
      Alpha · Manual only
    </span>
  );
}
