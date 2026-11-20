import { useState } from "react";
import { useNftMarket, useNftState } from "./useNft";
import { RARITIES, NftArt, NftIcon, NftPortal, NftTopbar, formatLeft, money, perHour, rarityTitle, useNftBack, useNow } from "./nftShared";
import { NftConfirm, NftCta, NftDetailSheet, NftListDialog, NftToast, itemRows, useNftToast } from "./NftSheets";
import { Skeleton } from "./LoadingState";
import { NftTile } from "./NftInventory";

const TABS = [
  ["game", "xwallet"],
  ["players", "Players"],
  ["mine", "My listings"]
];

// Витрина xwallet приводится к виду предмета, чтобы переиспользовать плитки и лист
function gameAsItem(g) {
  return {
    id: g.templateId,
    name: g.name,
    rarity: g.rarity,
    art: g.art,
    collection: g.collection,
    serial: g.nextSerial,
    supply: g.supply,
    minted: g.minted,
    value: g.value,
    incomeHour: g.incomeHour
  };
}

function payback(price, incomeHour) {
  if (!incomeHour) return "—";
  return "~" + Math.ceil(price / (incomeHour * 24)) + " days";
}

function ago(ts, now) {
  const s = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 1000));
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export default function NftMarket() {
  const back = useNftBack("/nft");
  const now = useNow(1000);
  const { market, error, buyListing, buyGame, unlist, refresh } = useNftMarket();
  const nft = useNftState();
  const [tab, setTab] = useState("game");
  const [rarity, setRarity] = useState("all");
  const [asc, setAsc] = useState(true);
  const [open, setOpen] = useState(null);
  const [buying, setBuying] = useState(null);
  const [picker, setPicker] = useState(false);
  const [listing, setListing] = useState(null);
  const [toast, showToast] = useNftToast();

  const config = nft.state ? nft.state.config : null;
  let rows = [];
  if (market) {
    if (tab === "game") rows = (market.game || []).map(function (g) { return { key: "g" + g.templateId, kind: "game", item: gameAsItem(g), price: g.price, left: g.left, raw: g }; });
    else rows = (market.listings || []).filter(function (l) { return tab === "mine" ? l.mine : !l.mine; }).map(function (l) {
      return { key: "l" + l.id, kind: "listing", item: l.item, price: l.price, seller: l.seller, mine: l.mine, raw: l };
    });
  }
  const counts = {};
  rows.forEach(function (r) { counts[r.item.rarity] = (counts[r.item.rarity] || 0) + 1; });
  const shown = rows.filter(function (r) { return rarity === "all" || r.item.rarity === rarity; }).sort(function (a, b) {
    return asc ? a.price - b.price : b.price - a.price;
  });
  const free = nft.state ? (nft.state.items || []).filter(function (it) { return !it.listingId; }) : [];

  function finishBuy(item, price) {
    setBuying(null);
    setOpen(null);
    nft.refresh().catch(function () {});
    showToast(true, "Bought " + item.name + " #" + item.serial + " for " + money(price));
  }

  function doBuy() {
    const row = buying;
    const req = row.kind === "game" ? buyGame(row.raw.templateId, row.price) : buyListing(row.raw.id);
    return req.then(function (item) { finishBuy(item, row.price); }).catch(function (e) {
      setBuying(null);
      showToast(false, e.message || "Purchase failed");
      refresh().catch(function () {});
    });
  }

  function doUnlist(row) {
    unlist(row.item.id).then(function () {
      setOpen(null);
      nft.refresh().catch(function () {});
      showToast(true, "Listing removed");
    }).catch(function (e) { showToast(false, e.message || "Could not remove the listing"); });
  }

  function doList(price) {
    return nft.list(listing.id, price).then(function () {
      setListing(null);
      setOpen(null);
      setTab("mine");
      refresh().catch(function () {});
      showToast(true, "Listed for " + money(price));
    });
  }

  const sheet = open ? (function () {
    const it = open.item;
    const m = [
      { icon: "tag", label: "Price", value: money(open.price) },
      { icon: "bolt", label: "Earns", value: perHour(it.incomeHour) }
    ];
    if (open.kind === "game") {
      return {
        owner: "Sold by xwallet · " + open.left + " left",
        metrics: m,
        rows: [
          ["Collection", it.collection ? it.collection.name : "xwallet"],
          ["You get edition", "#" + it.serial + " of " + it.supply],
          ["Minted", it.minted + " / " + it.supply],
          ["Est. value", money(it.value)],
          ["Daily income", money(it.incomeHour * 24)],
          ["Pays back in", payback(open.price, it.incomeHour)]
        ]
      };
    }
    return {
      owner: open.mine ? "Your listing" : "Listed by " + open.seller,
      metrics: m,
      rows: itemRows(it, [
        ["Est. value", money(it.value)],
        ["Pays back in", payback(open.price, it.incomeHour)]
      ])
    };
  })() : null;

  return (
    <div className="nft-page">
      <NftTopbar title="Market" onBack={back} right={
        <button className="nft-round" type="button" onClick={function () { setPicker(true); }} aria-label="List an NFT"><NftIcon name="plus" /></button>
      } />
      <div className="nft-wrap">
        {market && (market.recent || []).length > 0 && (
          <div className="nft-recent" aria-label="Recent sales">
            {market.recent.map(function (s, i) {
              return (
                <div className={"nft-recent-item nft-r-" + s.rarity} key={i}>
                  <span className="nft-recent-art"><NftArt art={s.art} rarity={s.rarity} /></span>
                  <span className="nft-recent-text">
                    <b>{money(s.price)}</b>
                    <span>{s.name + " #" + s.serial}</span>
                  </span>
                  <small>{ago(s.createdAt, now)}</small>
                </div>
              );
            })}
          </div>
        )}

        <div className="nft-seg">
          {TABS.map(function (t) {
            return <button key={t[0]} type="button" className={tab === t[0] ? "is-on" : ""} onClick={function () { setTab(t[0]); setRarity("all"); }}>{t[1]}</button>;
          })}
        </div>

        {tab === "game" && market && (
          <p className="nft-hint"><NftIcon name="clock" />{"Fresh stock from live drops · restocks in " + formatLeft(new Date(market.refreshAt).getTime() - now)}</p>
        )}
        {tab === "players" && <p className="nft-hint"><NftIcon name="tag" />Players set their own prices. Compare with the estimated value.</p>}

        <div className="nft-toolbar">
          <div className="nft-filters">
            <button type="button" className={"nft-filter" + (rarity === "all" ? " is-on" : "")} onClick={function () { setRarity("all"); }}>{"All " + rows.length}</button>
            {RARITIES.filter(function (r) { return counts[r]; }).map(function (r) {
              return (
                <button key={r} type="button" className={"nft-filter nft-r-" + r + (rarity === r ? " is-on" : "")} onClick={function () { setRarity(r); }}>
                  <i />{rarityTitle(r) + " " + counts[r]}
                </button>
              );
            })}
          </div>
          <button className="nft-sort" type="button" onClick={function () { setAsc(!asc); }}>{asc ? "Price ↑" : "Price ↓"}</button>
        </div>

        {!market && (error
          ? <div className="nft-empty"><b>Could not load the market</b><span>{error}</span></div>
          : <Skeleton rows={3} hero />)}

        {market && shown.length === 0 && (
          <div className="nft-empty">
            <span className="nft-empty-art"><NftIcon name="store" /></span>
            <b>{tab === "mine" ? "You have no listings" : tab === "players" ? "No player listings yet" : "Sold out for now"}</b>
            <span>{tab === "game" ? "New stock arrives with every restock and drop." : "List an NFT from your inventory at any price."}</span>
            {tab !== "game" && <button className="nft-btn nft-btn--light" type="button" onClick={function () { setPicker(true); }}>List an NFT</button>}
          </div>
        )}

        {market && shown.length > 0 && (
          <div className="nft-grid">
            {shown.map(function (r) {
              const tag = r.kind === "game" ? r.left + " left" : r.mine ? "Yours" : null;
              const sub = r.kind === "game" ? perHour(r.item.incomeHour) : r.seller;
              return <NftTile key={r.key} item={r.item} price={r.price} tag={tag} sub={sub} onClick={function () { setOpen(r); }} />;
            })}
          </div>
        )}
      </div>

      <NftDetailSheet item={open ? open.item : null} onClose={function () { setOpen(null); }} owner={sheet ? sheet.owner : ""} metrics={sheet ? sheet.metrics : null} rows={sheet ? sheet.rows : null}>
        {open && !open.mine && <NftCta icon="wallet" label={"Buy for " + money(open.price)} onClick={function () { setBuying(open); }} />}
        {open && open.mine && (
          <>
            <NftCta icon="tag" label="Change price" onClick={function () { setListing(Object.assign({}, open.item, { listingId: open.raw.id, listPrice: open.price })); }} />
            <button className="nft-btn nft-btn--glass nft-btn--block" type="button" onClick={function () { doUnlist(open); }}>Remove listing</button>
          </>
        )}
      </NftDetailSheet>

      <NftConfirm
        open={!!buying}
        title="Confirm purchase"
        text={buying ? buying.item.name + " #" + buying.item.serial + " for " + money(buying.price) + ". It starts earning " + perHour(buying.item.incomeHour) + " right away." : ""}
        confirm={buying ? "Pay " + money(buying.price) : "Pay"}
        onCancel={function () { setBuying(null); }}
        onConfirm={doBuy}
      />

      {picker && (
        <NftPortal>
        <div className="nft-dialog-wrap" role="dialog" aria-modal="true" aria-label="Choose an NFT" onClick={function () { setPicker(false); }}>
          <div className="nft-dialog" onClick={function (e) { e.stopPropagation(); }}>
            <div className="nft-dialog-head">
              <span className="nft-dialog-title"><span>List on market</span><b>Choose an NFT</b></span>
              <button className="nft-dialog-x" type="button" onClick={function () { setPicker(false); }} aria-label="Close"><NftIcon name="close" /></button>
            </div>
            {free.length === 0
              ? <p className="nft-note">Nothing to list. All your NFTs are already listed or you have none yet.</p>
              : (
                <div className="nft-pick">
                  {free.slice().sort(function (a, b) { return b.value - a.value; }).map(function (it) {
                    return (
                      <button key={it.id} type="button" className={"nft-pick-row nft-r-" + it.rarity} onClick={function () { setPicker(false); setListing(it); }}>
                        <span className="nft-pick-art"><NftArt art={it.art} rarity={it.rarity} /></span>
                        <span className="nft-pick-text"><b>{it.name + " #" + it.serial}</b><span>{rarityTitle(it.rarity) + " · " + perHour(it.incomeHour)}</span></span>
                        <b className="nft-pick-price">{money(it.value)}</b>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
        </NftPortal>
      )}

      <NftListDialog item={listing} config={config} onClose={function () { setListing(null); }} onSubmit={doList} />
      <NftToast toast={toast} />
    </div>
  );
}
