import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNftState } from "./useNft";
import { NftArt, NftIcon, NftTopbar, RARITIES, money, rarityRank, rarityTitle, useNftBack } from "./nftShared";
import { NftConfirm, NftToast, useNftToast } from "./NftSheets";
import { Skeleton } from "./LoadingState";

// Пары: одинаковый шаблон в двух и более незалистованных копиях.
// Редкость выше последней в списке не существует, поэтому legendary в слияние не попадает.
export function mergeGroups(items) {
  const map = new Map();
  items.forEach(function (it) {
    if (it.listingId) return;
    let g = map.get(it.templateId);
    if (!g) {
      g = { templateId: it.templateId, name: it.name, rarity: it.rarity, art: it.art, items: [] };
      map.set(it.templateId, g);
    }
    g.items.push(it);
  });
  const list = [];
  map.forEach(function (g) {
    if (g.items.length >= 2 && rarityRank(g.rarity) < RARITIES.length - 1) list.push(g);
  });
  return list.sort(function (a, b) {
    return rarityRank(a.rarity) - rarityRank(b.rarity) || b.items.length - a.items.length || a.name.localeCompare(b.name);
  });
}

// Пул троек: всё, что можно сжечь по три штуки одной редкости.
export function mergePool(items) {
  return items
    .filter(function (it) {
      const rank = rarityRank(it.rarity);
      return !it.listingId && rank >= 0 && rank < RARITIES.length - 1;
    })
    .sort(function (a, b) {
      return rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name) || a.serial - b.serial;
    });
}

// Редкости, где наберётся три разных шаблона.
export function trioRarities(pool) {
  const sets = new Map();
  pool.forEach(function (it) {
    let set = sets.get(it.rarity);
    if (!set) {
      set = new Set();
      sets.set(it.rarity, set);
    }
    set.add(it.templateId);
  });
  const list = [];
  sets.forEach(function (set, rarity) {
    if (set.size >= 3) list.push(rarity);
  });
  return list.sort(function (a, b) { return rarityRank(a) - rarityRank(b); });
}

function copiesLabel(n) {
  return n + (n === 1 ? " copy" : " copies");
}

function namesOf(items) {
  return items.map(function (it) { return it.name; }).join(", ");
}

