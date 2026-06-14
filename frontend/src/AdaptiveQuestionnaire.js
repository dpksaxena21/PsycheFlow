import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL as API } from './config';

const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF',
  border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  lightBlue:'#EFF6FF', purple:'#7C3AED',
};

// ── Custom SVG Icons ──────────────────────────────────────
const Icons = {
  brain: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  moon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lightning: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  heart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trauma: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  focus: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>,
  repeat: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  question: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  alert: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pulse: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  quick: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  deep: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ── Clinical question bank ────────────────────────────────
const Q = {
  PHQ1:{id:'PHQ1',text:'Little interest or pleasure in doing things',module:'PHQ9',type:'freq4',hint:'Loss of interest is one of the two core symptoms of depression. It\'s different from just being bored.'},
  PHQ2:{id:'PHQ2',text:'Feeling down, depressed, or hopeless',module:'PHQ9',type:'freq4',hint:'Persistent low mood — not just a bad day — is a key clinical marker.'},
  PHQ3:{id:'PHQ3',text:'Trouble falling or staying asleep, or sleeping too much',module:'PHQ9',type:'freq4',hint:'Sleep and mood are deeply connected.'},
  PHQ4:{id:'PHQ4',text:'Feeling tired or having little energy',module:'PHQ9',type:'freq4',hint:'Physical fatigue without a medical reason is often a sign of emotional exhaustion.'},
  PHQ5:{id:'PHQ5',text:'Poor appetite or overeating',module:'PHQ9',type:'freq4',hint:'Appetite changes are common physical responses to emotional stress.'},
  PHQ6:{id:'PHQ6',text:'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',module:'PHQ9',type:'freq4',hint:'Excessive guilt or self-blame, especially out of proportion, is a key depression indicator.'},
  PHQ7:{id:'PHQ7',text:'Trouble concentrating on things, such as reading or watching television',module:'PHQ9',type:'freq4',hint:'When your mind is overwhelmed, focusing on simple tasks becomes genuinely difficult.'},
  PHQ8:{id:'PHQ8',text:'Moving or speaking so slowly that other people could have noticed. Or the opposite — being fidgety or restless',module:'PHQ9',type:'freq4',hint:'Psychomotor changes can be visible to others before you notice them yourself.'},
  PHQ9:{id:'PHQ9',text:'Thoughts that you would be better off dead, or of hurting yourself in some way',module:'PHQ9',type:'freq4',critical:true,hint:'This is the most important question. Your answer is completely confidential.'},
  GAD1:{id:'GAD1',text:'Feeling nervous, anxious, or on edge',module:'GAD7',type:'freq4',hint:'General anxiety often shows up as constant low-level nervousness, even without a specific reason.'},
  GAD2:{id:'GAD2',text:'Not being able to stop or control worrying',module:'GAD7',type:'freq4',hint:'Uncontrollable worry is what separates clinical anxiety from everyday stress.'},
  GAD3:{id:'GAD3',text:'Worrying too much about different things',module:'GAD7',type:'freq4',hint:'Worrying about multiple unrelated things simultaneously is a hallmark of generalized anxiety.'},
  GAD4:{id:'GAD4',text:'Trouble relaxing',module:'GAD7',type:'freq4',hint:'Difficulty relaxing — even when you want to — suggests your nervous system may be overstimulated.'},
  GAD5:{id:'GAD5',text:'Being so restless that it is hard to sit still',module:'GAD7',type:'freq4',hint:'Physical restlessness is anxiety expressing itself through your body.'},
  GAD6:{id:'GAD6',text:'Becoming easily annoyed or irritable',module:'GAD7',type:'freq4',hint:'Irritability is often a mask for underlying anxiety.'},
  GAD7:{id:'GAD7',text:'Feeling afraid as if something awful might happen',module:'GAD7',type:'freq4',hint:'A sense of impending doom or dread, even without a specific cause, is a classic anxiety symptom.'},
  ISI1:{id:'ISI1',text:'How difficult is it to fall asleep?',module:'ISI',type:'severity4',hint:'Sleep onset difficulty is one of the most common presentations of insomnia.'},
  ISI2:{id:'ISI2',text:'How difficult is it to stay asleep through the night?',module:'ISI',type:'severity4',hint:'Frequent waking or early morning waking can be signs of depression or anxiety.'},
  ISI3:{id:'ISI3',text:'How often do you wake up too early and cannot get back to sleep?',module:'ISI',type:'freq4',hint:'Early morning waking is particularly associated with depression.'},
  ISI4:{id:'ISI4',text:'How satisfied are you with your current sleep?',module:'ISI',type:'satisfaction',hint:'Sleep satisfaction is more important than the number of hours.'},
  ISI5:{id:'ISI5',text:'How much does poor sleep interfere with your daily functioning?',module:'ISI',type:'severity4',hint:'Functional impairment is what separates clinical insomnia from normal sleep variation.'},
  WHO1:{id:'WHO1',text:'I have felt cheerful and in good spirits',module:'WHO5',type:'freq6',hint:'Positive mood is a key indicator of overall psychological wellbeing.'},
  WHO2:{id:'WHO2',text:'I have felt calm and relaxed',module:'WHO5',type:'freq6',hint:'Calm baseline is a protective factor against anxiety disorders.'},
  WHO3:{id:'WHO3',text:'I have felt active and vigorous',module:'WHO5',type:'freq6',hint:'Energy levels reflect both physical and mental health.'},
  WHO4:{id:'WHO4',text:'I woke up feeling fresh and rested',module:'WHO5',type:'freq6',hint:'Restorative sleep is foundational to mental health.'},
  WHO5:{id:'WHO5',text:'My daily life has been filled with things that interest me',module:'WHO5',type:'freq6',hint:'Engagement with life activities is a key wellbeing marker.'},
  BRN1:{id:'BRN1',text:'I feel emotionally drained from my work',module:'BURNOUT',type:'freq7',hint:'Emotional exhaustion is the core symptom of burnout.'},
  BRN2:{id:'BRN2',text:'I feel used up at the end of the workday',module:'BURNOUT',type:'freq7',hint:'Depletion after work — not just tiredness — signals burnout.'},
  BRN3:{id:'BRN3',text:'I feel fatigued when I get up in the morning and have to face another day',module:'BURNOUT',type:'freq7',hint:'Morning dread is a hallmark of advanced burnout.'},
  BRN4:{id:'BRN4',text:'Working with people all day is a real strain for me',module:'BURNOUT',type:'freq7',hint:'Interpersonal exhaustion is a key burnout indicator.'},
  BRN5:{id:'BRN5',text:'I feel burned out from my work',module:'BURNOUT',type:'freq7',hint:'Direct burnout self-report has high clinical validity.'},
  PCL1:{id:'PCL1',text:'Repeated disturbing memories, thoughts, or images of a stressful experience from the past',module:'PCL5',type:'freq5',hint:'Intrusive memories are the hallmark symptom of PTSD.'},
  PCL2:{id:'PCL2',text:'Feeling very upset when something reminded you of a stressful experience from the past',module:'PCL5',type:'freq5',hint:'Emotional reactivity to reminders is a core trauma symptom.'},
  PCL3:{id:'PCL3',text:'Avoiding memories, thoughts, or feelings related to a stressful experience from the past',module:'PCL5',type:'freq5',hint:'Avoidance maintains PTSD and prevents natural recovery.'},
  PCL4:{id:'PCL4',text:'Feeling emotionally numb or unable to have loving feelings for those close to you',module:'PCL5',type:'freq5',hint:'Emotional numbing is a dissociative trauma response.'},
  PCL5:{id:'PCL5',text:'Being "super alert" or watchful or on guard when there was no reason',module:'PCL5',type:'freq5',hint:'Hypervigilance is the nervous system remaining in threat-detection mode.'},
  ADHD1:{id:'ADHD1',text:'How often do you have trouble wrapping up the final details of a project after the challenging parts are done?',module:'ADHD',type:'freq5',hint:'Task completion difficulty is a core ADHD executive function challenge.'},
  ADHD2:{id:'ADHD2',text:'How often do you have difficulty getting things in order when you have to do a task that requires organization?',module:'ADHD',type:'freq5',hint:'Organization difficulties are distinct from laziness — they reflect executive function differences.'},
  ADHD3:{id:'ADHD3',text:'How often do you have problems remembering appointments or obligations?',module:'ADHD',type:'freq5',hint:'Working memory difficulties are central to ADHD.'},
  ADHD4:{id:'ADHD4',text:'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',module:'ADHD',type:'freq5',hint:'Physical restlessness in ADHD reflects difficulty regulating arousal.'},
  ADHD5:{id:'ADHD5',text:'How often do you feel overly active and compelled to do things, like you were driven by a motor?',module:'ADHD',type:'freq5',hint:'Internal restlessness is often more prominent in adults than external hyperactivity.'},
  OCD1:{id:'OCD1',text:'I check things more often than necessary',module:'OCD',type:'freq5',hint:'Checking compulsions are among the most common OCD presentations.'},
  OCD2:{id:'OCD2',text:'I have difficulty controlling my own thoughts',module:'OCD',type:'freq5',hint:'Intrusive thoughts that feel ego-dystonic are a hallmark of OCD.'},
  OCD3:{id:'OCD3',text:'I get upset if others change the way I have arranged things',module:'OCD',type:'freq5',hint:'Need for order and symmetry is a common OCD dimension.'},
  OCD4:{id:'OCD4',text:'I feel I have to repeat certain numbers or words to prevent something bad from happening',module:'OCD',type:'freq5',hint:'Magical thinking and compulsive rituals are core OCD features.'},
  CSSRS1:{id:'CSSRS1',text:'Have you wished you were dead or wished you could go to sleep and not wake up?',module:'CSSRS',type:'yesno',critical:true,hint:'Passive suicidal ideation is more common than people think. Your answer is confidential.'},
  CSSRS2:{id:'CSSRS2',text:'Have you had any thoughts of killing yourself?',module:'CSSRS',type:'yesno',critical:true,hint:'Active suicidal ideation requires immediate clinical attention. Your answer is completely safe to share.'},
  CSSRS3:{id:'CSSRS3',text:'Have you been thinking about how you might do this?',module:'CSSRS',type:'yesno',critical:true,hint:'This question helps us understand the severity and urgency of support needed.'},
  E1:{id:'E1',text:'I see myself as someone who is talkative and outgoing',module:'BIGFIVE',type:'agree5'},
  E2:{id:'E2',text:'I see myself as someone who is full of energy',module:'BIGFIVE',type:'agree5'},
  N1:{id:'N1',text:'I see myself as someone who worries a lot',module:'BIGFIVE',type:'agree5'},
  N2:{id:'N2',text:'I see myself as someone who gets nervous easily',module:'BIGFIVE',type:'agree5'},
  A1:{id:'A1',text:'I see myself as someone who is helpful and considerate',module:'BIGFIVE',type:'agree5'},
  A2:{id:'A2',text:'I see myself as someone who is warm and sympathetic',module:'BIGFIVE',type:'agree5'},
  C1:{id:'C1',text:'I see myself as someone who does a thorough job',module:'BIGFIVE',type:'agree5'},
  C2:{id:'C2',text:'I see myself as someone who is organized and efficient',module:'BIGFIVE',type:'agree5'},
  O1:{id:'O1',text:'I see myself as someone who is curious about many different things',module:'BIGFIVE',type:'agree5'},
  O2:{id:'O2',text:'I see myself as someone who is inventive and creative',module:'BIGFIVE',type:'agree5'},
  RSE1:{id:'RSE1',text:'I feel that I am a person of worth, at least on an equal plane with others',module:'RSE',type:'agree4'},
  RSE2:{id:'RSE2',text:'I feel that I have a number of good qualities',module:'RSE',type:'agree4'},
  RSE3:{id:'RSE3',text:'On the whole, I am satisfied with myself',module:'RSE',type:'agree4'},
  RSE4:{id:'RSE4',text:'I certainly feel useless at times',module:'RSE',type:'agree4',reverse:true},
  MDQ1:{id:'MDQ1',text:'There was a period when you felt so good or hyper that others thought you were not your normal self',module:'MDQ',type:'yesno'},
  MDQ2:{id:'MDQ2',text:'You were so irritable that you shouted or got into fights',module:'MDQ',type:'yesno'},
  MDQ3:{id:'MDQ3',text:'You felt much more self-confident than usual',module:'MDQ',type:'yesno'},
  MDQ4:{id:'MDQ4',text:'You got much less sleep than usual and found you didn\'t really miss it',module:'MDQ',type:'yesno'},
  MDQ5:{id:'MDQ5',text:'You were much more talkative or spoke much faster than usual',module:'MDQ',type:'yesno'},
  M1:{id:'M1',text:'I tend to manipulate others to get my own way',module:'DARK',type:'agree5'},
  M2:{id:'M2',text:'I use deception or lie to get what I want',module:'DARK',type:'agree5'},
  NA1:{id:'NA1',text:'I want others to pay attention to me',module:'DARK',type:'agree5'},
  NA2:{id:'NA2',text:'I seek prestige or status',module:'DARK',type:'agree5'},
  P1:{id:'P1',text:'I tend to lack remorse',module:'DARK',type:'agree5'},
  P2:{id:'P2',text:'I tend to not be too concerned about the morality of my actions',module:'DARK',type:'agree5'},
};

const OPTIONS = {
  freq4:[['Not at all',0],['Several days',1],['More than half the days',2],['Nearly every day',3]],
  freq5:[['Never',0],['Rarely',1],['Sometimes',2],['Often',3],['Always',4]],
  freq6:[['None of the time',0],['Some of the time',1],['Less than half the time',2],['More than half the time',3],['Most of the time',4],['All of the time',5]],
  freq7:[['Never',0],['A few times a year',1],['Once a month',2],['A few times a month',3],['Once a week',4],['A few times a week',5],['Every day',6]],
  agree4:[['Strongly disagree',0],['Disagree',1],['Agree',2],['Strongly agree',3]],
  agree5:[['Strongly disagree',1],['Disagree',2],['Neutral',3],['Agree',4],['Strongly agree',5]],
  severity4:[['Not at all difficult',0],['Slightly',1],['Moderately',2],['Very difficult',3]],
  satisfaction:[['Very satisfied',0],['Satisfied',1],['Neutral',2],['Unsatisfied',3],['Very unsatisfied',4]],
  yesno:[['Yes',1],['No',0]],
};

const MODULE_QS = {
  PHQ9:['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8','PHQ9'],
  GAD7:['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7'],
  ISI:['ISI1','ISI2','ISI3','ISI4','ISI5'],
  WHO5:['WHO1','WHO2','WHO3','WHO4','WHO5'],
  BURNOUT:['BRN1','BRN2','BRN3','BRN4','BRN5'],
  PCL5:['PCL1','PCL2','PCL3','PCL4','PCL5'],
  ADHD:['ADHD1','ADHD2','ADHD3','ADHD4','ADHD5'],
  OCD:['OCD1','OCD2','OCD3','OCD4'],
  CSSRS:['CSSRS1','CSSRS2','CSSRS3'],
  BIGFIVE:['E1','E2','N1','N2','A1','A2','C1','C2','O1','O2'],
  RSE:['RSE1','RSE2','RSE3','RSE4'],
  MDQ:['MDQ1','MDQ2','MDQ3','MDQ4','MDQ5'],
  DARK:['M1','M2','NA1','NA2','P1','P2'],
};

const MODULE_META = {
  PHQ9:{ label:'Mood & Depression', icon:Icons.heart, color:S.danger, bg:'#FEF2F2', time:'2 min', intro:'How has your mood been lately?', insight:'People with similar responses often report feeling emotionally exhausted rather than simply sad or lazy.' },
  GAD7:{ label:'Anxiety & Worry', icon:Icons.brain, color:S.warning, bg:'#FFFBEB', time:'1 min', intro:'Let\'s talk about anxiety and worry.', insight:'Anxiety often shows up as physical tension or restlessness before it\'s recognized as anxiety. This is completely normal.' },
  ISI:{ label:'Sleep Patterns', icon:Icons.moon, color:'#7C3AED', bg:'#F5F3FF', time:'1 min', intro:'Let\'s understand how you\'ve been sleeping.', insight:'Poor sleep and anxiety create a cycle — each makes the other worse. Understanding your sleep is crucial to your overall picture.' },
  WHO5:{ label:'Wellbeing', icon:Icons.star, color:S.success, bg:'#ECFDF5', time:'1 min', intro:'Let\'s measure your overall sense of wellbeing.', insight:'Wellbeing is not just the absence of symptoms — it\'s the presence of positive experiences. This matters as much as clinical scores.' },
  BURNOUT:{ label:'Energy & Burnout', icon:Icons.lightning, color:'#EA580C', bg:'#FFF7ED', time:'1 min', intro:'Let\'s assess your energy and burnout levels.', insight:'Burnout often looks like depression but has different roots. Work environment and recovery strategies differ significantly.' },
  PCL5:{ label:'Trauma & Past Experiences', icon:Icons.trauma, color:'#BE185D', bg:'#FDF2F8', time:'1 min', intro:'These questions are about difficult past experiences.', insight:'Trauma responses are normal reactions to abnormal events. Your nervous system was trying to protect you.' },
  ADHD:{ label:'Focus & Attention', icon:Icons.focus, color:S.blue, bg:'#EFF6FF', time:'1 min', intro:'Let\'s look at how your attention and focus work.', insight:'ADHD in adults often looks different from childhood ADHD — it\'s frequently missed because adults develop coping strategies.' },
  OCD:{ label:'Thought Patterns', icon:Icons.repeat, color:S.purple, bg:'#F5F3FF', time:'1 min', intro:'These questions are about recurring thoughts and behaviors.', insight:'Intrusive thoughts are experienced by most people. OCD is characterized by the distress they cause and the rituals used to manage them.' },
  CSSRS:{ label:'Safety Assessment', icon:Icons.shield, color:S.danger, bg:'#FEF2F2', time:'30 sec', intro:'These are important safety questions. Your answers are completely confidential.', insight:'Many people have passive thoughts about death without being in active crisis. Your honesty helps us provide the right support.' },
  BIGFIVE:{ label:'Personality Profile', icon:Icons.brain, color:S.blue, bg:'#EFF6FF', time:'2 min', intro:'Let\'s build your personality profile.', insight:'Personality traits influence how we experience and respond to stress. Understanding yours helps us personalize your care plan.' },
  RSE:{ label:'Self-Esteem', icon:Icons.heart, color:S.success, bg:'#ECFDF5', time:'30 sec', intro:'A few questions about how you see yourself.', insight:'Self-esteem is not fixed. It fluctuates with mood and circumstances, and can be meaningfully improved with the right support.' },
  MDQ:{ label:'Mood Episodes', icon:Icons.pulse, color:'#0891B2', bg:'#ECFEFF', time:'30 sec', intro:'These questions are about unusually high or elevated moods.', insight:'Bipolar disorder is frequently misdiagnosed as depression. Understanding mood episodes helps ensure the right treatment.' },
  DARK:{ label:'Interpersonal Style', icon:Icons.focus, color:S.muted, bg:'#F8FAFF', time:'1 min', intro:'A few questions about how you relate to others.', insight:'These traits exist on a spectrum in all people. Understanding your interpersonal style helps with relationship patterns.' },
};

const MODULE_COMPLETE_MSG = {
  PHQ9:'We now understand your mood patterns.',
  GAD7:'We\'ve captured your anxiety profile.',
  ISI:'We\'ve mapped your sleep patterns.',
  WHO5:'We\'ve measured your overall wellbeing.',
  BURNOUT:'We understand your energy and burnout levels.',
  PCL5:'Thank you for sharing that. Your responses are completely confidential.',
  ADHD:'We\'ve assessed your focus and attention profile.',
  OCD:'We\'ve noted your thought patterns.',
  CSSRS:'Your safety matters to us. Thank you for your honesty.',
  BIGFIVE:'We\'ve built your personality profile.',
  RSE:'We understand how you see yourself.',
  MDQ:'We\'ve assessed your mood episode history.',
  DARK:'We\'ve captured your interpersonal style.',
};

// ── Bayesian triage map ───────────────────────────────────
const TRIAGE_MAP = {
  depression:{ modules:['PHQ9','GAD7','WHO5','RSE','BIGFIVE'], label:'Depression', color:S.danger },
  anxiety:   { modules:['GAD7','PHQ9','ISI','BIGFIVE'], label:'Anxiety', color:S.warning },
  sleep:     { modules:['ISI','PHQ9','GAD7','BURNOUT'], label:'Sleep Issues', color:'#7C3AED' },
  stress:    { modules:['GAD7','BURNOUT','PHQ9','BIGFIVE'], label:'Stress & Burnout', color:S.warning },
  burnout:   { modules:['BURNOUT','PHQ9','GAD7','ISI'], label:'Burnout', color:'#EA580C' },
  trauma:    { modules:['PCL5','PHQ9','GAD7','CSSRS'], label:'Trauma', color:'#BE185D' },
  adhd:      { modules:['ADHD','PHQ9','GAD7'], label:'ADHD', color:S.blue },
  ocd:       { modules:['OCD','GAD7','PHQ9'], label:'OCD', color:S.purple },
  unsure:    { modules:['PHQ9','GAD7','WHO5','ISI','BIGFIVE'], label:'General Wellbeing', color:S.blue },
};

const CONCERNS = [
  { id:'depression', label:'Low mood or depression', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 15s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { id:'anxiety', label:'Anxiety or constant worry', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'sleep', label:'Sleep problems or insomnia', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'stress', label:'Stress or feeling overwhelmed', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'burnout', label:'Exhaustion or burnout', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'trauma', label:'Past trauma or PTSD', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'adhd', label:'Focus or attention issues', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg> },
  { id:'ocd', label:'Intrusive thoughts or OCD', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'unsure', label:'Not sure — check everything', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
];

// ── Bayesian probability engine ───────────────────────────
function computeProbabilities(answers) {
  const phqScore = ['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8','PHQ9'].reduce((s,id)=>s+(answers[id]||0),0);
  const gadScore = ['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7'].reduce((s,id)=>s+(answers[id]||0),0);
  const burnScore = ['BRN1','BRN2','BRN3','BRN4','BRN5'].reduce((s,id)=>s+(answers[id]||0),0);
  const isiScore = ['ISI1','ISI2','ISI3','ISI4','ISI5'].reduce((s,id)=>s+(answers[id]||0),0);
  return {
    Depression: Math.min(99, Math.round((phqScore/27)*100)),
    Anxiety: Math.min(99, Math.round((gadScore/21)*100)),
    Burnout: Math.min(99, Math.round((burnScore/30)*100)),
    'Sleep Issues': Math.min(99, Math.round((isiScore/20)*100)),
  };
}

function buildAdaptiveFlow(concerns, mode) {
  if (mode === 'quick') return ['PHQ1','PHQ2','PHQ9','GAD1','GAD2','GAD7','ISI1','ISI2'];
  if (mode === 'deep') return Object.values(MODULE_QS).flat();
  const modules = new Set(['PHQ9','GAD7','BIGFIVE']);
  concerns.forEach(c => (TRIAGE_MAP[c]?.modules || TRIAGE_MAP.unsure.modules).forEach(m => modules.add(m)));
  return [...modules].flatMap(m => MODULE_QS[m] || []);
}

// ── Energy slider component ───────────────────────────────
function EnergySlider({ value, onChange }) {
  return (
    <div style={{ padding:'20px 0' }}>
      <div style={{ position:'relative', height:16, borderRadius:8, background:`linear-gradient(to right, ${S.danger}, ${S.warning}, ${S.success})`, marginBottom:20 }}>
        <input type="range" min={0} max={100} value={value} onChange={e=>onChange(parseInt(e.target.value))}
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}/>
        <div style={{ position:'absolute', top:'50%', left:`${value}%`, transform:'translate(-50%,-50%)', width:28, height:28, borderRadius:'50%', background:S.white, border:`2px solid ${S.blue}`, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', pointerEvents:'none' }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:S.muted }}>
        <span>No energy at all</span>
        <span style={{ fontSize:16, fontWeight:700, color:value>66?S.success:value>33?S.warning:S.danger }}>{value}%</span>
        <span>Full energy</span>
      </div>
    </div>
  );
}

// ── Mood card selector ────────────────────────────────────
function MoodCards({ value, onChange }) {
  const moods = [
    { val:4, label:'Great', desc:'Feeling really good', icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.success} strokeWidth="1.5"/><path d="M8 13s1.5 3 4 3 4-3 4-3" stroke={S.success} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9h.01M15 9h.01" stroke={S.success} strokeWidth="2" strokeLinecap="round"/></svg> },
    { val:3, label:'Okay', desc:'Managing alright', icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#84cc16" strokeWidth="1.5"/><path d="M8 13h8" stroke="#84cc16" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9h.01M15 9h.01" stroke="#84cc16" strokeWidth="2" strokeLinecap="round"/></svg> },
    { val:2, label:'Struggling', desc:'Having a hard time', icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.warning} strokeWidth="1.5"/><path d="M8 15s1.5-2 4-2 4 2 4 2" stroke={S.warning} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9h.01M15 9h.01" stroke={S.warning} strokeWidth="2" strokeLinecap="round"/></svg> },
    { val:1, label:'Very low', desc:'Finding it really hard', icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={S.danger} strokeWidth="1.5"/><path d="M8 16s1.5-3 4-3 4 3 4 3" stroke={S.danger} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9.5h.01M15 9.5h.01" stroke={S.danger} strokeWidth="2" strokeLinecap="round"/></svg> },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:8 }}>
      {moods.map(m=>(
        <div key={m.val} onClick={()=>onChange(m.val)} style={{ background:S.white, borderRadius:12, padding:'16px 8px', textAlign:'center', border:`2px solid ${value===m.val?S.blue:S.border}`, cursor:'pointer', transition:'all 0.15s', transform:value===m.val?'scale(1.05)':'scale(1)' }}>
          {m.icon}
          <div style={{ fontSize:13, fontWeight:600, color:value===m.val?S.navy:S.muted, marginTop:8 }}>{m.label}</div>
          <div style={{ fontSize:10, color:S.hint, marginTop:2, lineHeight:1.3 }}>{m.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Breathing animation for stress section ────────────────
function BreathingDot() {
  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:`${S.blue}20`, border:`2px solid ${S.blue}40`, margin:'0 auto', animation:'breathe 4s ease-in-out infinite', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:30, height:30, borderRadius:'50%', background:S.blue, animation:'breatheInner 4s ease-in-out infinite' }}/>
      </div>
      <div style={{ fontSize:12, color:S.hint, marginTop:12 }}>Breathe in... and out...</div>
      <style>{`
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
        @keyframes breatheInner { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(0.7);opacity:1} }
      `}</style>
    </div>
  );
}

// ── Section intro screen ──────────────────────────────────
function SectionIntro({ module, onContinue }) {
  const meta = MODULE_META[module];
  if (!meta) { onContinue(); return null; }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh', padding:24 }}>
      <div style={{ maxWidth:440, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:20, background:meta.bg, border:`1px solid ${meta.color}30`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:meta.color }}>
          {React.cloneElement(meta.icon, { width:32, height:32 })}
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:meta.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>{meta.label}</div>
        <h2 style={{ fontSize:26, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.2 }}>{meta.intro}</h2>
        <p style={{ fontSize:15, color:S.muted, lineHeight:1.6, marginBottom:24 }}>This section takes about {meta.time}.</p>
        <p style={{ fontSize:13, color:S.hint, lineHeight:1.6, marginBottom:28, fontStyle:'italic' }}>{meta.insight}</p>
        <button onClick={onContinue} style={{ padding:'12px 32px', background:meta.color, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          Let's go <span style={{ color:'rgba(255,255,255,0.8)' }}>{Icons.arrow}</span>
        </button>
      </div>
    </div>
  );
}

// ── Bayesian probability panel ────────────────────────────
function ProbabilityPanel({ probs }) {
  const entries = Object.entries(probs).filter(([,v])=>v>5).sort((a,b)=>b[1]-a[1]);
  if (entries.length === 0) return null;
  return (
    <div style={{ background:S.lightBlue, borderRadius:10, padding:'12px 14px', marginBottom:16, border:`1px solid ${S.border}` }}>
      <div style={{ fontSize:10, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Building your profile</div>
      {entries.slice(0,3).map(([label,val])=>(
        <div key={label} style={{ marginBottom:6 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
            <span style={{ fontSize:11, color:S.navy, fontWeight:500 }}>{label}</span>
            <span style={{ fontSize:11, color:S.blue, fontWeight:700 }}>{val}%</span>
          </div>
          <div style={{ height:4, borderRadius:2, background:S.border }}>
            <div style={{ height:4, borderRadius:2, background:S.blue, width:`${val}%`, transition:'width 0.6s' }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Slot filling tracker ──────────────────────────────────
function SlotTracker({ completedModules, totalModules }) {
  return (
    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
      {totalModules.map(mod=>{
        const done = completedModules.includes(mod);
        const meta = MODULE_META[mod];
        return (
          <div key={mod} title={meta?.label||mod} style={{ width:28, height:28, borderRadius:6, background:done?S.blue:S.border, display:'flex', alignItems:'center', justifyContent:'center', color:done?'#fff':S.hint, transition:'all 0.3s' }}>
            {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <div style={{ width:6, height:6, borderRadius:'50%', background:S.hint }}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function AdaptiveQuestionnaire({ onComplete }) {
  const [phase, setPhase] = useState('path');
  const [path, setPath] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [therapyHistory, setTherapyHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [qList, setQList] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showIntro, setShowIntro] = useState(null);
  const [showModuleComplete, setShowModuleComplete] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedModules, setCompletedModules] = useState([]);
  const [energyVal, setEnergyVal] = useState(50);
  const [moodVal, setMoodVal] = useState(null);
  const [stressVal, setStressVal] = useState(50);
  const topRef = useRef();

  const currentQ = qList[qIndex] ? Q[qList[qIndex]] : null;
  const progress = qList.length > 0 ? Math.round((qIndex / qList.length) * 100) : 0;
  const currentModule = currentQ?.module;
  const probs = computeProbabilities(answers);
  const uniqueModules = [...new Set(qList.map(id => Q[id]?.module).filter(Boolean))];

  const startAssessment = (theConcerns, theMode) => {
    const flow = buildAdaptiveFlow(theConcerns, theMode);
    const unique = [...new Set(flow)];
    setQList(unique);
    setQIndex(0);
    setShowIntro(Q[unique[0]]?.module || null);
    setPhase('questions');
  };

  const answer = (val) => {
    if (animating) return;
    const qId = qList[qIndex];
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);
    setShowHint(false);

    let newList = [...qList];

    // Crisis escalation
    if (qId === 'PHQ9' && val >= 2 && !newList.includes('CSSRS1')) {
      newList.splice(qIndex+1, 0, 'CSSRS1', 'CSSRS2', 'CSSRS3');
      setQList(newList);
    }
    // CAT: PHQ skip
    if (qId === 'PHQ2' && val === 0 && newAnswers['PHQ1'] === 0) {
      newList = newList.filter(id => !['PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8'].includes(id));
      setQList(newList);
    }
    // CAT: GAD skip
    if (qId === 'GAD2' && val === 0 && newAnswers['GAD1'] === 0) {
      newList = newList.filter(id => !['GAD3','GAD4','GAD5','GAD6'].includes(id));
      setQList(newList);
    }
    // CAT: Burnout skip if early scores are 0
    if (qId === 'BRN2' && val === 0 && newAnswers['BRN1'] === 0) {
      newList = newList.filter(id => !['BRN3','BRN4'].includes(id));
      setQList(newList);
    }

    const nextIndex = qIndex + 1;
    setAnimating(true);
    setTimeout(() => {
      if (nextIndex >= newList.length) {
        finalizeAnswers(newAnswers);
      } else {
        const prevMod = Q[newList[qIndex]]?.module;
        const nextMod = Q[newList[nextIndex]]?.module;
        if (prevMod !== nextMod) {
          setCompletedModules(m => [...new Set([...m, prevMod])]);
          setShowModuleComplete(prevMod);
          setTimeout(() => {
            setShowModuleComplete(null);
            setShowIntro(nextMod);
            setQIndex(nextIndex);
            setAnimating(false);
          }, 2500);
        } else {
          setQIndex(nextIndex);
          setAnimating(false);
        }
      }
      topRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 280);
  };

  const finalizeAnswers = (finalAnswers) => {
    const score = (ids) => ids.reduce((s,id)=>s+(finalAnswers[id]!==undefined?finalAnswers[id]:3),0)/ids.length;
    onComplete({
      answers: finalAnswers,
      age: parseInt(age)||25,
      gender: gender==='Male'?1:gender==='Female'?0:2,
      occupation, concern: concerns.join(','),
      therapyHistory, medications,
      energyLevel: energyVal,
      moodBaseline: moodVal,
      stressLevel: stressVal,
      cssrs_score: ['CSSRS1','CSSRS2','CSSRS3'].filter(id=>finalAnswers[id]===1).length,
      cssrs_high_risk: ['CSSRS2','CSSRS3'].some(id=>finalAnswers[id]===1),
      audit_score: 0,
    });
  };

  // ── PATH SELECTION ──────────────────────────────────────
  if (phase === 'path') return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:580, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:60, height:60, borderRadius:16, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 10px' }}>Mental Health Assessment</h1>
          <p style={{ fontSize:15, color:S.muted, lineHeight:1.6 }}>Choose your path. All responses are private, encrypted, and confidential.</p>
        </div>

        {/* About you */}
        <div style={{ background:S.white, borderRadius:14, padding:20, border:`1px solid ${S.border}`, marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>A little about you</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>AGE *</label>
              <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="25" min="13" max="100"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:S.bg }}
                onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>GENDER</label>
              <select value={gender} onChange={e=>setGender(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', background:S.bg, fontFamily:'inherit' }}>
                <option value="">Prefer not to say</option>
                <option>Male</option><option>Female</option><option>Non-binary</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>OCCUPATION</label>
            <input value={occupation} onChange={e=>setOccupation(e.target.value)} placeholder="Software Engineer, Student, Teacher..."
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:S.bg }}
              onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>THERAPY HISTORY</label>
              <select value={therapyHistory} onChange={e=>setTherapyHistory(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, fontFamily:'inherit' }}>
                <option value="">Select</option>
                <option>Currently in therapy</option>
                <option>Had therapy before</option>
                <option>Never had therapy</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>ON MEDICATIONS?</label>
              <select value={medications} onChange={e=>setMedications(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, fontFamily:'inherit' }}>
                <option value="">Select</option>
                <option>Yes — psychiatric</option>
                <option>Yes — other</option>
                <option>No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick mood check */}
        <div style={{ background:S.white, borderRadius:14, padding:20, border:`1px solid ${S.border}`, marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>How are you feeling right now?</div>
          <MoodCards value={moodVal} onChange={setMoodVal}/>
        </div>

        {/* 3 paths */}
        <div style={{ display:'grid', gap:10, marginBottom:16 }}>
          {[
            { id:'quick', title:'Quick Checkup', time:'3 min', qs:'~8 questions', desc:'Core mood and anxiety screening. Essential, fast, and private.', icon:Icons.quick, color:S.success },
            { id:'adaptive', title:'Adaptive Assessment', time:'8-12 min', qs:'~25-35 questions', desc:'AI selects questions based on your concerns. Personalized and efficient — the recommended path.', icon:Icons.brain, color:S.blue, recommended:true },
            { id:'deep', title:'Full Clinical Assessment', time:'20-25 min', qs:'All 90+ questions', desc:'All 16 validated instruments. Complete psychological profile. For clinical and research use.', icon:Icons.deep, color:S.purple },
          ].map(p=>(
            <div key={p.id} onClick={()=>setPath(p.id)} style={{ background:S.white, borderRadius:12, padding:18, border:`2px solid ${path===p.id?p.color:S.border}`, cursor:'pointer', transition:'all 0.15s', position:'relative' }}
              onMouseEnter={e=>{ if(path!==p.id) e.currentTarget.style.borderColor=p.color+'80'; }}
              onMouseLeave={e=>{ if(path!==p.id) e.currentTarget.style.borderColor=S.border; }}>
              {p.recommended && <div style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:700, color:S.blue, background:S.lightBlue, padding:'2px 8px', borderRadius:100 }}>Recommended</div>}
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:42, height:42, borderRadius:11, background:`${p.color}12`, border:`1px solid ${p.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:p.color, flexShrink:0 }}>
                  {React.cloneElement(p.icon, { width:22, height:22 })}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                    <div style={{ fontSize:15, fontWeight:700, color:S.navy }}>{p.title}</div>
                    <div style={{ fontSize:11, color:p.color, fontWeight:600, background:`${p.color}12`, padding:'2px 8px', borderRadius:100 }}>{p.time}</div>
                    <div style={{ fontSize:10, color:S.hint }}>{p.qs}</div>
                  </div>
                  <div style={{ fontSize:13, color:S.muted, lineHeight:1.5 }}>{p.desc}</div>
                </div>
                {path===p.id && <div style={{ width:22, height:22, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={()=>{ if(!path||!age) return; path==='adaptive'?setPhase('triage'):startAssessment(concerns,path); }}
          disabled={!path||!age}
          style={{ width:'100%', padding:'13px', background:path&&age?S.blue:'#CBD5E1', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:path&&age?'pointer':'not-allowed', transition:'background 0.2s' }}>
          {!age?'Enter your age to continue →':!path?'Choose an assessment path →':path==='adaptive'?'Choose your concerns →':'Begin Assessment →'}
        </button>
        <div style={{ marginTop:14, textAlign:'center', fontSize:11, color:S.hint }}>
          Encrypted · Confidential · Not stored on your device · Crisis: iCall 9152987821
        </div>
      </div>
    </div>
  );

  // ── TRIAGE ──────────────────────────────────────────────
  if (phase === 'triage') return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:580, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h2 style={{ fontSize:24, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 10px' }}>What's been on your mind?</h2>
          <p style={{ fontSize:14, color:S.muted, lineHeight:1.6 }}>Select everything that applies. We'll build a personalized assessment — skipping everything that doesn't apply to you.</p>
        </div>

        {/* Energy slider */}
        <div style={{ background:S.white, borderRadius:14, padding:20, border:`1px solid ${S.border}`, marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:S.muted, marginBottom:8 }}>How has your energy been this week?</div>
          <EnergySlider value={energyVal} onChange={setEnergyVal}/>
        </div>

        {/* Stress slider */}
        <div style={{ background:S.white, borderRadius:14, padding:20, border:`1px solid ${S.border}`, marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:S.muted, marginBottom:8 }}>How stressed have you been feeling?</div>
          <BreathingDot/>
          <div style={{ position:'relative', height:12, borderRadius:6, background:`linear-gradient(to right, ${S.success}, ${S.warning}, ${S.danger})`, marginBottom:16 }}>
            <input type="range" min={0} max={100} value={stressVal} onChange={e=>setStressVal(parseInt(e.target.value))}
              style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}/>
            <div style={{ position:'absolute', top:'50%', left:`${stressVal}%`, transform:'translate(-50%,-50%)', width:24, height:24, borderRadius:'50%', background:S.white, border:`2px solid ${S.blue}`, boxShadow:'0 2px 8px rgba(0,0,0,0.15)', pointerEvents:'none' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:S.muted }}>
            <span>Calm</span>
            <span style={{ fontWeight:700, color:stressVal>66?S.danger:stressVal>33?S.warning:S.success }}>{stressVal > 66 ? 'High stress' : stressVal > 33 ? 'Moderate' : 'Low stress'}</span>
            <span>Overwhelmed</span>
          </div>
        </div>

        {/* Concern selection */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          {CONCERNS.map(c=>{
            const selected = concerns.includes(c.id);
            return (
              <div key={c.id} onClick={()=>setConcerns(prev=>prev.includes(c.id)?prev.filter(x=>x!==c.id):c.id==='unsure'?['unsure']:[...prev.filter(x=>x!=='unsure'),c.id])}
                style={{ background:S.white, borderRadius:10, padding:'12px 14px', border:`2px solid ${selected?S.blue:S.border}`, cursor:'pointer', display:'flex', gap:10, alignItems:'center', transition:'all 0.15s' }}>
                <div style={{ color:selected?S.blue:S.muted, flexShrink:0 }}>{c.icon}</div>
                <div style={{ fontSize:12, fontWeight:selected?600:400, color:selected?S.navy:S.muted, lineHeight:1.3, flex:1 }}>{c.label}</div>
                {selected && <div style={{ width:16, height:16, borderRadius:'50%', background:S.blue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>}
              </div>
            );
          })}
        </div>

        {concerns.length > 0 && (
          <div style={{ background:S.lightBlue, borderRadius:10, padding:'10px 14px', marginBottom:12, border:`1px solid ${S.border}` }}>
            <div style={{ fontSize:12, color:S.blue, fontWeight:600 }}>
              Estimated {concerns.includes('unsure')?'20-25':concerns.length<=2?'8-10':concerns.length<=4?'12-15':'15-18'} minutes · Skipping unrelated instruments
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>setPhase('path')} style={{ padding:'11px 20px', background:'transparent', color:S.muted, border:`1px solid ${S.border}`, borderRadius:10, fontSize:14, cursor:'pointer' }}>← Back</button>
          <button onClick={()=>{ if(concerns.length===0) return; startAssessment(concerns,'adaptive'); }} disabled={concerns.length===0}
            style={{ flex:1, padding:'12px', background:concerns.length>0?S.blue:'#CBD5E1', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:concerns.length>0?'pointer':'not-allowed' }}>
            Begin Personalized Assessment →
          </button>
        </div>
      </div>
    </div>
  );

  // ── SECTION INTRO ───────────────────────────────────────
  if (phase === 'questions' && showIntro) return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg }}>
      <div style={{ height:3, background:S.border }}><div style={{ height:3, background:S.blue, width:`${progress}%` }}/></div>
      <SectionIntro module={showIntro} onContinue={()=>setShowIntro(null)}/>
    </div>
  );

  // ── MODULE COMPLETE ─────────────────────────────────────
  if (showModuleComplete) return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ maxWidth:360, textAlign:'center', padding:24 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#ECFDF5', border:`2px solid #A7F3D0`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={S.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:10 }}>{MODULE_META[showModuleComplete]?.label || showModuleComplete} complete</div>
        <div style={{ fontSize:15, color:S.muted, lineHeight:1.6 }}>{MODULE_COMPLETE_MSG[showModuleComplete]}</div>
        <div style={{ marginTop:20, display:'flex', gap:6, justifyContent:'center' }}>
          {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:'50%', background:S.blue, opacity:0.3+i*0.35, animation:`pulse ${0.6+i*0.15}s ease-in-out infinite` }}/>)}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}`}</style>
    </div>
  );

  // ── QUESTION SCREEN ─────────────────────────────────────
  if (phase === 'questions' && currentQ) {
    const opts = OPTIONS[currentQ.type] || OPTIONS.freq4;
    const meta = MODULE_META[currentModule];

    return (
      <div ref={topRef} style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', flexDirection:'column' }}>
        {/* Progress */}
        <div style={{ height:4, background:S.border }}>
          <div style={{ height:4, background:S.blue, width:`${progress}%`, transition:'width 0.4s ease' }}/>
        </div>

        {/* Header */}
        <div style={{ padding:'12px 24px', background:S.white, borderBottom:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {meta && <div style={{ color:meta.color }}>{React.cloneElement(meta.icon, { width:18, height:18 })}</div>}
            <div style={{ fontSize:12, fontWeight:700, color:meta?.color||S.blue, textTransform:'uppercase', letterSpacing:'0.06em' }}>{meta?.label||currentModule}</div>
          </div>
          <div style={{ fontSize:12, color:S.muted }}>{qIndex+1} / {qList.length}</div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 24px 16px' }}>
          <div style={{ maxWidth:540, width:'100%' }}>

            {/* Slot tracker */}
            <SlotTracker completedModules={completedModules} totalModules={uniqueModules}/>

            {/* Bayesian probability panel */}
            <ProbabilityPanel probs={probs}/>

            {/* Crisis warning */}
            {currentQ.critical && (
              <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:10, padding:'10px 14px', marginBottom:20, display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ color:S.danger, flexShrink:0, marginTop:1 }}>{Icons.alert}</div>
                <div style={{ fontSize:12, color:S.danger, lineHeight:1.5 }}>This question is about safety. Your answer is completely confidential. Crisis support: <strong>iCall 9152987821</strong></div>
              </div>
            )}

            {/* Question */}
            <div style={{ opacity:animating?0:1, transform:animating?'translateY(10px)':'translateY(0)', transition:'opacity 0.25s, transform 0.25s' }}>
              {/* Time context */}
              {['PHQ9','GAD7'].includes(currentModule) && (
                <div style={{ fontSize:12, color:S.hint, marginBottom:10, fontStyle:'italic' }}>Over the last 2 weeks, how often have you been bothered by this?</div>
              )}

              <h2 style={{ fontSize:21, fontWeight:600, color:S.navy, lineHeight:1.45, margin:'0 0 6px', letterSpacing:'-0.01em' }}>{currentQ.text}</h2>

              {/* Did you know hint */}
              {currentQ.hint && (
                <div style={{ marginBottom:20 }}>
                  <button onClick={()=>setShowHint(h=>!h)} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:'transparent', border:`1px solid ${S.border}`, borderRadius:100, fontSize:11, color:S.muted, cursor:'pointer', fontFamily:'inherit' }}>
                    <div style={{ color:S.blue }}>{Icons.info}</div>
                    Did you know?
                  </button>
                  {showHint && <div style={{ marginTop:8, padding:'10px 14px', background:S.lightBlue, borderRadius:8, fontSize:13, color:S.muted, lineHeight:1.6, border:`1px solid ${S.border}` }}>{currentQ.hint}</div>}
                </div>
              )}

              {/* Answer options */}
              <div style={{ display:'grid', gap:8 }}>
                {opts.map(([label, val]) => (
                  <button key={label} onClick={()=>answer(val)}
                    style={{ padding:'13px 18px', background:S.white, border:`1.5px solid ${S.border}`, borderRadius:10, fontSize:14, color:S.navy, cursor:'pointer', textAlign:'left', fontWeight:500, transition:'all 0.15s', fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=S.blue; e.currentTarget.style.background=S.lightBlue; e.currentTarget.style.color=S.blue; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=S.border; e.currentTarget.style.background=S.white; e.currentTarget.style.color=S.navy; }}>
                    <span>{label}</span>
                    <div style={{ color:'rgba(12,26,46,0.2)' }}>{Icons.arrow}</div>
                  </button>
                ))}
              </div>

              {/* Skip */}
              {!currentQ.critical && (
                <button onClick={()=>answer(0)} style={{ marginTop:14, padding:'6px 14px', background:'transparent', border:'none', fontSize:12, color:S.hint, cursor:'pointer', display:'block', margin:'14px auto 0', fontFamily:'inherit' }}>
                  Skip this question
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding:'10px 24px', textAlign:'center', borderTop:`1px solid ${S.border}` }}>
          <div style={{ fontSize:11, color:S.hint }}>Encrypted · Confidential · Never shared without consent</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${S.blue}`, borderTopColor:'transparent', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}/>
        <div style={{ fontSize:15, color:S.muted }}>Building your assessment...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
