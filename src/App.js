import React, {useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Transactions from "./components/Transactions";
import Buttons from "./components/Buttons";
import Chart from "./components/Chart";

function App() {
  const[price, setPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);

  const getPrice = () => {
    axios
      .get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      .then((res) => {
        console.log(res.data.data.amount);
        setPrice(res.data.data.amount);
        updateChartData(res.data.data.amount)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getWalletBalance = () => {
    // move X-API-Key to a .env file to keep a secret when we push to Github.
    const headers = {
      "X-Api-Key": "6d7b331b1fc847cd9d42bfb63593bdde",
    };
    axios
      .get("https://legend.lnbits.com/api/v1/wallet", { headers })
      .then((res) => {
        // divide our balance by 1000 since it is denomitated in millisats
        setBalance(res.data.balance / 1000);
      })
      .catch((err) => console.log(err));
  };

  const getTransactions = () => {
    // ToDo: Lookup how to move X-API-KEY to a .env file to keep it a secret for when we push to GitHub.
    const headers = {
      "X-Api-Key": "6d7b331b1fc847cd9d42bfb63593bdde",
    };
    axios 
      .get("https://legend.lnbits.com/api/v1/payments", { headers })
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => console.log(err));
  }; 

  const updateChartData = (currentPrice) => {
    const timestamp = Date.now();
      // We are able to grab the previous state to look at it and do logic before adding new data to it
    setChartData((prevState) => {
      // If we have no previous state, create a new array with the new price data
      if (!prevState)
        return [
          {
            x: timestamp,
            y: Number(currentPrice),
          },
        ];
      // If the timestamp or price has not changed, we don't want to add a new point
      if (
        prevState[prevState.length - 1].x === timestamp ||
        prevState[prevState.length - 1].y === Number(currentPrice)
      )
        return prevState;
      // If we have previous state than keep it and add the new price data to the end of the array
      return [
        // Here we use the "spread operator" to copy the previous state
        ...prevState,
        {
          x: timestamp,
          y: Number(currentPrice),
        },
      ];
    });
  };

  useEffect(() => {
    getPrice();
    getWalletBalance();
    getTransactions();
  }, []);

  // Run these every 5 secs after initial page load
  useEffect(() => {
    const interval = setInterval(() => {
      getPrice();
      getWalletBalance();
      getTransactions();
    }, 5000);
    return () => clearInterval(interval)
  }, []);

 return (
   <div className="App">
     <header>
       <h1>pleb wallet</h1>
     </header>
     <Buttons />
     <div className="row">
       <div className="balance-card">
         <h2>Balance</h2>
         <p>{balance} sats</p>
       </div>

       <div className="balance-card">
         <h2>Price</h2>
         <p>${price}</p>
       </div>

     </div>
     <div className="row">
       <div className="row-item">
         <Transactions transactions={transactions}/>
       </div>
       <div className="row-item">
        <Chart chartData={chartData} />
        </div>
     </div>
     <footer>
       <p>Made by Jose Sahagun</p>
     </footer>
   </div>
 );
}

export default App;
