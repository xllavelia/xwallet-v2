import { useEffect, useRef, useState } from "react";
import { NftArt, NftIcon, NftPortal, money, perHour, rarityTitle, useOverlayLock } from "./nftShared";

// Карточка NFT в стиле витрины: вкладка редкости, ценник, статистика
export function NftCard({ item, tilt }) {
  const minted = Math.max(item.minted || 0, item.serial || 0);
  const supply = Math.max(item.supply || 1, minted);
  const share = Math.round(minted / supply * 100);
  return (
    <div className={"nft-card nft-r-" + item.rarity} style={tilt ? { transform: "rotateX(" + tilt.y + "deg) rotateY(" + tilt.x + "deg)" } : undefined}>
      <div className="nft-card-tab">{rarityTitle(item.rarity)}</div>
      <div className="nft-card-badge" title="Earns every hour"><NftIcon name="bolt" /></div>
      <div className="nft-card-media">
        <NftArt art={item.art} rarity={item.rarity} />
        <span className="nft-card-shine" />
        <div className="nft-card-price">{money(item.value)}</div>
      </div>
      <div className="nft-card-name">{item.name}<span>{" #" + item.serial}</span></div>
      <div className="nft-card-coll">
        <span className="nft-card-logo"><NftArt art={item.art} rarity="common" /></span>
        <span className="nft-card-coll-name">{item.collection ? item.collection.name : "xwallet"}</span>
        <span className="nft-card-verified"><NftIcon name="check" /></span>
      </div>
      <div className="nft-card-stats">
        <div className="nft-card-stat">
          <span>Avg earnings</span>
          <b>{perHour(item.incomeHour)}</b>
        </div>
        <div className="nft-card-stat">
          <span>Distribution %</span>
          <div className="nft-split">
            <i className="nft-split-dot" />
            <b>{share}</b>
            <span className="nft-split-bar"><span style={{ width: share + "%" }} /></span>
            <b>{100 - share}</b>
            <i className="nft-split-dot nft-split-dot--rest" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NftClaimOverlay({ items, source, onClose, onOpenNft }) {
  const open = !!(items && items.length);
  const [index, setIndex] = useState(0);
  const [tilt, setTilt] = useState(null);
  const stage = useRef(null);
  useOverlayLock(open, onClose);

  useEffect(function () {
    if (open) {
      setIndex(0);
      if (navigator.vibrate) navigator.vibrate([12, 40, 18]);
    }
  }, [open, items]);

  if (!open) return null;
  const item = items[Math.min(index, items.length - 1)];
  const last = index >= items.length - 1;

  function onMove(e) {
    const box = stage.current ? stage.current.getBoundingClientRect() : null;
    if (!box) return;
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  }

  return (
    <NftPortal>
    <div className={"nft-claim nft-r-" + item.rarity} role="dialog" aria-modal="true" aria-label="New NFT">
      <div className="nft-claim-bg" aria-hidden="true">
        <NftArt art={item.art} rarity={item.rarity} />
      </div>
      <div className="nft-claim-glow" aria-hidden="true" />

      <div className="nft-claim-head">
        <span className="nft-claim-kicker">{items.length > 1 ? "Pack opened" : "New NFT"}</span>
        <span className="nft-claim-source">{source || item.source}</span>
        <button className="nft-claim-x" type="button" onClick={onClose} aria-label="Close"><NftIcon name="close" /></button>
      </div>

      <div className="nft-claim-stage" ref={stage} onPointerMove={onMove} onPointerLeave={function () { setTilt(null); }}>
        <div className="nft-claim-enter" key={index}>
          <NftCard item={item} tilt={tilt} />
        </div>
      </div>

      {items.length > 1 && (
        <div className="nft-claim-dots">
          {items.map(function (it, i) {
            return <button key={it.id} type="button" className={"nft-r-" + it.rarity + (i === index ? " is-on" : "")} onClick={function () { setIndex(i); }} aria-label={"NFT " + (i + 1)} />;
          })}
        </div>
      )}

      <div className="nft-claim-actions">
        {last
          ? <button className="nft-btn nft-btn--light" type="button" onClick={onClose}>Collect</button>
          : <button className="nft-btn nft-btn--light" type="button" onClick={function () { setIndex(index + 1); }}>{"Next · " + (index + 2) + " of " + items.length}</button>}
        <button className="nft-btn nft-btn--glass" type="button" onClick={onOpenNft}>Open inventory</button>
      </div>
    </div>
    </NftPortal>
  );
}
