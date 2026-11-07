function selectTabFromHash() {
  if (window.location.hash === "#signup-form") {
    document.getElementById("tab-signup").checked = true;
  }
}

selectTabFromHash();
window.addEventListener("hashchange", selectTabFromHash);