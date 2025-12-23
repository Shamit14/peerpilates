from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
import datetime
import re
import google.generativeai as genai
import asyncio
from typing import Optional

router = APIRouter()

# Configure Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str
    subject: str = "UPSC"
    user_id: Optional[int] = None
    file_content: Optional[str] = None  # For uploaded files

class ChatResponse(BaseModel):
    response: str
    timestamp: str = None
    source: str = "gemini"  # gemini or fallback

@router.get("/ai-agent/status")
async def get_ai_agent_status():
    """Check if AI agent service is available."""
    return {
        "status": "active",
        "gemini_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_google_gemini_api_key"),
        "supported_subjects": ["UPSC", "GATE", "SSC", "Banking", "Railways", "Current Affairs"]
    }

async def get_gemini_response(message: str, subject: str, file_content: Optional[str] = None) -> str:
    """Get response from Gemini API for government exam preparation."""
    
    try:
        if not settings.GEMINI_API_KEY:
            raise Exception("Gemini API key not configured")
        
        # Create the model (using latest stable version)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Prepare the enhanced prompt with formatting guidelines
        system_prompt = f"""You are an expert AI tutor specializing in Indian government competitive examinations. You have extensive knowledge about {subject} and other government exams like UPSC, GATE, SSC, Banking, Railways, etc.

CRITICAL FORMATTING REQUIREMENTS:
1. Always start with a clear heading using **bold** formatting
2. Use bullet points (•) for lists and subtopics
3. Use numbered lists (1., 2., 3.) for sequential steps
4. Use subheadings with **bold** for different sections
5. Keep paragraphs short and well-organized
6. Use line breaks for better readability
7. End EVERY response with 2-3 relevant follow-up questions

RESPONSE STRUCTURE TEMPLATE:
**[Topic Title for {subject}]**

**Key Points:**
• Point 1 with clear explanation
• Point 2 with relevant details
• Point 3 with practical application

**Study Strategy:**
1. Step-by-step approach
2. Timeline and planning
3. Resources and materials

**Important Notes:**
• Additional tips
• Common mistakes to avoid
• Success strategies

**Follow-up Questions:**
What would you like to know more about:
1. [Related question 1]?
2. [Related question 2]?
3. [Related question 3]?

Subject Focus: {subject}
User Query: {message}

Remember: Format your response exactly like the template above with proper headings, bullet points, and ALWAYS end with follow-up questions."""

        # Add file content if provided
        if file_content:
            system_prompt += f"\n\nUser has uploaded content:\n{file_content[:2000]}...\n\nPlease analyze this content and relate it to their query about {subject}."
        
        # Generate response
        response = model.generate_content(system_prompt)
        
        if response.text:
            return response.text
        else:
            return get_enhanced_response(message, subject)
            
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        # Fallback to enhanced response
        return get_enhanced_response(message, subject)

