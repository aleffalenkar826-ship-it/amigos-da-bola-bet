const $=id=>document.getElementById(id);
let balance=Number(localStorage.betBalance||10000);
let matches=JSON.parse(localStorage.betMatches||'null')||[
{id:"1",home:"Palmares FC",away:"Vila Getat",date:"2026-10-23T17:00",odds:{H:1.85,D:3.20,A:2.55},status:"aberto"},
{id:"2",home:"Time A",away:"Time B",date:"2026-10-24T17:00",odds:{H:2.10,D:3.00,A:2.20},status:"aberto"}];
let ticket={};let bets=JSON.parse(localStorage.betBets||'[]');
function save(){localStorage.betBalance=balance;localStorage.betMatches=JSON.stringify(matches);localStorage.betBets=JSON.stringify(bets)}
function money(n){return Number(n).toLocaleString('pt-BR')+' pts'}
function openScreen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.go===id));scrollTo(0,0)}
document.addEventListener('click',e=>{let b=e.target.closest('[data-go]');if(b)openScreen(b.dataset.go);let o=e.target.closest('[data-pick]');if(o){let [id,pick]=o.dataset.pick.split('|');ticket[id]={pick,odd:Number(o.dataset.odd)};render()}let d=e.target.closest('[data-delete]');if(d){matches=matches.filter(x=>x.id!==d.dataset.delete);delete ticket[d.dataset.delete];save();render()}});
function render(){
$('balance').textContent=money(balance);$('rankBalance').textContent=money(balance);
$('matches').innerHTML=matches.filter(m=>m.status==="aberto").map(m=>`<div class="card match"><div class="teams">${m.home} × ${m.away}</div><div class="muted">${m.date?new Date(m.date).toLocaleString('pt-BR'):'Data a definir'}</div><div class="odds"><button class="odd ${ticket[m.id]?.pick==='H'?'selected':''}" data-pick="${m.id}|H" data-odd="${m.odds.H}">1<br>${m.odds.H.toFixed(2)}</button><button class="odd ${ticket[m.id]?.pick==='D'?'selected':''}" data-pick="${m.id}|D" data-odd="${m.odds.D}">X<br>${m.odds.D.toFixed(2)}</button><button class="odd ${ticket[m.id]?.pick==='A'?'selected':''}" data-pick="${m.id}|A" data-odd="${m.odds.A}">2<br>${m.odds.A.toFixed(2)}</button></div></div>`).join('')||'<div class="card">Nenhum jogo aberto.</div>';
let arr=Object.entries(ticket);$('ticketItems').innerHTML=arr.length?arr.map(([id,t])=>{let m=matches.find(x=>x.id===id);return `<div class="ticket-item">${m?.home||'?'} × ${m?.away||'?'}<br><b>${t.pick==='H'?'Casa':t.pick==='D'?'Empate':'Fora'} @ ${t.odd.toFixed(2)}</b></div>`}).join(''):'<p class="muted">Nenhuma seleção.</p>';
let total=arr.reduce((a,[,t])=>a*t.odd,1);$('totalOdd').textContent=total.toFixed(2);$('potential').textContent=money((Number($('stake').value)||0)*total);
$('betsList').innerHTML=bets.slice().reverse().map(b=>`<div class="card"><b>Bilhete #${b.id}</b><p>${b.selections} seleção(ões) • Odd ${b.odd.toFixed(2)}</p><p>Aposta: ${money(b.stake)} • Retorno possível: ${money(b.return)}</p><span class="tag">${b.status}</span></div>`).join('')||'<div class="card muted">Nenhuma aposta ainda.</div>';
$('adminMatches').innerHTML=matches.map(m=>`<div class="ticket-item"><b>${m.home} × ${m.away}</b><br><span class="muted">1 ${m.odds.H} • X ${m.odds.D} • 2 ${m.odds.A}</span><br><button class="danger" data-delete="${m.id}">Excluir</button></div>`).join('');
}
$('stake').oninput=render;
$('placeBet').onclick=()=>{let arr=Object.values(ticket),stake=Number($('stake').value);if(!arr.length)return alert('Escolha pelo menos um palpite.');if(!stake||stake<1||stake>balance)return alert('Valor inválido ou saldo insuficiente.');let odd=arr.reduce((a,t)=>a*t.odd,1);balance-=stake;bets.push({id:Date.now(),selections:arr.length,odd,stake,return:stake*odd,status:'Pendente'});ticket={};save();render();openScreen('bets')};
$('addMatch').onclick=()=>{let h=$('homeTeam').value.trim(),a=$('awayTeam').value.trim(),H=Number($('oddHome').value),D=Number($('oddDraw').value),A=Number($('oddAway').value);if(!h||!a||H<=1||D<=1||A<=1)return alert('Preencha times e odds válidas.');matches.push({id:String(Date.now()),home:h,away:a,date:$('date').value,odds:{H,D,A},status:'aberto'});['homeTeam','awayTeam','date','oddHome','oddDraw','oddAway'].forEach(x=>$(x).value='');save();render();alert('Jogo cadastrado.')};
save();render();