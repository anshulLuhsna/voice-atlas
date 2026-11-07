/* Mount one experiment. Controls stay in the DOM while only the plot updates. */
(() => {
  "use strict";
  const E=window.SignalEngine;
  const plotW=640, plotH=216, left=43, right=619, top=14, bottom=178;
  const colors={ink:"#cbe4a5",dim:"#678873",orange:"#ffad77",blue:"#97cdee"};
  const line=(x1,y1,x2,y2,stroke="#385248",dash="")=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-dasharray="${dash}"/>`;
  const label=(x,y,s,anchor="start")=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="#b9cebf" font-family="monospace" font-size="11">${s}</text>`;
  function svg(content,title,desc){
    return `<svg viewBox="0 0 ${plotW} ${plotH}" role="img" aria-label="${title}"><title>${title}</title><desc>${desc}</desc>${content}</svg>`;
  }
  function graphBase(xmax,unit,ylabs){
    let parts="";
    for(let i=0;i<=6;i++){const x=left+(right-left)*i/6;parts+=line(x,top,x,bottom,"#354c41","2 5")+label(x,bottom+19,String(Math.round(i*xmax/6))+(i===6?" "+unit:""),i===6?"end":"middle");}
    ylabs.forEach(([s,y])=>{parts+=line(left,y,right,y)+label(left-8,y+4,s,"end");});
    return parts;
  }
  function select(id,title,choices,selected){
    return `<label class="control" for="${id}"><span>${title}</span><select id="${id}">${choices.map(([k,v])=>`<option value="${k}" ${String(k)===String(selected)?"selected":""}>${v}</option>`).join("")}</select></label>`;
  }
  function range(id,title,min,max,step,value,unit){
    return `<label class="control" for="${id}"><span>${title} <output for="${id}" id="${id}-value">${value} ${unit}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  }
  const button=(action,title,secondary=false)=>`<button class="btn ${secondary?"soft":"dark"}" data-lab-action="${action}">${title}</button>`;
  const metrics=(pairs)=>pairs.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join("");
  let clean=()=>{};
  function stop(){clean();clean=()=>{};}
  function mount(id,root){
    stop();
    const get=(s)=>root.querySelector(s);
    const value=(id)=>Number(get("#"+id).value);
    function scaffold(controls,plotClass="plot",extra=""){
      root.innerHTML=`<div class="lab-controls">${controls}</div><div class="${plotClass}" id="lab-plot"></div><div class="metrics" id="lab-metrics"></div><p id="lab-readout" class="readout" aria-live="polite"></p>${extra}`;
    }
    const show=(name,html)=>{get("#lab-"+name).innerHTML=html};
    const read=(s)=>{get("#lab-readout").textContent=s};
    const onInput=fn=>{root.oninput=fn;root.onchange=fn;fn()};
    clean=()=>{root.oninput=null;root.onchange=null;root.onclick=null;};
    if(id==="sampling"){
      scaffold(range("frequency","Input tone",0,9000,50,5500,"Hz")+select("rate","Sample rate",[[4000,"4,000 Hz"],[8000,"8,000 Hz"],[16000,"16,000 Hz"]],8000),"plot",`<div class="button-row">${button("play","▷  Play samples")}${button("stop","Stop audio",true)}</div><p class="footnote">Audio description: a short, quiet, synthesized tone at the folded frequency. No spoken words.</p>`);
      let ctx=null, source=null;
      const stopAudio=()=>{if(source){try{source.stop()}catch{}source=null;}if(ctx){ctx.close().catch(()=>{});ctx=null;}};
      const reset=clean;clean=()=>{stopAudio();reset();};
      onInput(()=>{
        const hz=value("frequency"),rate=value("rate"),fold=E.aliasHz(hz,rate),duration=.006;
        get("#frequency-value").value=hz.toLocaleString()+" Hz";
        const y=n=>(top+bottom)/2-n*(bottom-top)*.44;
        let out=graphBase(6,"ms",[["+1",y(1)],["0",y(0)],["−1",y(-1)]]);
        for(const [freq,color,dash] of [[hz,colors.dim,""],[fold,colors.orange,"5 3"]]){
          let points="";for(let i=0;i<=1500;i++)points+=(left+(right-left)*i/1500).toFixed(2)+","+y(E.tone(freq,duration*i/1500)).toFixed(2)+" ";
          out+=`<polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.7" stroke-dasharray="${dash}"/>`;
        }
        for(let i=0;i<=rate*duration;i++)out+=`<circle cx="${left+(right-left)*i/(rate*duration)}" cy="${y(E.tone(hz,i/rate))}" r="2.8" fill="${colors.ink}"/>`;
        show("plot",svg(out,"Cosine and samples over six milliseconds","Continuous tone, sample dots and the folded cosine through those dots.")+`<div class="legend"><span><i></i>Continuous tone</span><span><i class="amber"></i>Folded cosine</span><span><i class="dot"></i>Samples</span></div>`);
        show("metrics",metrics([["Input",hz.toLocaleString()+" Hz"],["Nyquist",(rate/2).toLocaleString()+" Hz"],["Observed",fold.toLocaleString()+" Hz"]]));
        read(hz>rate/2?"The tone folds into the sampled band. Both cosine curves pass through every sample.":hz===rate/2?"At Nyquist, the samples depend critically on starting phase. This fixture starts at a crest.":"The tone lies within the sampled band. The two curves coincide.");
      });
      root.onclick=async e=>{
        const act=e.target.closest("[data-lab-action]")?.dataset.labAction;
        if(act==="stop"){stopAudio();read("Audio stopped.");return;}if(act!=="play")return;
        stopAudio();
        try{
          const rate=value("rate"),hz=value("frequency");
          const Ctx=window.AudioContext||window.webkitAudioContext;ctx=new Ctx();await ctx.resume();
          // Web Audio buffers support sample rates from 8 kHz. For a 4 kHz
          // fixture, use the analytically equivalent baseband cosine at 8 kHz.
          const renderRate=Math.max(8000,rate), buf=ctx.createBuffer(1,Math.round(.48*renderRate),renderRate),arr=buf.getChannelData(0);
          const fold=E.aliasHz(hz,rate);
          for(let i=0;i<arr.length;i++)arr[i]=fold===0?0:.11*Math.min(1,i/(.015*renderRate),(arr.length-1-i)/(.025*renderRate))*E.tone(fold,i/renderRate);
          source=ctx.createBufferSource();source.buffer=buf;source.connect(ctx.destination);source.start();read(fold?"Playing a short tone at "+fold+" Hz.":"The folded signal is constant. Playback suppresses DC.");
        }catch{read("Audio playback is unavailable in this browser. The plotted samples still show the result.");}
      };
    }else if(id==="spectrum"){
      scaffold(select("signal","Signal",[["pair","900 + 1,000 Hz tone pair"],["sweep","Rising frequency sweep"]],"pair")+select("window-size","Hann window",[[64,"64 samples"],[128,"128 samples"],[256,"256 samples"],[512,"512 samples"]],256));
      onInput(()=>{
        const size=value("window-size"),kind=get("#signal").value,{cols}=E.spectrogram(kind,size);
        show("plot",`<div class="heat-layout"><div class="heat-y"><span>4 kHz</span><span>2 kHz</span><span>0 Hz</span></div><canvas id="heat" width="${cols.length}" height="${size/2+1}" role="img" aria-label="Computed power spectrogram for ${kind==="pair"?"two tones":"a rising tone"}"></canvas></div><div class="heat-x"><span>0</span><span>320</span><span>640 ms</span></div><div class="legend"><span><i class="gradient"></i>Power · −55 to 0 dB relative to plot peak</span></div>`);
        const canvas=get("#heat"),g=canvas.getContext("2d"),img=g.createImageData(canvas.width,canvas.height);
        let peak=0;for(const col of cols)for(const p of col)peak=Math.max(peak,p);
        for(let x=0;x<cols.length;x++)for(let k=0;k<cols[x].length;k++){
          const q=Math.max(0,Math.min(1,(10*Math.log10(Math.max(1e-15,cols[x][k])/peak)+55)/55));
          const offset=4*((canvas.height-1-k)*canvas.width+x);
          img.data[offset]=17+212*q*q;img.data[offset+1]=39+190*q;img.data[offset+2]=34+83*q;img.data[offset+3]=255;
        }
        g.putImageData(img,0,0);
        show("metrics",metrics([["Window",(1000*size/8000)+" ms"],["Bin spacing",(8000/size)+" Hz"],["Frame hop","4 ms"]]));
        read((kind==="pair"?"Two tones begin at 260 ms.":"Frequency rises from 260 Hz toward 2.56 kHz.")+" Columns use centered Hann windows; edges are zero-padded.");
      });
    }else if(id==="endpoint"){
      scaffold(range("threshold","Energy threshold",.10,.70,.05,.20,"")+range("hold","Silence hold",100,600,20,260,"ms"));
      onInput(()=>{
        const th=value("threshold"),hold=value("hold"),{frames,ends,truth}=E.endpoint(th,hold);
        get("#threshold-value").value=th.toFixed(2);get("#hold-value").value=hold+" ms";
        const X=ms=>left+(right-left)*ms/2000,Y=v=>bottom-v*(bottom-top);
        let p=graphBase(2000,"ms",[["1",top],["0",bottom]])+line(left,Y(th),right,Y(th),colors.blue,"3 3");
        for(const f of frames)p+=`<rect x="${X(f.ms)}" y="${Y(f.energy)}" width="4" height="${bottom-Y(f.energy)}" fill="${f.active?colors.ink:colors.dim}"/>`;
        p+=line(X(truth),top,X(truth),bottom,colors.blue,"4 3");
        ends.forEach(v=>{p+=line(X(v),top,X(v),bottom,colors.orange)+label(X(v)-4,top+12,"end","end")});
        show("plot",svg(p,"Threshold endpoint experiment","Green bars cross the threshold, orange markers are endpoints. Annotated end at 1,400 milliseconds.")+`<div class="legend"><span><i></i>Frame energy</span><span><i class="amber"></i>Detected end</span><span><i class="blue"></i>Reference / threshold</span></div>`);
        show("metrics",metrics([["Frame size","20 ms"],["Premature ends",ends.filter(v=>v<truth).length],["True speech end","1,400 ms"]]));
        read("Detected endpoints: "+(ends.join(", ")||"none")+" ms. The internal pause occupies 500–840 ms. The quiet tail occupies 1,260–1,400 ms. This rule only observes energy.");
      });
    }else if(id==="partials"){
      scaffold(button("prev","← Previous",true)+button("next","Next event →")+button("restart","Restart",true),"text-stage");
      let i=0;
      function draw(){
        const [ms,hyp,state]=E.partials[i];
        show("plot",`<div class="scope-label">RECOGNIZER EVENT ${i+1} / ${E.partials.length}</div><p class="big-quote">“${hyp}”</p><p>Previous: ${i?"“"+E.partials[i-1][1]+"”":"no hypothesis yet"}</p>`);
        get('[data-lab-action="prev"]').disabled=i===0;get('[data-lab-action="next"]').disabled=i===E.partials.length-1;
        show("metrics",metrics([["Elapsed",ms+" ms"],["Result state",state],["Committed target",state==="final"?"paragraph 14":"none"]]));
        read(i===3?"A provisional number could dispatch paragraph 40. The final action gate stays closed.":i===4?"The number changed from forty to fourteen. The result is still provisional.":state==="final"?"The final event commits paragraph fourteen.":"Collecting evidence. No external action has committed.");
      }
      root.onclick=e=>{const a=e.target.closest("button")?.dataset.labAction;if(a==="prev")i=Math.max(0,i-1);if(a==="next")i=Math.min(E.partials.length-1,i+1);if(a==="restart")i=0;draw();};draw();
    }else if(id==="latency"){
      const controls=[["capture","Capture & transport",40],["endpoint","Endpoint hold",220],["model","Model lead time",180],["tts","First TTS chunk",100],["playout","Playout buffer",60]];
      scaffold(select("policy","Scheduling",[["serial","Serial dispatch"],["overlap","Speculative overlap"]],"serial")+controls.map(([id,label,v])=>range(id,label,0,500,10,v,"ms")).join(""),"water-stage");
      onInput(()=>{
        const v={};controls.forEach(([id])=>{v[id]=value(id);get("#"+id+"-value").value=v[id]+" ms";});
        const overlap=get("#policy").value==="overlap",{rows,total}=E.waterfall(v,overlap);
        show("plot",`<div class="water">${rows.map(r=>`<div class="water-row"><span>${r.name}</span><div><i style="left:${100*r.start/(total||1)}%;width:${100*r.delay/(total||1)}%"></i></div><b>${r.start}–${r.start+r.delay} ms</b></div>`).join("")}</div>`);
        show("metrics",metrics([["First audible",total+" ms"],["Origin","last speech sample"],["Schedule",overlap?"overlapped":"serial"]]));
        read(overlap?"Prediction starts before turn commitment. Synthesis waits for both endpoint and model; a wrong speculation would require replay.":"Every stage waits for its predecessor. These chosen delays form one hypothetical trace, not measured service latency.");
      });
    }else if(id==="interruption"){
      scaffold(["generate","present","interrupt","stale","ask","resume","restart"].map((a,i)=>button(a,["Queue 3 words","Present 1 word","Interrupt","Old callback","Ask about heard text","Resume","Restart"][i],i>1)).join(""),"text-stage");
      let p=E.newPlayer();
      function draw(){
        show("plot",`<div class="scope-label">SOURCE · ORIGINAL FIXTURE</div><p class="passage">${E.spans.map((s,i)=>`<span class="${i<p.heard?"heard":i<p.generated?"queued":""}">${s.word}</span>`).join(" ")}</p><div class="legend"><span><i></i>Heard</span><span><i class="amber"></i>Queued</span></div>${p.answer?`<p class="answer-track">${p.answer}</p>`:""}`);
        show("metrics",metrics([["Heard / generated",p.heard+" / "+p.generated+" words"],["Next character",E.spans[p.heard]?.from??E.passage.length],["State",p.mode+" · "+p.epoch]]));
        read(p.log[p.log.length-1]);
        const enabled={generate:p.mode==="narrating"&&p.generated<E.spans.length,present:p.mode==="narrating"&&p.heard<p.generated,interrupt:p.mode==="narrating",stale:p.oldEpoch!==null,ask:p.mode==="paused",resume:["paused","answering"].includes(p.mode),restart:true};
        for(const btn of root.querySelectorAll("button[data-lab-action]"))btn.disabled=!enabled[btn.dataset.labAction];
      }
      root.onclick=e=>{const a=e.target.closest("button")?.dataset.labAction;if(!a)return;p=a==="restart"?E.newPlayer():E.playerStep(p,a);draw();};draw();
    }else if(id==="evaluation"){
      scaffold(`<label class="check"><input type="checkbox" id="normalize"> Normalize numbers and punctuation</label><label class="check"><input type="checkbox" id="fault"> Inject stale-buffer fault</label>`+button("run","Run fixtures"),"eval-stage");
      function run(){
        const r=E.evaluate(get("#normalize").checked,get("#fault").checked);
        show("plot",`<div class="table-scroll"><table><caption>Fixture results</caption><thead><tr><th>Scenario / slice</th><th>Reference → hypothesis</th><th>Word edits</th><th>Task target</th></tr></thead><tbody>${r.scored.map(f=>`<tr><th>${f.name}<small>${f.slice}</small></th><td>${f.ref}<small>→ ${f.hyp}</small></td><td>${f.edits.join(", ")||"exact match"}</td><td>${f.pass?"Pass":"Fail"}<small>${f.target} → ${f.actual}</small></td></tr>`).join("")}<tr><th>Playback resume<small>State regression</small></th><td>Next character 5<small>→ ${r.anchor}</small></td><td>Scored separately</td><td>${r.playbackPass?"Pass":"Fail"}</td></tr></tbody></table></div>`);
        show("metrics",metrics([["Pooled WER",(100*r.errors/r.words).toFixed(1)+"%"],["Edits / ref. words",r.errors+" / "+r.words],["Task checks",r.scored.filter(f=>f.pass).length+Number(r.playbackPass)+" / 5 pass"]]));
        read("Ran four transcript fixtures and one playback race. Command slice: 3, proper name: 1. These tiny fixed cohorts diagnose regressions; they cannot estimate population performance.");
      }
      root.onclick=e=>{if(e.target.closest('[data-lab-action="run"]'))run()};root.onchange=()=>{read("Configuration changed. Run fixtures to score it.");};
      show("plot",'<p>Run the fixtures to see the alignments and task checks.</p>');show("metrics","");read("Ready. The scorer uses word-level edit distance and a separate playback-state check.");
    }
  }
  window.AtlasLabs={mount,stop};
})();