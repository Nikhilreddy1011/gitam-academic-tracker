import React, { useContext } from 'react';
import { ToastContext } from '../components/Layout';

// ✅ Links for each subject
const MATS = [
  {
    icon: '📐',
    t: 'Mathematics',
    d: 'Calculus, Linear Algebra, Discrete Maths, Probability',
    c: 'cb',
    links: [
      'https://www.khanacademy.org/math',
      'https://www.geeksforgeeks.org/maths/',
    ],
  },
  {
    icon: '⚡',
    t: 'Physics',
    d: 'Mechanics, Electromagnetism, Modern Physics',
    c: 'cy',
    links: [
      'https://www.khanacademy.org/science/physics',
    ],
  },
  {
    icon: '💻',
    t: 'Programming C/C++',
    d: 'Syntax, Pointers, DSA, Problem Solving',
    c: 'cg',
    links: [
      'https://www.w3schools.com/cpp/',
      'https://www.geeksforgeeks.org/c-programming-language/',
      'https://www.tutorialspoint.com/cprogramming/index.htm',
    ],
  },
  {
    icon: '🐍',
    t: 'Python',
    d: 'NumPy, Pandas, OOP, Django, Flask',
    c: 'cg',
    links: [
      'https://www.w3schools.com/python/',
      'https://www.geeksforgeeks.org/python-programming-language/',
      'https://www.tutorialspoint.com/python/index.htm',
    ],
  },
  {
    icon: '🌐',
    t: 'Web Technologies',
    d: 'HTML5, CSS3, JavaScript, React, Node.js, Express',
    c: 'cb',
    links: [
      'https://www.w3schools.com/',
      'https://www.geeksforgeeks.org/web-development/',
      'https://www.tutorialspoint.com/web_development/index.htm',
    ],
  },
  {
    icon: '🗄️',
    t: 'Databases',
    d: 'SQL, NoSQL, MongoDB, Redis, Indexing',
    c: 'cp',
    links: [
      'https://www.w3schools.com/sql/',
      'https://www.geeksforgeeks.org/dbms/',
      'https://www.tutorialspoint.com/dbms/index.htm',
    ],
  },
  {
    icon: '🧮',
    t: 'Aptitude',
    d: 'Quantitative, Verbal Reasoning, Logical Thinking',
    c: 'cy',
    links: [
      'https://www.indiabix.com/',
    ],
  },
  {
    icon: '🔒',
    t: 'Cybersecurity',
    d: 'Network Security, Ethical Hacking, Cryptography',
    c: 'cr',
    links: [
      'https://www.geeksforgeeks.org/cyber-security-tutorial/',
      'https://www.tutorialspoint.com/cryptography/index.htm',
    ],
  },
  {
    icon: '🤖',
    t: 'AI / Machine Learning',
    d: 'Supervised, Unsupervised, Deep Learning, NLP',
    c: 'cp',
    links: [
      'https://www.geeksforgeeks.org/machine-learning/',
      'https://www.tutorialspoint.com/machine_learning/index.htm',
    ],
  },
  {
    icon: '☁️',
    t: 'Cloud Computing',
    d: 'AWS, Azure, GCP Fundamentals, Docker, K8s',
    c: 'cb',
    links: [
      'https://www.geeksforgeeks.org/cloud-computing/',
      'https://www.tutorialspoint.com/cloud_computing/index.htm',
    ],
  },
  {
    icon: '📡',
    t: 'Computer Networks',
    d: 'OSI Model, TCP/IP, Routing, HTTP/HTTPS',
    c: 'co',
    links: [
      'https://www.geeksforgeeks.org/computer-network-tutorials/',
      'https://www.tutorialspoint.com/data_communication_computer_network/index.htm',
    ],
  },
  {
    icon: '🖥️',
    t: 'Operating Systems',
    d: 'Process Management, Memory, File Systems',
    c: 'cy',
    links: [
      'https://www.geeksforgeeks.org/operating-systems/',
      'https://www.tutorialspoint.com/operating_system/index.htm',
    ],
  },
];

const Materials = () => {
  const showToast = useContext(ToastContext);

  // ✅ Open all links in new tabs
  const openResources = (mat) => {
    mat.links.forEach((link) => {
      window.open(link, '_blank');
    });
    showToast(`Opening ${mat.t} resources...`, 'info');
  };

  return (
    <>
      <div className="ph">
        <div className="ptit">Study Materials</div>
        <div className="psub">
          Categorized academic resources for GITAM University curriculum
        </div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}
        className="mat-grid"
      >
        {MATS.map((m, i) => (
          <div
            key={i}
            className="matc"
            onClick={() => openResources(m)}
          >
            <div style={{ fontSize: '24px', marginBottom: '9px' }}>
              {m.icon}
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>
              {m.t}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>
              {m.d}
            </div>

            <span className={`chip ${m.c}`}>
              View Resources →
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Materials;