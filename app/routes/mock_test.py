from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
import datetime
from typing import Optional, List
import google.generativeai as genai

router = APIRouter()

# Configure Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class MockTestRequest(BaseModel):
    exam: str = "GATE"
    subject: str = "General"
    difficulty: str = "medium"
    question_count: int = 30
    duration: int = 60
    include_answers: bool = True
    user_id: Optional[int] = None

class MockTestResponse(BaseModel):
    paper_text: str
    paper_html: Optional[str] = None
    subject: str
    exam: str
    question_count: int
    difficulty: str
    duration: int
    generated_at: str
    include_answers: bool

@router.post("/mock-test/generate", response_model=MockTestResponse)
async def generate_mock_test(request: MockTestRequest):
    """Generate a mock test paper based on the specified parameters."""
    
    try:
        paper_text = await generate_mock_test_paper(
            exam=request.exam,
            subject=request.subject,
            difficulty=request.difficulty,
            question_count=request.question_count,
            duration=request.duration,
            include_answers=request.include_answers
        )
        
        return MockTestResponse(
            paper_text=paper_text,
            paper_html=None,
            subject=request.subject,
            exam=request.exam,
            question_count=request.question_count,
            difficulty=request.difficulty,
            duration=request.duration,
            generated_at=datetime.datetime.now().isoformat(),
            include_answers=request.include_answers
        )
    except Exception as e:
        print(f"Error generating mock test: {str(e)}")
        # Return a fallback paper
        fallback_paper = generate_fallback_paper(
            exam=request.exam,
            subject=request.subject,
            difficulty=request.difficulty,
            question_count=request.question_count,
            include_answers=request.include_answers
        )
        return MockTestResponse(
            paper_text=fallback_paper,
            paper_html=None,
            subject=request.subject,
            exam=request.exam,
            question_count=request.question_count,
            difficulty=request.difficulty,
            duration=request.duration,
            generated_at=datetime.datetime.now().isoformat(),
            include_answers=request.include_answers
        )

async def generate_mock_test_paper(
    exam: str,
    subject: str,
    difficulty: str,
    question_count: int,
    duration: int,
    include_answers: bool
) -> str:
    """Generate mock test paper using Gemini API."""
    
    if not settings.GEMINI_API_KEY:
        return generate_fallback_paper(exam, subject, difficulty, question_count, include_answers)
    
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        difficulty_guide = {
            "easy": "basic conceptual questions suitable for beginners",
            "medium": "intermediate level questions testing application of concepts",
            "hard": "advanced questions requiring deep understanding and problem-solving skills"
        }
        
        answer_instruction = ""
        if include_answers:
            answer_instruction = """

After all questions, include a clearly separated "ANSWER KEY" section with:
- Question number and correct answer option (e.g., Q1: B)
- Brief explanation for each answer (1-2 lines)"""
        
        prompt = f"""Generate a professional mock test paper for {exam} examination.

PAPER SPECIFICATIONS:
- Subject/Topics: {subject}
- Difficulty Level: {difficulty} ({difficulty_guide.get(difficulty, 'moderate difficulty')})
- Total Questions: {question_count}
- Duration: {duration} minutes

QUESTION FORMAT REQUIREMENTS:
1. Generate exactly {question_count} Multiple Choice Questions (MCQs)
2. Each question must have exactly 4 options labeled (A), (B), (C), (D)
3. Questions should be numbered sequentially (Q1, Q2, Q3, etc.)
4. Ensure questions progress from slightly easier to harder within the paper
5. Include a mix of:
   - Conceptual questions (40%)
   - Application-based questions (35%)
   - Analysis/Problem-solving questions (25%)

OUTPUT FORMAT:
Start directly with questions. Use this exact format:

Q1. [Question text]
(A) [Option A]
(B) [Option B]
(C) [Option C]
(D) [Option D]

Q2. [Question text]
... and so on{answer_instruction}

IMPORTANT:
- Make questions exam-relevant and realistic
- Avoid trivial or overly complex questions
- Ensure all options are plausible
- Questions should test genuine understanding
- Cover various sub-topics within the subject area

Generate the complete mock test paper now:"""

        response = model.generate_content(prompt)
        
        if response.text:
            return response.text
        else:
            return generate_fallback_paper(exam, subject, difficulty, question_count, include_answers)
            
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_paper(exam, subject, difficulty, question_count, include_answers)

