import { MediaType, ServerOption, ServerCheckResult } from "@/types";
import { orderServersForAutoSelection } from "./embeds";

export interface AutoSelectInput {
  servers: ServerOption[];
  mediaType: MediaType;
  healthResults: ServerCheckResult[];
  clientFailedIds: string[];
  showAllOverride?: boolean;
}

export interface AutoSelectState {
  visibleServers: ServerOption[];
  selectedServerId: string | null;
  allFailed: boolean;
  healthById: Record<string, ServerCheckResult>;
}

/**
 * Motor puro de autoselección y filtrado de servidores de video.
 *
 * Determina:
 * 1. `visibleServers`: lista de servidores a mostrar en la UI (filtrados o completos si showAllOverride=true).
 * 2. `selectedServerId`: el servidor óptimo seleccionado automáticamente respetando salud y prioridad.
 * 3. `allFailed`: bandera booleana indicando si todos los servidores fallaron.
 * 4. `healthById`: índice rápido por serverId de los resultados de salud.
 */
export function resolveAutoSelectedServers(
  input: AutoSelectInput
): AutoSelectState {
  const {
    servers,
    mediaType,
    healthResults,
    clientFailedIds,
    showAllOverride = false,
  } = input;

  // 1. Indexación de Salud por serverId
  const healthById: Record<string, ServerCheckResult> = {};
  for (const result of healthResults) {
    healthById[result.serverId] = result;
  }

  // 2. Candidatos disponibles (excluyendo fallos locales de cliente y servidores confirmados 'dead')
  const clientFailedSet = new Set(clientFailedIds);
  const availableServers = servers.filter((server) => {
    if (clientFailedSet.has(server.id)) {
      return false;
    }
    if (healthById[server.id]?.status === "dead") {
      return false;
    }
    return true;
  });

  const allFailed = availableServers.length === 0;

  // 3. Servidores visibles en la interfaz
  const visibleServers = showAllOverride
    ? [...servers]
    : [...availableServers];

  // 4. Autoselección de servidor
  let selectedServerId: string | null = null;

  if (availableServers.length > 0) {
    const prioritized = orderServersForAutoSelection(availableServers, mediaType);

    // Paso 1: Buscar el primer candidato healthy (o sin resultado, asumido healthy por defecto)
    const healthyCandidate = prioritized.find((server) => {
      const status = healthById[server.id]?.status;
      return !status || status === "healthy";
    });

    if (healthyCandidate) {
      selectedServerId = healthyCandidate.id;
    } else {
      // Paso 2: Si ninguno es healthy, buscar el primer candidato con estado 'uncertain'
      const uncertainCandidate = prioritized.find(
        (server) => healthById[server.id]?.status === "uncertain"
      );
      selectedServerId = uncertainCandidate ? uncertainCandidate.id : prioritized[0]?.id ?? null;
    }
  } else if (showAllOverride && servers.length > 0) {
    // Paso 3: Fallback en modo showAllOverride cuando todos fallaron
    const fallbackPrioritized = orderServersForAutoSelection(servers, mediaType);
    selectedServerId = fallbackPrioritized[0]?.id ?? null;
  }

  return {
    visibleServers,
    selectedServerId,
    allFailed,
    healthById,
  };
}
