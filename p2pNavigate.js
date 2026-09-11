function navigateP2P(navigate, path, options) {
  var state = (options && options.state) || undefined;

  if (path === "/p2p") {
    // Прямой заход в сам хаб — тоже должен идти через Home, чтобы "назад" из хаба вёл домой.
    navigate("/", { replace: false });
    setTimeout(function () {
      navigate("/p2p", { state: state });
    }, 0);
    return;
  }

  // Любой другой /p2p/* экран: Home -> P2PMarket -> целевой экран.
  // Три отдельных push'а в историю дают ровно нужную цепочку без replace.
  navigate("/");
  setTimeout(function () {
    navigate("/p2p");
    setTimeout(function () {
      navigate(path, { state: state });
    }, 0);
  }, 0);
}

export { navigateP2P };