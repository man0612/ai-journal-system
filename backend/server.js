const rateLimit = require("express-rate-limit")
const express = require("express")
const cors = require("cors")
const sqlite3 = require("sqlite3").verbose()

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})
    
app.use(limiter)

/* ---------------- DATABASE ---------------- */

const db = new sqlite3.Database("./journal.db", (err)=>{
if(err){
console.log(err)
}else{
console.log("Connected to SQLite database")
}
})

db.run(`
CREATE TABLE IF NOT EXISTS journal(
id INTEGER PRIMARY KEY AUTOINCREMENT,
userId TEXT,
ambience TEXT,
text TEXT,
emotion TEXT,
summary TEXT,
keywords TEXT
)
`)

/* ---------------- ROOT ---------------- */

app.get("/",(req,res)=>{
res.send("AI Journal API running 🚀")
})

/* ---------------- CREATE JOURNAL ---------------- */

app.post("/api/journal",(req,res)=>{

const {userId,ambience,text}=req.body

if(!text || text.trim()===""){
return res.status(400).json({
error:"Journal cannot be empty"
})
}

db.run(
"INSERT INTO journal (userId,ambience,text) VALUES (?,?,?)",
[userId,ambience,text],
function(err){

if(err){
return res.status(500).send(err)
}

res.send({
message:"Entry saved",
id:this.lastID
})

})

})

/* ---------------- GET ENTRIES ---------------- */

app.get("/api/journal/:userId",(req,res)=>{

const userId=req.params.userId

db.all(
"SELECT * FROM journal WHERE userId=?",
[userId],
(err,rows)=>{

if(err){
return res.status(500).send(err)
}

res.send(rows)

})

})

/* ---------------- DELETE ENTRY ---------------- */

app.delete("/api/journal/:id",(req,res)=>{

const id=req.params.id

db.run(
"DELETE FROM journal WHERE id=?",
[id],
function(err){

if(err){
return res.status(500).send(err)
}

if(this.changes===0){
return res.status(404).json({
message:"Entry not found"
})
}

res.json({
message:"Entry deleted successfully"
})

})

})

/* ---------------- EMOTION ANALYSIS ---------------- */

app.post("/api/journal/analyze",(req,res)=>{

    const {text}=req.body
    
    // check cache first
    db.get(
    "SELECT emotion,summary,keywords FROM journal WHERE text=?",
    [text],
    (err,row)=>{
    
    if(err){
    return res.status(500).send(err)
    }
    
    // if analysis already exists return cached result
    if(row && row.emotion){
    
    return res.send({
    analysis:{
    emotion:row.emotion,
    summary:row.summary,
    keywords:row.keywords.split(",")
    }
    })
    
    }
    
    // otherwise run analysis
    const lower=text.toLowerCase()
    
    const emotionWords={
    calm:["calm","peace","relaxed","quiet","serene"],
    happy:["happy","joy","excited","great","wonderful"],
    sad:["sad","lonely","down","tired"],
    angry:["angry","frustrated","mad"]
    }
    
    let emotion="neutral"
    let maxScore=0
    
    for(const key in emotionWords){
    
    let score=0
    
    emotionWords[key].forEach(word=>{
    if(lower.includes(word)){
    score++
    }
    })
    
    if(score>maxScore){
    maxScore=score
    emotion=key
    }
    
    }
    
    const keywords=text.split(" ").slice(0,5)
    const summary=`User seems to feel ${emotion}`
    
    // store analysis
    db.run(
    `UPDATE journal
    SET emotion=?,summary=?,keywords=?
    WHERE id=(SELECT id FROM journal ORDER BY id DESC LIMIT 1)`,
    [emotion,summary,keywords.join(",")]
    )
    
    res.send({
    analysis:{
    emotion,
    summary,
    keywords
    }
    })
    
    })
    
    })
/* ---------------- INSIGHTS ---------------- */

app.get("/api/journal/insights/:userId",(req,res)=>{

const userId=req.params.userId

db.all(
"SELECT * FROM journal WHERE userId=?",
[userId],
(err,rows)=>{

if(err){
return res.status(500).send(err)
}

const totalEntries=rows.length

const ambienceCount={}
const emotionCount={}
const keywords=[]

rows.forEach(entry=>{

if(entry.ambience){
ambienceCount[entry.ambience]=(ambienceCount[entry.ambience]||0)+1
}

if(entry.emotion){
emotionCount[entry.emotion]=(emotionCount[entry.emotion]||0)+1
}

if(entry.keywords){
keywords.push(...entry.keywords.split(","))
}

})

const mostUsedAmbience=
Object.keys(ambienceCount).reduce(
(a,b)=>ambienceCount[a]>ambienceCount[b]?a:b,
"none"
)

const topEmotion=
Object.keys(emotionCount).reduce(
(a,b)=>emotionCount[a]>emotionCount[b]?a:b,
"none"
)

const recentKeywords=keywords.slice(-5)

res.send({
totalEntries,
topEmotion,
mostUsedAmbience,
recentKeywords
})

})

})

/* ---------------- START SERVER ---------------- */

app.listen(PORT,()=>{
console.log(`Server running at http://localhost:${PORT}`)
})