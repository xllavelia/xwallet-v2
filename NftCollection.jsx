import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNftState } from "./useNft";
import { NftArt, NftIcon, NftTopbar, RarityPill, formatLeft, money, perHour, rarityRank, rarityTitle, useNftBack, useNow } from "./nftShared";
import { NftConfirm, NftToast, useNftToast } from "./NftSheets";
import { Skeleton } from "./LoadingState";
import NftClaimOverlay from "./NftClaimOverlay";

function avgPrice(templates, rarity) {
  const list = templates.filter(function (t) { return t.rarity === rarity; });
  if (!list.length) return 0;
  return list.reduce(function (s, t) { return s + t.basePrice; }, 0) / list.length;
}

// Ожидаемая ценность пака по средним ценам шаблонов коллекции
function packValue(pack, templates, rarities) {
  if (pack.kind === "mystery") {
    const total = rarities.reduce(function (s, r) { return s + r.odds; }, 0) || 1;
    return rarities.reduce(function (s, r) { return s + avgPrice(templates, r.key) * r.odds / total; }, 0);
  }
  return (pack.slots || []).reduce(function (s, sl) { return s + avgPrice(templates, sl.rarity) * sl.count; }, 0);
}

function PackArt({ pack, templates }) {
  if (pack.kind === "mystery") {
    return (
      <span className="nft-pack-art nft-pack-art--mystery">
        <span className="nft-pack-capsule"><NftIcon name="spark" /></span>
      </span>
    );
  }
  const cards = [];
  (pack.slots || []).forEach(function (sl) {
    const pick = templates.find(function (t) { return t.rarity === sl.rarity; });
    for (let i = 0; i < sl.count && cards.length < 3; i += 1) cards.push({ rarity: sl.rarity, art: pick ? pick.art : null, key: sl.rarity + i });
  });
  return (
    <span className={"nft-pack-art" + (pack.kind === "random" ? " nft-pack-art--random" : "")}>
      {cards.map(function (c, i) {
        return (
          <span key={c.key} className={"nft-pack-card nft-r-" + c.rarity} style={{ "--i": i, "--n": cards.length }}>
            <NftArt art={c.art} rarity={c.rarity} />
            {pack.kind === "random" && <span className="nft-pack-q">?</span>}
          </span>
        );
      })}
    </span>
  );
}

