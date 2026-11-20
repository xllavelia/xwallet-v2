import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNftState } from "./useNft";
import { RARITIES, NftArt, NftIcon, NftTopbar, money, perHour, rarityRank, rarityTitle, useNftBack } from "./nftShared";
import { NftConfirm, NftCta, NftDetailSheet, NftListDialog, NftToast, itemRows, useNftToast } from "./NftSheets";
import { Skeleton } from "./LoadingState";

const SORTS = [
  ["value", "Value"],
  ["rarity", "Rarity"],
  ["new", "Newest"]
];

export function sortItems(list, sort) {
  return list.slice().sort(function (a, b) {
    if (sort === "rarity") return rarityRank(b.rarity) - rarityRank(a.rarity) || b.value - a.value;
    if (sort === "new") return new Date(b.mintedAt) - new Date(a.mintedAt);
    return b.value - a.value;
  });
}

// Плитка NFT в сетке инвентаря и маркета
export function NftTile({ item, price, tag, sub, onClick }) {
  return (
    <button className={"nft-tile nft-r-" + item.rarity} type="button" onClick={onClick}>
      <span className="nft-tile-media">
        <NftArt art={item.art} rarity={item.rarity} />
        <span className="nft-tile-rarity">{rarityTitle(item.rarity)}</span>
        {tag && <span className="nft-tile-tag">{tag}</span>}
      </span>
      <span className="nft-tile-name">
        {item.name}
        {item.serial ? <small>{" #" + item.serial}</small> : null}
      </span>
      <span className="nft-tile-foot">
        <b>{money(price != null ? price : item.value)}</b>
        <span>{sub != null ? sub : perHour(item.incomeHour)}</span>
      </span>
    </button>
  );
}

