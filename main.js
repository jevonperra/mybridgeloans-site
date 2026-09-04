(function(){
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  /* ---------- ground: homes ---------- */
  (function buildGround(){
    const g = document.getElementById('houses'); if(!g) return;
    let x = 24, out = '';
    // distant hills and a tree line sit behind the homes, so the horizon reads as depth rather than a hard band
    out += '<path class="hills" d="M0 150C140 118 260 138 400 122S680 96 860 118 1120 108 1300 130 1560 112 1700 128V220H0z"/>';
    out += '<path class="treeline" d="M0 172q30-18 60-4t60-10 60 6 60-12 60 8 60-8 60 10 60-12 60 6 60-6 60 12 60-10 60 6 60-10 60 10 60-6 60 8 60-12 60 6 60-6 60 10 60-8 60 6 60-10 60 8 60-4 60 4V220H0z"/>';
    out += '<rect class="lawn" x="0" y="200" width="1700" height="20"/>';
    const rnd = (a,b)=>a+Math.random()*(b-a);
    const base = 200;
    const tree = (tx)=>`<rect class="trunk" x="${tx-2}" y="${base-26}" width="4" height="26"/><circle class="tree" cx="${tx}" cy="${base-40}" r="17"/><circle class="tree" cx="${tx-10}" cy="${base-30}" r="12"/><circle class="tree" cx="${tx+11}" cy="${base-31}" r="12"/>`;
    while(x < 1700){
      const w = rnd(88,124), h = rnd(46,60), peak = rnd(16,24), over = 6;
      const top = base-h, ridge = top-peak;
      out += `<rect class="body" x="${x}" y="${top}" width="${w}" height="${h}"/>`;
      out += `<path class="roof" d="M${x-over} ${top+2}L${x+w/2} ${ridge}L${x+w+over} ${top+2}L${x+w+over} ${top+6}L${x-over} ${top+6}z"/>`;
      if(Math.random()<.6) out += `<rect class="chim" x="${x+w*.68}" y="${ridge+4}" width="8" height="${top-ridge-2}"/>`;
      const dw = 13, dh = 24, dx = x + w*.5 - dw/2;
      out += `<rect class="door" x="${dx}" y="${base-dh}" width="${dw}" height="${dh}" rx="1.5"/>`;
      out += `<rect class="win" x="${x+w*.16}" y="${top+14}" width="14" height="14"/><rect class="win" x="${x+w*.84-14}" y="${top+14}" width="14" height="14"/>`;
      x += w + over*2;
      if(Math.random()<.55){ x += 14; out += tree(x+14); x += 44; } else x += rnd(10,22);
    }
    g.innerHTML = out;
  })();

  /* ---------- hero: sparrows ---------- */
  const canvas = document.getElementById('sky');
  const hero = document.getElementById('hero');
  if(canvas && !reduced){
    const ctx = canvas.getContext('2d');
    let W=0,H=0,dpr=1, birds=[], running=false, visible=true, inView=true, last=0;
    const mouse = {x:-1e4,y:-1e4,active:false};
    const N = () => W<600 ? 52 : 104;

    function resize(){
      dpr = Math.min(devicePixelRatio||1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W*dpr; canvas.height = H*dpr;
      canvas.style.width = W+'px'; canvas.style.height = H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const n = N();
      while(birds.length < n) birds.push(spawn());
      birds.length = n;
    }
    function spawn(){
      const a = Math.random()*Math.PI*2, s = 40+Math.random()*30;
      return {x:Math.random()*W, y:Math.random()*H*0.7, vx:Math.cos(a)*s, vy:Math.sin(a)*s, flap:Math.random()*Math.PI*2, fr:6+Math.random()*4};
    }

    const P = {maxSpeed:110, minSpeed:45, perceive:70, sep:26, sepW:1.6, aliW:.9, cohW:.6, repelR:150, repelW:900, wander:35, ceiling:.06, floor:.72};

    function step(dt){
      const cx = mouse.x, cy = mouse.y, act = mouse.active;
      for(let i=0;i<birds.length;i++){
        const b = birds[i];
        let sx=0,sy=0,ax=0,ay=0,cxs=0,cys=0,n=0;
        for(let j=0;j<birds.length;j++){
          if(i===j) continue;
          const o = birds[j], dx=o.x-b.x, dy=o.y-b.y, d2=dx*dx+dy*dy;
          if(d2 > P.perceive*P.perceive) continue;
          const d = Math.sqrt(d2)||1;
          if(d < P.sep){ sx -= dx/d*(P.sep-d); sy -= dy/d*(P.sep-d); }
          ax += o.vx; ay += o.vy; cxs += o.x; cys += o.y; n++;
        }
        let fx = sx*P.sepW, fy = sy*P.sepW;
        if(n){ fx += (ax/n - b.vx)*P.aliW; fy += (ay/n - b.vy)*P.aliW;
               fx += (cxs/n - b.x)*P.cohW; fy += (cys/n - b.y)*P.cohW; }
        // wander
        b.flap += dt*b.fr;
        fx += Math.cos(b.flap*.37+i)*P.wander; fy += Math.sin(b.flap*.29+i*1.7)*P.wander;
        // cursor repulsion (no attraction; sparrows scatter)
        if(act){
          const dx=b.x-cx, dy=b.y-cy, d2=dx*dx+dy*dy;
          if(d2 < P.repelR*P.repelR){
            const d=Math.sqrt(d2)||1, k=(1-d/P.repelR);
            fx += dx/d*k*k*P.repelW; fy += dy/d*k*k*P.repelW;
          }
        }
        // keep in the sky band
        const top = H*P.ceiling, bot = H*P.floor;
        if(b.y < top) fy += (top-b.y)*2.5;
        if(b.y > bot) fy -= (b.y-bot)*2.5;
        if(b.x < -20) b.x = W+20; if(b.x > W+20) b.x = -20;

        b.vx += fx*dt; b.vy += fy*dt;
        const sp = Math.hypot(b.vx,b.vy)||1;
        const cl = Math.max(P.minSpeed, Math.min(P.maxSpeed, sp));
        b.vx = b.vx/sp*cl; b.vy = b.vy/sp*cl;
        b.x += b.vx*dt; b.y += b.vy*dt;
      }
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#687070';
      for(const b of birds){
        const ang = Math.atan2(b.vy,b.vx), f = Math.sin(b.flap)*.55;
        ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(4,0); ctx.lineTo(-3,-3.6*(1+f)); ctx.lineTo(-1,0); ctx.lineTo(-3,3.6*(1+f)); ctx.closePath();
        ctx.fill(); ctx.restore();
      }
    }
    function loop(t){
      if(!running) return;
      const dt = Math.min(0.033, (t-last)/1000 || 0.016); last = t;
      step(dt); draw();
      requestAnimationFrame(loop);
    }
    function start(){ if(running || !visible || !inView) return; running=true; last=performance.now(); requestAnimationFrame(loop); }
    function stop(){ running=false; }

    resize(); addEventListener('resize', resize, {passive:true});
    document.addEventListener('visibilitychange', ()=>{ visible=!document.hidden; visible?start():stop(); });
    new IntersectionObserver(e=>{ inView=e[0].isIntersecting; inView?start():stop(); },{threshold:0}).observe(hero);
    if(finePointer){
      hero.addEventListener('pointermove', e=>{ const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; mouse.active=true; }, {passive:true});
      hero.addEventListener('pointerleave', ()=>{ mouse.active=false; });
    }
    start();
  }

  /* ---------- magnetic buttons ---------- */
  if(finePointer && !reduced){
    document.querySelectorAll('.magnet').forEach(btn=>{
      const span = document.createElement('span'); span.textContent = btn.textContent; btn.textContent=''; btn.appendChild(span);
      let tx=0,ty=0,cx=0,cy=0,raf=null;
      const tick=()=>{ cx+= (tx-cx)*.18; cy+=(ty-cy)*.18; span.style.transform=`translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px)`;
        if(Math.abs(tx-cx)>.05||Math.abs(ty-cy)>.05) raf=requestAnimationFrame(tick); else raf=null; };
      const go=()=>{ if(!raf) raf=requestAnimationFrame(tick); };
      btn.addEventListener('pointermove',e=>{ const r=btn.getBoundingClientRect(); tx=(e.clientX-r.left-r.width/2)*.18; ty=(e.clientY-r.top-r.height/2)*.28; go(); });
      btn.addEventListener('pointerleave',()=>{ tx=0;ty=0;go(); });
    });
  }

  /* ---------- card tilt, max 6° ---------- */
  if(finePointer && !reduced){
    document.querySelectorAll('.tilt').forEach(card=>{
      card.addEventListener('pointermove',e=>{ const r=card.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg)`; });
      card.addEventListener('pointerleave',()=>{ card.style.transform=''; });
    });
  }

  /* ---------- draw-once rule ---------- */
  const rule = document.getElementById('rule');
  if(rule){ const io = new IntersectionObserver(e=>{ if(e[0].isIntersecting){ rule.classList.add('drawn'); io.disconnect(); } },{threshold:.6}); io.observe(rule); }

  /* ---------- contact: assembled at runtime so scrapers don't get plain text ---------- */
  const EM = ['novej','@','snaol.egdirbym'].map(s=>s.split('').reverse().join('')).join('');
  const PH = ['9898','364','949'].reverse().join('');
  const PH_FMT = PH.slice(0,3)+'-'+PH.slice(3,6)+'-'+PH.slice(6);
  function copyText(t, btn){
    const done=()=>{ const o=btn.textContent; btn.textContent='Copied'; setTimeout(()=>btn.textContent=o,1600); };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,()=>{}); }
    else { const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');done();}catch(e){} ta.remove(); }
  }
  function reveal(btn, kind){
    // replace the button with the real link + copy, and attempt the native handler
    if(btn.dataset.revealed) return; btn.dataset.revealed='1';
    const wrap=document.createElement('div'); wrap.className='reveal';
    const a=document.createElement('a');
    if(kind==='email'){ const subj = btn.dataset.subject ? '?subject='+encodeURIComponent(btn.dataset.subject) : ''; a.href='mailto:'+EM+subj; a.textContent=EM; }
    else { a.href='tel:+1'+PH; a.textContent=PH_FMT; }
    const c=document.createElement('button'); c.type='button'; c.className='copy'; c.textContent='Copy';
    c.addEventListener('click',()=>copyText(kind==='email'?EM:PH_FMT,c));
    wrap.appendChild(a); wrap.appendChild(c);
    btn.replaceWith(wrap);
    a.click();
  }
  document.querySelectorAll('.contact-email').forEach(b=>b.addEventListener('click',()=>reveal(b,'email')));
  document.querySelectorAll('.contact-phone').forEach(b=>b.addEventListener('click',()=>reveal(b,'phone')));

  /* ---------- scenario form ---------- */
  const form = document.getElementById('scenario');
  if(form){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const email = form.email, err = document.getElementById('form-error');
      if(!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){
        err.textContent = 'Enter the email you want the answer sent to.'; email.setAttribute('aria-invalid','true'); email.focus(); return;
      }
      email.removeAttribute('aria-invalid'); err.textContent='';
      const fd = new FormData(form); const lines = [];
      const labels = {email:'Broker email',address:'Address',value:'As-is value',owed:'Amount owed',loan:'Loan amount',fico:'FICO',occupancy:'Occupancy',position:'Lien position',purpose:'Business purpose',history:'1st mortgage payment history',cross:'Cross-collateral',exit:'Exit'};
      for(const [k,v] of fd.entries()) if(v) lines.push(`${labels[k]||k}: ${v}`);
      const subject = 'Scenario: ' + (fd.get('address') || 'new request');
      const body = lines.join('\n');
      // show the composed message so it works even when the browser has no mail app
      let out = document.getElementById('form-out');
      if(!out){ out=document.createElement('div'); out.id='form-out'; out.className='form-out'; form.appendChild(out); }
      out.innerHTML = '';
      const p=document.createElement('p'); p.innerHTML='Send this to <a href="mailto:'+EM+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)+'">'+EM+'</a>. If your mail app did not open, copy it and paste into any email.'; out.appendChild(p);
      const pre=document.createElement('pre'); pre.textContent='Subject: '+subject+'\n\n'+body; out.appendChild(pre);
      const c=document.createElement('button'); c.type='button'; c.className='btn ghost copy'; c.textContent='Copy scenario';
      c.addEventListener('click',()=>copyText('To: '+EM+'\nSubject: '+subject+'\n\n'+body,c)); out.appendChild(c);
      out.scrollIntoView({behavior:'smooth',block:'nearest'});
      location.href = `mailto:${EM}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