export default function NftMerge() {
  const navigate = useNavigate();
  const back = useNftBack("/nft/inventory");
  const { state, error, merge } = useNftState();
  const [mode, setMode] = useState(null);
  const [pickedId, setPickedId] = useState(null);
  const [pickIds, setPickIds] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, showToast] = useNftToast();

  const items = (state && state.items) || [];
  const groups = useMemo(function () { return mergeGroups(items); }, [items]);
  const pool = useMemo(function () { return mergePool(items); }, [items]);
  const trios = useMemo(function () { return trioRarities(pool); }, [pool]);

  // Пока пользователь не трогал выбор, тройка собирается сама из первой готовой редкости.
  const autoTrio = useMemo(function () {
    let out = [];
    trios.some(function (rarity) {
      const used = [];
      const pick = [];
      pool.forEach(function (it) {
        if (pick.length >= 3 || it.rarity !== rarity || used.indexOf(it.templateId) >= 0) return;
        used.push(it.templateId);
        pick.push(it);
      });
      if (pick.length === 3) {
        out = pick;
        return true;
      }
      return false;
    });
    return out;
  }, [pool, trios]);

  const trio = (mode || (groups.length ? "pair" : trios.length ? "trio" : "pair")) === "trio";
  const picked = groups.find(function (g) { return g.templateId === pickedId; }) || groups[0] || null;
  const chosen = pickIds === null
    ? autoTrio
    : pickIds.map(function (id) { return pool.find(function (it) { return it.id === id; }); }).filter(Boolean);
  const srcRarity = trio ? (chosen[0] && chosen[0].rarity) : (picked && picked.rarity);
  const target = srcRarity ? RARITIES[rarityRank(srcRarity) + 1] : null;
  const ready = trio ? chosen.length === 3 : !!picked;
  const empty = trio ? trios.length === 0 : groups.length === 0;
  const usedTemplates = chosen.map(function (it) { return it.templateId; });
  const rarityCount = pool.filter(function (it) { return it.rarity === srcRarity; }).length;
  const slots = trio
    ? [0, 1, 2].map(function (i) { return chosen[i] || null; })
    : (picked ? [picked, picked] : []);

  function switchMode(next) {
    if (busy) return;
    setMode(next);
    setConfirm(false);
  }

  function togglePick(it) {
    const ids = chosen.map(function (x) { return x.id; });
    const at = ids.indexOf(it.id);
    if (at >= 0) {
      ids.splice(at, 1);
      setPickIds(ids);
      return;
    }
    if (ids.length < 3) setPickIds(ids.concat(it.id));
  }

  // В тройке нельзя добрать четвёртый, другую редкость или второй экземпляр уже взятого шаблона.
  function tileOff(it) {
    if (busy) return true;
    if (chosen.some(function (x) { return x.id === it.id; })) return false;
    return chosen.length >= 3 || (!!srcRarity && it.rarity !== srcRarity) || usedTemplates.indexOf(it.templateId) >= 0;
  }

  function run() {
    if (busy || !ready || !target) return;
    setConfirm(false);
    setBusy(true);
    const call = trio ? merge(null, chosen.map(function (it) { return it.id; })) : merge(picked.templateId);
    call.then(function (r) {
      setBusy(false);
      setPickedId(null);
      setPickIds(null);
      setResult(r);
    }).catch(function (e) {
      setBusy(false);
      showToast(false, e && e.message ? e.message : "Could not merge");
    });
  }

  return (
    <div className={"nft-page nft-merge-page" + (trio ? " is-trio" : "")}>
      <NftTopbar title="Merge" onBack={back} />
      <div className="nft-wrap mrg-wrap">
        {!state && (error
          ? <div className="upg-empty upg-center"><b>Could not load NFTs</b><span>{error}</span></div>
          : <Skeleton rows={3} hero />)}

        {state && !result && (
          <div className="mrg-modes" role="tablist" aria-label="Merge mode">
            <button
              type="button"
              role="tab"
              aria-selected={!trio}
              disabled={busy}
              className={"mrg-mode" + (!trio ? " is-on" : "")}
              onClick={function () { switchMode("pair"); }}
            >
              <b>Pair</b>
              <small>2 identical</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={trio}
              disabled={busy}
              className={"mrg-mode" + (trio ? " is-on" : "")}
              onClick={function () { switchMode("trio"); }}
            >
              <b>Trio</b>
              <small>3 of one rarity</small>
            </button>
          </div>
        )}

        {state && !result && empty && (
          <div className="upg-empty upg-center">
            <span className="upg-pick-art"><NftIcon name="merge" /></span>
            <b>{trio ? "Not enough NFTs" : "No duplicate pairs"}</b>
            <span>{trio
              ? "Trio merge needs three different NFTs of one rarity. Collect more from drops, packs or the market."
              : "Merging needs two copies of the same NFT. Duplicates come from drops, packs and rewards."}</span>
            <div className="nft-empty-actions">
              <button className="nft-btn nft-btn--light" type="button" onClick={function () { navigate("/nft"); }}>See drops</button>
              <button className="nft-btn nft-btn--glass" type="button" onClick={function () { navigate("/nft/market"); }}>Open market</button>
            </div>
          </div>
        )}

        {state && !result && !empty && (
          <>
            <div className="nft-section-head mrg-head">
              <span>{trio ? "Same rarity, different NFTs" : "Duplicate pairs"}</span>
              <small>{trio
                ? trios.length + (trios.length === 1 ? " rarity ready" : " rarities ready")
                : groups.length + (groups.length === 1 ? " pair ready" : " pairs ready")}</small>
            </div>
            <div className="mrg-sources">
              {!trio && groups.map(function (g) {
                return (
                  <button
                    key={g.templateId}
                    type="button"
                    disabled={busy}
                    className={"mrg-src nft-r-" + g.rarity + (picked && picked.templateId === g.templateId ? " is-on" : "")}
                    onClick={function () { setPickedId(g.templateId); }}
                    aria-label={g.name + " · " + g.items.length + " copies"}
                  >
                    <span className="mrg-src-art"><NftArt art={g.art} rarity={g.rarity} /></span>
                    <span className="mrg-src-count">{"×" + g.items.length}</span>
                  </button>
                );
              })}
              {trio && pool.map(function (it) {
                const order = chosen.findIndex(function (x) { return x.id === it.id; });
                return (
                  <button
                    key={it.id}
                    type="button"
                    disabled={tileOff(it)}
                    aria-pressed={order >= 0}
                    className={"mrg-src nft-r-" + it.rarity + (order >= 0 ? " is-on" : "")}
                    onClick={function () { togglePick(it); }}
                    aria-label={it.name + " · " + rarityTitle(it.rarity)}
                  >
                    <span className="mrg-src-art"><NftArt art={it.art} rarity={it.rarity} /></span>
                    {order >= 0 ? <span className="mrg-src-count is-order">{order + 1}</span> : null}
                  </button>
                );
              })}
            </div>

            <div className="mrg-stage">
              <div className={"mrg-chamber" + (target ? " nft-r-" + target : "")}>
                <span className="mrg-ring" aria-hidden="true" />
                <span className="mrg-glow" aria-hidden="true" />
                <span className={"mrg-pair" + (trio ? " mrg-pair--trio" : "")} aria-hidden="true">
                  {slots.map(function (s, i) {
                    return s ? (
                      <span key={i} className={"mrg-card mrg-card--" + i + " nft-r-" + s.rarity}>
                        <NftArt art={s.art} rarity={s.rarity} />
                      </span>
                    ) : (
                      <span key={i} className={"mrg-card mrg-card--" + i + " mrg-card--empty"}><b>{i + 1}</b></span>
                    );
                  })}
                </span>
                <span className="mrg-flow" aria-hidden="true"><i /></span>
                <span className={"mrg-unknown" + (target ? " nft-r-" + target : "")} aria-hidden="true">
                  <b>?</b>
                  <em>{target ? rarityTitle(target) : "Pick 3"}</em>
                </span>
                <span className="mrg-scan" aria-hidden="true" />
              </div>

              <div className="mrg-title">
                <b>{trio ? (chosen.length ? namesOf(chosen) : "Select three NFTs") : picked.name}</b>
                <span>{trio ? chosen.length + " of 3 selected" : "2 of " + copiesLabel(picked.items.length)}</span>
              </div>

              <div className="upg-readout mrg-readout">
                <div><span>You give</span><b>{trio ? (srcRarity ? "3 × " + rarityTitle(srcRarity) : "3 NFTs") : "2 × " + picked.name}</b></div>
                <div><span>You get</span><b>{target ? "Random " + rarityTitle(target) : "Next rarity"}</b></div>
                <div><span>Left after</span><b>{trio ? Math.max(0, rarityCount - 3) + " left" : copiesLabel(picked.items.length - 2)}</b></div>
              </div>

              <button className="nft-btn nft-btn--light nft-btn--block" type="button" disabled={busy || !ready} onClick={function () { setConfirm(true); }}>
                {busy ? "Merging..." : ready ? "Merge into " + rarityTitle(target) : "Select " + (3 - chosen.length) + " more"}
              </button>
              <p className="nft-hint mrg-hint">{trio
                ? "All three NFTs are consumed. The new NFT is random within " + (target ? rarityTitle(target) : "the next rarity") + "."
                : "Both copies are consumed. The new NFT is random within " + rarityTitle(target) + "."}</p>
            </div>
          </>
        )}

        {result && (
          <div className={"upg-result is-win nft-r-" + result.item.rarity}>
            <span className={"upg-result-art nft-r-" + result.item.rarity}>
              <NftArt art={result.item.art} rarity={result.item.rarity} />
            </span>
            <span className="upg-result-body">
              <span className="nft-kicker">Merge complete</span>
              <b>{result.item.name + " #" + result.item.serial}</b>
              <span>{"Random " + rarityTitle(result.item.rarity) + " · " + money(result.item.value)}</span>
            </span>
            <div className="upg-result-actions">
              <button className="nft-btn nft-btn--light" type="button" onClick={function () { setResult(null); }}>Merge again</button>
              <button className="nft-btn nft-btn--glass" type="button" onClick={function () { navigate("/nft/inventory"); }}>Inventory</button>
            </div>
          </div>
        )}
      </div>

      <NftConfirm
        open={confirm && ready && !!target}
        title={trio ? "Merge these three?" : "Merge these copies?"}
        text={ready && target ? (trio
          ? namesOf(chosen) + " will be consumed. You will receive one random " + rarityTitle(target) + " NFT from any collection."
          : "Two copies of " + picked.name + " will be consumed. You will receive one random " + rarityTitle(target) + " NFT from any collection.") : ""}
        confirm="Merge now"
        onCancel={function () { setConfirm(false); }}
        onConfirm={run}
      />

      <NftToast toast={toast} />
    </div>
  );
}
