(() => {
 const root=document.getElementById("hero-project-preview"); if(!root)return;
 const safe=v=>{const u=String(v||"").trim();return /^https?:\/\//i.test(u)||/^\/(media|assets)\//i.test(u)?u:"";};
 function cardFor(p){
  const card=document.createElement("article");card.className="floating-project";
  card.style.setProperty("--tilt","-3deg");card.style.setProperty("--float-delay","-1.2s");card.style.setProperty("--card-width","340px");
  const handle=document.createElement("div");handle.className="project-drag-handle mono";handle.title="Drag to move";handle.setAttribute("aria-label","Drag "+p.title+" card");
  handle.append(document.createTextNode("↕ "));const move=document.createElement("span");move.textContent="MOVE CARD";const num=document.createElement("span");num.textContent="01";handle.append(move,num);
  const img=document.createElement("img");img.className="floating-project-image";img.src=safe(p.image);img.alt=p.title;img.draggable=false;img.decoding="async";img.loading="eager";img.fetchPriority="high";
  const info=document.createElement("div");info.className="floating-project-info";const cat=document.createElement("p");cat.className="mono";cat.textContent=p.category||"";
  const title=document.createElement("h3");title.textContent=p.title||"Untitled project";const bottom=document.createElement("div");bottom.className="floating-project-bottom";
  const year=document.createElement("span");year.className="mono";year.textContent=p.year||"";bottom.append(year);
  const href=safe(p.link);if(href){const a=document.createElement("a");a.className="floating-open mono";a.href=href;a.textContent="open ↗";a.target="_blank";a.rel="noopener";bottom.append(a);}
  info.append(cat,title,bottom);card.append(handle,img,info);return card;
 }
 fetch("data/projects.json?v=20261120",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Projects unavailable");return r.json();}).then(list=>{
  if(!Array.isArray(list))throw Error("Invalid projects");const p=list.filter(x=>x&&x.visible!==false&&x.title&&safe(x.image)).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0))[0];if(p)root.replaceChildren(cardFor(p));
 }).catch(e=>console.warn("Featured project could not load:",e));
 let drag=null,z=10;const val=(c,n)=>parseFloat(getComputedStyle(c).getPropertyValue(n))||0;
 root.addEventListener("pointerdown",e=>{if((e.button!==undefined&&e.button!==0)||e.target.closest("a,button"))return;const c=e.target.closest(".floating-project");if(!c)return;drag={c,id:e.pointerId,x:e.clientX,y:e.clientY,ox:val(c,"--drag-x"),oy:val(c,"--drag-y"),moved:false};c.classList.add("is-dragging");c.style.zIndex=String(++z);try{root.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();});
 root.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;drag.c.style.setProperty("--drag-x",(drag.ox+dx)+"px");drag.c.style.setProperty("--drag-y",(drag.oy+dy)+"px");});
 const finish=e=>{if(!drag||drag.id!==e.pointerId)return;const {c,moved}=drag;drag=null;c.classList.remove("is-dragging");if(moved){c.dataset.justDragged="true";setTimeout(()=>delete c.dataset.justDragged,180);}try{if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId)}catch(_){}};
 ["pointerup","pointercancel","lostpointercapture"].forEach(n=>root.addEventListener(n,finish));
 root.addEventListener("click",e=>{const c=e.target.closest(".floating-project");if(c&&c.dataset.justDragged==="true"&&!e.target.closest("a,button")){e.preventDefault();e.stopPropagation();}});
 root.addEventListener("dragstart",e=>{if(e.target.closest(".floating-project"))e.preventDefault();});
})();