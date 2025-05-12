import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { useSendLogoutMutation } from '../auth/authApiSlice';

// import 'frontend/src/styles/workspace.css';
import '../../styles/workspace.css'

// const WORKSPACE_REGEX = /^\/workspace(\/)?$/

const defaultStyles = {
  position: 'absolute',
  top: '50px',
  left: '50px',
};

export default function Workspace() {

  const navigate = useNavigate()
  // const { pathname } = useLocation()

  const [elements, setElements] = useState([]);
  const [isGrid, setIsGrid] = useState(true);
  const workspaceRef = useRef(null);

  //load saved elements
  useEffect(() => {
    loadWorkspace();
  }, []);

  // Logout code
  const [sendLogout, {
    isLoading,
    isSuccess,
    isError,
    error
  }] = useSendLogoutMutation()

  useEffect(() => {
    console.log("isLoading:", isLoading);
    console.log("isSuccess:", isSuccess);
    console.log("isError:", isError);
    if (isSuccess) navigate('/')
  }, [isSuccess, navigate])
  if (isLoading) return <p>Logging Out...</p>
  if (isError) return <p>Error: {error.data?.message}</p>

  // let dashClass = null
  // if (!WORKSPACE_REGEX.test(pathname)) {
  //   dashClass = "dash-header__container--small"
  // }

  const handleLogout = async () => {
    try {
      const result = await sendLogout().unwrap();
      console.log('Logout successful:', result);
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // end of logout code

  //background toggle
  const changeLayout = () => {
    setIsGrid(prev => !prev);
  };

  // settings
  const clearWorkspace = () => {
    if (window.confirm('Clear workspace?')) {
      setElements([]);
      localStorage.removeItem("workspaceData");
    }
  };

  const saveWorkspace = () => {
    localStorage.setItem("workspaceData", JSON.stringify(elements));
  };

  const loadWorkspace = () => {
    const saved = localStorage.getItem("workspaceData");
    if (saved) setElements(JSON.parse(saved));
  };

  // presets
  const addElement = (type) => {
    const id = uuidv4();
    setElements(prev => [...prev, {
      id,
      type,
      content: type === 'text' ? 'Click to edit text' : '',
      listItems: [],
      style: {
        ...defaultStyles,
        width: type === 'square' ? '50px' : undefined,
        height: type === 'square' ? '50px' : undefined,
        backgroundColor: type === 'text' ? 'transparent' : '#ccc'
      },
      color: '#ccc',
      textColor: '#000'
    }]);
  };

  const updateElement = (id, changes) => {
    setElements(prev =>
      prev.map(el => {
        if (el.id !== id) return el;
        const updated = typeof changes === 'function' ? changes(el) : { ...el, ...changes };
        return updated;
      })
    );
  };

  const deleteElement = (id) => {
    if (window.confirm('Delete this element?')) {
      setElements(prev => prev.filter(el => el.id !== id));
    }
  };

  // drag
  const makeDraggable = (id) => ({
    onMouseDown: e => {
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON'
      ) return;
      e.stopPropagation(); const el = document.getElementById(id);
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - rect.left, offsetY = e.clientY - rect.top;
      const onMove = ev => updateElement(id, { style: { ...elements.find(x => x.id === id).style, left: `${ev.clientX - offsetX}px`, top: `${ev.clientY - offsetY}px` } });
      const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
  });

  // resize
  const startResize = (el, id) => e => {
    e.stopPropagation(); const startX = e.clientX, startY = e.clientY;
    const rect = el.getBoundingClientRect(); const initW = rect.width, initH = rect.height;
    const onMove = ev => updateElement(id, { style: { ...elements.find(x => x.id === id).style, width: `${initW + ev.clientX - startX}px`, height: `${initH + ev.clientY - startY}px` } });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // render
  const renderElement = el => {
    const style = {
      position: 'absolute',
      ...el.style,
      cursor: 'grab',
      overflow: 'hidden'
    };
    return (
      <div key={el.id} id={el.id} style={style} className={`element ${el.type}`} {...makeDraggable(el.id)}>
        {el.type === 'text' && (
          <p contentEditable suppressContentEditableWarning
            onBlur={e => updateElement(el.id, { content: e.target.innerText })}
            className='text'
            style={{ margin: 0, color: el.textColor, backgroundColor: 'transparent' }}>

            {el.content}
          </p>
        )}

        {el.type === 'timer' && <Timer id={el.id} element={el} updateElement={updateElement} />}

        {el.type === 'list' && <TodoList id={el.id} listItems={el.listItems} updateElement={updateElement} />}

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
          <input
            type="color"
            className='color-picker'
            value={el.type === 'text' ? el.textColor : el.color}
            onClick={e => e.stopPropagation()}
            onChange={e => {
              if (el.type === 'text') updateElement(el.id, { textColor: e.target.value });
              else updateElement(el.id, { style: { ...el.style, backgroundColor: e.target.value }, color: e.target.value });
            }}
          />
          <button onClick={() => deleteElement(el.id)} className='delete-element'>x</button>
          <button className="resizer" onMouseDown={startResize(document.getElementById(el.id), el.id)}>+</button>
        </div>
      </div>
    );
  };

  // timer
  function Timer({ id, element, updateElement }) {
    const intervalRef = useRef(null);

    const timeLeft = element.timeLeft ?? 1500;
    const isRunning = element.isRunning ?? false;
    const isPaused = element.isPaused ?? false;
    const sessionType = element.sessionType ?? null;

    useEffect(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (isRunning && !isPaused) {
        intervalRef.current = setInterval(() => {
          updateElement(id, prev => {
            const currentTime = prev.timeLeft ?? 1500;
            if (currentTime <= 1) {
              clearInterval(intervalRef.current);
              const message = prev.sessionType === 'study'
                ? 'Study session done! Time for a break.'
                : 'Break is over! Time to get back to work.';
              alert(message);
              return {
                ...prev,
                timeLeft: 0,
                isRunning: false,
                isPaused: false
              };
            }
            return {
              ...prev,
              timeLeft: currentTime - 1
            };
          });
        }, 1000);
      }

      return () => clearInterval(intervalRef.current);
    }, [isRunning, isPaused, id, updateElement]);

    const start = (duration, type) => {
      updateElement(id, prev => ({
        ...prev,
        timeLeft: duration,
        sessionType: type,
        isRunning: true,
        isPaused: false
      }));
    };

    const togglePause = () => {
      updateElement(id, prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }));
    };

    const reset = () => {
      clearInterval(intervalRef.current);
      updateElement(id, prev => ({
        ...prev,
        timeLeft: 1500,
        isRunning: false,
        isPaused: false,
        sessionType: null
      }));
    };

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
      <div className="timer-container">
        <p className="timer-title">Pomodoro Timer</p>
        <h1 className="timer-clk">{`${minutes}:${seconds}`}</h1>
        <div className="timer-btns">
          {!isRunning ? (
            <div className="top-row">
              <button onClick={() => start(1500, 'study')}>Study</button>
              <button onClick={() => start(300, 'break')}>Break</button>
            </div>
          ) : (
            <div className="bottom-row">
              <button onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
              <button onClick={reset}>Reset</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  //list with date
  function TodoList({ id, listItems = [], updateElement }) {
    const [inputText, setInputText] = useState("");
    const [inputDate, setInputDate] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
      setInputDate(new Date().toISOString().split('T')[0]);
    }, []);


    const addItem = () => {
      const trimmedText = inputText.trim();
      if (!trimmedText || !inputDate) return;

      const newItem = {
        id: uuidv4(),
        text: trimmedText,
        date: inputDate,
        completed: false,
      };

      updateElement(id, el => ({
        ...el,
        listItems: [...(el.listItems || []), newItem],
      }));

      setInputText("");
      setInputDate("");
      if (inputRef.current) inputRef.current.focus();
    };

    const toggleCheck = itemId => {
      updateElement(id, el => ({
        ...el,
        listItems: el.listItems.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      }));
    };

    const deleteItem = itemId => {
      updateElement(id, el => ({
        ...el,
        listItems: el.listItems.filter(item => item.id !== itemId),
      }));
    };

    return (
      <div>
        <div className="todo-container">
          <div className="todo-inputs">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Add task here"
            />
            <input
              type="date"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
            />
          </div>
          <button onClick={addItem} className="todo-add-button">+</button>
        </div>

        <div className="todo-scroll">
          <ul className="todo-list">
            {[...listItems]
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(item => (
              <li key={item.id} className="todo-item" style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                <div className="todo-left">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleCheck(item.id)}
                  />
                  {item.text}
                </div>
                <div className="todo-right">
                  <em>{new Date(item.date).toLocaleDateString('en-US')}</em>
                  <button onClick={() => deleteItem(item.id)} className="todo-delete">x</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inclusive+Sans&display=swap"></link>

      <nav className="navbar">
        <div className="navbar__container">
          <li id="navbar__logo">
            <Link to="/">Milky Way</Link>
          </li>

          <div className="navbar__toggle" id="mobile-menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>

          <ul className="navbar__menu">
            <li><button className="button" onClick={changeLayout}>[]</button></li>
            <li><button className="button" onClick={() => addElement('text')}>text</button></li>
            <li><button className="button" onClick={() => addElement('square')}>square</button></li>
            <li><button className="button" onClick={() => addElement('timer')}>timer</button></li>
            <li><button className="button" onClick={() => addElement('list')}>list</button></li>

            <li className="navbar__dropdown-parent">
              <button className="button">⚙️</button>
              <ul className="navbar__dropdown">
                <li><button className="button" onClick={clearWorkspace}>clear</button></li>
                <li><button className="button" onClick={saveWorkspace}>save</button></li>
                <li><button className="button" onClick={handleLogout}>logout</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <div ref={workspaceRef} className="workspace" style={{
        position: 'relative',
        width: '100%',
        height: '85vh',
        overflow: 'hidden',
        backgroundImage:
          isGrid
            ? 'radial-gradient(circle,#aaa 1px,transparent 1px)'
            : 'linear-gradient(to right,#ccc 1px,transparent),(to bottom,#ccc 1px,transparent)',
        backgroundSize: '20px 20px'
      }}>
        {elements.map(renderElement)}
      </div>
    </section>
  );
};