const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
function harness(){
 const elements=new Map(),jobs=[],intervals=[];let time=1000;
 function element(s){if(!elements.has(s))elements.set(s,{value:s.includes('Volume')?'45':'0',textContent:'',dataset:{},setAttribute(k,v){this[k]=v},querySelector(){return element(s+' child')}});return elements.get(s)}
 const soundButtons=['rain','brown','drone'].map(kind=>{const b=element('button '+kind);b.dataset.sound=kind;return b});
 const param=()=>({value:0,setTargetAtTime(v){this.value=v}});
 const node=()=>({gain:param(),frequency:param(),connect(){},disconnect(){},start(){},stop(){}});
 class AudioContext{constructor(){this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination={}}createGain(){return node()}createOscillator(){return node()}createBufferSource(){return node()}createBiquadFilter(){return node()}createBuffer(n,size){const data=Array.from({length:n},()=>new Float32Array(size));return{numberOfChannels:n,getChannelData(i){return data[i]}}}}
 const context=vm.createContext({$:element,$$:s=>s==='[data-sound]'?soundButtons:[],window:{AudioContext},storage:{get(k,f){return f},set(){}},setTimeout:f=>jobs.push(f),setInterval:f=>intervals.push(f),document:{addEventListener(){}},Date:{now:()=>time},toast(){},resizeRain(){}});
 vm.runInContext(source.slice(source.indexOf('let audioContext;'),source.indexOf('let zen=false;')),context);
 return{run:s=>vm.runInContext(s,context),elements,advance(ms){time+=ms;intervals.forEach(f=>f())},flush(){jobs.splice(0).forEach(f=>f())}};
}
test('rain channel starts, updates profile, and mutes',async()=>{const h=harness();await h.run("toggleSound('rain')");assert.equal(h.elements.get('#quickRain')['aria-pressed'],'true');h.elements.get('#rainStyle').value='heavy';h.elements.get('#rainStyle').onchange();assert.equal(h.run('channels.rain.nodes[1].frequency.value'),4300);h.run('mute()');h.flush();assert.equal(h.elements.get('#quickRain')['aria-pressed'],'false');assert.equal(h.run('Object.keys(channels).length'),0)});
test('sleep timer mutes every channel and resets controls',async()=>{const h=harness();await h.run("toggleSound('rain')");await h.run("toggleSound('drone')");h.elements.get('#sleepTimer').value='15';h.elements.get('#sleepTimer').onchange();h.advance(15*60000);assert.equal(h.run('Object.keys(channels).length'),0);assert.equal(h.elements.get('#sleepTimer').value,'0');h.flush()});
test('mute cancels an in-flight audio start',async()=>{const h=harness();await h.run("const starting=toggleSound('rain');mute();starting");assert.equal(h.run('Object.keys(channels).length'),0)});
