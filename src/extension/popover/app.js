/* eslint-disable react/no-deprecated */
import React from 'react';
import ReactDOM from 'react-dom';
import File from './File/index.jsx';

const Node = document.createElement('div');
Node.style.all = 'initial';
Node.style.zIndex = 2147483647;
Node.style.transform = 'translate3d(0,0,0)';
document.body.appendChild(Node);

ReactDOM.render(<File />, Node);
