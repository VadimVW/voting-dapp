import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import "./VotingPage.css";
import {
  loginAndInitWallet,
  getStoredWallet,
} from "./AuthService";

// UI-компоненти
import { CheckSquareSize16 } from "./assets/CheckSquareSize16/CheckSquareSize16.jsx";
import { StarSize16        } from "./assets/StarSize16/StarSize16.jsx";
import { ButtonVariantPrimaryStateDefaultSizeSmall }
  from "./assets/ButtonVariantPrimaryStateDefaultSizeSmall/ButtonVariantPrimaryStateDefaultSizeSmall.jsx";

const API_URL = "http://localhost:4000";

// Список кандидатів
const candidates = [
  { 
    key: "Alice",
    label: "Кандидат 1",
    img: `${process.env.PUBLIC_URL}/assets/candidate1.png`
  },
  { 
    key: "Bob",
    label: "Кандидат 2",
    img: `${process.env.PUBLIC_URL}/assets/candidate1.png`
  },
  { 
    key: "Charlie",
    label: "Кандидат 3",
    img: `${process.env.PUBLIC_URL}/assets/candidate1.png`
  },
];

export default function VotingPage() {
  const [wallet, setWallet] = useState(null);
  const [nonce,  setNonce]  = useState(0);
  const [votes,  setVotes]  = useState({});
  const [status, setStatus] = useState("");
  const [busy,   setBusy]   = useState(false);

  // 1) Авторизація + отримуємо nonce + одразу підтягуємо результати
  useEffect(() => {
    (async () => {
      let w = getStoredWallet();
      if (!w) {
        try {
          w = await loginAndInitWallet();
        } catch {
          setStatus("❌ Не вдалося авторизуватися");
          return;
        }
      }
      setWallet(w);

      // запит nonce
      const r1 = await fetch(`${API_URL}/nonce/${w.address}`);
      const { nonce } = await r1.json();
      setNonce(nonce);

      fetchResults();
    })();
  }, []);

  // 2) Отримання результатів голосування
  async function fetchResults() {
    try {
      const resp = await fetch(`${API_URL}/results`);
      const data = await resp.json();
      const map = {};
      data.forEach(({ name, votes }) => map[name] = votes);
      setVotes(map);
    } catch (e) {
      console.error(e);
      setStatus("❌ Помилка завантаження результатів");
    }
  }

  // 3) Відправка голосу
  async function handleVote(candidate) {
    setBusy(true);
    setStatus("🔏 Підпис повідомлення…");
    try {
      // хешуємо так само, як у контракті
      const hash = ethers.solidityPackedKeccak256(
        ["string","address","uint256"],
        [candidate, wallet.address, nonce]
      );
      // підписуємо
      const signature = await wallet.signMessage(ethers.getBytes(hash));

      setStatus("📡 Надсилання голосу…");
      const resp = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate,
          signer: wallet.address,
          nonce,
          signature
        })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error);

      setStatus(`✅ Голос отримано, txHash: ${json.txHash}`);
      setNonce(nonce + 1);
      await fetchResults();
    } catch (err) {
      console.error(err);
      setStatus(`❌ Помилка: ${err.reason || err.message}`);
    } finally {
      setBusy(false);
    }
  }

  // якщо ще не авторизовані — прелоадер
  if (!wallet) {
    return <div className="voting-page">Авторизація…</div>;
  }

  return (
    <div className="voting-page ">
      <div className="tablet-mobile-version">
        <div className="wrapper">
          <div className="navbar">
            <div className="logo">
              <svg
                className="frame"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6_902)">
                  <path
                    d="M2.78271 2.78322L2.78325 2.78268C3.98531 1.57787 5.51607 0.9606 7.64304 0.64821C9.78131 0.33416 12.4801 0.333344 15.9971 0.333344C19.5141 0.333344 22.213 0.334153 24.3521 0.647504C26.4797 0.95918 28.0121 1.57506 29.2171 2.77714C30.4221 3.98218 31.0394 5.51458 31.3518 7.64228C31.6659 9.78128 31.6667 12.4801 31.6667 15.9971C31.6667 19.5141 31.6659 22.2129 31.3518 24.3519C31.0394 26.4796 30.4221 28.012 29.2171 29.2171C28.0121 30.4221 26.4783 31.0394 24.3498 31.3518C22.2101 31.6659 19.5113 31.6667 15.9971 31.6667C12.483 31.6667 9.78421 31.6659 7.64521 31.3518C5.51744 31.0394 3.98524 30.4221 2.78325 29.2173L2.78298 29.2171C1.57799 28.0121 0.960651 26.4783 0.648244 24.3498C0.334187 22.21 0.333374 19.5112 0.333374 15.9971C0.333374 12.483 0.334187 9.78418 0.648244 7.64518C0.960647 5.51741 1.57795 3.98521 2.78271 2.78322Z"
                    stroke="black"
                    strokeWidth="2"
                  />
                  <path
                    d="M15.3104 26.2827C14.161 25.4062 13.3133 24.0988 13.0403 22.5758H9.33337V6.55567C11.3305 7.54704 12.7529 9.74534 12.9253 12.0154L13.4857 16.5126L13.2127 16.4695C12.6092 16.4695 12.092 17.0298 12.092 17.5901C12.092 18.1074 12.4943 18.5528 13.0115 18.6677L13.6868 18.8258C14.8075 16.7137 15.4397 14.6447 15.4397 12.6045C15.4397 10.7654 15.1954 8.94074 15.1667 7.07291C15.1667 6.23957 15.4828 5.47807 16 4.88901C16.5173 5.49244 16.8334 6.23957 16.8334 7.07291C16.8334 8.94074 16.5604 10.7798 16.5604 12.6045C16.5604 14.6304 17.1926 16.7137 18.3133 18.8258L18.9885 18.6677C19.5058 18.5528 19.9081 18.1074 19.9081 17.5901C19.9081 17.0298 19.3908 16.4695 18.7874 16.4695L18.5144 16.5126L19.0747 12.0154C19.3477 9.74534 20.6696 7.54704 22.6667 6.55567V22.5758H18.9598C18.6868 24.0844 17.8822 25.4493 16.6897 26.2827C16.4167 26.4838 16.1724 26.7281 16.0144 27.0442C15.8276 26.7137 15.5834 26.4838 15.3104 26.2827ZM11.0862 17.0442C11.2443 16.4407 11.6897 15.9235 12.2357 15.6074L11.7903 11.9005C11.6322 10.7511 11.1581 9.71661 10.4397 8.86887V17.0298H11.0862V17.0442ZM12.9684 21.4551C12.9684 20.8947 13.0546 20.3775 13.1696 19.8603L12.6523 19.7453C11.8908 19.5011 11.3018 18.912 11.1006 18.1505H10.4684V21.4551H12.9684ZM15.4253 21.4551C15.4253 20.7798 14.9081 20.1764 14.2328 20.1045C14.1179 20.5355 14.0316 20.981 14.0316 21.4551H15.4253ZM15.4253 22.5758H14.1897C14.3908 23.4522 14.8219 24.2424 15.4253 24.9321V22.5758ZM17.1782 19.1131C16.7041 18.2367 16.2587 17.3172 15.9857 16.3689C15.7127 17.3315 15.2673 18.2367 14.7931 19.1131C15.2673 19.2281 15.6696 19.5442 15.9857 19.9034C16.3018 19.5442 16.7041 19.2281 17.1782 19.1131ZM17.9397 21.4551C17.9397 20.981 17.8535 20.5355 17.7385 20.1045C17.0633 20.1907 16.546 20.7798 16.546 21.4551H17.9397ZM17.7816 22.5758H16.546V24.9321C17.1495 24.2424 17.5805 23.4522 17.7816 22.5758ZM21.5316 21.4551V18.1505H20.8995C20.6983 18.912 20.1092 19.5011 19.3477 19.7453L18.8305 19.8603C18.9454 20.3775 19.0316 20.8947 19.0316 21.4551H21.5316ZM21.5316 17.0442V8.88327C20.8133 9.71661 20.296 10.7511 20.1811 11.9149L19.7357 15.6218C20.296 15.9378 20.727 16.4551 20.8851 17.0585H21.5316V17.0442Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_902">
                    <rect width="32" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div className="frame-20">
                <svg
                  className="clip-path-group"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_6_906"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="32"
                    height="32"
                  >
                    <path d="M32 0H0V32H32V0Z" fill="white" />
                  </mask>
                  <g mask="url(#mask0_6_906)">
                    <path
                      d="M16 32C7.04 32 4.6277 31.5471 2.54031 29.4597C0.443077 27.3575 0 24.96 0 16C0 7.04 0.452923 4.64247 2.54031 2.54031C4.6277 0.452923 7.04 0 16 0C24.96 0 27.3723 0.452923 29.4597 2.54031C31.5569 4.64247 32 7.04 32 16C32 24.96 31.5569 27.3575 29.4597 29.4597C27.3723 31.5471 24.96 32 16 32Z"
                      fill="black"
                    />
                    <mask
                      id="mask1_6_906"
                      style={{ maskType: "alpha" }}
                      maskUnits="userSpaceOnUse"
                      x="3"
                      y="13"
                      width="26"
                      height="6"
                    >
                      <path
                        d="M5.28651 17.6823C5.78127 17.6823 6.14587 17.4089 6.32817 16.9531L7.04431 17.2005C6.80991 17.9297 6.13284 18.3463 5.28651 18.3463C4.12764 18.3463 3.33337 17.5261 3.33337 16.3281C3.33337 15.1302 4.12764 14.3099 5.28651 14.3099C6.13284 14.3099 6.80991 14.7266 7.04431 15.4557L6.32817 15.7031C6.14587 15.2474 5.78127 14.974 5.28651 14.974C4.66151 14.974 4.24484 15.3646 4.12764 15.9766H5.78127V16.6016H4.11461C4.20577 17.2656 4.63544 17.6823 5.28651 17.6823ZM11.3021 13.3333V14.0885H8.81514V18.2813H7.99481V13.3333H11.3021ZM12.9688 18.3463C11.7709 18.3463 10.9896 17.5521 10.9896 16.3281C10.9896 15.1302 11.7969 14.3099 12.9688 14.3099C14.1667 14.3099 14.9479 15.1042 14.9479 16.3281C14.9479 17.5261 14.1406 18.3463 12.9688 18.3463ZM12.9688 17.6823C13.6849 17.6823 14.1537 17.1485 14.1537 16.3281C14.1537 15.5078 13.6849 14.974 12.9688 14.974C12.2526 14.974 11.7839 15.5078 11.7839 16.3281C11.7839 17.1485 12.2526 17.6823 12.9688 17.6823ZM19.1537 14.375V18.2813H18.3724V15.0651H16.7578V16.4714C16.7578 17.8906 16.4584 18.3073 15.7031 18.3073C15.5599 18.3073 15.4297 18.2943 15.3386 18.2813V17.5651H15.5469C15.8854 17.5651 15.9896 17.474 15.9896 16.3932V14.375H19.1537ZM22.0703 18.3463C20.8724 18.3463 20.0912 17.5521 20.0912 16.3281C20.0912 15.1302 20.8985 14.3099 22.0703 14.3099C23.2682 14.3099 24.0495 15.1042 24.0495 16.3281C24.0495 17.5261 23.2422 18.3463 22.0703 18.3463ZM22.0703 17.6823C22.7865 17.6823 23.2552 17.1485 23.2552 16.3281C23.2552 15.5078 22.7865 14.974 22.0703 14.974C21.3542 14.974 20.8854 15.5078 20.8854 16.3281C20.8854 17.1485 21.3542 17.6823 22.0703 17.6823ZM26.6537 18.3463C25.4948 18.3463 24.7005 17.5261 24.7005 16.3281C24.7005 15.1302 25.4948 14.3099 26.6537 14.3099C27.5 14.3099 28.1771 14.7396 28.3985 15.4818L27.6563 15.7161C27.487 15.2604 27.1354 14.974 26.6537 14.974C25.9375 14.974 25.4948 15.5078 25.4948 16.3281C25.4948 17.1485 25.9375 17.6823 26.6537 17.6823C27.1224 17.6823 27.487 17.3958 27.6563 16.9401L28.3985 17.1745C28.1771 17.9167 27.487 18.3463 26.6537 18.3463Z"
                        fill="black"
                      />
                    </mask>
                    <g mask="url(#mask1_6_906)">
                      <path
                        d="M28.6745 13.2813H3.00781V18.6146H28.6745V13.2813Z"
                        fill="white"
                      />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
            <div className="navbar-icon">
              <svg
                className="menu-icon"
                // width="820"
                // height="32"
                viewBox="800 6 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M800 6H820V9.33333H800V6ZM800 14.3333H820V17.6667H800V14.3333ZM820 22.6667H800V26H820V22.6667Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
          <div className="line-wrapper">
            <svg
              className="line"
              viewBox="0 0 100 1"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0"
                y1="0.5"
                x2="100"
                y2="0.5"
                stroke="black"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="content">
            <div className="tablet-mobile-heading">Електронне голосування </div>
            <div className="tablet-mobile-tile-sector">
              <div className="wrapper2">
                <div className="rows">
                  {candidates.map(({ key, label, img }) => (
                    <div key={key} className="_1">
                      <img
                        className="candidate-img"
                        src={img}
                        alt={label}
                      />
                      <div className={
                          key === "Alice" ? "frame-18"
                        : key === "Bob"   ? "frame-19"
                        :                   "frame-16"
                      }>
                        <div className={
                            key === "Alice" ? "_12"
                          : key === "Bob"   ? "_22"
                          :                   "_32"
                        }>
                          {label}
                        </div>
                      </div>
                      <div className={
                          key === "Alice" ? "frame-21"
                        : key === "Bob"   ? "frame-22"
                        :                   "frame-23"
                      }>
                        <div className="font-thin">
                          Голосів: {votes[key] || 0}
                        </div>
                        <ButtonVariantPrimaryStateDefaultSizeSmall
                          onClick={() => handleVote(key)}
                          label="Голосувати"
                          iconStart={<StarSize16 className="star-instance" size={16} />}
                          iconEnd={<CheckSquareSize16 className="check-square-instance" size={16} />}
                          hasIconEnd
                          size="small"
                          className="button-instance"
                          disabled={busy}
                        />
                      </div>
                    </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="status">
            {status && (
              <div className="status-message">
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="desktop-version">
        <div className="wrapper">
          <div className="navbar">
                    <div className="logo">
                      <svg
                        className="frame"
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_6_969)">
                          <path
                            d="M4.17401 4.17481L4.17481 4.174C5.9779 2.36679 8.27405 1.44089 11.4645 0.9723C14.6719 0.501225 18.7201 0.5 23.9956 0.5C29.2711 0.5 33.3195 0.501215 36.528 0.97124C39.7195 1.43875 42.0181 2.36257 43.8256 4.1657C45.6331 5.97325 46.5591 8.27185 47.0277 11.4634C47.4988 14.6719 47.5 18.7201 47.5 23.9956C47.5 29.2712 47.4988 33.3194 47.0277 36.5279C46.5591 39.7195 45.6331 42.018 43.8256 43.8256C42.0181 45.6331 39.7174 46.5591 36.5247 47.0277C33.3151 47.4988 29.2668 47.5 23.9956 47.5C18.7244 47.5 14.6762 47.4988 11.4677 47.0277C8.2761 46.5591 5.9778 45.6332 4.17481 43.826L4.17441 43.8256C2.36692 42.0181 1.44091 39.7174 0.972305 36.5247C0.50122 33.3151 0.5 29.2668 0.5 23.9956C0.5 18.7244 0.50122 14.6762 0.972305 11.4677C1.44091 8.2761 2.36687 5.9778 4.17401 4.17481Z"
                            stroke="black"
                            strokeWidth="2"
                          />
                          <path
                            d="M22.9655 39.424C21.2414 38.1093 19.9699 36.1481 19.5604 33.8636H14V9.8335C16.9957 11.3205 19.1293 14.618 19.388 18.0231L20.2285 24.7688L19.819 24.7042C18.9138 24.7042 18.138 25.5447 18.138 26.3852C18.138 27.1611 18.7414 27.8292 19.5173 28.0016L20.5301 28.2386C22.2112 25.0705 23.1595 21.9671 23.1595 18.9067C23.1595 16.1481 22.7931 13.4111 22.75 10.6093C22.75 9.35935 23.2241 8.2171 24 7.3335C24.7759 8.23865 25.25 9.35935 25.25 10.6093C25.25 13.4111 24.8405 16.1697 24.8405 18.9067C24.8405 21.9455 25.7888 25.0705 27.4699 28.2386L28.4827 28.0016C29.2586 27.8292 29.862 27.1611 29.862 26.3852C29.862 25.5447 29.0862 24.7042 28.181 24.7042L27.7715 24.7688L28.612 18.0231C29.0215 14.618 31.0043 11.3205 34 9.8335V33.8636H28.4396C28.0301 36.1266 26.8232 38.174 25.0345 39.424C24.625 39.7257 24.2586 40.0921 24.0215 40.5662C23.7414 40.0705 23.375 39.7257 22.9655 39.424ZM16.6293 25.5662C16.8664 24.6611 17.5345 23.8852 18.3535 23.4111L17.6854 17.8507C17.4483 16.1266 16.7371 14.5749 15.6595 13.3033V25.5447H16.6293V25.5662ZM19.4526 32.1826C19.4526 31.3421 19.5819 30.5662 19.7543 29.7904L18.9785 29.618C17.8362 29.2516 16.9526 28.368 16.6509 27.2257H15.7026V32.1826H19.4526ZM23.138 32.1826C23.138 31.1697 22.3621 30.2645 21.3491 30.1567C21.1767 30.8033 21.0474 31.4714 21.0474 32.1826H23.138ZM23.138 33.8636H21.2845C21.5862 35.1783 22.2328 36.3636 23.138 37.3981V33.8636ZM25.7673 28.6697C25.0561 27.355 24.388 25.9757 23.9785 24.5533C23.569 25.9973 22.9008 27.355 22.1896 28.6697C22.9008 28.8421 23.5043 29.3162 23.9785 29.855C24.4526 29.3162 25.0561 28.8421 25.7673 28.6697ZM26.9095 32.1826C26.9095 31.4714 26.7801 30.8033 26.6077 30.1567C25.5948 30.2861 24.819 31.1697 24.819 32.1826H26.9095ZM26.6724 33.8636H24.819V37.3981C25.7242 36.3636 26.3707 35.1783 26.6724 33.8636ZM32.2974 32.1826V27.2257H31.3491C31.0474 28.368 30.1638 29.2516 29.0215 29.618L28.2457 29.7904C28.4181 30.5662 28.5474 31.3421 28.5474 32.1826H32.2974ZM32.2974 25.5662V13.3249C31.2199 14.5749 30.4439 16.1266 30.2715 17.8723L29.6035 23.4326C30.444 23.9067 31.0905 24.6826 31.3276 25.5878H32.2974V25.5662Z"
                            fill="black"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_6_969">
                            <rect width="48" height="48" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="frame-20">
                        <svg
                          className="clip-path-group"
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_6_973"
                            style={{ maskType: "luminance" }}
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="48"
                            height="48"
                          >
                            <path d="M48 0H0V48H48V0Z" fill="white" />
                          </mask>
                          <g mask="url(#mask0_6_973)">
                            <path
                              d="M24 48C10.56 48 6.94155 47.3206 3.81046 44.1895C0.664615 41.0363 0 37.44 0 24C0 10.56 0.679385 6.9637 3.81046 3.81046C6.94155 0.679385 10.56 0 24 0C37.44 0 41.0584 0.679385 44.1895 3.81046C47.3354 6.9637 48 10.56 48 24C48 37.44 47.3354 41.0363 44.1895 44.1895C41.0584 47.3206 37.44 48 24 48Z"
                              fill="black"
                            />
                            <mask
                              id="mask1_6_973"
                              style={{ maskType: "alpha" }}
                              maskUnits="userSpaceOnUse"
                              x="5"
                              y="20"
                              width="38"
                              height="8"
                            >
                              <path
                                d="M7.9297 26.5235C8.67185 26.5235 9.21875 26.1133 9.4922 25.4297L10.5664 25.8008C10.2148 26.8945 9.1992 27.5195 7.9297 27.5195C6.1914 27.5195 5 26.2891 5 24.4922C5 22.6954 6.1914 21.4648 7.9297 21.4648C9.1992 21.4648 10.2148 22.0898 10.5664 23.1836L9.4922 23.5547C9.21875 22.8711 8.67185 22.461 7.9297 22.461C6.9922 22.461 6.3672 23.0469 6.1914 23.9648H8.67185V24.9023H6.17185C6.3086 25.8984 6.9531 26.5235 7.9297 26.5235ZM16.9531 20V21.1328H13.2226V27.4219H11.9922V20H16.9531ZM19.4531 27.5195C17.6562 27.5195 16.4844 26.3282 16.4844 24.4922C16.4844 22.6954 17.6953 21.4648 19.4531 21.4648C21.25 21.4648 22.4219 22.6563 22.4219 24.4922C22.4219 26.2891 21.2109 27.5195 19.4531 27.5195ZM19.4531 26.5235C20.5273 26.5235 21.2304 25.7227 21.2304 24.4922C21.2304 23.2618 20.5273 22.461 19.4531 22.461C18.3789 22.461 17.6758 23.2618 17.6758 24.4922C17.6758 25.7227 18.3789 26.5235 19.4531 26.5235ZM28.7304 21.5625V27.4219H27.5586V22.5977H25.1367V24.7071C25.1367 26.836 24.6875 27.461 23.5546 27.461C23.3398 27.461 23.1445 27.4414 23.0078 27.4219V26.3477H23.3203C23.8281 26.3477 23.9844 26.2109 23.9844 24.5898V21.5625H28.7304ZM33.1054 27.5195C31.3086 27.5195 30.1367 26.3282 30.1367 24.4922C30.1367 22.6954 31.3477 21.4648 33.1054 21.4648C34.9023 21.4648 36.0742 22.6563 36.0742 24.4922C36.0742 26.2891 34.8632 27.5195 33.1054 27.5195ZM33.1054 26.5235C34.1796 26.5235 34.8828 25.7227 34.8828 24.4922C34.8828 23.2618 34.1796 22.461 33.1054 22.461C32.0312 22.461 31.3281 23.2618 31.3281 24.4922C31.3281 25.7227 32.0312 26.5235 33.1054 26.5235ZM39.9804 27.5195C38.2421 27.5195 37.0508 26.2891 37.0508 24.4922C37.0508 22.6954 38.2421 21.4648 39.9804 21.4648C41.25 21.4648 42.2656 22.1094 42.5976 23.2227L41.4843 23.5742C41.2304 22.8906 40.7031 22.461 39.9804 22.461C38.9062 22.461 38.2421 23.2618 38.2421 24.4922C38.2421 25.7227 38.9062 26.5235 39.9804 26.5235C40.6836 26.5235 41.2304 26.0938 41.4843 25.4102L42.5976 25.7617C42.2656 26.875 41.2304 27.5195 39.9804 27.5195Z"
                                fill="black"
                              />
                            </mask>
                            <g mask="url(#mask1_6_973)">
                              <path
                                d="M43.0117 19.9219H4.51172V27.9219H43.0117V19.9219Z"
                                fill="white"
                              />
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className="navbar-items">
                      <div className="div"><Link to="/">Голосування</Link> </div>
                      <div className="div"><Link to="/blocks">Інспектор блоків</Link> </div>
                      <div className="div"><Link to="/simulate">Симуляція</Link> </div>
                    </div>
          </div>
          <div className="line-wrapper">
                    <svg
                      className="line"
                      viewBox="0 0 100 1"
                      preserveAspectRatio="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="0"
                        y1="0.5"
                        x2="100"
                        y2="0.5"
                        stroke="black"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
          </div>
          <div className="content">
            <div className="desktop-heading">Електронне голосування </div>
            <div className="desktop-tile-sector">
              <div className="wrapper2">
                <div className="rows">
                  {candidates.map(({ key, label, img }) => (
                    <div key={key} className="_1">
                      <img
                        className="candidate-img"
                        src={img}
                        alt={label}
                      />
                      <div className={
                          key === "Alice" ? "frame-18"
                        : key === "Bob"   ? "frame-19"
                        :                   "frame-16"
                      }>
                        <div className={
                            key === "Alice" ? "_12"
                          : key === "Bob"   ? "_22"
                          :                   "_32"
                        }>
                          {label}
                        </div>
                      </div>
                      <div className={
                          key === "Alice" ? "frame-21"
                        : key === "Bob"   ? "frame-22"
                        :                   "frame-23"
                      }>
                        <div className="div4">
                          Голосів: {votes[key] || 0}
                        </div>
                        <ButtonVariantPrimaryStateDefaultSizeSmall
                          onClick={() => handleVote(key)}
                          label="Голосувати"
                          iconStart={<StarSize16 className="star-instance" size={16} />}
                          iconEnd={<CheckSquareSize16 className="check-square-instance" size={16} />}
                          hasIconEnd
                          size="small"
                          className="button-instance"
                          disabled={busy}
                        />
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="status">
            {status && (
              <div className="status-message">
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}