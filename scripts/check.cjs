const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const vega = require('../vendor/vega.min.js');
const lite = {};
vm.runInNewContext(fs.readFileSync(path.join(root,'vendor/vega-lite.min.js'),'utf8'), {
  exports:lite, module:{exports:lite}, require:name => { assert.equal(name,'vega'); return vega; }, console, structuredClone
});
const nsw = JSON.parse(fs.readFileSync(path.join(root,'data/nsw.json')));
assert.equal(nsw.catch.length,80);
assert.equal(new Set(nsw.catch.map(r=>`${r.species}|${r.year}`)).size,80);
assert.equal(new Set(nsw.catch.map(r=>r.species)).size,20);
for (const row of nsw.catch) {
  for (const key of ['total','kept','released']) assert.ok(Number.isInteger(row[key]) && row[key]>=0);
  assert.ok(Math.abs(row.total-row.kept-row.released)<=1,`Rounding mismatch: ${row.species}, ${row.year}`);
  assert.ok(row.release_share>=0 && row.release_share<=1);
  assert.equal(row.release_share,row.released/row.total);
}
const national = JSON.parse(fs.readFileSync(path.join(root,'data/national.json')));
assert.equal(national.interstate_employment_flows.length,56);
assert.ok(national.interstate_employment_flows.every(r=>r.origin!==r.destination && r.fte_jobs>=0));
assert.equal(national.interstate_employment_flows.reduce((n,r)=>n+r.fte_jobs,0),28736);
const charts=fs.readdirSync(path.join(root,'specs')).filter(n=>n.endsWith('.json'));
assert.equal(charts.length,11);
for(const name of charts) {
  const spec=JSON.parse(fs.readFileSync(path.join(root,'specs',name)));
  const compiled=spec.$schema.includes('vega-lite')?lite.compile(spec).spec:spec;
  vega.parse(compiled);
  const walk=value=>{
    if(!value || typeof value!=='object')return;
    if(typeof value.url==='string' && value.url.startsWith('data/'))assert.ok(fs.existsSync(path.join(root,value.url)),value.url);
    Object.values(value).forEach(walk);
  };
  walk(spec);
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.equal((html.match(/data-spec=/g)||[]).length,11);
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target=match[1];
  if(!/^(https?:|data:)/.test(target))assert.ok(fs.existsSync(path.join(root,target)),`Missing local asset: ${target}`);
}
const dataBytes=fs.readdirSync(path.join(root,'data')).reduce((sum,name)=>sum+fs.statSync(path.join(root,'data',name)).size,0);
assert.ok(dataBytes<2_000_000,`Data payload exceeds 2 MB: ${dataBytes}`);
console.log(`Checked ${charts.length} chart specifications, 80 catch records, 56 interstate flows and all local HTML assets. Data: ${dataBytes.toLocaleString()} bytes.`);
