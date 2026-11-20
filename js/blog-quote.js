// Draggable paper quote card in the blog hero.
(() => {
  const stage = document.getElementById("blog-quote-stage");
  const card = document.getElementById("blog-quote-card");
  if (!stage || !card) return;
  let drag = null;
  let z = 10;
  const read = name => parseFloat(getComputedStyle(card).getPropertyValue(name)) || 0;

  stage.addEventListener("pointerdown", event => {
    if ((event.button !== undefined && event.button !== 0) || event.target.closest("a,button")) return;
    if (!event.target.closest(".blog-quote-card")) return;
    drag = {
      id:event.pointerId, x:event.clientX, y:event.clientY,
      ox:read("--drag-x"), oy:read("--drag-y"), moved:false
    };
    card.classList.add("is-dragging");
    card.style.zIndex = String(++z);
    try { stage.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  });
  stage.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy)>3) drag.moved=true;
    card.style.setProperty("--drag-x",(drag.ox+dx)+"px");
    card.style.setProperty("--drag-y",(drag.oy+dy)+"px");
  });
  const finish = event => {
    if (!drag || drag.id !== event.pointerId) return;
    drag=null;
    card.classList.remove("is-dragging");
    try { if(stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId); } catch (_) {}
  };
  ["pointerup","pointercancel","lostpointercapture"].forEach(name=>stage.addEventListener(name,finish));
  stage.addEventListener("dragstart",event=>{ if(event.target.closest(".blog-quote-card")) event.preventDefault(); });
})();
