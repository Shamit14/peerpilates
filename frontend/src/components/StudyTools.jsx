import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { parseMarkdown } from '../utils/markdownParser';

// Icons
const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
);

const ClockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const BookOpenIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
    </svg>
);

const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
);

const TargetIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
);

function StudyTools({ onBack, selectedExam }) {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [studyPlan, setStudyPlan] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [timeData, setTimeData] = useState({
        targetDate: new Date(),
        totalDays: 0,
        months: 0,
        weeks: 0,
        days: 0,
        totalStudyHours: 0,
        phase: 'Preparation',
        phaseColor: 'bg-gray-500'
    });
    const [customExamDate, setCustomExamDate] = useState('');
    const [studyHoursPerDay, setStudyHoursPerDay] = useState(6);
    const [error, setError] = useState(null);

    const examName = selectedExam?.name || 'GATE';

    // Calculate time remaining on mount and when exam changes
    useEffect(() => {
        try {
            calculateTimeRemaining();
        } catch (err) {
            console.error('Error calculating time:', err);
            setError(err.message);
        }
    }, [selectedExam, customExamDate, studyHoursPerDay]);

    const calculateTimeRemaining = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        // Default exam schedules
        const examSchedules = {
            'GATE': {
                dates: [
                    new Date(currentYear, 1, 3),
                    new Date(currentYear, 1, 4),
                    new Date(currentYear, 1, 10),
                    new Date(currentYear, 1, 11)
                ],
                nextYear: new Date(currentYear + 1, 1, 3)
            },
            'UPSC': {
                dates: [
                    new Date(currentYear, 5, 16),
                    new Date(currentYear, 8, 15)
                ],
                nextYear: new Date(currentYear + 1, 5, 16)
            },
            'SSC': {
                dates: [
                    new Date(currentYear, 10, 15),
                    new Date(currentYear, 11, 15)
                ],
                nextYear: new Date(currentYear + 1, 10, 15)
            },
            'Banking': {
                dates: [
                    new Date(currentYear, 2, 15),
                    new Date(currentYear, 8, 20)
                ],
                nextYear: new Date(currentYear + 1, 2, 15)
            },
            'Railways': {
                dates: [
                    new Date(currentYear, 3, 10),
                    new Date(currentYear, 9, 15)
                ],
                nextYear: new Date(currentYear + 1, 3, 10)
            }
        };

        let targetDate;
        if (customExamDate) {
            targetDate = new Date(customExamDate);
        } else {
            const schedule = examSchedules[examName.toUpperCase()] || examSchedules['GATE'];
            targetDate = null;
            for (const date of schedule.dates) {
                if (date > currentDate) {
                    targetDate = date;
                    break;
                }
            }
            if (!targetDate) {
                targetDate = schedule.nextYear;
            }
        }

        const timeDiff = targetDate.getTime() - currentDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const months = Math.floor(totalDays / 30);
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 30;
        const hours = totalDays * studyHoursPerDay;

        setTimeData({
            targetDate,
            totalDays: Math.max(0, totalDays),
            months: Math.max(0, months),
            weeks: Math.max(0, weeks),
            days: Math.max(0, days),
            totalStudyHours: Math.max(0, hours),
            phase: totalDays > 180 ? 'Foundation' : totalDays > 90 ? 'Intensive' : totalDays > 30 ? 'Revision' : 'Final Sprint',
            phaseColor: totalDays > 180 ? 'bg-green-500' : totalDays > 90 ? 'bg-blue-500' : totalDays > 30 ? 'bg-yellow-500' : 'bg-red-500'
        });
    };

    const generateStudyPlan = async () => {
        setIsGenerating(true);
        setError(null);
        
        const daysRemaining = timeData?.totalDays || 90;
        
        try {
            const response = await fetch('http://localhost:8000/api/ai-agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Generate a comprehensive ${daysRemaining}-day study plan for ${examName} exam. Include:
                    1. Phase-wise breakdown (Foundation, Practice, Revision)
                    2. Subject-wise daily schedule
                    3. Weekly milestones and targets
                    4. Recommended resources and books
                    5. Mock test schedule
                    6. Daily study hours: ${studyHoursPerDay} hours
                    Make it specific and actionable.`,
                    subject: examName,
                    user_id: user?.id
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setStudyPlan(data.response);
            } else {
                throw new Error('Failed to generate study plan');
            }
        } catch (error) {
            console.error('Error generating study plan:', error);
            // Fallback study plan - use string format for consistency
            setStudyPlan(generateFallbackPlanText(daysRemaining));
        }
        
        setIsGenerating(false);
    };

    const generateFallbackPlanText = (days) => {
        return `**📚 ${examName} Study Plan (${days} Days)**

**Phase 1: Foundation Building (${Math.floor(days * 0.4)} days)**
• Complete basic concepts and fundamentals
• Study NCERT/standard textbooks
• Build strong conceptual understanding
• Daily study: ${studyHoursPerDay} hours

**Phase 2: Intensive Practice (${Math.floor(days * 0.35)} days)**
• Solve previous year questions
• Take topic-wise tests
• Focus on weak areas
• Daily study: ${studyHoursPerDay + 1} hours

**Phase 3: Revision & Mock Tests (${Math.floor(days * 0.25)} days)**
• Complete revision of all topics
• Daily mock tests
• Analyze and improve
• Daily study: ${studyHoursPerDay + 2} hours

**Weekly Schedule:**
• Monday-Friday: Core subjects study
• Saturday: Practice tests
• Sunday: Revision and rest

**Recommended Resources:**
• Standard textbooks for ${examName}
• Previous year question papers
• Online test series
• Current affairs (if applicable)

**Tips for Success:**
• Maintain consistency in study hours
• Take regular breaks (Pomodoro technique)
• Stay healthy - sleep 7-8 hours
• Review mistakes from mock tests`;
    };

    const generateFallbackPlan = (days) => {
        const phases = [];
        
        if (days > 180) {
            phases.push({
                name: 'Foundation Phase',
                duration: '3-4 months',
                focus: ['Complete NCERT/Basic textbooks', 'Build fundamental concepts', 'Start current affairs habit'],
                dailyHours: studyHoursPerDay
            });
        }
        
        if (days > 90) {
            phases.push({
                name: 'Intensive Phase',
                duration: '2-3 months',
                focus: ['Subject-wise deep study', 'Previous year questions', 'Weekly tests'],
                dailyHours: studyHoursPerDay + 1
            });
        }
        
        if (days > 30) {
            phases.push({
                name: 'Revision Phase',
                duration: '1 month',
                focus: ['Complete revision', 'Mock tests', 'Weak area improvement'],
                dailyHours: studyHoursPerDay + 2
            });
        }
        
        phases.push({
            name: 'Final Sprint',
            duration: 'Last 30 days',
            focus: ['Quick revision', 'Daily mock tests', 'Focus on high-weightage topics'],
            dailyHours: studyHoursPerDay + 2
        });

        return phases;
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Time Countdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Days Remaining</p>
                            <p className="text-4xl font-bold text-black">{timeData?.totalDays || 0}</p>
                        </div>
                        <div className="text-black"><CalendarIcon /></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Weeks Left</p>
                            <p className="text-4xl font-bold text-black">{timeData?.weeks || 0}</p>
                        </div>
                        <div className="text-black"><ClockIcon /></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Study Hours</p>
                            <p className="text-4xl font-bold text-black">{timeData?.totalStudyHours || 0}</p>
                        </div>
                        <div className="text-black"><BookOpenIcon /></div>
                    </div>
                </div>
                <div className="bg-black rounded-xl p-6 text-white shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Current Phase</p>
                            <p className="text-2xl font-bold">{timeData?.phase || 'Preparation'}</p>
                        </div>
                        <TargetIcon />
                    </div>
                </div>
            </div>

            {/* Exam Info */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">{selectedExam?.icon || '📚'}</span>
                    {examName} Exam Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600 text-sm">Target Exam Date</p>
                        <p className="text-lg font-medium text-gray-900">
                            {timeData?.targetDate?.toDateString() || 'Not Set'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Study Hours/Day</p>
                        <p className="text-lg font-medium text-gray-900">{studyHoursPerDay} hours</p>
                    </div>
                </div>
            </div>

            {/* Quick Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Daily Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-black mb-2">📖 Study Time</h4>
                        <p className="text-gray-600">
                            {timeData?.totalDays > 60 ? '4-6 hours' : timeData?.totalDays > 30 ? '6-8 hours' : '8-10 hours'} of focused study
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-black mb-2">📝 Revision</h4>
                        <p className="text-gray-600">
                            {timeData?.totalDays > 60 ? '1 hour' : timeData?.totalDays > 30 ? '2 hours' : '3-4 hours'} daily revision
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-black mb-2">📋 Mock Tests</h4>
                        <p className="text-gray-600">
                            {timeData?.totalDays > 60 ? '1 per week' : timeData?.totalDays > 30 ? '2 per week' : 'Daily practice'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStudyPlan = () => (
        <div className="space-y-6">
            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Plan Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Exam Date</label>
                        <input
                            type="date"
                            value={customExamDate}
                            onChange={(e) => setCustomExamDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Study Hours/Day</label>
                        <input
                            type="range"
                            min="2"
                            max="12"
                            value={studyHoursPerDay}
                            onChange={(e) => setStudyHoursPerDay(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-center text-gray-600 mt-1">{studyHoursPerDay} hours</p>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={generateStudyPlan}
                            disabled={isGenerating}
                            className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Generating...
                                </span>
                            ) : '🚀 Generate AI Study Plan'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Generated Plan or Default Phases */}
            {studyPlan ? (
                typeof studyPlan === 'string' ? (
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Your Personalized Study Plan</h3>
                        <div className="prose max-w-none text-gray-700">
                            {parseMarkdown(studyPlan)}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {studyPlan.map((phase, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Phase {index + 1}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                                    <span className="text-gray-500 text-sm">({phase.duration})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Focus Areas:</h4>
                                        <ul className="space-y-1">
                                            {phase.focus.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-gray-600">
                                                    <span className="text-black">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-600 text-sm">Recommended Daily Hours</p>
                                        <p className="text-2xl font-bold text-gray-900">{phase.dailyHours} hours</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 border border-gray-200 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Your Study Plan</h3>
                    <p className="text-gray-600 mb-4">Click the button above to create a personalized AI-powered study plan for your {examName} preparation.</p>
                </div>
            )}
        </div>
    );

    const renderTimeRemaining = () => (
        <div className="space-y-6">
            {/* Large Countdown Display */}
            <div className="bg-black rounded-2xl p-8 text-white shadow-xl">
                <h3 className="text-center text-gray-400 mb-2">Time Until {examName} Exam</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-5xl font-bold text-white">{timeData?.months || 0}</p>
                        <p className="text-gray-400 text-sm mt-1">Months</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-white">{timeData?.weeks || 0}</p>
                        <p className="text-gray-400 text-sm mt-1">Weeks</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-white">{timeData?.totalDays || 0}</p>
                        <p className="text-gray-400 text-sm mt-1">Days</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-white">{timeData?.totalStudyHours || 0}</p>
                        <p className="text-gray-400 text-sm mt-1">Study Hours</p>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-gray-400">Exam Date: {timeData?.targetDate?.toDateString()}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Preparation Progress Tracker</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Foundation Phase</span>
                            <span>{timeData?.totalDays > 180 ? 'Current' : timeData?.totalDays > 90 ? 'Completed' : 'Completed'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-black h-3 rounded-full transition-all duration-500"
                                style={{ width: timeData?.totalDays > 180 ? '30%' : '100%' }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Intensive Phase</span>
                            <span>{timeData?.totalDays > 180 ? 'Upcoming' : timeData?.totalDays > 90 ? 'Current' : 'Completed'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-gray-700 h-3 rounded-full transition-all duration-500"
                                style={{ width: timeData?.totalDays > 180 ? '0%' : timeData?.totalDays > 90 ? '50%' : '100%' }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Revision Phase</span>
                            <span>{timeData?.totalDays > 90 ? 'Upcoming' : timeData?.totalDays > 30 ? 'Current' : 'Completed'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: timeData?.totalDays > 90 ? '0%' : timeData?.totalDays > 30 ? '60%' : '100%' }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Final Sprint</span>
                            <span>{timeData?.totalDays > 30 ? 'Upcoming' : 'Current'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                                style={{ width: timeData?.totalDays > 30 ? '0%' : `${100 - (timeData?.totalDays / 30) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Key Milestones</h3>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                        {[
                            { days: 180, title: 'Complete Foundation', desc: 'Finish all basic concepts and NCERT books' },
                            { days: 120, title: 'Subject Mastery', desc: 'Complete advanced topics and reference books' },
                            { days: 60, title: 'Practice Phase', desc: 'Start intensive mock tests and PYQs' },
                            { days: 30, title: 'Final Revision', desc: 'Complete revision and daily mock tests' },
                            { days: 7, title: 'Last Week Prep', desc: 'Light revision and exam strategy' }
                        ].map((milestone, index) => (
                            <div key={index} className="flex items-start gap-4 ml-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold z-10 ${timeData?.totalDays <= milestone.days ? 'bg-black text-white ring-4 ring-gray-200' : 'bg-gray-300 text-gray-500'}`}>
                                    {timeData?.totalDays <= milestone.days ? '✓' : index + 1}
                                </div>
                                <div className={timeData?.totalDays <= milestone.days ? '' : 'opacity-50'}>
                                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                                    <p className="text-gray-600 text-sm">{milestone.desc}</p>
                                    <p className="text-gray-400 text-xs mt-1">{milestone.days} days before exam</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedExam?.icon || '📚'}</span>
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">Study Tools</h1>
                                    <p className="text-sm text-gray-500">{examName} Preparation</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Welcome,</span>
                            <span className="font-medium text-gray-900">{user?.name || 'Student'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm mb-6 p-2 border border-gray-200">
                    <div className="flex gap-2">
                        {[
                            { id: 'overview', label: '📊 Overview', icon: ChartIcon },
                            { id: 'studyplan', label: '📋 Study Plan', icon: BookOpenIcon },
                            { id: 'timeremaining', label: '⏰ Time Tracker', icon: ClockIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'studyplan' && renderStudyPlan()}
                {activeTab === 'timeremaining' && renderTimeRemaining()}
            </main>
        </div>
    );
}

export default StudyTools;
