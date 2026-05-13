export type BridgeWarningLevel = "critical" | "warning" | "info";

export interface CompanionBridgeState {
  readonly app: "signal-vault";
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly currentSystem?: CompanionBridgeSystem;
  readonly warnings: readonly CompanionBridgeWarning[];
  readonly latestSignals: readonly CompanionBridgeSignal[];
}

export interface CompanionBridgeSystem {
  readonly id?: string;
  readonly name: string;
  readonly source: "world_api" | "manual";
}

export interface CompanionBridgeWarning {
  readonly id: string;
  readonly level: BridgeWarningLevel;
  readonly title: string;
  readonly detail: string;
  readonly systemName?: string;
  readonly updatedAt?: string;
}

export interface CompanionBridgeSignal {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly confidence: string;
  readonly visibility: string;
  readonly createdAt: string;
}

export function parseCompanionBridgeState(
  value: unknown,
): CompanionBridgeState {
  if (!isObject(value)) {
    throw new Error("bridge_state_invalid");
  }

  if (value.app !== "signal-vault") {
    throw new Error("bridge_app_mismatch");
  }

  if (value.schemaVersion !== 1) {
    throw new Error("bridge_schema_mismatch");
  }

  if (
    typeof value.generatedAt !== "string" ||
    !Array.isArray(value.warnings) ||
    !Array.isArray(value.latestSignals)
  ) {
    throw new Error("bridge_state_invalid");
  }

  if (
    value.currentSystem !== undefined &&
    !isBridgeSystem(value.currentSystem)
  ) {
    throw new Error("bridge_current_system_invalid");
  }

  if (
    !value.warnings.every(isBridgeWarning) ||
    !value.latestSignals.every(isBridgeSignal)
  ) {
    throw new Error("bridge_items_invalid");
  }

  return value as unknown as CompanionBridgeState;
}

function isBridgeSystem(value: unknown): value is CompanionBridgeSystem {
  return (
    isObject(value) &&
    typeof value.name === "string" &&
    (value.source === "world_api" || value.source === "manual") &&
    (value.id === undefined || typeof value.id === "string")
  );
}

function isBridgeWarning(value: unknown): value is CompanionBridgeWarning {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    isWarningLevel(value.level) &&
    typeof value.title === "string" &&
    typeof value.detail === "string"
  );
}

function isBridgeSignal(value: unknown): value is CompanionBridgeSignal {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.type === "string" &&
    typeof value.confidence === "string" &&
    typeof value.visibility === "string" &&
    typeof value.createdAt === "string"
  );
}

function isWarningLevel(value: unknown): value is BridgeWarningLevel {
  return value === "critical" || value === "warning" || value === "info";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
