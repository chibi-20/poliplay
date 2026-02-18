// ===============================
// GAME LOGIC
// ===============================

let currentCategory = '';
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 20;
let questionAnswered = false;
let usedQuestions = {}; // Track used questions per category

// Sample questions database - stored in localStorage
const defaultQuestions = {
    "Political Issues": [
        {
            question: "What is the primary function of the legislative branch?",
            type: "Multiple Choice",
            options: ["Make laws", "Enforce laws", "Interpret laws", "Veto laws"],
            correctAnswer: "A"
        },
        {
            question: "What is democracy?",
            type: "Identification",
            correctAnswer: "A system of government by the whole population"
        }
    ],
    "Law": [
        {
            question: "What is the supreme law of the land in the Philippines?",
            type: "Multiple Choice",
            options: ["Constitution", "Criminal Code", "Civil Code", "Administrative Code"],
            correctAnswer: "A"
        },
        {
            question: "What does 'habeas corpus' mean?",
            type: "Identification",
            correctAnswer: "You have the body"
        }
    ],
    "Roles": [
        {
            question: "Who is the chief executive of the government?",
            type: "Multiple Choice",
            options: ["President", "Vice President", "Speaker of the House", "Chief Justice"],
            correctAnswer: "A"
        },
        {
            question: "What is the primary role of the judiciary?",
            type: "Identification",
            correctAnswer: "To interpret laws"
        }
    ],
    "Figures": [
        {
            question: "Who is known as the Father of Philippine Constitution?",
            type: "Multiple Choice",
            options: ["Claro M. Recto", "Jose Rizal", "Manuel Quezon", "Emilio Aguinaldo"],
            correctAnswer: "A"
        },
        {
            question: "Who was the first President of the Philippines?",
            type: "Identification",
            correctAnswer: "Emilio Aguinaldo"
        }
    ]
};

// Initialize questions from localStorage or use defaults
function getQuestions() {
    const stored = localStorage.getItem('poliplayQuestions');
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem('poliplayQuestions', JSON.stringify(defaultQuestions));
    return defaultQuestions;
}

function saveQuestions(questions) {
    localStorage.setItem('poliplayQuestions', JSON.stringify(questions));
}

// Start game with selected category
function startGame(category) {
    currentCategory = category;
    showRandomQuestion();
}

// Get random unused question
function getRandomQuestion(categoryQuestions) {
    // Initialize used questions for category if not exists
    if (!usedQuestions[currentCategory]) {
        usedQuestions[currentCategory] = [];
    }
    
    // If all questions have been used, reset the used questions list
    if (usedQuestions[currentCategory].length >= categoryQuestions.length) {
        usedQuestions[currentCategory] = [];
    }
    
    // Get available question indices
    const availableIndices = [];
    for (let i = 0; i < categoryQuestions.length; i++) {
        if (!usedQuestions[currentCategory].includes(i)) {
            availableIndices.push(i);
        }
    }
    
    // Select random index from available ones
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedQuestions[currentCategory].push(randomIndex);
    
    return categoryQuestions[randomIndex];
}

// Show random question modal
function showRandomQuestion() {
    const questions = getQuestions();
    const categoryQuestions = questions[currentCategory];
    
    if (!categoryQuestions || categoryQuestions.length === 0) {
        alert('No questions available for this category. Please add questions first.');
        return;
    }
    
    const question = getRandomQuestion(categoryQuestions);
    questionAnswered = false;
    
    // Update modal content
    document.getElementById('categoryTitle').textContent = currentCategory;
    document.getElementById('questionText').textContent = question.question;
    
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    if (question.type === "Multiple Choice") {
        question.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = `${letter}. ${option}`;
            button.onclick = () => checkAnswer(letter, question.correctAnswer);
            answersContainer.appendChild(button);
        });
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'answer-input';
        input.id = 'identificationInput';
        input.placeholder = 'Type your answer here...';
        answersContainer.appendChild(input);
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-answer-btn';
        submitBtn.textContent = 'Submit Answer';
        submitBtn.onclick = () => {
            const userAnswer = input.value.trim();
            checkIdentificationAnswer(userAnswer, question.correctAnswer);
        };
        answersContainer.appendChild(submitBtn);
        
        // Allow Enter key to submit
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
    
    // Show modal and start timer
    document.getElementById('questionModal').style.display = 'block';
    startTimer();
}

// Timer function
function startTimer() {
    timeLeft = 20;
    updateTimerDisplay();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 5) {
            document.getElementById('timer').classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!questionAnswered) {
                playWrongSound();
                disableAnswers();
                alert('Time is up!');
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = timeLeft;
}

// Check answer for multiple choice
function checkAnswer(selected, correct) {
    if (questionAnswered) return;
    
    questionAnswered = true;
    clearInterval(timerInterval);
    
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        const btnLetter = btn.textContent.charAt(0);
        if (btnLetter === correct) {
            btn.classList.add('correct');
        } else if (btnLetter === selected && selected !== correct) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        playCorrectSound();
    } else {
        playWrongSound();
    }
}

// Check answer for identification
function checkIdentificationAnswer(userAnswer, correctAnswer) {
    if (questionAnswered) return;
    
    questionAnswered = true;
    clearInterval(timerInterval);
    
    const input = document.getElementById('identificationInput');
    input.disabled = true;
    
    // Case-insensitive comparison
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
        input.style.borderColor = '#34d399';
        input.style.background = '#d1fae5';
        playCorrectSound();
    } else {
        input.style.borderColor = '#ef4444';
        input.style.background = '#fee2e2';
        playWrongSound();
        // Show correct answer
        setTimeout(() => {
            alert(`Correct answer: ${correctAnswer}`);
        }, 500);
    }
}

