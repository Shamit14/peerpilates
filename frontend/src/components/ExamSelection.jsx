import React, { useState } from 'react';

const ExamSelection = ({ onExamSelect, user, onLogout }) => {
  const [selectedExam, setSelectedExam] = useState('');

  const exams = [
    {
      id: 'gate',
      name: 'GATE',
      title: 'Engineering & Technology',
      description: 'Graduate Aptitude Test in Engineering - AI-Powered Study Assistant',
      icon: '🏛️',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-300'
    },
    {
      id: 'upsc',
      name: 'UPSC',
      title: 'Civil Services',
      description: 'Union Public Service Commission - Comprehensive Exam Preparation',
      icon: '📚',
      color: 'bg-green-50 border-green-200 hover:border-green-300'
    },
    {
      id: 'ssc',
      name: 'SSC',
      title: 'Government Jobs',
      description: 'Staff Selection Commission - Multi-level Government Positions',
      icon: '🏢',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-300'
    }
  ];

  const handleExamSelect = () => {
    if (selectedExam) {
      const exam = exams.find(e => e.id === selectedExam);
      onExamSelect(exam);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">🧠 AI Study Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={onLogout}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Peer Pilots</h1>
          <p className="text-lg text-gray-600">AI-Powered Study Assistant with Retrieval-Augmented Generation</p>
        </div>

        {/* Exam Selection Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Select Your Exam</h2>
          
          <div className="mb-6">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Choose an exam...</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {exam.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExamSelect}
            disabled={!selectedExam}
            className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
              selectedExam
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Preparation
          </button>
        </div>

        {/* Exam Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${exam.color} ${
                selectedExam === exam.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedExam(exam.id)}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{exam.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h3>
                <p className="text-sm font-medium text-gray-700 mb-2">{exam.title}</p>
                <p className="text-sm text-gray-600">{exam.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamSelection;