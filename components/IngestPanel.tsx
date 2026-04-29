"use client";

import { useEffect, useState } from "react";

type IngestEvent = {
  time: string;
  message: string;
};

const EVENTS: IngestEvent[] = [
  { time: "10:42", message: "ingested fl_hillsborough_deeds — 366k rows" },
  { time: "10:39", message: "ingested sos_entity_depth_multi" },
  { time: "10:31", message: "ingested disc_telemedicine_use_in_the_last_4_weeks — 3.3k rows" },
  { time: "10:19", message: "ingested disc_superfund_lqd_ef_npl — 1.4k rows" },
  { time: "10:19", message: "ingested disc_subprime_and_manufactured_home_lender_list" },
  { time: "10:19", message: "ingested disc_state_of_new_york_mortgage_agency_sonyma_t — 3.8k rows" },
  { time: "10:19", message: "ingested disc_solar_footprints_in_california — 5.4k rows" },
  { time: "10:14", message: "ingested ca_alameda_assessor_roll — 412k rows" },
  { time: "10:11", message: "ingested fema_floodzone_v2 — 28k rows" },
  { time: "10:09", message: "ingested ny_acris_master_index — 1.1m rows" },
  { time: "10:04", message: "ingested tx_harris_county_recordings — 89k rows" },
  { time: "09:58", message: "ingested usace_levees_database — 4.2k rows" },
  { time: "09:51", message: "ingested epa_brownfields_inventory — 11k rows" },
  { time: "09:44", message: "ingested ferc_interconnection_queue — 12k rows" },
  { time: "09:38", message: "ingested az_maricopa_parcels — 1.7m rows" },
  { time: "09:33", message: "ingested il_cook_county_assessor — 1.9m rows" },
  { time: "09:27", message: "ingested ma_boston_permits — 38k rows" },
  { time: "09:21", message: "ingested ga_fulton_lis_pendens — 6.1k rows" },
  { time: "09:14", message: "ingested fl_miami_dade_evictions — 14k rows" },
  { time: "09:08", message: "ingested co_denver_business_licenses — 22k rows" },
  { time: "09:02", message: "ingested wa_king_recorder_master — 217k rows" },
  { time: "08:55", message: "ingested or_portland_pdx_rental_registry — 8.4k rows" },
  { time: "08:48", message: "ingested nv_clark_foreclosure_filings — 9.1k rows" },
  { time: "08:42", message: "ingested mi_detroit_blight_violations — 31k rows" },
  { time: "08:35", message: "ingested oh_franklin_treasurer_delinquent — 18k rows" },
  { time: "08:28", message: "ingested pa_philadelphia_commercial_evictions — 4.8k rows" },
  { time: "08:22", message: "ingested mn_hennepin_assessor_export — 142k rows" },
  { time: "08:16", message: "ingested tn_davidson_register_of_deeds — 76k rows" },
  { time: "08:09", message: "ingested mo_jackson_lis_pendens — 5.2k rows" },
  { time: "08:03", message: "ingested nc_mecklenburg_property_tax — 198k rows" },
];

const ROW_HEIGHT = 24;
const ROTATE_MS = 4000;
const SLIDE_MS = 300;

export function IngestPanel() {
  const [base, setBase] = useState(0);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    let slideTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setSliding(true);
      slideTimer = setTimeout(() => {
        setBase((b) => (b + 1) % EVENTS.length);
        setSliding(false);
      }, SLIDE_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(slideTimer);
    };
  }, []);

  return (
    <div
      className="flex h-full min-h-[380px] flex-col rounded-[4px] border border-rule bg-bg-elevated p-6 lg:min-h-[520px]"
      aria-label="Atlas live ingest log"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-eyebrow uppercase text-fg-secondary">
          Atlas &middot; Live Ingest
        </span>
        <span className="font-mono text-eyebrow uppercase text-fg-muted">
          Last 24h
        </span>
      </div>
      <div className="h-px w-full bg-rule" />

      <div className="my-4 flex-1 overflow-hidden">
        <div
          style={{
            transform: sliding ? `translateY(-${ROW_HEIGHT}px)` : "translateY(0)",
            transition: sliding ? `transform ${SLIDE_MS}ms ease-out` : "none",
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => {
            const event = EVENTS[(base + i) % EVENTS.length];
            return (
              <div
                key={i}
                style={{ height: `${ROW_HEIGHT}px` }}
                className="flex items-center gap-3 font-mono text-mono-sm"
              >
                <span className="w-[42px] shrink-0 tabular-nums text-fg-muted">
                  {event.time}
                </span>
                <span className="shrink-0 text-accent">&rarr;</span>
                <span className="truncate text-fg-primary">{event.message}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px w-full bg-rule" />
      <div className="mt-4 font-mono text-mono-sm text-fg-muted">
        Updated continuously &middot; Sourced from atlas_sync_log
      </div>
    </div>
  );
}
