import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCasino, MdGridOn, MdEmail, MdArrowForwardIos } from 'react-icons/md';
import { IoGameController } from 'react-icons/io5';

interface Project {
  id: string;
  title: string;
  description: string;
  to: string;
  icon: 'casino' | 'grid-on' | 'email';
}

export default function Index() {
  const navigate = useNavigate();

  const [projects] = useState<Project[]>([
    { id: '1', title: 'Guess Game', description: 'A number guessing game with hints', to: '/Game1', icon: 'casino' },
    { id: '2', title: 'X_O (Normal)', description: 'Classic Tic-Tac-Toe game', to: '/Game2', icon: 'grid-on' },
    { id: '3', title: 'X_O (3-Marker)', description: 'Tic-Tac-Toe with only 3 markers per player', to: '/Game3', icon: 'grid-on' },
    { id: '4', title: 'TEMP-MAIL', description: 'Create temporary email addresses', to: '/TempMail', icon: 'email' },
  ]);

  const [animatedStats, setAnimatedStats] = useState({ projects: 0, completed: 0, rating: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        projects: projects.length,
        completed: projects.length,
        rating: 4.8,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [projects.length]);

  const renderProjectIcon = (icon: Project['icon']) => {
    switch (icon) {
      case 'casino':
        return <MdCasino size={36} color="#78F0BC" />;
      case 'grid-on':
        return <MdGridOn size={36} color="#78F0BC" />;
      case 'email':
        return <MdEmail size={36} color="#78F0BC" />;
    }
  };

  const ProjectItem = ({ item }: { item: Project }) => (
    <button
      type="button"
      style={styles.projectCard}
      onClick={() => navigate(item.to)}
    >
      <div style={styles.projectIconContainer}>
        {renderProjectIcon(item.icon)}
      </div>
      <div style={styles.projectContent}>
        <div style={styles.projectTitle}>{item.title}</div>
        <div style={styles.projectDescription}>{item.description}</div>
      </div>
      <div style={styles.arrowContainer}>
        <MdArrowForwardIos size={18} color="#78F0BC" />
      </div>
    </button>
  );

  return (
    <div className="app-background">
      <div className="app-viewport" style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerText}>Welcome to</div>
          <div style={styles.nameText}>ANAS GAMAL</div>
          <div style={styles.subHeaderText}>Gaming Portfolio</div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{animatedStats.projects}</div>
            <div style={styles.statLabel}>Projects</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{animatedStats.completed}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{animatedStats.rating}</div>
            <div style={styles.statLabel}>Rating</div>
          </div>
        </div>

        <div style={styles.projectsSection}>
          <div style={styles.sectionTitle}>
            <IoGameController size={20} color="#78F0BC" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            <span>My Projects</span>
          </div>
          <div style={styles.projectsList}>
            {projects.map((item) => (
              <ProjectItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerText}>© 2023 Anas Gamal</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    paddingTop: 40,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  headerText: {
    fontSize: 16,
    color: '#78F0BC',
    fontWeight: 500,
  },
  nameText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 5,
    marginBottom: 5,
    textShadow: '1px 1px 10px rgba(120, 240, 188, 0.5)',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#78F0BC',
    fontWeight: 500,
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid rgba(120, 240, 188, 0.3)',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#78F0BC',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  projectsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    paddingLeft: 5,
    display: 'flex',
    alignItems: 'center',
  },
  projectsList: {
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  projectCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    border: '1px solid rgba(120, 240, 188, 0.2)',
    textAlign: 'left',
  },
  projectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    flexShrink: 0,
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 13,
    color: '#ccc',
  },
  arrowContainer: {
    padding: 5,
    display: 'flex',
    alignItems: 'center',
  },
  footer: {
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
};
