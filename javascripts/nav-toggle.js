document$.subscribe(function () {
  var button = document.createElement("button");
  button.className = "nav-toggle";
  button.title = "Скрыть/показать меню";

  function sync() {
    var hidden = document.documentElement.classList.contains("nav-hidden");
    button.innerHTML = hidden ? "☰" : "✕";
  }

  button.addEventListener("click", function () {
    var hidden = document.documentElement.classList.toggle("nav-hidden");
    localStorage.setItem("nav-hidden", hidden ? "true" : "false");
    sync();
  });

  sync();
  document.body.appendChild(button);
});
