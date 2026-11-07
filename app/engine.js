/* Deterministic lab mechanics shared by the browser and the test runner. */
(() => {
  "use strict";
  const tau = 2 * Math.PI;
  function aliasHz(hz, rate) {
    const wrapped = ((hz % rate) + rate) % rate;
    return Math.min(wrapped, rate - wrapped);
  }
  const tone = (hz, seconds) => Math.cos(tau * hz * seconds);

  // Iterative radix-2 FFT of a real window. Return positive-frequency powers.
  function powerSpectrum(samples) {
    const n = samples.length, re = Float64Array.from(samples), im = new Float64Array(n);
    for (let i=1, j=0; i<n; i++) {
      let bit=n>>1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) [re[i],re[j]] = [re[j],re[i]];
    }
    for (let len=2; len<=n; len*=2) {
      const angle=-tau/len;
      for (let block=0; block<n; block+=len) {
        for (let k=0; k<len/2; k++) {
          const odd=block+k+len/2, even=block+k, wr=Math.cos(angle*k), wi=Math.sin(angle*k);
          const ar=wr*re[odd]-wi*im[odd], ai=wr*im[odd]+wi*re[odd];
          re[odd]=re[even]-ar; im[odd]=im[even]-ai;
          re[even]+=ar; im[even]+=ai;
        }
      }
    }
    return Array.from({length:n/2+1},(_,i)=>(re[i]**2+im[i]**2)/(n*n));
  }
  function spectrogram(signal, size) {
    const fs=8000, count=5120, hop=32, frame=new Float64Array(size), cols=[];
    const wave=Float64Array.from({length:count}, (_,i)=>{
      const t=i/fs;
      if (signal==="pair") return t < .26 ? 0 : .45*(Math.sin(tau*900*t)+Math.sin(tau*1000*t));
      return .78*Math.sin(tau*(260*t+.5*3600*t*t));
    });
    // Centered windows, explicitly zero-padded at the edges.
    for (let middle=0; middle<count; middle+=hop) {
      for (let j=0;j<size;j++) frame[j]=(wave[middle+j-size/2]||0)*(.5-.5*Math.cos(tau*j/(size-1)));
      cols.push(powerSpectrum(frame));
    }
    return {cols, rate:fs, duration:count/fs, hop, size};
  }
  function endpoint(threshold, hold) {
    const step=20, frames=[], ends=[]; let speaking=false, silence=0;
    for(let ms=0;ms<2000;ms+=step){
      const phrase=(ms>=120&&ms<500)||(ms>=840&&ms<1260), soft=ms>=1260&&ms<1400;
      const energy=phrase?.56+.14*Math.sin(ms*.052):soft?.23+.015*Math.sin(ms*.022):.055+.018*Math.cos(ms*.031);
      const active=energy>=threshold;
      if(active){speaking=true;silence=0;}
      else if(speaking){silence+=step;if(silence>=hold){ends.push(ms+step);speaking=false;silence=0;}}
      frames.push({ms,energy,active});
    }
    return {frames,ends,truth:1400};
  }
  const partials=[
    [140,"read","partial"],[320,"read back","partial"],[560,"read back paragraph","partial"],
    [780,"read back paragraph forty","partial"],[960,"read back paragraph fourteen","partial"],[1150,"read back paragraph fourteen","final"]
  ];
  function waterfall(v,overlap){
    const rows=[]; const push=(name,start,delay)=>{rows.push({name,start,delay});return start+delay};
    const captured=push("Capture & transport",0,v.capture);
    const accepted=push("Endpoint hold",captured,v.endpoint);
    const modelEnd=push("Model lead time",overlap?captured:accepted,v.model);
    const ready=push("First TTS chunk",Math.max(accepted,modelEnd),v.tts);
    const total=push("Playout buffer",ready,v.playout);
    return {rows,total};
  }

  const passage="Rain reaches the old observatory before sunrise.";
  const spans=Array.from(passage.matchAll(/\S+/g), match=>({word:match[0],from:match.index,to:match.index+match[0].length}));
  function newPlayer(){return {epoch:1,generated:0,heard:0,mode:"narrating",oldEpoch:null,answer:"",log:["Narrator ready at character 0."]};}
  function playerStep(old, action, acceptStale=false){
    const p={...old,log:[...old.log]};
    const note=msg=>{p.log.push(msg);p.log=p.log.slice(-7);};
    if(action==="generate" && p.mode==="narrating" && p.generated<spans.length){
      p.generated=Math.min(spans.length,p.generated+3);note("Generated through word "+p.generated+".");
    } else if(action==="present"&&p.mode==="narrating"&&p.heard<p.generated){
      p.heard++;note("Presented “"+spans[p.heard-1].word+"”.");
      if(p.heard===spans.length) p.mode="finished";
    } else if(action==="interrupt"&&p.mode==="narrating"){
      p.oldEpoch=p.epoch++;p.generated=p.heard;p.mode="paused";note("Cancelled old narration and discarded its queue.");
    } else if(action==="stale"&&p.oldEpoch!==null){
      if(acceptStale && p.heard<spans.length){p.heard++;p.generated=Math.max(p.generated,p.heard);note("Fault: a stale callback advanced the bookmark.");}
      else note("Rejected callback from epoch "+p.oldEpoch+".");
    } else if(action==="ask"&&p.mode==="paused"){
      p.mode="answering";
      p.answer=p.heard?"Author's heard text: “"+passage.slice(0,spans[p.heard-1].to)+"” · Explanation: this is the presented prefix.":"There is no heard text to cite yet.";
      note("Answered on a separate track using only the heard span.");
    } else if(action==="resume"&&(p.mode==="paused"||p.mode==="answering")){
      p.mode=p.heard===spans.length?"finished":"narrating";p.generated=p.heard;
      note("Resumed at character "+(spans[p.heard]?.from??passage.length)+".");
    }
    return p;
  }
  function tokenize(s,normalize){
    const tokens=s.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if(!normalize) return tokens;
    return tokens.map(w=>{const clean=w.replace(/[.,!?]/g,"");return clean==="14"?"fourteen":clean;}).filter(Boolean);
  }
  function editScore(reference,hypothesis,normalize=false){
    const a=tokenize(reference,normalize), b=tokenize(hypothesis,normalize);
    const table=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(let i=0;i<=a.length;i++)table[i][0]=i;
    for(let j=0;j<=b.length;j++)table[0][j]=j;
    for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)
      table[i][j]=Math.min(table[i-1][j-1]+Number(a[i-1]!==b[j-1]),table[i-1][j]+1,table[i][j-1]+1);
    const edits=[]; let i=a.length,j=b.length;
    while(i||j){
      if(i&&j&&table[i][j]===table[i-1][j-1]+Number(a[i-1]!==b[j-1])){
        if(a[i-1]!==b[j-1])edits.push("substitute “"+a[i-1]+"” → “"+b[j-1]+"”");i--;j--;
      }else if(i&&table[i][j]===table[i-1][j]+1){edits.push("delete “"+a[i-1]+"”");i--;}
      else{edits.push("insert “"+b[j-1]+"”");j--;}
    }
    return {n:a.length,errors:table[a.length][b.length],edits:edits.reverse()};
  }
  const fixtures=[
    {name:"Paragraph number",slice:"Read command",ref:"resume paragraph fourteen",hyp:"resume paragraph 14",target:"14",actual:"14"},
    {name:"Named entity",slice:"Proper name",ref:"find the Deccan plateau",hyp:"find the decan plateau",target:"Deccan",actual:"decan"},
    {name:"Missing negation",slice:"Read command",ref:"do not skip ahead",hyp:"do skip ahead",target:"hold",actual:"skip"},
    {name:"Repair in speech",slice:"Read command",ref:"go back two words",hyp:"go back two words",target:"-2",actual:"-2"}
  ];
  function evaluate(normalize,stale){
    const scored=fixtures.map(f=>({...f,...editScore(f.ref,f.hyp,normalize),pass:f.target===f.actual}));
    let p=newPlayer();
    for(const cmd of ["generate","present","interrupt","stale","ask","resume"])p=playerStep(p,cmd,stale);
    return {scored,errors:scored.reduce((s,f)=>s+f.errors,0),words:scored.reduce((s,f)=>s+f.n,0),heard:p.heard,playbackPass:p.heard===1,anchor:spans[p.heard]?.from??passage.length};
  }
  const api={aliasHz,tone,powerSpectrum,spectrogram,endpoint,partials,waterfall,passage,spans,newPlayer,playerStep,editScore,evaluate};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else window.SignalEngine=api;
})();