import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { skillAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Timer, ChevronRight, ChevronLeft } from 'lucide-react';

const Quiz = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    startVerification();
  }, [skillId]);

  const startVerification = async () => {
    try {
      const res = await skillAPI.verifySkill(skillId);
      setQuizData(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
    } catch (error) {
      alert("Failed to start verification. Please try again.");
      navigate(-1);
    }
    setLoading(false);
  };

  const handleSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await skillAPI.submitQuiz(skillId, quizData.quiz_id, answers);
      setResult(res.data);
    } catch (error) {
      alert("Submission failed.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Generating your AI-powered quiz...</div>;
  
  if (result) {
    return (
      <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          {result.score >= 7 ? (
            <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
          ) : (
            <AlertCircle size={80} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
          )}
          <h2>{result.score >= 7 ? 'Verification Successful!' : 'Verification Failed'}</h2>
          <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>Your Score: <strong>{result.score} / 10</strong></p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {result.score >= 7 
              ? 'Congratulations! You have earned a verified badge for this skill.' 
              : 'You need at least 7/10 to be verified. Review your skills and try again later.'}
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary">Back to Profile</button>
        </motion.div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="container" style={{ paddingTop: '3rem', maxWidth: '800px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Skill Verification</h2>
          <p style={{ color: 'var(--text-muted)' }}>Question {currentQuestion + 1} of {quizData.questions.length}</p>
        </div>
        <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 700 }}>
          <Timer size={20} />
          <span>No Time Limit</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '3rem', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--primary)' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="card"
          style={{ minHeight: '400px' }}
        >
          <h3 style={{ marginBottom: '2rem', fontSize: '1.3rem', lineHeight: 1.4 }}>{question.question}</h3>
          
          <div className="flex flex-col gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                style={{
                  textAlign: 'left',
                  padding: '1.2rem',
                  background: answers[currentQuestion] === index ? 'rgba(10, 102, 194, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${answers[currentQuestion] === index ? 'var(--primary)' : 'var(--border)'}`,
                  color: 'var(--text)',
                  fontSize: '1rem',
                  borderRadius: '12px'
                }}
              >
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid var(--border)',
                    background: answers[currentQuestion] === index ? 'var(--primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center" style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => setCurrentQuestion(prev => prev - 1)} 
          disabled={currentQuestion === 0}
          className="btn-ghost flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        {currentQuestion === quizData.questions.length - 1 ? (
          <button 
            onClick={handleSubmit} 
            disabled={submitting || answers.includes(null)}
            className="btn-primary"
            style={{ padding: '12px 32px' }}
          >
            {submitting ? 'Submitting...' : 'Finish Quiz'}
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={answers[currentQuestion] === null}
            className="btn-primary flex items-center gap-2"
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
