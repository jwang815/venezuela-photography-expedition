const fs = require('fs');
const d = require('./data.js');
const docx = require('docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,LevelFormat,
  HeadingLevel,BorderStyle,WidthType,ShadingType,Header,Footer,PageNumber,ExternalHyperlink,PageBreak} = docx;

const CW = 9360;
const C = {caracas:"6C5CE7", delta:"2E8B57", merida:"5B7FB0", canaima:"E8820C", losroques:"0BB3C9",
  ink:"1B2430", soft:"5B6675", head:"10384A", line:"CCCCCC", headfill:"EEF1F5",
  good:"0C6B48", goodfill:"E3F5EC", warnfill:"FBEEDE", badfill:"FBE3DA", note:"FFF8E9"};
const regionName = {caracas:"Caracas", delta:"Orinoco Delta", merida:"Mérida (Andes)", canaima:"Canaima · Angel Falls", losroques:"Los Roques"};
const border = {style:BorderStyle.SINGLE,size:1,color:C.line};
const borders = {top:border,bottom:border,left:border,right:border};
const cellM = {top:60,bottom:60,left:110,right:110};
function tx(t,o={}){return new TextRun({text:String(t),...o});}
function P(ch,o={}){return new Paragraph({children:Array.isArray(ch)?ch:[ch],...o});}
function cell(ch,{w,fill,colspan}={}){return new TableCell({borders,width:{size:w,type:WidthType.DXA},columnSpan:colspan,
  shading:fill?{fill,type:ShadingType.CLEAR}:undefined,margins:cellM,children:Array.isArray(ch)?ch:[ch]});}
function headRow(labels,widths){return new TableRow({tableHeader:true,children:labels.map((l,i)=>cell(
  P(tx(l,{bold:true,size:18,color:C.soft})),{w:widths[i],fill:C.headfill}))});}
function table(widths,rows){return new Table({width:{size:CW,type:WidthType.DXA},columnWidths:widths,rows});}
const numbering={config:[{reference:"bul",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,
  style:{paragraph:{indent:{left:460,hanging:240}}}}]}]};
function bullet(runs){return new Paragraph({numbering:{reference:"bul",level:0},spacing:{after:80},children:Array.isArray(runs)?runs:[runs]});}
function bulletLeadList(arr){return arr.map(x=>bullet([tx(x[0]+". ",{bold:true}),tx(x[1])]));}

const story=[];
// Title
story.push(new Paragraph({spacing:{after:60},children:[tx(d.meta.title.toUpperCase(),{bold:true,size:40,color:C.head})]}));
story.push(new Paragraph({spacing:{after:60},children:[tx(d.meta.subtitle,{size:24,color:C.soft})]}));
story.push(new Paragraph({spacing:{after:40},children:[tx(d.meta.dates,{bold:true,size:24})]}));
story.push(new Paragraph({spacing:{after:40},children:[tx(d.meta.routeline,{size:22,color:C.head,bold:true})]}));
story.push(new Paragraph({spacing:{after:40},children:[tx(d.meta.crew,{size:20,color:C.soft})]}));
story.push(new Paragraph({spacing:{after:200},children:[tx(d.meta.prepared,{size:20,color:C.soft,italics:true})]}));
// Recommendation
story.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[tx("The recommendation")]}));
story.push(new Paragraph({spacing:{after:120},children:[tx(d.summary.headline,{bold:true,size:23})]}));
d.summary.body.forEach(p=>story.push(new Paragraph({spacing:{after:120},children:[tx(p)]})));
// Decision table
story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200},children:[tx(d.decision.title)]}));
{
  const W=[2000,5560,1800];
  const rows=[headRow(["Option","Assessment","Verdict"],W)];
  d.decision.rows.forEach(r=>{
    const v=r[2]; const fill=/^IN/i.test(v)?C.goodfill:(/Cut/i.test(v)?C.badfill:C.warnfill);
    const col=/^IN/i.test(v)?C.good:(/Cut/i.test(v)?"9A3217":"8A5A12");
    rows.push(new TableRow({children:[
      cell(P(tx(r[0],{bold:true,size:19})),{w:W[0]}),
      cell(P(tx(r[1],{size:18})),{w:W[1]}),
      cell(P(tx(v,{size:17,bold:true,color:col})),{w:W[2],fill})
    ]}));
  });
  story.push(table(W,rows));
}
// Delta weather callout
story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200},children:[tx(d.deltaWeather.title)]}));
d.deltaWeather.body.forEach(p=>story.push(new Paragraph({spacing:{after:100},
  shading:{fill:"EAF3EE",type:ShadingType.CLEAR},border:{left:{style:BorderStyle.SINGLE,size:18,color:C.delta,space:6}},
  children:[tx(p,{size:19})]})));
