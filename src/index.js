'use strict';

import './styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
// import App from './javascripts/pages/App';
import App from './javascripts/pages/overlay-navigation';

window.addEventListener('DOMContentLoaded', () => {
  let node = document.getElementById('main');
  ReactDOM.render(<App />, node);
});
