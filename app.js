// 应用主逻辑
class QuizApp {
    constructor() {
        this.currentChapter = null;
        this.currentQuestion = null;
        this.usedQuestions = new Set();
        this.isRandomMode = false; // 新增：标记是否为随机模式
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        // 获取DOM元素
        this.chapterSelection = document.getElementById('chapter-selection');
        this.questionSection = document.getElementById('question-section');
        this.allQuestionsSection = document.getElementById('all-questions-section');
        this.chapterTitle = document.getElementById('chapter-title');
        this.questionText = document.getElementById('question-text');
        this.userAnswer = document.getElementById('user-answer');
        this.submitBtn = document.getElementById('submit-btn');
        this.nextQuestionBtn = document.getElementById('next-question-btn');
        this.retryQuestionBtn = document.getElementById('retry-question-btn');
        this.backBtn = document.getElementById('back-btn');
        this.backFromAllBtn = document.getElementById('back-from-all-btn');
        this.answerDisplay = document.getElementById('answer-display');
        this.correctAnswer = document.getElementById('correct-answer');
        this.randomBtn = document.getElementById('random-question-btn');
        this.viewAllBtn = document.getElementById('view-all-btn');
        this.allQuestionsContent = document.getElementById('all-questions-content');
        this.tocContent = document.getElementById('toc-content');
        
        // 获取所有章节按钮
        this.chapterBtns = document.querySelectorAll('.chapter-btn');
    }
    