// Route
if(d.deltaPricing){var dp=d.deltaPricing;
 story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200},children:[tx(dp.title)]}));
 story.push(new Paragraph({spacing:{after:100},children:[tx(dp.intro,{italics:true,size:18,color:C.soft})]}));
 var DW=[5560,1800,2000];
 var drows=[headRow(["Item","Per person","Total"],DW)];
 dp.rows.forEach(function(r){drows.push(new TableRow({children:[cell(P(tx(r[0],{size:18})),{w:DW[0]}),cell(P(tx(r[1],{size:18})),{w:DW[1]}),cell(P(tx(r[2],{bold:true,size:18})),{w:DW[2]})]}));});
 drows.push(new TableRow({children:[cell(P(tx("Total",{bold:true,size:18})),{w:DW[0],fill:C.headfill}),cell(P(tx(" ",{size:18})),{w:DW[1],fill:C.headfill}),cell(P(tx(dp.total,{bold:true,size:18,color:C.good})),{w:DW[2],fill:C.headfill})]}));
 story.push(table(DW,drows));
 story.push(new Paragraph({spacing:{before:80},children:[tx(dp.note,{italics:true,size:17,color:C.soft})]}));
}
story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200},children:[tx("Route & nights")]}));
{
  const W=[2400,4560,2400];
  const rows=[headRow(["Base","Why","Nights"],W)];
  d.route.forEach(r=>rows.push(new TableRow({children:[
    cell(P(tx(r[0],{bold:true,size:20})),{w:W[0]}),cell(P(tx(r[1],{size:20})),{w:W[1]}),
    cell(P(tx(r[2],{size:19,color:C.soft})),{w:W[2]})]})));
  story.push(table(W,rows));
}
// Flights
story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200},children:[tx("Verified internal flights")]}));
story.push(new Paragraph({spacing:{after:100},children:[tx(d.flights.intro,{italics:true,size:19,color:C.soft})]}));
{
  const W=[2150,4360,1450,1400];
  const rows=[headRow(["Leg","Detail (June 2026 schedule)","Baggage","Status"],W)];
  d.flights.rows.forEach(f=>{const ok=/Confirmed|Verified|Road/i.test(f.conf);
    rows.push(new TableRow({children:[
      cell([P(tx(f.route,{bold:true,size:19})),P(tx(f.when,{size:17,color:C.soft}))],{w:W[0]}),
      cell(P(tx(f.detail,{size:18})),{w:W[1]}),cell(P(tx(f.bag,{size:18})),{w:W[2]}),
      cell(P(tx(f.conf,{size:17,bold:true,color:ok?C.good:"8A5A12"})),{w:W[3],fill:ok?C.goodfill:C.warnfill})]}));});
  story.push(table(W,rows));
}
story.push(new Paragraph({spacing:{before:80},children:[tx(d.flights.cut,{italics:true,size:18,color:C.soft})]}));
// Weather
story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200},children:[tx("Weather, ranked")]}));
story.push(new Paragraph({spacing:{after:100},children:[tx(d.weather.intro,{italics:true,size:19,color:C.soft})]}));
{
  const W=[2050,2250,3360,1700];
  const rows=[headRow(["Region","Rain","For a photographer","Verdict"],W)];
  d.weather.rows.forEach(r=>{const v=r[3];const fill=/WORKABLE/.test(v)?C.goodfill:(/WASHOUT/.test(v)?C.badfill:C.warnfill);
    rows.push(new TableRow({children:[
      cell(P(tx(r[0],{bold:true,size:19})),{w:W[0]}),cell(P(tx(r[1],{size:18})),{w:W[1]}),
      cell(P(tx(r[2],{size:18})),{w:W[2]}),cell(P(tx(v,{size:17,bold:true})),{w:W[3],fill})]}));});
  story.push(table(W,rows));
}
// Days
story.push(new Paragraph({children:[new PageBreak()]}));
story.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[tx("Day by day, hour by hour")]}));
story.push(new Paragraph({spacing:{after:120},children:[tx("Sunrise/sunset are approximate — confirm exact golden hour in PhotoPills on location.",{italics:true,size:19,color:C.soft})]}));
d.days.forEach(day=>{
  const col=C[day.region];
  story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200,after:40},
    children:[tx(`Day ${day.n} — ${day.dow} ${day.date} — ${day.title}`,{color:col})]}));
  story.push(new Paragraph({spacing:{after:30},children:[
    tx(regionName[day.region]+"  ·  ",{bold:true,size:18,color:col}),
    tx(day.base+"  ·  ",{size:18,color:C.ink}),tx(day.sun,{size:18,color:C.soft})]}));
  story.push(new Paragraph({spacing:{after:80},children:[tx("Transit: ",{bold:true,size:18,color:C.soft}),tx(day.transit,{size:18,italics:true,color:C.soft})]}));
  const W=[900,8460];
  const rows=day.blocks.map(b=>new TableRow({children:[
    cell(P(tx(b[0],{bold:true,size:18})),{w:W[0],fill:"F3F5F8"}),cell(P(tx(b[1],{size:18})),{w:W[1]})]}));
  story.push(table(W,rows));
  const chip=(label,val)=>new Paragraph({spacing:{before:60},children:[tx(label+"  ",{bold:true,size:16,color:C.soft}),tx(val,{size:18})]});
  if(day.shots&&day.shots!=="—")story.push(chip("SHOTS",day.shots));
  if(day.stay&&day.stay!=="—")story.push(chip("STAY",day.stay));
  if(day.eat&&day.eat!=="—")story.push(chip("EAT",day.eat));
  if(day.note)story.push(new Paragraph({spacing:{before:60,after:120},
    shading:{fill:C.note,type:ShadingType.CLEAR},border:{left:{style:BorderStyle.SINGLE,size:18,color:"E8C76A",space:6}},
    children:[tx("Note. ",{bold:true,size:18,color:"6B4E16"}),tx(day.note,{size:18,color:"6B4E16"})]}));
});
// Lists
function listSection(title,arr){story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:240},children:[tx(title)]}));
  bulletLeadList(arr).forEach(p=>story.push(p));}
