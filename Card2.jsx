import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Card2 = () => {

const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };


  // Данные наших карт
  const cardsData = [
    {
      assets: [
        { name: 'Bitcoin', ticker: 'BTC', amount: 0.00, fiat: 0.00, icon: '' },
        { name: 'Ethereum', ticker: 'ETH', amount: 0.00, fiat: 0.00, icon: '' },
        { name: 'Solana', ticker: 'SOL', amount: 0.00, fiat: 0.00, icon: '' }
      ],
      stats: [
        { label: 'Total Inflow', value: 0.00 },
        { label: 'Total Outflow', value: 0.00 },
        { label: 'Monthly Limit', value: 0.00 }
      ],

        stats2: [
{ label: 'Date', value: "12/26"},
{ label: 'Balance', value: "0.00 dollars"},
{ label: 'Brand', value: "VISA" },
{ label: 'Owner', value: "xlavelia laga" },
{ label: 'Card Number', value: "1234 9820 9827 1234"}
      ]
    }
  ];


  return (<div className="CardContent">


  </div>);
};

export default Card2;