    bindEvents() {
        // 章节选择事件
        this.chapterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chapter = e.target.dataset.chapter;
                this.selectChapter(chapter);
            });
        });
        
        // 随机题目按钮事件
        this.randomBtn.addEventListener('click', () => {
            this.startRandomMode();
        });
        
        // 查看所有题目按钮事件
        this.viewAllBtn.addEventListener('click', () => {
            this.showAllQuestions();
        });
        
        // 提交答案事件
        this.submitBtn.addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // 下一题事件
        this.nextQuestionBtn.addEventListener('click', () => {
            this.showNextQuestion();
        });
        
        // 重新答题事件
        this.retryQuestionBtn.addEventListener('click', () => {
            this.retryCurrentQuestion();
        });
        
        // 返回按钮事件
        this.backBtn.addEventListener('click', () => {
            this.backToChapterSelection();
        });
        
        // 从所有题目界面返回按钮事件
        this.backFromAllBtn.addEventListener('click', () => {
            this.backToChapterSelection();
        });
        
        // 回车提交答案
        this.userAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitAnswer();
            }
        });
    }
    
    selectChapter(chapterKey) {
        this.currentChapter = chapterKey;
        this.isRandomMode = false;
        this.usedQuestions.clear();
        
        // 更新章节标题
        const chapterData = questionsData[chapterKey];
        this.chapterTitle.textContent = `${chapterKey} ${chapterData.title}`;
        
        // 显示题目界面
        this.showQuestionSection();
        
        // 显示第一题
        this.showRandomQuestion();
    }
    
    // 新增：开始随机模式
    startRandomMode() {
        this.isRandomMode = true;
        this.currentChapter = null;
        this.usedQuestions.clear();
        
        // 更新标题
        this.chapterTitle.textContent = '🎲 随机题目练习 - 全题库随机抽取';
        
        // 显示题目界面
        this.showQuestionSection();
        
        // 显示随机题目
        this.showRandomQuestion();
    }
    
    // 新增：显示所有题目和答案
    showAllQuestions() {
        this.chapterSelection.classList.add('hidden');
        this.questionSection.classList.add('hidden');
        this.allQuestionsSection.classList.remove('hidden');
        
        // 生成所有题目内容
        this.generateAllQuestionsContent();
        this.generateTableOfContents();
    }
    
    generateTableOfContents() {
        let tocHTML = '';
        
        // 遍历所有章节生成目录
        Object.keys(questionsData).forEach(chapterKey => {
            const chapterData = questionsData[chapterKey];
            const chapterId = `chapter-${chapterKey.replace(/第|章/g, '')}`;
            
            tocHTML += `
                <a href="#${chapterId}" class="toc-item" data-chapter-id="${chapterId}">
                    ${chapterKey} ${chapterData.title}
                </a>
            `;
        });
        
        this.tocContent.innerHTML = tocHTML;
        
        // 为目录项添加点击事件
        this.tocContent.querySelectorAll('.toc-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const chapterId = e.target.dataset.chapterId;
                this.scrollToChapter(chapterId);
            });
        });
    }
    
    scrollToChapter(chapterId) {
        const targetElement = document.getElementById(chapterId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // 添加高亮效果
            targetElement.style.transition = 'all 0.3s ease';
            targetElement.style.transform = 'scale(1.02)';
            targetElement.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            
            // 3秒后移除高亮效果
            setTimeout(() => {
                targetElement.style.transform = 'scale(1)';
                targetElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }, 3000);
        }
    }
    
    generateAllQuestionsContent() {
        let contentHTML = '';
        
        // 遍历所有章节
        Object.keys(questionsData).forEach(chapterKey => {
            const chapterData = questionsData[chapterKey];
            const chapterId = `chapter-${chapterKey.replace(/第|章/g, '')}`;
            
            contentHTML += `
                <div class="chapter-section" id="${chapterId}">
                    <h3 class="chapter-header">${chapterKey} ${chapterData.title}</h3>
                    <div class="questions-list">
            `;
            
            // 遍历章节中的所有题目
            chapterData.questions.forEach((question, index) => {
                contentHTML += `
                    <div class="question-item">
                        <h4 class="question-title">题目 ${index + 1}：</h4>
                        <div class="question-content">
                            <p><strong>问题：</strong>${question.question}</p>
                            <div class="answer-title">参考答案：</div>
                            <div class="answer-content">${question.answer}</div>
                        </div>
                    </div>
                `;
            });
            
            contentHTML += `
                    </div>
                </div>
            `;
        });
        
        this.allQuestionsContent.innerHTML = contentHTML;
    }
    
    showQuestionSection() {
        this.chapterSelection.classList.add('hidden');
        this.questionSection.classList.remove('hidden');
    }
    
    showRandomQuestion() {
        let availableQuestions;
        
        if (this.isRandomMode) {
            // 随机模式：从所有章节获取题目
            availableQuestions = [];
            Object.keys(questionsData).forEach(chapterKey => {
                const chapterData = questionsData[chapterKey];
                chapterData.questions.forEach(question => {
                    if (!this.usedQuestions.has(question.id)) {
                        availableQuestions.push({
                            ...question,
                            chapterInfo: `${chapterKey} ${chapterData.title}`
                        });
                    }
                });
            });
        } else {
            // 章节模式：只从当前章节获取题目
            const chapterData = questionsData[this.currentChapter];
            availableQuestions = chapterData.questions.filter(q => 
                !this.usedQuestions.has(q.id)
            );
        }
        
        if (availableQuestions.length === 0) {
            // 所有题目都做完了
            this.showAllQuestionsCompleted();
            return;
        }
        
        // 随机选择一个题目
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        this.currentQuestion = availableQuestions[randomIndex];
        
        // 显示题目
        if (this.isRandomMode && this.currentQuestion.chapterInfo) {
            this.questionText.innerHTML = `
                <div class="question-chapter-info">
                    <span class="chapter-tag">${this.currentQuestion.chapterInfo}</span>
                </div>
                <div class="question-content">${this.currentQuestion.question}</div>
            `;
        } else {
            this.questionText.textContent = this.currentQuestion.question;
        }
        
        // 重置界面状态
        this.userAnswer.value = '';
        this.userAnswer.disabled = false;
        this.submitBtn.classList.remove('hidden');
        this.nextQuestionBtn.classList.add('hidden');
        this.retryQuestionBtn.classList.add('hidden');
        this.answerDisplay.classList.add('hidden');
        
        // 标记题目为已使用
        this.usedQuestions.add(this.currentQuestion.id);
    }
    
    submitAnswer() {
        const userInput = this.userAnswer.value.trim();
        
        if (!userInput) {
            alert('请输入答案后再提交！');
            return;
        }
        
        // 显示参考答案
        this.correctAnswer.textContent = this.currentQuestion.answer;
        this.answerDisplay.classList.remove('hidden');
        
        // 禁用输入和提交按钮
        this.userAnswer.disabled = true;
        this.submitBtn.classList.add('hidden');
        this.nextQuestionBtn.classList.remove('hidden');
        this.retryQuestionBtn.classList.remove('hidden');
        
        // 滚动到答案区域
        this.answerDisplay.scrollIntoView({ behavior: 'smooth' });
    }
    
    showNextQuestion() {
        this.showRandomQuestion();
    }
    
    retryCurrentQuestion() {
        // 重置当前题目的状态，允许用户重新答题
        // 保留用户之前的输入内容，不清空
        this.userAnswer.disabled = false;
        this.submitBtn.classList.remove('hidden');
        this.nextQuestionBtn.classList.add('hidden');
        this.retryQuestionBtn.classList.add('hidden');
        this.answerDisplay.classList.add('hidden');
        
        // 聚焦到答案输入框
        this.userAnswer.focus();
    }
    
    showAllQuestionsCompleted() {
        if (this.isRandomMode) {
            this.questionText.textContent = '🎉 恭喜！你已经完成了全题库的所有题目练习！';
        } else {
            this.questionText.textContent = '🎉 恭喜！你已经完成了本章节的所有题目练习！';
        }
        
        this.userAnswer.style.display = 'none';
        this.submitBtn.classList.add('hidden');
        this.nextQuestionBtn.classList.add('hidden');
        this.retryQuestionBtn.classList.add('hidden');
        this.answerDisplay.classList.add('hidden');
        
        // 添加重新开始按钮
        const restartBtn = document.createElement('button');
        if (this.isRandomMode) {
            restartBtn.textContent = '重新开始随机练习';
        } else {
            restartBtn.textContent = '重新开始本章';
        }
        restartBtn.className = 'submit-btn';
        restartBtn.onclick = () => {
            this.usedQuestions.clear();
            this.userAnswer.style.display = 'block';
            restartBtn.remove();
            this.showRandomQuestion();
        };
        
        this.userAnswer.parentNode.appendChild(restartBtn);
    }
    
    backToChapterSelection() {
        this.questionSection.classList.add('hidden');
        this.allQuestionsSection.classList.add('hidden');
        this.chapterSelection.classList.remove('hidden');
        this.currentChapter = null;
        this.currentQuestion = null;
        this.isRandomMode = false;
        this.usedQuestions.clear();
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});

// 添加一些实用功能
document.addEventListener('keydown', (e) => {
    // ESC键返回章节选择
    if (e.key === 'Escape') {
        const app = window.quizApp;
        if (app && !document.getElementById('question-section').classList.contains('hidden')) {
            app.backToChapterSelection();
        }
    }
});

// 防止意外刷新丢失进度
window.addEventListener('beforeunload', (e) => {
    if (!document.getElementById('question-section').classList.contains('hidden')) {
        e.preventDefault();
        e.returnValue = '确定要离开吗？当前进度将会丢失。';
    }
});
