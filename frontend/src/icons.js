import React from 'react';

const icon = (path, opts = {}) => ({ size = 18, color = 'currentColor', style = {} } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...style }}>
    {typeof path === 'string'
      ? <path d={path} stroke={color} strokeWidth={opts.w||1.8} strokeLinecap="round" strokeLinejoin="round" fill={opts.fill||'none'}/>
      : path(color)}
  </svg>
);

// Journal / pen
export const IconJournal = icon("M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z");

// Search / analyze
export const IconAnalyze = icon("M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z");

// Alert / crisis
export const IconAlert = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1.8"/>
  </svg>
);

// Brain / cognitive
export const IconBrain = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>
    <path d="M12 5C12 5 8 5 7 8C5.5 8 4 9.5 4 11.5C4 13 5 14.5 6.5 15C6 16 6 17 7 18C8 19 9.5 19 10.5 18.5C11 19.5 12 20 12 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5C12 5 16 5 17 8C18.5 8 20 9.5 20 11.5C20 13 19 14.5 17.5 15C18 16 18 17 17 18C16 19 14.5 19 13.5 18.5C13 19.5 12 20 12 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="5" x2="12" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

// Target / present moment
export const IconTarget = icon("M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22zM12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18zM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14z", {fill:'none'});

// Star / values
export const IconStar = icon("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");

// Chart / analytics
export const IconChart = icon("M18 20V10M12 20V4M6 20v-6");

// Clipboard / sessions
export const IconClipboard = icon("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2");

// Hospital / SOAP
export const IconHospital = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="8" x2="12" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="11" x2="15" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// Pill / treatment
export const IconPill = icon("M10.5 21.5l10-10a4.95 4.95 0 00-7-7l-10 10a4.95 4.95 0 007 7zM8.5 8.5l7 7");

// Chat / message
export const IconChat = icon("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z");

// User / patient
export const IconUser = icon("M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z");

// Check / success
export const IconCheck = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8"/>
    <path d="M8 12l3 3 5-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Warning small inline
export const IconWarning = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1.5"/>
  </svg>
);

// EEG / pulse
export const IconEEG = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>
    <polyline points="2,12 5,12 7,6 9,18 11,10 13,12 16,12" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

// Sparkle / feedback positive
export const IconSparkle = icon("M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83");

// Shield / security
export const IconShield = icon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