def get_enhanced_response(message: str, subject: str) -> str:
    """Generate enhanced responses for government exam preparation."""
    
    message_lower = message.lower()
    
    # Define knowledge bases for different subjects
    subject_guides = {
        "UPSC": {
            "syllabus": "**UPSC Civil Services Examination Syllabus:**\n\n**Preliminary Examination:**\n• **Paper I (General Studies):** History, Geography, Polity, Economics, Environment, Current Affairs\n• **Paper II (CSAT):** Reasoning, Mathematics, English Comprehension, Decision Making\n\n**Main Examination:**\n• **Compulsory Papers:** Essay, General Studies I-IV, Optional Subject, Language Papers\n• **General Studies Papers:**\n  - GS I: History, Geography, Culture\n  - GS II: Polity, Governance, International Relations\n  - GS III: Economics, Environment, Science & Technology\n  - GS IV: Ethics, Integrity, Aptitude\n\n**Key Focus Areas:**\n• Ancient, Medieval & Modern Indian History\n• Indian Geography & World Geography  \n• Indian Polity & Constitution\n• Economics & Economic Development\n• Current Affairs (National & International)\n• Environment & Ecology\n• Science & Technology\n\n**Foundation Strategy:**\nStart with NCERT books (Classes 6-12), then progress to standard reference books. Maintain daily current affairs reading and regular answer writing practice.",
            
            "strategy": "**UPSC Preparation Strategy:**\n\n**Phase 1 (Foundation - 4-6 months):**\n• Complete NCERT books (History: 6th-12th, Geography: 6th-12th, Polity: 9th-12th)\n• Basic Economics (11th-12th NCERT)\n• Environment basics\n\n**Phase 2 (Building - 4-6 months):**\n• Standard reference books (Laxmikanth for Polity, Ramesh Singh for Economics)\n• Previous year question analysis\n• Current affairs compilation\n\n**Phase 3 (Practice - 2-4 months):**\n• Mock tests and test series\n• Answer writing practice\n• Revision and weak area improvement\n\n**Daily Schedule:** 8-10 hours study, including 2 hours for current affairs and 1 hour for answer writing.",
            
            "current_affairs": "**Current Affairs for UPSC:**\n\n**Sources:**\n• The Hindu newspaper (daily)\n• PIB (Press Information Bureau)\n• Yojana & Kurukshetra magazines\n• Economic Survey & Budget\n\n**Monthly Compilation Strategy:**\n• National issues & government schemes\n• International relations & foreign policy\n• Economic developments & policies\n• Science & technology updates\n• Environment & climate change\n• Sports & awards\n\n**Integration Approach:** Connect current events with static topics from your syllabus. For example, link recent economic policies with basic economic concepts.",
        },
        
        "GATE": {
            "strategy": "**GATE Preparation Strategy:**\n\n**Phase 1 (Concept Building - 4-5 months):**\n• Revisit undergraduate textbooks\n• Focus on fundamental concepts\n• Solve basic numerical problems\n\n**Phase 2 (Practice - 3-4 months):**\n• Previous year questions (topic-wise)\n• Standard reference books\n• Advanced problem solving\n\n**Phase 3 (Mock Tests - 2-3 months):**\n• Full-length mock tests\n• Time management practice\n• Weak area identification and improvement\n\n**Scoring Strategy:**\n• Target 85%+ accuracy in strong subjects\n• Attempt 60-65 questions out of 65\n• Focus on 1-mark questions first\n• Avoid negative marking traps",
            
            "books": "**GATE Standard Books by Subject:**\n\n**Mathematics:**\n• Higher Engineering Mathematics - B.S. Grewal\n• Advanced Engineering Mathematics - Erwin Kreyszig\n\n**Engineering Mathematics:**\n• Linear Algebra: Standard textbooks\n• Probability: S. Ross or Papoulis\n• Numerical Methods: S.S. Sastry\n\n**Core Subjects (varies by branch):**\n• Consult branch-specific standard textbooks\n• Use previous toppers' recommended book lists\n• Online video lectures for concept clarity\n\n**Practice Books:**\n• GATE Previous Year Solved Papers\n• Branch-specific practice books\n• Online test series",
        },
        
        "SSC": {
            "strategy": "**SSC Preparation Strategy:**\n\n**Quantitative Aptitude:**\n• Master basic arithmetic and algebra\n• Learn shortcuts and quick calculation methods\n• Time management is crucial (50 seconds per question)\n\n**Reasoning:**\n• Logical reasoning and analytical ability\n• Pattern recognition and series\n• Regular practice of different question types\n\n**English:**\n• Grammar rules and vocabulary\n• Reading comprehension practice\n• Error detection and sentence improvement\n\n**General Awareness:**\n• Current affairs (last 12 months)\n• Static GK (History, Geography, Science)\n• Government schemes and policies\n\n**Time Management:** 25 minutes per section in SSC CGL Tier-1",
        },
        
        "Banking": {
            "strategy": "**Banking Exam Preparation:**\n\n**Reasoning Ability:**\n• Puzzles and seating arrangements\n• Syllogism and blood relations\n• Data sufficiency and coding-decoding\n\n**Quantitative Aptitude:**\n• Data Interpretation (most important)\n• Number series and quadratic equations\n• Arithmetic problems (SI/CI, Profit/Loss)\n\n**English Language:**\n• Reading comprehension\n• Grammar and vocabulary\n• Para jumbles and error detection\n\n**Banking Awareness:**\n• Banking terms and concepts\n• RBI policies and guidelines\n• Recent banking news and developments\n\n**Computer Knowledge:** Basic computer concepts and MS Office",
        },
        
        "Railways": {
            "strategy": "**Railway Exam Preparation:**\n\n**Mathematics:**\n• Number system and simplification\n• Percentage, ratio and proportion\n• Time and work, speed and distance\n\n**General Intelligence & Reasoning:**\n• Analogies and classifications\n• Series and coding-decoding\n• Mathematical operations and relationships\n\n**General Science:**\n• Physics, Chemistry, Biology basics\n• Scientific discoveries and inventions\n• Environmental science\n\n**General Awareness:**\n• Current affairs (sports, awards, books)\n• Indian geography and history\n• Indian polity and economy\n\n**Technical Subjects:** Varies by post (Mechanical, Electrical, Civil, etc.)",
        },
        
        "Current Affairs": {
            "monthly": "**Current Affairs Compilation Strategy:**\n\n**Week 1:** National news and government policies\n**Week 2:** International affairs and bilateral relations\n**Week 3:** Economic developments and business news\n**Week 4:** Science, technology, and environment\n\n**Monthly Review:**\n• Important appointments and resignations\n• New schemes and policy changes\n• International summits and agreements\n• Awards and recognitions\n• Sports events and achievements\n\n**Sources:** The Hindu, Indian Express, PIB, Yojana magazine",
            
            "integration": "**Connecting Current Affairs with Static Topics:**\n\n**Example Approach:**\n• Economic Policy → Basic Economic Concepts\n• International Agreement → Geography/Polity\n• Scientific Discovery → General Science\n• Government Scheme → Public Administration\n\n**Study Method:**\n1. Read the current event\n2. Identify related static topics\n3. Connect and understand the broader context\n4. Make notes linking both aspects\n5. Practice related questions",
        }
    }
    
    # Detect query type and provide formatted response
    if any(word in message_lower for word in ["syllabus", "curriculum", "topics", "what to study"]):
        response = subject_guides.get(subject, {}).get("syllabus", f"**{subject} Syllabus Overview:**\n\nThis covers the complete syllabus structure for {subject} preparation.")
        response += f"\n\n**Follow-up Questions:**\nWhat would you like to know more about:\n1. Detailed topic-wise breakdown?\n2. Study timeline and planning?\n3. Recommended books and resources?"
        return response
    
    elif any(word in message_lower for word in ["strategy", "plan", "how to prepare", "study plan", "preparation"]):
        response = subject_guides.get(subject, {}).get("strategy", f"**{subject} Preparation Strategy:**\n\nHere's a comprehensive strategy for {subject} preparation.")
        response += f"\n\n**Follow-up Questions:**\nWould you like guidance on:\n1. Daily study schedule planning?\n2. Subject-wise preparation tips?\n3. Mock test and revision strategy?"
        return response
    
    elif any(word in message_lower for word in ["current affairs", "daily news", "monthly", "updates"]):
        response = subject_guides.get(subject, {}).get("current_affairs", subject_guides.get("Current Affairs", {}).get("monthly", "**Current Affairs Strategy:**\n\nCurrent affairs are crucial for government exams and require systematic preparation."))
        response += f"\n\n**Follow-up Questions:**\nWhat specific area interests you:\n1. Monthly current affairs compilation?\n2. Newspaper reading strategy?\n3. Connecting current affairs with static topics?"
        return response
    
    elif any(word in message_lower for word in ["books", "reference", "study material", "resources"]):
        response = subject_guides.get(subject, {}).get("books", f"**Recommended Books for {subject}:**\n\nHere are the essential books and study materials for {subject} preparation.")
        response += f"\n\n**Follow-up Questions:**\nDo you need help with:\n1. Subject-wise book recommendations?\n2. Online resources and test series?\n3. Previous year question papers?"
        return response
    
    elif any(word in message_lower for word in ["mock test", "practice", "previous year", "test series"]):
        response = f"**Mock Tests & Practice Strategy for {subject}:**\n\n**Key Benefits:**\n• Assess your current preparation level\n• Identify strengths and weak areas\n• Improve time management skills\n• Build exam temperament and confidence\n\n**Practice Schedule:**\n• Take 2-3 mock tests per week during final preparation\n• Analyze each test thoroughly\n• Focus on accuracy over speed initially\n• Gradually improve timing as exam approaches\n\n**Follow-up Questions:**\nWhat aspect would you like to explore:\n1. Best mock test series recommendations?\n2. How to analyze mock test results?\n3. Strategy for different exam phases?"
        return response
    
    else:
        # General formatted query response
        return f"**Regarding '{message}' for {subject} Preparation:**\n\n**Overview:**\nThis is an important topic for {subject} preparation that requires focused attention and proper understanding.\n\n**Key Areas to Consider:**\n• Conceptual understanding\n• Practical applications\n• Previous year question patterns\n• Current relevance and updates\n\n**Follow-up Questions:**\nTo provide more specific guidance, please let me know:\n1. Which specific aspect would you like to focus on?\n2. Are you looking for study strategy or content explanation?\n3. Do you need practice questions or conceptual clarity?\n\nI'm here to provide comprehensive guidance for your {subject} preparation!"

