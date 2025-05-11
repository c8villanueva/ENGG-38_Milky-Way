import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { useSendLogoutMutation } from '../auth/authApiSlice';

// import './workspace.css';

// const DASH_REGEX = /^\/dash(\/)?$/
const WORKSPACE_REGEX = /^\/workspace(\/)?$/
// const NOTES_REGEX = /^\/dash\/notes(\/)?$/
// const USERS_REGEX = /^\/dash\/users(\/)?$/

const defaultStyles = {
  position: 'absolute',
  top: '50px',
  left: '50px',
};

export default function Workspace(){

  const navigate = useNavigate()
  const { pathname } = useLocation()

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

  useEffect(() => { if (isSuccess) navigate('/') }, [isSuccess, navigate])
                    if (isLoading) return <p>Logging Out...</p>
                    if (isError) return <p>Error: {error.data?.message}</p>

  let dashClass = null
  if (!WORKSPACE_REGEX.test(pathname)) {
    dashClass = "dash-header__container--small"
  }

  // end of logout code

  // const [elements, setElements] = useState([]);
  // const [isGrid, setIsGrid] = useState(true);
  // const workspaceRef = useRef(null);

  // useEffect(() => {
  //   loadWorkspace();
  // }, []);

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
        width: type==='circle'||type==='square'?'50px':undefined, 
        height: type==='circle'||type==='square'?'50px':undefined, 
        backgroundColor: type=== 'text'?'transparent':'#ccc' },
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
  const makeDraggable = (id) => ({ onMouseDown: e => {
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON'
      ) return;
    e.stopPropagation(); const el = document.getElementById(id);
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - rect.left, offsetY = e.clientY - rect.top;
      const onMove = ev => updateElement(id, { style: { ...elements.find(x=>x.id===id).style, left:`${ev.clientX-offsetX}px`, top:`${ev.clientY-offsetY}px` } });
      const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
  }});

  // Resize
  const startResize = (el, id) => e => {
    e.stopPropagation(); const startX = e.clientX, startY = e.clientY;
    const rect = el.getBoundingClientRect(); const initW=rect.width, initH=rect.height;
    const onMove = ev => updateElement(id, { style: { ...elements.find(x=>x.id===id).style, width:`${initW+ev.clientX-startX}px`, height:`${initH+ev.clientY-startY}px` } });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Render
  const renderElement = el => {
    const style = { 
      position:'absolute', 
      ...el.style, 
      cursor:'grab', 
      borderRadius: el.type==='circle'?'50%':undefined, 
      overflow:'hidden' };
    return (
      <div key={el.id} id={el.id} style={style} className={`element ${el.type}`} {...makeDraggable(el.id)}>

        {el.type==='text' && (
          <p contentEditable suppressContentEditableWarning
             onBlur={e=>updateElement(el.id,{ content:e.target.innerText })}
             style={{ margin:0, color:el.textColor, backgroundColor:'transparent' }}>
            {el.content}
          </p>
        )}
        {el.type==='timer' && <Timer id={el.id} element={el} updateElement={updateElement} />}

        {el.type==='list' && <TodoList id={el.id} content={el.content} updateElement={updateElement} />}

        <div style={{ display:'flex', alignItems:'center', marginTop:5 }}>
          <input type="color"
            value={el.type==='text'?el.textColor:el.color}
            style={{ width:20,height:20,padding:0,border:'none',marginRight:5 }}
            onClick={e=>e.stopPropagation()}
            onChange={e=>{
              if(el.type==='text') updateElement(el.id,{ textColor:e.target.value });
              else updateElement(el.id,{ style:{ ...el.style, backgroundColor:e.target.value }, color:e.target.value });
            }}
          />
          <button onClick={()=>deleteElement(el.id)}>x</button>
          <div className="resize-handle" onMouseDown={startResize(document.getElementById(el.id),el.id)}>+</div>
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
  }, [isRunning, isPaused]);

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
  const [input, setInput] = useState("");
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
    const trimmed = input.trim();
    if (!trimmed || items.some(item => item.text === trimmed)) return; 
    setItems(prev => [...prev, { text: trimmed, checked: false }]);
    setInput("");
    inputRef.current.focus(); 
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
    <div className="list-container p-2 space-y-2">
      <div className="flex gap-2">
        <input
          className="todo-input border rounded p-1 w-full"
          type="text"
          placeholder="Add new item..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          onMouseDown={e => e.stopPropagation()}
          ref={inputRef}
        />
        <button onClick={addItem} className="addBtn px-3 text-xl rounded bg-blue-500 text-white">
          +
        </button>
      </div>
      <ul className="todo-list space-y-1">
        {items.map((item, index) => (
          <li
            key={index}
            className={`flex justify-between items-center px-2 py-1 border rounded cursor-pointer ${
              item.checked ? "line-through text-gray-500" : ""
            }`}
            onClick={() => toggleCheck(index)}
          >
            <span className="item-text">{item.text}</span>
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
      <nav className="navbar">
        <div className="navbar__container">
          <a href="/" id="navbar__logo">
            <i className="fa-solid fa-rocket">&nbsp;</i> Milky Way
          </a>
          <ul className="navbar__menu">
            <li><button onClick={changeLayout}>[]</button></li>
            <li><button onClick={()=>addElement('text')}>text</button></li>
            <li className="navbar__dropdown"><button>shapes</button>
              <div className="navbar__dropdown-content">
                <button onClick={()=>addElement('circle')}>circle</button>
                <button onClick={()=>addElement('square')}>square</button>
              </div>
            </li>
            <li className="navbar__dropdown"><button>others</button>
              <div className="navbar__dropdown-content">
                <button onClick={()=>addElement('timer')}>timer</button>
                <button onClick={()=>addElement('list')}>list</button>
              </div>
            </li>
            <li className="navbar__dropdown"><button>⚙️</button>
              <div className="navbar__dropdown-content">
                <button onClick={clearWorkspace}>clear</button>
                <button onClick={saveWorkspace}>save</button>
                <button onClick={loadWorkspace}>load</button>
                <button onClick={()=>sendLogout()}>logout</button>
              </div>
            </li>
          </ul>
        </div>
      </nav>
      <div ref={workspaceRef} className="workspace" style={{ 
        position:'relative', 
        width:'100%', 
        height:'80vh', 
        overflow:'hidden', 
        backgroundImage:
          isGrid?'radial-gradient(circle,#aaa 1px,transparent 1px)':
          'linear-gradient(to right,#ccc 1px,transparent),(to bottom,#ccc 1px,transparent)', 
          backgroundSize:'20px 20px' }}>
        {elements.map(renderElement)}
      </div>
    </section>
  );
};