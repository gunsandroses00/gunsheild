const messageInput=document.getElementById("message");
const analyzeButton=document.getElementById("analyze");
const results=document.getElementById("results");
const risk=document.getElementById("risk");
const details=document.getElementById("details");

analyzeButton.addEventListener("click",function(){
    const message=messageInput.value;
    console.log("Input received:",JSON.stringify(message));
    results.hidden=false;
    if(!message.trim()){
        risk.textContent="no message entered";
        details.textContent="paste a messaghe and try again";
        return;
    }
    const checks=[{
        pattern:/password,otp,one-time code,login credentials/i,
        points:30,
        reason:"mentions sensitive login information"},
    {
        pattern:/urgent,immediately,act now,account suspended/i,
        points:30,
        reason:"uses urgent or threatning language"},
    {
        pattern:/won a prize, claim your prize,free reward/i,
        points:25,
        reason:"uses a prize or reward lure"},
    {
        pattern:/https?:\/\/\S+/i,
        points:20,
        reason:"contains a URL that needs checking"
    }
];
let score=0;
const findings=[];
for (const check of checks){
    if (check.pattern.test(message)){
        score+=check.points;
        findings.push(check.reason);
    }
}
score=Math.min(score,100);
console.log("Message:",message);
console.log("Matched warnings:",findings);
console.log("Final score:",score);
risk.textContent=score>=60?`HIGH:${score}/100`:
score>=30?`MEDIUM:${score}/100`:
`low:${score}/100`;
details.textContent=findings.length?findings.map(check=>check.reason).join("."):
"No configured warning signs detdcted. This does not prove the message is safe.";
});