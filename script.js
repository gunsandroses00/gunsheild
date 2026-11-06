document.addEventListener("DOMContentLoaded", () => {
    const scanButton = document.getElementById("scanButton");
    const messageInput = document.getElementById("messageInput");
    const results = document.getElementById("results");
    const scoreDisplay = document.getElementById("score");
    const riskDisplay = document.getElementById("risk");
    const progressBar = document.getElementById("bar");
    const findingsDisplay = document.getElementById("findings");

    if (
        !scanButton ||
        !messageInput ||
        !results ||
        !scoreDisplay ||
        !riskDisplay ||
        !progressBar ||
        !findingsDisplay
    ) {
        console.error("Gunshield: Required HTML elements are missing.");
        return;
    }
    const rules = [
        {
            pattern: /\b(password|passwd|login credentials)\b/i,
            points: 20,
            reason: "Requests sensitive login credentials"
        },
        {
            pattern: /\b(otp|one-time code|verification code)\b/i,
            points: 25,
            reason: "Requests an OTP or verification code"
        },
        {
            pattern: /\b(click here|verify now|act immediately|urgent)\b/i,
            points: 15,
            reason: "Uses urgent or pressure-based language"
        },
        {
            pattern: /\b(bank account|credit card|debit card)\b/i,
            points: 20,
            reason: "Mentions sensitive financial information"
        },
        {
            pattern: /\b(winner|prize|free reward|claim now)\b/i,
            points: 15,
            reason: "Uses suspicious reward claims"
        },
        {
            pattern: /\b(suspended|blocked|locked account)\b/i,
            points: 15,
            reason: "Uses account-threat language"
        },
        {
            pattern: /\bhttps?:\/\/|www\./i,
            points: 10,
            reason: "Contains an external link"
        }
    ];

    function analyzeMessage(message) {

        let score = 0;
        let findings = [];

        rules.forEach(rule => {

            if (rule.pattern.test(message)) {
                score += rule.points;
                findings.push(rule.reason);
            }

        });
        score = Math.min(score, 100);
        let risk = "Low Risk";
        if (score >= 60) {
            risk = "High Risk";
        } else if (score >= 30) {
            risk = "Medium Risk";
        }
        return {
            score: score,
            risk: risk,
            findings: findings
        };
    }
    function scanMessage() {
        const message = messageInput.value.trim();
        if (!message) {
            alert("Please enter a message first!");
            messageInput.focus();
            return;
        }
        const result = analyzeMessage(message);

        //will do diaplsy results tmrw gn
        results.style.display = "block";

        scoreDisplay.textContent = result.score + "/100";
        riskDisplay.textContent = result.risk;

        progressBar.style.width = result.score + "%";        
        if (result.score >= 60) {
            riskDisplay.style.color = "#ff75bd";
        } else if (result.score >= 30) {
            riskDisplay.style.color = "#ffd166";
        } else {
            riskDisplay.style.color = "#a6e6b9";
        }

            findingsDisplay.replaceChildren();
        if (result.findings.length === 0) {
            const item = document.createElement("div");
            item.className = "finding";
            item.textContent =
                "No suspicious patterns detected. This does not guarantee safety.";

            findingsDisplay.appendChild(item);
        } else {
            result.findings.forEach(reason => {

                const item = document.createElement("div");

                item.className = "finding";
                item.textContent =  reason;
                findingsDisplay.appendChild(item);
            });
        }
        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        console.log("Gunshield analysis:", result);
    }
    scanButton.addEventListener("click", scanMessage);
    messageInput.addEventListener("keydown", event => {
        if (event.ctrlKey && event.key === "Enter") {
            scanMessage();
        }
    });
    console.log("Gunshield initialized successfully.");
});
