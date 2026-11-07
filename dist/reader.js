(() => {
  "use strict";
  const B=window.FIELD_BOOK, chapters=B.chapters, byId=Object.fromEntries(chapters.map(c=>[c.id,c]));
  const main=document.getElementById("main"), KEY="signal-atlas.progress.v1";
  if("scrollRestoration" in history) history.scrollRestoration="manual";
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const normalized=s=>String(s).normalize("NFKD").toLowerCase().replace(/\p{Diacritic}/gu,"");
  const textOnly=html=>{const doc=new DOMParser().parseFromString(html,"text/html");return doc.body.textContent||""};
  const fulltext=new Map(chapters.map(c=>[c.id,textOnly(c.html)+" "+B.glossary.filter(t=>t.chapter===c.id).map(t=>t.term+" "+t.definition).join(" ")]));
  let storageOK=true, activeChapter=null, saveTimer=null;
  function load(){
    try{
      const r=JSON.parse(localStorage.getItem(KEY)||"{}");
      return {completed:Array.isArray(r.completed)?r.completed.filter(x=>byId[x]):[],last:byId[r.last?.id]?r.last:null};
    }catch{return {completed:[],last:null};}
  }
  let progress=load();
  function persist(){
    try{localStorage.setItem(KEY,JSON.stringify(progress));}
    catch{storageOK=false;document.getElementById("notice").textContent="Browser storage is unavailable. Progress lasts for this visit.";showStorageWarning();}
  }
  function showStorageWarning(){
    if(storageOK||document.getElementById("storage-warning"))return;
    const div=document.createElement("p");div.id="storage-warning";div.className="storage-warning";div.textContent="Browser storage is unavailable. Progress lasts for this visit.";main.prepend(div);
  }
  function done(id){return progress.completed.includes(id)}
  const stateLabel=id=>done(id)?"Read":"To read";
  const totalRead=()=>progress.completed.length;
  const href=(id,path)=>"#chapter/"+id+(path?"?path="+encodeURIComponent(path):"");
  const resumeHref=last=>href(last.id,last.path)+(last.path?"&":"?")+"resume=1";
  function icon(kind,large=false){
    const shapes={
      wave:'<path d="M2 23c7 0 7-18 14-18s7 36 14 36 7-36 14-36 7 18 14 18"/>',
      layers:'<path d="m6 13 24-9 24 9-24 9zM6 23l24 9 24-9M6 33l24 9 24-9"/>',
      nodes:'<path d="m9 23 21-14 21 14-21 14zM30 9v28M9 23h42"/><circle cx="9" cy="23" r="4"/><circle cx="30" cy="9" r="4"/><circle cx="51" cy="23" r="4"/><circle cx="30" cy="37" r="4"/>',
      bars:'<path d="M6 8h19v6H6zM23 20h24v6H23zM43 32h13v6H43z"/>',
      dots:'<path d="M2 24c6-18 14-18 20 0s14 18 20 0 12-18 16 0"/><path stroke-dasharray="2 3" d="M10 7v34M22 7v34M34 7v34M46 7v34"/>',
      spectrum:'<path d="M7 38V14m6 24V8m6 30V18m6 20V30m6 8V18m6 20V7m6 31V12m6 26V28m6 10V32"/>',
      endpoint:'<path d="M3 24h5l4-9 5 18 5-28 5 28 4-9h25M38 6v37" />',
      partials:'<path d="M7 10h42M7 23h25M7 36h31"/><path d="m39 19 10 10-10 10m1-10h14"/>',
      checks:'<path d="m5 9 4 4 7-8m8 6h30M5 25l4 4 7-8m8 6h30M5 41l4 4 7-8m8 6h30"/>'
    };
    return `<svg class="technical-icon ${large?"large":""}" viewBox="0 0 60 48" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${shapes[kind]||shapes.wave}</svg>`;
  }
  const chip=s=>`<span class="chip">${esc(s)}</span>`;
  function pageHeading(kicker,title,description,action=""){
    return `<div class="page-heading"><div><p class="eyebrow">${esc(kicker)}</p><h1>${esc(title)}</h1>${description?`<p class="lede">${esc(description)}</p>`:""}</div>${action}</div>`;
  }
  function labCard(lab){
    return `<a href="#lab/${lab.id}" class="lab-card">${icon(lab.icon)}<div><span class="eyebrow">${esc(lab.type)}</span><h3>${esc(lab.title)} <span aria-hidden="true">↗</span></h3><p>${esc(lab.short)}</p></div></a>`;
  }
  function chapterRow(c,path){
    const index=chapters.indexOf(c)+1;
    return `<a class="chapter-row" href="${href(c.id,path)}"><span class="chapter-num">${String(index).padStart(2,"0")}</span><div><span class="eyebrow">${esc(c.part)}</span><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><div class="row-meta"><span>${esc(c.level)}</span><span>${c.minutes} min incl. practice</span></div></div><span class="read-indicator ${done(c.id)?"checked":""}" aria-label="${stateLabel(c.id)}">${done(c.id)?"✓":"↗"}</span></a>`;
  }
  function desk(){
    const count=totalRead(),last=progress.last;
    const heroChapter=byId.acoustics;
    main.innerHTML=`<div class="desk-top"><h1>Study desk</h1><a href="#progress">${count} of ${chapters.length} chapters read <span class="tiny-progress"><i style="width:${100*count/chapters.length}%"></i></span></a></div>
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">THE VOICE AI FIELDBOOK</p><h2 id="hero-title">From pressure<br>to perception.</h2><p>Understand the signal.<br>Build the conversation.</p><a class="btn lime" href="${last?resumeHref(last):href("acoustics","foundations")}">${last?"Continue reading":"Start with sound"} <span>↗</span></a><span class="hero-foot">${last?esc(byId[last.id].title):"A wave in the room · Chapter 01"}</span></div><figure class="hero-figure"><img src="media/harmonic-field.svg" alt="A harmonic series under shifting resonances. Lines recede in time, with frequency running from zero to four kilohertz."><figcaption>A synthesized harmonic field. Every voice begins with a signal.</figcaption></figure></section>
    <section><div class="section-head"><h2>Choose a learning path</h2><span>Start where you are. Follow the connections.</span></div><div class="path-grid">${B.curriculum.paths.map((p,i)=>{
      const read=p.chapters.filter(done).length;
      return `<a class="path-card path-${i}" href="#path/${p.id}"><div class="path-art">${icon(p.icon,true)}<span aria-hidden="true">↗</span></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="path-bottom"><span>${p.chapters.length} chapters</span><span>${read?"Read "+read:"Begin path"}</span></div><div class="progress-track"><i style="width:${100*read/p.chapters.length}%"></i></div></a>`;
    }).join("")}</div></section>
    <section><div class="section-head"><div><p class="eyebrow">LEARN BY CHANGING SOMETHING</p><h2>At the lab bench</h2></div><a class="text-link" href="#labs">All ${B.labs.length} experiments ↗</a></div><div class="lab-grid">${[B.labs[0],B.labs[2],B.labs[5]].map(labCard).join("")}</div></section>
    <section class="notes-strip"><div><p class="eyebrow">THE MURMUR NOTEBOOK</p><h2>A bookmark for the last sound heard.</h2><p>A recurring case study in source-grounded answers, expressive narration and interruption recovery.</p></div><a class="btn soft" href="#chapter/interruption">Open the case study ↗</a></section>`;
  }
  function library(){
    main.innerHTML=pageHeading("THE CHAPTER LIBRARY","Make sense of the whole stack.","Follow the prerequisites, or go straight to the question you’re working on.")+`<div class="library-tools"><label class="input-wrap" for="library-q"><span>Search chapters</span><input type="search" id="library-q" placeholder="A topic, a concept, a question…"></label><label for="part-filter">Area<select id="part-filter"><option value="">All areas</option>${[...new Set(chapters.map(c=>c.part))].map(p=>`<option>${esc(p)}</option>`).join("")}</select></label><label for="state-filter">Reading state<select id="state-filter"><option value="">All chapters</option><option value="unread">To read</option><option value="read">Read</option></select></label></div><p id="result-count" role="status" class="result-count"></p><div id="chapter-results" class="chapter-list"></div>`;
    const filter=()=>{
      const q=normalized(document.getElementById("library-q").value).trim(),part=document.getElementById("part-filter").value,state=document.getElementById("state-filter").value;
      const found=chapters.filter(c=>(!q||normalized(c.title+" "+c.summary+" "+fulltext.get(c.id)).includes(q))&&(!part||c.part===part)&&(!state||(state==="read"?done(c.id):!done(c.id))));
      document.getElementById("result-count").textContent=found.length+" chapters";
      document.getElementById("chapter-results").innerHTML=found.length?found.map(c=>chapterRow(c)).join(""):'<div class="empty"><h2>No chapters found</h2><p>Try a shorter term or choose all areas.</p></div>';
    };
    main.querySelectorAll("input,select").forEach(el=>el.addEventListener("input",filter));filter();
  }
  function pathPage(id){
    const p=B.curriculum.paths.find(p=>p.id===id);if(!p)return missing();
    const start=p.chapters.find(id=>!done(id))||p.chapters[0];
    main.innerHTML=pageHeading("GUIDED PATH",p.name,p.description,`<a class="btn dark" href="${href(start,p.id)}">${p.chapters.some(done)?"Continue path":"Begin path"} ↗</a>`)+`<div class="path-intro"><span>${p.chapters.length} chapters</span><span>${p.chapters.reduce((n,id)=>n+(byId[id]?.minutes||0),0)} min including exercises</span><span>${p.chapters.filter(done).length} read</span></div><div class="chapter-list">${p.chapters.filter(id=>byId[id]).map(id=>chapterRow(byId[id],p.id)).join("")}</div>`;
  }
  function chapter(id,query){
    const c=byId[id];if(!c)return missing();
    const path=B.curriculum.paths.find(p=>p.id===query.get("path")), ordered=path?path.chapters:chapters.map(c=>c.id), index=ordered.indexOf(id), next=ordered[index+1],prev=ordered[index-1];
    const last=progress.last;
    activeChapter=id;progress.last={id,offset:query.has("resume")&&last?.id===id?last.offset:0,path:path?.id||null};persist();
    const diagram=["capture","spectrum","recognition","interruption","memory","inference"].includes(id)?`<figure class="chapter-diagram"><img src="media/${id}.svg" alt="${{capture:"Capture stages from pressure through the capsule, preamp and ADC to PCM.",spectrum:"Feature stages from a windowed waveform through the DFT to mel bands.",recognition:"Recognition stages from frames to a provisional hypothesis.",interruption:"Narration moves from generated to queued to presented audio before its bookmark advances.",memory:"Memory passes through consent, storage, retrieval and expiry.",inference:"Streaming inference includes capture, scheduling, compute, decoding and playout."}[id]}"></figure>`:"";
    main.innerHTML=`<div class="reading-layout"><aside class="reading-nav"><a class="back-link" href="${path?"#path/"+path.id:"#library"}">← ${path?esc(path.name):"Chapter library"}</a><p class="eyebrow">IN THIS CHAPTER</p><nav id="chapter-toc" aria-label="Chapter sections"></nav><div class="reading-nav-bottom"><p>${c.minutes} minutes with practice</p><button class="btn soft completion" data-id="${id}" aria-pressed="${done(id)}">${done(id)?"✓ Marked as read":"Mark as read"}</button></div></aside><article class="chapter"><header class="chapter-header"><div class="eyebrow">CHAPTER ${String(chapters.indexOf(c)+1).padStart(2,"0")} · ${esc(c.part)}</div><h1>${esc(c.title)}</h1><p class="chapter-question">${esc(c.question)}</p><div class="row-meta">${chip(c.level)}<span>${c.minutes} min with practice</span>${B.curriculum.deepDives.includes(id)?chip("Deep dive"):""}</div></header>
    <section class="learning-box" aria-labelledby="goals-title"><div><h2 id="goals-title">What you’ll learn</h2><ul>${c.goals.map(g=>`<li>${esc(g)}</li>`).join("")}</ul></div><div><h2>Before you begin</h2>${c.prereqs.length?c.prereqs.map(id=>`<a href="${href(id)}">${esc(byId[id]?.title||id)} ↗</a>`).join(""):"<p>No previous chapter needed. Bring a little algebra and your curiosity.</p>"}</div></section>
    ${diagram}<div class="prose" id="chapter-body">${c.html}</div>
    ${id==="articulation"||id==="spectrum"?`<section class="audio-example"><h2>Hear a changing resonance</h2><audio controls preload="none" src="media/vowels.wav">Your browser cannot play this WAV example.</audio><p>Audio description and transcript — two synthesized vowel-like sounds, /a/ then /i/, separated by silence. Both use a 125 Hz source. The spectral envelope changes. No words are spoken.</p></section>`:""}
    ${id==="adaptation"?`<section class="recipe-box"><h2>Run the local recipe</h2><p>Train and adapt the small acoustic classifier using only Python. Its input is synthesized nonspeech audio.</p><a href="recipes/adapt.py" download class="text-link">Download adapt.py ↓</a><a href="recipes/ASR.md" class="text-link">Optional Whisper LoRA recipe ↗</a></section>`:""}
    ${c.labs.length?`<section class="chapter-labs"><h2>Put it on the bench</h2>${c.labs.map(id=>B.labs.find(l=>l.id===id)).filter(Boolean).map(labCard).join("")}</section>`:""}
    <section class="chapter-sources"><h2>Source notes</h2><p>Reviewed 7 November 2026. Follow each reference for its scope and limitations.</p><ol>${c.sources.map(id=>{const s=B.sources.find(s=>s.id===id);return s?`<li><a href="#source/${id}">${esc(s.title)}</a><span>${esc(s.by)} · ${esc(s.year)}</span><p>${esc(s.note)}</p></li>`:""}).join("")}</ol></section>
    <section class="related"><h2>Keep the connections</h2>${c.related.map(id=>byId[id]?`<a href="${href(id)}">${esc(byId[id].title)} ↗</a>`:"").join("")}</section><div class="chapter-finish"><button class="btn dark completion" data-id="${id}" aria-pressed="${done(id)}">${done(id)?"✓ Marked as read":"Mark as read"}</button></div><nav class="chapter-pagination" aria-label="Adjacent chapters">${prev?`<a href="${href(prev,path?.id)}"><small>← Previous</small>${esc(byId[prev]?.title||prev)}</a>`:"<span></span>"}${next?`<a href="${href(next,path?.id)}"><small>Up next →</small>${esc(byId[next]?.title||next)}</a>`:"<a href='#library'>Return to library ↗</a>"}</nav></article></div>`;
    const toc=main.querySelector("#chapter-toc");
    main.querySelectorAll("#chapter-body h2").forEach((h,i)=>{
      h.id="section-"+i;h.tabIndex=-1;
      const btn=document.createElement("button");btn.textContent=h.textContent;btn.onclick=()=>{h.scrollIntoView({block:"start",behavior:"instant"});h.focus({preventScroll:true});flushPosition();};toc.append(btn);
    });
    if(query.has("resume")&&last?.id===id){
      document.fonts.ready.then(()=>requestAnimationFrame(()=>{
        if(activeChapter!==id)return;
        const heading=last.section?document.getElementById(last.section):null;
        const offset=heading?heading.getBoundingClientRect().top+window.scrollY+(last.sectionOffset||0):(last.offset||0);
        window.scrollTo({top:offset,behavior:"instant"});
        main.dataset.position="restored";
      }));
    }
  }
  function labs(){
    main.innerHTML=pageHeading("THE WORKBENCH","Small experiments. Real mechanics.","Compute a spectrum, change a threshold, replay a race. Each experiment tells you exactly what it models.")+`<div class="lab-grid full">${B.labs.map(labCard).join("")}</div><section class="notes-strip"><div><p class="eyebrow">RUN LOCALLY</p><h2>Train something small enough to inspect.</h2><p>A deterministic acoustic classification recipe exposes adaptation, forgetting and a held-out evaluation.</p></div><a href="#chapter/adaptation" class="btn soft">Open the recipe ↗</a></section>`;
  }
  function lab(id){
    const l=B.labs.find(l=>l.id===id);if(!l)return missing();
    main.innerHTML=`<a href="#labs" class="back-link">← All experiments</a>`+pageHeading(l.type,l.title,l.question)+`<div class="experiment" id="experiment"></div><div class="lab-notes"><section><h2>Try this</h2><p>${esc(l.instructions)}</p></section><section><h2>What to look for</h2><p>${esc(l.expect)}</p></section></div><section class="lab-reading"><h2>Read the mechanics</h2>${l.chapters.map(id=>byId[id]?`<a href="${href(id)}">${esc(byId[id].title)} ↗</a>`:"").join("")}</section>`;
    window.AtlasLabs.mount(id,document.getElementById("experiment"));
  }
  function reference(tab="sources"){
    main.innerHTML=pageHeading("THE REFERENCE SHELF","Follow the evidence.","An annotated source library, a working glossary and the people and projects behind the ideas.")+`<nav class="reference-tabs" aria-label="Reference sections">${[["sources","Papers & sources"],["glossary","Glossary"],["directory","People & projects"]].map(([id,title])=>`<a href="#reference/${id}" ${id===tab?'aria-current="page"':""}>${title}</a>`).join("")}</nav><label class="input-wrap ref-search" for="reference-q"><span>Search ${esc(tab)}</span><input type="search" id="reference-q" placeholder="Filter this collection"></label><p class="result-count" id="reference-count" role="status"></p><div id="reference-results"></div>`;
    const draw=()=>{
      const q=normalized(main.querySelector("#reference-q").value);
      const pool=tab==="glossary"?B.glossary:tab==="directory"?B.directory:B.sources;
      const items=pool.filter(r=>normalized(JSON.stringify(r)).includes(q));
      main.querySelector("#reference-count").textContent=items.length+" entries";
      let body="";
      if(tab==="glossary")body=items.map(t=>`<article class="term" id="term-${esc(t.id)}"><h2>${esc(t.term)}</h2><p>${esc(t.definition)}</p><a href="${href(t.chapter)}">Read the explanation in ${esc(byId[t.chapter]?.title||t.chapter)} ↗</a></article>`).join("");
      else if(tab==="directory")body=`<div class="directory-grid">${items.map(p=>`<article class="directory-card"><p class="eyebrow">${esc(p.kind)}</p><h2>${esc(p.name)}</h2><p>${esc(p.focus)}</p><h3>A way into the work</h3><p>${esc(p.exercise)}</p><a href="#source/${esc(p.source)}">Verified public reference ↗</a></article>`).join("")}</div>`;
      else body=items.map(s=>`<a class="source-row" href="#source/${esc(s.id)}"><div><p class="eyebrow">${esc(s.type)} · ${esc(s.year)}</p><h2>${esc(s.title)}</h2><p>${esc(s.note)}</p><span class="source-by">${esc(s.by)}</span></div><span aria-hidden="true">↗</span></a>`).join("");
      main.querySelector("#reference-results").innerHTML=items.length?body:'<div class="empty"><h2>No entries found</h2><p>Try another name or topic.</p></div>';
    };main.querySelector("#reference-q").oninput=draw;draw();
  }
  function source(id){
    const s=B.sources.find(s=>s.id===id);if(!s)return missing();
    const linked=chapters.filter(c=>c.sources.includes(id));
    main.innerHTML=`<a class="back-link" href="#reference">← Reference shelf</a>`+pageHeading(s.type,s.title,s.by+" · "+s.year)+`<div class="source-detail"><p class="lede">${esc(s.note)}</p><p>Reviewed ${esc(s.reviewed)}. Product terms and living documentation can change. The cited edition or page defines the scope of the claim.</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="btn dark">Open primary source ↗</a><p class="source-url">${esc(new URL(s.url).hostname)}</p></div><h2 class="section-title">Read alongside</h2><div class="chapter-list">${linked.map(c=>chapterRow(c)).join("")||"<p>This reference also appears in the people and projects directory.</p>"}</div>`;
  }
  function progressPage(){
    main.innerHTML=pageHeading("YOUR LOCAL WORKSPACE","Reading progress","Saved in this browser on this address. You decide when a chapter is read.",`<button id="open-reset" class="btn soft">Reset progress</button>`)+`<div class="progress-summary"><strong>${totalRead()}<span> / ${chapters.length}</span></strong><p>chapters marked as read</p><div class="progress-track"><i style="width:${100*totalRead()/chapters.length}%"></i></div></div>${progress.last?`<section class="notes-strip"><div><p class="eyebrow">LAST OPENED</p><h2>${esc(byId[progress.last.id].title)}</h2></div><a href="${resumeHref(progress.last)}" class="btn dark">Return to your place ↗</a></section>`:""}<div class="chapter-list">${chapters.map(c=>chapterRow(c)).join("")}</div>`;
    document.getElementById("open-reset").onclick=()=>document.getElementById("reset-dialog").showModal();
  }
  function missing(){main.innerHTML=pageHeading("PAGE UNAVAILABLE","This page has moved.","Choose a chapter from the library to continue.")+'<a href="#library" class="btn dark">Open library ↗</a>';}
  function flushPosition(){
    if(!activeChapter)return;
    const headings=[...main.querySelectorAll("#chapter-body h2")];
    const heading=headings.filter(h=>h.getBoundingClientRect().top<=150).at(-1);
    progress.last={...progress.last,id:activeChapter,offset:window.scrollY,
      section:heading?.id||null,sectionOffset:heading?-heading.getBoundingClientRect().top:0};
    persist();
  }
  function render(){
    clearTimeout(saveTimer);window.AtlasLabs.stop();activeChapter=null;delete main.dataset.position;
    const [route,search]=location.hash.slice(1).split("?"),[kind,id]=route.split("/"), query=new URLSearchParams(search||"");
    const nav=kind==="chapter"||kind==="path"?"library":kind==="lab"?"labs":kind==="source"?"reference":kind||"desk";
    document.querySelectorAll("[data-nav]").forEach(a=>{if(a.dataset.nav===nav)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
    window.scrollTo(0,0);
    if(kind==="chapter")chapter(id,query);else if(kind==="library")library();else if(kind==="path")pathPage(id);else if(kind==="labs")labs();else if(kind==="lab")lab(id);else if(kind==="reference")reference(["glossary","directory"].includes(id)?id:"sources");else if(kind==="source")source(id);else if(kind==="progress")progressPage();else if(kind===""||kind==="desk")desk();else missing();
    const title=main.querySelector("h1")?.textContent||"Study desk";
    document.title=title+" · Signal Atlas";
    main.focus({preventScroll:true});showStorageWarning();
  }
  document.addEventListener("click",event=>{
    const complete=event.target.closest(".completion");
    if(complete){
      const id=complete.dataset.id;progress.completed=done(id)?progress.completed.filter(c=>c!==id):[...progress.completed,id];persist();
      document.querySelectorAll(".completion").forEach(btn=>{btn.setAttribute("aria-pressed",done(id));btn.textContent=done(id)?"✓ Marked as read":"Mark as read";});
      document.getElementById("notice").textContent=done(id)?"Chapter marked as read.":"Chapter marked to read.";return;
    }
    const close=event.target.closest("[data-close]");if(close)document.getElementById(close.dataset.close).close();
    const a=event.target.closest("a[href^='#']");
    if(a&&a.id!=="skip"){document.getElementById("search-dialog").close();}
  });
  document.getElementById("skip").onclick=e=>{e.preventDefault();main.focus();main.scrollIntoView()};
  window.addEventListener("scroll",()=>{clearTimeout(saveTimer);if(activeChapter)saveTimer=setTimeout(flushPosition,150);},{passive:true});
  window.addEventListener("pagehide",flushPosition);
  window.addEventListener("hashchange",render);
  window.addEventListener("storage",event=>{if(event.key===KEY){progress=load();if(!activeChapter)render();}});
  document.getElementById("confirm-reset").onclick=()=>{progress={completed:[],last:null};persist();document.getElementById("reset-dialog").close();render();document.getElementById("notice").textContent="Reading progress reset.";};
  const dialog=document.getElementById("search-dialog"),q=document.getElementById("global-q"),results=document.getElementById("global-results");
  const searchEntries=[
    ...chapters.map(c=>({title:c.title,kind:"Chapter · "+c.part,body:c.summary+" "+fulltext.get(c.id),link:href(c.id),snippet:c.summary})),
    ...B.labs.map(l=>({title:l.title,kind:"Lab · "+l.type,body:l.short+" "+l.question,link:"#lab/"+l.id,snippet:l.short})),
    ...B.sources.map(s=>({title:s.title,kind:s.type,body:s.note+" "+s.by,link:"#source/"+s.id,snippet:s.note})),
    ...B.glossary.map(t=>({title:t.term,kind:"Glossary",body:t.definition,link:href(t.chapter),snippet:t.definition}))
  ];
  function search(){
    const needle=normalized(q.value).trim();
    const matches=needle?searchEntries.filter(e=>normalized(e.title+" "+e.body).includes(needle)).sort((a,b)=>Number(normalized(b.title).includes(needle))-Number(normalized(a.title).includes(needle))):[];
    results.innerHTML=needle?`<p class="result-count" role="status">${matches.length} matches${matches.length>30?" · showing the first 30":""}</p>`+matches.slice(0,30).map(e=>`<a class="search-result" href="${e.link}"><span class="eyebrow">${esc(e.kind)}</span><strong>${esc(e.title)}</strong><p>${esc(e.snippet)}</p></a>`).join("")+(matches.length?"":'<p>No results. Try a broader term.</p>'):"<p class='search-hint'>Search inside every chapter, experiment, glossary entry and source note.</p>";
  }
  function openSearch(){dialog.showModal();q.focus();search();}
  dialog.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();event.stopPropagation();dialog.close();}});
  document.getElementById("open-search").onclick=openSearch;q.oninput=search;
  document.addEventListener("keydown",e=>{
    if((e.key==="/"&&!e.ctrlKey&&!e.metaKey&&!["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))||((e.ctrlKey||e.metaKey)&&e.key==="k")){e.preventDefault();if(!dialog.open)openSearch();}
  });
  render();
})();
