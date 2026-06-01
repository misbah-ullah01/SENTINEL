/**
 * SiteMap
 * Scalable sector navigator for large street-light deployments.
 */

import React from "react";
import StatusBadge from "./StatusBadge";

function normalize(value) {
    return String(value ?? "").toLowerCase();
}

function countByStatus(poles, status) {
    return poles.filter((pole) => pole.status === status).length;
}

export default function SiteMap({
    sectors = [],
    activeSectorId,
    selectedPoleId,
    searchTerm,
    viewMode = "overview",
    onSearchTermChange,
    onChangeViewMode,
    onSelectSector,
    onSelectPole,
}) {
    const activeSector = sectors.find((sector) => sector.id === activeSectorId) ?? sectors[0] ?? null;
    const visibleSectors = sectors.filter((sector) => {
        if (!searchTerm) return true;
        const query = normalize(searchTerm);
        return (
            normalize(sector.name).includes(query) ||
            normalize(sector.route).includes(query) ||
            sector.poles.some((pole) => normalize(pole.poleId).includes(query) || normalize(pole.nodeLabel).includes(query))
        );
    });
    const sectorForRender = visibleSectors.find((sector) => sector.id === activeSectorId) ?? visibleSectors[0] ?? activeSector;
    const poles = sectorForRender?.poles ?? [];
    const liveCount = countByStatus(poles, "ON");
    const offCount = countByStatus(poles, "OFF");
    const issueCount = countByStatus(poles, "FAULT");
    const unknownCount = countByStatus(poles, "UNKNOWN");
    const totalPoles = sectors.reduce((sum, sector) => sum + sector.poles.length, 0);
    const totalOnline = sectors.reduce((sum, sector) => sum + countByStatus(sector.poles, "ON"), 0);
    const totalIssues = sectors.reduce((sum, sector) => sum + countByStatus(sector.poles, "FAULT"), 0);
    const totalUnknown = sectors.reduce((sum, sector) => sum + countByStatus(sector.poles, "UNKNOWN"), 0);
    const faultPoles = sectors.flatMap((sector) =>
        sector.poles
            .filter((pole) => pole.status === "FAULT")
            .map((pole) => ({ ...pole, sectorName: sector.name }))
    );

    const goToSector = (direction) => {
        if (!visibleSectors.length) return;
        const currentIndex = Math.max(0, visibleSectors.findIndex((sector) => sector.id === sectorForRender?.id));
        const nextIndex = (currentIndex + direction + visibleSectors.length) % visibleSectors.length;
        onSelectSector(visibleSectors[nextIndex].id);
    };

    return (
        <section style={{
            background: "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(9,14,26,0.98))",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            minHeight: "100%",
            boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
        }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "14px" }}>
                <div style={{ minWidth: "260px", flex: "1 1 320px" }}>
                    <div style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                    }}>
                        Sector Navigator
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.1 }}>
                        Command center overview
                    </div>
                    <div style={{
                        marginTop: "6px",
                        fontSize: "14px",
                        color: "var(--color-text-dim)",
                        lineHeight: 1.6,
                    }}>
                        Scan the entire city at a glance, or switch to a sector for detailed pole-level work.
                    </div>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(92px, 1fr))",
                    gap: "10px",
                    minWidth: "320px",
                    flex: "1 1 360px",
                }}>
                    <MiniStat label="Poles" value={totalPoles} tone="var(--color-text)" />
                    <MiniStat label="Online" value={totalOnline} tone="var(--color-green)" />
                    <MiniStat label="Faults" value={totalIssues} tone="#ef4444" />
                    <MiniStat label="Unknown" value={totalUnknown} tone="#94a3b8" />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <div style={modeToggleStyle}>
                        <button
                            type="button"
                            onClick={() => onChangeViewMode("overview")}
                            style={{
                                ...modeButtonStyle,
                                background: viewMode === "overview" ? "rgba(0,212,255,0.14)" : "transparent",
                                color: viewMode === "overview" ? "var(--color-text)" : "var(--color-text-dim)",
                            }}
                        >
                            Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangeViewMode("sector")}
                            style={{
                                ...modeButtonStyle,
                                background: viewMode === "sector" ? "rgba(0,212,255,0.14)" : "transparent",
                                color: viewMode === "sector" ? "var(--color-text)" : "var(--color-text-dim)",
                            }}
                        >
                            Sector
                        </button>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "999px",
                        padding: "10px 14px",
                        minWidth: "280px",
                    }}>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>⌕</span>
                        <input
                            value={searchTerm}
                            onChange={(event) => onSearchTermChange(event.target.value)}
                            placeholder="Search sectors or poles"
                            style={{
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                color: "var(--color-text)",
                                width: "100%",
                                fontSize: "14px",
                                fontFamily: "var(--font-sans)",
                            }}
                        />
                    </div>

                    <button type="button" onClick={() => goToSector(-1)} style={navButtonStyle} aria-label="Previous sector">←</button>
                    <button type="button" onClick={() => goToSector(1)} style={navButtonStyle} aria-label="Next sector">→</button>
                </div>
            </div>

            {viewMode === "overview" ? (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 360px",
                    gap: "14px",
                    alignItems: "start",
                    minHeight: 0,
                }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: "12px",
                        alignContent: "start",
                    }}>
                        {visibleSectors.map((sector, index) => {
                            const sectorOnline = countByStatus(sector.poles, "ON");
                            const sectorIssues = countByStatus(sector.poles, "FAULT");
                            const sectorUnknown = countByStatus(sector.poles, "UNKNOWN");
                            const sectorOff = countByStatus(sector.poles, "OFF");
                            const active = sector.id === sectorForRender?.id;
                            const sectorTotal = sector.poles.length || 1;

                            return (
                                <button
                                    key={sector.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectSector(sector.id);
                                        onChangeViewMode("sector");
                                    }}
                                    style={{
                                        textAlign: "left",
                                        borderRadius: "18px",
                                        border: `1px solid ${active ? "rgba(0,212,255,0.55)" : "rgba(148,163,184,0.18)"}`,
                                        background: active ? "rgba(0,212,255,0.10)" : "rgba(255,255,255,0.03)",
                                        padding: "14px",
                                        color: "var(--color-text)",
                                        cursor: "pointer",
                                        minHeight: "150px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "10px",
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            fontSize: "12px",
                                            color: "var(--color-text-muted)",
                                            fontFamily: "var(--font-mono)",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            marginBottom: "4px",
                                        }}>
                                            Sector {String(index + 1).padStart(2, "0")}
                                        </div>
                                        <div style={{ fontSize: "17px", fontWeight: 700, lineHeight: 1.2 }}>{sector.name}</div>
                                        <div style={{ fontSize: "13px", color: "var(--color-text-dim)", marginTop: "4px", lineHeight: 1.4 }}>
                                            {sector.route}
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gap: "8px" }}>
                                        <SectorBar label="Online" value={sectorOnline} total={sectorTotal} tone="var(--color-green)" />
                                        <SectorBar label="Issues" value={sectorIssues} total={sectorTotal} tone="#ef4444" />
                                        <SectorBar label="Offline" value={sectorOff} total={sectorTotal} tone="#64748b" />
                                        <SectorBar label="Unknown" value={sectorUnknown} total={sectorTotal} tone="#94a3b8" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <aside style={{ display: "grid", gap: "12px", minHeight: 0 }}>
                        <div style={detailCardStyle}>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                                City Chart
                            </div>
                            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                                <SectorBar label="Online" value={totalOnline} total={totalPoles} tone="var(--color-green)" />
                                <SectorBar label="Issues" value={totalIssues} total={totalPoles} tone="#ef4444" />
                                <SectorBar label="Offline" value={Math.max(totalPoles - totalOnline - totalIssues - totalUnknown, 0)} total={totalPoles} tone="#64748b" />
                                <SectorBar label="Unknown" value={totalUnknown} total={totalPoles} tone="#94a3b8" />
                            </div>
                        </div>

                        <div style={detailCardStyle}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                                    Fault Navigator
                                </div>
                                <div style={{ fontSize: "12px", color: "#ef4444", fontFamily: "var(--font-mono)" }}>
                                    {faultPoles.length} total
                                </div>
                            </div>

                            <div style={{
                                marginTop: "12px",
                                display: "grid",
                                gap: "8px",
                                maxHeight: "340px",
                                overflowY: "auto",
                                paddingRight: "4px",
                            }}>
                                {faultPoles.length === 0 ? (
                                    <div style={{ fontSize: "14px", color: "var(--color-text-dim)", lineHeight: 1.6 }}>
                                        No fault poles detected across the city.
                                    </div>
                                ) : (
                                    faultPoles.map((pole) => (
                                        <button
                                            key={pole.nodeId}
                                            type="button"
                                            onClick={() => {
                                                onSelectSector(sectors.find((sector) => sector.name === pole.sectorName)?.id ?? activeSector?.id ?? sectors[0]?.id);
                                                onSelectPole(pole.nodeId);
                                                onChangeViewMode("sector");
                                            }}
                                            style={{
                                                textAlign: "left",
                                                border: "1px solid rgba(239,68,68,0.26)",
                                                background: "rgba(239,68,68,0.08)",
                                                borderRadius: "14px",
                                                padding: "12px",
                                                color: "var(--color-text)",
                                                cursor: "pointer",
                                                display: "grid",
                                                gap: "4px",
                                            }}
                                        >
                                            <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.2 }}>
                                                {pole.sectorName}
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}>
                                                {pole.poleId} · {pole.nodeLabel}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            ) : (
                <div style={{
                    display: "flex",
                    gap: "10px",
                    overflowX: "auto",
                    paddingBottom: "2px",
                    scrollSnapType: "x proximity",
                }}>
                    {visibleSectors.map((sector, index) => {
                        const active = sector.id === sectorForRender?.id;
                        return (
                            <button
                                key={sector.id}
                                type="button"
                                onClick={() => onSelectSector(sector.id)}
                                style={{
                                    scrollSnapAlign: "start",
                                    minWidth: "150px",
                                    textAlign: "left",
                                    borderRadius: "16px",
                                    border: `1px solid ${active ? "rgba(0,212,255,0.55)" : "rgba(148,163,184,0.18)"}`,
                                    background: active ? "rgba(0,212,255,0.10)" : "rgba(255,255,255,0.03)",
                                    padding: "14px 16px",
                                    color: "var(--color-text)",
                                    cursor: "pointer",
                                    flex: "0 0 auto",
                                    boxShadow: active ? "0 0 0 1px rgba(0,212,255,0.25)" : "none",
                                }}
                            >
                                <div style={{
                                    fontSize: "12px",
                                    color: "var(--color-text-muted)",
                                    fontFamily: "var(--font-mono)",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    marginBottom: "4px",
                                }}>
                                    Sector {String(index + 1).padStart(2, "0")}
                                </div>
                                <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.2 }}>{sector.name}</div>
                                <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--color-text-dim)", lineHeight: 1.4 }}>
                                    {sector.poles.length} poles
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {sectorForRender ? (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 280px", gap: "14px", flex: 1, minHeight: 0 }}>
                    <div style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(148,163,184,0.15)",
                        borderRadius: "18px",
                        padding: "16px",
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                            <div>
                                <div style={{
                                    fontSize: "12px",
                                    color: "var(--color-text-muted)",
                                    fontFamily: "var(--font-mono)",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    marginBottom: "4px",
                                }}>
                                    Active Sector
                                </div>
                                <div style={{ fontSize: "22px", fontWeight: 700 }}>{sectorForRender.name}</div>
                                <div style={{ fontSize: "14px", color: "var(--color-text-dim)", marginTop: "4px" }}>{sectorForRender.route}</div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <StatusBadge status="ON" size="sm" />
                                <StatusBadge status="FAULT" size="sm" />
                                <StatusBadge status="UNKNOWN" size="sm" />
                                <div style={summaryPillStyle}>{poles.length} poles</div>
                            </div>
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: "12px",
                            overflowY: "auto",
                            paddingRight: "4px",
                            minHeight: 0,
                        }}>
                            {poles.map((pole) => {
                                const selected = pole.nodeId === selectedPoleId;
                                return (
                                    <button
                                        key={pole.nodeId}
                                        type="button"
                                        onClick={() => onSelectPole(pole.nodeId)}
                                        style={{
                                            textAlign: "left",
                                            borderRadius: "16px",
                                            padding: "16px",
                                            border: `1px solid ${selected ? "rgba(0,212,255,0.55)" : "rgba(148,163,184,0.18)"}`,
                                            background: selected ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
                                            color: "var(--color-text)",
                                            cursor: "pointer",
                                            minHeight: "128px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            gap: "10px",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                                            <div>
                                                <div style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.2 }}>{pole.poleId}</div>
                                                <div style={{ fontSize: "13px", color: "var(--color-text-dim)", marginTop: "4px", lineHeight: 1.4 }}>
                                                    {pole.nodeLabel}
                                                </div>
                                            </div>
                                            <span style={{
                                                width: "16px",
                                                height: "16px",
                                                borderRadius: "50%",
                                                background: statusColor[pole.status] ?? statusColor.UNKNOWN,
                                                flexShrink: 0,
                                                boxShadow: `0 0 0 6px ${statusHalo[pole.status] ?? statusHalo.UNKNOWN}`,
                                            }} />
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                                            <StatusBadge status={pole.status} size="sm" />
                                            <div style={{ fontSize: "13px", color: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}>
                                                {pole.sector}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <aside style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        minHeight: 0,
                    }}>
                        <div style={detailCardStyle}>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                                Sector Summary
                            </div>
                            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                                <SummaryRow label="Online" value={liveCount} tone="var(--color-green)" />
                                <SummaryRow label="Offline" value={offCount} tone="#94a3b8" />
                                <SummaryRow label="Issues" value={issueCount} tone="#f59e0b" />
                                <SummaryRow label="Unknown" value={unknownCount} tone="var(--color-yellow)" />
                            </div>
                        </div>

                        <div style={detailCardStyle}>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                                Quick Guide
                            </div>
                            <ul style={{ marginTop: "12px", paddingLeft: "18px", display: "grid", gap: "10px", color: "var(--color-text-dim)", lineHeight: 1.6, fontSize: "14px" }}>
                                <li>Use the search bar for fast sector jumps.</li>
                                <li>Use the arrows to step through many sectors.</li>
                                <li>Open any pole card from the grid to inspect details.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            ) : (
                <div style={{
                    flex: 1,
                    borderRadius: "18px",
                    border: "1px dashed rgba(148,163,184,0.28)",
                    display: "grid",
                    placeItems: "center",
                    padding: "32px",
                    color: "var(--color-text-dim)",
                    fontSize: "16px",
                    minHeight: "320px",
                }}>
                    No sectors match your search.
                </div>
            )}
        </section>
    );
}

const navButtonStyle = {
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 700,
};

const summaryPillStyle = {
    fontSize: "13px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "var(--color-text-dim)",
    fontFamily: "var(--font-mono)",
    background: "rgba(0,0,0,0.14)",
};

const detailCardStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "18px",
    padding: "16px",
};

const modeToggleStyle = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.18)",
    overflow: "hidden",
    background: "rgba(255,255,255,0.03)",
};

