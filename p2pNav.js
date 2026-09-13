// Плоский список всех P2P-модулей и функция для навигации "вперёд через Home"
// и "назад на 2 шага" (Home -> P2PMarket).

var P2P_ROUTES = ["/p2p", "/p2pbrowse", "/p2plisting", "/p2pdeal", "/p2pmerchant", "/p2pcreatelisting", "/p2pdeals"];

// Вызывай для входа В МОДУЛЬ P2P снаружи (например с Home или Services).
// Всегда идёт Home -> /p2p, независимо от того, где юзер был раньше.
function enterP2P(navigate) {
  navigate("/");
  setTimeout(function () {
    navigate("/p2p");
  }, 0);
}

// Вызывай для перехода С p2pmarket НА любой другой P2P-экран (merchant, deals, browse...).
// Всегда идёт Home -> targetPath, поверх уже существующей записи "/p2p" в истории.
function goToP2PModule(navigate, path, state) {
  navigate("/");
  setTimeout(function () {
    navigate(path, { state: state });
  }, 0);
}

// Кнопка "назад" внутри /p2p (главный хаб) -> просто на Home, один шаг.
function backFromP2PHub(navigate) {
  navigate(-1);
}

// Кнопка "назад" на любом дочернем P2P-экране (merchant, deals, browse, listing, deal, create)
// -> два шага назад, что при цепочке Home -> target приведёт на Home,
// а следующий системный "назад" с Home на самом деле обычно уже вне модуля.
// Раз ты хочешь именно "Home -> P2PMarket", а не просто "Home" -
// делаем явный переход через p2pmarket вместо чистого -2.
function backToP2PMarket(navigate) {
  navigate("/");
  setTimeout(function () {
    navigate("/p2p");
  }, 0);
}

export { P2P_ROUTES, enterP2P, goToP2PModule, backFromP2PHub, backToP2PMarket };