@router.post("/ai-agent/test")
async def test_gemini_api():
    """Test endpoint to verify Gemini API is working."""
    try:
        if not settings.GEMINI_API_KEY:
            return {"status": "error", "message": "Gemini API key not configured"}
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello! Can you help with UPSC preparation?")
        
        if response.text:
            return {
                "status": "success", 
                "message": "Gemini API is working",
                "sample_response": response.text[:200] + "..."
            }
        else:
            return {"status": "error", "message": "No response from Gemini"}
            
    except Exception as e:
        return {"status": "error", "message": f"Gemini API error: {str(e)}"}

@router.post("/ai-agent/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """Send a message to the AI agent for government exam preparation."""
    
    try:
        # Try Gemini API first
        if settings.GEMINI_API_KEY:
            try:
                response_text = await get_gemini_response(
                    request.message, 
                    request.subject,
                    request.file_content
                )
                source = "gemini"
            except Exception as e:
                print(f"Gemini API failed, using fallback: {str(e)}")
                response_text = get_enhanced_response(request.message, request.subject)
                source = "fallback"
        else:
            response_text = get_enhanced_response(request.message, request.subject)
            source = "fallback"
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.datetime.now().isoformat(),
            source=source
        )
    
    except Exception as e:
        # Ultimate fallback response
        return ChatResponse(
            response=f"I'm here to help with your {request.subject} preparation! Could you please rephrase your question or ask about specific topics like syllabus, strategy, current affairs, or study materials?",
            timestamp=datetime.datetime.now().isoformat(),
            source="fallback"
        )