import { AlertCircle, ArrowLeft, ArrowRight, Award, CheckCircle2, Clock, Flag, RotateCcw, Send, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Chapter, PracticeSubmission, Question, Subject } from '../types.ts';

interface PracticeSessionProps {
  sectionTitle: string;
  subject: Subject;
  chapter: Chapter;
  questions: Question[];
  onBack: () => void;
  onRetake: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  sectionTitle,
  subject,
  chapter,
  questions,
  onBack,
  onRetake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(questions.length * 60); // 1 min per question
  const [isFinished, setIsFinished] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (isFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleClearOption = () => {
    if (isFinished) return;
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true);
      const totalTimeSpent = questions.length * 60 - timeRemainingSeconds;
      const payloadAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || '',
      }));

      const res = await api.submitPractice({
        section: sectionTitle,
        subject: subject.name,
        chapterTitle: chapter.title,
        answers: payloadAnswers,
        timeSpentSeconds: Math.max(10, totalTimeSpent),
      });

      setSubmissionResult(res.submission);
      setIsFinished(true);
      setConfirmSubmitModal(false);
    } catch (err: any) {
      alert('Error submitting practice: ' + (err.message || 'Please check your connection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const attemptedCount = Object.keys(selectedAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-6">
      {/* Top Session Breadcrumb & Status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6edf6] mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-[#1261c9] font-bold flex items-center gap-1 hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Selection
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{subject.icon}</span>
            <h2 className="text-base md:text-lg font-bold text-[#14213d] m-0">
              {subject.name} • {chapter.title}
            </h2>
            <span className="bg-blue-50 text-[#1261c9] text-xs font-bold px-2 py-0.5 rounded-full">
              {sectionTitle}
            </span>
          </div>
        </div>

        {/* Live Timer if still practicing */}
        {!isFinished && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-900 font-mono font-bold text-sm">
              <Clock size={16} className="text-amber-600 animate-spin" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>
            <button
              onClick={() => setConfirmSubmitModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send size={13} />
              Submit Test
            </button>
          </div>
        )}
      </div>

      {/* RESULT & SOLUTIONS VIEW */}
      {isFinished && submissionResult ? (
        <div className="space-y-6">
          {/* Big Scorecard Banner */}
          <div className="bg-gradient-to-br from-[#082f73] via-[#0b3d91] to-[#1467d5] text-white rounded-3xl p-6 md:p-8 shadow-xl text-center relative overflow-hidden">
            <div className="inline-block bg-white/20 text-cyan-200 text-xs font-black uppercase px-3 py-1 rounded-full mb-3">
              Practice Complete • Result Analysis
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-1">
              Score: {submissionResult.score} / {submissionResult.totalPossibleScore}
            </h2>
            <p className="text-sm opacity-90 max-w-md mx-auto mb-6">
              You answered {submissionResult.correctAnswers} correctly out of {submissionResult.totalQuestions} questions with {submissionResult.accuracyPercentage}% accuracy.
            </p>

            {/* Score metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
                <span className="text-xs text-cyan-200 block">Accuracy</span>
                <span className="text-xl font-black">{submissionResult.accuracyPercentage}%</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
                <span className="text-xs text-emerald-200 block">Correct</span>
                <span className="text-xl font-black text-emerald-300">{submissionResult.correctAnswers}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
                <span className="text-xs text-rose-200 block">Wrong</span>
                <span className="text-xl font-black text-rose-300">{submissionResult.wrongAnswers}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
                <span className="text-xs text-gray-200 block">Time Spent</span>
                <span className="text-xl font-black">
                  {Math.floor(submissionResult.timeSpentSeconds / 60)}m {submissionResult.timeSpentSeconds % 60}s
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={onRetake}
                className="bg-white text-[#082f73] hover:bg-cyan-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Retake Test
              </button>
              <button
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Question-by-Question Review with Step-by-Step Solutions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6edf6]">
            <h3 className="text-lg font-bold text-[#14213d] mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#1261c9]" />
              Detailed Solutions &amp; Step-by-Step Explanations
            </h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const ansObj = submissionResult.answers.find(a => a.questionId === q.id);
                const isCorrect = ansObj?.isCorrect;
                const chosenOptionId = ansObj?.selectedOptionId;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      !chosenOptionId
                        ? 'border-gray-200 bg-gray-50/50'
                        : isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-600">Question {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {q.examTag && (
                          <span className="text-[10px] bg-blue-100 text-[#1261c9] px-2 py-0.5 rounded-full font-bold">
                            {q.examTag}
                          </span>
                        )}
                        {!chosenOptionId ? (
                          <span className="text-[11px] font-bold text-gray-500">Unattempted</span>
                        ) : isCorrect ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Correct (+{q.marks})
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                            <XCircle size={14} /> Incorrect (0)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 mb-3">{q.questionText}</p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {q.options.map(opt => {
                        const isChosen = chosenOptionId === opt.id;
                        const isRight = q.correctOptionId === opt.id;

                        let optClasses = 'border-gray-200 bg-white text-gray-700';
                        if (isRight) {
                          optClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        } else if (isChosen && !isRight) {
                          optClasses = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClasses}`}
                          >
                            <span>{opt.text}</span>
                            {isRight && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                            {isChosen && !isRight && <XCircle size={14} className="text-rose-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Model Solution Box */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-gray-800">
                      <b className="text-[#1261c9] block mb-1">Detailed Explanation &amp; Working:</b>
                      <p className="m-0 leading-relaxed font-sans">{q.solution}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE PRACTICE / EXAM INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Card (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-[#e6edf6] flex flex-col justify-between min-h-[460px]">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <span className="text-xs font-bold text-gray-500">
                  Question <b className="text-gray-900">{currentIndex + 1}</b> of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  {currentQ.examTag && (
                    <span className="text-[10px] bg-blue-100 text-[#1261c9] px-2 py-0.5 rounded-full font-bold">
                      {currentQ.examTag}
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">
                    Marks: +{currentQ.marks}
                  </span>
                  <button
                    onClick={handleToggleReview}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      markedForReview[currentQ.id]
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Flag size={12} />
                    {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark Review'}
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-base font-medium text-gray-900 leading-relaxed">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isSelected = selectedAnswers[currentQ.id] === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`p-3.5 rounded-xl border text-sm flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1261c9] bg-blue-50/70 font-semibold text-gray-900 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 text-gray-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-[#1261c9] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Previous
                </button>
                {selectedAnswers[currentQ.id] && (
                  <button
                    onClick={handleClearOption}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 cursor-pointer font-medium"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-5 py-2 bg-[#1261c9] hover:bg-[#0e4e9f] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    Next Question <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmSubmitModal(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    Submit Test <Send size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Question Palette & Summary (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6edf6]">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Question Palette
              </h3>

              {/* Status legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Answered ({attemptedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span>Review ({markedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                  <span>Unattempted ({questions.length - attemptedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full ring-2 ring-[#1261c9] bg-blue-100"></span>
                  <span>Current</span>
                </div>
              </div>

              {/* Number buttons grid */}
              <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = Boolean(selectedAnswers[q.id]);
                  const isMarked = Boolean(markedForReview[q.id]);

                  let btnColor = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
                  if (isMarked) {
                    btnColor = 'bg-purple-600 text-white';
                  } else if (isAnswered) {
                    btnColor = 'bg-emerald-600 text-white';
                  }

                  if (isCurrent) {
                    btnColor += ' ring-2 ring-blue-500 ring-offset-1 font-black';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${btnColor}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setConfirmSubmitModal(true)}
                className="w-full mt-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                SUBMIT TEST
              </button>
            </div>

            {/* Quick Practice Tip */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-xs text-blue-950">
              <b className="block font-bold mb-1">MHT-CET Strategy Tip</b>
              <p className="m-0 leading-relaxed text-[11px] text-blue-900/80">
                There is no negative marking in MHT-CET, so attempt every question. In Mathematics, each question carries 2 marks!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Final Submit */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <Award className="w-12 h-12 text-[#1261c9] mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Submit Practice Test?</h3>
            <p className="text-xs text-gray-500 mb-4">
              You have answered {attemptedCount} out of {questions.length} questions. You will get instant step-by-step solutions and an email report.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmSubmitModal(false)}
                className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
