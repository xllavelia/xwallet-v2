import React, {useState, useRef} from "react";
  // import { useNavigate } from "react-router-dom";

// git add .
//  git commit -m "added progress row with percent"
// git push origin master

// npx vite --host 0.0.0.0 --port 5173 --force

//  git add .
// git commit -m "glass 2.0"
// git push origin main



const Home = () => {
//   let balanceGoalNow = 7.58
// let balansPRGoalNow = "7.90%"
//    const createGoalRef = useRef(null);
//    const deleteGoalOld = useRef(null);
//    const finalGoal= useRef(null);
//    const infoFinalGoal = useRef(null);
//   const navigate = useNavigate();
// const [name, setName] = useState("");
// const [dollar, setDollar] = useState("");
// const [photo, setPhoto] = useState(null);
//  const GoalLendParent1 = useRef(null);
//  const GoalLendParent2 = useRef(null);
//  const GoalLendParent3 = useRef(null);
//  const kartaChildrenRef = useRef(null);
// useEffect(() => {
//   const container = kartaChildrenRef.current;

//   if (!container) return;

//   const middle =
//     container.children[Math.floor(container.children.length / 2)];

//   middle.scrollIntoView({
//     behavior: "auto",
//     inline: "center",
//   });
// }, []);

// const roadCrypto = () => {
//     navigate("/crypto");
//   };

// const roadHome = () => {
//     navigate("/");
//   };


// function HomeGoalPlusBtn1(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent1.current.style.transition = "opacity 0.6s";
//     GoalLendParent1.current.style.opacity = "1";
//     GoalLendParent1.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent1.current &&
//       !GoalLendParent1.current.contains(event.target)
//     ) {
//       GoalLendParent1.current.style.opacity = "0";
//       GoalLendParent1.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);



// function HomeGoalPlusBtn2(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent2.current.style.transition = "opacity 0.6s";
//     GoalLendParent2.current.style.opacity = "1";
//     GoalLendParent2.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent2.current &&
//       !GoalLendParent2.current.contains(event.target)
//     ) {
//       GoalLendParent2.current.style.opacity = "0";
//       GoalLendParent2.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);



// function HomeGoalPlusBtn3(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent3.current.style.transition = "opacity 0.6s";
//     GoalLendParent3.current.style.opacity = "1";
//     GoalLendParent3.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent.current &&
//       !GoalLendParent.current.contains(event.target)
//     ) {
//       GoalLendParent3.current.style.opacity = "0";
//       GoalLendParent3.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);





//  const GoalLendParent = useRef(null);
  


// function HomeGoalPlusBtn(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent.current.style.transition = "opacity 0.6s";
//     GoalLendParent.current.style.opacity = "1";
//     GoalLendParent.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent.current &&
//       !GoalLendParent.current.contains(event.target)
//     ) {
//       GoalLendParent.current.style.opacity = "0";
//       GoalLendParent.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);


// const fileRef = useRef(null);
// const [image, setImage] = useState(null);
// const [preview, setPreview] = useState(null);

// function openFilePicker() {
//   fileRef.current.click();
// }


// function inputNameFunc(e) {
//   setName(e.target.value);

// }

// function handleFileChange(e) {
//   const file = e.target.files[0];
//   if (file) {
//     setImage(URL.createObjectURL(file));
//   }
//     if (!file) return
//   setPhoto(file)
//   const  imageUrl = URL.createObjectURL(file)
//   setPreview(imageUrl)

// }
// const [amount, setAmount] = useState("");

// function handleChange(e) {
//   let numbers = e.target.value.replace(/\D/g, "");
//   setDollar(e.target.value);

//   if (numbers === "") {
//     setAmount("");
//     return;
//   }

//   let intPart = numbers.slice(0, -2);
//   if (intPart === "") intPart = "0";

//   let decimalPart = numbers.slice(-2);
//   if (decimalPart.length < 2) {
//     decimalPart = decimalPart.padStart(2, "0");
//   }

//   let formattedInt = Number(intPart).toLocaleString("en-US");

//   setAmount(formattedInt + "." + decimalPart);
// }

// const [activeButtons, setActiveButtons] = React.useState([]);

// function toggleButton(index) {
//   setActiveButtons(function(previousState) {
//     let newState = [];
//     let isAlreadyActive = false;

//     // Проверяем — есть ли уже эта кнопка в массиве
//     for (let i = 0; i < previousState.length; i++) {
//       if (previousState[i] === index) {
//         isAlreadyActive = true;
//       }
//     }

//     // Если кнопка уже активна — убираем её
//     if (isAlreadyActive === true) {
//       for (let i = 0; i < previousState.length; i++) {
//         if (previousState[i] !== index) {
//           newState.push(previousState[i]);
//         }
//       }

//       // Проверка — сколько активных осталось
//       const allThreeActive = newState.length === 3;
//       console.log("Все три кнопки активны?", allThreeActive);

//       return newState;
//     }

//     // Если уже 3 активных — больше не добавляем
//     if (previousState.length >= 3) {
//       console.log("Нельзя активировать больше 3 кнопок");
//       return previousState;
//     }

//     // Иначе добавляем новую кнопку
//     for (let i = 0; i < previousState.length; i++) {
//       newState.push(previousState[i]);
//     }

//     newState.push(index);

//     // Проверка — все 3 кнопки активны?
//     const allThreeActive = newState.length === 3;
//     console.log("три кнопки активны?", allThreeActive);

//     return newState;
//   });
// }

// function  createGoal(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent.current.style.opacity = "0";
//       GoalLendParent.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
//       deleteGoalOld.current.style.display = "none";
//      finalGoal.current.style.display = "flex";
//   }
// }


// console.log(name)
// console.log(dollar)




// function infoFinalGoalFunc(event) {
//   event.stopPropagation();
  
//   if (infoFinalGoal.current) {
//     infoFinalGoal.current.style.transition = "opacity 0.6s";
//     infoFinalGoal.current.style.opacity = "1";
//     infoFinalGoal.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       infoFinalGoal.current &&
//       !infoFinalGoal.current.contains(event.target)
//     ) {
//       infoFinalGoal.current.style.opacity = "0";
//       infoFinalGoal.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);


// useEffect(() => {
//   if (! createGoalRef.current) return;

//   if (name.trim() === "" || Number(amount) === 0 || activeButtons.length != 3) {
//      createGoalRef.current.style.pointerEvents = "none";
//      createGoalRef.current.style.opacity = "0.5"; // чтобы было видно что disabled
//   } else {
//      createGoalRef.current.style.pointerEvents = "auto";
//      createGoalRef.current.style.opacity = "1";
//   }
// }, [name, amount,activeButtons ]);




// const [historyList, setHistoryList] = useState([]);

// function historyAdd(historyName, historyPrice) {

//   const newHistoryItem = {
//     id: Date.now(),
//     name: historyName,
//     price: historyPrice
//   };

//   setHistoryList(function(prevHistory) {
//     return [...prevHistory, newHistoryItem];
//   });

// // }
// const curvLeftfRef = useRef(null);
// const curvRightfRef = useRef(null);
const cardRef = useRef(null);
const [activeTab, setActiveTab] = useState(0);

function handleTabChange(index) {
  setActiveTab(index);

  // if (cardRef.current) {
  //   if (index === 0) {
  //     
  //     cardRef.current.style.borderRadius = "35px 35px 35px 35px";
  //   } else {
  //     // При нажатии на Transactions (вторая кнопка)
  //     cardRef.current.style.borderRadius = "35px 35px 35px 35px";
  //   }
  // }


}


{/* <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><title>arrow-back</title><rect class="cls-1" width="0" height="0" /><path class="cls-2" d="M19,11H7.14l3.63-4.36A1,1,0,1,0,9.23,5.36l-5,6a1.19,1.19,0,0,0-.09.15c0,.05,0,.08-.07.13A1,1,0,0,0,4,12H4a1,1,0,0,0,.07.36c0,.05,0,.08.07.13a1.19,1.19,0,0,0,.09.15l5,6A1,1,0,0,0,10,19a1,1,0,0,0,.64-.23,1,1,0,0,0,.13-1.41L7.14,13H19a1,1,0,0,0,0-2Z"/></svg> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-back</title><rect class="cls-1" width="0" height="0" /><path class="cls-2" d="M19,11H7.14l3.63-4.36A1,1,0,1,0,9.23,5.36l-5,6a1.19,1.19,0,0,0-.09.15c0,.05,0,.08-.07.13A1,1,0,0,0,4,12H4a1,1,0,0,0,.07.36c0,.05,0,.08.07.13a1.19,1.19,0,0,0,.09.15l5,6A1,1,0,0,0,10,19a1,1,0,0,0,.64-.23,1,1,0,0,0,.13-1.41L7.14,13H19a1,1,0,0,0,0-2Z"/></svg> */}
{/* <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M12.5951 4.50716C12.8673 4.19494 13.3411 4.16249 13.6533 4.43468L19.4929 9.52559C19.7286 9.73108 19.812 10.0613 19.7023 10.3541C19.5926 10.6469 19.3127 10.8409 19 10.8409H5C4.58579 10.8409 4.25 10.5051 4.25 10.0909C4.25 9.67671 4.58579 9.34092 5 9.34092H16.9984L12.6676 5.56534C12.3554 5.29315 12.3229 4.81938 12.5951 4.50716Z" fill="black" fill-rule="evenodd"/><path clip-rule="evenodd" d="M11.4049 19.4928C11.1327 19.8051 10.6589 19.8375 10.3467 19.5653L4.50715 14.4744C4.27144 14.2689 4.18796 13.9387 4.29768 13.6459C4.40741 13.3531 4.68729 13.1591 5 13.1591L19 13.1591C19.4142 13.1591 19.75 13.4949 19.75 13.9091C19.75 14.3233 19.4142 14.6591 19 14.6591L7.00161 14.6591L11.3324 18.4347C11.6446 18.7069 11.6771 19.1806 11.4049 19.4928Z" fill="black" fill-rule="evenodd"/></svg> */}
{/* <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M12.5951 4.50716C12.8673 4.19494 13.3411 4.16249 13.6533 4.43468L19.4929 9.52559C19.7286 9.73108 19.812 10.0613 19.7023 10.3541C19.5926 10.6469 19.3127 10.8409 19 10.8409H5C4.58579 10.8409 4.25 10.5051 4.25 10.0909C4.25 9.67671 4.58579 9.34092 5 9.34092H16.9984L12.6676 5.56534C12.3554 5.29315 12.3229 4.81938 12.5951 4.50716Z" fill="black" fill-rule="evenodd"/><path clip-rule="evenodd" d="M11.4049 19.4928C11.1327 19.8051 10.6589 19.8375 10.3467 19.5653L4.50715 14.4744C4.27144 14.2689 4.18796 13.9387 4.29768 13.6459C4.40741 13.3531 4.68729 13.1591 5 13.1591L19 13.1591C19.4142 13.1591 19.75 13.4949 19.75 13.9091C19.75 14.3233 19.4142 14.6591 19 14.6591L7.00161 14.6591L11.3324 18.4347C11.6446 18.7069 11.6771 19.1806 11.4049 19.4928Z" fill="black" fill-rule="evenodd"/></svg> */}

return (
    
<div className="content"> 
  <div className="header">
    <h1 className="header-text">Wallet</h1>
{/* <div className="photo-account"> </div> */}
  </div>

  <div className="balance-parent">
    <h1 className="balance">$72.53</h1>
    <h5>wallet id: <span  className="span-copy-balance"  > 1927810028 </span>
</h5>
  </div>

  <div className="fast-func">
    <button className="fast-func-arrow"><span>send</span></button>
   
    <button className="fast-func-arrow-out"><span>get</span></button>
  
  <button className="fast-func-swap"><span>swap</span></button>

    <button className="fast-func-private"><span>block</span></button>
 
  </div>
<div className="active-parent">
    <div className="active">
   
<div className="active-lend">
<div className={"tabs-header " + (activeTab === 0 ? "tab-0-active" : "tab-1-active")}>
  {/* Твой активный остров, который ездит влево-вправо */}
<div className="active-tab-indicator">
  {/* Левый изгиб */}
  {/* <div className="curve curve-left" ref={curvLeftfRef}></div>
  
 
  <div className="curve curve-right" ref={curvRightfRef}></div> */}
</div>
  {/* <div className="active-tab-indicator-div"></div> */}
  <button 
    className={"tab-button " + (activeTab === 0 ? "active" : "")}
    onClick={() => handleTabChange(0)}
  >
  My Assets 
  </button>
  
  <button 
    className={"tab-button " + (activeTab === 1 ? "active" : "")}
    onClick={() => handleTabChange(1)}
  >
    My Transaction
  </button>
</div>
</div>
<div className="card-content" ref={cardRef}>
  {activeTab === 0 ? (
    <div className="fade-in">Assets Content...</div>
  ) : (
    <div className="fade-in">Transactions Content...</div>
  )}
</div>

        </div>
        </div>

   {/* <div>
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-narrow-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="red" d="M0 0h24v24H0z"/>
  <line x1="5" y1="12" x2="19" y2="12" />
  <line x1="5" y1="12" x2="9" y2="16" />
  <line x1="5" y1="12" x2="9" y2="8" />
</svg>
<div className="sidebar">
  <div className="sidebar-background"></div>
  
  <div className="sidebar-content" >
     <div className="Karta-home-div" ref={kartaChildrenRef}>

<button   className="Karta-home-button-1" onClick={HomeGoalPlusBtn1} >
  <h5 className="Karta-home-button-h5">xlavelia</h5> 
  <br />
  <h1 className="Karta-home-button-h1"> <span className="Karta-home-button-balance">$ 117.49</span><span className="Karta-home-button-span"> X </span> </h1>   
<br />

</button>


<button   className="Karta-home-button-2" onClick={HomeGoalPlusBtn2}>
  <h5 className="Karta-home-button-h5">xlavelia</h5> 
  <br />
  <h1 className="Karta-home-button-h1"> <span className="Karta-home-button-balance">$ 7.23</span><span className="Karta-home-button-span"> X </span> </h1>   
<br />

</button>

<button   className="Karta-home-button-3" onClick={HomeGoalPlusBtn3}>
  <h5 className="Karta-home-button-h5">xlavelia</h5> 
  <br />
  <h1 className="Karta-home-button-h1"> <span className="Karta-home-button-balance">$ 0.00</span><span className="Karta-home-button-span"> X </span> </h1>   
<br />

</button>


    </div>
  </div>
</div>

  

<div className="home-activ-goal-parent">
  <div className="home-activ-goal" ref={deleteGoalOld}>
    
    <div className="home-goal-text">
      <h1 className="home-goal-text-h1">Set a new goal</h1>
      <h3 className="home-goal-text-h3">Reach more goals</h3>
    </div>

    <button onClick={HomeGoalPlusBtn} className="home-goal-plus-btn">
      <div className="home-goal-plus-bg"></div>
      <svg className="home-goal-plus-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 20L12 12M12 12L12 4M12 12L20 12M12 12L4 12" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </button>


  </div>
</div>


<div className="home-activ-goal-final-parent" ref={finalGoal}>
<div className="home-activ-goal-final" onClick={infoFinalGoalFunc}>
{preview && (
  <img
  className="home-active-goal-photo"
    src={preview}
    alt="preview"
    width="150"
  />
)}
    <div className="home-goal-text-final">
      <h1 className="home-active-goal-name-final">{name}</h1>
      <h3 className="home-active-goal-dollars-final"> <span>{balansPRGoalNow}</span></h3>
 <div className="home-history-text-graf-grandparent-final">
    <div className="home-history-text-graf-parent-final">
        <div className="home-history-text-graf-final"></div>
        
    </div>
</div>

    </div>


</div>
</div>


<div className="home-history-parent"> <div className="home-history-content-div">
<button onClick={() => historyAdd("Netflix", "12.99$")}>
Добавить списание
</button>



    {historyList.map(function(historyItem) {

      return (

        <div className="home-history-content" key={historyItem.id}>
<div className="hauhwgsiws"></div>
          <div className="home-history-text">

            <h1 className="home-history-name">
              {historyItem.name}
            </h1>

            <h3 className="home-history-price">
            <span>   <svg fill="rgb(255, 0, 0)" width="2rem" height="2rem" className="home-out-history-svg" viewBox="-8.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
<title>+</title>
<path d="M0.84 20.040c-0.2 0-0.44-0.080-0.6-0.24-0.32-0.32-0.32-0.84 0-1.2l6.44-6.44c0.32-0.32 0.88-0.32 1.2 0l6.44 6.44c0.32 0.32 0.32 0.84 0 1.2-0.32 0.32-0.84 0.32-1.2 0l-5.84-5.84-5.84 5.84c-0.16 0.16-0.4 0.24-0.6 0.24z"></path>
</svg></span>{historyItem.price}
            </h3>

          </div>

        </div>

      );

    })}

  </div> </div>

<div className="lend-div">
<div className="lend">
<p  className="lend-wallet" onClick={roadHome} >wallet</p>

<svg width="" height="" className="lend-wallet" viewBox="0 0 24 24" fill="transparent" xmlns="http://www.w3.org/2000/svg">
<path d="M20 9.71429V6.28571C20 5.02335 19.1046 4 18 4H4C2.89543 4 2 5.02335 2 6.28571V17.7143C2 18.9767 2.89543 20 4 20H18C19.1046 20 20 18.9767 20 17.7143V14.2857M22 9.71429H16C14.8954 9.71429 14 10.7376 14 12C14 13.2624 14.8954 14.2857 16 14.2857H22V9.71429Z" stroke="" stroke-width="0.1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p className="lend-portfolio" onClick={roadCrypto}>crypto</p>


<h1  className="lend-seting">setting</h1>
</div>
</div>
</div>
<div ref={GoalLendParent}  className="goal-lend-parent"><div className="goal-lend-content">
<h1 className="start-goal-lend">Create a new Goal</h1>
  <div className="home-input"> 
<div className="file-wrapper" onClick={openFilePicker}>

  <input
    type="file"
    accept="image/*"
    ref={fileRef} className="photo-input"
    onChange={handleFileChange}
style={{
    position: "absolute",
    opacity: 0,
    width: "1px",
    height: "1px"
  }}

  />

  {image ? (
    <img src={image} alt="preview" />
  ) : (
 <svg className="home-lend-goal-svg" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 20L12 12M12 12L12 4M12 12L20 12M12 12L4 12" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
  )}
</div>
      <div className="home-input-div-parent">
    <div className="name-input-div"> 
      
      <input onChange={inputNameFunc}  className="name-input" type="text" value={name} placeholder="name" /></div> 
 

  <div className="dollar-input-div">
  <input
    type="text"
    value={amount}
    onChange={handleChange}
    inputMode="numeric"
    className="dollar-input"
    placeholder="0.00"
  />

  {amount !== "" && <span className="home-input-dollar-emj">$</span>}
</div>
</div>
  </div>

<div className="dollars">
  <button
  className="dollar"
  onClick={function() { toggleButton(1); }}
  style={{
    backgroundColor: activeButtons.indexOf(1) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(1) !== -1 ? "#ffffff" : "",
 

  }}
>
  1$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(2); }}
  style={{
 backgroundColor: activeButtons.indexOf(2) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(2) !== -1 ? "#ffffff" : "",
 

  }}
>
  3$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(3); }}
  style={{
 backgroundColor: activeButtons.indexOf(3) !== -1 ?" #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(3) !== -1 ? "#ffffff" : "",
 
  }}
>
  5$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(4); }}
  style={{
 backgroundColor: activeButtons.indexOf(4) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(4) !== -1 ? "#ffffff" : "",
 

  }}
>
  20$
</button>
 <div className="line-break"></div>
  <button
  className="dollar"
  onClick={function() { toggleButton(5); }}
  style={{
 backgroundColor: activeButtons.indexOf(5) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(5) !== -1 ? "#ffffff" : "",
 

  }}
>
  50$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(6); }}
  style={{
     backgroundColor: activeButtons.indexOf(6) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(6) !== -1 ? "#ffffff" : " ",
 

  }}
>
  100$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(7); }}
  style={{
    backgroundColor: activeButtons.indexOf(7) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(7) !== -1 ? "#ffffff" : "",
  }}
>
  250$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(8); }}
  style={{
 backgroundColor: activeButtons.indexOf(8) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(8) !== -1 ? "#ffffff" : "",
 

  }}
>
  500$
</button>


<div className="line-break"></div>
   
<button className="dollar-more">more</button>

</div>
<div className="end-goal-lend-parent"><button className="end-goal-lend" onClick={createGoal} ref={createGoalRef}>CREATE</button></div>

  </div>
  </div>

<div  ref={infoFinalGoal} className="info-goal-final-parent"><div className="info-goal-final"><p>RRRRRRwnnnnnnnwheRRRRRRR</p></div></div>
<div  ref={GoalLendParent1} className="karta-lend-parent-1"><div className="karta-lend-content-1"><p>RRRRRR1RRRRRRR</p></div></div>
<div  ref={GoalLendParent2} className="karta-lend-parent-2"><div className="karta-lend-content-2"><p>RRRRRRRRR2RRRR</p></div></div>
<div  ref={GoalLendParent3}  className="karta-lend-parent-3"><div className="karta-lend-content-3"><p>RRR3RRRRRRRRRR</p></div></div>
   */}   </div>
  );
}
export default Home;