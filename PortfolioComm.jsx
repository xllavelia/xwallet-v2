import { useCommodityPortfolio } from "./useCommodities";
import { useNavigate } from "react-router-dom";

const PortfolioComm = ({ balanceHidden }) => {
  var { portfolio } = useCommodityPortfolio();
  const navigate = useNavigate();

  return (
    <div>
      {portfolio && (
        <div className="stks-hero" onClick={() => navigate("/commodities")}>
          <span className="stks-hero-label">
            Portfolio Value
          </span>

          <span className="stks-hero-value">
            {balanceHidden
              ? "****"
              : "$" + portfolio.totalValue.toFixed(2)}
          </span>

          <span
            className={
              "stks-hero-change " +
              (portfolio.todayChangeAmount >= 0 ? "pos" : "neg")
            }
          >
            {balanceHidden
              ? "****"
              : (portfolio.todayChangeAmount >= 0 ? "+$" : "-$") +
                Math.abs(portfolio.todayChangeAmount).toFixed(2) +
                " (" +
                (portfolio.todayChangePercent >= 0 ? "+" : "") +
                portfolio.todayChangePercent.toFixed(2) +
                "%) Today"}
          </span>
        </div>
      )}
    </div>
  );
};

export default PortfolioComm;