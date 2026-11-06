import { useWalletBalance } from "./useWallet";
import { useClosedPositionsRemote } from "./usePositions";
import { useStockPortfolio } from "./useStocks";
import { useCommodityPortfolio } from "./useCommodities";
import { useCard } from "./useCard";
import { useSavings } from "./useSavings";
import { useBankCards } from "./useBankCards";
import { ACCOUNT_DESIGNS } from "./bankCardVisuals";

const WALLET_DESIGN_KEY = "xw-wallet-design";

function getWalletDesign() {
  const raw = localStorage.getItem(WALLET_DESIGN_KEY);
  if (raw === null) return 2;
  const stored = Number(raw);
  return Number.isInteger(stored) && stored >= 0 && stored < ACCOUNT_DESIGNS.length ? stored : 2;
}

function setWalletDesign(designId) {
  localStorage.setItem(WALLET_DESIGN_KEY, String(designId));
  window.dispatchEvent(new Event("xw-accounts-changed"));
}

function accountUsd(value) {
  return "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useHomeAccounts(balanceHidden = false) {
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
    { key: "wallet", designId: getWalletDesign(), label: "Wallet", sub: "Main account", path: "/balancecard?account=wallet", value: hide(accountUsd(wallet.balance)), badge: signed(change), balance: wallet.balance, primary: true, isActive: !extras.some(item => item.isActiveForTrading), glass: true },
    { key: "crypto", designId: 4, label: "Crypto", sub: "BTC · ETH · SOL · TON", path: "/crypto", value: card ? hide(accountUsd(cryptoValue)) : "—" },
    { key: "markets", designId: 3, label: "Markets", sub: "Stocks & resources", path: "/markets", value: (stocks || commodities) ? hide(accountUsd(marketsValue)) : "—", badge: marketsToday !== 0 ? signed(marketsToday) : "" },
    { key: "savings", designId: 0, label: "Savings", sub: savings ? savings.interestRate + "% APR" : "Savings account", path: "/savings", value: savings ? hide(accountUsd(savings.balance)) : "—", badge: savings ? signed((savings.balance || 0) * (savings.interestRate || 0) / 1200) : "" },
  ];
  const accounts = [...base, ...extras.map(item => ({
    key: "account-" + item.id, id: item.id, designId: item.designId, label: item.name, sub: "Account · " + item.cardNumber.slice(-4),
    path: "/balancecard?account=" + item.id, value: hide(accountUsd(item.balance)), balance: item.balance,
    number: item.cardNumber, isActive: item.isActiveForTrading, openedAt: item.openedAt, glass: true,
  }))];
  return { accounts, extras, bank, wallet, refreshWallet, canOpen: !!bank.data && extras.length < bank.data.maxCards };
}

export { useHomeAccounts, accountUsd, getWalletDesign, setWalletDesign };
