import { useState } from "react";
import axios from "axios";

function App() {

const [text, setText] = useState("");
const [ambience, setAmbience] = useState("forest");
const [entries, setEntries] = useState([]);
const [analysis, setAnalysis] = useState(null);
const [insights, setInsights] = useState(null);
const [loading, setLoading] = useState(false);

const API = "http://localhost:4000";

/* SAVE ENTRY */

const saveEntry = async () => {

try{

if(!text.trim()){
alert("Journal cannot be empty");
return;
}

await axios.post(`${API}/api/journal`,{
userId:"123",
ambience:ambience,
text:text
});

setText("");
alert("Entry saved");

loadEntries();   // refresh entries

}
catch(err){
console.error(err);
alert("Failed to save entry");
}

};

/* LOAD ENTRIES */

const loadEntries = async () => {

try{

const res = await axios.get(`${API}/api/journal/123`);
setEntries(res.data);

}
catch(err){
console.error(err);
alert("Failed to load entries");
}

};

/* ANALYZE EMOTION */

const analyze = async () => {

try{

let journalText = text;

// if textbox empty use latest entry
if(!journalText.trim() && entries.length > 0){
journalText = entries[entries.length - 1].text;
}

if(!journalText.trim()){
alert("Write something first or load entries");
return;
}

setLoading(true);

const res = await axios.post(
`${API}/api/journal/analyze`,
{ text: journalText }
);

setAnalysis(res.data.analysis);

setLoading(false);

}
catch(err){
console.error(err);
setLoading(false);
alert("Emotion analysis failed");
}

};

/* LOAD INSIGHTS */

const loadInsights = async () => {

try{

const res = await axios.get(`${API}/api/journal/insights/123`);
setInsights(res.data);

}
catch(err){
console.error(err);
alert("Failed to load insights");
}

};

/* DELETE ENTRY */

const deleteEntry = async (id) => {

try{

if(!window.confirm("Delete this entry?")) return;

await axios.delete(`${API}/api/journal/${id}`);

loadEntries();

}
catch(err){
console.error(err);
alert("Delete failed");
}

};

/* UI */

return (

<div style={{
maxWidth:"800px",
margin:"40px auto",
fontFamily:"Arial"
}}>

<h1>🌿 AI Journal System</h1>

<select
value={ambience}
onChange={(e)=>setAmbience(e.target.value)}
>
<option value="forest">Forest</option>
<option value="ocean">Ocean</option>
<option value="mountain">Mountain</option>
</select>

<br/><br/>

<textarea
rows="5"
cols="60"
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Write your journal..."
/>

<br/><br/>

<button onClick={saveEntry}>Save Entry</button>
<button onClick={loadEntries}>View Entries</button>
<button onClick={analyze}>Analyze Emotion</button>
<button onClick={loadInsights}>Insights</button>

<hr/>

{loading && <p>Analyzing emotion...</p>}

{analysis && (
<div>
<h2>Analysis</h2>
<p><b>Emotion:</b> {analysis.emotion}</p>
<p><b>Summary:</b> {analysis.summary}</p>
<p><b>Keywords:</b> {analysis.keywords.join(", ")}</p>
</div>
)}

<h2>Entries</h2>

<ul>

{entries.map(e=>(
<li key={e.id} style={{marginBottom:"10px"}}>

<p>{e.text}</p>

{e.emotion && (
<p style={{color:"#555"}}>
Emotion: {e.emotion}
</p>
)}

<button
style={{
background:"#e74c3c",
color:"white",
border:"none",
padding:"4px 8px",
cursor:"pointer"
}}
onClick={()=>deleteEntry(e.id)}
>
Delete
</button>

</li>
))}

</ul>

{insights && (

<div>

<h2>Insights</h2>

<p>Total Entries: {insights.totalEntries}</p>
<p>Top Emotion: {insights.topEmotion}</p>
<p>Most Used Ambience: {insights.mostUsedAmbience}</p>

</div>

)}

</div>

);

}

export default App;