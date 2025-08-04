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
        
        # Create the model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare the prompt with context
        system_prompt = f"""You are an expert AI tutor specializing in Indian government competitive examinations. You have extensive knowledge about {subject} and other government exams like UPSC, GATE, SSC, Banking, Railways, etc.

Key Guidelines:
1. Provide accurate, detailed, and structured answers
2. Focus specifically on {subject} exam preparation
3. Include practical study tips and strategies
4. Reference official sources when possible
5. Break down complex topics into understandable parts
6. Suggest relevant study materials and resources
7. Keep current affairs updated and relevant
8. Provide example questions when helpful

Subject Focus: {subject}
User Query: {message}"""

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
            "syllabus": "**UPSC Syllabus Overview:**\n\n**Prelims:** General Studies Paper I (History, Geography, Polity, Economics, Environment) & General Studies Paper II (CSAT - Reasoning, Math, English)\n\n**Mains:** Essay, GS Papers I-IV, Optional Subject, Language Papers\n\n**Key Focus Areas:**\n• Ancient, Medieval & Modern Indian History\n• Indian Geography & World Geography\n• Indian Polity & Constitution\n• Economics & Economic Development\n• Current Affairs (National & International)\n• Environment & Ecology\n\n**Study Strategy:** Start with NCERT books (6th-12th), then move to standard reference books. Regular current affairs reading and answer writing practice are essential.",
            
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
    
    # Detect query type and provide appropriate response
    if any(word in message_lower for word in ["syllabus", "curriculum", "topics", "what to study"]):
        return subject_guides.get(subject, {}).get("syllabus", f"Here's the syllabus information for {subject}...")
    
    elif any(word in message_lower for word in ["strategy", "plan", "how to prepare", "study plan", "preparation"]):
        return subject_guides.get(subject, {}).get("strategy", f"Here's an effective preparation strategy for {subject}...")
    
    elif any(word in message_lower for word in ["current affairs", "daily news", "monthly", "updates"]):
        return subject_guides.get(subject, {}).get("current_affairs", subject_guides.get("Current Affairs", {}).get("monthly", "Current affairs are crucial for government exams..."))
    
    elif any(word in message_lower for word in ["books", "reference", "study material", "resources"]):
        return subject_guides.get(subject, {}).get("books", f"Here are the recommended books for {subject}...")
    
    elif any(word in message_lower for word in ["mock test", "practice", "previous year", "test series"]):
        return f"**Mock Tests & Practice for {subject}:**\n\n• Take regular mock tests to assess your preparation\n• Analyze your performance and identify weak areas\n• Practice previous year questions topic-wise\n• Focus on time management and accuracy\n• Join test series from reputed institutes\n• Review your mistakes and avoid repetition\n\n**Frequency:** 2-3 mock tests per week during final preparation phase."
    
    else:
        # General query response
        return f"**Regarding '{message}' for {subject}:**\n\nThis is an important topic for {subject} preparation. To provide you with the most accurate and helpful information, could you please specify what exactly you'd like to know about this topic?\n\nFor example:\n• Syllabus coverage\n• Study strategy\n• Important subtopics\n• Previous year questions\n• Current affairs relevance\n• Recommended resources\n\nI'm here to help you with comprehensive guidance for your {subject} preparation!"

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