export default function NftCollection() {
  const navigate = useNavigate();
  const back = useNftBack("/nft");
  const [params] = useSearchParams();
  const id = Number(params.get("id"));
  const { state, error, buyPack } = useNftState();
  const now = useNow(1000);
  const [buying, setBuying] = useState(null);
  const [opened, setOpened] = useState(null);
  const [toast, showToast] = useNftToast();

  const c = state ? (state.collections || []).find(function (x) { return x.id === id; }) : null;

  if (!c) {
    return (
      <div className="nft-page">
        <NftTopbar title="Drop" onBack={back} />
        <div className="nft-wrap">
          {state || error
            ? (
              <div className="nft-empty">
                <span className="nft-empty-art"><NftIcon name="box" /></span>
                <b>This drop has ended</b>
                <span>Its NFTs can still be traded on the market.</span>
                <button className="nft-btn nft-btn--light" type="button" onClick={function () { navigate("/nft/market"); }}>Open market</button>
              </div>
            )
            : <Skeleton rows={3} hero />}
        </div>
      </div>
    );
  }

  const templates = (c.templates || []).slice().sort(function (a, b) { return rarityRank(b.rarity) - rarityRank(a.rarity) || b.basePrice - a.basePrice; });
  const minted = templates.reduce(function (s, t) { return s + t.minted; }, 0);
  const supply = templates.reduce(function (s, t) { return s + t.supply; }, 0);
  const ends = new Date(c.endsAt).getTime() - now;
  const rarities = state.config.rarities || [];
  const oddsTotal = rarities.reduce(function (s, r) { return s + r.odds; }, 0) || 1;

  function doBuy() {
    const pack = buying;
    return buyPack(pack.id).then(function (r) {
      setBuying(null);
      setOpened({ name: pack.name, items: r.items || [] });
    }).catch(function (e) {
      setBuying(null);
      showToast(false, e.message || "Could not buy the pack");
    });
  }

  return (
    <div className="nft-page">
      <NftTopbar title="Drop" onBack={back} />
      <div className="nft-wrap">
        <section className={"nft-hero nft-t-" + c.theme}>
          <div className="nft-hero-arts">
            {templates.slice(0, 3).map(function (t, i) {
              return <span key={t.id} className={"nft-hero-art nft-r-" + t.rarity} style={{ "--i": i }}><NftArt art={t.art} rarity={t.rarity} /></span>;
            })}
          </div>
          <span className="nft-kicker">Live drop</span>
          <h1 className="nft-hero-name">{c.name}</h1>
          <p className="nft-hero-tag">{c.tagline}</p>
          <div className="nft-hero-stats">
            <div><span>Ends in</span><b>{formatLeft(ends)}</b></div>
            <div><span>Minted</span><b>{minted + " / " + supply}</b></div>
            <div><span>Designs</span><b>{templates.length}</b></div>
          </div>
          <span className="nft-hero-progress"><i style={{ width: (supply ? minted / supply * 100 : 0) + "%" }} /></span>
        </section>

        <div className="nft-section-head"><span>Packs</span><small>Limited stock</small></div>
        <div className="nft-packs">
          {(c.packs || []).map(function (pk) {
            const left = Math.max(0, pk.stock - pk.sold);
            const ev = packValue(pk, templates, rarities);
            return (
              <div key={pk.id} className={"nft-pack nft-pack--" + pk.kind}>
                <PackArt pack={pk} templates={templates} />
                <div className="nft-pack-body">
                  <div className="nft-pack-top">
                    <b className="nft-pack-name">{pk.name}</b>
                    <span className="nft-pack-kind">{pk.kind === "fixed" ? "Known set" : pk.kind === "random" ? "Random" : "Mystery"}</span>
                  </div>
                  <span className="nft-pack-caption">{pk.caption}</span>

                  {pk.kind === "mystery" ? (
                    <div className="nft-odds">
                      {rarities.map(function (r) {
                        const pct = r.odds / oddsTotal * 100;
                        return (
                          <div key={r.key} className={"nft-odds-row nft-r-" + r.key}>
                            <span>{rarityTitle(r.key)}</span>
                            <span className="nft-odds-bar"><i style={{ width: Math.max(2, pct) + "%" }} /></span>
                            <b>{(pct < 1 ? pct.toFixed(1) : Math.round(pct)) + "%"}</b>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="nft-pack-slots">
                      {(pk.slots || []).map(function (sl) {
                        return <span key={sl.rarity} className="nft-pack-slot"><RarityPill rarity={sl.rarity} />{sl.count > 1 ? <b>{"×" + sl.count}</b> : null}</span>;
                      })}
                    </div>
                  )}

                  <div className="nft-pack-foot">
                    <span className="nft-pack-price">
                      <b>{money(pk.price)}</b>
                      <small>{"Avg value " + money(ev) + " · " + left + " left"}</small>
                    </span>
                    <button className="nft-btn nft-btn--light nft-btn--sm" type="button" disabled={left === 0} onClick={function () { setBuying(pk); }}>
                      {left === 0 ? "Sold out" : "Buy"}
                    </button>
                  </div>
                  <span className="nft-pack-stock"><i style={{ width: (pk.stock ? left / pk.stock * 100 : 0) + "%" }} /></span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="nft-section-head"><span>In this collection</span><small>{templates.length + " designs"}</small></div>
        <div className="nft-gallery">
          {templates.map(function (t) {
            return (
              <div key={t.id} className={"nft-gallery-item nft-r-" + t.rarity}>
                <span className="nft-gallery-art"><NftArt art={t.art} rarity={t.rarity} /></span>
                <span className="nft-gallery-name">{t.name}</span>
                <span className="nft-gallery-meta">
                  <RarityPill rarity={t.rarity} />
                  <small>{perHour(t.incomeHour)}</small>
                </span>
                <span className="nft-gallery-supply">
                  <span className="nft-gallery-bar"><i style={{ width: (t.supply ? t.minted / t.supply * 100 : 0) + "%" }} /></span>
                  <small>{t.minted + "/" + t.supply}</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <NftConfirm
        open={!!buying}
        title={buying ? "Buy " + buying.name + "?" : ""}
        text={buying ? buying.caption + " from " + c.name + ". The NFTs are revealed right after payment." : ""}
        confirm={buying ? "Pay " + money(buying.price) : "Pay"}
        onCancel={function () { setBuying(null); }}
        onConfirm={doBuy}
      />

      <NftClaimOverlay
        items={opened ? opened.items : null}
        source={opened ? opened.name : ""}
        onClose={function () { setOpened(null); }}
        onOpenNft={function () { setOpened(null); navigate("/nft/inventory"); }}
      />
      <NftToast toast={toast} />
    </div>
  );
}