story.push(new Paragraph({children:[new PageBreak()]}));
if(d.placeholder){var ph=d.placeholder;
 story.push(new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:200},children:[tx(ph.title,{color:"9A3217"})]}));
 story.push(new Paragraph({spacing:{after:120},shading:{fill:"FBE3DA",type:ShadingType.CLEAR},border:{left:{style:BorderStyle.SINGLE,size:18,color:"9A3217",space:6}},children:[tx(ph.warning,{size:18,color:"7A2A14"})]}));
 story.push(new Paragraph({spacing:{after:100},children:[tx(ph.intro,{italics:true,size:19,color:C.soft})]}));
 var PW=[3200,6160];
 var prows=ph.fields.map(function(f){return new TableRow({children:[cell(P(tx(f,{bold:true,size:18})),{w:PW[0],fill:"F3F5F8"}),cell(P(tx("  ",{size:18})),{w:PW[1]})]});});
 story.push(table(PW,prows));
 story.push(new Paragraph({spacing:{before:80},children:[tx(ph.foot,{italics:true,size:17,color:C.soft})]}));
}
story.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[tx("Hero-shot map")]}));
d.heroShots.forEach(h=>story.push(bullet([tx(h[0],{bold:true}),tx("  ("+h[1]+")  ",{bold:true,color:C.head}),tx(h[2])])));
listSection("Health & entry",d.health);
listSection("Safety & security",d.safety);
listSection("Money & fees",d.money);
listSection("What to book now",d.bookNow);
listSection("Photographer's packing notes",d.packing);
listSection("Caveats & confidence",d.caveats);
story.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:240},children:[tx("Sources")]}));
d.sources.forEach(s=>story.push(new Paragraph({numbering:{reference:"bul",level:0},spacing:{after:80},children:[
  new ExternalHyperlink({link:s[1],children:[tx(s[0],{style:"Hyperlink",color:"0563C1",underline:{}})]})]})));

const doc=new Document({creator:"Cowork",title:d.meta.title,
  styles:{default:{document:{run:{font:"Arial",size:22,color:C.ink}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:32,bold:true,font:"Arial",color:C.head},paragraph:{spacing:{before:200,after:140},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:26,bold:true,font:"Arial",color:C.ink},paragraph:{spacing:{before:160,after:80},outlineLevel:1}}]},
  numbering,
  sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1300,right:1440,bottom:1300,left:1440}}},
    footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,
      children:[tx("Venezuela Photography Expedition  ·  23 Jun – 10 Jul 2026  ·  Page ",{size:16,color:C.soft}),
        new TextRun({children:[PageNumber.CURRENT],size:16,color:C.soft})]})]})},
    children:story}]});
Packer.toBuffer(doc).then(buf=>{fs.writeFileSync("itinerary.docx",buf);console.log("itinerary.docx written:",buf.length,"bytes");});
