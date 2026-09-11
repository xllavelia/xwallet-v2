function navigateP2P(navigate, path, options) {
  var state = (options && options.state) || undefined;
  var currentPath = window.location.pathname;

  function step() {
    if (path !== "/p2p") {
      navigate("/p2p");
      setTimeout(function () {
        navigate(path, { state: state });
      }, 0);
    } else {
      navigate("/p2p", { state: state });
    }
  }

  if (currentPath === "/") {
    step();
  } else {
    navigate("/");
    setTimeout(step, 0);
  }
}

export { navigateP2P };