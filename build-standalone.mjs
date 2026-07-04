import { writeFile } from "node:fs/promises";
import path from "node:path";

const outputFile = path.resolve("BESTATTUNGS-APP.html");

const html = String.raw`<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bestattungs-App</title>
    <style>
      :root{--paper:#fbfaf7;--surface:#fff;--soft:#f3f6f4;--line:#d9ded8;--text:#23302e;--muted:#66746f;--primary:#315c57;--accent:#9b7653;--danger:#9d3f36;font-family:Arial,"Segoe UI",sans-serif}
      *{box-sizing:border-box} body{margin:0;background:var(--paper);color:var(--text)} button,input,select,textarea{font:inherit} input,select,textarea{width:100%;border:1px solid var(--line);border-radius:6px;padding:9px;background:white} textarea{min-height:86px;resize:vertical}
      button{border:0;border-radius:6px;padding:10px 13px;font-weight:700;cursor:pointer}.primary{background:var(--primary);color:#fff}.secondary{background:var(--soft);border:1px solid var(--line);color:var(--text)}.danger{color:var(--danger)}
      .wrap{max-width:1420px;margin:0 auto;padding:22px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:20px}.top h1{margin:0;font-size:30px}.hint{color:var(--muted);margin:6px 0 0}.actions{display:flex;gap:8px;flex-wrap:wrap}.panel{background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:0 18px 38px #222d2b14}.panel-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--line)}.panel-body{padding:18px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.full{grid-column:1/-1}.field{display:grid;gap:5px;color:var(--muted);font-size:14px;font-weight:700}.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}.tab{background:transparent;border:1px solid var(--line)}.tab.active{background:var(--primary);color:#fff}
      table{width:100%;border-collapse:collapse} th,td{border-bottom:1px solid var(--line);padding:10px;text-align:left;vertical-align:middle} th{font-size:12px;text-transform:uppercase;color:var(--muted)} td input,td select{min-width:96px}.right{text-align:right}.pill{display:inline-block;background:var(--soft);border:1px solid var(--line);border-radius:99px;padding:4px 8px;font-size:13px;font-weight:700}.empty{text-align:center;padding:55px 20px;color:var(--muted)}
      .case-layout{display:grid;grid-template-columns:230px minmax(0,1fr);gap:16px}.side{display:grid;gap:8px;align-self:start}.side button{text-align:left}.service{display:grid;grid-template-columns:minmax(240px,1fr) 90px 130px 120px;gap:10px;align-items:end;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--soft);margin-bottom:8px}.check{display:flex;gap:8px;align-items:center;color:var(--text);font-weight:700}.check input{width:auto}.summary{background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:14px}.offer-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px}.sumrow{display:flex;justify-content:space-between;gap:12px;margin:10px 0}.sumrow.total{border-top:1px solid var(--line);padding-top:12px;font-size:20px;font-weight:800}.mini-actions{display:flex;gap:7px}.mini{padding:7px 9px}.checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.task{display:grid;grid-template-columns:1fr 135px;gap:8px;align-items:center;border:1px solid var(--line);background:var(--soft);border-radius:8px;padding:9px}.employees{display:flex;gap:8px;flex-wrap:wrap}.employees label{white-space:nowrap}.employees input{width:auto}.print-only{display:none}
      @media(max-width:900px){.top,.case-layout,.offer-layout,.grid,.checklist{grid-template-columns:1fr;display:grid}.service{grid-template-columns:1fr 90px 130px}.service strong{grid-column:1/-1}.side{display:flex;overflow:auto}.side button{white-space:nowrap}.top{align-items:start}.actions{width:100%}}
      @media print{.no-print,.side,.tabs,.actions button,.mini-actions{display:none!important}.wrap{max-width:none;padding:0}.panel{box-shadow:none;border:0}.panel-head{border-bottom:1px solid #999}.print-only{display:block}}
    </style>
  </head>
  <body>
    <div id="app">
      <div class="wrap">
        <h1>Bestattungs-App wird geladen...</h1>
        <p>Falls diese Meldung bleibt, bitte die Datei mit Google Chrome oder Microsoft Edge oeffnen.</p>
      </div>
    </div>
    <script>
      (function(){
        var STORE = "bestattungsunternehmen.cases.v2";
        var services = [
          ["basic","Grundpauschale Bestattung",1200],["cremation","Kremation organisieren",450],["burial","Erdbestattung organisieren",450],["coffin","Einsargen",250],["care","Ankleiden / hygienische Versorgung",180],["transfer","Ueberfuehrung lokal",350],["viewing","Aufbahrung",300],["standard-casket","Normaler Sarg",850],["simple-casket","Einfacher Sarg",650],["decorative-urn","Schmuckurne",280],["rental-urn","Leihurne",80],["urn-burial","Urnenbeisetzung organisieren",350],["ceremony","Abschied / Trauerfeier organisieren",500],["speech","Trauerrede",650],["music","Musik / Technik organisieren",250],["flowers","Blumen organisieren",150],["circulars","Leidzirkulare organisieren",180],["death-notice","Todesanzeige organisieren",150],["thanks","Danksagung organisieren",150]
        ];
        var billingExamples = ["Abschied begleiten","Urnenbeisetzung","Einsargen","Ueberfuehrung","Trauergespraech","Administration","Friedhof / Kirche koordinieren","Material","Sonstiges"];
        var checklistTasks = ["Todesfall aufgenommen","Arzt / Todesbescheinigung vorhanden","Zivilstandsamt informiert","Angehoerige kontaktiert","Abholung organisiert","Einsargen organisiert","Krematorium informiert","Friedhof informiert","Kirche / Kapelle reserviert","Pfarrer / Trauerredner organisiert","Blumen organisiert","Drucksachen organisiert","Todesanzeige organisiert","Urne / Sarg gewaehlt","Trauerfeier vorbereitet","Rechnung vorbereitet","Rechnung versendet","Fall abgeschlossen"];
        var statuses = ["neu","in Bearbeitung","offertiert","Rechnung vorbereitet","abgeschlossen"];
        var taskStatuses = ["offen","in Arbeit","erledigt"];
        var employees = ["Angela","Sabine","Natascha"];
        var app = document.getElementById("app");
        var state = { cases: load(), selectedId: null, view: "case" };

        function id(){ return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2); }
        function money(v){ return new Intl.NumberFormat("de-CH",{style:"currency",currency:"CHF"}).format(Number(v)||0); }
        function date(v){ if(!v) return "-"; try{return new Intl.DateTimeFormat("de-CH").format(new Date(v));}catch(e){return "-";} }
        function num(v){ var n = Number(v); return isFinite(n) ? n : 0; }
        function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];}); }
        function load(){ try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch(e) { return []; } }
        function save(){ try { localStorage.setItem(STORE, JSON.stringify(state.cases)); } catch(e) { alert("Speichern im Browser ist blockiert. Exportieren Sie die Daten regelmaessig als JSON."); } }
        function current(){ return state.cases.find(function(c){ return c.id === state.selectedId; }); }
        function touch(c){ c.updatedAt = new Date().toISOString(); save(); render(); }
        function newCase(){
          var now = new Date().toISOString();
          var c = { id:id(), createdAt:now, updatedAt:now, status:"neu",
            masterData:{firstName:"",lastName:"",birthDate:"",deathDate:"",deathPlace:"",address:"",contactPerson:"",phone:"",email:"",invoiceAddress:"",notes:""},
            offer:{items:services.map(function(s){return {id:s[0],name:s[1],price:s[2],selected:s[0]==="basic",quantity:1,manualPrice:s[2]};}),discount:0,notes:""},
            billing:{rows:[]},
            checklist:checklistTasks.map(function(t){return {id:id(),task:t,status:"offen"};}),
            schedule:[]
          };
          state.cases.unshift(c); state.selectedId = c.id; state.view = "case"; save(); render();
        }
        function offerTotals(c){ var sub = c.offer.items.filter(function(i){return i.selected;}).reduce(function(s,i){return s + num(i.quantity)*num(i.manualPrice);},0); var disc = num(c.offer.discount); return {subtotal:sub,discount:disc,total:Math.max(0,sub-disc)}; }
        function billingTotal(c){ return c.billing.rows.filter(function(r){return r.billable;}).reduce(function(s,r){return s + num(r.people)*num(r.hours)*num(r.rate);},0); }
        function title(c){ return ((c.masterData.firstName || "") + " " + (c.masterData.lastName || "")).trim() || "Neuer Todesfall"; }
        function exportJson(items){
          var blob = new Blob([JSON.stringify(items,null,2)],{type:"application/json"});
          var url = URL.createObjectURL(blob); var a = document.createElement("a");
          a.href = url; a.download = "bestattungs-faelle-" + new Date().toISOString().slice(0,10) + ".json"; a.click(); URL.revokeObjectURL(url);
        }

        window.appAction = function(action, a, b, c){
          var item = current();
          if(action === "new") return newCase();
          if(action === "dashboard"){ state.selectedId = null; render(); return; }
          if(action === "open"){ state.selectedId = a; state.view = "case"; render(); return; }
          if(action === "tab"){ state.view = a; render(); return; }
          if(action === "delete"){
            if(confirm("Diesen Fall wirklich loeschen?")){ state.cases = state.cases.filter(function(x){return x.id !== a;}); state.selectedId = null; save(); render(); }
            return;
          }
          if(action === "exportAll") return exportJson(state.cases);
          if(action === "exportCase") return exportJson([item]);
          if(action === "print") return window.print();
          if(!item) return;
          if(action === "status"){ item.status = a; return touch(item); }
          if(action === "master"){ item.masterData[a] = b; return touch(item); }
          if(action === "offerItem"){ var oi = item.offer.items.find(function(x){return x.id === a;}); oi[b] = c; return touch(item); }
          if(action === "offer"){ item.offer[a] = b; return touch(item); }
          if(action === "billAdd"){ item.billing.rows.push({id:id(),date:"",service:a||"",people:1,hours:0,rate:120,billable:true,note:""}); return touch(item); }
          if(action === "billDel"){ item.billing.rows = item.billing.rows.filter(function(x){return x.id !== a;}); return touch(item); }
          if(action === "bill"){ var br = item.billing.rows.find(function(x){return x.id === a;}); br[b] = c; return touch(item); }
          if(action === "check"){ var ck = item.checklist.find(function(x){return x.id === a;}); ck.status = b; return touch(item); }
          if(action === "schedAdd"){ item.schedule.push({id:id(),date:"",time:"",task:"",place:"",employees:[],note:"",status:"offen"}); return touch(item); }
          if(action === "schedDel"){ item.schedule = item.schedule.filter(function(x){return x.id !== a;}); return touch(item); }
          if(action === "sched"){ var sr = item.schedule.find(function(x){return x.id === a;}); sr[b] = c; return touch(item); }
          if(action === "emp"){ var er = item.schedule.find(function(x){return x.id === a;}); er.employees = er.employees.indexOf(b) >= 0 ? er.employees.filter(function(x){return x !== b;}) : er.employees.concat([b]); return touch(item); }
        };

        function render(){
          if(!state.selectedId) return renderDashboard();
          var c = current(); if(!c){ state.selectedId = null; return renderDashboard(); }
          app.innerHTML = '<div class="wrap"><div class="top no-print"><div><p class="hint">Todesfall</p><h1>'+esc(title(c))+'</h1><p class="hint">Automatisch lokal gespeichert</p></div><div class="actions"><button class="secondary" onclick="appAction(\\'dashboard\\')">Dashboard</button><select onchange="appAction(\\'status\\',this.value)">'+statuses.map(function(s){return '<option '+(c.status===s?'selected':'')+'>'+esc(s)+'</option>';}).join('')+'</select><button class="secondary" onclick="appAction(\\'exportCase\\')">JSON</button><button class="secondary" onclick="appAction(\\'print\\')">Drucken</button></div></div><div class="case-layout"><aside class="side no-print">'+tabButton("case","Stammdaten")+tabButton("offer","Trauergespraech")+tabButton("billing","Interne Rechnung")+tabButton("checklist","Checkliste")+tabButton("schedule","Arbeitsplanung")+'<button class="secondary danger" onclick="appAction(\\'delete\\',\\''+c.id+'\\')">Fall loeschen</button></aside><main>'+section(c)+'</main></div></div>';
        }
        function tabButton(v,l){ return '<button class="tab '+(state.view===v?'active':'')+'" onclick="appAction(\\'tab\\',\\''+v+'\\')">'+l+'</button>'; }
        function renderDashboard(){
          app.innerHTML = '<div class="wrap"><div class="top"><div><p class="hint">Interne Web-App</p><h1>Bestattungsfaelle</h1><p class="hint">Fallaufnahme, Offerte, Rechnung, Checkliste und Arbeitsplanung.</p></div><div class="actions"><button class="secondary" onclick="appAction(\\'exportAll\\')" '+(!state.cases.length?'disabled':'')+'>Alle exportieren</button><button class="primary" onclick="appAction(\\'new\\')">Neuer Todesfall</button></div></div><div class="panel"><div class="panel-head"><h2>Gespeicherte Faelle</h2><span class="pill">'+state.cases.length+' Fall'+(state.cases.length===1?'':'e')+'</span></div>'+(state.cases.length?dashboardTable():'<div class="empty"><h2>Noch keine Todesfaelle erfasst</h2><p>Beginnen Sie mit einem neuen Fall.</p><button class="primary" onclick="appAction(\\'new\\')">Neuer Todesfall</button></div>')+'</div></div>';
        }
        function dashboardTable(){
          return '<div class="panel-body"><table><thead><tr><th>Verstorbene Person</th><th>Kontaktperson</th><th>Datum Todesfall</th><th>Status</th><th class="right">Offertsumme</th><th>Aktion</th></tr></thead><tbody>'+state.cases.map(function(c){return '<tr><td><strong>'+esc(title(c))+'</strong><br><small>Geaendert: '+date(c.updatedAt)+'</small></td><td>'+esc(c.masterData.contactPerson||'-')+'</td><td>'+date(c.masterData.deathDate)+'</td><td><span class="pill">'+esc(c.status)+'</span></td><td class="right">'+money(offerTotals(c).total)+'</td><td><button class="secondary mini" onclick="appAction(\\'open\\',\\''+c.id+'\\')">Oeffnen</button> <button class="secondary mini danger" onclick="appAction(\\'delete\\',\\''+c.id+'\\')">Loeschen</button></td></tr>';}).join('')+'</tbody></table></div>';
        }
        function section(c){
          if(state.view==="offer") return offer(c);
          if(state.view==="billing") return billing(c);
          if(state.view==="checklist") return checklist(c);
          if(state.view==="schedule") return schedule(c);
          return master(c);
        }
        function field(label,key,type){ var c=current(); return '<label class="field"><span>'+label+'</span><input type="'+(type||'text')+'" value="'+esc(c.masterData[key])+'" onchange="appAction(\\'master\\',\\''+key+'\\',this.value)"></label>'; }
        function area(label,key){ var c=current(); return '<label class="field full"><span>'+label+'</span><textarea onchange="appAction(\\'master\\',\\''+key+'\\',this.value)">'+esc(c.masterData[key])+'</textarea></label>'; }
        function master(c){ return '<section class="panel"><div class="panel-head"><h2>Stammdaten</h2></div><div class="panel-body grid">'+field("Vorname verstorbene Person","firstName")+field("Nachname verstorbene Person","lastName")+field("Geburtsdatum","birthDate","date")+field("Todesdatum","deathDate","date")+field("Todesort","deathPlace")+field("Wohnadresse","address")+field("Kontaktperson Angehoerige","contactPerson")+field("Telefonnummer","phone")+field("E-Mail","email","email")+area("Adresse Rechnungsempfaenger","invoiceAddress")+area("Bemerkungen","notes")+'</div></section>'; }
        function offer(c){ var t=offerTotals(c); return '<section class="panel"><div class="panel-head"><h2>Trauergespraech / Live-Offerte</h2><button class="secondary no-print" onclick="appAction(\\'print\\')">Offerte drucken</button></div><div class="panel-body offer-layout"><div>'+c.offer.items.map(function(i){return '<div class="service"><label class="check"><input type="checkbox" '+(i.selected?'checked':'')+' onchange="appAction(\\'offerItem\\',\\''+i.id+'\\',\\'selected\\',this.checked)"> '+esc(i.name)+'</label><label class="field">Menge<input type="number" min="0" value="'+esc(i.quantity)+'" onchange="appAction(\\'offerItem\\',\\''+i.id+'\\',\\'quantity\\',this.value)"></label><label class="field">Preis CHF<input type="number" min="0" step="0.05" value="'+esc(i.manualPrice)+'" onchange="appAction(\\'offerItem\\',\\''+i.id+'\\',\\'manualPrice\\',this.value)"></label><strong>'+money(num(i.quantity)*num(i.manualPrice))+'</strong></div>';}).join('')+'</div><aside class="summary"><h3>Offertsumme</h3><div class="sumrow"><span>Zwischentotal</span><strong>'+money(t.subtotal)+'</strong></div><label class="field">Rabatt CHF<input type="number" min="0" step="0.05" value="'+esc(c.offer.discount)+'" onchange="appAction(\\'offer\\',\\'discount\\',this.value)"></label><div class="sumrow total"><span>Total CHF</span><strong>'+money(t.total)+'</strong></div><label class="field">Bemerkungen zur Offerte<textarea onchange="appAction(\\'offer\\',\\'notes\\',this.value)">'+esc(c.offer.notes)+'</textarea></label></aside></div></section>'; }
        function billing(c){ return '<section class="panel"><div class="panel-head"><h2>Interne Rechnungsgrundlage</h2><div class="actions no-print"><select onchange="if(this.value){appAction(\\'billAdd\\',this.value);this.value=\\'\\'}"><option value="">Beispielposition</option>'+billingExamples.map(function(x){return '<option>'+esc(x)+'</option>';}).join('')+'</select><button class="primary" onclick="appAction(\\'billAdd\\')">Position</button><button class="secondary" onclick="appAction(\\'print\\')">Drucken</button></div></div><div class="panel-body"><table><thead><tr><th>Datum</th><th>Leistung</th><th>Personen</th><th>Stunden</th><th>Ansatz</th><th>Total</th><th>Verrechnen</th><th>Bemerkung</th><th class="no-print">Aktion</th></tr></thead><tbody>'+c.billing.rows.map(function(r){var line=num(r.people)*num(r.hours)*num(r.rate);return '<tr><td><input type="date" value="'+esc(r.date)+'" onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'date\\',this.value)"></td><td><input value="'+esc(r.service)+'" onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'service\\',this.value)"></td><td><input type="number" value="'+esc(r.people)+'" onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'people\\',this.value)"></td><td><input type="number" step="0.25" value="'+esc(r.hours)+'" onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'hours\\',this.value)"></td><td><input type="number" step="0.05" value="'+esc(r.rate)+'" onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'rate\\',this.value)"></td><td>'+money(line)+'</td><td><input type="checkbox" '+(r.billable?'checked':'')+' onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'billable\\',this.checked)"></td><td><input value="'+esc(r.note)+'" onchange="appAction(\\'bill\\',\\''+r.id+'\\',\\'note\\',this.value)"></td><td class="no-print"><button class="secondary mini danger" onclick="appAction(\\'billDel\\',\\''+r.id+'\\')">X</button></td></tr>';}).join('')+'</tbody></table><div class="sumrow total"><span>Internes Rechnungstotal</span><strong>'+money(billingTotal(c))+'</strong></div></div></section>'; }
        function checklist(c){ return '<section class="panel"><div class="panel-head"><h2>Checkliste Todesfall</h2><button class="secondary no-print" onclick="appAction(\\'print\\')">Drucken</button></div><div class="panel-body checklist">'+c.checklist.map(function(t){return '<div class="task"><span>'+esc(t.task)+'</span><select onchange="appAction(\\'check\\',\\''+t.id+'\\',this.value)">'+taskStatuses.map(function(s){return '<option '+(s===t.status?'selected':'')+'>'+esc(s)+'</option>';}).join('')+'</select></div>';}).join('')+'</div></section>'; }
        function schedule(c){ return '<section class="panel"><div class="panel-head"><h2>Arbeitsplanung</h2><div class="actions no-print"><button class="primary" onclick="appAction(\\'schedAdd\\')">Einsatz</button><button class="secondary" onclick="appAction(\\'print\\')">Drucken</button></div></div><div class="panel-body"><table><thead><tr><th>Datum</th><th>Uhrzeit</th><th>Aufgabe</th><th>Ort</th><th>Mitarbeitende</th><th>Bemerkung</th><th>Status</th><th class="no-print">Aktion</th></tr></thead><tbody>'+c.schedule.map(function(r){return '<tr><td><input type="date" value="'+esc(r.date)+'" onchange="appAction(\\'sched\\',\\''+r.id+'\\',\\'date\\',this.value)"></td><td><input type="time" value="'+esc(r.time)+'" onchange="appAction(\\'sched\\',\\''+r.id+'\\',\\'time\\',this.value)"></td><td><input value="'+esc(r.task)+'" onchange="appAction(\\'sched\\',\\''+r.id+'\\',\\'task\\',this.value)"></td><td><input value="'+esc(r.place)+'" onchange="appAction(\\'sched\\',\\''+r.id+'\\',\\'place\\',this.value)"></td><td><div class="employees">'+employees.map(function(e){return '<label><input type="checkbox" '+(r.employees.indexOf(e)>=0?'checked':'')+' onchange="appAction(\\'emp\\',\\''+r.id+'\\',\\''+e+'\\')"> '+e+'</label>';}).join('')+'</div></td><td><input value="'+esc(r.note)+'" onchange="appAction(\\'sched\\',\\''+r.id+'\\',\\'note\\',this.value)"></td><td><select onchange="appAction(\\'sched\\',\\''+r.id+'\\',\\'status\\',this.value)">'+taskStatuses.map(function(s){return '<option '+(s===r.status?'selected':'')+'>'+esc(s)+'</option>';}).join('')+'</select></td><td class="no-print"><button class="secondary mini danger" onclick="appAction(\\'schedDel\\',\\''+r.id+'\\')">X</button></td></tr>';}).join('')+'</tbody></table></div></section>'; }

        render();
      })();
    </script>
  </body>
</html>`;

const fixedHtml = html.replace(/\\\\'/g, "\\'");
await writeFile(outputFile, fixedHtml, "utf8");
console.log(`Erstellt: ${outputFile}`);