export default function NftInventory() {
  const navigate = useNavigate();
  const back = useNftBack("/nft");
  const { state, error, sell, list, unlist } = useNftState();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("value");
  const [openId, setOpenId] = useState(null);
  const [listing, setListing] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [toast, showToast] = useNftToast();

  const items = state ? state.items || [] : [];
  const counts = useMemo(function () {
    const c = {};
    items.forEach(function (it) { c[it.rarity] = (c[it.rarity] || 0) + 1; });
    return c;
  }, [items]);
  const shown = sortItems(filter === "all" ? items : items.filter(function (it) { return it.rarity === filter; }), sort);
  const open = openId != null ? items.find(function (it) { return it.id === openId; }) || null : null;

  function closeSheet() { setOpenId(null); }

  function doSell() {
    const it = open;
    return sell(it.id).then(function (r) {
      setConfirm(false);
      setOpenId(null);
      showToast(true, "Sold " + it.name + " #" + it.serial + " for " + money(r.price));
    }).catch(function (e) {
      setConfirm(false);
      showToast(false, e.message || "Could not sell");
    });
  }

  function doList(price) {
    return list(listing.id, price).then(function () {
      setListing(null);
      showToast(true, "Listed for " + money(price));
    });
  }

  function doUnlist() {
    unlist(open.id).then(function () {
      showToast(true, "Listing removed");
    }).catch(function (e) { showToast(false, e.message || "Could not remove the listing"); });
  }

  return (
    <div className="nft-page">
      <NftTopbar title="Inventory" onBack={back} right={
        <div className="nft-top-actions">
          <button className="nft-round" type="button" onClick={function () { navigate("/nft/merge"); }} aria-label="Merge"><NftIcon name="merge" /></button>
          <button className="nft-round" type="button" onClick={function () { navigate("/nft/upgrade"); }} aria-label="Upgrade"><NftIcon name="upgrade" /></button>
          <button className="nft-round" type="button" onClick={function () { navigate("/nft/market"); }} aria-label="Market"><NftIcon name="store" /></button>
        </div>
      } />
      <div className="nft-wrap">
        {!state && (error
          ? <div className="nft-empty"><b>Could not load NFTs</b><span>{error}</span></div>
          : <Skeleton rows={3} hero />)}

        {state && (
          <>
            <div className="nft-summary">
              <div><span>Items</span><b>{state.profile.count}</b></div>
              <div><span>Value</span><b>{money(state.profile.value)}</b></div>
              <div><span>Income</span><b>{perHour(state.profile.incomeHour)}</b></div>
            </div>

            {items.length > 0 && (
              <div className="nft-toolbar">
                <div className="nft-filters">
                  <button type="button" className={"nft-filter" + (filter === "all" ? " is-on" : "")} onClick={function () { setFilter("all"); }}>
                    {"All " + items.length}
                  </button>
                  {RARITIES.filter(function (r) { return counts[r]; }).map(function (r) {
                    return (
                      <button key={r} type="button" className={"nft-filter nft-r-" + r + (filter === r ? " is-on" : "")} onClick={function () { setFilter(r); }}>
                        <i />{rarityTitle(r) + " " + counts[r]}
                      </button>
                    );
                  })}
                </div>
                <div className="nft-seg nft-seg--sm">
                  {SORTS.map(function (s) {
                    return <button key={s[0]} type="button" className={sort === s[0] ? "is-on" : ""} onClick={function () { setSort(s[0]); }}>{s[1]}</button>;
                  })}
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="nft-empty">
                <span className="nft-empty-art"><NftIcon name="grid" /></span>
                <b>No NFTs yet</b>
                <span>Earn them in the Battle Pass and Daily Rewards, or open a pack from a live drop.</span>
                <div className="nft-empty-actions">
                  <button className="nft-btn nft-btn--light" type="button" onClick={function () { navigate("/nft"); }}>See drops</button>
                  <button className="nft-btn nft-btn--glass" type="button" onClick={function () { navigate("/nft/market"); }}>Open market</button>
                </div>
              </div>
            ) : (
              <div className="nft-grid">
                {shown.map(function (it) {
                  return <NftTile key={it.id} item={it} tag={it.listingId ? "Listed · " + money(it.listPrice) : null} onClick={function () { setOpenId(it.id); }} />;
                })}
              </div>
            )}
          </>
        )}
      </div>

      <NftDetailSheet
        item={open}
        onClose={closeSheet}
        owner={open && open.listingId ? "Owned by you · listed" : "Owned by you"}
        metrics={open ? [
          { icon: "tag", label: "Est. value", value: money(open.value) },
          { icon: "bolt", label: "Earns", value: perHour(open.incomeHour) }
        ] : null}
        rows={open ? itemRows(open, open.listingId ? [["Listed at", money(open.listPrice)]] : []) : null}
      >
        {open && !open.listingId && (
          <>
            <NftCta icon="wallet" label={"Sell instantly · " + money(open.instantPrice)} onClick={function () { setConfirm(true); }} />
            <button className="nft-btn nft-btn--glass nft-btn--block" type="button" onClick={function () { setListing(open); }}>List on market</button>
          </>
        )}
        {open && open.listingId && (
          <>
            <NftCta icon="tag" label="Change price" onClick={function () { setListing(open); }} />
            <button className="nft-btn nft-btn--glass nft-btn--block" type="button" onClick={doUnlist}>Remove listing</button>
          </>
        )}
      </NftDetailSheet>

      <NftListDialog item={listing} config={state ? state.config : null} onClose={function () { setListing(null); }} onSubmit={doList} />

      <NftConfirm
        open={confirm && !!open}
        title="Sell instantly?"
        text={open ? open.name + " #" + open.serial + " will be sold to xwallet for " + money(open.instantPrice) + " (" + Math.round(state.config.instantRate * 100) + "% of its value). It stops earning and cannot be bought back." : ""}
        confirm={open ? "Sell for " + money(open.instantPrice) : "Sell"}
        tone="danger"
        onCancel={function () { setConfirm(false); }}
        onConfirm={doSell}
      />

      <NftToast toast={toast} />
    </div>
  );
}
