import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { api } from '../config/api';

// Icons
const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
);

const ClipboardIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

function MockTest({ onBack, selectedExam }) {
    const { user } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);
    const [mockTestPaper, setMockTestPaper] = useState(null);
    const [error, setError] = useState(null);
    const [testConfig, setTestConfig] = useState({
        subject: '',
        difficulty: 'medium',
        questionCount: 30,
        duration: 60,
        includeAnswers: true,
        topics: []
    });
    const [availableTopics, setAvailableTopics] = useState([]);
    const [generatedTests, setGeneratedTests] = useState([]);

    const examName = selectedExam?.name || 'GATE';

    // Define exam-specific topics
    const examTopics = {
        'GATE': [
            'Engineering Mathematics',
            'Digital Logic',
            'Computer Organization',
            'Programming & Data Structures',
            'Algorithms',
            'Theory of Computation',
            'Compiler Design',
            'Operating Systems',
            'Databases',
            'Computer Networks'
        ],
        'UPSC': [
            'Indian History',
            'Indian Geography',
            'Indian Polity',
            'Economics',
            'Environment & Ecology',
            'Science & Technology',
            'Current Affairs',
            'Art & Culture',
            'International Relations',
            'Ethics & Integrity'
        ],
        'SSC': [
            'Quantitative Aptitude',
            'Reasoning',
            'English Language',
            'General Awareness',
            'Computer Knowledge'
        ]
    };

    useEffect(() => {
        const topics = examTopics[examName.toUpperCase()] || examTopics['GATE'];
        setAvailableTopics(topics);
        setTestConfig(prev => ({
            ...prev,
            subject: topics[0] || '',
            topics: []
        }));
    }, [examName]);

    const handleTopicToggle = (topic) => {
        setTestConfig(prev => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter(t => t !== topic)
                : [...prev.topics, topic]
        }));
    };

    const generateMockTest = async () => {
        setIsGenerating(true);
        setError(null);
        setMockTestPaper(null);

        try {
            const topicsToUse = testConfig.topics.length > 0 
                ? testConfig.topics.join(', ') 
                : testConfig.subject || 'General';

            const response = await fetch(`${api.baseUrl}/api/mock-test/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam: examName,
                    subject: topicsToUse,
                    difficulty: testConfig.difficulty,
                    question_count: testConfig.questionCount,
                    duration: testConfig.duration,
                    include_answers: testConfig.includeAnswers,
                    user_id: user?.id
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMockTestPaper(data);
                
                // Add to generated tests history
                setGeneratedTests(prev => [{
                    id: Date.now(),
                    exam: examName,
                    subject: topicsToUse,
                    difficulty: testConfig.difficulty,
                    questionCount: testConfig.questionCount,
                    timestamp: new Date().toLocaleString(),
                    paper: data
                }, ...prev.slice(0, 4)]);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate mock test');
            }
        } catch (error) {
            console.error('Error generating mock test:', error);
            setError(error.message || 'Failed to generate mock test. Please try again.');
        }

        setIsGenerating(false);
    };

    const downloadPaper = (format = 'txt') => {
        if (!mockTestPaper) return;

        let content = '';
        let filename = '';
        let mimeType = '';

        if (format === 'txt') {
            content = mockTestPaper.paper_text;
            filename = `${examName}_MockTest_${new Date().toISOString().split('T')[0]}.txt`;
            mimeType = 'text/plain';
        } else if (format === 'html') {
            content = generateHTMLPaper();
            filename = `${examName}_MockTest_${new Date().toISOString().split('T')[0]}.html`;
            mimeType = 'text/html';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const generateHTMLPaper = () => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examName} Mock Test Paper</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .instructions {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .instructions h3 {
            margin-top: 0;
        }
        .question {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .question-number {
            font-weight: bold;
            color: #2563eb;
        }
        .options {
            margin-left: 20px;
            margin-top: 10px;
        }
        .option {
            margin: 5px 0;
        }
        .answers-section {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #333;
            page-break-before: always;
        }
        .answer-key {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
        }
        .answer-item {
            padding: 5px 10px;
            background: #e5e7eb;
            border-radius: 3px;
            text-align: center;
        }
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${examName} Mock Test Paper</h1>
        <p>Subject: ${mockTestPaper?.subject || 'General'}</p>
        <p>Duration: ${testConfig.duration} minutes | Total Questions: ${testConfig.questionCount}</p>
        <p>Difficulty: ${testConfig.difficulty.charAt(0).toUpperCase() + testConfig.difficulty.slice(1)}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
            <li>Read each question carefully before answering.</li>
            <li>All questions carry equal marks.</li>
            <li>There is no negative marking unless specified.</li>
            <li>Write your answers clearly.</li>
        </ul>
    </div>

    <div class="questions">
        ${mockTestPaper?.paper_html || mockTestPaper?.paper_text?.replace(/\n/g, '<br>') || ''}
    </div>

    <button class="no-print" onclick="window.print()" style="position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Print Paper
    </button>
</body>
</html>`;
    };

    const copyToClipboard = () => {
        if (mockTestPaper?.paper_text) {
            navigator.clipboard.writeText(mockTestPaper.paper_text);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon />
                                <span className="ml-2 font-medium">Back</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-gray-900">📝 Mock Test Generator</span>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    {examName}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Test Configuration Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ClipboardIcon />
                                </div>
                                <h2 className="ml-3 text-lg font-semibold text-gray-900">Test Configuration</h2>
                            </div>

                            {/* Difficulty Selection */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty Level
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['easy', 'medium', 'hard'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setTestConfig(prev => ({ ...prev, difficulty: level }))}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                                testConfig.difficulty === level
                                                    ? level === 'easy' ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                    : level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                                                    : 'bg-red-100 text-red-800 border-2 border-red-500'
                                                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Count */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Questions: {testConfig.questionCount}
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={testConfig.questionCount}
                                    onChange={(e) => setTestConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>10</span>
                                    <span>50</span>
                                    <span>100</span>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration: {testConfig.duration} minutes
                                </label>
                                <input
                                    type="range"
                                    min="15"
                                    max="180"
                                    step="15"
                                    value={testConfig.duration}
                                    onChange={(e) => setTestConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>15 min</span>
                                    <span>90 min</span>
                                    <span>180 min</span>
                                </div>
                            </div>

                            {/* Include Answers Toggle */}
                            <div className="mb-5">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={testConfig.includeAnswers}
                                            onChange={(e) => setTestConfig(prev => ({ ...prev, includeAnswers: e.target.checked }))}
                                            className="sr-only"
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${testConfig.includeAnswers ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${testConfig.includeAnswers ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        Include Answer Key
                                    </span>
                                </label>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={generateMockTest}
                                disabled={isGenerating}
                                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                                    isGenerating
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <DocumentIcon />
                                        <span>Generate Mock Test</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Topics Selection Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Topics (Optional)</h3>
                            <div className="flex flex-wrap gap-2">
                                {availableTopics.map((topic) => (
                                    <button
                                        key={topic}
                                        onClick={() => handleTopicToggle(topic)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            testConfig.topics.includes(topic)
                                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                        }`}
                                    >
                                        {testConfig.topics.includes(topic) && <span className="mr-1">✓</span>}
                                        {topic}
                                    </button>
                                ))}
                            </div>
                            {testConfig.topics.length > 0 && (
                                <p className="text-xs text-gray-500 mt-3">
                                    {testConfig.topics.length} topic(s) selected
                                </p>
                            )}
                        </div>

                        {/* Recent Tests */}
                        {generatedTests.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Tests</h3>
                                <div className="space-y-3">
                                    {generatedTests.map((test) => (
                                        <div
                                            key={test.id}
                                            onClick={() => setMockTestPaper(test.paper)}
                                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{test.exam}</span>
                                                <span className="text-xs text-gray-500">{test.questionCount} Q</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{test.subject}</p>
                                            <p className="text-xs text-gray-400 mt-1">{test.timestamp}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Generated Paper */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
                            {/* Paper Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center">
                                    <DocumentIcon />
                                    <h2 className="ml-2 text-lg font-semibold text-gray-900">Generated Paper</h2>
                                </div>
                                {mockTestPaper && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            <ClipboardIcon />
                                        </button>
                                        <button
                                            onClick={() => downloadPaper('txt')}
                                            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            <DownloadIcon />
                                            <span className="ml-1">TXT</span>
                                        </button>
                                        <button
                                            onClick={() => downloadPaper('html')}
                                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            <DownloadIcon />
                                            <span className="ml-1">HTML</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Paper Content */}
                            <div className="p-6">
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-600 font-medium">Generating your mock test paper...</p>
                                        <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
                                    </div>
                                ) : mockTestPaper ? (
                                    <div className="prose prose-sm max-w-none">
                                        {/* Paper Header */}
                                        <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                {examName} Mock Test Paper
                                            </h1>
                                            <p className="text-gray-600">Subject: {mockTestPaper.subject}</p>
                                            <p className="text-gray-600">
                                                Duration: {testConfig.duration} minutes | Questions: {testConfig.questionCount}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Difficulty: {testConfig.difficulty.charAt(0).toUpperCase() + testConfig.difficulty.slice(1)}
                                            </p>
                                        </div>

                                        {/* Instructions */}
                                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• Read each question carefully before answering.</li>
                                                <li>• All questions carry equal marks.</li>
                                                <li>• There is no negative marking unless specified.</li>
                                                <li>• Write your answers clearly on a separate sheet.</li>
                                            </ul>
                                        </div>

                                        {/* Questions */}
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
                                            {mockTestPaper.paper_text}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                                            <DocumentIcon />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No Paper Generated Yet
                                        </h3>
                                        <p className="text-gray-500 max-w-md">
                                            Configure your test settings on the left and click "Generate Mock Test" 
                                            to create a downloadable question paper.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MockTest;
