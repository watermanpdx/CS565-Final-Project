// App.jsx

/*
This file is the main React page definition. It unites all React components
required in this project for presentation to the user and management of
different "pages"
*/

// dependencies ---------------------------------------------------------------
import './App.css';
import Home from './components/Home.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import NavigationBar from './components/NavigationBar.jsx';

import { useState, useEffect } from 'react';

// App definition (default export) --------------------------------------------
export default function App() {
  const [view, setView] = useState(sessionStorage.getItem('view') || 'home');
  const [username, setUsername] = useState(
    sessionStorage.getItem('username') || null,
  );
  const [gameFocus, setGameFocus] = useState(true);

  useEffect(() => {
    sessionStorage.setItem('view', view);
  }, [view]);

  useEffect(() => {
    if (username) {
      sessionStorage.setItem('username', username);
    } else {
      sessionStorage.removeItem('username', username);
    }
  }, [username]);

  return (
    <>
      <NavigationBar
        username={username}
        setUsername={setUsername}
        setView={setView}
        setGameFocus={setGameFocus}
      />
      <div>
        {view === 'home' && <Home username={username} gameFocus={gameFocus} />}
        {view === 'leaderboard' && <Leaderboard />}
      </div>
    </>
  );
}
