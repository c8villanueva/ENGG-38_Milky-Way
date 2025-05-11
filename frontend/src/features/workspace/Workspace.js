import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { useSendLogoutMutation } from '../auth/authApiSlice';

// import 'frontend/src/styles/workspace.css';

// const WORKSPACE_REGEX = /^\/workspace(\/)?$/

const defaultStyles = {
  position: 'absolute',
  top: '50px',
  left: '50px',
};

const navbarStyles = {
  navbar: {
    background: '#81689d',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem',
    position: 'sticky',
    top: 0,
    zIndex: 999,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '80px',
    width: '100%',
    margin: '0 auto',
    padding: '0 50px',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    backgroundColor: '#ffd0ec',
    backgroundSize: '100%',
    WebkitBackgroundClip: 'text',
    MozBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    MozTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '2rem',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    listStyle: 'none',
    textAlign: 'center',
    gap: '10px',
    position: 'relative',
  },
  menuItem: {
    position: 'relative',
    // height: '80px',
  },
  link: {
    color: '#ffd0ec',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    padding: '0 1rem',
    height: '100%',
    transition: 'color 0.3s ease',
  },
  // dropdownContainer: {
  //     position: 'relative',
  //   },
  //   dropdownButton: {
  //     display: 'flex',
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     padding: '10px',
  //     border: 'none',
  //     background: '#ffd0ec',
  //     cursor: 'pointer',
  //   },
  //   dropdownMenu: {
  //         display: 'block',
  //         position: 'absolute',
  //         top: '100%',
  //         right: 0,
  //         backgroundColor: '#ffd0ec',
  //         padding: '10px 0',
  //         zIndex: 1000,
  //       }
  //   dropdownLink: {
  //     padding: '8px 16px',
  //     cursor: 'pointer',
  //     textDecoration: 'none',
  //     color: '#1f2544',
  //   },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '10px 10px',
    margin: '0 0.15rem',
    width: '100%',
    border: 'none',
    outline: 'none',
    borderRadius: '20px',
    background: '#ffd0ec',
    color: '#1f2544',
    cursor: 'pointer',
  },
}