const modeButtonStyle = {
    border: "none",
    padding: "10px 14px",
    background: "transparent",
    color: "var(--color-text-dim)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
};

const statusColor = {
    ON: "#22c55e",
    OFF: "#64748b",
    FAULT: "#f59e0b",
    UNKNOWN: "#f59e0b",
};

const statusHalo = {
    ON: "rgba(34,197,94,0.16)",
    OFF: "rgba(100,116,139,0.16)",
    FAULT: "rgba(245,158,11,0.16)",
    UNKNOWN: "rgba(245,158,11,0.16)",
};

function SummaryRow({ label, value, tone }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--color-text-dim)" }}>{label}</span>
            <strong style={{ fontSize: "22px", color: tone, lineHeight: 1 }}>{value}</strong>
        </div>
    );
}

function MiniStat({ label, value, tone }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(148,163,184,0.15)",
            borderRadius: "14px",
            padding: "10px 12px",
            minHeight: "72px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "6px",
        }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
            <strong style={{ fontSize: "22px", color: tone, lineHeight: 1 }}>{value}</strong>
        </div>
    );
}

function SectorBar({ label, value, total, tone }) {
    const width = total > 0 ? Math.max((value / total) * 100, value > 0 ? 8 : 0) : 0;

    return (
        <div style={{ display: "grid", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-dim)" }}>{label}</span>
                <strong style={{ fontSize: "16px", color: tone, lineHeight: 1 }}>{value}</strong>
            </div>
            <div style={{
                height: "10px",
                borderRadius: "999px",
                background: "rgba(148,163,184,0.12)",
                overflow: "hidden",
            }}>
                <div style={{
                    height: "100%",
                    width: `${width}%`,
                    borderRadius: "inherit",
                    background: tone,
                }} />
            </div>
        </div>
    );
}