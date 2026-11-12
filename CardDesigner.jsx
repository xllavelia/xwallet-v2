import { useMemo, useState } from "react";
import { AccountArt, BASE_DESIGNS } from "./bankCardVisuals";
import { ProfileIcon } from "./ProfileShared";

const CUSTOM_PRICE = 50;
const COLOR_OPTIONS = [
  "#e7e5de", "#dcc9a8", "#c3d9cb", "#788b43", "#e45d55", "#75cbdc",
  "#895b83", "#24a879", "#d8793f", "#db65b5", "#c0c7d1", "#e9bd62",
  "#e4e5e8", "#f05b8b", "#5c4230", "#66703c", "#e5b49e", "#9271e9",
  "#9acbba", "#2c2d32", "#013e37", "#16324b", "#101010", "#f5f3ec",
];
const INK_OPTIONS = ["#101010", "#ffffff", "#f4f2ec", "#ffefb3"];
const TABS = [
  ["basic", "Basic"],
  ["battlepass", "Battle Pass"],
  ["cases", "Cases"],
  ["lavx", "LAVX"],
];

function sourceText(item) {
  if (item.source === "shop") return item.price + " LAVX";
  if (item.source === "battlepass") return (item.track === "pass" ? "Premium" : "Free") + " · Lv " + item.level;
  if (item.source === "case") return "Case drop";
  return item.rarity || "";
}

function normalizeHex(text) {
  const clean = String(text || "").trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(clean)) return "";
  if (clean.length === 3) return ("#" + clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]).toLowerCase();
  return ("#" + clean).toLowerCase();
}

export async function prepareCardImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image under 5 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.8, 0.68, 0.55, 0.42]) {
      const url = canvas.toDataURL("image/jpeg", quality);
      if ((url.length - 23) * 3 / 4 <= 158 * 1024) return url;
    }
    throw new Error("This image is too detailed. Please choose another one.");
  } finally {
    bitmap.close();
  }
}

function DesignTile({ design, name, meta, selected, locked, onPick }) {
  return (
    <button type="button" className={"xac-tile" + (selected ? " is-selected" : "") + (locked ? " is-locked" : "")} onClick={onPick} aria-pressed={selected}>
      <span className="xac-tile-art">
        <AccountArt designId={design.designId} designKey={design.designKey} compact />
        {locked ? <span className="xac-tile-lock"><ProfileIcon name="lock" /></span> : null}
        {selected ? <span className="xac-tile-check"><ProfileIcon name="check" /></span> : null}
      </span>
      <span className="xac-tile-name">{name}</span>
      <span className="xac-tile-meta">{meta}</span>
    </button>
  );
}