const elmenuStyles = {
  deleteEl: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent',
    color: 'black',
    border: 'none',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    zIndex: 2,
  },
  pickcolor: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    right: '20px',
    zIndex: 2,
    border: 'none',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  resizer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: '20px',
    width: '20px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
  },
}

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

  //settings
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

  //elements
  const addElement = (type) => {
    const id = uuidv4();
    setElements(prev => [...prev, {
      id,
      type,
      content: type === 'text' ? 'Click to edit text' : '',
      listItems: [],
      style: {
        ...defaultStyles,
        width: type === 'circle' || type === 'square' ? '50px' : undefined,
        height: type === 'circle' || type === 'square' ? '50px' : undefined,
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

  //drag
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

  // Resize
  const startResize = (el, id) => e => {
    e.stopPropagation(); const startX = e.clientX, startY = e.clientY;
    const rect = el.getBoundingClientRect(); const initW = rect.width, initH = rect.height;
    const onMove = ev => updateElement(id, { style: { ...elements.find(x => x.id === id).style, width: `${initW + ev.clientX - startX}px`, height: `${initH + ev.clientY - startY}px` } });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Render
  const renderElement = el => {
    const style = {
      position: 'absolute',
      ...el.style,
      cursor: 'grab',
      borderRadius: el.type === 'circle' ? '50%' : undefined,
      overflow: 'hidden'
    };
    return (
      <div key={el.id} id={el.id} style={style} className={`element ${el.type}`} {...makeDraggable(el.id)}>
        {el.type === 'text' && (
          <p contentEditable suppressContentEditableWarning
            onBlur={e => updateElement(el.id, { content: e.target.innerText })}
            style={{ margin: 0, color: el.textColor, backgroundColor: 'transparent' }}>
            {el.content}
          </p>
        )}
        {el.type === 'timer' && <Timer id={el.id} element={el} updateElement={updateElement} />}
        {el.type === 'list' && <TodoList id={el.id} content={el.content} updateElement={updateElement} />}

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
          <input type="color"
            value={el.type === 'text' ? el.textColor : el.color}
            style={elmenuStyles.pickcolor}
            onClick={e => e.stopPropagation()}
            onChange={e => {
              if (el.type === 'text') updateElement(el.id, { textColor: e.target.value });
              else updateElement(el.id, { style: { ...el.style, backgroundColor: e.target.value }, color: e.target.value });
            }}
          />
          <button onClick={() => deleteElement(el.id)} style={elmenuStyles.deleteEl}>x</button>
          <button className="resize-handle" onMouseDown={startResize(document.getElementById(el.id), el.id)} style={elmenuStyles.resizer}>+</button>
        </div>
      </div>
    );
  };


  //timer
  function Timer({ id, element, updateElement }) {
    const intervalRef = useRef(null);
    const { timeLeft = 1500, isRunning = false, isPaused = false } = element;

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
                isRunning: false
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
        isPaused: false
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


  //list
  function TodoList({ id, content, updateElement }) {
  const [items, setItems] = useState(() => {
    try {
      return content ? JSON.parse(content) : [];
    } catch {
      return [];
    }
  });
  const [inputText, setInputText] = useState("");
  const [inputDate, setInputDate] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (updateElement) {
      updateElement(id, el => ({
        ...el,
        content: JSON.stringify(items),
      }));
    }
  }, [items, id, updateElement]);

  const addItem = () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || items.some(item => item.text === trimmedText)) return;
    setItems(prev => [...prev, { text: trimmedText, date: inputDate, checked: false }]);
    setInputText("");
    setInputDate("");
    inputRef.current?.focus();
  };

  const toggleCheck = index => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = index => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="list-container p-2 space-y-2"
         onMouseDown={e => e.stopPropagation()}
         onTouchStart={e => e.stopPropagation()}>
      <div className="flex gap-2">
        <input
          className="todo-input border rounded p-1 w-full"
          type="text"
          placeholder="Add new item..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === "Enter") addItem();
          }}
          onMouseDown={e => e.stopPropagation()}
          ref={inputRef}
        />
        <input
          className="date-input border rounded p-1"
          type="date"
          value={inputDate}
          onChange={e => setInputDate(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
        />
        <button
          onClick={e => { e.stopPropagation(); addItem(); }}
          className="addBtn px-3 text-xl rounded bg-blue-500 text-white"
        >
          +
        </button>
      </div>
      <ul className="todo-list space-y-1">
        {items.map((item, index) => (
          <li
            key={index}
            className={`flex justify-between items-center px-2 py-1 border rounded cursor-pointer ${item.checked ? "line-through text-gray-500" : ""}`}
            onClick={() => toggleCheck(index)}
          >
            <span className="item-text">
              {item.text}{item.date && ` - Due: ${item.date}`}
            </span>
            <span
              className="delBtn ml-4 text-red-500 hover:text-red-700 text-xl"
              onClick={e => {
                e.stopPropagation();
                deleteItem(index);
              }}
            >
              &times;
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

  return (
    <section>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inclusive+Sans&display=swap"></link>

      <nav className="navbar" style={navbarStyles.navbar}>
        <div className="navbar__container" style={navbarStyles.container}>
          {/* <a href="/" id="navbar__logo">
            <i className="fa-solid fa-rocket">&nbsp;</i> Milky Way
          </a> */}
          <li id="navbar__logo" style={navbarStyles.logo}>
            <Link to="/">Milky Way</Link>
          </li>
          <ul className="navbar__menu" style={navbarStyles.menu}>

            <li><button onClick={changeLayout} style={navbarStyles.button}>[]</button></li>
            
            <li><button onClick={() => addElement('text')} style={navbarStyles.button}>text</button></li>
            <li><button onClick={() => addElement('square')} style={navbarStyles.button}>square</button></li>
            <li><button onClick={() => addElement('timer')} style={navbarStyles.button}>timer</button></li>
            <li><button onClick={() => addElement('list')} style={navbarStyles.button}>list</button></li>
            {/* <li className="navbar__dropdown"><button style={navbarStyles.button}>⚙️</button>
              <div className="navbar__dropdown-content"> */}
                <li><button onClick={clearWorkspace} style={navbarStyles.button}>clear</button></li>
                <li><button onClick={saveWorkspace} style={navbarStyles.button}>save</button></li>
                {/* <button onClick={loadWorkspace} style={navbarStyles.button}>load</button> */}
                {/* <button onClick={sendLogout}>logout</button> */}
                <li><button onClick={handleLogout} style={navbarStyles.button}>logout</button></li>
                {/* <button onClick={async () => await sendLogout()}>logout</button> */}
              {/* </div>
            </li> */}
          </ul>
        </div>
      </nav>
      <div ref={workspaceRef} className="workspace" style={{
        position: 'relative',
        width: '100%',
        height: '80vh',
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