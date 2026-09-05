import { useBankCards } from "./useBankCards";

function useCardFunding() {
  var { data } = useBankCards();
  var activeCard = data ? data.cards.find(function (c) { return c.isActiveForTrading; }) : null;
  return { activeCard: activeCard, hasCards: !!(data && data.cards.length > 0) };
}

export { useCardFunding };