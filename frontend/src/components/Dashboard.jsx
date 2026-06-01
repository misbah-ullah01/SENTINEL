/**
 * Dashboard.jsx
 * Root component for the scalable sector view.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { fetchStatus, turnLightOn, turnLightOff } from "../api/lightApi";

import MetricsBar from "./MetricsBar";
import SiteMap from "./SiteMap";
import PoleCard from "./PoleCard";
import ControlPanel from "./ControlPanel";
import AlertPanel from "./AlertPanel";
import StatusBadge from "./StatusBadge";

const POLL_INTERVAL_MS = 1000;
const SECTOR_COUNT = 12;
const POLES_PER_SECTOR = 24;

const DEFAULT_POLE_DATA = {
    status: "UNKNOWN",
    poleId: "POLE-001",
    nodeId: "S01-P01",
    nodeLabel: "Gateway",
    sector: "Sector 01",
    route: "North Corridor",
    location: "North Corridor • Gateway",
    power: "—",
    voltage: "—",
    current: "—",
    energy: "—",
    temperature: "—",
    uptime: "—",
    connected: false,
    faultHistory: [],
};

function buildSiteBlueprint() {
    const statusPattern = ["ON", "OFF", "UNKNOWN", "ON", "OFF", "ON", "UNKNOWN", "OFF"];

    return Array.from({ length: SECTOR_COUNT }, (_, sectorIndex) => {
        const sectorNumber = String(sectorIndex + 1).padStart(2, "0");
        const route = `Corridor ${String.fromCharCode(65 + (sectorIndex % 6))} ${Math.floor(sectorIndex / 6) + 1}`;
        const poles = Array.from({ length: POLES_PER_SECTOR }, (_, poleIndex) => {
            const poleNumber = String(poleIndex + 1).padStart(2, "0");
            const nodeId = `S${sectorNumber}-P${poleNumber}`;
            const poleId = `POLE-${String(sectorIndex * POLES_PER_SECTOR + poleIndex + 1).padStart(3, "0")}`;
            const isLiveNode = sectorIndex === 0 && poleIndex === 0;
            const status = isLiveNode ? "UNKNOWN" : statusPattern[(poleIndex + sectorIndex) % statusPattern.length];

            return {
                nodeId,
                poleId,
                nodeLabel: `Pole ${poleNumber}`,
                sector: `Sector ${sectorNumber}`,
                route,
                status,
                kind: isLiveNode ? "live" : "virtual",
            };
        });

        return {
            id: `sector-${sectorNumber}`,
            name: `Sector ${sectorNumber}`,
            route,
            poles,
        };
    });
}

function resolveSiteState(blueprint, livePole) {
    return blueprint.map((sector) => ({
        ...sector,
        poles: sector.poles.map((pole) => {
            if (pole.kind !== "live") {
                return pole;
            }

            return {
                ...pole,
                ...livePole,
                nodeId: pole.nodeId,
                poleId: pole.poleId,
                nodeLabel: pole.nodeLabel,
                sector: pole.sector,
                route: pole.route,
                location: `${pole.route} • ${pole.nodeLabel}`,
            };
        }),
    }));
}

function buildDefaultPole(livePole) {
    const safePole = livePole ?? DEFAULT_POLE_DATA;
    const profileByStatus = {
        ON: { power: "145W", current: "0.66A", energy: "4.8 kWh", temperature: "38°C", uptime: "12h 05m" },
        OFF: { power: "0W", current: "0.00A", energy: "2.1 kWh", temperature: "31°C", uptime: "9h 10m" },
        FAULT: { power: "150W", current: "0.68A", energy: "4.2 kWh", temperature: "42°C", uptime: "—" },
        UNKNOWN: { power: "—", current: "—", energy: "—", temperature: "—", uptime: "—" },
    };

    const profile = profileByStatus[safePole.status] ?? profileByStatus.UNKNOWN;

    return {
        ...DEFAULT_POLE_DATA,
        ...safePole,
        power: profile.power,
        current: profile.current,
        energy: profile.energy,
        temperature: profile.temperature,
        uptime: profile.uptime,
        connected: true,
    };
}

const SITE_BLUEPRINT = buildSiteBlueprint();

export default function Dashboard() {
    const [poleData, setPoleData] = useState(DEFAULT_POLE_DATA);
    const [faultEvents, setFaultEvents] = useState([]);
    const [connected, setConnected] = useState(false);
    const [lastPoll, setLastPoll] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("overview");
    const [selectedSectorId, setSelectedSectorId] = useState(SITE_BLUEPRINT[0].id);
    const [selectedPoleId, setSelectedPoleId] = useState(DEFAULT_POLE_DATA.nodeId);

    const intervalRef = useRef(null);

    const siteSectors = useMemo(() => resolveSiteState(SITE_BLUEPRINT, poleData), [poleData]);
    const visibleSectors = useMemo(() => {
        if (!searchTerm) return siteSectors;

        const query = searchTerm.toLowerCase();
        return siteSectors.filter((sector) =>
            sector.name.toLowerCase().includes(query) ||
            sector.route.toLowerCase().includes(query) ||
            sector.poles.some((pole) => pole.poleId.toLowerCase().includes(query) || pole.nodeLabel.toLowerCase().includes(query))
        );
    }, [searchTerm, siteSectors]);

    const activeSector = useMemo(() => {
        return visibleSectors.find((sector) => sector.id === selectedSectorId) ?? visibleSectors[0] ?? siteSectors[0];
    }, [visibleSectors, selectedSectorId, siteSectors]);

    const selectedPole = useMemo(() => {
        const poles = activeSector?.poles ?? [];
        return poles.find((pole) => pole.nodeId === selectedPoleId) ?? poles[0] ?? buildDefaultPole(poleData);
    }, [activeSector, selectedPoleId, poleData]);

    const poll = useCallback(async () => {
        try {
            const data = await fetchStatus();
            setPoleData(buildDefaultPole(data));
            setFaultEvents(data.faultHistory ?? []);
            setConnected(true);
            setLastPoll(new Date().toISOString());
            setError(null);
        } catch (err) {
            setConnected(false);
            setError(err.message || "Backend unreachable");
        }
    }, []);

    useEffect(() => {
        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, [poll]);

    useEffect(() => {
        if (!visibleSectors.length) return;

        if (!visibleSectors.some((sector) => sector.id === selectedSectorId)) {
            setSelectedSectorId(visibleSectors[0].id);
        }
    }, [visibleSectors, selectedSectorId]);

    useEffect(() => {
        if (!activeSector) return;

        if (!activeSector.poles.some((pole) => pole.nodeId === selectedPoleId)) {
            setSelectedPoleId(activeSector.poles[0]?.nodeId ?? DEFAULT_POLE_DATA.nodeId);
        }
    }, [activeSector, selectedPoleId]);

    async function handleTurnOn() {
        await turnLightOn();
        await poll();
    }

    async function handleTurnOff() {
        await turnLightOff();
        await poll();
    }

    function handleSelectSector(sectorId) {
        setSelectedSectorId(sectorId);
        const sector = visibleSectors.find((item) => item.id === sectorId) ?? siteSectors.find((item) => item.id === sectorId);
        if (sector?.poles?.length) {
            setSelectedPoleId(sector.poles[0].nodeId);
        }
    }

    function handleSelectPole(poleId) {
        setSelectedPoleId(poleId);
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <header style={headerStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={brandMarkStyle}>💡</div>
                    <div>
                        <div style={titleStyle}>SMART CITY LIGHTING</div>
                        <div style={subtitleStyle}>Stage 1 · scalable sector view</div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <StatusBadge status={connected ? "ON" : "UNKNOWN"} size="sm" />
                    {lastPoll && <span style={metaTextStyle}>{`Last sync: ${new Date(lastPoll).toLocaleTimeString("en-US", { hour12: false })}`}</span>}
                </div>
            </header>

            <MetricsBar status={poleData.status} />

            <main style={mainStyle}>
                <div style={{ minHeight: 0 }}>
                    <SiteMap
                        sectors={siteSectors}
                        activeSectorId={selectedSectorId}
                        selectedPoleId={selectedPoleId}
                        searchTerm={searchTerm}
                        viewMode={viewMode}
                        onSearchTermChange={setSearchTerm}
                        onChangeViewMode={setViewMode}
                        onSelectSector={handleSelectSector}
                        onSelectPole={handleSelectPole}
                    />
                </div>

                <aside style={sidebarStyle}>
                    <div>
                        <div style={panelLabelStyle}>Selected Pole</div>
                        <PoleCard poleData={selectedPole} />
                    </div>

                    <div>
                        <div style={panelLabelStyle}>Live Control</div>
                        <ControlPanel
                            status={poleData.status}
                            onTurnOn={handleTurnOn}
                            onTurnOff={handleTurnOff}
                            disabled={!connected}
                        />
                    </div>

                    <div>
                        <div style={panelLabelStyle}>Issue Log</div>
                        <AlertPanel events={faultEvents} />
                    </div>

                    <div style={guideCardStyle}>
                        <div style={panelLabelStyle}>How To Move Fast</div>
                        <div style={guideTextStyle}>
                            Use search for direct jumps, the sector chips for fast switching, and the arrows to move through large sites without hunting.
                        </div>
                    </div>

                    {error && <div style={errorCardStyle}>{error}</div>}
                </aside>
            </main>
        </div>
    );
}

const headerStyle = {
    background: "var(--color-surface)",
    borderBottom: "1px solid var(--color-border)",
    padding: "0 24px",
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 100,
};

const brandMarkStyle = {
    width: "36px",
    height: "36px",
    background: "var(--color-accent)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
};

const titleStyle = {
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "var(--color-text)",
};

const subtitleStyle = {
    fontSize: "12px",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-mono)",
};

const metaTextStyle = {
    fontSize: "12px",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-mono)",
};

const mainStyle = {
    flex: 1,
    padding: "24px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) 360px",
    gap: "16px",
    maxWidth: "1600px",
    width: "100%",
    margin: "0 auto",
    alignItems: "start",
};

const sidebarStyle = {
    display: "grid",
    gap: "16px",
    alignContent: "start",
};

const panelLabelStyle = {
    marginBottom: "10px",
    fontSize: "12px",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
};

const guideCardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "18px",
};

const guideTextStyle = {
    fontSize: "14px",
    lineHeight: 1.65,
    color: "var(--color-text-dim)",
};

const errorCardStyle = {
    padding: "14px 16px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "var(--radius-md)",
    color: "#f59e0b",
    fontSize: "14px",
    fontFamily: "var(--font-mono)",
    lineHeight: 1.5,
};