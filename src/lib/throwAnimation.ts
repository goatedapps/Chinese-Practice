// Animates a clone of an item's icon flying from one element to another (a
// Shop item card into the bag indicator, or a Bag item card onto the owl
// art), then invokes onArrive once it lands. The flying element lives
// outside React's tree (appended straight to document.body) so a re-render
// triggered by onArrive can't interrupt it mid-flight.
export function flyItemTo(sourceEl: HTMLElement, targetEl: HTMLElement, iconSrc: string, onArrive: () => void): void {
  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const flying = document.createElement("div");
  flying.className = "flying-item";
  const icon = document.createElement("img");
  icon.src = iconSrc;
  icon.alt = "";
  flying.appendChild(icon);
  flying.style.left = `${startX}px`;
  flying.style.top = `${startY}px`;
  flying.style.setProperty("--dx", `${endX - startX}px`);
  flying.style.setProperty("--dy", `${endY - startY}px`);
  document.body.appendChild(flying);

  let landed = false;
  const land = () => {
    if (landed) return;
    landed = true;
    flying.remove();
    onArrive();
  };
  flying.addEventListener("animationend", land);
  requestAnimationFrame(() => flying.classList.add("flying-item-animate"));
  setTimeout(land, 900); // safety fallback if animationend doesn't fire
}
