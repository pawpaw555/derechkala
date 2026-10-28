"use client";
import dynamic from "next/dynamic";
import { STATIONS } from "../lib/data";
import { useTheme } from "../lib/useTheme";
import { useRouter } from "next/navigation";
import { useNearestStation } from "../lib/useNearestStation";
import NearestStationFinder from "../lib/NearestStationFinder";

const Map = dynamic(() => import("../lib/Map"), { ssr: false });

export default function MapClient() {
  const { t } = useTheme();
  const router = useRouter();
  const finder = useNearestStation();

  return (
    <>
      <NearestStationFinder finder={finder} />

      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}`, marginBottom: 24, boxShadow: t.shadow }}>
        <Map
          stations={STATIONS}
          userLoc={finder.userLoc}
          fromStation={null}
          toStation={null}
          route={finder.route}
          onSelectStation={(s) => router.push(`/station/${encodeURIComponent(s.name)}`)}
        />
      </div>
    </>
  );
}
