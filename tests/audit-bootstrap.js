// Loaded only by serve.py --audit. Results are exposed in the DOM for inspection.
(() => {
  const result = document.createElement("script");
  result.type = "application/json";
  result.id = "accessibility-audit";
  document.body.append(result);
  let pending = false, active = false;
  async function audit() {
    if (active) { pending=true; return; }
    active=true;
    result.dataset.state = "running";
    result.dataset.route = location.hash;
    result.textContent = JSON.stringify({state:"running",route:location.hash});
    try {
      const data=await axe.run(document, {runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}});
      result.textContent=JSON.stringify({state:"complete",route:location.hash,passes:data.passes.length,
        violations:data.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
        incomplete:data.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))});
      result.dataset.state = "complete";
    }catch(e){result.textContent=JSON.stringify({state:"error",error:String(e)});}
    active=false;
    if(pending){pending=false;setTimeout(audit,120);}
  }
  window.addEventListener("hashchange",()=>setTimeout(audit,150));
  window.addEventListener("load",()=>setTimeout(audit,150));
})();
