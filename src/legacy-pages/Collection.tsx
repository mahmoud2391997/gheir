import { useMemo, useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { RoomCard } from "../components/Cards";
import { rooms, type RoomType } from "../data/catalog";

const filters: ("All" | RoomType)[] = ["All", "Living", "Dining", "Sleep"];

export function Collection() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const list = useMemo(
    () => (filter === "All" ? rooms : rooms.filter((r) => r.type === filter)),
    [filter],
  );

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>Collection</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          Finished rooms with a name — not Living 1.
        </h1>
        <p className="mt-5 max-w-xl text-charcoal/75">
          Make it yours after you feel it.
          <span lang="ar" className="mt-2 block">
            في قطع بتملأ المكان. وفي قطع بتدي المكان شخصية.
          </span>
        </p>
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Room type">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest ${
                filter === f ? "bg-forest text-ivory" : "border border-walnut/25 text-walnut"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          {list.map((room, i) => (
            <div key={room.slug} className={i % 3 === 0 ? "md:col-span-2" : ""}>
              <RoomCard room={room} featured={i % 3 === 0} />
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