def generate_fallback_paper(
    exam: str,
    subject: str,
    difficulty: str,
    question_count: int,
    include_answers: bool
) -> str:
    """Generate a fallback mock test paper when API is unavailable."""
    
    # Sample question templates based on exam type
    question_banks = {
        "GATE": {
            "Engineering Mathematics": [
                ("The eigenvalues of a matrix A are 1, 2, and 3. What is the trace of A?", ["3", "6", "1", "9"], "B", "Trace equals sum of eigenvalues: 1+2+3=6"),
                ("The Laplace transform of t*sin(t) is:", ["s/(s²+1)²", "2s/(s²+1)²", "1/(s²+1)", "s²/(s²+1)²"], "B", "Using L{t*f(t)} = -d/ds[F(s)]"),
                ("If f(x) = x³ - 3x + 2, then f'(1) equals:", ["0", "1", "-2", "3"], "A", "f'(x) = 3x² - 3, f'(1) = 3-3 = 0"),
            ],
            "Programming & Data Structures": [
                ("What is the time complexity of binary search?", ["O(n)", "O(log n)", "O(n²)", "O(1)"], "B", "Binary search divides search space by half each iteration"),
                ("Which data structure uses LIFO principle?", ["Queue", "Stack", "Linked List", "Tree"], "B", "Stack follows Last-In-First-Out principle"),
                ("The worst-case time complexity of quicksort is:", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], "C", "Worst case occurs when pivot is always smallest/largest"),
            ],
            "default": [
                ("Which of the following is true about linked lists?", ["Random access is O(1)", "Insertion at head is O(n)", "Memory allocation is contiguous", "Insertion at head is O(1)"], "D", "Head insertion only requires pointer update"),
                ("In a binary tree with n nodes, the minimum height is:", ["n-1", "log₂(n)", "⌊log₂(n)⌋", "n/2"], "C", "Minimum height for complete binary tree"),
            ]
        },
        "UPSC": {
            "Indian History": [
                ("Who founded the Indian National Congress in 1885?", ["Mahatma Gandhi", "A.O. Hume", "Jawaharlal Nehru", "Bal Gangadhar Tilak"], "B", "A.O. Hume, a British civil servant, founded INC in 1885"),
                ("The Quit India Movement was launched in:", ["1940", "1942", "1944", "1946"], "B", "Quit India Movement started on August 8, 1942"),
                ("Which Mughal emperor built the Taj Mahal?", ["Akbar", "Shah Jahan", "Aurangzeb", "Jahangir"], "B", "Shah Jahan built it as a mausoleum for his wife Mumtaz Mahal"),
            ],
            "Indian Polity": [
                ("How many Fundamental Rights are there in the Indian Constitution?", ["5", "6", "7", "8"], "B", "Originally 7, now 6 after 44th Amendment removed Right to Property"),
                ("The President of India is elected by:", ["Parliament", "Electoral College", "Direct Election", "State Legislatures"], "B", "Electoral College of elected MPs and MLAs"),
                ("Which article of the Constitution deals with Emergency provisions?", ["Article 352", "Article 356", "Article 360", "All of the above"], "D", "352-National, 356-State, 360-Financial Emergency"),
            ],
            "default": [
                ("The planning commission was replaced by:", ["NITI Aayog", "Finance Commission", "Economic Survey", "None"], "A", "NITI Aayog replaced Planning Commission in 2015"),
            ]
        },
        "SSC": {
            "Quantitative Aptitude": [
                ("If a:b = 2:3 and b:c = 4:5, then a:b:c is:", ["8:12:15", "2:3:4", "4:6:5", "8:12:10"], "A", "a:b = 8:12, b:c = 12:15, so a:b:c = 8:12:15"),
                ("The average of first 50 natural numbers is:", ["25", "25.5", "26", "50"], "B", "Sum = n(n+1)/2 = 1275, Average = 1275/50 = 25.5"),
                ("If the radius of a circle is doubled, its area becomes:", ["Double", "Four times", "Three times", "Eight times"], "B", "Area = πr², if r becomes 2r, area = π(2r)² = 4πr²"),
            ],
            "Reasoning": [
                ("In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?", ["EFJDJOFM", "MFEJDJOF", "FEJDJOFM", "EOIDJNEM"], "A", "Each letter shifted by +1 in reverse order"),
                ("Find the odd one out: 2, 5, 10, 17, 27, 37", ["10", "17", "27", "37"], "C", "Pattern is n²+1: 1,4,9,16,25,36 but 27≠26"),
            ],
            "default": [
                ("Select the related word: Book : Pages :: Tree : ?", ["Branches", "Leaves", "Roots", "Trunk"], "B", "Book has pages, Tree has leaves"),
            ]
        }
    }
    
    # Get questions for the exam and subject
    exam_upper = exam.upper()
    questions = []
    
    if exam_upper in question_banks:
        # Check if specific subject exists
        subject_questions = None
        for key in question_banks[exam_upper]:
            if key.lower() in subject.lower():
                subject_questions = question_banks[exam_upper][key]
                break
        
        if subject_questions:
            questions = subject_questions
        else:
            # Combine all questions for this exam
            for key, qs in question_banks[exam_upper].items():
                questions.extend(qs)
    else:
        # Use default questions
        questions = [
            ("What is the capital of India?", ["Mumbai", "New Delhi", "Kolkata", "Chennai"], "B", "New Delhi is the capital of India"),
            ("Who wrote the Indian National Anthem?", ["Bankim Chandra Chatterjee", "Rabindranath Tagore", "Mahatma Gandhi", "Jawaharlal Nehru"], "B", "Rabindranath Tagore wrote 'Jana Gana Mana'"),
        ]
    
    # Build the paper
    paper_lines = []
    paper_lines.append(f"{'='*60}")
    paper_lines.append(f"{exam.upper()} MOCK TEST PAPER")
    paper_lines.append(f"Subject: {subject}")
    paper_lines.append(f"Difficulty: {difficulty.capitalize()}")
    paper_lines.append(f"Total Questions: {question_count}")
    paper_lines.append(f"{'='*60}\n")
    paper_lines.append("INSTRUCTIONS:")
    paper_lines.append("1. Read each question carefully before answering.")
    paper_lines.append("2. Each question carries equal marks.")
    paper_lines.append("3. There is no negative marking.")
    paper_lines.append("4. Choose the best answer from the given options.\n")
    paper_lines.append(f"{'='*60}\n")
    paper_lines.append("QUESTIONS:\n")
    
    answers = []
    
    # Generate questions (cycle through available questions if needed)
    for i in range(question_count):
        q_idx = i % len(questions)
        q_data = questions[q_idx]
        question_text, options, answer, explanation = q_data
        
        paper_lines.append(f"Q{i+1}. {question_text}")
        paper_lines.append(f"(A) {options[0]}")
        paper_lines.append(f"(B) {options[1]}")
        paper_lines.append(f"(C) {options[2]}")
        paper_lines.append(f"(D) {options[3]}")
        paper_lines.append("")
        
        answers.append((i+1, answer, explanation))
    
    if include_answers:
        paper_lines.append(f"\n{'='*60}")
        paper_lines.append("ANSWER KEY")
        paper_lines.append(f"{'='*60}\n")
        
        for q_num, ans, exp in answers:
            paper_lines.append(f"Q{q_num}: {ans}")
            paper_lines.append(f"   Explanation: {exp}\n")
    
    paper_lines.append(f"\n{'='*60}")
    paper_lines.append("END OF PAPER")
    paper_lines.append(f"{'='*60}")
    
    return "\n".join(paper_lines)

