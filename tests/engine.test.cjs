const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../app/engine.js");

test("alias folding gives identical cosine samples", () => {
  assert.equal(E.aliasHz(5500,8000),2500);
  assert.equal(E.aliasHz(5500,16000),5500);
  assert.equal(E.aliasHz(8000,8000),0);
  for(let n=0;n<100;n++)assert.ok(Math.abs(E.tone(5500,n/8000)-E.tone(2500,n/8000))<1e-10);
});
test("FFT matches a direct DFT and preserves energy", () => {
  const n=32, signal=Array.from({length:n},(_,i)=>Math.sin(2*Math.PI*3*i/n)+.25*Math.cos(2*Math.PI*7*i/n));
  const actual=E.powerSpectrum(signal);
  for(let k=0;k<=n/2;k++){
    let re=0,im=0;
    for(let j=0;j<n;j++){re+=signal[j]*Math.cos(2*Math.PI*j*k/n);im-=signal[j]*Math.sin(2*Math.PI*j*k/n);}
    assert.ok(Math.abs(actual[k]-(re*re+im*im)/(n*n))<1e-12);
  }
  const mean=signal.reduce((sum,x)=>sum+x*x,0)/n;
  const power=actual[0]+actual[n/2]+2*actual.slice(1,n/2).reduce((a,b)=>a+b,0);
  assert.ok(Math.abs(mean-power)<1e-12);
});
test("spectrogram places 900 and 1000 Hz energy in the expected region",()=>{
  const {cols,size,rate}=E.spectrogram("pair",512);
  const steady=cols[120];
  const at=hz=>steady[Math.round(hz*size/rate)];
  assert.ok(at(900)>at(600)*100);
  assert.ok(at(1000)>at(1400)*100);
  assert.ok(cols[0].every(x=>x===0));
});
test("endpoint timing exposes a false end and missed quiet speech",()=>{
  assert.deepEqual(E.endpoint(.2,260).ends,[760,1660]);
  assert.deepEqual(E.endpoint(.2,500).ends,[1900]);
  assert.deepEqual(E.endpoint(.3,500).ends,[1760]);
});
test("transcript revision has a distinct final commitment",()=>{
  assert.equal(E.partials[3][1],"read back paragraph forty");
  assert.equal(E.partials[4][2],"partial");
  assert.equal(E.partials[5][2],"final");
  assert.ok(E.partials[5][1].endsWith("fourteen"));
});
test("waterfall changes only the critical dependencies",()=>{
  const args={capture:40,endpoint:220,model:180,tts:100,playout:60};
  assert.equal(E.waterfall(args,false).total,600);
  assert.equal(E.waterfall(args,true).total,420);
  assert.equal(E.waterfall({...args,model:100},true).total,420);
  assert.equal(E.waterfall({...args,endpoint:100},true).total,380);
});
test("interruption preserves heard text, clears queue and rejects old epoch",()=>{
  let p=E.newPlayer();
  for(const action of ["generate","present","interrupt"])p=E.playerStep(p,action);
  assert.equal(p.heard,1);assert.equal(p.generated,1);assert.equal(p.mode,"paused");
  p=E.playerStep(p,"stale");assert.equal(p.heard,1);
  p=E.playerStep(p,"ask");assert.ok(p.answer.includes("Rain"));assert.ok(!p.answer.includes("observatory"));
  p=E.playerStep(p,"resume");assert.equal(E.spans[p.heard].from,5);assert.equal(p.generated,p.heard);
});
test("playback terminates and independent sessions stay isolated",()=>{
  let a=E.newPlayer(),b=E.newPlayer();
  for(let i=0;i<12;i++){a=E.playerStep(a,"generate");a=E.playerStep(a,"present");}
  assert.equal(a.mode,"finished");assert.equal(a.heard,E.spans.length);
  assert.deepEqual(b,E.newPlayer());
  assert.equal(E.playerStep(a,"present").heard,a.heard);
});
test("edit distance handles insertion deletion repetition and empty transcripts",()=>{
  assert.equal(E.editScore("a b","a c b").errors,1);
  assert.equal(E.editScore("a a b","a b").errors,1);
  assert.equal(E.editScore("a","").errors,1);
  assert.equal(E.editScore("","a").n,0);
  assert.equal(E.editScore("a b","c d").errors,2);
});
test("normalization and playback faults affect different quality gates",()=>{
  const baseline=E.evaluate(false,false), normalized=E.evaluate(true,false),fault=E.evaluate(false,true);
  assert.equal(baseline.errors,3);assert.equal(baseline.words,15);
  assert.equal(normalized.errors,2);assert.equal(normalized.playbackPass,true);
  assert.equal(fault.errors,baseline.errors);assert.equal(fault.playbackPass,false);assert.equal(fault.anchor,13);
});
