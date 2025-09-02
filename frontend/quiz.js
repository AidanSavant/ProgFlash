(() => {
    let questions = [];
    let currQIndex = 0;
    const userAnswers = new Array(10).fill(null);

    const quesNum = document.getElementById("question-num");
    const quesText = document.getElementById("question-text");
    const options = document.querySelectorAll(".option");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");

    async function loadQuiz() {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get("lang") || "General programming";
        const difficulty = params.get("difficulty") || "Easy";

        try {
            const resp = await fetch(`/api/get-quiz?lang=${encodeURIComponent(lang)}&difficulty=${encodeURIComponent(difficulty)}`);
            const questions_json = await resp.json();

            questions = questions_json;
            displayQuestion();
        } catch(error) {
            console.error("Error loading quiz: ", error);
            alert("Failed to load quiz. Please try again later!");
        }
    }

    function displayQuestion() {
        const currQuestion = questions[currQIndex];
        quesNum.textContent = `Question ${currQIndex + 1}/${questions.length}`;
        quesText.textContent = currQuestion.question;

        options.forEach((btn, index) => {
            btn.textContent = currQuestion.options[index];
            btn.classList.remove("correct", "incorrect", "selected");
            btn.disabled = false;

            btn.onclick = () => handleOptionBtnClick(index);
        });

        const selectedIndex = userAnswers[currQIndex];
        if(selectedIndex !== null) {
            options.forEach((btn, index) => {
                btn.disabled = true;
                if(index === currQuestion.answer) btn.classList.add("correct");
                else if(index === selectedIndex) btn.classList.add("incorrect");
            });
        }

        prevBtn.disabled = currQIndex === 0;
        nextBtn.disabled = currQIndex === questions.length - 1 && userAnswers[currQIndex] === null;
        nextBtn.textContent = currQIndex === questions.length - 1 ? "Finish" : "Next";
    }

    function handleOptionBtnClick(selectedIndex) {
        const currQuestion = questions[currQIndex];
        userAnswers[currQIndex] = selectedIndex;

        options.forEach((btn, index) => {
            btn.disabled = true;
            btn.classList.remove("selected");

            if(index === selectedIndex) btn.classList.add("selected");
            if(index === currQuestion.answer) btn.classList.add("correct");
            else if(index === selectedIndex) btn.classList.add("incorrect");
        });

        nextBtn.disabled = false;
    }

    prevBtn.addEventListener("click", () => {
        if(currQIndex > 0) {
            currQIndex--;
            displayQuestion();
        }
    });

    nextBtn.addEventListener("click", () => {
        if(currQIndex === questions.length - 1) {
            showResults();
            return;
        }
        currQIndex++;
        displayQuestion();
    });

    function showResults() {
        let score = 0;
        let results = "Quiz Results:\n\n";

        questions.forEach((question, index) => {
            if(userAnswers[index] === question.answer) score++;
            results += `Q${index + 1}: ${question.question}\nYour answer: ${question.options[userAnswers[index]] || "No answer"}\nCorrect answer: ${question.options[question.answer]}\n\n`;
        });

        results = `Your Score: ${score}/${questions.length}\n\n` + results;
        alert(results);
    }

    document.addEventListener("DOMContentLoaded", loadQuiz);
})();