@router.get("/mock-test/subjects/{exam}")
async def get_exam_subjects(exam: str):
    """Get available subjects for a specific exam."""
    
    subjects = {
        "GATE": [
            "Engineering Mathematics",
            "Digital Logic",
            "Computer Organization",
            "Programming & Data Structures",
            "Algorithms",
            "Theory of Computation",
            "Compiler Design",
            "Operating Systems",
            "Databases",
            "Computer Networks"
        ],
        "UPSC": [
            "Indian History",
            "Indian Geography",
            "Indian Polity",
            "Economics",
            "Environment & Ecology",
            "Science & Technology",
            "Current Affairs",
            "Art & Culture",
            "International Relations",
            "Ethics & Integrity"
        ],
        "SSC": [
            "Quantitative Aptitude",
            "Reasoning",
            "English Language",
            "General Awareness",
            "Computer Knowledge"
        ],
        "Banking": [
            "Quantitative Aptitude",
            "Reasoning",
            "English Language",
            "Banking Awareness",
            "Computer Knowledge",
            "Current Affairs"
        ],
        "Railways": [
            "Mathematics",
            "General Intelligence & Reasoning",
            "General Science",
            "General Awareness"
        ]
    }
    
    exam_upper = exam.upper()
    if exam_upper in subjects:
        return {"exam": exam, "subjects": subjects[exam_upper]}
    else:
        return {"exam": exam, "subjects": ["General"]}
