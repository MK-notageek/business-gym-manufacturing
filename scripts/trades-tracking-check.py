import sys, json, pathlib, urllib.request, urllib.error
from datetime import datetime
from zoneinfo import ZoneInfo
from collections import Counter

sys.path.insert(0, "/Users/ayaanarifaziz/Projects/meta-ads-dashboard")
import ghl_client

LOC = "om6L4L1Zfk1cl0MLSbHM"
BASE = "https://services.leadconnectorhq.com"
NZ = ZoneInfo("Pacific/Auckland")

def load_token():
    for p in [pathlib.Path.home()/".config/advlaunch/bernard-ghl.env",
              pathlib.Path.home()/"Desktop/Claude_Backup/Credentials/advlaunch-env/bernard-ghl.env"]:
        if p.exists():
            for line in p.read_text().splitlines():
                line=line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k,_,v=line.partition("="); k=k.strip()
                    if k=="GHL_PIT_BERNARD" or "PIT" in k.upper() or "TOKEN" in k.upper():
                        return v.strip().strip('"').strip("'")
    return None

TOKEN = load_token()

def get(url, version="2021-07-28"):
    req = urllib.request.Request(url, method="GET", headers={
        "Authorization": f"Bearer {TOKEN}", "Version": version, "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"_error": f"HTTP {e.code}: {e.read().decode('utf-8','replace')[:200]}"}
    except Exception as e:
        return {"_error": str(e)}

since, until = "2026-02-05", "2026-07-22"
contacts = ghl_client.list_contacts_in_range(TOKEN, LOC, since, until, tz_name="Pacific/Auckland",
                                             booking_tags=["call-booked"], hard_cap=6000)

def is_trades(c):
    tags = {t.lower() for t in (c.get("tags") or [])}
    return ("tradie" in tags) or any(t.startswith("trade-") for t in tags)

trades = [c for c in contacts if is_trades(c)]
roadmap = [c for c in contacts if "roadmap-download" in {t.lower() for t in (c.get("tags") or [])}]

BOOKISH = {"call-booked","lead-magnet-booked","direct-booking","lead-booked","lead-magnet-booked"}

def dates(cs):
    ds = sorted(d for d in (c.get("date_added_iso") for c in cs) if d)
    return (ds[0], ds[-1]) if ds else ("-","-")

print("=== A. TRADES COHORT ===")
print("count:", len(trades))
print("date range (added):", *dates(trades))
print("pipeline stages:", dict(Counter(c.get("pipeline_stage") for c in trades)))
tag_union = Counter()
for c in trades:
    for t in (c.get("tags") or []): tag_union[t.lower()]+=1
print("tags in cohort:", dict(tag_union.most_common()))
print("any booking-ish tag:", sum(1 for c in trades if BOOKISH & {t.lower() for t in (c.get('tags') or [])}))
print()
print("=== ROADMAP COHORT (baseline) ===")
print("count:", len(roadmap), " date range:", *dates(roadmap))
print("pipeline stages:", dict(Counter(c.get("pipeline_stage") for c in roadmap)))
print("booked (call-booked):", sum(1 for c in roadmap if "call-booked" in {t.lower() for t in (c.get('tags') or [])}))
print()

print("=== B. CALENDARS + APPOINTMENTS ===")
cals = get(f"{BASE}/calendars/?locationId={LOC}", version="2021-04-15")
if "_error" in cals:
    print("calendars error:", cals["_error"])
    callist = []
else:
    callist = cals.get("calendars") or []
    for c in callist:
        print(f"  calendar: {c.get('id')}  name={c.get('name')!r}  active={c.get('isActive')}")

start_ms = int(datetime(2026,2,5,tzinfo=NZ).timestamp()*1000)
end_ms   = int(datetime(2026,7,23,tzinfo=NZ).timestamp()*1000)
trades_ids = {c.get("id") for c in trades}
roadmap_ids = {c.get("id") for c in roadmap}

if callist:
    print("\n  appointments per calendar (window):")
    for c in callist:
        cid=c.get("id")
        ev = get(f"{BASE}/calendars/events?locationId={LOC}&calendarId={cid}&startTime={start_ms}&endTime={end_ms}",
                 version="2021-04-15")
        if "_error" in ev:
            print(f"    {c.get('name')!r}: events error {ev['_error']}"); continue
        events = ev.get("events") or []
        t = sum(1 for e in events if e.get("contactId") in trades_ids)
        r = sum(1 for e in events if e.get("contactId") in roadmap_ids)
        print(f"    {c.get('name')!r}: {len(events)} appts  (trades={t}, roadmap={r})")