// Disable all answer buttons
function disableAnswers() {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const input = document.getElementById('identificationInput');
    if (input) input.disabled = true;
}

// Play sounds
function playCorrectSound() {
    const audio = document.getElementById('correctAudio');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

function playWrongSound() {
    const audio = document.getElementById('wrongAudio');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Close modal
function closeModal() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Stop all audio
    const correctAudio = document.getElementById('correctAudio');
    const wrongAudio = document.getElementById('wrongAudio');
    if (correctAudio) {
        correctAudio.pause();
        correctAudio.currentTime = 0;
    }
    if (wrongAudio) {
        wrongAudio.pause();
        wrongAudio.currentTime = 0;
    }
    
    document.getElementById('questionModal').style.display = 'none';
    document.getElementById('timer').classList.remove('warning');
}

// ===============================
// LOGIN LOGIC
// ===============================

const CREDENTIALS = {
    username: 'MSGRamos',
    password: 'Leynes2024'
};

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        // Login successful
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('generatorSection').style.display = 'block';
        loadQuestionsList();
    } else {
        // Login failed
        errorDiv.textContent = 'Invalid username or password!';
        setTimeout(() => {
            errorDiv.textContent = '';
        }, 3000);
    }
    
    return false;
}

function logout() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('generatorSection').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// ===============================
// QUESTION GENERATOR LOGIC
// ===============================

function toggleAnswerFields() {
    const questionType = document.getElementById('questionType').value;
    const multipleChoiceFields = document.getElementById('multipleChoiceFields');
    const identificationFields = document.getElementById('identificationFields');
    
    if (questionType === 'Multiple Choice') {
        multipleChoiceFields.style.display = 'block';
        identificationFields.style.display = 'none';
    } else if (questionType === 'Identification') {
        multipleChoiceFields.style.display = 'none';
        identificationFields.style.display = 'block';
    } else {
        multipleChoiceFields.style.display = 'none';
        identificationFields.style.display = 'none';
    }
}

function addQuestion() {
    const category = document.getElementById('questionCategory').value;
    const questionType = document.getElementById('questionType').value;
    const questionText = document.getElementById('questionInput').value;
    
    if (!category || !questionType || !questionText) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const questions = getQuestions();
    
    if (!questions[category]) {
        questions[category] = [];
    }
    
    const newQuestion = {
        question: questionText,
        type: questionType
    };
    
    if (questionType === 'Multiple Choice') {
        const optionA = document.getElementById('optionA').value;
        const optionB = document.getElementById('optionB').value;
        const optionC = document.getElementById('optionC').value;
        const optionD = document.getElementById('optionD').value;
        const correctOption = document.getElementById('correctOption').value;
        
        if (!optionA || !optionB || !optionC || !optionD) {
            alert('Please fill in all answer options!');
            return;
        }
        
        newQuestion.options = [optionA, optionB, optionC, optionD];
        newQuestion.correctAnswer = correctOption;
    } else {
        const answer = document.getElementById('identificationAnswer').value;
        
        if (!answer) {
            alert('Please enter the correct answer!');
            return;
        }
        
        newQuestion.correctAnswer = answer;
    }
    
    questions[category].push(newQuestion);
    saveQuestions(questions);
    
    // Show success message
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = 'Question added successfully!';
    setTimeout(() => {
        successMsg.textContent = '';
    }, 3000);
    
    clearForm();
    loadQuestionsList();
}

function clearForm() {
    document.getElementById('questionCategory').value = '';
    document.getElementById('questionType').value = '';
    document.getElementById('questionInput').value = '';
    document.getElementById('optionA').value = '';
    document.getElementById('optionB').value = '';
    document.getElementById('optionC').value = '';
    document.getElementById('optionD').value = '';
    document.getElementById('correctOption').value = 'A';
    document.getElementById('identificationAnswer').value = '';
    document.getElementById('multipleChoiceFields').style.display = 'none';
    document.getElementById('identificationFields').style.display = 'none';
}

function loadQuestionsList() {
    const questions = getQuestions();
    const listContainer = document.getElementById('questionsList');
    listContainer.innerHTML = '';
    
    let questionCount = 0;
    
    for (const category in questions) {
        questions[category].forEach((q, index) => {
            questionCount++;
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            let answerText = '';
            if (q.type === 'Multiple Choice') {
                const correctIndex = q.correctAnswer.charCodeAt(0) - 65;
                answerText = `Answer: ${q.correctAnswer}. ${q.options[correctIndex]}`;
            } else {
                answerText = `Answer: ${q.correctAnswer}`;
            }
            
            questionItem.innerHTML = `
                <div class="question-item-header">
                    <span class="question-category">${category}</span>
                    <span class="question-type">${q.type}</span>
                </div>
                <div class="question-item-text">${q.question}</div>
                <div class="question-answer">${answerText}</div>
                <button class="delete-btn" onclick="deleteQuestion('${category}', ${index})">Delete</button>
            `;
            
            listContainer.appendChild(questionItem);
        });
    }
    
    if (questionCount === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">No questions added yet.</p>';
    }
}

function deleteQuestion(category, index) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    const questions = getQuestions();
    questions[category].splice(index, 1);
    
    // Remove category if empty
    if (questions[category].length === 0) {
        delete questions[category];
    }
    
    saveQuestions(questions);
    loadQuestionsList();
}

// ===============================
// INITIALIZATION
// ===============================

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the question page and load questions list
    if (document.getElementById('questionsList')) {
        loadQuestionsList();
    }
});