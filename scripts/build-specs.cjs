/* Generate readable, standalone chart JSON. Re-run after changing data or design. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const national = JSON.parse(fs.readFileSync(path.join(root, 'data/national.json')));
const nsw = JSON.parse(fs.readFileSync(path.join(root, 'data/nsw.json')));
const geo = JSON.parse(fs.readFileSync(path.join(root, 'data/australia.geojson')));
const C = {ink:'#21374b', sea:'#386f98', light:'#b9cddd', pale:'#e8eef2', copper:'#ad5738', gold:'#856720', grey:'#536371', blue:'#725a7a'};
const config = {background:null, font:'Source Sans 3', view:{stroke:null}, axis:{labelFontSize:12,titleFontSize:12,titleFontWeight:500,labelColor:C.grey,titleColor:C.ink,domain:false,ticks:false,gridColor:'#d7e0e6',labelPadding:8,titlePadding:14},legend:{labelFontSize:12,titleFontSize:12,labelColor:C.ink,titleColor:C.ink,orient:'bottom',titleFontWeight:500,padding:12},style:{cell:{stroke:null}}};
const base = { '$schema':'https://vega.github.io/schema/vega-lite/v5.json', width:600, height:340, autosize:{type:'fit',contains:'padding'}, config };
function save(name,spec){ fs.writeFileSync(path.join(root,`specs/${name}.json`),JSON.stringify(spec,null,2)+'\n'); }
function vl(name,spec){save(name,{...base,...spec});}
const short = { 'Western Australia':'WA', 'Northern Territory':'NT', 'South Australia':'SA', Queensland:'QLD',Tasmania:'TAS',Victoria:'VIC','Australian Capital Territory':'ACT','New South Wales':'NSW','Jervis Bay Territory':'JBT'};
const coords={WA:[121,-26],NT:[133,-20],SA:[135,-30],QLD:[145,-23],NSW:[147,-33],ACT:[149.13,-35.28],VIC:[144,-37],TAS:[147,-42]};
const mapFeatures=geo.features.filter(f=>short[f.properties.name]!=='JBT').map(f=>({...f,properties:{...f.properties,code:short[f.properties.name],region:['NSW','ACT'].includes(short[f.properties.name])?'NSW/ACT':short[f.properties.name]}}));
fs.writeFileSync(path.join(root,'data/australia.geojson'),JSON.stringify({type:'FeatureCollection',features:mapFeatures})+'\n');
const mapData={url:'data/australia.geojson',format:{type:'json',property:'features'}};
const projection={type:'conicEqualArea',parallels:[-18,-36],rotate:[-133,0,0],center:[0,-28]};
const mapBg={data:mapData,mark:{type:'geoshape',fill:'#dce4eb',stroke:'#f6f7f8',strokeWidth:1.3}};
const labels=Object.entries(coords).filter(([code])=>code!=='ACT').map(([code,[lon,lat]])=>({code,lon,lat}));
const labelLayer={data:{values:labels},mark:{type:'text',font:'Source Sans 3',fontSize:11,fontWeight:600,color:C.ink},encoding:{longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},text:{field:'code'}}};
const combinedLabels=labels.map(r=>({...r,code:r.code==='NSW'?'NSW/ACT':r.code}));
const combinedLabelLayer={...labelLayer,data:{values:combinedLabels}};

// 01. A 100-cell waffle: each tile is one percentage point, not one person.
vl('01-waffle',{height:230,padding:0,description:'20 of 100 tiles represent the 20.0% of Australian adults who fished in 2020.',data:{values:Array.from({length:100},(_,i)=>({col:i%10,row:Math.floor(i/10),group:i<20?'Fished in 2020':'Did not fish in 2020'}))},mark:{type:'rect',cornerRadius:2,stroke:'#f6f7f8',strokeWidth:4},encoding:{x:{field:'col',type:'ordinal',axis:null},y:{field:'row',type:'ordinal',axis:null},color:{field:'group',type:'nominal',scale:{domain:['Fished in 2020','Did not fish in 2020'],range:[C.sea,'#cdd9e3']},legend:null},tooltip:[{field:'group',title:'Adult population'}]}});

// 02. Normalised rates on a regional equal-area projection. NSW/ACT is one survey region.
vl('02-participation-map',{height:440,projection,description:'Percentage of adults who fished at least once in 2020, by state or combined NSW/ACT region.',layer:[{data:mapData,transform:[{lookup:'properties.region',from:{data:{values:national.state_participation.filter(r=>r.year===2020)},key:'region',fields:['participation_percent']}}],mark:{type:'geoshape',stroke:'#f6f7f8',strokeWidth:1.5},encoding:{color:{field:'participation_percent',type:'quantitative',title:'Adults who fished (%)',scale:{domain:[15,36],range:['#e1ebf2','#305c80']},legend:{format:'.0f',gradientLength:200}},tooltip:[{field:'properties.region',title:'Survey region'},{field:'participation_percent',title:'Adults who fished in 2020 (%)',format:'.1f'}]}},{...combinedLabelLayer,encoding:{...combinedLabelLayer.encoding,color:{condition:{test:"datum.code === 'NT'",value:'#ffffff'},value:C.ink}}}]});

// 03. A slope graph makes the two observed years explicit, without a continuous time-series claim.
vl('03-age-slopes',{height:340,padding:{left:55,right:95,top:25,bottom:35},data:{values:national.age_participation},encoding:{x:{field:'year',type:'ordinal',axis:{title:null,labelAngle:0,labelFontWeight:700}},y:{field:'participation_percent',type:'quantitative',scale:{domain:[12,29]},axis:{title:'Adults who fished (%)',values:[15,20,25]}},color:{field:'age_group',type:'nominal',scale:{domain:['18–29','30–44','45–64','65+'],range:[C.sea,C.copper,C.blue,C.gold]},legend:null},detail:{field:'age_group'},tooltip:[{field:'age_group',title:'Age group'},{field:'year',title:'Year'},{field:'participation_percent',title:'Participation (%)',format:'.1f'}]},layer:[{mark:{type:'line',strokeWidth:3}},{mark:{type:'point',filled:true,size:90}},{transform:[{filter:'datum.year === 2018'}],mark:{type:'text',align:'right',dx:-9,fontSize:12},encoding:{text:{field:'participation_percent',format:'.1f'}}},{transform:[{filter:'datum.year === 2020'},{calculate:"datum.age_group + ' · ' + format(datum.participation_percent, '.1f') + '%'",as:'label'}],mark:{type:'text',align:'left',dx:10,fontSize:12,fontWeight:600},encoding:{text:{field:'label'}}}]});

// 04. Proportional symbol area encodes people, not the administrative region's land area.
const fishers=national.state_fishers_2018.map(r=>({...r,lon:coords[r.region==='NSW/ACT'?'NSW':r.region][0],lat:coords[r.region==='NSW/ACT'?'NSW':r.region][1]}));
vl('04-fisher-numbers',{height:370,projection,layer:[mapBg,{data:{values:fishers},mark:{type:'circle',color:C.sea,opacity:0.7,stroke:'#ffffff',strokeWidth:1.5},encoding:{longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},size:{field:'estimated_fishers',type:'quantitative',title:'Adult fishers (2018)',scale:{range:[0,4500],zero:true},legend:{values:[100000,500000,1000000],format:'.2s'}},tooltip:null}},{...combinedLabelLayer,mark:{...labelLayer.mark,dy:-8}}]});
let sym=JSON.parse(fs.readFileSync(path.join(root,'specs/04-fisher-numbers.json')));sym.layer[1].encoding.tooltip=[{field:'region',title:'Survey region'},{field:'estimated_fishers',title:'Estimated adult fishers in 2018',format:',.0f'}];delete sym.layer[1].tooltip;save('04-fisher-numbers',sym);

// 05. Vega's treemap lays out the 20 monitored species; the denominator is this explicit subset.
const latest=nsw.catch.filter(r=>r.year==='2023/24').sort((a,b)=>b.total-a.total);
const speciesColour=[C.sea,C.blue,C.copper,C.gold,'#486e78','#5b6d48','#8a5369','#536477'];
save('05-catch-treemap',{
 '$schema':'https://vega.github.io/schema/vega/v5.json',width:600,height:380,padding:0,autosize:{type:'fit',contains:'padding'},background:null,
 data:[{name:'tree',values:[{id:'root',parent:null,total:0},...latest.map((r,i)=>({...r,id:r.species,parent:'root',colour:speciesColour[i%speciesColour.length]}))],transform:[{type:'stratify',key:'id',parentKey:'parent'},{type:'treemap',field:'total',sort:{field:'value',order:'descending'},round:true,size:[{signal:'width'},{signal:'height'}],paddingInner:3}]},{name:'leaves',source:'tree',transform:[{type:'filter',expr:'datum.depth === 1'}]}],
 marks:[{type:'rect',from:{data:'leaves'},encode:{enter:{x:{field:'x0'},x2:{field:'x1'},y:{field:'y0'},y2:{field:'y1'},fill:{field:'colour'},stroke:{value:'#f6f7f8'},strokeWidth:{value:1}},update:{tooltip:{signal:"{Species:datum.species, 'Estimated catches':format(datum.total, ','), 'Year':'2023/24'}"}},hover:{stroke:{value:C.ink},strokeWidth:{value:2}}}},{type:'text',from:{data:'leaves'},encode:{update:{x:{signal:'(datum.x0+datum.x1)/2'},y:{signal:'(datum.y0+datum.y1)/2-7'},text:{field:'species'},align:{value:'center'},baseline:{value:'middle'},font:{value:'Source Sans 3'},fontWeight:{value:600},fontSize:{value:12},fill:{value:'#ffffff'},limit:{signal:'datum.x1-datum.x0-12'},opacity:{signal:'datum.x1-datum.x0>70 && datum.y1-datum.y0>35 ? 1 : 0'}}}},{type:'text',from:{data:'leaves'},encode:{update:{x:{signal:'(datum.x0+datum.x1)/2'},y:{signal:'(datum.y0+datum.y1)/2+12'},text:{signal:"format(datum.total/1000, '.0f')+'k'"},align:{value:'center'},baseline:{value:'middle'},font:{value:'Source Sans 3'},fontSize:{value:12},fill:{value:'#ffffff'},opacity:{signal:'datum.x1-datum.x0>70 && datum.y1-datum.y0>45 ? 1 : 0'}}}}]
});

// 06. Heatmap: release share, not catch volume. Original estimates remain in tooltips.
const displaySpecies=latest.map(r=>r.species);
vl('06-release-heatmap',{height:570,padding:{left:8,right:12,top:5,bottom:10},data:{url:'data/nsw.json',format:{type:'json',property:'catch'}},mark:{type:'rect',stroke:'#f6f7f8',strokeWidth:3,cornerRadius:2},encoding:{x:{field:'year',type:'ordinal',sort:['2017/18','2019/20','2021/22','2023/24'],axis:{title:null,labelAngle:0,orient:'top',labelFontWeight:600}},y:{field:'species',type:'nominal',sort:displaySpecies,axis:{title:null,labelLimit:145}},color:{field:'release_share',type:'quantitative',scale:{domain:[0,1],range:['#e9eff4','#305c80']},title:'Share released',legend:{format:'.0%',gradientLength:200}},tooltip:[{field:'species',title:'Species / group'},{field:'year',title:'Survey'},{field:'release_share',title:'Released',format:'.1%'},{field:'released',title:'Estimated released',format:',.0f'},{field:'total',title:'Estimated caught',format:',.0f'}]}});

// 07. Paired endpoints compare point estimates; the page explicitly describes uncertainty.
const compare=latest.filter(r=>!['Blue Swimmer Crab','Yabbies'].includes(r.species)).slice(0,8).map(r=>{const old=nsw.catch.find(v=>v.year==='2021/22'&&v.species===r.species);return {species:r.species,before:old.total,after:r.total,change:r.total-old.total};});
vl('07-catch-change',{height:360,data:{values:compare},encoding:{y:{field:'species',type:'nominal',sort:compare.map(r=>r.species),axis:{title:null,labelLimit:130}},tooltip:[{field:'species',title:'Species / group'},{field:'before',title:'2021/22 catches',format:',.0f'},{field:'after',title:'2023/24 catches',format:',.0f'}]},layer:[{mark:{type:'rule',color:'#a9bac7',strokeWidth:3},encoding:{x:{field:'before',type:'quantitative',scale:{domain:[0,1400000]},axis:{title:'Estimated individual catches',format:'.2s',tickCount:4}},x2:{field:'after'}}},{transform:[{fold:['before','after'],as:['survey','catches']}],mark:{type:'point',filled:true,size:90,stroke:'#ffffff',strokeWidth:1},encoding:{x:{field:'catches',type:'quantitative'},color:{field:'survey',scale:{domain:['before','after'],range:[C.gold,C.sea]},legend:{title:null,labelExpr:"datum.label === 'before' ? '2021/22' : '2023/24'"}},shape:{field:'survey',type:'nominal',scale:{domain:['before','after'],range:['circle','diamond']},legend:{title:null,labelExpr:"datum.label === 'before' ? '2021/22' : '2023/24'"}}}}]});

// 08. A local selection changes the one series shown, keeping a zero baseline.
vl('08-catch-timeline',{height:340,params:[{name:'species',value:'Snapper'}],data:{url:'data/nsw.json',format:{type:'json',property:'catch'}},transform:[{filter:'datum.species === species'}],mark:{type:'line',color:C.sea,strokeWidth:3,point:{filled:true,size:75,color:C.sea}},encoding:{x:{field:'year',type:'ordinal',sort:['2017/18','2019/20','2021/22','2023/24'],axis:{title:null,labelAngle:0}},y:{field:'total',type:'quantitative',scale:{zero:true},axis:{title:'Estimated individual catches',format:'.2s',tickCount:5}},tooltip:[{field:'species',title:'Species / group'},{field:'year',title:'Survey'},{field:'total',title:'Estimated catch',format:',.0f'},{field:'kept',title:'Kept',format:',.0f'},{field:'released',title:'Released',format:',.0f'}]}});

// 09. Sankey: a measured partition of the six most-caught monitored finfish.
const six=latest.filter(r=>!['Blue Swimmer Crab','Yabbies'].includes(r.species)).slice(0,6);
const sum=six.reduce((t,r)=>t+r.kept+r.released,0),kept=six.reduce((t,r)=>t+r.kept,0);
let leftOffset=0,rightOffsets={Kept:0,Released:kept};const links=[],nodes=[];
six.forEach((r,i)=>{const total=r.kept+r.released;nodes.push({name:r.species,side:'source',start:leftOffset,end:leftOffset+total,rank:i,value:total});let inner=0;for(const [fate,field] of [['Kept','kept'],['Released','released']]){const value=r[field];links.push({species:r.species,fate,value,start:leftOffset+inner+value/2,end:rightOffsets[fate]+value/2,rank:i,colour:fate==='Kept'?C.copper:C.sea});inner+=value;rightOffsets[fate]+=value;}leftOffset+=total;});
nodes.push({name:'Kept',side:'target',start:0,end:kept,rank:0,value:kept},{name:'Released',side:'target',start:kept,end:sum,rank:1,value:sum-kept});
save('09-catch-sankey',{'$schema':'https://vega.github.io/schema/vega/v5.json',width:700,height:420,padding:{left:0,right:0,top:12,bottom:12},autosize:{type:'fit',contains:'padding'},background:null,signals:[{name:'xLeft',update:'width < 500 ? 112 : 150'},{name:'xRight',update:'width-92'},{name:'flowHeight',update:'height-66'},{name:'unit',update:`flowHeight/${sum}`}],data:[{name:'links',values:links},{name:'nodes',values:nodes}],marks:[{type:'path',from:{data:'links'},encode:{update:{path:{signal:"'M'+(xLeft+9)+','+(datum.start*unit+datum.rank*10)+' C'+(xLeft+(xRight-xLeft)*0.5)+','+(datum.start*unit+datum.rank*10)+' '+(xLeft+(xRight-xLeft)*0.5)+','+(datum.end*unit+(datum.fate==='Released'?50:0))+' '+xRight+','+(datum.end*unit+(datum.fate==='Released'?50:0))"},stroke:{field:'colour'},strokeWidth:{signal:'datum.value*unit'},strokeOpacity:{value:0.42},fill:{value:null},tooltip:{signal:"{Species:datum.species,Outcome:datum.fate,'Estimated individuals':format(datum.value, ',')}"}},hover:{strokeOpacity:{value:0.8}}}},{type:'rect',from:{data:'nodes'},encode:{update:{x:{signal:"datum.side==='source'?xLeft:xRight"},width:{value:9},y:{signal:"datum.start*unit+(datum.side==='source'?datum.rank*10:datum.rank*50)"},height:{signal:'(datum.end-datum.start)*unit'},fill:{signal:"datum.side==='source'?'#21374b':datum.name==='Kept'?'#ad5738':'#386f98'"}}}},{type:'text',from:{data:'nodes'},encode:{update:{x:{signal:"datum.side==='source'?xLeft-9:xRight+17"},y:{signal:"(datum.start+datum.end)/2*unit+(datum.side==='source'?datum.rank*10:datum.rank*50)"},text:{field:'name'},align:{signal:"datum.side==='source'?'right':'left'"},baseline:{value:'middle'},font:{value:'Source Sans 3'},fontSize:{value:12},fontWeight:{value:500},fill:{value:C.ink},limit:{signal:"datum.side==='source'?xLeft-12:85"}}}}]});

// 10. Directed economic flows: selected origin has an copper diamond; beneficiaries blue.
const flows=national.interstate_employment_flows.map(r=>({...r,type:'Feature',geometry:{type:'LineString',coordinates:[coords[r.origin],coords[r.destination]]},lon:coords[r.destination][0],lat:coords[r.destination][1]}));
vl('10-economic-flow-map',{height:440,projection,params:[{name:'origin',value:'VIC'}],layer:[mapBg,{data:{values:flows},transform:[{filter:'datum.origin === origin'}],mark:{type:'geoshape',filled:false,stroke:C.sea,strokeOpacity:0.65},encoding:{shape:{field:'geometry',type:'geojson'},strokeWidth:{field:'fte_jobs',type:'quantitative',scale:{domain:[0,3000],range:[0,14]},legend:{title:'FTE jobs supported',symbolType:'stroke',symbolSize:600,orient:'bottom',values:[100,1000,2500]}},tooltip:null}},{data:{values:flows},transform:[{filter:'datum.origin === origin'}],mark:{type:'circle',color:C.sea,size:50,opacity:1},encoding:{longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},tooltip:[{field:'origin',title:'Fisher residence'},{field:'destination',title:'Employment supported in'},{field:'fte_jobs',title:'FTE jobs (2018–19)',format:',.0f'}]}},{data:{values:Object.entries(coords).map(([code,[lon,lat]])=>({code,lon,lat}))},transform:[{filter:'datum.code === origin'}],mark:{type:'point',shape:'diamond',filled:true,color:C.copper,size:180,stroke:'#ffffff',strokeWidth:2},encoding:{longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},tooltip:[{field:'code',title:'Fisher residence (selected origin)'}]}},{...labelLayer,mark:{...labelLayer.mark,dy:-14}},
 {data:{values:[{lon:149.13,lat:-35.28,lon2:155,lat2:-36.4}]},mark:{type:'rule',color:C.grey,strokeWidth:1},encoding:{longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},longitude2:{field:'lon2'},latitude2:{field:'lat2'}}},
 {data:{values:[{code:'ACT',lon:155,lat:-36.4}]},mark:{type:'text',align:'left',dx:4,fontSize:11,fontWeight:600,color:C.ink},encoding:{longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},text:{field:'code'}}}
]});
let flowSpec=JSON.parse(fs.readFileSync(path.join(root,'specs/10-economic-flow-map.json')));flowSpec.layer[1].encoding.tooltip=[{field:'origin',title:'From residents of'},{field:'destination',title:'Employment supported in'},{field:'fte_jobs',title:'FTE jobs',format:',.0f'}];delete flowSpec.layer[1].tooltip;save('10-economic-flow-map',flowSpec);

// 11. GDP contribution by spending category. These are not retail expenditure totals.
const spending=national.spending_contributions.map(r=>({...r,label:r.category==='Vessel running and other non-capital costs'?'Vessel running & other costs':r.category==='Capital expenditure'?'Boats & other capital purchases':r.category}));
vl('11-economic-contribution',{height:330,data:{values:spending},mark:{type:'bar',color:C.sea,cornerRadiusEnd:3,height:26},encoding:{y:{field:'label',type:'nominal',sort:'-x',axis:{title:null,labelLimit:190}},x:{field:'gdp_total_aud_million',type:'quantitative',scale:{zero:true},axis:{title:'Contribution (A$m)',format:',.0f',tickCount:4}},tooltip:[{field:'category',title:'Spending category'},{field:'gdp_direct_aud_million',title:'Direct GDP (A$m)',format:',.0f'},{field:'gdp_flow_on_aud_million',title:'Flow-on GDP (A$m)',format:',.0f'},{field:'gdp_total_aud_million',title:'Total GDP contribution (A$m)',format:',.0f'}]}});
// Direct annotations let readers follow the story without relying on hover.
function annotate(name, apply) {
 const spec=JSON.parse(fs.readFileSync(path.join(root,`specs/${name}.json`)));
 apply(spec);
 save(name,spec);
}
annotate('02-participation-map',spec=>{
 const rows=national.state_participation.filter(r=>r.year===2020).map(r=>({
  ...r,lon:coords[r.region==='NSW/ACT'?'NSW':r.region][0],lat:coords[r.region==='NSW/ACT'?'NSW':r.region][1],
  label:`${r.region}\n${r.participation_percent.toFixed(1)}%`
 }));
 spec.layer[1]={data:{values:rows},mark:{type:'text',fontSize:11,fontWeight:600,lineBreak:'\n',lineHeight:14,dy:-5},encoding:{
  longitude:{field:'lon',type:'quantitative'},latitude:{field:'lat',type:'quantitative'},text:{field:'label'},
  color:{condition:{test:"datum.region === 'NT'",value:'#ffffff'},value:C.ink}
 }};
});
annotate('03-age-slopes',spec=>{
 spec.layer.push({data:{values:[{label:'Ages 30–44: −6 percentage points'}]},mark:{type:'text',align:'left',baseline:'bottom',fontSize:11,fontWeight:600},encoding:{x:{value:0},y:{value:-10},color:{value:C.copper},text:{field:'label'},tooltip:null}});
});
annotate('05-catch-treemap',spec=>{
 // Layout coordinates must update when a reader resizes the page.
 for(const key of ['x','x2','y','y2']){
  spec.marks[0].encode.update[key]=spec.marks[0].encode.enter[key];
  delete spec.marks[0].encode.enter[key];
 }
 spec.marks[1].interactive=false;
 spec.marks[2].interactive=false;
 spec.marks[2].encode.update.text={signal:"datum.total >= 1000000 ? format(datum.total/1000000, '.2f')+'m' : format(datum.total/1000, '.0f')+'k'"};
});
annotate('06-release-heatmap',spec=>{
 // RGB interpolation makes the black/white label switch predictable.
 spec.encoding.color.scale.interpolate='rgb';
 spec.encoding.color.legend.values=[0,0.25,0.5,0.75,1];
 spec.layer=[{mark:spec.mark},{mark:{type:'text',fontSize:11},encoding:{text:{field:'release_share',type:'quantitative',format:'.0%'},color:{condition:{test:'datum.release_share >= 0.8',value:'#ffffff'},value:'#000000'}}}];
 delete spec.mark;
});
annotate('08-catch-timeline',spec=>{
 spec.transform.push({calculate:"datum.total >= 1000000 ? format(datum.total/1000000, '.2f')+'m' : format(datum.total/1000, '.0f')+'k'",as:'catch_label'});
 spec.layer=[{mark:spec.mark},{mark:{type:'text',dy:-13,fontSize:11,fontWeight:600,color:C.ink},encoding:{text:{field:'catch_label'}}}];
 delete spec.mark;
});
annotate('09-catch-sankey',spec=>{
 // Stroke bounds overestimate the curved ribbons' extents. Automatic fitting
 // repeatedly shrank the inner width until source and target columns crossed.
 // All marks already have explicit, width-relative positions and label gutters.
 spec.autosize={type:'none',contains:'padding'};
 spec.data.push({name:'outcomes',source:'nodes',transform:[{type:'filter',expr:"datum.side === 'target'"}]});
 spec.marks.push({type:'text',from:{data:'outcomes'},encode:{update:{
  x:{signal:'xRight+17'},y:{signal:'(datum.start+datum.end)/2*unit+datum.rank*50+18'},
  text:{signal:`[format(datum.value/1000000, '.2f')+'m', format(datum.value/${sum}, '.0%')+' of total']`},
  align:{value:'left'},baseline:{value:'middle'},lineHeight:{value:14},font:{value:'Source Sans 3'},fontSize:{value:11},fill:{value:C.ink}
 }}});
});
annotate('11-economic-contribution',spec=>{
 spec.padding={left:22,right:8,top:5,bottom:5};
 spec.encoding.y.sort=[...spending].sort((a,b)=>b.gdp_total_aud_million-a.gdp_total_aud_million).map(row=>row.label);
 spec.layer=[{mark:spec.mark},{mark:{type:'text',align:'right',dx:-7,fontSize:11,fontWeight:600,color:'#ffffff'},encoding:{text:{field:'gdp_total_aud_million',format:',.0f'}}}];
 delete spec.mark;
});
console.log('Generated 11 Vega / Vega-Lite specifications.');