function DesignSheet({ catalog, lavxBalance, isAdmin, value, onPick, onBuy, onCustom, onNavigate, onClose, busyId }) {
  const [tab, setTab] = useState("basic");
  const [hint, setHint] = useState(null);
  const selectedKey = value?.designKey || "";
  const selectedId = value?.designId;

  const items = useMemo(() => {
    if (tab === "basic") {
      return BASE_DESIGNS.map((design) => ({
        designId: design.id, name: design.name, meta: "Included", owned: true,
        colors: [design.left, design.ink],
      }));
    }
    const source = tab === "battlepass" ? "battlepass" : tab === "cases" ? "case" : "shop";
    return catalog.filter((item) => item.source === source);
  }, [catalog, tab]);

  function pick(item) {
    if (tab === "basic") {
      onPick({ designId: item.designId });
      return;
    }
    if (item.owned) {
      onPick({ designKey: item.id });
      return;
    }
    if (item.source === "shop") {
      onBuy(item);
      return;
    }
    setHint(item);
  }

  return (
    <div className="xac-overlay" role="dialog" aria-modal="true" aria-label="Card design">
      <div className="xac-overlay-panel">
        <header className="xac-overlay-head">
          <button type="button" className="xac-overlay-close" onClick={onClose} aria-label="Close">
            <ProfileIcon name="close" />
          </button>
          <strong>Card design</strong>
          {/* <span className="xac-overlay-note">{isAdmin ? "adm" : Number(lavxBalance || 0).toLocaleString("en-US") + "LAVX"}</span> */}
        </header>

        <div className="xac-tabs" role="tablist" aria-label="Design categories">
          {TABS.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "is-active" : ""} onClick={() => { setTab(key); setHint(null); }}>
              {label}
            </button>
          ))}
        </div>

        <div className="xac-overlay-scroll">
          {tab === "lavx" ? (
            <button type="button" className="xac-custom-tile" onClick={onCustom}>
              <span className="xac-custom-art">
                <AccountArt
                  designId={0}
                  custom={{ left: { color: "#dcc9a8" }, right: { color: "#16161a" }, ink: "#101010", link: false }}
                  compact
                />
                <span className="xac-custom-badge"><ProfileIcon name="palette" /></span>
              </span>
              <span className="xac-custom-copy">
                <strong>Custom card</strong>
                <small>Pick colors, your photo and text color</small>
              </span>
              <span className="xac-custom-price">{isAdmin ? "Free" : CUSTOM_PRICE + " LAVX"}</span>
            </button>
          ) : null}

          <div className="xac-design-grid">
            {items.map((item) => {
              const design = tab === "basic" ? { designId: item.designId } : { designKey: item.id };
              const meta = tab === "basic" ? item.meta : item.owned ? "Owned" : sourceText(item);
              const selected = tab === "basic" ? selectedId === item.designId && !selectedKey && !value?.custom : selectedKey === item.id;
              return (
                <DesignTile
                  key={tab + (item.id || item.designId)}
                  design={design}
                  name={item.name}
                  meta={busyId === item.id ? "Unlocking…" : meta}
                  locked={!item.owned}
                  selected={selected}
                  onPick={() => pick(item)}
                />
              );
            })}
          </div>

          {hint ? (
            <div className="xac-hint">
              <strong>{hint.name}</strong>
              <span>{hint.source === "battlepass" ? "Unlocks at Battle Pass level " + hint.level + " (" + (hint.track === "pass" ? "premium" : "free") + " track)." : "Drops from " + (hint.rarity || "rare") + " cases."}</span>
              {hint.source === "battlepass" ? (
                <button type="button" className="xac-secondary" onClick={() => onNavigate("/battlepass")}>Open Battle Pass</button>
              ) : (
                <button type="button" className="xac-secondary" onClick={() => onNavigate("/battlepass")}>Open cases</button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Swatches({ value, onChange, options, label }) {
  return (
    <div className="xac-swatches" role="group" aria-label={label}>
      {options.map((color) => (
        <button
          type="button"
          key={color}
          className={"xac-swatch" + (value?.toLowerCase() === color ? " is-active" : "")}
          style={{ background: color }}
          aria-label={color}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}

function ImageField({ image, onPick, onClear, label }) {
  return (
    <div className="xac-image-field">
      <label className="xac-image-pick">
        <ProfileIcon name="camera" />
        <span>{image ? "Replace photo" : label}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} />
      </label>
      {image ? <button type="button" className="xac-image-clear" onClick={onClear} aria-label="Remove photo"><ProfileIcon name="close" /></button> : null}
    </div>
  );
}

function CustomSheet({ initial, isAdmin, lavxBalance, vouchers, onApply, onClose, busy, error }) {
  const start = initial?.custom || null;
  const [mode, setMode] = useState(start?.link ? (start.left?.image ? "photo" : "color") : "split");
  const [leftImage, setLeftImage] = useState(start?.left?.image || "");
  const [rightImage, setRightImage] = useState(start?.right?.image || "");
  const [leftHex, setLeftHex] = useState(start?.left?.color || "");
  const [rightHex, setRightHex] = useState(start?.right?.color || "#16161a");
  const [inkHex, setInkHex] = useState(start?.ink || "");
  const [inkOpacity, setInkOpacity] = useState(start?.inkOpacity ?? 1);
  const [voucherId, setVoucherId] = useState(0);
  const [localError, setLocalError] = useState("");

  const customVouchers = (vouchers || []).filter((voucher) => ["custom_free", "custom_20", "custom_50"].includes(voucher.voucherType) && voucher.status === "inactive");
  const chosenVoucher = customVouchers.find((voucher) => voucher.id === voucherId);
  const discount = chosenVoucher ? (chosenVoucher.voucherType === "custom_free" ? 100 : chosenVoucher.voucherType === "custom_50" ? 50 : 20) : 0;
  const price = isAdmin ? 0 : Math.round(CUSTOM_PRICE * (100 - discount)) / 100;

  const preview = {
    link: mode !== "split",
    ink: normalizeHex(inkHex),
    inkOpacity,
    left: { color: mode === "photo" ? "" : normalizeHex(leftHex), image: leftImage },
    right: mode === "split" ? { color: normalizeHex(rightHex), image: rightImage } : {},
  };

  function pickImage(setImage) {
    return async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      try {
        setImage(await prepareCardImage(file));
        setLocalError("");
      } catch (err) {
        setLocalError(err.message);
      }
    };
  }

  function apply() {
    const leftHexValue = normalizeHex(leftHex);
    const inkValue = normalizeHex(inkHex);
    if (leftHex && !leftHexValue) return setLocalError("Left color must be a hex value such as 000 or #101010.");
    if (inkHex && !inkValue) return setLocalError("Text color must be a hex value.");
    if (mode === "split" && rightHex && !normalizeHex(rightHex)) return setLocalError("Right color must be a hex value.");
    if (mode === "photo" && !leftImage) return setLocalError("Choose a photo for the card.");
    if (mode !== "photo" && !leftHexValue && !leftImage) return setLocalError("Pick a color or add a photo first.");
    onApply({
      custom: {
        link: mode !== "split",
        ink: inkValue,
        inkOpacity,
        left: { color: mode === "photo" ? "" : leftHexValue, image: leftImage },
        right: mode === "split" ? { color: normalizeHex(rightHex), image: rightImage } : {},
      },
      voucherId,
    });
  }

  return (
    <div className="xac-overlay" role="dialog" aria-modal="true" aria-label="Design your card">
      <div className="xac-overlay-panel xac-custom-panel">
        <header className="xac-overlay-head">
          <button type="button" className="xac-overlay-close" onClick={onClose} aria-label="Close">
            <ProfileIcon name="close" />
          </button>
          <strong>Design your card</strong>
          <span className="xac-overlay-note">{isAdmin ? "Free for team" : price > 0 ? price + " LAVX" : "Free"}</span>
        </header>

        <div className="xac-overlay-scroll">
          <div className="xac-custom-preview">
            <AccountArt designId={0} custom={preview} opened={new Date().toISOString()} compact={false} />
          </div>

          <div className="xac-segment" role="group" aria-label="Layout">
            {[["split", "Split"], ["color", "One color"], ["photo", "One photo"]].map(([key, label]) => (
              <button key={key} type="button" className={mode === key ? "is-active" : ""} onClick={() => setMode(key)}>{label}</button>
            ))}
          </div>

          <section className="xac-panel">
            <span className="xac-panel-title">{mode === "split" ? "Left side" : "Whole card"}</span>
            {mode !== "photo" ? (
              <>
                <Swatches value={normalizeHex(leftHex)} onChange={(color) => { setLeftHex(color); }} options={COLOR_OPTIONS} label="Left color" />
                <input className="xac-hex" value={leftHex} onChange={(event) => setLeftHex(event.target.value)} placeholder="000 or #101010" aria-label="Left color hex" maxLength={7} />
              </>
            ) : null}
            <ImageField image={leftImage} onPick={pickImage(setLeftImage)} onClear={() => setLeftImage("")} label={mode === "photo" ? "Choose a photo" : "Add a photo"} />
          </section>

          {mode === "split" ? (
            <section className="xac-panel">
              <span className="xac-panel-title">Right side</span>
              <Swatches value={normalizeHex(rightHex)} onChange={(color) => { setRightHex(color); }} options={COLOR_OPTIONS} label="Right color" />
              <input className="xac-hex" value={rightHex} onChange={(event) => setRightHex(event.target.value)} placeholder="000 or #101010" aria-label="Right color hex" maxLength={7} />
              <ImageField image={rightImage} onPick={pickImage(setRightImage)} onClear={() => setRightImage("")} label="Add a banner photo" />
            </section>
          ) : null}

          <section className="xac-panel">
            <span className="xac-panel-title">Text color</span>
            <Swatches value={inkOpacity === 1 ? normalizeHex(inkHex) : ""} onChange={(color) => { setInkHex(color); setInkOpacity(1); }} options={INK_OPTIONS} label="Text color" />
            <div className="xac-segment xac-ink-presets" role="group" aria-label="White text opacity">
              {[0.8, 0.5, 0.3].map(opacity => (
                <button key={opacity} type="button" aria-pressed={normalizeHex(inkHex) === "#ffffff" && inkOpacity === opacity} className={normalizeHex(inkHex) === "#ffffff" && inkOpacity === opacity ? "is-active" : ""}
                  onClick={() => { setInkHex("#ffffff"); setInkOpacity(opacity); }}>
                  <span style={{ color: `rgba(255, 255, 255, ${opacity})` }}>Aa</span><small>{opacity * 100}%</small>
                </button>
              ))}
            </div>
            <input className="xac-hex" value={inkHex} onChange={(event) => { setInkHex(event.target.value); setInkOpacity(1); }} placeholder="000 or #f5f3ec" aria-label="Text color hex" maxLength={7} />
            <span className="xac-panel-note">The text color applies to both sides.</span>
          </section>

          {customVouchers.length ? (
            <section className="xac-panel">
              <span className="xac-panel-title">Vouchers</span>
              <div className="xac-vouchers">
                <button type="button" className={"xac-voucher" + (voucherId === 0 ? " is-active" : "")} onClick={() => setVoucherId(0)}>Full price</button>
                {customVouchers.map((voucher) => (
                  <button type="button" key={voucher.id} className={"xac-voucher" + (voucherId === voucher.id ? " is-active" : "")} onClick={() => setVoucherId(voucher.id)}>
                    {voucher.voucherType === "custom_free" ? "Free" : voucher.voucherType === "custom_50" ? "-50%" : "-20%"}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {(localError || error) ? <p className="xac-error" role="alert">{localError || error}</p> : null}

          <button type="button" className="xac-primary" onClick={apply} disabled={busy}>
            {busy ? "Saving…" : isAdmin || price <= 0 ? "Apply for free" : "Apply · " + price + " LAVX"}
          </button>
          <p className="xac-panel-note xac-panel-note--center">
            {isAdmin ? "Team accounts apply custom designs for free." : "Customization is charged once per card."}
          </p>
        </div>
      </div>
    </div>
  );
}

export { DesignSheet, CustomSheet, CUSTOM_PRICE };
