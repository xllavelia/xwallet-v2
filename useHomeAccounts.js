import { useEffect, useState } from "react";
import { useWalletBalance } from "./useWallet";
import { useClosedPositionsRemote } from "./usePositions";
import { useStockPortfolio } from "./useStocks";
import { useCommodityPortfolio } from "./useCommodities";
import { useCard } from "./useCard";
import { useSavings } from "./useSavings";
import { useBankCards } from "./useBankCards";
import { BASE_DESIGNS } from "./bankCardVisuals";

const MAIN_DESIGN_IDS = { wallet: 0, crypto: 3, markets: 2, savings: 1 };
const WALLET_SINCE_KEY = "xw-wallet-since";

// В localStorage может лежать номер базового дизайна или полный выбор: ключ каталога и кастом.
function normalizeMainDesign(value) {
  if (value && typeof value === "object") {
    return {
      designId: Number(value.designId) || 0,
      designKey: typeof value.designKey === "string" ? value.designKey : "",
      custom: value.custom && typeof value.custom === "object" ? value.custom : null,
    };
  }
  const stored = Number(value);
  return {
    designId: Number.isInteger(stored) && stored >= 0 && stored < BASE_DESIGNS.length ? stored : 0,
    designKey: "",
    custom: null,
  };
}

function getMainDesign(key) {
  const raw = localStorage.getItem("xw-" + key + "-design");
  if (raw === null) return { designId: MAIN_DESIGN_IDS[key], designKey: "", custom: null };
  try {
    return normalizeMainDesign(JSON.parse(raw));
  } catch {
    return normalizeMainDesign(raw);
  }
}

function getMainDesigns() {
  return Object.fromEntries(Object.keys(MAIN_DESIGN_IDS).map(key => [key, getMainDesign(key)]));
}

function setMainDesign(key, design) {
  localStorage.setItem("xw-" + key + "-design", JSON.stringify(normalizeMainDesign(design)));
  window.dispatchEvent(new Event("xw-accounts-changed"));
}

// Дата открытия кошелька фиксируется локально при первом показе.
function walletSince() {
  let value = localStorage.getItem(WALLET_SINCE_KEY);
  if (!value) {
    value = new Date().toISOString();
    localStorage.setItem(WALLET_SINCE_KEY, value);
  }
  return value;
}

function accountUsd(value) {
  return "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useHomeAccounts(balanceHidden = false) {
  const [mainDesigns, setMainDesigns] = useState(getMainDesigns);
  useEffect(() => {
    const update = () => setMainDesigns(getMainDesigns());
    window.addEventListener("xw-accounts-changed", update);
    return () => window.removeEventListener("xw-accounts-changed", update);
  }, []);
  const { wallet, refresh: refreshWallet } = useWalletBalance();
  const { closedPositions } = useClosedPositionsRemote();
  const { portfolio: stocks } = useStockPortfolio();
  const { portfolio: commodities } = useCommodityPortfolio();
  const { card } = useCard();
  const { savings } = useSavings();
  const bank = useBankCards();
  const hide = value => balanceHidden ? "••••" : value;
  const signed = value => hide((value >= 0 ? "+" : "−") + accountUsd(Math.abs(Number(value) || 0)));
  const since = Date.now() - 86400000;
  const change = closedPositions.reduce((total, position) => new Date(position.closedAt).getTime() >= since ? total + (parseFloat(position.pnl) || 0) : total, 0);
  const extras = bank.data ? bank.data.cards : [];
  // Крипта и акции/ресурсы — два отдельных счёта
  const cryptoValue = Number(card && card.balanceUsd) || 0;
  const marketsValue = (Number(stocks && stocks.totalValue) || 0) + (Number(commodities && commodities.totalValue) || 0);
  const marketsToday = (Number(stocks && stocks.todayChangeAmount) || 0) + (Number(commodities && commodities.todayChangeAmount) || 0);
  const base = [
    { key: "wallet", ...mainDesigns.wallet, label: "Wallet", sub: "Main account", path: "/balancecard?account=wallet", value: hide(accountUsd(wallet.balance)), badge: signed(change), balance: wallet.balance, primary: true, isActive: !extras.some(item => item.isActiveForTrading), glass: true, opened: walletSince() },
    { key: "crypto", ...mainDesigns.crypto, label: "Crypto", sub: "BTC · ETH · SOL · TON", path: "/crypto", value: card ? hide(accountUsd(cryptoValue)) : "—" },
    { key: "markets", ...mainDesigns.markets, label: "Markets", sub: "Stocks & resources", path: "/markets", value: (stocks || commodities) ? hide(accountUsd(marketsValue)) : "—", badge: marketsToday !== 0 ? signed(marketsToday) : "" },
    { key: "savings", ...mainDesigns.savings, label: "Savings", sub: savings ? savings.interestRate + "% APR" : "Savings account", path: "/savings", value: savings ? hide(accountUsd(savings.balance)) : "—", badge: savings ? signed((savings.balance || 0) * (savings.interestRate || 0) / 1200) : "" },
  ];
  const accounts = [...base, ...extras.map(item => ({
    key: "account-" + item.id, id: item.id, designId: item.designId, designKey: item.designKey, custom: item.custom,
    label: item.name, sub: "Account · " + item.cardNumber.slice(-4),
    path: "/balancecard?account=" + item.id, value: hide(accountUsd(item.balance)), balance: item.balance,
    number: item.cardNumber, isActive: item.isActiveForTrading, openedAt: item.openedAt, glass: true,
  }))];
  return { accounts, extras, bank, wallet, refreshWallet, canOpen: !!bank.data && extras.length < bank.data.maxCards };
}

export { useHomeAccounts, accountUsd, setMainDesign, walletSince };
