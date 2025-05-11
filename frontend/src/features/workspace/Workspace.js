import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { useSendLogoutMutation } from '../auth/authApiSlice';

// const DASH_REGEX = /^\/dash(\/)?$/
const WORKSPACE_REGEX = /^\/workspace(\/)?$/
// const NOTES_REGEX = /^\/dash\/notes(\/)?$/
// const USERS_REGEX = /^\/dash\/users(\/)?$/

const defaultStyles = {
  position: 'absolute',
  top: '50px',
  left: '50px',
};

const Workspace = () => {

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [elements, setElements] = useState([]);
  const [isGrid, setIsGrid] = useState(true);
  const workspaceRef = useRef(null);

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
    if (isSuccess) navigate('/')
  }, [isSuccess, navigate])

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

  const changeLayout = () => {
    setIsGrid(prev => !prev);
  };

  const addElement = (type) => {
    const id = uuidv4();
    const newElement = {
      id,
      type,
      content: type === 'text' ? 'Click to edit text' : '',
      style: {
        ...defaultStyles,
        backgroundColor: '#ccc',
        width: type === 'circle' || type === 'square' ? '50px' : undefined,
        height: type === 'circle' || type === 'square' ? '50px' : undefined,
      },
    };
    setElements(prev => [...prev, newElement]);
  };

  const updateElement = (id, changes) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...changes } : el))
    );
  };

  const deleteElement = (id) => {
    if (window.confirm('Delete this element?')) {
      setElements(prev => prev.filter(el => el.id !== id));
    }
  };

  const makeDraggable = (e, id) => {
    const element = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = element.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
  
    const getStyleObject = (element) =>
      Object.fromEntries(
        Array.from(element.style).map((key) => [key, element.style.getPropertyValue(key)])
      );
  
    const onMouseMove = (e) => {
      const currentStyle = getStyleObject(element);
      updateElement(id, {
        style: {
          ...currentStyle,
          left: `${e.clientX - offsetX}px`,
          top: `${e.clientY - offsetY}px`,
        },
      });
    };
  
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const clearWorkspace = () => {
    if (window.confirm("Are you sure you want to clear the workspace?")) {
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

  const renderElement = (el) => {
    const style = {
      ...el.style,
      position: 'absolute',
      cursor: 'grab',
      borderRadius: el.type === 'circle' ? '50%' : undefined,
    };

    return (
      <div
        key={el.id}
        style={style}
        className={`element ${el.type}`}
        onMouseDown={(e) => makeDraggable(e, el.id)}
      >
        {el.type === 'text' && (
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateElement(el.id, { content: e.target.innerText })}
            style={{ margin: 0, color: 'black', backgroundColor: 'transparent' }}
          >
            {el.content}
          </p>
        )}
        {el.type === 'list' && (
          <ul>
            <li>Example item</li>
          </ul>
        )}
        {/* More component types like timer can be inserted here */}
        <input
          type="color"
          className="color-picker"
          onChange={(e) =>
            updateElement(el.id, {
              style: { ...el.style, backgroundColor: e.target.value },
            })
          }
        />
        <button className="delete_element" onClick={() => deleteElement(el.id)}>x</button>
      </div>
    );
  };

  return (
    <section>
      <nav className="navbar">
        <div className="navbar__container">
          <a href="/" id="navbar__logo">
            <i className="fa-solid fa-rocket">&nbsp;</i> Milky Way
          </a>
          <ul className="navbar__menu">
            <li><button onClick={changeLayout}>[]</button></li>
            <li><button onClick={() => addElement('text')}>text</button></li>
            <li><button onClick={() => addElement('circle')}>circle</button></li>
            <li><button onClick={() => addElement('square')}>square</button></li>
            <li><button onClick={clearWorkspace}>clear</button></li>
            <li><button onClick={saveWorkspace}>save</button></li>
            <li><button onClick={loadWorkspace}>load</button></li>
            <li><button onClick={sendLogout}>log out</button></li>

          </ul>
        </div>
      </nav>
      <div
        ref={workspaceRef}
        className="workspace"
        style={{
          position: 'relative',
          height: '80vh',
          width: '100%',
          overflow: 'hidden',
          backgroundImage: isGrid
            ? 'radial-gradient(circle, #aaa 1px, rgba(0, 0, 0, 0) 1px)'
            : 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {elements.map(renderElement)}
      </div>
    </section>
  );
};

export default Workspace;
