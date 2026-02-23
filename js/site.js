// site.js — handles Extract Intel download and Request Extraction modal
(function(){
  function $(sel){return document.querySelector(sel)}
  function showToast(text, ms=2500){
    const t = $("#toast"); if(!t) return; t.textContent = text; t.classList.add('show'); t.setAttribute('aria-hidden','false');
    clearTimeout(t._timer); t._timer = setTimeout(()=>{ t.classList.remove('show'); t.setAttribute('aria-hidden','true'); }, ms);
  }

  function download(filename, data){
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function collectIntel(){
    const missions = Array.from(document.querySelectorAll('.mission-card')).map(card=>({
      title: (card.querySelector('h3')||{textContent:''}).textContent.trim(),
      desc: (card.querySelector('p')||{textContent:''}).textContent.trim()
    }));
    const games = Array.from(document.querySelectorAll('.game-card')).map(g=>({
      name: (g.querySelector('h3')||{textContent:''}).textContent.trim(),
      desc: (g.querySelector('p')||{textContent:''}).textContent.trim()
    }));
    const meta = {url:location.href, title:document.title, timestamp: new Date().toISOString()};
    return {meta, missions, games};
  }

  function onExtractClick(){
    try{
      const intel = collectIntel();
      const filename = `intel_${new Date().toISOString().slice(0,10)}.json`;
      // show a short extraction progress bar in the toast area to look operative
      const t = document.createElement('div'); t.className = 'intel-progress'; t.innerHTML = '<i></i>';
      const toast = document.getElementById('toast');
      if(toast){ toast.textContent = ''; toast.appendChild(t); toast.classList.add('show'); toast.setAttribute('aria-hidden','false'); }
      const bar = t.querySelector('i');
      // animate progress then download
      let pct = 6;
      const iv = setInterval(()=>{ pct += Math.floor(Math.random()*22)+8; if(pct>96) pct=96; bar.style.width = pct + '%'; }, 140);
      setTimeout(()=>{
        clearInterval(iv); bar.style.width = '100%';
        setTimeout(()=>{
          download(filename, JSON.stringify(intel, null, 2));
          if(toast){ toast.classList.remove('show'); toast.setAttribute('aria-hidden','true'); }
          showToast('Intel package downloaded');
        }, 260);
      }, 920 + Math.random()*420);
    }catch(e){ console.error(e); showToast('Failed to extract intel'); }
  }

  // Modal helpers
  function openModal(el){ el.classList.add('show'); el.setAttribute('aria-hidden','false'); }
  function closeModal(el){ el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }

  function onRequestClick(){
    const modal = $('#modal-request'); if(!modal) return; openModal(modal);
  }

  function onRequestSubmit(ev){
    ev.preventDefault(); const form = ev.target; const fd = new FormData(form);
    const name = fd.get('name') || 'Anonymous';
    const email = fd.get('email') || '';
    const details = fd.get('details') || '';
    const subject = encodeURIComponent('Extraction Request — '+name);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nDetails:\n${details}`);
    const mailto = `mailto:ghost@void.ops?subject=${subject}&body=${body}`;
    // close modal then navigate to mailto to open user's mail client
    closeModal($('#modal-request'));
    showToast('Opening mail client...');
    setTimeout(()=>{ location.href = mailto; }, 350);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const eb = $('#extractBtn'); if(eb) eb.addEventListener('click', onExtractClick);
    const rb = $('#requestBtn'); if(rb) rb.addEventListener('click', onRequestClick);
    const modal = $('#modal-request'); if(modal){
      modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(modal); });
      const close = modal.querySelector('.modal-close'); if(close) close.addEventListener('click', ()=>closeModal(modal));
      const form = modal.querySelector('#requestForm'); if(form) form.addEventListener('submit', onRequestSubmit);
    }
  });
})();
