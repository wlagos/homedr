import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './_helpers';
import { App } from './App';

import './style/style.css';
import 'font-awesome/css/font-awesome.css';

const target = document.querySelector('#root');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  target
);
